# Informed Version 1
Article Trustworthiness Chrome Extension V1

INFORMD project, which provides a text classification API for analyzing the trustworthiness of articles.
It uses a pre-trained NLP model to classify articles as "trustworthy" or "untrustworthy" based on their content.
The API is built using FastAPI and can be accessed via HTTP requests.
This code sets up the FastAPI application, defines the input model, and implements the classification endpoint
CORs middleware is included to allow cross-origin requests, making it suitable for web applications.

- does NOT work with PDFs or other file formats
- CORs middleware is configured for TESTING ONLY -- it is set to allow requests from anyone, not just this specific chrome extension. If scaled, this can be changed with one line of code
- uses older version of Python (~3.12)
- uses a small list of reputable domains, which can be expanded as needed. if not part of this list, then it classifies by AI
- NLP classification
- includes: bias detection, trustworthiness, summarization, sentiment

This is a bit experimental, so it does not work with every case. However, it implements facebook mnli for absurdity and a fake news model trained on 40,000 data points to detect trustworthiness. For version 2, more model training and precision will be implemented. 

Note about server: I've tested and google cloud works perfectly fine for this too. If it is scaled, I can definitely implement a google cloud server to handle requests.

To test this code out (these instructions are for windows users ONLY, terminal steps may be a little different for Mac users):
1. Have python 3.12 installed on your computer and in PATH
2. Install all requirements using "pip install" in the terminal. All requirements are in requirements.txt
3. Download the repository
4. In the terminal, head to the folder location using "cd foldername" where foldername is the name of the folder. -> terminal.png
5. Type uvicorn main:app --reload in your terminal, which should launch the server on http://127.0.0.1:8000/. -> terminal.png
6. On google chrome, go to chrome extension developer dashboard and upload an "unpacked" extension. Head to the repository folder and load the "extension" folder only.  -> import.png
7. Now, if you refresh, the button should pop up on articles, and you can also pin the extension to see the icon on the top right corner. -> icon.png
8. Now keep the terminal open and click to analyze the trustworthiness of any article! -> example.png

If you are having trouble, open the "howtosetup" folder for screenshots of the steps

Here are some articles and text phrases to test out:
https://docs.google.com/document/d/1zj6fv4CmbIbP7rbjVSTFu0OzWBEsC7GNRazNKhgygcU/edit?usp=sharing
- To test it out with fastAPI /docs website, type the text in the quotes that say "String", not "text."
- The first request may take a bit of time because the server will have to start up. You can also copy paste article text into there to get the output
