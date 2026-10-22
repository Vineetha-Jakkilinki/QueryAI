
import os
import uuid

import psycopg2
from pgvector.psycopg2 import register_vector

from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredPowerPointLoader,
)

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

from langchain_huggingface import (
    HuggingFaceEmbeddings
)

from langchain_core.documents import Document


# ==================================================
# DATABASE
# ==================================================

DATABASE_URL = os.getenv("DATABASE_URL")


if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured in the environment."
    )


# ==================================================
# EMBEDDING MODEL
# ==================================================

_embedding_model = None


def get_embedding_model():

    global _embedding_model

    if _embedding_model is None:

        print(
            "Loading HuggingFace embedding model..."
        )

        _embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        print(
            "HuggingFace embedding model loaded."
        )

    return _embedding_model


# ==================================================
# GENERATE DOCUMENT ID
# ==================================================

def generate_document_id() -> str:

    return str(uuid.uuid4())


# ==================================================
# GET DATABASE CONNECTION
# ==================================================

def get_db_connection():

    connection = psycopg2.connect(
        DATABASE_URL
    )

    register_vector(connection)

    return connection


# ==================================================
# DOCUMENT → TEXT → CHUNKS
# ==================================================

def process_document(
    file_path: str,
    file_type: str
):

    # ==================================================
    # 1. SELECT DOCUMENT LOADER
    # ==================================================

    if file_type == "pdf":

        loader = PyPDFLoader(
            file_path
        )

    elif file_type == "docx":

        loader = Docx2txtLoader(
            file_path
        )

    elif file_type == "pptx":

        loader = UnstructuredPowerPointLoader(
            file_path
        )

    else:

        raise ValueError(
            f"Unsupported document type: {file_type}"
        )


    # ==================================================
    # 2. LOAD DOCUMENT
    # ==================================================

    documents = loader.load()


    # ==================================================
    # 3. SPLIT INTO CHUNKS
    # ==================================================

    text_splitter = RecursiveCharacterTextSplitter(

        chunk_size=1000,

        chunk_overlap=150,
    )


    chunks = text_splitter.split_documents(
        documents
    )


    return chunks


# ==================================================
# PDF → TEXT → CHUNKS
#
# KEPT FOR BACKWARD COMPATIBILITY
# ==================================================

def process_pdf(
    file_path: str
):

    return process_document(
        file_path=file_path,
        file_type="pdf"
    )


# ==================================================
# CREATE VECTOR STORE
#
# Neon PostgreSQL + pgvector
# ==================================================

def create_vector_store(
    chunks,
    document_id: str
):

    if not chunks:

        raise ValueError(
            "No document chunks were created."
        )


    # ==================================================
    # 1. EXTRACT TEXT
    # ==================================================

    texts = [

        chunk.page_content

        for chunk in chunks

        if chunk.page_content
        and chunk.page_content.strip()
    ]


    if not texts:

        raise ValueError(
            "Document does not contain readable text."
        )


    # ==================================================
    # 2. CREATE EMBEDDINGS
    # ==================================================

    embedding_model = get_embedding_model()

    embeddings = embedding_model.embed_documents(
        texts
    )


    # ==================================================
    # 3. CONNECT TO NEON
    # ==================================================

    connection = get_db_connection()

    cursor = connection.cursor()


    try:

        # ==================================================
        # 4. INSERT CHUNKS + EMBEDDINGS
        # ==================================================

        for text, embedding in zip(
            texts,
            embeddings
        ):

            cursor.execute(
                """
                INSERT INTO document_chunks
                (
                    document_id,
                    content,
                    embedding
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    document_id,
                    text,
                    embedding
                )
            )


        # ==================================================
        # 5. COMMIT
        # ==================================================

        connection.commit()


        print(
            f"Stored {len(texts)} chunks "
            f"for document {document_id}"
        )


    except Exception:

        connection.rollback()

        raise


    finally:

        cursor.close()

        connection.close()


    # ==================================================
    # RETURN SIMPLE VECTOR STORE OBJECT
    # ==================================================

    return NeonVectorStore(
        document_id=document_id
    )


# ==================================================
# NEON VECTOR STORE
# ==================================================

class NeonVectorStore:

    def __init__(
        self,
        document_id: str
    ):

        self.document_id = document_id


    # ==================================================
    # SIMILARITY SEARCH
    # ==================================================

    def similarity_search(
        self,
        query: str,
        k: int = 3
    ):

        # ==================================================
        # 1. CREATE QUERY EMBEDDING
        # ==================================================

        embedding_model = get_embedding_model()

        query_embedding = (
            embedding_model.embed_query(
                query
            )
        )


        # ==================================================
        # 2. CONNECT TO NEON
        # ==================================================

        connection = get_db_connection()

        cursor = connection.cursor()


        try:

            # ==================================================
            # 3. COSINE SIMILARITY SEARCH
            # ==================================================

            cursor.execute(
                """
                SELECT
                    content,
                    document_id
                FROM document_chunks
                WHERE document_id = %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (
                    self.document_id,
                    query_embedding,
                    k
                )
            )


            rows = cursor.fetchall()


        finally:

            cursor.close()

            connection.close()


        # ==================================================
        # 4. CONVERT RESULTS TO LANGCHAIN DOCUMENTS
        # ==================================================

        documents = []


        for content, document_id in rows:

            documents.append(

                Document(

                    page_content=content,

                    metadata={
                        "document_id": document_id
                    }
                )
            )


        return documents


# ==================================================
# LOAD EXISTING VECTOR STORE
# ==================================================

def get_vector_store(
    document_id: str
):

    return NeonVectorStore(
        document_id=document_id
    )


# ==================================================
# SEARCH DOCUMENT
# ==================================================

def search_document(
    vector_store,
    query: str,
    k: int = 3
):

    results = vector_store.similarity_search(

        query,

        k=k
    )


    return results


# ==================================================
# GET RELEVANT DOCUMENT TEXT
# ==================================================

def get_relevant_context(
    document_id: str,
    query: str,
    k: int = 3
) -> str:

    # ==================================================
    # 1. LOAD VECTOR STORE
    # ==================================================

    vector_store = get_vector_store(
        document_id
    )


    # ==================================================
    # 2. SEARCH RELEVANT CHUNKS
    # ==================================================

    results = search_document(

        vector_store,

        query,

        k=k
    )


    # ==================================================
    # 3. COMBINE CHUNKS
    # ==================================================

    context = "\n\n".join(

        document.page_content

        for document in results
    )


    return context
