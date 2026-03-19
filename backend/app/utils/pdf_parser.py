import fitz  # PyMuPDF


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF. Returns empty string if extraction fails."""

    text = ""

    doc = fitz.open(stream=file_bytes, filetype="pdf")

    for page in doc:
        text += page.get_text()

    doc.close()

    return text.strip()
