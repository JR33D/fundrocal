---
name: Event
about: Create a new event that will generate a PR to add it to public/events.json
title: "Event: "
labels: event
assignees: ''
---

Please provide event details below. Preferred format: a JSON code block (see example). The automation will parse the JSON block or simple key/value lines and open a PR to add the event to `public/events.json`.

Required: title, teamNumber, contact
Optional but recommended: start, end (ISO 8601), location, description

Example (JSON code block):

```json
{
  "title": "Event Title",
  "teamNumber": 103,
  "contact": "email@contact.com",
  "start": "2025-11-15T08:00:00",
  "end": "2025-11-15T11:00:00",
  "location": "Event Location",
  "description": "Breif Description"
}
```

Or simple key/value lines:

```
title: Event title
teamNumber: 103
contact: email@contact.com
start: 2025-11-15T08:00:00
end: 2025-11-15T11:00:00
location: Event Location
description: Breif Description
```

After opening the issue the workflow will create a branch and a pull request adding the entry. Maintainers will review before merging.
