import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

BASE_URL = "https://www.thesportsdb.com/api/v1/json/3"
TIMEOUT = 3
MAX_WORKERS = 10

# in-memory caches, live for the process lifetime
_club_cache = {}
_player_cache = {}
_league_badge_cache = {}   # idLeague -> badge url

# TheSportsDB's free test key caps its bulk "list all leagues" endpoints at
# 5 results, which makes fuzzy name-matching against that list unreliable.
# Individual id lookups (lookupleague.php) aren't capped, so instead we use a
# curated map of verified idLeague values, covering this dataset's most
# common leagues. Anything not in this map simply resolves to no badge
# (icon fallback) rather than risk a wrong match.
#
# Keyed by this dataset's own `league_id` (not `league_name`) because several
# league_name strings collide across different real leagues, e.g. "Serie A"
# is both Italy (league_id 31) and Brazil (league_id 7), "Premier League" is
# both England (13) and Ukraine (332), "Bundesliga" is both Germany (19) and
# Austria (80), and "Pro League" is both Saudi Arabia (350) and UAE (2013).
# league_id is unique per real league, so it's the correct disambiguating key.
LEAGUE_ID_MAP = {
    "13": "4328",    # England Premier League
    "332": "4354",   # Ukraine Premier League
    "14": "4329",    # England Championship
    "53": "4335",    # Spain La Liga
    "19": "4331",    # Germany Bundesliga
    "80": "4621",    # Austria Bundesliga
    "20": "4399",    # Germany 2. Bundesliga
    "31": "4332",    # Italy Serie A
    "7": "4351",     # Brazil Serie A
    "32": "4394",    # Italy Serie B
    "16": "4334",    # France Ligue 1
    "17": "4401",    # France Ligue 2
    "10": "4337",    # Netherlands Eredivisie
    "308": "4344",   # Portugal Primeira Liga
    "39": "4346",    # USA Major League Soccer
    "68": "4339",    # Turkey Super Lig
    "4": "4338",     # Belgium Jupiler Pro League
    "350": "4668",   # Saudi Pro League
    "2013": "4678",  # UAE Pro League
    "66": "4422",    # Poland Ekstraklasa
    "56": "4347",    # Sweden Allsvenskan
    "60": "4396",    # England League One
    "61": "4397",    # England League Two
    "353": "4406",   # Argentina Liga Profesional
}


def normalize_name(name):
    if not name:
        return ""
    text = unicodedata.normalize("NFKD", str(name)).encode("ascii", "ignore").decode()
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9 ]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _safe_get(url, params):
    try:
        response = requests.get(url, params=params, timeout=TIMEOUT)
        if response.ok:
            return response.json()
    except requests.RequestException:
        pass
    return None


def resolve_club_badge(name):
    key = normalize_name(name)
    if not key:
        return None
    if key in _club_cache:
        return _club_cache[key]

    data = _safe_get(f"{BASE_URL}/searchteams.php", {"t": name})
    url = None
    if data and data.get("teams"):
        team = data["teams"][0]
        url = team.get("strBadge") or team.get("strLogo")

    _club_cache[key] = url
    return url


def resolve_player_photo(name):
    key = normalize_name(name)
    if not key:
        return None
    if key in _player_cache:
        return _player_cache[key]

    data = _safe_get(f"{BASE_URL}/searchplayers.php", {"p": name})
    url = None
    if data and data.get("player"):
        player = data["player"][0]
        url = player.get("strCutout") or player.get("strThumb")

    _player_cache[key] = url
    return url


def resolve_league_badge(dataset_league_id):
    if dataset_league_id is None or dataset_league_id == "":
        return None

    # dataset ids arrive as ints, floats (e.g. 13.0), or numeric strings
    key = str(dataset_league_id).strip()
    if key.endswith(".0"):
        key = key[:-2]

    sofifa_id = LEAGUE_ID_MAP.get(key)
    if not sofifa_id:
        return None

    if sofifa_id in _league_badge_cache:
        return _league_badge_cache[sofifa_id]

    data = _safe_get(f"{BASE_URL}/lookupleague.php", {"id": sofifa_id})
    url = None
    if data and data.get("leagues"):
        url = data["leagues"][0].get("strBadge")

    _league_badge_cache[sofifa_id] = url
    return url


def resolve_batch(clubs, leagues, players):
    def _dedupe(items):
        return list(dict.fromkeys(item for item in items if item))

    clubs = _dedupe(clubs)
    leagues = _dedupe(leagues)
    players = _dedupe(players)

    tasks = (
        [("clubs", name, resolve_club_badge) for name in clubs]
        + [("leagues", name, resolve_league_badge) for name in leagues]
        + [("players", name, resolve_player_photo) for name in players]
    )

    result = {"clubs": {}, "leagues": {}, "players": {}}
    if not tasks:
        return result

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        future_map = {
            pool.submit(fn, name): (bucket, name) for bucket, name, fn in tasks
        }
        for future in as_completed(future_map):
            bucket, name = future_map[future]
            try:
                result[bucket][name] = future.result()
            except Exception:
                result[bucket][name] = None

    return result
