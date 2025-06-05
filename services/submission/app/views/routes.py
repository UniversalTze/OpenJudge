from flask import Flask, Blueprint
from app.handlers.handlers import (
    health, submit_code, submission_history
)
from app.models.models import db

api = Blueprint("api", __name__, url_prefix='/api/v1')

# health
api.route("/health", methods=["GET"])(health)

# submissions
api.route("/submissions", methods=["POST"])(submit_code)
api.route("/submissions/history/<string:user_id>", methods=["GET"])(submission_history)

#### Error Handlers ####
@api.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return "Internal Server Error", 500


@api.errorhandler(404)
def not_found(error):
    return "Resource not found", 404
