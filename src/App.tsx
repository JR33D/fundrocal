import { useEffect, useState } from "react";
import CalendarMonth from "./components/calendar-month";
import CalendarWeek from "./components/calendar-week";
import CalendarDay from "./components/calendar-day";
import "./App.css";

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  teamNumber: number;
}

type ViewMode = "month" | "week" | "day";

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | "all">("all");
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetch("events.json")
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);

    setCurrentDate(new Date());
  }, []);

  const teams = Array.from(new Set(events.map((e) => e.teamNumber))).sort();
  const filteredEvents =
    selectedTeam === "all"
      ? events
      : events.filter((e) => e.teamNumber === selectedTeam);

  // Navigation handlers
  const prev = () => {
    setCurrentDate((prevDate) => {
      const date = new Date(prevDate);
      if (view === "month") date.setMonth(date.getMonth() - 1);
      if (view === "week") date.setDate(date.getDate() - 7);
      if (view === "day") date.setDate(date.getDate() - 1);
      return date;
    });
  };

  const next = () => {
    setCurrentDate((prevDate) => {
      const date = new Date(prevDate);
      if (view === "month") date.setMonth(date.getMonth() + 1);
      if (view === "week") date.setDate(date.getDate() + 7);
      if (view === "day") date.setDate(date.getDate() + 1);
      return date;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Fundrocal</h1>
          <p className="mb-4 italic">
            You're insight into all the local fundraising going on.
          </p>

          <div className="flex gap-4 mb-4">
            <label>
              <span className="font-semibold">Filter by Team:</span>
              <select
                className="ml-2 border rounded p-1"
                value={selectedTeam}
                onChange={(e) =>
                  setSelectedTeam(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
              >
                <option value="all">All Teams</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    Team {team}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="font-semibold mr-2">View:</span>
              <button
                className={`px-2 py-1 border rounded mr-1 ${
                  view === "month" ? "bg-blue-200" : ""
                }`}
                onClick={() => setView("month")}
              >
                Month
              </button>
              <button
                className={`px-2 py-1 border rounded mr-1 ${
                  view === "week" ? "bg-blue-200" : ""
                }`}
                onClick={() => setView("week")}
              >
                Week
              </button>
              <button
                className={`px-2 py-1 border rounded ${
                  view === "day" ? "bg-blue-200" : ""
                }`}
                onClick={() => setView("day")}
              >
                Day
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={prev}
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={next}
              className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
            >
              Next
            </button>
          </div>

          {/* Calendar display */}
          {view === "month" && (
            <CalendarMonth events={filteredEvents} currentDate={currentDate} />
          )}
          {view === "week" && (
            <CalendarWeek events={filteredEvents} currentDate={currentDate} />
          )}
          {view === "day" && (
            <CalendarDay events={filteredEvents} currentDate={currentDate} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
