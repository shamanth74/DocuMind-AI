"""
Text Chunker Utility

Basic text splitting for future use in RAG pipeline (Phase 2).
Not integrated into the query flow yet.
"""


def split_text_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """
    Split text into overlapping chunks.

    Args:
        text: The full text to split
        chunk_size: Max characters per chunk
        overlap: Number of overlapping characters between chunks

    Returns:
        List of text chunks
    """
    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap

    return chunks
