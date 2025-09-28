---
name: Event
about: Create a new event that will generate a PR to add it to public/events.json
title: "Event: "
labels: event
assignees: ''
---

Please provide event details below. Preferred format: a JSON code block (see example). The automation will parse the JSON block or simple key/value lines and open a PR to add the event to `public/events.json`.

Required: title

Optional but recommended: start, end (ISO 8601), location, description, teamNumber

Example (JSON code block):

```json
{
  "title": "Community Pancake Breakfast",
  "start": "2025-11-15T08:00:00",
  "end": "2025-11-15T11:00:00",
  "location": "Town Hall",
  "description": "Breakfast to raise funds",
  "teamNumber": 834
}
```

Or simple key/value lines:

```
title: Community Pancake Breakfast
start: 2025-11-15T08:00:00
end: 2025-11-15T11:00:00
location: Town Hall
description: Breakfast to raise funds
teamNumber: 834
```

After opening the issue the workflow will create a branch and a pull request adding the entry. Maintainers will review before merging.
