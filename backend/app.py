import json
import re
import sqlite3
from datetime import datetime
from pathlib import Path

import nltk
from flask import Flask, jsonify, request
from flask_cors import CORS
from nltk.corpus import stopwords
from nltk.tokenize import wordpunct_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "tripcraft.db"

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

DESTINATIONS = [
    {"name":"Manali","region":"Himachal Pradesh","type":"Mountain town","description":"Peaceful Himalayan hill station with pine forests, snow-capped mountain views, rivers, scenic valleys and fresh air.","attractions":["Solang Valley","Hadimba Temple","Old Manali","Beas River"],"activities":["hiking","paragliding","nature walks","mountain sightseeing"],"daily_cost":1800,"min_days":3,"themes":["mountains","nature","adventure","relaxation"]},
    {"name":"Shimla","region":"Himachal Pradesh","type":"Hill station","description":"Classic hill station with colonial architecture, mountain views, shopping streets, pine forests and relaxed walks.","attractions":["The Ridge","Mall Road","Kufri","Jakhoo Temple"],"activities":["walking","sightseeing","shopping","nature"],"daily_cost":1600,"min_days":2,"themes":["mountains","relaxation","culture","nature"]},
    {"name":"Dharamshala","region":"Himachal Pradesh","type":"Mountain retreat","description":"Calm mountain destination with Tibetan culture, monasteries, forest trails, cafes and views of the Dhauladhar range.","attractions":["McLeod Ganj","Namgyal Monastery","Bhagsu Waterfall","Dal Lake"],"activities":["short treks","meditation","culture walks","waterfall visits"],"daily_cost":1500,"min_days":2,"themes":["mountains","culture","relaxation","nature"]},
    {"name":"Rishikesh","region":"Uttarakhand","type":"River town","description":"Ganges-side destination combining yoga, spiritual sites, forest scenery, river views and outdoor adventure activities.","attractions":["Lakshman Jhula area","Triveni Ghat","Neer Garh Waterfall","Beatles Ashram"],"activities":["river rafting","yoga","hiking","meditation"],"daily_cost":1400,"min_days":2,"themes":["adventure","nature","spirituality","relaxation"]},
    {"name":"Jaipur","region":"Rajasthan","type":"Historic city","description":"Colourful heritage city known for royal palaces, forts, traditional markets, architecture, local crafts and Rajasthani food.","attractions":["Amber Fort","Hawa Mahal","City Palace","Jantar Mantar"],"activities":["heritage walks","shopping","food tours","photography"],"daily_cost":1700,"min_days":2,"themes":["history","culture","architecture","food"]},
    {"name":"Goa","region":"Goa","type":"Beach destination","description":"Coastal escape with sandy beaches, sunsets, Portuguese heritage, seafood, lively nightlife and water sports.","attractions":["Palolem Beach","Fort Aguada","Fontainhas","Dudhsagar area"],"activities":["swimming","kayaking","beach walks","water sports"],"daily_cost":2200,"min_days":3,"themes":["beaches","adventure","relaxation","nightlife"]},
    {"name":"Udaipur","region":"Rajasthan","type":"Lake city","description":"Romantic and relaxed city with lakes, hilltop views, ornate palaces, old streets, boat rides and traditional art.","attractions":["Lake Pichola","City Palace","Fateh Sagar Lake","Bagore Ki Haveli"],"activities":["boat rides","heritage walks","photography","local shopping"],"daily_cost":1900,"min_days":2,"themes":["culture","history","relaxation","architecture"]},
    {"name":"Mussoorie","region":"Uttarakhand","type":"Hill station","description":"Green hill station with misty mountain views, waterfalls, forest paths, viewpoints and a peaceful cool climate.","attractions":["Kempty Falls","Gun Hill","Landour","Camel's Back Road"],"activities":["nature walks","viewpoint visits","hiking","photography"],"daily_cost":1600,"min_days":2,"themes":["mountains","nature","relaxation","hiking"]},
    {"name":"Amritsar","region":"Punjab","type":"Cultural city","description":"Welcoming cultural destination famous for the Golden Temple, Sikh heritage, lively markets and Punjabi cuisine.","attractions":["Golden Temple","Jallianwala Bagh","Wagah Border","Partition Museum"],"activities":["heritage visits","food walks","shopping","history tours"],"daily_cost":1300,"min_days":2,"themes":["culture","history","food","spirituality"]},
    {"name":"Srinagar","region":"Jammu and Kashmir","type":"Lake and mountain destination","description":"Scenic Himalayan city with Dal Lake houseboats, gardens, mountain backdrops, traditional crafts and calm waters.","attractions":["Dal Lake","Mughal Gardens","Shankaracharya Temple","Hazratbal"],"activities":["shikara rides","garden walks","photography","local crafts"],"daily_cost":2400,"min_days":3,"themes":["mountains","nature","relaxation","culture"]},
    {"name":"Jaisalmer","region":"Rajasthan","type":"Desert city","description":"Golden sandstone city with a living fort, desert dunes, historic havelis, folk music and camel safari experiences.","attractions":["Jaisalmer Fort","Sam Sand Dunes","Patwon Ki Haveli","Gadisar Lake"],"activities":["camel safari","desert camping","heritage walks","stargazing"],"daily_cost":2000,"min_days":2,"themes":["desert","history","culture","adventure"]},
    {"name":"Pondicherry","region":"Puducherry","type":"Coastal town","description":"Relaxed coastal town with French-style streets, colourful cafes, seaside promenades, art spaces and quiet beaches.","attractions":["Promenade Beach","White Town","Auroville","Basilica of the Sacred Heart"],"activities":["cycling","cafe hopping","beach walks","architecture walks"],"daily_cost":1800,"min_days":2,"themes":["beaches","relaxation","culture","food"]},
    {"name":"Munnar","region":"Kerala","type":"Tea hill station","description":"Quiet green hill destination with rolling tea plantations, misty peaks, waterfalls, wildlife and winding scenic roads.","attractions":["Tea Museum","Eravikulam National Park","Mattupetty Dam","Top Station"],"activities":["plantation walks","hiking","wildlife spotting","photography"],"daily_cost":1900,"min_days":3,"themes":["nature","mountains","relaxation","wildlife"]},
    {"name":"Ooty","region":"Tamil Nadu","type":"Hill station","description":"Cool-weather hill retreat with botanical gardens, tea estates, lakes, wooded hills and scenic train journeys.","attractions":["Botanical Gardens","Ooty Lake","Doddabetta Peak","Nilgiri Mountain Railway"],"activities":["boating","nature walks","train rides","tea tasting"],"daily_cost":1700,"min_days":2,"themes":["nature","mountains","relaxation","family"]},
    {"name":"Hampi","region":"Karnataka","type":"Historic ruins","description":"Atmospheric UNESCO heritage landscape with ancient temples, stone monuments, boulder hills and cycling routes.","attractions":["Virupaksha Temple","Vittala Temple","Hampi Bazaar","Matanga Hill"],"activities":["cycling","history walks","sunrise hikes","photography"],"daily_cost":1500,"min_days":2,"themes":["history","culture","architecture","adventure"]},
    {"name":"Darjeeling","region":"West Bengal","type":"Himalayan hill town","description":"Himalayan town known for tea gardens, sunrise mountain panoramas, heritage railways and relaxed hillside cafes.","attractions":["Tiger Hill","Batasia Loop","Darjeeling Himalayan Railway","Tea gardens"],"activities":["tea tasting","scenic train rides","hiking","photography"],"daily_cost":1800,"min_days":3,"themes":["mountains","nature","culture","relaxation"]},
    {"name":"Varkala","region":"Kerala","type":"Cliffside beach town","description":"Laid-back seaside destination with dramatic cliffs, golden beaches, cafes, yoga studios and ocean sunsets.","attractions":["Varkala Cliff","Papanasam Beach","Janardanaswamy Temple","Kappil Beach"],"activities":["swimming","yoga","surfing lessons","sunset walks"],"daily_cost":1700,"min_days":2,"themes":["beaches","relaxation","adventure","nature"]},
    {"name":"Kaziranga","region":"Assam","type":"Wildlife destination","description":"Wildlife-rich grassland landscape known for rhinos, wetlands, birdlife, forest edges and guided nature experiences.","attractions":["Central Range","Western Range","Brahmaputra river areas","Local tea gardens"],"activities":["wildlife safari","birdwatching","nature photography","village visits"],"daily_cost":2300,"min_days":2,"themes":["wildlife","nature","adventure","photography"]},
    {"name":"Khajuraho","region":"Madhya Pradesh","type":"Heritage town","description":"Historic destination featuring intricately carved temples, stone sculpture, architecture, quiet lanes and cultural history.","attractions":["Western Group of Temples","Eastern Group of Temples","Archaeological Museum","Raneh Falls"],"activities":["architecture tours","history walks","photography","day trips"],"daily_cost":1400,"min_days":2,"themes":["history","culture","architecture","heritage"]},
    {"name":"Alleppey","region":"Kerala","type":"Backwater destination","description":"Peaceful Kerala backwaters with canals, paddy fields, village life, houseboat cruises and palm-lined waterways.","attractions":["Alappuzha Beach","Backwater canals","Pathiramanal Island","Local coir villages"],"activities":["houseboat cruise","canoeing","village walks","birdwatching"],"daily_cost":2100,"min_days":2,"themes":["nature","relaxation","water","culture"]}
]

STOP_WORDS = set()
try:
    STOP_WORDS = set(stopwords.words("english"))
except LookupError:
    try:
        nltk.download("stopwords", quiet=True)
        STOP_WORDS = set(stopwords.words("english"))
    except Exception:
        STOP_WORDS = {"i", "want", "a", "an", "the", "for", "with", "and", "to", "of", "in", "on", "is", "find", "me", "please"}

def preprocess(text):
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
    tokens = wordpunct_tokenize(cleaned)
    return [token for token in tokens if token not in STOP_WORDS and len(token) > 1]

def destination_document(destination):
    fields = [destination["name"], destination["region"], destination["type"], destination["description"]]
    fields += destination["attractions"] + destination["activities"] + destination["themes"]
    return " ".join(fields)

DESTINATION_TEXTS = [destination_document(d) for d in DESTINATIONS]
VECTORIZER = TfidfVectorizer()
DESTINATION_MATRIX = VECTORIZER.fit_transform(DESTINATION_TEXTS)

def extract_constraints(text):
    budget = None
    duration = None
    budget_patterns = [
        r"(?:budget|cost|spend|under|within|less than|below|around|of)\s*(?:of\s*)?(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*)",
        r"(?:₹|rs\.?|inr)\s*([0-9][0-9,]*)"
    ]
    for pattern in budget_patterns:
        match = re.search(pattern, text.lower())
        if match:
            try:
                budget = int(match.group(1).replace(",", ""))
                break
            except ValueError:
                pass
    duration_match = re.search(r"(\d+)\s*(?:day|days|night|nights)\b", text.lower())
    if duration_match:
        duration = int(duration_match.group(1))
    return budget, duration

def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                destination TEXT NOT NULL,
                days INTEGER NOT NULL CHECK(days > 0),
                travelers INTEGER NOT NULL CHECK(travelers > 0),
                total_budget REAL NOT NULL CHECK(total_budget >= 0),
                estimated_expenses REAL NOT NULL CHECK(estimated_expenses >= 0),
                budget_breakdown TEXT NOT NULL,
                itinerary TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

def json_trip(row):
    trip = dict(row)
    trip["budget_breakdown"] = json.loads(trip["budget_breakdown"])
    trip["itinerary"] = json.loads(trip["itinerary"])
    return trip

def build_itinerary(destination, days):
    attractions = destination["attractions"]
    activities = destination["activities"]
    result = []
    for day in range(days):
        first = attractions[(day * 2) % len(attractions)]
        second = attractions[(day * 2 + 1) % len(attractions)]
        activity = activities[day % len(activities)]
        result.append({"day": day + 1, "morning": first, "afternoon": second, "activity": activity})
    return result

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "message": "TripCraft API is running"})

@app.get("/api/destinations")
def destinations():
    return jsonify({"destinations": DESTINATIONS})

@app.post("/api/recommend")
def recommend():
    data = request.get_json(silent=True) or {}
    query = str(data.get("query", "")).strip()
    if not query:
        return jsonify({"error": "Please enter a travel query."}), 400

    tokens = preprocess(query)
    query_vector = VECTORIZER.transform([query])
    scores = cosine_similarity(query_vector, DESTINATION_MATRIX).flatten()
    extracted_budget, extracted_days = extract_constraints(query)
    budget = data.get("budget")
    days = data.get("days")
    try:
        budget = float(budget) if budget not in (None, "") else extracted_budget
        days = int(days) if days not in (None, "") else extracted_days
    except (ValueError, TypeError):
        return jsonify({"error": "Budget must be a number and duration must be a whole number."}), 400
    if budget is not None and budget < 0:
        return jsonify({"error": "Budget cannot be negative."}), 400
    if days is not None and days < 1:
        return jsonify({"error": "Duration must be at least one day."}), 400

    ranked = sorted(zip(DESTINATIONS, scores), key=lambda item: item[1], reverse=True)
    eligible = []
    for destination, score in ranked:
        estimated_total = destination["daily_cost"] * (days or destination["min_days"])
        if budget is not None and estimated_total > budget:
            continue
        if days is not None and days < destination["min_days"]:
            continue
        eligible.append((destination, float(score)))
    results = []
    for destination, score in eligible[:3]:
        results.append({**destination, "text_similarity": round(score * 100, 1),
                        "estimated_trip_cost": destination["daily_cost"] * (days or destination["min_days"])})
    message = None
    if not results:
        message = "No destinations matched those budget and duration constraints. Try increasing your budget or trip length."
    return jsonify({
        "query": query, "processed_tokens": tokens,
        "extracted": {"budget": extracted_budget, "days": extracted_days},
        "filters": {"budget": budget, "days": days},
        "results": results, "message": message
    })

@app.post("/api/trips")
def save_trip():
    data = request.get_json(silent=True) or {}
    required = ["destination", "days", "travelers", "total_budget", "estimated_expenses", "budget_breakdown", "itinerary"]
    missing = [field for field in required if field not in data]
    if missing:
        return jsonify({"error": "Missing required fields: " + ", ".join(missing)}), 400
    destination_name = str(data["destination"]).strip()
    destination = next((d for d in DESTINATIONS if d["name"].lower() == destination_name.lower()), None)
    if not destination:
        return jsonify({"error": "Please select a valid TripCraft destination."}), 400
    try:
        days = int(data["days"]); travelers = int(data["travelers"])
        total_budget = float(data["total_budget"]); expenses = float(data["estimated_expenses"])
    except (ValueError, TypeError):
        return jsonify({"error": "Days, travellers, budget, and expenses must be numeric."}), 400
    if days < 1 or travelers < 1 or total_budget < 0 or expenses < 0:
        return jsonify({"error": "Days and travellers must be positive; amounts cannot be negative."}), 400
    if not isinstance(data["budget_breakdown"], dict) or not isinstance(data["itinerary"], list):
        return jsonify({"error": "Budget breakdown must be an object and itinerary must be a list."}), 400
    created_at = datetime.now().isoformat(timespec="seconds")
    try:
        with get_db() as conn:
            cursor = conn.execute("""INSERT INTO trips
                (destination, days, travelers, total_budget, estimated_expenses, budget_breakdown, itinerary, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (destination["name"], days, travelers, total_budget, expenses,
                 json.dumps(data["budget_breakdown"]), json.dumps(data["itinerary"]), created_at))
            trip_id = cursor.lastrowid
            row = conn.execute("SELECT * FROM trips WHERE id = ?", (trip_id,)).fetchone()
        return jsonify({"trip": json_trip(row)}), 201
    except sqlite3.Error:
        app.logger.exception("Database error while saving trip")
        return jsonify({"error": "Could not save the trip. Please try again."}), 500

@app.get("/api/trips")
def list_trips():
    try:
        with get_db() as conn:
            rows = conn.execute("SELECT * FROM trips ORDER BY created_at DESC, id DESC").fetchall()
        return jsonify({"trips": [json_trip(row) for row in rows]})
    except sqlite3.Error:
        app.logger.exception("Database error while retrieving trips")
        return jsonify({"error": "Could not retrieve saved trips."}), 500

@app.get("/api/trips/<int:trip_id>")
def get_trip(trip_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM trips WHERE id = ?", (trip_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Trip not found."}), 404
    return jsonify({"trip": json_trip(row)})

@app.delete("/api/trips/<int:trip_id>")
def delete_trip(trip_id):
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM trips WHERE id = ?", (trip_id,))
    if cursor.rowcount == 0:
        return jsonify({"error": "Trip not found."}), 404
    return jsonify({"message": "Trip deleted successfully."})

init_db()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
