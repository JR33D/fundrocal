import React from 'react';

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  teamNumber: number;
}

export default function CalendarWeek({ events, currentDate }: { events: Event[]; currentDate: Date }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  function getTeamIcon(teamNumber: number) {
    return `/team-icons/frc${teamNumber}.png`;
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Week of {startOfWeek.toLocaleDateString()}</h2>
      <div className="grid grid-cols-8 border-t border-l">
        <div className="bg-gray-100 p-2 text-xs">Time</div>
        {days.map(d => (
          <div key={d.toDateString()} className="bg-gray-100 p-2 text-xs border-r">
            {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        ))}
        {hours.map(h => (
          <React.Fragment key={h}>
            <div className="border-b border-r p-1 text-xs text-right">{h}:00</div>
            {days.map(d => {
              const slotEvents = events.filter(e => {
                const start = new Date(e.start);
                const end = new Date(e.end);
                return (
                  start.getHours() <= h &&
                  end.getHours() > h &&
                  start.toDateString() === d.toDateString()
                );
              });
              return (
                <div key={d.toDateString()+h} className="border-b border-r p-1">
                  {slotEvents.map(e => (
                    <div key={e.id} className="bg-blue-100 text-xs p-1 mb-1 rounded border border-blue-300">
                      {e.title} (Team {e.teamNumber})
                  <img src={getTeamIcon(e.teamNumber)} alt={`Team ${e.teamNumber}`} className="w-10 h-10 rounded-full" />
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
