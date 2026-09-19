import os

from .app import app

if __name__ == "__main__":
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    port = int(os.environ.get("PORT", 6050))
    host = os.environ.get("HOST", "127.0.0.1")
    app.run(debug=debug, host=host, port=port)
