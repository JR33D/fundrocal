# Run this in PowerShell
# Usage: ./setup-fundrocal-vite.ps1

Write-Host "🚀 Setting up Fundrocal (Vite + React + TS + Tailwind)..."

# 1. Create Vite project
npm create vite@latest fundrocal -- --template react-ts

# 2. Move into project folder
Set-Location fundrocal

# 3. Install dependencies
npm install

# 4. Install TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. Configure Tailwind
Set-Content tailwind.config.js @"
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@

Set-Content src/index.css @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@

# 6. Create components directory
New-Item -ItemType Directory -Force -Path src/components

# 7. Add CalendarMonth.tsx
Set-Content src/components/calendar-month.tsx @"
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

export default function CalendarMonth({ events, currentDate }: { events: Event[]; currentDate: Date }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days: Date[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        {currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="font-bold text-center">{d}</div>
        ))}
        {days.map(day => {
          const dayEvents = events.filter(e => new Date(e.start).toDateString() === day.toDateString());
          return (
            <div key={day.toISOString()} className="border p-2 rounded min-h-[80px]">
              <div className="text-xs font-semibold">{day.getDate()}</div>
              {dayEvents.map(e => (
                <div key={e.id} className="bg-blue-100 text-xs p-1 my-1 rounded">
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
"@

# 8. Add CalendarWeek.tsx
Set-Content src/components/calendar-week.tsx @"
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
"@

# 9. Add CalendarDay.tsx
Set-Content src/components/calendar-day.tsx @"
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

export default function CalendarDay({ events, currentDate }: { events: Event[]; currentDate: Date }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(e => new Date(e.start).toDateString() === currentDate.toDateString());

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
              {dayEvents.filter(e => {
                const start = new Date(e.start);
                const end = new Date(e.end);
                return start.getHours() <= h && end.getHours() > h;
              }).map(e => (
                <div key={e.id} className="bg-green-100 text-xs p-1 mb-1 rounded border border-green-300">
                  {e.title} (Team {e.teamNumber})
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
"@

# 10. Overwrite App.tsx
Set-Content src/app.tsx @"
import React, { useEffect, useState } from 'react';
import CalendarMonth from './components/calendar-month';
import CalendarWeek from './components/calendar-week';
import CalendarDay from './components/calendar-day';

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  location: string;
  description: string;
  teamNumber: number;
}

type ViewMode = 'month' | 'week' | 'day';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | 'all'>('all');
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetch('events.json')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  const teams = Array.from(new Set(events.map(e => e.teamNumber))).sort();
  const filteredEvents = selectedTeam === 'all'
    ? events
    : events.filter(e => e.teamNumber === selectedTeam);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fundrocal</h1>
      <p className="mb-4 italic">You're insight into all the local fundraising going on.</p>

      <div className="flex gap-4 mb-4">
        <label>
          <span className="font-semibold">Filter by Team:</span>
          <select className="ml-2 border rounded p-1"
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Teams</option>
            {teams.map(team => <option key={team} value={team}>Team {team}</option>)}
          </select>
        </label>

        <div>
          <span className="font-semibold mr-2">View:</span>
          <button className={\`px-2 py-1 border rounded mr-1 \${view==='month'?'bg-blue-200':''}\`} onClick={() => setView('month')}>Month</button>
          <button className={\`px-2 py-1 border rounded mr-1 \${view==='week'?'bg-blue-200':''}\`} onClick={() => setView('week')}>Week</button>
          <button className={\`px-2 py-1 border rounded \${view==='day'?'bg-blue-200':''}\`} onClick={() => setView('day')}>Day</button>
        </div>
      </div>

      {view==='month' && <CalendarMonth events={filteredEvents} currentDate={currentDate} />}
      {view==='week' && <CalendarWeek events={filteredEvents} currentDate={currentDate} />}
      {view==='day' && <CalendarDay events={filteredEvents} currentDate={currentDate} />}
    </div>
  );
}

export default App;
"@

# 11. Create events.json
Set-Content public/events.json @"
[
  {
    \"id\": 1,
    \"title\": \"Charity Bake Sale\",
    \"start\": \"2025-10-01T10:00:00\",
    \"end\": \"2025-10-01T14:00:00\",
    \"location\": \"Community Center\",
    \"description\": \"Raising funds for local shelter.\",
    \"teamNumber\": 12
  },
  {
    \"id\": 2,
    \"title\": \"5K Run for Cancer Research\",
    \"start\": \"2025-10-03T08:00:00\",
    \"end\": \"2025-10-03T12:00:00\",
    \"location\": \"City Park\",
    \"description\": \"Annual fundraiser run.\",
    \"teamNumber\": 8
  }
]
"@

# 12. Add GitHub Actions for GitHub Pages
New-Item -ItemType Directory -Force -Path .github/workflows
Set-Content .github/workflows/deploy.yml @'
name: Deploy Fundrocal to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Upload build output
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
'@



Write-Host "✅ Fundrocal setup complete!"
Write-Host "Next steps:"
Write-Host "1. cd fundrocal"
Write-Host "2. npm run dev (to start local dev server)"
Write-Host "3. Push to GitHub, GitHub Actions will deploy to Pages"
