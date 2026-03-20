import os

from groq import Groq
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.models.document import Document

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


MAX_CONTEXT_LENGTH = 4000


def get_workspace_context(db: Session, workspace_id: int) -> str:
    """Fetch all documents for a workspace and combine content, truncated to max size."""

    documents = (
        db.query(Document.content)
        .filter(Document.workspace_id == workspace_id)
        .all()
    )

    if not documents:
        return ""

    combined = ""
    for doc in documents:
        if doc.content:
            combined += doc.content + "\n\n"
        if len(combined) >= MAX_CONTEXT_LENGTH:
            break

    return combined[:MAX_CONTEXT_LENGTH]


def ask_question(db: Session, workspace_id: int, question: str) -> str:
    """Send question + document context to Groq and return the answer."""

    context = get_workspace_context(db, workspace_id)

    if not context.strip():
        return "No documents found in this workspace."

    prompt = (
        "Answer the question ONLY using the provided documents.\n"
        "If the answer is not found, say 'Not found in documents'.\n\n"
        f"Documents:\n{context}\n\n"
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
        return f"AI error: {str(e)}"
