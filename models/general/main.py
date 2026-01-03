import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama 
from typing import Optional, Dict
import uvicorn
import json

# Add parent directory to path to import logging_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from logging_utils import setup_logger, log_request, log_model_generation, log_generation_complete, log_error, log_response
except ImportError:
    # Fallback if logging_utils is not found/working
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('general_api')
    def setup_logger(*args): return logger
    def log_request(*args): pass
    def log_model_generation(*args): pass
    def log_generation_complete(*args): pass
    def log_error(*args): logger.error(args[1])
    def log_response(*args): pass

# Setup logger
logger = setup_logger('general_api', 'general_api.log')

app = FastAPI(title="General AI Tutor API")
logger.info('🚀 Starting General AI Tutor API')

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

class AnalysisResponse(BaseModel):
    summary: str
    roadmap: str
    key_concepts: Optional[list] = None
    difficulty_level: Optional[str] = None
    is_finance_domain: bool = False # Keeping structure consistent
    domain_confidence: float = 0.0

@app.get("/")
async def root():
    logger.info("🔍 Health check endpoint called")
    return {"message": "General AI Tutor API is running"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: TextRequest):
    try:
        log_request(logger, {
            "text_length": len(request.text),
            "query_type": request.queryType
        })
        
        # Simple chat/analysis logic using Ollama
        model_name = "llama3" 
        
        prompt = f"""You are a helpful and knowledgeable AI Tutor. 
        User Request: {request.text}
        
        Please provide a helpful response or analysis."""
        
        response = ollama.chat(model=model_name, messages=[
            {'role': 'user', 'content': prompt}
        ])
        
        response_text = response['message']['content']

        # Construct a generic response object
        # Since this is "general", we might not have a structured roadmap, so we'll 
        # just put the main response in summary and a polite closing in roadmap for now,
        # or duplicate it if the frontend strictly requires both.
        
        api_response = AnalysisResponse(
            summary=response_text,
            roadmap="Let me know if you have any other questions!",
            key_concepts=[],
            difficulty_level="General",
            is_finance_domain=False,
            domain_confidence=1.0
        )
        
        log_response(logger, api_response.dict())
        return api_response

    except Exception as e:
        log_error(logger, f"Error in analyze_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8024)
