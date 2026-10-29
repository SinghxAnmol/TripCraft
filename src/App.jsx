// import React from "react";
// import { useState } from "react";

// /* ---------- Data ---------- */
// const DESTINATIONS = [
//   {
//     name: "Manali",
//     emoji: "🏔️",
//     bg: "linear-gradient(135deg,#0ea5e9,#1e3a8a)",
//     cost: 3500,
//     desc: "Snow-capped peaks, pine forests and adventure sports in the Himalayas.",
//     activities: [
//       "Visit Hadimba Temple",
//       "Walk around Old Manali cafes",
//       "Drive to Solang Valley",
//       "Try paragliding or zorbing",
//       "Day trip to Rohtang Pass",
//       "Relax at Vashisht hot springs",
//       "Stroll down Mall Road",
//       "Trek to Jogini Waterfall",
//     ],
//   },
//   {
//     name: "Goa",
//     emoji: "🏖️",
//     bg: "linear-gradient(135deg,#14b8a6,#0369a1)",
//     cost: 4000,
//     desc: "Golden beaches, Portuguese heritage, seafood and lively nightlife.",
//     activities: [
//       "Relax at Baga Beach",
//       "Explore Fort Aguada",
//       "Visit Basilica of Bom Jesus",
//       "Try water sports at Calangute",
//       "Shop at Anjuna Flea Market",
//       "Sunset at Chapora Fort",
//       "Cruise on the Mandovi River",
//       "Cafe hopping in Panjim",
//     ],
//   },
//   {
//     name: "Jaipur",
//     emoji: "🏰",
//     bg: "linear-gradient(135deg,#f97316,#9d174d)",
//     cost: 3000,
//     desc: "The Pink City of palaces, forts, bazaars and royal Rajasthani food.",
//     activities: [
//       "Explore Amber Fort",
//       "Visit City Palace",
//       "See Hawa Mahal",
//       "Walk through Jantar Mantar",
//       "Shop at Johari Bazaar",
//       "Sunset at Nahargarh Fort",
//       "Try dal baati churma",
//       "Visit Jal Mahal",
//     ],
//   },
//   {
//     name: "Shimla",
//     emoji: "🌲",
//     bg: "linear-gradient(135deg,#22c55e,#0f766e)",
//     cost: 3200,
//     desc: "A colonial hill station with cool weather, toy trains and cedar views.",
//     activities: [
//       "Walk on The Ridge",
//       "Visit Christ Church",
//       "Stroll along Mall Road",
//       "Ride the Kalka–Shimla toy train",
//       "Day trip to Kufri",
//       "See Jakhu Temple",
//       "Visit Viceregal Lodge",
//       "Try local Himachali food",
//     ],
//   },
//   {
//     name: "Amritsar",
//     emoji: "🛕",
//     bg: "linear-gradient(135deg,#eab308,#b45309)",
//     cost: 2500,
//     desc: "Home of the Golden Temple, rich history and legendary Punjabi food.",
//     activities: [
//       "Visit the Golden Temple",
//       "Eat langar at the Golden Temple",
//       "Learn history at Jallianwala Bagh",
//       "Watch the Wagah Border ceremony",
//       "Taste kulcha and lassi",
//       "Explore Partition Museum",
//       "Visit Durgiana Temple",
//       "Shop at Hall Bazaar",
//     ],
//   },
// ];

// const GENERIC = [
//   "Explore the city center",
//   "Visit a local museum",
//   "Try local street food",
//   "Walk through the old market",
//   "Visit a famous viewpoint",
//   "Relax at a park or lake",
//   "Shop for souvenirs",
//   "Enjoy a local cultural show",
// ];

// const CATEGORIES = [
//   { key: "stay", label: "Accommodation", pct: 35, icon: "🏨" },
//   { key: "food", label: "Food", pct: 25, icon: "🍽️" },
//   { key: "transport", label: "Transportation", pct: 20, icon: "🚗" },
//   { key: "fun", label: "Activities & Sightseeing", pct: 15, icon: "🎟️" },
//   { key: "emergency", label: "Emergency Savings", pct: 5, icon: "🛟" },
// ];

// const SLOTS = ["Morning", "Afternoon", "Evening"];
// const STORAGE_KEY = "tripcraft-saved-trip";

// /* ---------- Helpers ---------- */
// const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// const isPositive = (v) =>
//   v !== "" && Number.isFinite(Number(v)) && Number(v) > 0;

// function validate({ origin, destination, travelers, days, budget }) {
//   if (!origin.trim()) return "Please enter your starting location.";
//   if (!destination.trim()) return "Please enter or select a destination.";
//   if (origin.trim().toLowerCase() === destination.trim().toLowerCase())
//     return "Starting location and destination cannot be the same.";
//   if (!isPositive(budget)) return "Budget must be a number greater than 0.";
//   if (!isPositive(travelers) || !Number.isInteger(Number(travelers)))
//     return "Travelers must be a whole number greater than 0.";
//   if (!isPositive(days) || !Number.isInteger(Number(days)))
//     return "Days must be a whole number greater than 0.";
//   if (Number(days) > 30) return "Please keep the trip to 30 days or fewer.";
//   return "";
// }

// function findDestination(name) {
//   return DESTINATIONS.find(
//     (d) => d.name.toLowerCase() === name.trim().toLowerCase(),
//   );
// }

// function getBreakdown(budget) {
//   return CATEGORIES.map((c) => ({
//     ...c,
//     amount: (Number(budget) * c.pct) / 100,
//   }));
// }

// function getItinerary(destination, days) {
//   const list = findDestination(destination)?.activities || GENERIC;
//   let i = 0;
//   return Array.from({ length: Number(days) }, (_, d) => ({
//     day: d + 1,
//     items: SLOTS.map((slot) => ({ slot, text: list[i++ % list.length] })),
//   }));
// }

// function loadTrip() {
//   try {
//     return JSON.parse(localStorage.getItem(STORAGE_KEY));
//   } catch {
//     return null;
//   }
// }

// /* ---------- Shared components ---------- */
// function Navbar({ page, go }) {
//   const links = [
//     ["discover", "Discover"],
//     ["planner", "Plan Trip"],
//     ["summary", "My Trip"],
//   ];
//   return (
//     <header className="navbar">
//       <div className="container nav-inner">
//         <div className="logo" onClick={() => go("discover")}>
//           🧭 Trip<span>Craft</span>
//         </div>
//         <nav>
//           {links.map(([key, label]) => (
//             <button
//               key={key}
//               className={"nav-link" + (page === key ? " active" : "")}
//               onClick={() => go(key)}
//             >
//               {label}
//             </button>
//           ))}
//         </nav>
//       </div>
//     </header>
//   );
// }

// function Footer() {
//   return (
//     <footer className="footer">
//       <div className="container">
//         © {new Date().getFullYear()} TripCraft — Smart Trip Planner. Plan smart,
//         travel happy. ✈️
//       </div>
//     </footer>
//   );
// }

// function TripFields({ trip, setTrip }) {
//   const set = (field) => (e) => setTrip({ ...trip, [field]: e.target.value });
//   return (
//     <div className="form-grid">
//       <label>
//         Starting Location
//         <input
//           value={trip.origin}
//           onChange={set("origin")}
//           placeholder="e.g. Delhi"
//         />
//       </label>
//       <label>
//         Destination
//         <input
//           list="destinations"
//           value={trip.destination}
//           onChange={set("destination")}
//           placeholder="Select or type a place"
//         />
//         <datalist id="destinations">
//           {DESTINATIONS.map((d) => (
//             <option key={d.name} value={d.name} />
//           ))}
//         </datalist>
//       </label>
//       <label>
//         Travelers
//         <input
//           type="number"
//           min="1"
//           step="1"
//           value={trip.travelers}
//           onChange={set("travelers")}
//         />
//       </label>
//       <label>
//         Days
//         <input
//           type="number"
//           min="1"
//           step="1"
//           value={trip.days}
//           onChange={set("days")}
//         />
//       </label>
//       <label>
//         Total Budget (₹)
//         <input
//           type="number"
//           min="1"
//           value={trip.budget}
//           onChange={set("budget")}
//         />
//       </label>
//     </div>
//   );
// }

// function BudgetBreakdown({ budget }) {
//   return (
//     <div className="budget-grid">
//       {getBreakdown(budget).map((c) => (
//         <div className="card budget-card" key={c.key}>
//           <div className="budget-top">
//             <span className="budget-icon">{c.icon}</span>
//             <span className="pct">{c.pct}%</span>
//           </div>
//           <h4>{c.label}</h4>
//           <p className="amount">{money(c.amount)}</p>
//           <div className="bar">
//             <div className="bar-fill" style={{ width: c.pct * 2.5 + "%" }} />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function Itinerary({ destination, days }) {
//   return (
//     <div className="itinerary">
//       {getItinerary(destination, days).map((d) => (
//         <div className="card day-card" key={d.day}>
//           <h4>Day {d.day}</h4>
//           <ul>
//             {d.items.map((it) => (
//               <li key={it.slot}>
//                 <strong>{it.slot}:</strong> {it.text}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ---------- Pages ---------- */
// function Discover({ trip, setTrip, go, startWith }) {
//   const [error, setError] = useState("");

//   const submit = (e) => {
//     e.preventDefault();
//     const err = validate(trip);
//     if (err) return setError(err);
//     setError("");
//     go("planner");
//   };

//   return (
//     <>
//       <section className="hero">
//         <div className="container hero-inner">
//           <h1>
//             Plan your perfect trip, <span>smartly.</span>
//           </h1>
//           <p>
//             Pick a destination, set your budget and get an instant cost split
//             with a day-wise itinerary.
//           </p>
//           <a className="btn btn-light" href="#destinations-section">
//             Explore Destinations
//           </a>
//         </div>
//       </section>

//       <div className="container">
//         <form className="card quick-form" onSubmit={submit}>
//           <h3>Start planning</h3>
//           <TripFields trip={trip} setTrip={setTrip} />
//           {error && <p className="error">{error}</p>}
//           <button className="btn btn-primary" type="submit">
//             Plan My Trip
//           </button>
//         </form>

//         <h2 className="section-title" id="destinations-section">
//           Popular Destinations
//         </h2>
//         <div className="dest-grid">
//           {DESTINATIONS.map((d) => (
//             <div className="card dest-card" key={d.name}>
//               <div className="dest-img" style={{ background: d.bg }}>
//                 <span>{d.emoji}</span>
//               </div>
//               <div className="dest-body">
//                 <h3>{d.name}</h3>
//                 <p className="cost">≈ {money(d.cost)} / person / day</p>
//                 <p className="desc">{d.desc}</p>
//                 <button
//                   className="btn btn-primary"
//                   onClick={() => startWith(d)}
//                 >
//                   Plan My Trip
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// }

// function Planner({ trip, setTrip, onSave, message }) {
//   const error = validate(trip);
//   const valid = !error;

//   return (
//     <div className="container page">
//       <h1 className="page-title">Trip Planner</h1>
//       <div className="card">
//         <TripFields trip={trip} setTrip={setTrip} />
//         {!valid && <p className="error">{error}</p>}
//       </div>

//       {message && <div className="toast">{message}</div>}

//       {valid && (
//         <>
//           <h2 className="section-title">Budget Split — {money(trip.budget)}</h2>
//           <p className="muted">
//             About {money(Number(trip.budget) / Number(trip.travelers))} per
//             person ·{" "}
//             {money(
//               Number(trip.budget) / Number(trip.travelers) / Number(trip.days),
//             )}{" "}
//             per person per day
//           </p>
//           <BudgetBreakdown budget={trip.budget} />

//           <h2 className="section-title">
//             Day-wise Itinerary — {trip.origin.trim()} →{" "}
//             {trip.destination.trim()}
//           </h2>
//           <Itinerary destination={trip.destination} days={trip.days} />
//         </>
//       )}

//       <div className="actions">
//         <button className="btn btn-primary" onClick={onSave}>
//           💾 Save Trip
//         </button>
//       </div>
//     </div>
//   );
// }

// function Summary({ saved, go, onDelete, onEdit, message }) {
//   if (!saved) {
//     return (
//       <div className="container page empty">
//         {message && <div className="toast">{message}</div>}
//         <div className="empty-emoji">🧳</div>
//         <h2>No trip saved yet</h2>
//         <p className="muted">
//           Create a plan and save it to see your summary here.
//         </p>
//         <button className="btn btn-primary" onClick={() => go("planner")}>
//           Create a Trip
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="container page">
//       <h1 className="page-title">My Trip Summary</h1>
//       {message && <div className="toast">{message}</div>}

//       <div className="card summary-top">
//         <div>
//           <span className="label">From</span>
//           <strong>{saved.origin || "—"}</strong>
//         </div>
//         <div>
//           <span className="label">Destination</span>
//           <strong>{saved.destination}</strong>
//         </div>
//         <div>
//           <span className="label">Duration</span>
//           <strong>{saved.days} day(s)</strong>
//         </div>
//         <div>
//           <span className="label">Travelers</span>
//           <strong>{saved.travelers}</strong>
//         </div>
//         <div>
//           <span className="label">Total Budget</span>
//           <strong>{money(saved.budget)}</strong>
//         </div>
//       </div>

//       <h2 className="section-title">Budget Breakdown</h2>
//       <BudgetBreakdown budget={saved.budget} />

//       <h2 className="section-title">Itinerary</h2>
//       <Itinerary destination={saved.destination} days={saved.days} />

//       <div className="actions">
//         <button className="btn btn-primary" onClick={onEdit}>
//           ✏️ Edit Plan
//         </button>
//         <button className="btn btn-danger" onClick={onDelete}>
//           🗑️ Delete Trip
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ---------- App ---------- */
// export default function App() {
//   const [page, setPage] = useState("discover");
//   const [saved, setSaved] = useState(loadTrip);
//   const [message, setMessage] = useState("");
//   const [trip, setTrip] = useState({
//     origin: "Delhi",
//     destination: "Manali",
//     travelers: "2",
//     days: "3",
//     budget: "20000",
//   });

//   const flash = (text) => {
//     setMessage(text);
//     setTimeout(() => setMessage(""), 3000);
//   };

//   const go = (p) => {
//     setMessage("");
//     setPage(p);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const startWith = (d) => {
//     const travelers = isPositive(trip.travelers) ? trip.travelers : "2";
//     const days = isPositive(trip.days) ? trip.days : "3";
//     setTrip({
//       ...trip,
//       destination: d.name,
//       travelers,
//       days,
//       budget: String(d.cost * Number(travelers) * Number(days)),
//     });
//     go("planner");
//   };

//   const save = () => {
//     const err = validate(trip);
//     if (err) return flash("⚠️ " + err);
//     const data = {
//       origin: trip.origin.trim(),
//       destination: trip.destination.trim(),
//       travelers: Number(trip.travelers),
//       days: Number(trip.days),
//       budget: Number(trip.budget),
//     };
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
//     setSaved(data);
//     setPage("summary");
//     window.scrollTo({ top: 0 });
//     flash("✅ Trip saved successfully!");
//   };

//   const remove = () => {
//     localStorage.removeItem(STORAGE_KEY);
//     setSaved(null);
//     flash("🗑️ Trip deleted.");
//   };

//   const edit = () => {
//     setTrip({
//       origin: saved.origin || "",
//       destination: saved.destination,
//       travelers: String(saved.travelers),
//       days: String(saved.days),
//       budget: String(saved.budget),
//     });
//     go("planner");
//   };

//   return (
//     <>
//       <Navbar page={page} go={go} />
//       <main>
//         {page === "discover" && (
//           <Discover
//             trip={trip}
//             setTrip={setTrip}
//             go={go}
//             startWith={startWith}
//           />
//         )}
//         {page === "planner" && (
//           <Planner
//             trip={trip}
//             setTrip={setTrip}
//             onSave={save}
//             message={message}
//           />
//         )}
//         {page === "summary" && (
//           <Summary
//             saved={saved}
//             go={go}
//             onDelete={remove}
//             onEdit={edit}
//             message={message}
//           />
//         )}
//       </main>
//       <Footer />
//     </>
//   );
// }
