# TripCraft — Smart NLP-Based Travel Planner

A small MCA mini project built with React + Vite, Flask, NLTK, scikit-learn, and SQLite. It runs locally and does not need paid APIs or API keys.

## Features

- Natural-language travel search.
- NLTK tokenization and stop-word removal.
- TF-IDF destination vectors and cosine similarity ranking.
- Regular-expression extraction for budgets and trip durations.
- Optional budget/duration constraints.
- Simple trip itinerary and editable expense estimate.
- SQLite persistence for saved trips, trip details, and deletion.
- Responsive three-page UI: Discover, Trip Planner, My Trips.

## Folder structure

```text
TripCraft/
├── README.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── style.css
└── backend/
    ├── app.py
    └── requirements.txt
```

The database file `backend/tripcraft.db` is generated automatically at first backend startup.

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer (includes npm)
- VS Code (recommended)

## Run on Windows

Open the `TripCraft` folder in VS Code and use two terminals.

### Terminal 1 — Flask backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

If PowerShell blocks activation, run this once in that terminal and retry activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

The backend runs at `http://127.0.0.1:5000`. On first startup, NLTK may download its English stop-word list. If that download is unavailable, a small fallback list is used.

### Terminal 2 — React frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## API endpoints

- `GET http://127.0.0.1:5000/api/health`
- `GET http://127.0.0.1:5000/api/destinations`
- `POST http://127.0.0.1:5000/api/recommend`
- `POST http://127.0.0.1:5000/api/trips`
- `GET http://127.0.0.1:5000/api/trips`
- `GET http://127.0.0.1:5000/api/trips/1` (replace `1` with a real ID)
- `DELETE http://127.0.0.1:5000/api/trips/1` (replace `1` with a real ID)

PowerShell test examples:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
Invoke-RestMethod http://127.0.0.1:5000/api/destinations

$body = @{
  query = "peaceful mountain destination with nature and adventure for 3 days"
  budget = 8000
  days = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:5000/api/recommend -Method Post -ContentType "application/json" -Body $body
Invoke-RestMethod http://127.0.0.1:5000/api/trips
```

For saving a trip directly through the API, send JSON containing `destination`, `days`, `travelers`, `total_budget`, `estimated_expenses`, `budget_breakdown` (object), and `itinerary` (array). The Trip Planner page creates this payload for you.

## How the recommendation pipeline works

1. The backend lowercases text and removes punctuation with `re`.
2. NLTK tokenizes the query and removes English stop words for the displayed token analysis.
3. `TfidfVectorizer` is fitted once to text documents made from destination names, regions, descriptions, attractions, activities, and themes.
4. The query is transformed using the same fitted vectorizer.
5. `cosine_similarity` calculates similarity between the query vector and every destination vector.
6. Results are sorted by the real calculated similarity scores.
7. If budget and/or duration is supplied or extracted, constraints filter candidates. The budget comparison uses destination daily cost × duration (or minimum duration when duration is absent). This is a simple estimate and does not include route-specific transport or seasonal price changes.

The similarity score is a measure of text overlap in vector space. It is **not** a probability, a factual rating, or a guarantee of suitability.

## Manual test checklist

1. Search: `peaceful mountain destination with nature and adventure for 3 days`.
2. Search with constraints: `beach trip for 3 days with budget ₹8000`.
3. Search without budget: `historic city with palaces and culture`.
4. Submit an empty query — the API should return HTTP 400 and the UI should show an error.
5. Use a tiny budget/duration combination to trigger the no-matches message.
6. Select a result, adjust trip details/costs, then save it.
7. Open My Trips and confirm the saved trip appears.
8. Open View details and confirm budget breakdown and itinerary are displayed.
9. Delete the trip and confirm it disappears.
10. Refresh the browser, return to My Trips, and confirm remaining saved trips persist.

To confirm NLP is real, use different query themes and inspect the token analysis and changing similarity scores. The destination corpus is static, but scores are calculated for each query. To confirm database persistence, inspect `backend/tripcraft.db` with any SQLite viewer or save a trip, restart Flask, and reopen My Trips.

## Project explanation for viva

**Problem statement:** Travel discovery can be tedious when users must manually choose many filters. TripCraft lets a user describe travel preferences in plain language and ranks a small destination catalogue by textual relevance.

**Objectives:** Apply basic NLP to search; rank destination text; support simple budget/duration constraints; generate an editable itinerary estimate; persist trips using SQL.

**Architecture:** React frontend → Flask REST API → NLP pipeline / destination dataset and SQLite database. The browser never connects directly to SQLite.

**NLP concepts:**
- **Preprocessing:** lowercase, punctuation cleanup, tokenization, stop-word removal.
- **TF-IDF:** gives more weight to words useful for distinguishing documents and less weight to words common across many documents.
- **Cosine similarity:** compares the angle between query and destination vectors; a higher score means more similar text.
- **Regular expressions:** extracts numeric patterns such as `₹8000` and `3 days`.

**SQL design:** One `trips` table with an integer primary key, destination, days, traveller count, budget, estimated expenses, JSON-serialized breakdown and itinerary, and creation timestamp. SQL operations are parameterized.

**Advantages:** Local, low-cost, explainable, quick to run, easy to demonstrate, persistent saved trips.

**Limitations:** Small curated dataset; English-focused; TF-IDF does not understand deep semantic meaning or synonyms well; costs are estimates; no live availability, route data, or bookings.

**Future enhancements:** Larger verified destination dataset, multilingual support, synonym expansion, user accounts, live weather or transit APIs, richer itinerary constraints, evaluation using precision@k and user feedback.

## Sample viva questions and answers

1. **What is NLP?** Natural Language Processing is a field that helps computers process and analyze human language.
2. **Why is NLP used here?** It lets users describe travel preferences in normal sentences.
3. **What is tokenization?** Splitting text into smaller units, commonly words.
4. **What are stop words?** Very common words that often contribute little to a text-matching task, such as “the” or “is.”
5. **Why lowercase the query?** It makes matching case-insensitive.
6. **What does `re` do?** Python's regular-expression module finds patterns such as amounts and durations.
7. **What is TF-IDF?** A weighting method based on how often a term appears in a document and how rare it is across documents.
8. **What is term frequency?** How often a term appears in a document.
9. **What is inverse document frequency?** A factor that gives less weight to terms appearing in many documents.
10. **Why use TF-IDF?** It converts text into numerical features for comparison.
11. **What is cosine similarity?** A measure of the angle-based similarity between two vectors.
12. **Why cosine similarity?** It gives a simple way to rank destination descriptions against a query.
13. **Is a 70% similarity score a 70% probability?** No. It is a text-similarity measure, not a calibrated probability.
14. **Is this deep learning?** No. This project uses classical NLP and information retrieval methods, not a deep-learning model.
15. **What is a corpus?** A collection of text documents; here, the destination descriptions form the corpus.
16. **Why fit TF-IDF once?** All destination vectors and future query vectors need to use the same vocabulary and IDF weights.
17. **What is Flask?** A lightweight Python web framework used to expose API endpoints.
18. **What is a REST API?** A way for software components to communicate using HTTP methods and resources.
19. **Why SQLite?** It is lightweight, file-based, and requires no separate database server.
20. **What is a primary key?** A column that uniquely identifies each database row.
21. **Why parameterized SQL?** It safely passes values to SQL and helps prevent SQL injection.
22. **Why store the itinerary as JSON text?** It is a simple way to store a small structured list in one SQLite column for this mini project.
23. **What happens if no destination meets the filters?** The API returns an empty result list and a helpful message.
24. **What are the main limitations?** Small dataset, weak understanding of synonyms/context, and estimated rather than live prices.
25. **How could you evaluate recommendations?** Create test queries with expected relevant destinations and measure precision at the top three, plus collect user feedback.

## Syllabus mapping

| Topic | Where it appears |
|---|---|
| Text preprocessing | `preprocess()` in `backend/app.py` |
| Tokenization | NLTK `wordpunct_tokenize` |
| Stop-word removal | NLTK English stop-word list |
| TF-IDF | `TfidfVectorizer` and `DESTINATION_MATRIX` |
| Similarity measure | `cosine_similarity` |
| Regular expressions | `extract_constraints()` |
| SQL / CRUD | SQLite functions and `/api/trips` routes |
| Frontend / API integration | `frontend/src/App.jsx` uses `fetch()` |

## Notes

- Costs and itineraries are illustrative planning estimates, not live quotes.
- No generative AI or paid travel APIs are used.
- The React page uses a small amount of CSS illustration rather than remote destination photos, keeping the project self-contained.
#   T r i p C r a f t  
 