import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama 
from typing import Optional, Dict
import uvicorn
import json
import re

# Add parent directory to path to import logging_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from logging_utils import setup_logger, log_request, log_model_generation, log_generation_complete, log_error, log_response

# Setup logger
logger = setup_logger('finance_api', 'finance_api.log')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger

app = FastAPI(title="Finance Document Analysis API")
logger.info('🚀 Starting Finance Document Analysis API')
logger.info('🚀 Starting Finance Document Analysis API')
logger.info('🚀 Starting Finance Document Analysis API')
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
    queryType: Optional[str] = "finance"
    model_size: Optional[str] = "8b"
    advanced_analysis: Optional[bool] = False
    domain: Optional[str] = None
    context: Optional[Context] = None

class AnalysisResponse(BaseModel):
    summary: str
    roadmap: str
    key_concepts: Optional[list] = None
    difficulty_level: Optional[str] = None
    is_finance_domain: bool
    domain_confidence: float

def is_finance_related(text: str) -> tuple[bool, float]:
    """Use AI model to determine if the text is finance related and return confidence score."""
    try:
        model_name = "llama3:8b"
        prompt = f"""<s>[INST] You are a finance domain expert. Analyze if the following text is related to finance, economics, investments, banking, or financial markets. 
        Respond with a JSON object containing two fields:
        1. "is_finance": boolean (true/false)
        2. "confidence": float (between 0 and 1)
        
        Text to analyze:
        {text}
        
        Respond only with the JSON object, no other text. [/INST]"""
        
        response = ollama.generate(
            model=model_name,
            prompt=prompt,
            options={
                'num_predict': 100,
                'temperature': 0.1,
                'top_p': 0.95,
                'top_k': 50
            }
        )
        
        try:
            json_str = response['response'].strip()
            if json_str.startswith('{') and json_str.endswith('}'):
                result = json.loads(json_str)
                return result.get('is_finance', False), result.get('confidence', 0.0)
            else:
                if 'true' in json_str.lower():
                    return True, 0.8
                elif 'false' in json_str.lower():
                    return False, 0.2
                else:
                    return False, 0.0
        except json.JSONDecodeError:
            response_text = response['response'].lower()
            if 'finance' in response_text or 'investment' in response_text or 'banking' in response_text or 'market' in response_text:
                return True, 0.7
            return False, 0.3
            
    except Exception as e:
        print(f"Error in is_finance_related: {str(e)}")
        return False, 0.0

def get_model_name(size: str) -> str:
    """Get the appropriate Llama 3 model name based on size."""
    return f"llama3:{size}"

@app.get("/")
async def root():
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    return {"message": "Finance Document Analysis API is running"}

@app.get("/models")
async def list_models():
    logger.info("📋 Listing available models")
    logger.info("📋 Listing available models")
    """List available models and their status."""
    try:
        logger.info("📋 Listing available models")
        models = ollama.list()
        log_response(logger, {"models": models})
        return {"models": models}
    except Exception as e:
        log_error(logger, str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: TextRequest):
    try:
        log_request(logger, {
            "text_length": len(request.text),
            "query_type": request.queryType,
            "model_size": request.model_size,
            "advanced_analysis": request.advanced_analysis,
            "context": request.context.dict() if request.context else None
        })
        
        is_finance, confidence = is_finance_related(request.text)
        logger.info(f"🔍 Domain check - is_finance: {is_finance}, confidence: {confidence}")
        
        if not is_finance:
            response = AnalysisResponse(
                summary="This query appears to be outside the finance domain. This model is specialized in finance-related content only.",
                roadmap="N/A - Content is not finance-related",
                key_concepts=[],
                difficulty_level="N/A",
                is_finance_domain=False,
                domain_confidence=confidence
            )
            log_response(logger, response.dict())
            return response

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

            log_model_generation(logger, model_name, "summary")
            summary_prompt = f"""<s>[INST] You are a finance domain expert using the latest Llama 3 model. Analyze the following finance text and provide a comprehensive analysis. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please follow these steps:

1. First, identify and list all different types of finance content in the text
2. Then, for each type of content:
   - Provide a detailed overview
   - Highlight the main finance points and key information
   - Note any important finance details or requirements
   - Identify underlying finance themes and patterns
3. Finally, provide an overall summary that ties everything together
4. If advanced analysis is requested, also include:
   - Key finance concepts and their relationships
   - Difficulty level assessment
   - Prerequisites for understanding the finance content

Text content:
{request.text}

Please structure your response as follows:
1. Finance Content Types Found:
   - [List all types of finance content found]

2. Detailed Finance Analysis:
   [For each content type, provide its summary]

3. Overall Finance Summary:
   [Provide a comprehensive summary that covers all finance content]

4. Advanced Finance Analysis (if requested):
   - Key Finance Concepts: [List main concepts]
   - Difficulty Level: [Assess complexity]
   - Prerequisites: [List required finance knowledge] [/INST]"""

            summary_response = ollama.generate(
                model=model_name,
                prompt=summary_prompt,
                options={
                    'num_predict': 2000,
                    'temperature': 0.8,
                    'top_p': 0.95,
                    'top_k': 50,
                    'repeat_penalty': 1.2,
                    'presence_penalty': 0.1,
                    'frequency_penalty': 0.1
                }
            )
            log_generation_complete(logger, "summary")

            log_model_generation(logger, model_name, "roadmap")
            roadmap_prompt = f"""<s>[INST] You are a finance education expert using the latest Llama 3 model. Based on the following finance text, create a detailed learning roadmap. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please:

1. First, perform a comprehensive finance content analysis:
   - Identify all finance topics and subtopics
   - Assess complexity levels
   - Determine finance prerequisites
   - Identify key finance learning objectives
2. Then, create an advanced learning path that:
   - Starts with foundational finance concepts
   - Progresses through different finance content types
   - Includes finance practice opportunities and assessments
   - Incorporates all types of finance content
   - Suggests additional finance resources
3. Finally, provide a detailed study schedule with:
   - Time estimates for each finance section
   - Recommended finance study methods
   - Finance milestone checkpoints
   - Progress tracking suggestions
4. Add '\n' whereever there is a line break. 

Text content:
{request.text}

Please structure your response as follows:
1. Finance Content Analysis:
   [List and describe each type of finance content]

2. Finance Learning Roadmap:
   [Provide a detailed, step-by-step finance learning path]

3. Finance Study Schedule:
   [Suggest a timeline with finance milestones]

4. Additional Finance Resources:
   [List recommended finance supplementary materials] [/INST]"""

            roadmap_response = ollama.generate(
                model=model_name,
                prompt=roadmap_prompt,
                options={
                    'num_predict': 2000,
                    'temperature': 0.8,
                    'top_p': 0.95,
                    'top_k': 50,
                    'repeat_penalty': 1.2,
                    'presence_penalty': 0.1,
                    'frequency_penalty': 0.1
                }
            )
            log_generation_complete(logger, "roadmap")

        except Exception as e:
            log_error(logger, f"Error during model generation: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error during model generation: {str(e)}")

        response_text = summary_response['response']
        key_concepts = []
        difficulty_level = "Medium"

        if request.advanced_analysis:
            if "Key Finance Concepts:" in response_text:
                concepts_section = response_text.split("Key Finance Concepts:")[1].split("\n")[0]
                key_concepts = [concept.strip() for concept in concepts_section.split(",")]
            
            if "Difficulty Level:" in response_text:
                difficulty_level = response_text.split("Difficulty Level:")[1].split("\n")[0].strip()

        response = AnalysisResponse(
            summary=response_text,
            roadmap=roadmap_response['response'],
            key_concepts=key_concepts,
            difficulty_level=difficulty_level,
            is_finance_domain=True,
            domain_confidence=confidence
        )
        
        log_response(logger, {
            "summary_length": len(response.summary),
            "roadmap_length": len(response.roadmap),
            "key_concepts_count": len(response.key_concepts),
            "difficulty_level": response.difficulty_level,
            "domain_confidence": response.domain_confidence
        })
        
        return response

    except Exception as e:
        log_error(logger, f"Error in analyze_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("🚀 Starting Finance Document Analysis API")
    try:
        models = ollama.list()
        llama_models = [m for m in models['models'] if m['name'].startswith('llama3')]
        if not llama_models:
            print("Warning: No Llama 3 models found. Please pull a model using: ollama pull llama3:8b")
    except Exception as e:
        print(f"Error checking models: {e}")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Using port 8000 for Finance 