#!/bin/bash

# Function to start an API
start_api() {
    local dir=$1
    local port=$2
    echo "Checking contents of $dir:"
    ls -l "$dir"
    if [ -f "$dir/main.py" ]; then
        echo "Starting $dir API on port $port..."
        python3 "$dir/main.py" &
    else
        echo "Skipping $dir API - main.py not found"
    fi
}

# Start all APIs
start_api "Finance" 8000
start_api "Mathematics" 8001
start_api "Programming" 8003
start_api "Psychology" 8005
start_api "Physics" 8006
start_api "Chemistry" 8007
start_api "Biology" 8008
start_api "Legal" 8009
start_api "Marketing" 8011
start_api "UI-UX_Design" 8012
start_api "Product_Management" 8014
start_api "Music" 8015
start_api "Art_Style" 8016
start_api "Philosophy_Ethics" 8017
start_api "Cybersecurity" 8019
start_api "Data_Science" 8021
start_api "Productivity" 8022
start_api "Mental_Health" 8023

echo "All APIs have been started. You can check their status using 'ps aux | grep python'"
echo "To stop all APIs, use 'pkill -f main.py'" 