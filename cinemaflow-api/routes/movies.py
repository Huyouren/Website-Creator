from flask import Blueprint, jsonify, request

from models import create_movie, delete_movie, get_movie, list_movies, serialize_movie, update_movie

movies_bp = Blueprint("movies", __name__, url_prefix="/api/movies")


@movies_bp.get("")
def get_movies():
    title = request.args.get("title")
    genre = request.args.get("genre")
    return jsonify(list_movies(title=title, genre=genre))


@movies_bp.get("/<int:movie_id>")
def get_movie_by_id(movie_id: int):
    movie = get_movie(movie_id)
    if movie is None:
        return jsonify({"message": f"movie {movie_id} not found"}), 404

    return jsonify(serialize_movie(movie))


@movies_bp.post("")
def create_movie_route():
    payload = request.get_json(silent=True) or {}
    try:
        movie = create_movie(payload)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    return jsonify(movie), 201


@movies_bp.put("/<int:movie_id>")
def update_movie_route(movie_id: int):
    payload = request.get_json(silent=True) or {}
    try:
        updated_movie = update_movie(movie_id, payload)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    if updated_movie is None:
        return jsonify({"message": f"movie {movie_id} not found"}), 404

    return jsonify(updated_movie)


@movies_bp.delete("/<int:movie_id>")
def delete_movie_route(movie_id: int):
    deleted = delete_movie(movie_id)
    if not deleted:
        return jsonify({"message": f"movie {movie_id} not found"}), 404

    return ("", 204)
