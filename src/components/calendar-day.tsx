import React from 'react';
import EventCard from './event-card';

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  teamNumber: number;
}

export default function CalendarDay({ events, currentDate }: { events: Event[]; currentDate: Date }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(e => new Date(e.start).toDateString() === currentDate.toDateString());

  function getTeamIcon(teamNumber: number) {
    return `/team-icons/frc${teamNumber}.png`;
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
      </h2>
      <div className="grid grid-cols-2 border-t border-l">
        <div className="bg-gray-100 p-2 text-xs">Time</div>
        <div className="bg-gray-100 p-2 text-xs">Events</div>
        {hours.map(h => (
          <React.Fragment key={h}>
            <div className="border-b border-r p-1 text-xs text-right">{h}:00</div>
            <div className="border-b p-1">
              {dayEvents.map(e => (
                <EventCard
                  key={e.id}
                  title={e.title}
                  start={e.start}
                  end={e.end}
                  teamNumber={e.teamNumber}
                  teamIcon={getTeamIcon(e.teamNumber)}
                  location={e.location}
                  description={e.description}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
