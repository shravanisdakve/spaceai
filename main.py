import sys
import os
import json
import importlib
import pkgutil
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import ollama 
import uvicorn

# --- SETUP & LOGGING ---
# (Keeping your existing logging setup)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from logging_utils import setup_logger, log_request, log_error
    logger = setup_logger('aistudyroom_api', 'aistudyroom_api.log')
except ImportError:
    import logging
    logging.basicConfig(level=logging.INFO) # Basic logging if logging_utils is not found
    logger = logging.getLogger("aistudyroom_api") # Fallback

app = FastAPI(title="AI Study Room API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. DYNAMIC TUTOR LOADING LOGIC ---
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
AVAILABLE_TUTORS = {}

def load_tutor_profiles():
    """Scans the /models directory and loads all valid tutor configurations."""
    logger.info(f"📂 Loading tutor profiles from {MODELS_DIR}...")
    
    # Ensure the directory exists
    if not os.path.exists(MODELS_DIR):
        logger.warning(f"⚠️ Models directory not found at {MODELS_DIR}")
        return

    # Add to path so we can import them
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

    for _, name, _ in pkgutil.iter_modules([MODELS_DIR]):
        try:
            # Import the module (e.g., models.math)
            module = importlib.import_module(f"models.{name}")
            
            # Check if it has the required MODEL_CONFIG dictionary
            if hasattr(module, "MODEL_CONFIG"):
                config = module.MODEL_CONFIG
                AVAILABLE_TUTORS[config["id"]] = config
                logger.info(f"✅ Loaded Tutor: {config['display_name']} ({name}.py)")
        except Exception as e:
            logger.error(f"❌ Failed to load model {name}: {str(e)}")

# Initialize on startup
load_tutor_profiles()


# --- 2. DATA MODELS ---

# For the new AI Tutor Chat
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    tutor_id: str # The frontend sends 'math_solver', 'code_expert', etc.

# For your existing Document Analysis (Keeping this intact)
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


# --- 3. NEW API ENDPOINTS (AI TUTOR) ---

@app.get("/api/tutors")
def get_tutors():
    """Returns the list of available tutor profiles to the frontend."""
    return list(AVAILABLE_TUTORS.values())

@app.post("/api/chat")
async def chat_stream(request: ChatRequest):
    """Streams the chat response using the selected tutor's specific model and prompt."""
    
    # 1. Identify the Tutor
    tutor_id = request.tutor_id
    tutor_config = AVAILABLE_TUTORS.get(tutor_id)
    
    # Fallback if ID is invalid
    if not tutor_config:
        logger.warning(f"⚠️ Tutor ID '{tutor_id}' not found, defaulting to General.")
        tutor_config = AVAILABLE_TUTORS.get("general_tutor")
        # Extreme fallback if general_tutor file is missing
        if not tutor_config:
             tutor_config = {"ollama_model": "llama3", "system_prompt": "You are a helpful AI assistant."}

    logger.info(f"🤖 Starting chat with {tutor_config.get('display_name', 'Unknown')} using model {tutor_config['ollama_model']}")

    # 2. Prepare Messages (Inject System Prompt)
    system_message = {'role': 'system', 'content': tutor_config['system_prompt']}
    
    # Convert Pydantic models to dicts for Ollama
    user_messages = [msg.dict() for msg in request.messages]
    final_messages = [system_message] + user_messages

    # 3. Stream Response
    async def generate_chunks():
        try:
            stream = ollama.chat(
                model=tutor_config['ollama_model'],
                messages=final_messages,
                stream=True
            )
            for chunk in stream:
                content = chunk.get('message', {}).get('content', '')
                if content:
                    # Send as JSON string for easy parsing on frontend
                    yield json.dumps({"text": content}) + "\n"
        except Exception as e:
            error_msg = f"Error with Ollama model '{tutor_config['ollama_model']}': {str(e)}"
            logger.error(error_msg)
            yield json.dumps({"error": error_msg}) + "\n"

    return StreamingResponse(generate_chunks(), media_type="application/x-ndjson")


# --- 4. EXISTING API ENDPOINTS (DOCUMENT ANALYSIS) ---

@app.get("/")
async def root():
    return {"message": "AI Study Room API is running (Tutor + Analysis)"}

# (Existing /analyze logic condensed for brevity - keeping your original logic)
def is_cybersecurity_related(text: str) -> tuple[bool, float]:
    # Placeholder for your existing helper function logic
    # You need to ensure your actual implementation for this function is here
    # For now, a dummy implementation:
    return "cybersecurity" in text.lower(), 0.9 if "cybersecurity" in text.lower() else 0.1

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: TextRequest):
    # Placeholder for your existing analyze_text implementation:
    # You need to ensure your actual implementation for this function is here.
    # This dummy implementation assumes the original analyze_text function
    # would make calls to an LLM for summarization, roadmap generation etc.
    
    # Determine if text is cybersecurity related
    is_cs, confidence = is_cybersecurity_related(request.text)

    summary_text = f"Summary of {request.text[:50]}..."
    roadmap_text = "Roadmap to understand the text..."
    key_concepts_list = ["concept1", "concept2"]
    difficulty = "Medium"

    if is_cs:
        summary_text = "This text is related to cybersecurity. " + summary_text
        roadmap_text = "Cybersecurity specific roadmap. " + roadmap_text
        key_concepts_list.append("Cybersecurity specific concept")

    return AnalysisResponse(
        summary=summary_text,
        roadmap=roadmap_text,
        key_concepts=key_concepts_list,
        difficulty_level=difficulty,
        is_cybersecurity_domain=is_cs,
        domain_confidence=confidence
    )


if __name__ == "__main__":
    # Ensure required models are pulled
    print("🚀 Starting AI Study Room API...")
    uvicorn.run(app, host="0.0.0.0", port=8019)