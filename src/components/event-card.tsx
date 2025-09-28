import { useState } from 'react';

interface EventProps {
  title: string;
  start: string;
  end: string;
  teamNumber: number;
  teamIcon?: string;
  location?: string;
  description?: string;
}

export default function EventCard({ title, start, end, teamNumber, teamIcon, location, description }: EventProps) {
    const [iconExists, setIconExists] = useState(true);

  return (
    <div className="flex items-start gap-3 p-3 mb-2 rounded-lg border border-gray-200 shadow-sm bg-white hover:bg-gray-50 transition">
      {teamIcon && iconExists && (
        <img
          src={teamIcon}
          alt={`Team ${teamNumber}`}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          onError={() => setIconExists(false)}
        />
      )}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-500">{new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {location && <p className="text-sm text-gray-600 mb-1">{location}</p>}
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
}
