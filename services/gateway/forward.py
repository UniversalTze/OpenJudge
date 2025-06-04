import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import Response

async def forward_request(request: Request, target_url: str, client: httpx.AsyncClient):
    """
    Function to forward an HTTP request to a target URL
    """
    headers_to_forward = {
        k: v for k, v in request.headers.items()
        if k.lower() not in ['host', 'connection', 'transfer-encoding', 'content-length', 'user-agent']
    }
    headers_to_forward['user-agent'] = 'OpenJudgeAPIGateway'

    if 'content-type' in request.headers:
        headers_to_forward['content-type'] = request.headers['content-type']

    body = await request.body()

    try:
        rp = await client.request(
            method=request.method,
            url=target_url,
            headers=headers_to_forward,
            params=request.query_params,
            content=body,
            timeout=30.0
        )

        response_headers = dict(rp.headers)
        response_headers.pop("transfer-encoding", None)
        response_headers.pop("content-encoding", None)
        response_headers.pop("set-cookie", None)

        response = Response(
            content=rp.content,
            status_code=rp.status_code,
            headers=response_headers
        )
        
        set_cookie_list = None
        try:
            set_cookie_list = rp.headers.get_list("set-cookie")
        except AttributeError:
            sc = rp.headers.get("set-cookie")
            if sc:
                set_cookie_list = [sc]

        if set_cookie_list:
            for cookie_value in set_cookie_list:
                response.headers.append("set-cookie", cookie_value)
        
        return response
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail=f"Request timed out.")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail=f"Could not connect to {target_url}.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"An unexpected error occurred while contacting service at {target_url}.")
