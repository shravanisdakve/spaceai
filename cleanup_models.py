import os
import re

def clean_main_py(file_path):
    """
    Cleans up duplicated lines in a main.py file.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove duplicated logger.info lines
    content = re.sub(r"logger.info('🚀 Starting .* Analysis API')\nlogger.info('🚀 Starting .* Analysis API')\nlogger.info('🚀 Starting .* Analysis API')", r"logger.info('🚀 Starting .* Analysis API')", content)
    content = re.sub(r'logger.info("🔍 Health check endpoint called")\n    logger.info("🔍 Health check endpoint called")\n    logger.info("🔍 Health check endpoint called")', r'logger.info("🔍 Health check endpoint called")', content)
    content = re.sub(r'logger.info("📋 Listing available models")\n    logger.info("📋 Listing available models")\n    logger.info("📋 Listing available models")', r'logger.info("📋 Listing available models")', content)

    # Remove duplicated sys.path.append and # Setup logger lines
    content = re.sub(r"sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))\n# Setup logger\nsys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))\n# Setup logger", "", content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    models_dir = 'models'
    for domain_dir in os.listdir(models_dir):
        main_py_path = os.path.join(models_dir, domain_dir, 'main.py')
        if os.path.isfile(main_py_path):
            print(f"Cleaning {main_py_path}...")
            clean_main_py(main_py_path)
    print("Done.")