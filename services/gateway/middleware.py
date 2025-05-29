from fastapi import Request, HTTPException
import jwt
from jwt.exceptions import InvalidTokenError
from config import config
import time

async def authorise_request(request: Request, call_next):
    """Middleware to authorize requests"""
    if request.url.path.startswith(["/auth/user", "/submissions", "/problems"]):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Missing or invalid authorization header"
            )

        token = auth_header.split(" ")[1]
        
        try:
            payload = jwt.decode( 
                token,
                config.JWT_PUBLIC_KEY,
                algorithms=["EdDSA"]
            )

            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=401,
                    detail="Token validation failed"
                )
            
            request.state.user = user_id
            
        except InvalidTokenError as e:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        except Exception as e:
            raise HTTPException(
                status_code=401,
                detail="Token validation failed"
            )

    return await call_next(request)

async def process_time(request: Request, call_next):
    """Middleware to measure and add process time to response headers"""
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
