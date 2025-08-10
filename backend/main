#zero shot classifier for absurdity detection
from transformers import pipeline as hf_pipeline
zero_shot_absurdity = hf_pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def check_absurdity_ai(text):
    candidate_labels = ["absurd","not absurd"]
    result = zero_shot_absurdity(text, candidate_labels)
    absurd_score = None
    for label, score in zip(result['labels'], result['scores']):
        if label == "absurd":
            absurd_score = score
            break
    if absurd_score is not None and absurd_score > 0.8:
        return True, f"AI model classified as 'absurd' with high confidence ({absurd_score:.2f})."
    else:
        return False, None



"""
This file is part of my INFORMD project, which provides a text classification API for analyzing the trustworthiness of articles.
It uses a pre-trained NLP model to classify articles as "trustworthy" or "untrustworthy" based on their content.
The API is built using FastAPI and can be accessed via HTTP requests.
This code sets up the FastAPI application, defines the input model, and implements the classification endpoint
CORs middleware is included to allow cross-origin requests, making it suitable for web applications.

- does NOT work with PDFs or other file formats
- uses older version of Python (~3.12)
- uses a small list of reputable domains, which can be expanded as needed. if not part of this list, then it classifies by AI

After accessing "backend" folder, run: "python -m uvicorn main:app --reload" in terminal (if python is already included in PATH, you can remove python-m)
cd to backend folder in terminal and run command to start server
"""

from transformers import pipeline #high level API
import re
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.responses import JSONResponse
app=FastAPI() #sets up app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://<phflmigfmnnbpjcociglnlgpfalkbdla>"],#for testing, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/analyze")
def analyze_get():
    return {"message": "Use POST with article text to analyze."}


#input model for article text  and tokenizers
classifier = pipeline("text-classification", model="jy46604790/Fake-News-Bert-Detect")
from transformers import AutoTokenizer as HF_AutoTokenizer
fn_tokenizer = HF_AutoTokenizer.from_pretrained("jy46604790/Fake-News-Bert-Detect")
sentiment_analyzer = pipeline("sentiment-analysis")
from transformers import AutoTokenizer
summarizer = pipeline("summarization",model="Falconsai/text_summarization")
summarizer_tokenizer = AutoTokenizer.from_pretrained(summarizer.model.name_or_path)

#bucketresearch/politicalBiasBERT
from transformers import AutoModelForSequenceClassification
import torch
pb_tokenizer = AutoTokenizer.from_pretrained("bert-base-cased")
pb_model = AutoModelForSequenceClassification.from_pretrained("bucketresearch/politicalBiasBERT")
def detect_bias(text):
    inputs = pb_tokenizer(text, return_tensors="pt",truncation=True,max_length=512)
    with torch.no_grad():
        outputs = pb_model(**inputs)
        logits = outputs.logits
        probs = logits.softmax(dim=-1)[0].tolist()
        idx = int(torch.argmax(logits, dim=-1))
        if idx==0:
            label = "left"
        elif idx==1:
            label = "center"
        else:
            label = "right"
        score = round(probs[idx]*100)
    return label, score


import tldextract
REPUTABLE_DOMAINS = {
    "apnews", "reuters", "bbc", "cnn", "nytimes", "theguardian",
    "washingtonpost", "wsj", "bloomberg", "forbes", "npr",
    "abcnews", "cbsnews", "nbcnews", "usatoday", "time", "aljazeera",
    "nature", "sciencemag", "jstor", "plos", "springer", "cambridge",
    "oxfordjournals", "sagepub", "mdpi", "ieee", "researchgate",
    "who", "cdc", "nih", "fda", "un", "nasa",
    "snopes", "politifact", "factcheck", "fullfact", "afp.com/fact-check"
}#limited list of reputable domains, can be expanded as needed
def estimate_source_credibility(text):
    import re
    urls = re.findall(r'https?://\S+', text)
    score = 0
    found_domains = set()
    for url in urls:
        ext = tldextract.extract(url)
        domain = ext.domain.lower()
        suffix = ext.suffix.lower()
        full_domain = f"{domain}.{suffix}" if suffix else domain
        # Check for exact reputable domains (e.g., who.int)
        if domain in REPUTABLE_DOMAINS or full_domain in {"who.int", "cdc.gov"}:
            score += 15
            found_domains.add(full_domain)
        elif suffix in ["edu", "gov"]:
            score += 10
        elif suffix == "org":
            score += 7
        elif suffix == "com":
            score += 3
        else:
            score += 1
    if not urls:
        text_lower = text.lower()
        for rep in REPUTABLE_DOMAINS:
            if rep in text_lower:
                score += 10
                found_domains.add(rep)
        # Also check for full reputable domains
        for full_rep in ["who.int", "cdc.gov"]:
            if full_rep in text_lower:
                score += 15
                found_domains.add(full_rep)
    
    return min(score, 35), list(found_domains) 

#here, I had a score feature but I removed it because it was not used in the frontend. it still counts the number

class ArticleInput(BaseModel):
  text:str
  #input model for article text, which is string type
  

@app.post("/analyze")
async def rate_article(article:ArticleInput):
    print("Received article text:", article.text)
    # Chunk article text for Fake-News-Bert-Detect (max 512 tokens)
    def chunk_text(text, tokenizer, max_tokens=500):
        words = text.split()
        chunks = []
        current = []
        for word in words:
            current.append(word)
            if len(tokenizer(' '.join(current))['input_ids']) >= max_tokens:
                chunks.append(' '.join(current))
                current = []
        if current:
            chunks.append(' '.join(current))
        return chunks

    fn_chunks = chunk_text(article.text, fn_tokenizer, max_tokens=500)
    fn_labels = []
    fn_scores = []
    for chunk in fn_chunks:
        if not chunk.strip():
            continue
        result = classifier(chunk)
        if not result or len(result) == 0:
            continue
        hf_label = result[0].get("label", None)
        score = result[0].get("score", None)
        if hf_label is not None and score is not None:
            fn_labels.append(hf_label)
            fn_scores.append(score)
    # Majority label
    from collections import Counter
    if fn_labels:
        majority_label = Counter(fn_labels).most_common(1)[0][0]
        avg_score = sum(fn_scores) / len(fn_scores) if fn_scores else 0.5
        if majority_label == "LABEL_1":
            label ="trustworthy"
        else:
            label ="untrustworthy"
        score = avg_score
    else:
        label ="untrustworthy"
        score = 0.0

    #chunk sentiment analysis for long articles
    def chunk_text(text, tokenizer, max_tokens=500):
        words = text.split()
        chunks = []
        current = []
        for word in words:
            current.append(word)
            #token length
            if len(tokenizer(' '.join(current))['input_ids']) >= max_tokens:
                chunks.append(' '.join(current))
                current = []
        if current:
            chunks.append(' '.join(current))
        return chunks

    try:
        chunks = chunk_text(article.text, summarizer_tokenizer, max_tokens=500)
        sentiment_scores = []
        sentiment_labels = []
        for chunk in chunks:
            try:
                sentiment_result = sentiment_analyzer(chunk)[0]
                sentiment_labels.append(sentiment_result["label"])
                sentiment_scores.append(sentiment_result["score"])
            except Exception as e:
                print("Sentiment chunk error:", e)
        if sentiment_scores:
            sentiment_score = sum(sentiment_scores) / len(sentiment_scores)
            #majority label
            from collections import Counter
            sentiment_label = Counter(sentiment_labels).most_common(1)[0][0]
        else:
            sentiment_label = "NEUTRAL"
            sentiment_score = 0.5
    except Exception as e:
        print("Sentiment analysis error:", e)
        sentiment_label = "NEUTRAL"
        sentiment_score = 0.5

    #bias
    bias_label, bias_score = detect_bias(article.text)

    #source credibility 
    source_cred, reputable_domains = estimate_source_credibility(article.text)

    #absurdity check
    is_absurd, absurd_reason = check_absurdity_ai(article.text)
    # Multi-chunk summarization for long articles
    def chunk_text(text,tokenizer,max_tokens=500):
        words =text.split()
        chunks = []
        current = []
        for word in words:
            current.append(word)
            if len(tokenizer(' '.join(current))['input_ids'])>=max_tokens:
                chunks.append(' '.join(current))
                current = []
        if current:
            chunks.append(' '.join(current))
        return chunks

    try:
        # 1. Split article into chunks
        sum_chunks = chunk_text(article.text, summarizer_tokenizer, max_tokens=500)
        chunk_summaries = []
        for chunk in sum_chunks:
            try:
                chunk_summary = summarizer(chunk, max_length=150, min_length=40, do_sample=False)[0]["summary_text"]
                chunk_summaries.append(chunk_summary)
            except Exception as e:
                print("Chunk summarization error:", e)
        if chunk_summaries:
            # 2. Combine chunk summaries and summarize again
            combined = ' '.join(chunk_summaries)
            try:
                final_summary = summarizer(combined, max_length=150, min_length=40, do_sample=False)[0]["summary_text"]
            except Exception as e:
                print("Final summary error:", e)
                final_summary = ' '.join(chunk_summaries)
            summary = final_summary
        else:
            summary = "Summary not available."
    except Exception as e:
        print("Summarization error:", e)
        summary = "Summary not available."

    
    # If a reputable domain is detected, always mark as trustworthy
    if reputable_domains:
        label = "trustworthy"
        color = "green"
    elif label == "trustworthy" and score > 0.7 and sentiment_label == "POSITIVE":
        color = "green"
    elif label == "untrustworthy" and score > 0.7 and sentiment_label == "NEGATIVE":
        color = "red"
    else:
        color = "yellow"

    # Privacy notice
    privacy = "No sensitive user data is stored. All analysis is performed in-memory."

    ai_warning = None
    if not reputable_domains:
        ai_warning = "AI model is being used to estimate trustworthiness. Results vary."

    tooltips = {
        "trustworthiness": "Overall assessment of the article's reliability based on AI analysis and source credibility.",
        "trust_score": "Confidence score (0-1) from the AI model about the article's trustworthiness. Higher is more trustworthy.",
        "color": "Visual indicator: green (trustworthy), red (untrustworthy), yellow (uncertain).",
        "bias": "Detected political bias of the article: left, center, or right.",
        "bias_score": "Confidence score (0-100) for the detected political bias.",
        "sentiment": "Overall sentiment of the article: POSITIVE, NEGATIVE, or NEUTRAL.",
        "sentiment_score": "Confidence score (0-1) for the sentiment analysis.",
        "reputable_sources": "List of reputable domains or sources detected in the article.",
        "ai_warning": "Warning if the article is not from a recognized reputable source.",
        "summary": "Short summary of the article generated by AI.",
        "privacy": "Information about privacy and data handling."
    }
    
    return {
        "trustworthiness": label,
        "trust_score": round(score, 2),
        "color": color,
        "bias": bias_label,
        "bias_score": bias_score,
        "sentiment": sentiment_label,
        "sentiment_score": round(sentiment_score, 2),
        "reputable_sources": reputable_domains,
        "ai_warning": ai_warning,
        "summary": summary,
        "privacy": privacy,
        "absurdity": {
            "is_absurd": is_absurd,
            "reason": absurd_reason
        },
        "tooltips": {
            **tooltips,
            "absurdity": "Flags if the article contains highly improbable, sensational, or nonsensical claims."
        }
    }

@app.get("/")
def read_root():
    return {"message": "API is working!"} #put this in to test if the API is working
