import os

from groq import Groq
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.services.rag_service import get_relevant_chunks

load_dotenv()

_client = None


def _get_groq_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        _client = Groq(api_key=api_key)
    return _client


MAX_CONTEXT_LENGTH = 3000


def ask_question(db: Session, workspace_id: int, question: str) -> str:
    """Retrieve relevant chunks and send to Groq for answering."""

    chunks = get_relevant_chunks(db, workspace_id, question)

    if not chunks:
        return "No relevant information found in documents."

    # Combine top chunks with strict size limit
    context = ""
    for chunk in chunks:
        candidate = context + chunk + "\n\n"
        if len(candidate) > MAX_CONTEXT_LENGTH:
            break
        context = candidate

    if not context.strip():
        return "No relevant information found in documents."

    prompt = (
        "You are an AI assistant. Answer ONLY using the provided context.\n"
        "If the answer is not found, say 'Not found in documents'.\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{question}"
    )

    try:
        response = _get_groq_client().chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=300,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Unable to process your question at this time. Please try again later."
