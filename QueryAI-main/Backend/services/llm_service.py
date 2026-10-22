import os
import base64

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# ==================================================
# TEXT RESPONSE WITH CONVERSATION HISTORY
# ==================================================

def generate_response(
    user_message: str,
    conversation_history: list[dict] | None = None
) -> str:

    messages = []

    # --------------------------------------------------
    # Add previous conversation
    # --------------------------------------------------

    if conversation_history:
        messages.extend(
            conversation_history
        )

    # --------------------------------------------------
    # Add current user message
    # --------------------------------------------------

    messages.append(
        {
            "role": "user",
            "content": user_message
        }
    )

    # --------------------------------------------------
    # Generate response
    # --------------------------------------------------

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=messages,
    )

    return response.choices[0].message.content


# ==================================================
# IMAGE + TEXT RESPONSE
# ==================================================

def generate_image_response(
    user_message: str,
    image_bytes: bytes,
    content_type: str,
    conversation_history: list[dict] | None = None
) -> str:

    # --------------------------------------------------
    # Convert image bytes → base64
    # --------------------------------------------------

    base64_image = base64.b64encode(
        image_bytes
    ).decode("utf-8")


    # --------------------------------------------------
    # Build conversation history
    # --------------------------------------------------

    messages = []

    if conversation_history:
        messages.extend(
            conversation_history
        )


    # --------------------------------------------------
    # Add current image + question
    # --------------------------------------------------

    messages.append(
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": user_message
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": (
                            f"data:{content_type};base64,"
                            f"{base64_image}"
                        )
                    }
                }
            ]
        }
    )


    # --------------------------------------------------
    # Generate response
    # --------------------------------------------------

    response = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=messages,
    )

    return response.choices[0].message.content