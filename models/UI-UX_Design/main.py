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
logger = setup_logger('ui-ux_design_api', 'ui-ux_design_api.log')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger
app = FastAPI(title="UI-UX Design Document Analysis API")
logger.info('🚀 Starting UI-UX_Design Document Analysis API')
logger.info('🚀 Starting UI-UX_Design Document Analysis API')
logger.info('🚀 Starting UI-UX_Design Document Analysis API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    queryType: Optional[str] = "ui-ux"
    model_size: Optional[str] = "8b"
    advanced_analysis: Optional[bool] = False
    domain: Optional[str] = None
    context: Optional[Context] = None

class AnalysisResponse(BaseModel):
    summary: str
    roadmap: str
    key_concepts: Optional[list] = None
    difficulty_level: Optional[str] = None
    is_uiux_domain: bool
    domain_confidence: float

def is_uiux_related(text: str) -> tuple[bool, float]:
    """Use AI model to determine if the text is UI-UX related and return confidence score."""
    try:
        model_name = "llama3:8b"
        prompt = f"""<s>[INST] You are a UI-UX design domain expert. Analyze if the following text is related to user interface design, user experience, or design principles. 
        Respond with a JSON object containing two fields:
        1. "is_uiux": boolean (true/false)
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
                return result.get('is_uiux', False), result.get('confidence', 0.0)
            else:
                if 'true' in json_str.lower():
                    return True, 0.8
                elif 'false' in json_str.lower():
                    return False, 0.2
                else:
                    return False, 0.0
        except json.JSONDecodeError:
            response_text = response['response'].lower()
            if 'ui' in response_text or 'ux' in response_text or 'interface' in response_text or 'design' in response_text:
                return True, 0.7
            return False, 0.3
            
    except Exception as e:
        print(f"Error in is_uiux_related: {str(e)}")
        return False, 0.0

def get_model_name(size: str) -> str:
    """Get the appropriate Llama 3 model name based on size."""
    return f"llama3:{size}"

@app.get("/")
async def root():
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    return {"message": "UI-UX Design Document Analysis API is running"}

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
        
        
        is_uiux, confidence = is_uiux_related(request.text)
        print(f"UI-UX check - is_uiux: {is_uiux}, confidence: {confidence}")
        
        if not is_uiux:
            return AnalysisResponse(
                summary="This query appears to be outside the UI-UX design domain. This model is specialized in UI-UX design-related content only.",
                roadmap="N/A - Content is not UI-UX design-related",
                key_concepts=[],
                difficulty_level="N/A",
                is_uiux_domain=False,
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

            summary_prompt = f"""<s>[INST] You are a UI-UX design domain expert using the latest Llama 3 model. Analyze the following UI-UX design text and provide a comprehensive analysis. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please follow these steps:

1. First, identify and list all different types of UI-UX design content in the text
2. Then, for each type of content:
   - Provide a detailed overview
   - Highlight the main UI-UX design points and key information
   - Note any important UI-UX design details or requirements
   - Identify underlying UI-UX design themes and patterns
3. Finally, provide an overall summary that ties everything together
4. If advanced analysis is requested, also include:
   - Key UI-UX design concepts and their relationships
   - Difficulty level assessment
   - Prerequisites for understanding the UI-UX design content

Text content:
{request.text}

Please structure your response as follows:
1. UI-UX Design Content Types Found:
   - [List all types of UI-UX design content found]

2. Detailed UI-UX Design Analysis:
   [For each content type, provide its summary]

3. Overall UI-UX Design Summary:
   [Provide a comprehensive summary that covers all UI-UX design content]

4. Advanced UI-UX Design Analysis (if requested):
   - Key UI-UX Design Concepts: [List main concepts]
   - Difficulty Level: [Assess complexity]
   - Prerequisites: [List required UI-UX design knowledge] [/INST]"""

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

            roadmap_prompt = f"""<s>[INST] You are a UI-UX design education expert using the latest Llama 3 model. Based on the following UI-UX design text, create a detailed learning roadmap. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please:

1. First, perform a comprehensive UI-UX design content analysis:
   - Identify all UI-UX design topics and subtopics
   - Assess complexity levels
   - Determine UI-UX design prerequisites
   - Identify key UI-UX design learning objectives
2. Then, create an advanced learning path that:
   - Starts with foundational UI-UX design concepts
   - Progresses through different UI-UX design content types
   - Includes UI-UX design practice opportunities and assessments
   - Incorporates all types of UI-UX design content
   - Suggests additional UI-UX design resources
3. Finally, provide a detailed study schedule with:
   - Time estimates for each UI-UX design section
   - Recommended UI-UX design study methods
   - UI-UX design milestone checkpoints
   - Progress tracking suggestions
4. Add '\n' whereever there is a line break. 

Text content:
{request.text}

Please structure your response as follows:
1. UI-UX Design Content Analysis:
   [List and describe each type of UI-UX design content]

2. UI-UX Design Learning Roadmap:
   [Provide a detailed, step-by-step UI-UX design learning path]

3. UI-UX Design Study Schedule:
   [Suggest a timeline with UI-UX design milestones]

4. Additional UI-UX Design Resources:
   [List recommended UI-UX design supplementary materials] [/INST]"""

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
            if "Key UI-UX Design Concepts:" in response_text:
                concepts_section = response_text.split("Key UI-UX Design Concepts:")[1].split("\n")[0]
                key_concepts = [c.strip() for c in concepts_section.split(",")]
            
            if "Difficulty Level:" in response_text:
                difficulty_section = response_text.split("Difficulty Level:")[1].split("\n")[0]
                difficulty_level = difficulty_section.strip()

        return AnalysisResponse(
            summary=summary_response['response'],
            roadmap=roadmap_response['response'],
            key_concepts=key_concepts if request.advanced_analysis else None,
            difficulty_level=difficulty_level if request.advanced_analysis else None,
            is_uiux_domain=True,
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
    
    uvicorn.run(app, host="0.0.0.0", port=8012)  # Using port 8012 for UI-UX Design 