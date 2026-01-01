import logging
import sys
from datetime import datetime
import os

def setup_logger(name, log_file=None):
    """Set up a logger with console and file handlers."""
    logger = logging.getLogger(name)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
        
    logger.setLevel(logging.INFO)
    
    # Create formatters
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler
    if log_file:
        # Create logs directory if it doesn't exist
        logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
        os.makedirs(logs_dir, exist_ok=True)
        
        # Create full path for log file
        log_path = os.path.join(logs_dir, log_file)
        
        # Add file handler
        file_handler = logging.FileHandler(log_path)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

def log_request(logger, request_data):
    """Log incoming request details."""
    logger.info(f"📥 Received request: {request_data}")
    
def log_model_generation(logger, model_name, prompt_type):
    """Log model generation start."""
    logger.info(f"🤖 Starting {prompt_type} generation using model: {model_name}")
    
def log_generation_complete(logger, prompt_type):
    """Log model generation completion."""
    logger.info(f"✅ {prompt_type} generation completed successfully")
    
def log_error(logger, error_msg):
    """Log error messages."""
    logger.error(f"❌ Error: {error_msg}")
    
def log_response(logger, response_data):
    """Log response details."""
    logger.info(f"📤 Sending response: {response_data}") 