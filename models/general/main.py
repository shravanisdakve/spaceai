import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import uvicorn
import json

# Add parent directory to path to import logging_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from logging_utils import setup_logger, log_request, log_model_generation, log_generation_complete, log_error, log_response

# Setup logger
logger = setup_logger('general_api', 'general_api.log')

app = FastAPI(title="General Query API")
logger.info('🚀 Starting General Query API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8020"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Context(BaseModel):
    subject: Optional[str] = None
    level: Optional[str] = None
    format: Optional[str] = None

class TextRequest(BaseModel):
    text: str
    queryType: Optional[str] = "general"
    model_size: Optional[str] = "8b"
    advanced_analysis: Optional[bool] = False
    domain: Optional[str] = None
    context: Optional[Context] = None

class GeneralResponse(BaseModel):
    response: str

def get_model_name(size: str) -> str:
    """Get the appropriate Llama 3 model name based on size."""
    return f"llama3:{size}"

@app.get("/")
async def root():
    logger.info("🔍 Health check endpoint called")
    return {"message": "General Query API is running"}

@app.post("/analyze", response_model=GeneralResponse)
async def analyze_text(request: TextRequest):
    try:
        log_request(logger, {
            "text_length": len(request.text),
            "text_preview": request.text[:100] + "...",
            "query_type": request.queryType,
            "model_size": request.model_size,
            "context": request.context.dict() if request.context else None
        })

        model_name = get_model_name(request.model_size)
        logger.info(f"🤖 Using model: {model_name}")

        try:
            context_info = ""
            if request.context:
                context_info = f"""
                Context Information:
                - Subject: {request.context.subject or 'Not specified'}
                - Level: {request.context.level or 'Not specified'}
                - Format: {request.context.format or 'Not specified'}
                """

            prompt = f"""<s>[INST] You are a helpful, patient, and comprehensive AI Tutor.
            The user has a query of type: {request.queryType}.
            {context_info}
            Please provide a clear and helpful response to the following query.

            Query:
            {request.text}
            [/INST]"""

            response = ollama.generate(
                model=model_name,
                prompt=prompt,
                options={
                    'num_predict': 2000,
                    'temperature': 0.7,
                    'top_p': 0.9,
                }
            )
            log_generation_complete(logger, "general_response")

            return GeneralResponse(response=response['response'])

        except Exception as e:
            log_error(logger, f"Error during model generation: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error during model generation: {str(e)}")

    except Exception as e:
        log_error(logger, f"Error in analyze_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    try:
        models = ollama.list()
        llama_models = [m for m in models['models'] if m['name'].startswith('llama3')]
        if not llama_models:
            print("Warning: No Llama 3 models found. Please pull a model using: ollama pull llama3:8b")
    except Exception as e:
        print(f"Error checking models: {e}")

    uvicorn.run(app, host="0.0.0.0", port=8024)
