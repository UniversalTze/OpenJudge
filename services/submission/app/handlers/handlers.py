from flask import Flask, request, jsonify

import json
import traceback
import requests

from app.utils.queue import send_to_queue
from app.utils.validation import clean_code
from app.config import config
from app.models.models import db, Submission

def health():
    return "Submissions service operational", 200

def submit_code():
    """Process code submissions with validation and deduplication."""
    try:
        # Extract content from request
        data = request.get_json()
        if not data:
            return "Invalid JSON format", 400
        user_id = data.get("user_id")
        problem_id = data.get("problem_id")
        language = data.get("language", "").lower()
        code = data.get("code", "")
        if not all([user_id, problem_id, language, code]):
            return "Missing required parameters", 400
        if language not in ["python", "java"]:
            return "Unsupported language", 400

        try:
            clean_code(code, language)
        except ValueError as e:
            print(f"[Warn] Code cleaning failed: {e}")
            return jsonify({"error": str(e)}), 400

        # Deduplication check
        existing = Submission.query.filter_by(
            user_id=user_id, problem_id=problem_id, language=language, code=code
        ).first()
        if existing:
            print(f"[Warn] Duplicate submission detected: ID {existing.submission_id}")
            return (
                jsonify(
                    {
                        "error": "Duplicate submission detected",
                        "submission_id": existing.submission_id,
                    }
                ),
                409,
            )

        problem = None
        try:
            response = requests.get(config.PROBLEMS_SERVICE_URL + f"/problems/{problem_id}")
            response.raise_for_status() 
            problem = response.json()
        except requests.exceptions.RequestException as e:
            return jsonify({'error': str(e)}), 500

        if not problem:
            return jsonify({"error": "Problem not found"}), 404
        tests = json.load(problem.test_cases)
        inputs = [test["input"] for test in tests]
        outputs = [test["output"] for test in tests]

        # Create submission record
        submission = Submission(
            user_id=user_id,
            problem_id=problem_id,
            language=language,
            code=code,
            function_name=problem.function_name,
            status="queued",
            results=[],
        )
        db.session.add(submission)
        db.session.commit()
        print(f"[Info] Created submission record with ID {submission.submission_id}.")

        payload = {
            "submission_id": submission.submission_id,
            "submission_code": code,
            "inputs": inputs,
            "outputs": outputs,
            "function_name": problem.function_name,
        }
        queue_name = f"{language.lower()}q"

        # Enqueue processing task
        try:
            send_to_queue("process_submission", payload, queue_name)
            print(
                f"[Info] Enqueued submission {submission.submission_id} on queue '{queue_name}'."
            )
        except Exception as e:
            print(f"[Error] Failed to enqueue task: {e}")
            submission.status = "failed"
            db.session.commit()
            return "Failed to queue submission", 500

        return (
            jsonify(
                {
                    "submission_id": submission.submission_id,
                    "status": submission.status,
                }
            ),
            201,
        )

    except Exception as e:
        print(f"[Error] Unexpected error in submit_code: {e}\n{traceback.format_exc()}")
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

def submission_history(user_id):
    """Retrieve user's submission history."""
    try:
        subs = (
            Submission.query.filter_by(user_id=user_id)
            .order_by(Submission.updated_at.desc())
            .all()
        )

        if not subs:
            return jsonify([]), 200

        history = [
            {
                "problem_id": sub.problem_id,
                "language": sub.language,
                "code": sub.code,
                "results": sub.results,
                "submitted_at": sub.updated_at.isoformat() if sub.updated_at else None,
            }
            for sub in subs
        ]

        return jsonify(history), 200

    except Exception as e:
        print(f"[Error] Retrieving submission history for user {user_id} failed: {e}")
        return jsonify({"error": "Internal server error"}), 500

