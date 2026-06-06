from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Data Explorer Backend Connected 🚀"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return{
        "filename": file.filename,
        "message": "File received successfully!"
    }