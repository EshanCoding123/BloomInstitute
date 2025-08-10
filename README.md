# BloomInstitute
Article Trustworthiness Chrome Extension V1

INFORMD project, which provides a text classification API for analyzing the trustworthiness of articles.
It uses a pre-trained NLP model to classify articles as "trustworthy" or "untrustworthy" based on their content.
The API is built using FastAPI and can be accessed via HTTP requests.
This code sets up the FastAPI application, defines the input model, and implements the classification endpoint
CORs middleware is included to allow cross-origin requests, making it suitable for web applications.

- does NOT work with PDFs or other file formats
- uses older version of Python (~3.12)
- uses a small list of reputable domains, which can be expanded as needed. if not part of this list, then it classifies by AI
- NLP classification
- includes: bias detection, trustworthiness, summarization, sentiment

This is a bit experimental, so it does not work with every case. However, it implements facebook mnli for absurdity and a fake news model trained on 40,000 data points to detect trustworthiness. For version 2, more model training and precision will be implemented. 

Note about server: I have created a google cloud server to run the backend, but it is giving me "400 Bad Request" errors even though my methods should've fixed the issue. It still works on the fastAPI website, but it just doesn't work with my frontend. Thus, in my instructions I will tell you how to open your own mini-server on your computer to run this application.

To test this code out (these instructions are for windows users ONLY, terminal steps may be a little different for Mac users):
1. Have python 3.12 installed on your computer and in PATH
2. Install all requirements using "pip install" in the terminal. All requirements are in requirements.txt
3. Download the repository
4. In the terminal, head to the folder location using "cd foldername" where foldername is the name of the folder containing all of the repo code
5. Type uvicorn main:app --reload in your terminal, which should launch the server on http://127.0.0.1:8000/. 
6. Now keep the terminal open and click to analyze the trustworthiness of any article!

Here are some articles and text phrases to test out:
https://docs.google.com/document/d/1zj6fv4CmbIbP7rbjVSTFu0OzWBEsC7GNRazNKhgygcU/edit?usp=sharing
- To test it out with fastAPI /docs website, type the text in the quotes that say "String", not "text."
- The first request may take a bit of time because the server will have to start up. You can also copy paste article text into there to get the output
