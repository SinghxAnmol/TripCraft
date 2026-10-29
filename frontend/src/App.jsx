import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Search,
  MapPin,
  Clock3,
  Wallet,
  Sparkles,
  Bookmark,
  Trash2,
  ArrowRight,
  Mountain,
  Waves,
  Trees,
  Landmark,
  LoaderCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Users,
  CheckCircle2,
  AlertCircle,
  PlaneTakeoff,
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const examples = [
  "I want a peaceful mountain destination for 3 days with nature and adventure",
  "Suggest a beach trip with sunsets, water sports and relaxed cafes",
  "I love history, royal palaces, culture and local food",
];

function App() {
  const [page, setPage] = useState("discover");
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [results, setResults] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState("");
  const [tripSuccess, setTripSuccess] = useState("");
  const [detailTrip, setDetailTrip] = useState(null);
  const [planner, setPlanner] = useState({
    days: 3,
    travelers: 2,
    budget: 10000,
  });
  const [costs, setCosts] = useState({
    accommodation: 900,
    food: 500,
    transport: 300,
    activities: 300,
    miscellaneous: 150,
  });
  const [showNlp, setShowNlp] = useState(false);

  const totalPerDay = Object.values(costs).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );
  const estimatedTotal =
    totalPerDay * Number(planner.days || 1) * Number(planner.travelers || 1);
  const remaining = Number(planner.budget || 0) - estimatedTotal;
  const itinerary = useMemo(() => {
    if (!selected) return [];
    const places = selected.attractions || [];
    const activities = selected.activities || [];
    return Array.from(
      { length: Math.max(1, Number(planner.days) || 1) },
      (_, index) => ({
        day: index + 1,
        morning: places[(index * 2) % places.length],
        afternoon: places[(index * 2 + 1) % places.length],
        activity: activities[index % activities.length],
      }),
    );
  }, [selected, planner.days]);

  async function runSearch(event) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setSearchMessage("");
    setResults([]);
    setAnalysis(null);
    try {
      const response = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          budget: budget || undefined,
          days: days || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not get recommendations.");
      setResults(data.results || []);
      setAnalysis(data);
      setSearchMessage(data.message || "");
    } catch (err) {
      setError(
        `${err.message}. Make sure the Flask backend is running on port 5000.`,
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseDestination(destination) {
    setSelected(destination);
    setPlanner({
      days: Number(days || 3),
      travelers: 2,
      budget: Number(budget || 10000),
    });
    setCosts({
      accommodation: Math.round(destination.daily_cost * 0.38),
      food: Math.round(destination.daily_cost * 0.24),
      transport: Math.round(destination.daily_cost * 0.18),
      activities: Math.round(destination.daily_cost * 0.15),
      miscellaneous: Math.round(destination.daily_cost * 0.05),
    });
    setTripSuccess("");
    setTripError("");
    setPage("planner");
  }

  async function loadTrips() {
    setTripLoading(true);
    setTripError("");
    try {
      const response = await fetch(`${API}/trips`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load trips.");
      setTrips(data.trips || []);
    } catch (err) {
      setTripError(`${err.message} Make sure Flask is running.`);
    } finally {
      setTripLoading(false);
    }
  }

  useEffect(() => {
    if (page === "trips") loadTrips();
  }, [page]);

  async function saveTrip() {
    if (!selected) return;
    setTripError("");
    setTripSuccess("");
    try {
      const response = await fetch(`${API}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: selected.name,
          days: Number(planner.days),
          travelers: Number(planner.travelers),
          total_budget: Number(planner.budget),
          estimated_expenses: estimatedTotal,
          budget_breakdown: Object.fromEntries(
            Object.entries(costs)
              .map(([key, value]) => [
                key,
                Number(value) *
                  Number(planner.days) *
                  Number(planner.travelers),
              ])
              .concat([["total", estimatedTotal]]),
          ),
          itinerary,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save trip.");
      setTripSuccess("Your trip has been saved to SQLite.");
    } catch (err) {
      setTripError(err.message);
    }
  }

  async function deleteTrip(id) {
    if (!window.confirm("Delete this saved trip?")) return;
    try {
      const response = await fetch(`${API}/trips/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete trip.");
      setTrips((current) => current.filter((trip) => trip.id !== id));
      if (detailTrip?.id === id) setDetailTrip(null);
    } catch (err) {
      setTripError(err.message);
    }
  }

  async function viewTrip(id) {
    setTripError("");
    try {
      const response = await fetch(`${API}/trips/${id}`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not load trip details.");
      setDetailTrip(data.trip);
    } catch (err) {
      setTripError(err.message);
    }
  }

  const themeIcon = (themes = []) => {
    if (themes.some((t) => ["beaches", "water"].includes(t)))
      return <Waves size={18} />;
    if (themes.some((t) => ["history", "culture", "architecture"].includes(t)))
      return <Landmark size={18} />;
    if (themes.some((t) => ["nature", "wildlife"].includes(t)))
      return <Trees size={18} />;
    return <Mountain size={18} />;
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <button
          className="brand"
          onClick={() => setPage("discover")}
          aria-label="TripCraft home"
        >
          <span className="brand-mark">
            <Compass size={23} />
          </span>
          <span>
            tripcraft<span className="brand-dot">.</span>
          </span>
        </button>
        <nav>
          <button
            className={page === "discover" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("discover")}
          >
            Discover
          </button>
          <button
            className={page === "planner" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("planner")}
          >
            Trip Planner
          </button>
          <button
            className={page === "trips" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("trips")}
          >
            My Trips
          </button>
        </nav>
        <div className="nav-pill">
          <span className="status-dot" /> NLP-powered planning
        </div>
      </header>

      {page === "discover" && (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <Sparkles size={14} /> TRAVEL, THOUGHTFULLY PLANNED
              </div>
              <h1>
                Your next adventure
                <br />
                starts <em>here.</em>
              </h1>
              <p className="hero-subtitle">
                Tell us what kind of trip you’re dreaming of. Our smart travel
                finder turns your words into destinations worth discovering.
              </p>
              <div className="hero-proof">
                <span>
                  <CheckCircle2 size={16} /> No account needed
                </span>
                <span>
                  <CheckCircle2 size={16} /> Free to explore
                </span>
              </div>
            </div>
            <div className="hero-art">
              <div className="sun" />
              <div className="mountain-back" />
              <div className="mountain-front" />
              <div className="art-label">
                <span className="art-label-icon">
                  <MapPin size={16} />
                </span>
                <span>
                  <b>Find your kind of place</b>
                  <small>One thoughtful query at a time</small>
                </span>
              </div>
              <div className="art-stamp">
                <Compass size={25} />
                <span>
                  GO
                  <br />
                  SOMEWHERE
                </span>
              </div>
            </div>
          </section>

          <section className="search-panel">
            <div className="search-heading">
              <div>
                <span className="section-kicker">YOUR TRIP, YOUR WORDS</span>
                <h2>Where would you like to go?</h2>
              </div>
              <span className="nlp-chip">
                <Sparkles size={14} /> Natural language search
              </span>
            </div>
            <form onSubmit={runSearch}>
              <label className="query-label" htmlFor="travel-query">
                Describe your ideal getaway
              </label>
              <div className="query-wrap">
                <Search size={21} />
                <textarea
                  id="travel-query"
                  rows="2"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. A quiet mountain escape for 3 days, with nature, scenic views and a little adventure…"
                  required
                />
              </div>
              <div className="quick-prompts">
                <span>TRY:</span>
                {examples.map((example) => (
                  <button
                    type="button"
                    key={example}
                    onClick={() => setQuery(example)}
                  >
                    {example.split(" ").slice(0, 5).join(" ")}…
                  </button>
                ))}
              </div>
              <div className="search-bottom">
                <div className="filter-fields">
                  <label>
                    <span>
                      <Wallet size={15} /> Budget (₹, optional)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 8000"
                    />
                  </label>
                  <label>
                    <span>
                      <Clock3 size={15} /> Duration (days, optional)
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      placeholder="e.g. 3"
                    />
                  </label>
                </div>
                <button
                  className="primary-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="spin" size={18} /> Finding
                      places…
                    </>
                  ) : (
                    <>
                      Discover destinations <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {error && (
            <div className="notice error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {searchMessage && (
            <div className="notice">
              <AlertCircle size={18} />
              {searchMessage}
            </div>
          )}

          {results.length > 0 && (
            <section className="results-section">
              <div className="section-head">
                <div>
                  <span className="section-kicker">MADE FOR YOUR MOOD</span>
                  <h2>Places that fit your idea</h2>
                  <p>
                    Ranked by how closely destination descriptions match your
                    words.
                  </p>
                </div>
                <span className="result-count">
                  TOP {results.length} MATCHES
                </span>
              </div>
              <div className="destination-grid">
                {results.map((destination, index) => (
                  <article className="destination-card" key={destination.name}>
                    <div className={`destination-visual visual-${index}`}>
                      <span className="destination-number">0{index + 1}</span>
                      <span className="visual-icon">
                        {themeIcon(destination.themes)}
                      </span>
                      <span className="visual-caption">{destination.type}</span>
                    </div>
                    <div className="destination-content">
                      <div className="destination-location">
                        <MapPin size={14} />
                        {destination.region}
                      </div>
                      <h3>{destination.name}</h3>
                      <p>{destination.description}</p>
                      <div className="tag-row">
                        {destination.themes.slice(0, 3).map((theme) => (
                          <span key={theme}>{theme}</span>
                        ))}
                      </div>
                      <div className="card-meta">
                        <div>
                          <small>EST. DAILY COST</small>
                          <b>
                            {money(destination.daily_cost)}
                            <small className="per-day"> / person</small>
                          </b>
                        </div>
                        <div className="similarity">
                          <small>TEXT SIMILARITY</small>
                          <b>{destination.text_similarity}%</b>
                        </div>
                      </div>
                      <button
                        className="card-action"
                        onClick={() => chooseDestination(destination)}
                      >
                        Plan this trip <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {!results.length && !loading && !error && !searchMessage && (
            <section className="empty-discover">
              <div className="empty-icon">
                <PlaneTakeoff size={23} />
              </div>
              <div>
                <h3>Your next story is out there.</h3>
                <p>
                  Start with a feeling, an activity, or a budget. TripCraft will
                  find the closest matches in its destination collection.
                </p>
              </div>
              <span className="empty-sparkle">
                <Sparkles size={19} />
              </span>
            </section>
          )}

          {analysis && (
            <section className="nlp-panel">
              <button
                className="nlp-toggle"
                onClick={() => setShowNlp(!showNlp)}
              >
                <span>
                  <Sparkles size={18} />{" "}
                  <span>
                    <b>Behind the recommendations</b>
                    <small>See the NLP pipeline used for this search</small>
                  </span>
                </span>
                {showNlp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {showNlp && (
                <div className="nlp-details">
                  <div className="nlp-step">
                    <span>01</span>
                    <b>Original query</b>
                    <p>{analysis.query}</p>
                  </div>
                  <div className="nlp-step">
                    <span>02</span>
                    <b>Preprocessed tokens</b>
                    <div className="token-list">
                      {analysis.processed_tokens.length ? (
                        analysis.processed_tokens.map((token, i) => (
                          <code key={`${token}-${i}`}>{token}</code>
                        ))
                      ) : (
                        <small>No meaningful tokens found.</small>
                      )}
                    </div>
                  </div>
                  <div className="nlp-step">
                    <span>03</span>
                    <b>TF-IDF + cosine similarity</b>
                    <p>
                      Words are weighted with TF-IDF, then compared with each
                      destination description using cosine similarity. The
                      percentage is a text-match score, not a probability.
                    </p>
                  </div>
                  <div className="nlp-step">
                    <span>04</span>
                    <b>Structured filters</b>
                    <p>
                      Budget:{" "}
                      {analysis.filters.budget == null
                        ? "not specified"
                        : money(analysis.filters.budget)}{" "}
                      · Duration:{" "}
                      {analysis.filters.days == null
                        ? "not specified"
                        : `${analysis.filters.days} days`}
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}
          <footer className="footer">
            <span>
              tripcraft<span className="brand-dot">.</span>
            </span>
            <span>A small NLP project for more thoughtful travel.</span>
          </footer>
        </main>
      )}

      {page === "planner" && (
        <main className="inner-page">
          <div className="page-intro">
            <span className="section-kicker">MAKE IT YOURS</span>
            <h1>
              Build your <em>getaway.</em>
            </h1>
            <p>
              A simple itinerary and transparent cost estimate, all in one
              place.
            </p>
          </div>
          {!selected ? (
            <div className="planner-empty">
              <div className="empty-icon">
                <Compass size={25} />
              </div>
              <h2>No destination selected yet</h2>
              <p>
                Discover destinations first, then choose “Plan this trip” to
                start building your itinerary.
              </p>
              <button
                className="primary-btn"
                onClick={() => setPage("discover")}
              >
                Explore destinations <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div className="planner-layout">
              <section className="planner-main">
                <div className="panel-card selected-destination">
                  <div className="mini-landscape">
                    <Mountain size={33} />
                  </div>
                  <div>
                    <span className="section-kicker">YOUR DESTINATION</span>
                    <h2>{selected.name}</h2>
                    <p>
                      <MapPin size={14} /> {selected.region} · {selected.type}
                    </p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setPage("discover")}
                  >
                    Change
                  </button>
                </div>
                <div className="panel-card">
                  <div className="panel-title">
                    <div>
                      <span className="section-kicker">TRIP DETAILS</span>
                      <h2>Shape your stay</h2>
                    </div>
                    <CalendarDays size={21} />
                  </div>
                  <div className="three-fields">
                    <label>
                      Trip duration (days)
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={planner.days}
                        onChange={(e) =>
                          setPlanner({
                            ...planner,
                            days: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </label>
                    <label>
                      Travellers
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={planner.travelers}
                        onChange={(e) =>
                          setPlanner({
                            ...planner,
                            travelers: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </label>
                    <label>
                      Total budget (₹)
                      <input
                        type="number"
                        min="0"
                        value={planner.budget}
                        onChange={(e) =>
                          setPlanner({
                            ...planner,
                            budget: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
                <div className="panel-card">
                  <div className="panel-title">
                    <div>
                      <span className="section-kicker">ESTIMATED COSTS</span>
                      <h2>Plan your spending</h2>
                      <p>Adjust the per-person, per-day estimates below.</p>
                    </div>
                    <Wallet size={21} />
                  </div>
                  <div className="cost-list">
                    {Object.entries(costs).map(([key, value]) => (
                      <label key={key}>
                        <span>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                          <small>per person / day</small>
                        </span>
                        <div className="cost-input">
                          <span>₹</span>
                          <input
                            type="number"
                            min="0"
                            value={value}
                            onChange={(e) =>
                              setCosts({
                                ...costs,
                                [key]: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="cost-total">
                    <span>
                      Estimated total for {planner.days} days ·{" "}
                      {planner.travelers} traveller(s)
                    </span>
                    <b>{money(estimatedTotal)}</b>
                  </div>
                  <div
                    className={
                      remaining >= 0
                        ? "budget-status good"
                        : "budget-status over"
                    }
                  >
                    {remaining >= 0 ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <AlertCircle size={17} />
                    )}
                    {remaining >= 0
                      ? `${money(remaining)} remaining in your budget`
                      : `${money(Math.abs(remaining))} over your budget`}
                  </div>
                  <p className="fine-print">
                    These are editable planning estimates, not live travel
                    prices or booking quotes.
                  </p>
                </div>
              </section>
              <aside className="planner-side">
                <div className="panel-card itinerary-card">
                  <span className="section-kicker">YOUR OUTLINE</span>
                  <h2>A little plan, day by day.</h2>
                  <p className="muted">
                    Based on the attractions and activities in our destination
                    dataset.
                  </p>
                  <div className="itinerary-list">
                    {itinerary.map((day) => (
                      <div className="itinerary-day" key={day.day}>
                        <span className="day-badge">DAY {day.day}</span>
                        <div>
                          <b>{day.morning}</b>
                          <p>Morning visit</p>
                          <b>{day.afternoon}</b>
                          <p>Afternoon visit</p>
                          <span className="activity-pill">
                            <Sparkles size={12} /> {day.activity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="primary-btn full-btn" onClick={saveTrip}>
                    <Bookmark size={17} /> Save this trip
                  </button>
                  {tripSuccess && (
                    <div className="inline-success">
                      <CheckCircle2 size={16} />
                      {tripSuccess}{" "}
                      <button onClick={() => setPage("trips")}>
                        View trips
                      </button>
                    </div>
                  )}
                  {tripError && <div className="inline-error">{tripError}</div>}
                </div>
              </aside>
            </div>
          )}
          <footer className="footer">
            <span>
              tripcraft<span className="brand-dot">.</span>
            </span>
            <span>Plan simply. Travel thoughtfully.</span>
          </footer>
        </main>
      )}

      {page === "trips" && (
        <main className="inner-page">
          <div className="page-intro trips-intro">
            <span className="section-kicker">YOUR PERSONAL COLLECTION</span>
            <h1>
              Trips worth <em>keeping.</em>
            </h1>
            <p>
              Your saved plans are stored locally in the TripCraft SQLite
              database.
            </p>
          </div>
          {tripError && (
            <div className="notice error">
              <AlertCircle size={18} />
              {tripError}
            </div>
          )}
          {tripLoading ? (
            <div className="loading-state">
              <LoaderCircle className="spin" size={25} /> Loading your trips…
            </div>
          ) : trips.length === 0 ? (
            <div className="planner-empty">
              <div className="empty-icon">
                <Bookmark size={25} />
              </div>
              <h2>Your collection starts here</h2>
              <p>
                Save a trip from the planner and it’ll be waiting here when you
                return.
              </p>
              <button
                className="primary-btn"
                onClick={() => setPage("discover")}
              >
                Discover destinations <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div className="saved-trips-grid">
              {trips.map((trip) => (
                <article className="saved-trip-card" key={trip.id}>
                  <div className="saved-trip-top">
                    <div className="mini-landscape">
                      <MapPin size={24} />
                    </div>
                    <span className="saved-date">
                      {new Date(trip.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="section-kicker">SAVED GETAWAY</span>
                  <h2>{trip.destination}</h2>
                  <div className="saved-trip-meta">
                    <span>
                      <Clock3 size={15} /> {trip.days} days
                    </span>
                    <span>
                      <Users size={15} /> {trip.travelers} travellers
                    </span>
                  </div>
                  <div className="saved-cost-row">
                    <div>
                      <small>BUDGET</small>
                      <b>{money(trip.total_budget)}</b>
                    </div>
                    <div>
                      <small>EST. EXPENSES</small>
                      <b>{money(trip.estimated_expenses)}</b>
                    </div>
                  </div>
                  <div className="saved-actions">
                    <button
                      className="secondary-btn"
                      onClick={() => viewTrip(trip.id)}
                    >
                      View details
                    </button>
                    <button
                      className="icon-btn danger-btn"
                      title="Delete trip"
                      onClick={() => deleteTrip(trip.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {detailTrip && (
            <div className="modal-backdrop" onClick={() => setDetailTrip(null)}>
              <section
                className="trip-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setDetailTrip(null)}
                >
                  ×
                </button>
                <span className="section-kicker">SAVED TRIP DETAILS</span>
                <h2>{detailTrip.destination}</h2>
                <p>
                  {detailTrip.days} days · {detailTrip.travelers} traveller(s) ·
                  Saved {new Date(detailTrip.created_at).toLocaleString()}
                </p>
                <div className="modal-cost">
                  <span>Budget</span>
                  <b>{money(detailTrip.total_budget)}</b>
                  <span>Estimated expenses</span>
                  <b>{money(detailTrip.estimated_expenses)}</b>
                </div>
                <h3>Expense breakdown</h3>
                <div className="breakdown-list">
                  {Object.entries(detailTrip.budget_breakdown || {})
                    .filter(([key]) => key !== "total")
                    .map(([key, value]) => (
                      <div key={key}>
                        <span>{key}</span>
                        <b>{money(value)}</b>
                      </div>
                    ))}
                </div>
                <h3>Itinerary</h3>
                <div className="modal-itinerary">
                  {(detailTrip.itinerary || []).map((day) => (
                    <div key={day.day}>
                      <b>Day {day.day}</b>
                      <span>
                        {day.morning} · {day.afternoon}
                      </span>
                      <small>{day.activity}</small>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
          <footer className="footer">
            <span>
              tripcraft<span className="brand-dot">.</span>
            </span>
            <span>Your plans, saved for later.</span>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
