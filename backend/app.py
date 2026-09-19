from flask import Flask
from flask_cors import CORS
from .src.routes.test import test_bp
from .src.routes.player_routes import player_bp
from .src.routes.scouting_routes import scouting_bp
from .src.routes.image_routes import image_bp
app = Flask(__name__)
CORS(app=app)

app.register_blueprint(test_bp)
app.register_blueprint(player_bp)
app.register_blueprint(scouting_bp)
app.register_blueprint(image_bp)