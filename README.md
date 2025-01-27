# Chrome-Extension

This is a chrome extension for web upload into your workspace

## Installation

1. Open Chrome browser
2. Go to chrome://extensions
3. Turn on "Developer mode"
4. Click on "Load unpacked" button
5. Select the extension folder
6. Click on "Load" button



## Backend Code

1. Create a virtual environment
    `python -m venv .venv`
2. Install the required dependencies
    `pip install -r requirements.txt`
3. Run the backend code
    `uvicorn app.main:app --port 8080 --host 0.0.0.0 --reload`


## Setup Environment Variables

1. Create a .env file
2. Add the following environment variables
    - GEMINI_API_KEY
    - AZURE_DOCINTELLIGENCE_ENDPOINT
    - AZURE_DOCINTELLIGENCE_KEY
    - BLOB_CONNECTION_STRING
    - CONTAINER_NAME

