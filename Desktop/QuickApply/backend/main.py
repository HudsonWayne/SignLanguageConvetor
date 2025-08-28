from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from typing import List
import pdfplumber
import os
from datetime import datetime

# ----------------- Config -----------------
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "quickapply"

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------- MongoDB -----------------
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# ----------------- FastAPI App -----------------
app = FastAPI(title="QuickApply API")

# Allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------
class Job(BaseModel):
    title: str
    company: str
    location: str
    link: str

class ApplyJobRequest(BaseModel):
    resume_id: str
    job: Job

# ----------------- Helpers -----------------
def extract_text_from_pdf(file_path: str) -> str:
    with pdfplumber.open(file_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)

def match_jobs(cv_text: str) -> List[dict]:
    """
    Replace this with real API calls to job boards.
    For now, returns dummy jobs for testing.
    """
    return [
        {"title": "Frontend Developer", "company": "Tech Corp", "location": "Harare, Zimbabwe", "link": "https://example.com/job/frontend"},
        {"title": "Backend Developer", "company": "Code Labs", "location": "Bulawayo, Zimbabwe", "link": "https://example.com/job/backend"},
    ]

# ----------------- Routes -----------------
@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(await file.read())

    # Extract text
    cv_text = extract_text_from_pdf(save_path)

    # Save resume to MongoDB
    resume_doc = db.resumes.insert_one({
        "filename": file.filename,
        "text": cv_text,
        "uploadedAt": datetime.utcnow()
    })

    # Match jobs
    matched_jobs = match_jobs(cv_text)

    # Save matched jobs
    if matched_jobs:
        db.matchedJobs.insert_one({
            "resume_id": resume_doc.inserted_id,
            "filename": file.filename,
            "matchedAt": datetime.utcnow(),
            "matchedJobs": matched_jobs
        })

    return {"message": "Resume uploaded and jobs matched", "matchedCount": len(matched_jobs)}

@app.get("/jobs")
def get_jobs():
    docs = db.matchedJobs.find().sort("matchedAt", -1)
    jobs = []
    for doc in docs:
        jobs.extend(doc.get("matchedJobs", []))
    return {"jobs": jobs}

@app.post("/apply")
def apply_job(data: ApplyJobRequest):
    db.applications.insert_one({
        "resume_id": data.resume_id,
        "job": data.job.dict(),
        "appliedAt": datetime.utcnow(),
        "status": "applied"
    })
    return {"message": "Applied successfully"}
