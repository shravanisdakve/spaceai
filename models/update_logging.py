import os
import shutil

def update_model_logging(model_dir):
    """Update a model's main.py with the new logging system."""
    main_py_path = os.path.join(model_dir, 'main.py')
    if not os.path.exists(main_py_path):
        print(f"Skipping {model_dir} - main.py not found")
        return

    # Read the original file
    with open(main_py_path, 'r') as f:
        content = f.read()

    # Add imports at the top
    imports = """import sys
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
logger = setup_logger('{}_api', '{}_api.log')
""".format(model_dir.lower(), model_dir.lower())

    # Remove any existing imports and logger setup
    lines = content.split('\n')
    filtered_lines = []
    skip_imports = False
    for line in lines:
        if line.startswith('import ') or line.startswith('from '):
            skip_imports = True
            continue
        if skip_imports and not line.strip():
            skip_imports = False
            continue
        if 'setup_logger' in line or 'logging_utils' in line:
            continue
        filtered_lines.append(line)
    
    content = '\n'.join(filtered_lines)

    # Add logger initialization after FastAPI initialization
    content = content.replace("app = FastAPI(", "app = FastAPI(")
    content = content.replace("app.add_middleware(", "logger.info('🚀 Starting {} Document Analysis API')\napp.add_middleware(".format(model_dir))

    # Fix log_request format
    content = content.replace('log_request(logger, { {request.text[:100]}...")', 'log_request(logger, {\n            "text_length": len(request.text),\n            "text_preview": request.text[:100] + "...",\n            "query_type": request.queryType,\n            "model_size": request.model_size,\n            "advanced_analysis": request.advanced_analysis,\n            "context": request.context.dict() if request.context else None\n        })')
    content = content.replace('log_request(logger, { {request.context}")', '')

    # Replace print statements with logger calls
    content = content.replace('print(f"Using model:', 'logger.info(f"🤖 Using model:')
    content = content.replace('print("Summary generated successfully"', 'log_generation_complete(logger, "summary"')
    content = content.replace('print("Roadmap generated successfully"', 'log_generation_complete(logger, "roadmap"')
    content = content.replace('print(f"Error during model generation:', 'log_error(logger, f"Error during model generation:')
    content = content.replace('print(f"Error in analyze_text:', 'log_error(logger, f"Error in analyze_text:')

    # Add logging to root endpoint
    content = content.replace('async def root():', 'async def root():\n    logger.info("🔍 Health check endpoint called")')

    # Add logging to models endpoint
    content = content.replace('async def list_models():', 'async def list_models():\n    logger.info("📋 Listing available models")')

    # Write the updated content
    with open(main_py_path, 'w') as f:
        f.write(imports + content)

    print(f"Updated logging in {model_dir}")

def main():
    # Create logs directory
    os.makedirs('logs', exist_ok=True)

    # Get all model directories
    model_dirs = [d for d in os.listdir('.') if os.path.isdir(d) and not d.startswith('.') and not d in ['logs', '__pycache__', 'venv', '.venv']]

    # Update each model
    for model_dir in model_dirs:
        update_model_logging(model_dir)

if __name__ == "__main__":
    main() 