from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import os
import requests

app = FastAPI()

# Allow your Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dummy job listings (replace with real API later)
JOBS = [
    {"title": "Frontend Developer", "company": "TechCorp", "skills": ["React", "JavaScript"]},
    {"title": "Backend Engineer", "company": "DataSoft", "skills": ["Python", "Django"]},
    {"title": "Fullstack Developer", "company": "WebWorks", "skills": ["React", "Node", "Python"]},
]

@app.post("/match-jobs")
async def match_jobs(file: UploadFile = File(...)):
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Parse PDF text
    pdf_reader = PyPDF2.PdfReader(file_path)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""

    # Extract skills (very basic: check if keywords appear)
    matched_jobs = []
    for job in JOBS:
        if any(skill.lower() in text.lower() for skill in job["skills"]):
            matched_jobs.append(job)

    return {"matched_jobs": matched_jobs, "resume": file.filename}
