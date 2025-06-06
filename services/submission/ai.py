


def get_ai_feedback(code: str, inputs: list, outputs: list) -> dict:
    prompt = repr(
f"""You are an AI assistant helping to review code submissions.
Please provide 1-2 sentences of feedback on the following code submission. ENSURE YOUR FEEDBACK IS
CONCISE, DIRECT, NO MORE THAN 2 SENTENCES, AND IN PLAIN TEXT.

Code:
{code}

Inputs:
{inputs}

Outputs:
{outputs}
"""
    )