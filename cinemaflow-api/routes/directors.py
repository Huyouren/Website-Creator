from flask import Blueprint, jsonify, request

from models import (
    create_director,
    delete_director,
    get_director,
    list_directors,
    list_movies_for_director,
    serialize_director,
)

directors_bp = Blueprint("directors", __name__, url_prefix="/api/directors")


@directors_bp.get("")
def get_directors():
    return jsonify(list_directors())


@directors_bp.get("/<int:director_id>")
def get_director_by_id(director_id: int):
    director = get_director(director_id)
    if director is None:
        return jsonify({"message": f"director {director_id} not found"}), 404

    return jsonify(serialize_director(director))


@directors_bp.get("/<int:director_id>/movies")
def get_movies_by_director(director_id: int):
    director = get_director(director_id)
    if director is None:
        return jsonify({"message": f"director {director_id} not found"}), 404

    return jsonify(list_movies_for_director(director_id))


@directors_bp.post("")
def create_director_route():
    payload = request.get_json(silent=True) or {}
    try:
        director = create_director(payload)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    return jsonify(director), 201


@directors_bp.delete("/<int:director_id>")
def delete_director_route(director_id: int):
    try:
        delete_director(director_id)
    except LookupError as exc:
        return jsonify({"message": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    return ("", 204)
