import React from "react";

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  teamNumber: number;
}

export default function CalendarMonth({
  events,
  currentDate,
}: {
  events: Event[];
  currentDate: Date;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];

  // Determine the weekday of the first day of the month (0 = Sunday, 6 = Saturday)
  const firstWeekday = new Date(year, month, 1).getDay();

  // Add nulls to pad the first week
  for (let i = 0; i < firstWeekday; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  function getTeamIcon(teamNumber: number) {
    return `/fundrocal/team-icons/frc${teamNumber}.png`;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        {currentDate.toLocaleString(undefined, {
          month: "long",
          year: "numeric",
        })}
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-bold text-center">
            {d}
          </div>
        ))}

        {days.map((day, idx) => {
          if (!day) {
            // Empty cell for padding
            return <div key={`empty-${idx}`} className="border p-2 rounded min-h-[80px]"></div>;
          }

          const dayEvents = events.filter(
            (e) => new Date(e.start).toDateString() === day.toDateString()
          );

          return (
            <div key={day.toISOString()} className="border p-2 rounded min-h-[80px]">
              <div className="text-xs font-semibold">{day.getDate()}</div>
              {dayEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-blue-100 text-xs p-1 my-1 rounded flex items-center gap-1"
                >
                  <img
                    src={getTeamIcon(e.teamNumber)}
                    alt={`Team ${e.teamNumber}`}
                    className="w-10 h-10 rounded-full"
                  />
                  {e.title} (Team {e.teamNumber})
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
