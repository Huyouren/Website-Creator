from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

DIRECTORS = [
    {
        "id": 1,
        "name": "Frank Darabont",
        "nationality": "美国",
        "birthYear": 1959,
        "bio": "以细腻的人性刻画和文学改编见长，代表作包括《The Shawshank Redemption》《The Green Mile》。",
    },
    {
        "id": 2,
        "name": "Hayao Miyazaki",
        "nationality": "日本",
        "birthYear": 1941,
        "bio": "吉卜力工作室代表人物，以童话想象力与环保主题塑造了多部经典动画长片。",
    },
    {
        "id": 3,
        "name": "Christopher Nolan",
        "nationality": "英国 / 美国",
        "birthYear": 1970,
        "bio": "擅长非线性叙事、时间结构和大银幕奇观，是当代最具辨识度的作者导演之一。",
    },
    {
        "id": 4,
        "name": "Bong Joon-ho",
        "nationality": "韩国",
        "birthYear": 1969,
        "bio": "以类型混搭、社会批判和黑色幽默闻名，作品常在娱乐性与现实议题之间取得平衡。",
    },
    {
        "id": 5,
        "name": "George Miller",
        "nationality": "澳大利亚",
        "birthYear": 1945,
        "bio": "《Mad Max》系列缔造者，擅长打造节奏凌厉、视觉调度极强的动作电影。",
    },
    {
        "id": 6,
        "name": "Damien Chazelle",
        "nationality": "美国",
        "birthYear": 1985,
        "bio": "以音乐、青春与理想主义题材见长，镜头语言充满节奏感与舞台感。",
    },
]

MOVIES = [
    {
        "id": 1,
        "title": "The Shawshank Redemption",
        "releaseDate": "1994-09-23T00:00:00.000Z",
        "director": "Frank Darabont",
        "directorId": 1,
        "genre": "剧情",
        "rating": 9.7,
        "isWatched": True,
        "posterUrl": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        "comments": [],
    },
    {
        "id": 2,
        "title": "Spirited Away",
        "releaseDate": "2001-07-20T00:00:00.000Z",
        "director": "Hayao Miyazaki",
        "directorId": 2,
        "genre": "动画",
        "rating": 9.2,
        "isWatched": True,
        "posterUrl": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        "comments": [],
    },
    {
        "id": 3,
        "title": "Interstellar",
        "releaseDate": "2014-11-07T00:00:00.000Z",
        "director": "Christopher Nolan",
        "directorId": 3,
        "genre": "科幻",
        "rating": 9.0,
        "isWatched": False,
        "posterUrl": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "comments": [],
    },
    {
        "id": 4,
        "title": "Parasite",
        "releaseDate": "2019-05-30T00:00:00.000Z",
        "director": "Bong Joon-ho",
        "directorId": 4,
        "genre": "武侠",
        "rating": 8.8,
        "isWatched": True,
        "posterUrl": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        "comments": [],
    },
    {
        "id": 5,
        "title": "Mad Max: Fury Road",
        "releaseDate": "2015-05-15T00:00:00.000Z",
        "director": "George Miller",
        "directorId": 5,
        "genre": "动作",
        "rating": 8.5,
        "isWatched": False,
        "posterUrl": "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
        "comments": [],
    },
    {
        "id": 6,
        "title": "La La Land",
        "releaseDate": "2016-12-09T00:00:00.000Z",
        "director": "Damien Chazelle",
        "directorId": 6,
        "genre": "剧情",
        "rating": 8.1,
        "isWatched": True,
        "posterUrl": "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        "comments": [],
    },
]

next_movie_id = max((movie["id"] for movie in MOVIES), default=0) + 1
next_director_id = max((director["id"] for director in DIRECTORS), default=0) + 1


def _ensure_iso(value: Any) -> str:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        except ValueError:
            return value

    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def serialize_comment(comment: dict[str, Any]) -> dict[str, Any]:
    cloned = deepcopy(comment)
    cloned["createdAt"] = _ensure_iso(cloned.get("createdAt"))
    return cloned


def serialize_movie(movie: dict[str, Any]) -> dict[str, Any]:
    cloned = deepcopy(movie)
    cloned["releaseDate"] = _ensure_iso(cloned.get("releaseDate"))
    cloned["comments"] = [serialize_comment(comment) for comment in cloned.get("comments", [])]
    return cloned


def serialize_director(director: dict[str, Any]) -> dict[str, Any]:
    return deepcopy(director)


def list_movies(title: str | None = None, genre: str | None = None) -> list[dict[str, Any]]:
    filtered_movies = MOVIES

    if title:
        lowered_title = title.strip().lower()
        filtered_movies = [
            movie for movie in filtered_movies if lowered_title in movie["title"].lower()
        ]

    if genre:
        lowered_genre = genre.strip().lower()
        filtered_movies = [
            movie for movie in filtered_movies if movie["genre"].lower() == lowered_genre
        ]

    return [serialize_movie(movie) for movie in sorted(filtered_movies, key=lambda item: item["id"])]


def list_directors() -> list[dict[str, Any]]:
    return [serialize_director(director) for director in sorted(DIRECTORS, key=lambda item: item["id"])]


def list_movies_for_director(director_id: int) -> list[dict[str, Any]]:
    return [serialize_movie(movie) for movie in MOVIES if movie["directorId"] == director_id]


def get_movie(movie_id: int) -> dict[str, Any] | None:
    return next((movie for movie in MOVIES if movie["id"] == movie_id), None)


def get_director(director_id: int) -> dict[str, Any] | None:
    return next((director for director in DIRECTORS if director["id"] == director_id), None)


def normalize_comment(comment: dict[str, Any], fallback_id: int) -> dict[str, Any]:
    return {
        "id": int(comment.get("id", fallback_id)),
        "userId": str(comment.get("userId", "guest")).strip() or "guest",
        "userName": str(comment.get("userName", "Guest")).strip() or "Guest",
        "content": str(comment.get("content", "")).strip(),
        "rating": float(comment.get("rating", 0)),
        "likes": int(comment.get("likes", 0)),
        "createdAt": _ensure_iso(comment.get("createdAt")),
    }


def build_movie_payload(
    payload: dict[str, Any], existing: dict[str, Any] | None = None
) -> dict[str, Any]:
    base = deepcopy(existing) if existing else {
        "title": "",
        "releaseDate": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "director": "",
        "directorId": 0,
        "genre": "未分类",
        "rating": 0,
        "isWatched": False,
        "posterUrl": "",
        "comments": [],
    }

    title = str(payload.get("title", base["title"])).strip()
    if not title:
        raise ValueError("title is required")

    director_id_raw = payload.get("directorId", base["directorId"])
    try:
        director_id = int(director_id_raw)
    except (TypeError, ValueError) as exc:
        raise ValueError("directorId must be a number") from exc

    director = get_director(director_id)
    if director_id and director is None:
        raise ValueError("directorId does not exist")

    director_name = str(payload.get("director", base["director"])).strip()
    if director is not None and not director_name:
        director_name = director["name"]

    rating_raw = payload.get("rating", base["rating"])
    try:
        rating = float(rating_raw)
    except (TypeError, ValueError) as exc:
        raise ValueError("rating must be a number") from exc

    is_watched_raw = payload.get("isWatched", base["isWatched"])
    if isinstance(is_watched_raw, bool):
        is_watched = is_watched_raw
    elif isinstance(is_watched_raw, str):
        is_watched = is_watched_raw.strip().lower() in {"true", "1", "yes"}
    else:
        is_watched = bool(is_watched_raw)

    comments_payload = payload.get("comments", deepcopy(base.get("comments", [])))
    if comments_payload is None:
        comments_payload = []
    if not isinstance(comments_payload, list):
        raise ValueError("comments must be an array")

    return {
        **base,
        "title": title,
        "releaseDate": _ensure_iso(payload.get("releaseDate", base["releaseDate"])),
        "director": director_name,
        "directorId": director_id,
        "genre": str(payload.get("genre", base["genre"])).strip() or "未分类",
        "rating": rating,
        "isWatched": is_watched,
        "posterUrl": str(payload.get("posterUrl", base["posterUrl"])).strip(),
        "comments": [
            normalize_comment(comment, index)
            for index, comment in enumerate(comments_payload, start=1)
        ],
    }


def build_director_payload(
    payload: dict[str, Any], existing: dict[str, Any] | None = None
) -> dict[str, Any]:
    base = deepcopy(existing) if existing else {
        "name": "",
        "nationality": "",
        "birthYear": datetime.now().year,
        "bio": "",
    }

    name = str(payload.get("name", base["name"])).strip()
    if not name:
        raise ValueError("name is required")

    try:
        birth_year = int(payload.get("birthYear", base["birthYear"]))
    except (TypeError, ValueError) as exc:
        raise ValueError("birthYear must be a number") from exc

    return {
        **base,
        "name": name,
        "nationality": str(payload.get("nationality", base["nationality"])).strip(),
        "birthYear": birth_year,
        "bio": str(payload.get("bio", base["bio"])).strip(),
    }


def create_movie(payload: dict[str, Any]) -> dict[str, Any]:
    global next_movie_id

    movie = build_movie_payload(payload)
    movie["id"] = next_movie_id
    next_movie_id += 1
    MOVIES.append(movie)
    return serialize_movie(movie)


def update_movie(movie_id: int, payload: dict[str, Any]) -> dict[str, Any] | None:
    movie = get_movie(movie_id)
    if movie is None:
        return None

    updated_movie = build_movie_payload(payload, existing=movie)
    updated_movie["id"] = movie_id
    movie_index = MOVIES.index(movie)
    MOVIES[movie_index] = updated_movie
    return serialize_movie(updated_movie)


def delete_movie(movie_id: int) -> bool:
    movie = get_movie(movie_id)
    if movie is None:
        return False

    MOVIES.remove(movie)
    return True


def create_director(payload: dict[str, Any]) -> dict[str, Any]:
    global next_director_id

    director = build_director_payload(payload)
    director["id"] = next_director_id
    next_director_id += 1
    DIRECTORS.append(director)
    return serialize_director(director)


def delete_director(director_id: int) -> None:
    director = get_director(director_id)
    if director is None:
        raise LookupError(f"director {director_id} not found")

    if any(movie["directorId"] == director_id for movie in MOVIES):
        raise ValueError("director still has linked movies")

    DIRECTORS.remove(director)
