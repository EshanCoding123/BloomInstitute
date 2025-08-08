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

