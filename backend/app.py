from flask import Flask
from flask_cors import CORS
from .src.routes.test import test_bp

app = Flask(__name__)
CORS(app=app)

app.register_blueprint(test_bp)