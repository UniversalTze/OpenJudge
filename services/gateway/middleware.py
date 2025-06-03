from fastapi import Request, HTTPException
import jwt
from jwt.exceptions import InvalidTokenError
from config import config
import time
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
_rate_limit_storage = {}  # TODO: Use a more persistent storage for prod


async def rate_limit_middleware(request: Request, call_next):
    """Custom rate limiting middleware with different limits per endpoint"""
    try:
        client_ip = get_remote_address(request)
        path = request.url.path
        if path.startswith("/submissions") and request.method == "POST":
            # TODO: Specify the direct path for POSTing submissions
            limit_key = f"submissions:{client_ip}"
            if not _check_rate_limit(limit_key, 5, 60):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded: Maximum 5 submissions per minute",
                )
        elif path.startswith("/auth/login"):
            limit_key = f"login:{client_ip}"
            if not _check_rate_limit(limit_key, 5, 60):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded: Maximum 5 login attempts per minute",
                )
        elif path.startswith("/auth/user/") and request.method == "POST":
            limit_key = f"user:{client_ip}"
            if not _check_rate_limit(limit_key, 5, 60):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded: Maximum 5 profile changes per minute",
                )
        overall_limit_key = f"overall:{client_ip}"
        if not _check_rate_limit(overall_limit_key, 100, 60):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded: Maximum 100 requests per minute",
            )
    except HTTPException:
        raise
    except Exception as e:
        # If rate limiting fails, log and continue (fail open)
        print(f"Error: Failed to check rate limit: {e}")

    return await call_next(request)


def _check_rate_limit(key: str, limit: int, window_seconds: int) -> bool:
    """Check if request is within rate limit"""
    current_time = time.time()
    window_start = current_time - window_seconds

    if key in _rate_limit_storage:
        _rate_limit_storage[key] = [
            timestamp
            for timestamp in _rate_limit_storage[key]
            if timestamp > window_start
        ]
    else:
        _rate_limit_storage[key] = []

    if len(_rate_limit_storage[key]) >= limit:
        return False

    _rate_limit_storage[key].append(current_time)
    return True


async def authorise_request(request: Request, call_next):
    """Middleware to authorize requests"""
    if request.url.path.startswith(("/auth/user", "/submissions", "/problems")):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401, detail="Missing or invalid authorization header"
            )

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, config.JWT_PUBLIC_KEY, algorithms=["EdDSA"])

            # TODO: Chek if the token is in the TRL

            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Token validation failed")

            request.state.user = user_id

        except InvalidTokenError as e:
            raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            raise HTTPException(status_code=401, detail="Token validation failed")

    return await call_next(request)


async def process_time(request: Request, call_next):
    """Middleware to measure and add process time to response headers"""
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
