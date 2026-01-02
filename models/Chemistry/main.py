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
logger = setup_logger('chemistry_api', 'chemistry_api.log')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger
app = FastAPI(title="Chemistry Document Analysis API")
logger.info('🚀 Starting Chemistry Document Analysis API')
logger.info('🚀 Starting Chemistry Document Analysis API')
logger.info('🚀 Starting Chemistry Document Analysis API')
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
    queryType: Optional[str] = "chemistry"
    model_size: Optional[str] = "8b"
    advanced_analysis: Optional[bool] = False
    domain: Optional[str] = None
    context: Optional[Context] = None

class AnalysisResponse(BaseModel):
    summary: str
    roadmap: str
    key_concepts: Optional[list] = None
    difficulty_level: Optional[str] = None
    is_chemistry_domain: bool
    domain_confidence: float

def is_chemistry_related(text: str) -> tuple[bool, float]:
    """Use AI model to determine if the text is chemistry-related and return confidence score."""
    try:
        model_name = "llama3:8b"
        prompt = f"""<s>[INST] You are a chemistry domain expert. Analyze if the following text is related to chemistry or chemical concepts. 
        Respond with a JSON object containing two fields:
        1. "is_chemistry": boolean (true/false)
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
                return result.get('is_chemistry', False), result.get('confidence', 0.0)
            else:
                if 'true' in json_str.lower():
                    return True, 0.8
                elif 'false' in json_str.lower():
                    return False, 0.2
                else:
                    return False, 0.0
        except json.JSONDecodeError:
            response_text = response['response'].lower()
            if 'chemistry' in response_text or 'chemical' in response_text or 'molecule' in response_text or 'reaction' in response_text:
                return True, 0.7
            return False, 0.3
            
    except Exception as e:
        print(f"Error in is_chemistry_related: {str(e)}")
        return False, 0.0

def get_model_name(size: str) -> str:
    """Get the appropriate Llama 3 model name based on size."""
    return f"llama3:{size}"

@app.get("/")
async def root():
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    return {"message": "Chemistry Document Analysis API is running"}

@app.get("/models")
async def list_models():
    logger.info("📋 Listing available models")
    logger.info("📋 Listing available models")
    logger.info("📋 Listing available models")
    """List available models and their status."""
    try:
        models = ollama.list()
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: TextRequest):
    try:
        log_request(logger, {
            "text_length": len(request.text),
            "text_preview": request.text[:100] + "...",
            "query_type": request.queryType,
            "model_size": request.model_size,
            "advanced_analysis": request.advanced_analysis,
            "context": request.context.dict() if request.context else None
        })
        
        
        is_chemistry, confidence = is_chemistry_related(request.text)
        print(f"Chemistry check - is_chemistry: {is_chemistry}, confidence: {confidence}")
        
        if not is_chemistry:
            return AnalysisResponse(
                summary="This query appears to be outside the chemistry domain. This model is specialized in chemistry-related content only.",
                roadmap="N/A - Content is not chemistry-related",
                key_concepts=[],
                difficulty_level="N/A",
                is_chemistry_domain=False,
                domain_confidence=confidence
            )

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

            summary_prompt = f"""<s>[INST] You are a chemistry domain expert using the latest Llama 3 model. Analyze the following chemistry text and provide a comprehensive analysis. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please follow these steps:

1. First, identify and list all different types of chemistry content in the text
2. Then, for each type of content:
   - Provide a detailed overview
   - Highlight the main chemistry points and key information
   - Note any important chemistry details or requirements
   - Identify underlying chemistry themes and patterns
3. Finally, provide an overall summary that ties everything together
4. If advanced analysis is requested, also include:
   - Key chemistry concepts and their relationships
   - Difficulty level assessment
   - Prerequisites for understanding the chemistry content

Text content:
{request.text}

Please structure your response as follows:
1. Chemistry Content Types Found:
   - [List all types of chemistry content found]

2. Detailed Chemistry Analysis:
   [For each content type, provide its summary]

3. Overall Chemistry Summary:
   [Provide a comprehensive summary that covers all chemistry content]

4. Advanced Chemistry Analysis (if requested):
   - Key Chemistry Concepts: [List main concepts]
   - Difficulty Level: [Assess complexity]
   - Prerequisites: [List required chemistry knowledge] [/INST]"""

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

            roadmap_prompt = f"""<s>[INST] You are a chemistry education expert using the latest Llama 3 model. Based on the following chemistry text, create a detailed learning roadmap. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please:

1. First, perform a comprehensive chemistry content analysis:
   - Identify all chemistry topics and subtopics
   - Assess complexity levels
   - Determine chemistry prerequisites
   - Identify key chemistry learning objectives
2. Then, create an advanced learning path that:
   - Starts with foundational chemistry concepts
   - Progresses through different chemistry content types
   - Includes chemistry practice opportunities and assessments
   - Incorporates all types of chemistry content
   - Suggests additional chemistry resources
3. Finally, provide a detailed study schedule with:
   - Time estimates for each chemistry section
   - Recommended chemistry study methods
   - Chemistry milestone checkpoints
   - Progress tracking suggestions
4. Add '\n' whereever there is a line break. 

Text content:
{request.text}

Please structure your response as follows:
1. Chemistry Content Analysis:
   [List and describe each type of chemistry content]

2. Chemistry Learning Roadmap:
   [Provide a detailed, step-by-step chemistry learning path]

3. Chemistry Study Schedule:
   [Suggest a timeline with chemistry milestones]

4. Additional Chemistry Resources:
   [List recommended chemistry supplementary materials] [/INST]"""

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
            if "Key Chemistry Concepts:" in response_text:
                concepts_section = response_text.split("Key Chemistry Concepts:")[1].split("\n")[0]
                key_concepts = [c.strip() for c in concepts_section.split(",")]
            
            if "Difficulty Level:" in response_text:
                difficulty_section = response_text.split("Difficulty Level:")[1].split("\n")[0]
                difficulty_level = difficulty_section.strip()

        return AnalysisResponse(
            summary=summary_response['response'],
            roadmap=roadmap_response['response'],
            key_concepts=key_concepts if request.advanced_analysis else None,
            difficulty_level=difficulty_level if request.advanced_analysis else None,
            is_chemistry_domain=True,
            domain_confidence=confidence
        )

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
    
    uvicorn.run(app, host="0.0.0.0", port=8007)  # Using port 8007 for Chemistry 