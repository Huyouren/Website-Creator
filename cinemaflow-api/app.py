from flask import Flask, jsonify
from flask_cors import CORS

from routes import directors_bp, movies_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_AS_ASCII"] = False

    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:4200"}},
    )

    app.register_blueprint(movies_bp)
    app.register_blueprint(directors_bp)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
