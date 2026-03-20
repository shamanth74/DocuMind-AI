from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk
from app.models.document import Document


def get_relevant_chunks(db: Session, workspace_id: int, question: str, top_k: int = 5) -> list:
    """
    Retrieve the most relevant chunks for a question using keyword matching.
    Fetches only chunk_text (no full documents), ranks by keyword frequency.
    """

    # Fetch chunks for this workspace via efficient indexed join
    chunks = (
        db.query(DocumentChunk.chunk_text)
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(Document.workspace_id == workspace_id)
        .all()
    )

    if not chunks:
        return []

    # Extract meaningful keywords (lowercase, 3+ chars, no common stop words)
    stop_words = {"the", "and", "for", "are", "but", "not", "you", "all", "can", "was", "her", "his", "how", "its", "may", "this", "that", "what", "who", "which", "from", "with", "about"}
    keywords = [
        w.lower() for w in question.split()
        if len(w) >= 3 and w.lower() not in stop_words
    ]

    if not keywords:
        return [c.chunk_text for c in chunks[:top_k]]

    # Score each chunk by keyword frequency
    scored = []
    for chunk in chunks:
        text_lower = chunk.chunk_text.lower()
        score = sum(text_lower.count(kw) for kw in keywords)
        if score > 0:
            scored.append((score, chunk.chunk_text))

    if not scored:
        return [c.chunk_text for c in chunks[:top_k]]

    # Sort by score descending and return top_k
    scored.sort(key=lambda x: x[0], reverse=True)

    return [text for score, text in scored[:top_k]]
