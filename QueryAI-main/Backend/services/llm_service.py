import os
import base64

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# ==================================================
# TEXT RESPONSE
# ==================================================

def generate_response(
    user_message: str,
    conversation_history: list[dict] | None = None
) -> str:

    messages = []

    # --------------------------------------------------
    # Add controlled conversation context
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


# ==================================================
# SUMMARIZE OLDER CONVERSATION
# ==================================================

def summarize_conversation(
    conversation_history: list[dict]
) -> str:

    if not conversation_history:
        return ""


    # --------------------------------------------------
    # Convert messages to text
    # --------------------------------------------------

    messages_text = "\n".join(
        f"{message['role']}: {message['content']}"
        for message in conversation_history
    )


    # --------------------------------------------------
    # Safety limit
    # --------------------------------------------------

    messages_text = messages_text[-6000:]


    # --------------------------------------------------
    # Summary prompt
    # --------------------------------------------------

    prompt = f"""
Summarize the following older conversation for future
conversation context.

Keep only information that may be useful later.

Include:
- Important topics discussed
- Important questions asked
- Important answers or conclusions
- Important user requirements
- Important decisions
- Important information about uploaded documents

Do NOT include unnecessary wording.

Do NOT invent any information.

OLDER CONVERSATION:

{messages_text}

Return only a short summary.
"""


    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=400,
    )


    return response.choices[0].message.content