
"""
This file is part of my INFORMD project, which provides a zero-shot classification API for analyzing the trustworthiness of articles.
It uses a pre-trained NLP model to classify articles as "trustworthy" or "untrustworthy" based on their content.
The API is built using FastAPI and can be accessed via HTTP requests.
This code sets up the FastAPI application, defines the input model, and implements the classification endpoint
CORs middleware is included to allow cross-origin requests, making it suitable for web applications.

After accessing "backend" folder, run: "python -m uvicorn main:app --reload" in terminal (if python is already included in PATH, you can remove python-m)
cd to backend folder in terminal and run command to start server
"""

from transformers import pipeline #high level API
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.responses import JSONResponse
app=FastAPI() #sets up app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],#for testing, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli") #existing pre-trained NLP model
class ArticleInput(BaseModel):
  text:str
  #input model for article text, which is string type
  
@app.post("/analyze")
async def rate_article(article:ArticleInput):
  print("Received article text:", article.text)
  labels = ["trustworthy", "untrustworthy"]
  result = classifier(article.text,labels) #classifies text from article
  label = result["labels"][0]
  score = result["scores"][0]
  if label=="trustworthy" and score>0.7:
      color="green"
  elif label=="untrustworthy" and score>0.7:
      color="red"
  else:
      color="yellow"
  return {"trustworthiness":label,"score":round(score, 2),"color":color}

@app.get("/")
def read_root():
    return {"message": "API is working!"} #put this in to test if the API is working
