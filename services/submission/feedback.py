async def get_ai_feedback(code: str, inputs: list, outputs: list, groq) -> str:
    prompt = repr(
f"""
Please provide 1-2 sentences of feedback on the following code submission. ENSURE YOUR FEEDBACK IS
CONCISE, DIRECT, NO MORE THAN 2 SENTENCES, AND IN PLAIN TEXT.

Code:
{code}

Inputs:
{inputs}

Outputs:
{outputs}
""")
    response = await groq.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are an AI assistant helping to review code submissions."},
            {"role": "user", "content": prompt},
        ],
    )
    if response.choices[0].message.content is not None or isinstance(response.choices[0].message.content, str):
        return response.choices[0].message.content.strip()
    else:
        raise ValueError("Invalid response format from AI service")
