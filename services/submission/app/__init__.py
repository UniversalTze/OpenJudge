from flask import Flask
from app.config import config
from app.models.models import db, Submission

def create_app():
    app = Flask(__name__)
    
    # Database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = config.DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    
    # Ensure tables exist
    with app.app_context():
        try:
            db.create_all()
            db.session.commit()
            print("[Info] `submissions` table ensured.")
        except Exception as e:
            print(f"[Error] Failed to create tables: {e}")

    # Register the blueprints.
    from app.views.routes import api
    app.register_blueprint(api)
    return app