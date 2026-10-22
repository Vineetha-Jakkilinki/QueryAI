from services.llm_service import generate_response


response = generate_response(
    "Explain what artificial intelligence is in simple words."
)

print("\nAI RESPONSE:")
print(response)