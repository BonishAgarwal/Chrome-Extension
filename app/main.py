from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import base64
import os
from pydantic import BaseModel
from azure.core.credentials import AzureKeyCredential
from azure.storage.blob import BlobServiceClient, ContainerClient, BlobBlock, BlobClient, StandardBlobTier
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeResult
from azure.ai.documentintelligence.models import AnalyzeDocumentRequest
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
        
endpoint = os.getenv("AZURE_DOCINTELLIGENCE_ENDPOINT")
key = os.getenv("AZURE_DOCINTELLIGENCE_KEY")


blob_connection_string = os.getenv("BLOB_CONNECTION_STRING")
blob_service_client = BlobServiceClient.from_connection_string(blob_connection_string)


def analyze_layout(url):

    document_intelligence_client = DocumentIntelligenceClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    
    poller = document_intelligence_client.begin_analyze_document(
                "prebuilt-layout", AnalyzeDocumentRequest(url_source=url)
            )
    
    result: AnalyzeResult = poller.result()

    return result['content']    

# create function to upload snapshot to testing/snapshots
async def upload_snapshot(snapshot_path, snapshot_name):
    
    container_name = os.getenv("CONTAINER_NAME")
    
    container_client = blob_service_client.get_container_client(container_name)
    blob_client = container_client.get_blob_client(snapshot_name)
    
    with open(snapshot_path, "rb") as data:
        blob_client.upload_blob(data, overwrite=True)
    
    os.unlink(snapshot_path)

    return blob_client.url

class Docs(BaseModel):
    web_url: str
    screenshots: list
    title: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/uploadDocs")
async def root(request: Docs):
    content = ""
    counter = 0

    for screenshot in request.screenshots:
        base64_data = screenshot.split(",")[1]
        img_data = base64.b64decode(base64_data)
        with open(f"app/docs/imageToSave_{counter}.png", "wb") as fh:
            fh.write(img_data)
            
        blob_url = await upload_snapshot(f"app/docs/imageToSave_{counter}.png", f"imageToSave_{counter}.png")
        
        print(blob_url)
        
        content += analyze_layout(blob_url)
        
        counter += 1
        
    genai.configure(api_key=os.getenv("GENAI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(f"Summarise the content below in detail: \n {content}")


    print("Summary of the content is: \n", response.text)
    
    with open("app/docs/summary.txt", "w") as f:
        f.write(response.text)