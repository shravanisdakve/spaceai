import subprocess
import os
import sys
import time
import signal
import platform

# --- Configuration ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(ROOT_DIR, "models")
NODE_ROUTER_PATH = os.path.join(ROOT_DIR, "Model Backend", "main-router.mjs")
FRONTEND_CMD = "npm run dev"

# Colors for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def log(message, level="info"):
    if level == "info":
        print(f"{Colors.OKBLUE}[INFO] {message}{Colors.ENDC}")
    elif level == "success":
        print(f"{Colors.OKGREEN}[SUCCESS] {message}{Colors.ENDC}")
    elif level == "warning":
        print(f"{Colors.WARNING}[WARNING] {message}{Colors.ENDC}")
    elif level == "error":
        print(f"{Colors.FAIL}[ERROR] {message}{Colors.ENDC}")

processes = []

def start_process(command, cwd=ROOT_DIR, shell=False):
    """Starts a subprocess and tracks it."""
    try:
        # On Windows, we need shell=True for npm, but handled carefully
        if platform.system() == "Windows" and "npm" in command:
             shell = True
        
        # Split command for subprocess.Popen if not shell
        cmd_args = command if shell else command.split()
        
        proc = subprocess.Popen(
            cmd_args,
            cwd=cwd,
            shell=shell,
            # We don't pipe stdout/stderr to keep them visible in the console
            # or we could pipe them to log files if preferred.
            # For this "one script" approach, letting them mix in the console 
            # might be chaotic but informative, or we can silence them.
            # Let's keep them visible but maybe we should use new console windows?
            # Creating new windows is platform specific. 
            # Let's run them in background and let output stream.
        )
        processes.append(proc)
        return proc
    except Exception as e:
        log(f"Failed to start {command}: {e}", "error")
        return None

def check_ollama():
    """Checks if Ollama is running."""
    log("Checking Ollama status...")
    try:
        # Attempt to connect to localhost:11434 (default Ollama port)
        # Using a quick curl or just checking process list? 
        # subprocess run is better
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True)
        if result.returncode == 0:
            log("Ollama is running.", "success")
            # Check for llama3
            if "llama3" not in result.stdout:
                log("Model 'llama3' not found! Please run 'ollama pull llama3' first.", "warning")
            return True
        else:
            log("Ollama is NOT running. Please start 'ollama serve' in a separate terminal.", "error")
            return False
    except FileNotFoundError:
        log("Ollama command not found in PATH.", "error")
        return False

def start_main_backend():
    log("Starting Main Python Backend...", "info")
    start_process(f"{sys.executable} main.py", cwd=ROOT_DIR)

def start_node_router():
    log("Starting Node.js Router...", "info")
    # Verify node exists
    start_process(f"node \"{NODE_ROUTER_PATH}\"", cwd=ROOT_DIR, shell=True) # Quotes for paths with spaces

def start_domain_models():
    log(f"Scanning {MODELS_DIR} for domain services...", "info")
    if not os.path.exists(MODELS_DIR):
        log("Models directory not found!", "error")
        return

    count = 0
    for item in os.listdir(MODELS_DIR):
        item_path = os.path.join(MODELS_DIR, item)
        if os.path.isdir(item_path):
            main_py = os.path.join(item_path, "main.py")
            if os.path.exists(main_py):
                domain_name = item
                log(f"Starting Domain: {domain_name}", "info")
                start_process(f"{sys.executable} \"{main_py}\"", cwd=ROOT_DIR, shell=True)
                count += 1
                time.sleep(0.5) # Stagger starts slightly
    
    log(f"Started {count} domain services.", "success")

def start_frontend():
    log("Starting Frontend...", "info")
    start_process(FRONTEND_CMD, cwd=ROOT_DIR)

def cleanup():
    log("Stopping all services...", "warning")
    for proc in processes:
        try:
            if platform.system() == "Windows":
                 subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)])
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except Exception as e:
            pass # Process might already be dead
    log("Shutdown complete.", "success")

def main():
    print(f"{Colors.HEADER}========================================")
    print(f"   SpaceAI / NexusAI Startup Script")
    print(f"========================================{Colors.ENDC}")

    if not check_ollama():
        # strict check? Maybe let them proceed if they know what they are doing
        print("Note: The app requires Ollama. Please ensure it is running.")
        time.sleep(2)

    # Install dependencies? 
    # Skipping auto-install for speed, assuming user did 'pip install -r requirements.txt'
    # But we can print a reminder.
    log("Ensure you have installed dependencies: pip install -r requirements.txt", "info")
    
    try:
        start_main_backend()
        time.sleep(2) # Wait for main backend to init
        
        start_node_router()
        time.sleep(2)
        
        start_domain_models()
        time.sleep(2) # Wait for models to stabilize
        
        start_frontend()
        
        log("All services launched! Press CTRL+C to stop.", "success")
        
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
