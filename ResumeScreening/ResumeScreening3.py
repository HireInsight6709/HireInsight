import sys
import json
import google.generativeai as genai
import os
from dotenv import load_dotenv
import spacy
import fitz

# Load environment variables
load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""
    return text

def get_gemini_response(resume_text, job_description):
    prompt = f"""
    Imagine you are an advanced AI-powered Resume Screening System. Your task is to analyze the candidate's resume 
    against the provided job description. Evaluate the resume's relevance, skills, and overall alignment with the 
    role. Provide a rating out of 10 for the following criteria:

    *Evaluation:*
    - Overall Rating (out of 10): []
    - Relevance to Job Description (out of 10): []
    - Technical Skills Match (out of 10): []

    Resume:
    {resume_text}

    Job Description:
    {job_description}
    """
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error with Gemini API: {e}", file=sys.stderr)
        return "API request failed."

if __name__ == "__main__":
    # Expect two command-line arguments: PDF file path and job description (can be JSON string)
    if len(sys.argv) < 3:
        print("Usage: python script.py <pdf_path> <job_description>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    job_description = sys.argv[2]
#     job_description = """
#     Hi, We are looking for Candidates who are having experience as Gen AI Role.



# Experience Required: 5+ years.

# Location: PAN India

# Responsibilities:

# Design, develop, and deploy generative AI models

# Leveraging your expertise in Generative AI, Python, Machine Learning, Data Science, and Statistics to develop cutting-edge solutions for our clients.

# Utilizing NLP techniques, LangChain, and LLM's to develop conversational chatbots and language models tailored to our clients' needs.

# Collaborating with cross-functional teams to design and implement advanced AI models and algorithms.

# Providing technical expertise and thought leadership in the field of Generative AI and NLP to guide clients in adopting AI-driven solutions.

# Conducting data analysis, preprocessing, and modeling to extract valuable insights and drive data-driven decision-making.

# Staying up to date with the latest advancements in AI technologies, frameworks, and tools, and proactively learning and adopting new technologies to enhance our offerings.

# Demonstrating a strong understanding of cloud platforms, particularly GCP, for deploying AI applications.
#     """
    
    resume_text = extract_text_from_pdf(pdf_path)
    if not resume_text.strip():
        print(json.dumps({"error": "Failed to extract text from PDF"}))
        sys.exit(1)
    
    response_text = get_gemini_response(resume_text, job_description)
    print(json.dumps({"response": response_text}))
