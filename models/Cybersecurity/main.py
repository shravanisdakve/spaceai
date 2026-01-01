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
logger = setup_logger('cybersecurity_api', 'cybersecurity_api.log')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Setup logger
app = FastAPI(title="Cybersecurity Document Analysis API")
logger.info('🚀 Starting Cybersecurity Document Analysis API')
logger.info('🚀 Starting Cybersecurity Document Analysis API')
logger.info('🚀 Starting Cybersecurity Document Analysis API')
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
    queryType: Optional[str] = "cybersecurity"
    model_size: Optional[str] = "8b"
    advanced_analysis: Optional[bool] = False
    domain: Optional[str] = None
    context: Optional[Context] = None

class AnalysisResponse(BaseModel):
    summary: str
    roadmap: str
    key_concepts: Optional[list] = None
    difficulty_level: Optional[str] = None
    is_cybersecurity_domain: bool
    domain_confidence: float

def is_cybersecurity_related(text: str) -> tuple[bool, float]:
    """Use AI model to determine if the text is cybersecurity related and return confidence score."""
    try:
        model_name = "llama3:8b"
        prompt = f"""<s>[INST] You are a cybersecurity domain expert. Analyze if the following text is related to cybersecurity, information security, network security, or digital protection. 
        Respond with a JSON object containing two fields:
        1. "is_cybersecurity": boolean (true/false)
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
                return result.get('is_cybersecurity', False), result.get('confidence', 0.0)
            else:
                if 'true' in json_str.lower():
                    return True, 0.8
                elif 'false' in json_str.lower():
                    return False, 0.2
                else:
                    return False, 0.0
        except json.JSONDecodeError:
            response_text = response['response'].lower()
            if 'security' in response_text or 'cyber' in response_text or 'hack' in response_text or 'protect' in response_text:
                return True, 0.7
            return False, 0.3
            
    except Exception as e:
        print(f"Error in is_cybersecurity_related: {str(e)}")
        return False, 0.0

def get_model_name(size: str) -> str:
    """Get the appropriate Llama 3 model name based on size."""
    return f"llama3:{size}"

@app.get("/")
async def root():
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    logger.info("🔍 Health check endpoint called")
    return {"message": "Cybersecurity Document Analysis API is running"}

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
        
        
        is_cybersecurity, confidence = is_cybersecurity_related(request.text)
        print(f"Cybersecurity check - is_cybersecurity: {is_cybersecurity}, confidence: {confidence}")
        
        if not is_cybersecurity:
            return AnalysisResponse(
                summary="This query appears to be outside the cybersecurity domain. This model is specialized in cybersecurity-related content only.",
                roadmap="N/A - Content is not cybersecurity-related",
                key_concepts=[],
                difficulty_level="N/A",
                is_cybersecurity_domain=False,
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

            summary_prompt = f"""<s>[INST] You are a cybersecurity domain expert using the latest Llama 3 model. Analyze the following cybersecurity text and provide a comprehensive analysis. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please follow these steps:

1. First, identify and list all different types of cybersecurity content in the text
2. Then, for each type of content:
   - Provide a detailed overview
   - Highlight the main cybersecurity points and key information
   - Note any important cybersecurity details or requirements
   - Identify underlying cybersecurity themes and patterns
3. Finally, provide an overall summary that ties everything together
4. If advanced analysis is requested, also include:
   - Key cybersecurity concepts and their relationships
   - Difficulty level assessment
   - Prerequisites for understanding the cybersecurity content

Text content:
{request.text}

Please structure your response as follows:
1. Cybersecurity Content Types Found:
   - [List all types of cybersecurity content found]

2. Detailed Cybersecurity Analysis:
   [For each content type, provide its summary]

3. Overall Cybersecurity Summary:
   [Provide a comprehensive summary that covers all cybersecurity content]

4. Advanced Cybersecurity Analysis (if requested):
   - Key Cybersecurity Concepts: [List main concepts]
   - Difficulty Level: [Assess complexity]
   - Prerequisites: [List required cybersecurity knowledge] [/INST]"""

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

            roadmap_prompt = f"""<s>[INST] You are a cybersecurity education expert using the latest Llama 3 model. Based on the following cybersecurity text, create a detailed learning roadmap. 
            The text is of type: {request.queryType}. 
            {context_info}
            Please:

1. First, perform a comprehensive cybersecurity content analysis:
   - Identify all cybersecurity topics and subtopics
   - Assess complexity levels
   - Determine cybersecurity prerequisites
   - Identify key cybersecurity learning objectives
2. Then, create an advanced learning path that:
   - Starts with foundational cybersecurity concepts
   - Progresses through different cybersecurity content types
   - Includes cybersecurity practice opportunities and assessments
   - Incorporates all types of cybersecurity content
   - Suggests additional cybersecurity resources
3. Finally, provide a detailed study schedule with:
   - Time estimates for each cybersecurity section
   - Recommended cybersecurity study methods
   - Cybersecurity milestone checkpoints
   - Progress tracking suggestions
4. Add '\n' whereever there is a line break. 

Text content:
{request.text}

Please structure your response as follows:
1. Cybersecurity Content Analysis:
   [List and describe each type of cybersecurity content]

2. Cybersecurity Learning Roadmap:
   [Provide a detailed, step-by-step cybersecurity learning path]

3. Cybersecurity Study Schedule:
   [Suggest a timeline with cybersecurity milestones]

4. Additional Cybersecurity Resources:
   [List recommended cybersecurity supplementary materials] [/INST]"""

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
            if "Key Cybersecurity Concepts:" in response_text:
                concepts_section = response_text.split("Key Cybersecurity Concepts:")[1].split("\n")[0]
                key_concepts = [c.strip() for c in concepts_section.split(",")]
            
            if "Difficulty Level:" in response_text:
                difficulty_section = response_text.split("Difficulty Level:")[1].split("\n")[0]
                difficulty_level = difficulty_section.strip()

        return AnalysisResponse(
            summary=summary_response['response'],
            roadmap=roadmap_response['response'],
            key_concepts=key_concepts if request.advanced_analysis else None,
            difficulty_level=difficulty_level if request.advanced_analysis else None,
            is_cybersecurity_domain=True,
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
    
    uvicorn.run(app, host="0.0.0.0", port=8019)  # Using port 8019 for Cybersecurity 