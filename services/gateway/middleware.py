from fastapi import Request, HTTPException
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi.responses import PlainTextResponse
from config import config
import time
from slowapi.util import get_remote_address

async def rate_limit_middleware(request: Request, call_next):
    """
    Custom rate limiting middleware with different limits per endpoint
    """
    try:
        client_ip = get_remote_address(request)
        path = request.url.path
        if path.startswith("/submission") and request.method == "POST":
            limit_key = f"submissions:{client_ip}"
            if not await _check_rate_limit(request, limit_key, 5, 60):
                return PlainTextResponse(
                    status_code=429,
                    content="Rate limit exceeded: Maximum 5 submissions per minute",
                )
        elif path.startswith("/login"):
            limit_key = f"login:{client_ip}"
            if not await _check_rate_limit(request, limit_key, 5, 60):
                return PlainTextResponse(
                    status_code=429,
                    content="Rate limit exceeded: Maximum 5 login attempts per minute",
                )
        overall_limit_key = f"overall:{client_ip}"
        if not await _check_rate_limit(request, overall_limit_key, 100, 60):
            return PlainTextResponse(
                status_code=429,
                content="Rate limit exceeded: Maximum 100 requests per minute",
            )
        return await call_next(request)
    except Exception as e:
        # If rate limiting fails, log and continue (fail open)
        print(f"Error: Failed to check rate limit: {e}")
        return await call_next(request)


async def _check_rate_limit(
    request: Request, key: str, limit: int, window_seconds: int
) -> bool:
    """
    Redis-based sliding window rate limiter using ZSET and async pipeline
    """
    now = int(time.time() * 1000)
    window_start = now - window_seconds * 1000
    redis = request.app.state.redis_client
    async with redis.pipeline(transaction=True) as pipe:
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window_seconds)

        results = await pipe.execute()

    count = results[2]
    return count <= limit


async def authorise_request(request: Request, call_next):
    """
    Middleware to authorize requests
    """
    if request.url.path.startswith(("/user", "/submission", "/problems")):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return PlainTextResponse(
                status_code=401,
                content="Missing or invalid authorization header"
            )
        
        token = auth_header.split(" ")[1]
        
        try:
            payload = jwt.decode(token, config.JWT_PUBLIC_KEY, algorithms=["EdDSA"])
            jti = payload.get("jti")
            if not jti:
                return PlainTextResponse(
                    status_code=401,
                    content="Access token missing claims"
                )
            
            redis = request.app.state.redis_client
            is_revoked = await redis.get(f"revoked:{jti}")
            if is_revoked:
                return PlainTextResponse(
                    status_code=401,
                    content="Access token has been revoked"
                )
            
            expiry = payload.get("exp")
            if not expiry:
                return PlainTextResponse(
                    status_code=401,
                    content="Access token missing claims"
                )

            if expiry < time.time():
                return PlainTextResponse(
                    status_code=401,
                    content="Access token has expired"
                )
            
            user = payload.get("sub")
            if not user:
                return PlainTextResponse(
                    status_code=401,
                    content="Access token missing claims"
                )
            request.state.user = user 
        except InvalidTokenError:
            return PlainTextResponse(
                status_code=401,
                content="Invalid access token"
            )
        except Exception:
            return PlainTextResponse(
                status_code=401,
                content="Access token validation failed"
            )

    # Check refresh token routes
    elif request.url.path.startswith("/refresh"):
        token = request.cookies.get("refreshToken")
        if not token:
            return PlainTextResponse(
                status_code=401,
                content="Missing or invalid refresh token"
            )
        
        try:
            payload = jwt.decode(token, config.JWT_PUBLIC_KEY, algorithms=["EdDSA"])
            jti = payload.get("jti")
            if not jti:
                return PlainTextResponse(
                    status_code=401,
                    content="Refresh token missing claims"
                )
            
            redis = request.app.state.redis_client
            is_revoked = await redis.get(f"revoked:{jti}")
            if is_revoked:
                return PlainTextResponse(
                    status_code=401,
                    content="Refresh token has been revoked"
                )

            expiry = payload.get("exp")
            if not expiry:
                return PlainTextResponse(
                    status_code=401,
                    content="Refresh token missing claims"
                )

            if expiry < time.time():
                return PlainTextResponse(
                    status_code=401,
                    content="Refresh token has expired"
                )
                
        except InvalidTokenError:
            return PlainTextResponse(
                status_code=401,
                content="Invalid refresh token"
            )
        except Exception:
            return PlainTextResponse(
                status_code=401,
                content="Refresh token validation failed"
            )

    # Continue to next middleware/route handler
    response = await call_next(request)
    return response


async def process_time(request: Request, call_next):
    """Middleware to measure and add process time to response headers"""
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
