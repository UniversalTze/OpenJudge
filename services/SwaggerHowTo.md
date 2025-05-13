### How to use Swagger/Redoc to generate docs

- In FastAPI swagger/redoc documentation is automatically generated.  
- You can customise the format by passing parameters to the FastAPI app definition.  

E.g:  
app = FastAPI(  
    title="Code Execution Service",  
    description="API for executing code submissions and returning results.",  
    version="1.0.0",  
)  

- Then for each endpoint, specify information regarding the endpoint in the route decorator,  
E.g:  
@app.get(  
    "/",  
    summary="Root Endpoint",  
    description="This endpoint returns a welcome message to indicate the API is running.",  
    response_description="A JSON object containing a welcome message."  
)  
def read_root():  
    return {"message": "Hello, FastAPI!"}  


- You can then run your fastapi application (e.g. using `uvicorn main:app --reload`). Assuming the api is accessible at `http://127.0.0.1:8000` you can then see the Swagger documentation at `http://127.0.0.1:8000/docs` and the Redoc documentation at `http://127.0.0.1:8000/redoc`.