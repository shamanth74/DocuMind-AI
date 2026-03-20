import re

MIN_CHUNK_WORDS = 20


def split_text_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """
    Split text into overlapping word-based chunks, preserving sentence boundaries.

    Args:
        text: The full text to split
        chunk_size: Target number of words per chunk
        overlap: Number of overlapping words between chunks

    Returns:
        List of text chunks (filtered to remove tiny fragments)
    """
    if not text or not text.strip():
        return []

    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())

    chunks = []
    current_chunk = []
    current_word_count = 0

    for sentence in sentences:
        sentence_words = sentence.split()
        sentence_len = len(sentence_words)

        if current_word_count + sentence_len > chunk_size and current_chunk:
            # Save current chunk
            chunks.append(" ".join(current_chunk))

            # Calculate overlap: keep last `overlap` words
            overlap_words = current_chunk[-overlap:] if len(current_chunk) >= overlap else current_chunk[:]
            current_chunk = overlap_words
            current_word_count = len(current_chunk)

        current_chunk.extend(sentence_words)
        current_word_count += sentence_len

    # Don't forget the last chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    # Filter out tiny chunks (overlap-only fragments)
    return [c for c in chunks if len(c.split()) >= MIN_CHUNK_WORDS]

