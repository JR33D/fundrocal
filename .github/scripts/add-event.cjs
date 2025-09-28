#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
const eventsPath = path.join(workspace, "public", "events.json");

const issueBody = (process.env.ISSUE_BODY || "").trim();
const issueTitle = (process.env.ISSUE_TITLE || "").trim();
const issueNumber = (process.env.ISSUE_NUMBER || "").trim();

function extractCodeBlock(body) {
  if (!body) return null;

  body = String(body);

  // Remove surrounding quotes
  if ((body.startsWith('"') && body.endsWith('"')) ||
      (body.startsWith("'") && body.endsWith("'"))) {
    body = body.slice(1, -1);
  }

  // Replace escaped newlines and quotes
  body = body.replace(/\\r\\n/g, '\n')
             .replace(/\\n/g, '\n')
             .replace(/\\"/g, '"');

  // Match code block
  const re = /```(?:json|yaml)?\s*([\s\S]*?)```/i;
  const m = body.match(re);
  return m ? m[1] : null;
}

function parseKeyValue(body) {
  const lines = body.split(/\r?\n/);
  const obj = {};
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (/^\d+$/.test(val)) val = parseInt(val, 10);
    obj[key] = val;
  }
  return Object.keys(obj).length ? obj : null;
}

function parseEventFromBody(body) {
  const block = extractCodeBlock(body);
  if (block) {
    try {
      return JSON.parse(block);
    } catch (e) {}
  }

  const kv = parseKeyValue(body);
  if (kv) return kv;

  if (issueTitle) return { title: issueTitle };
  return null;
}

function readEvents() {
  if (!fs.existsSync(eventsPath)) {
    console.log("events.json not found, creating new array");
    return [];
  }
  const content = fs.readFileSync(eventsPath, "utf8");
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse existing events.json:", e.message);
    process.exit(1);
  }
}

function writeEvents(events) {
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2) + "\n", "utf8");
}

function makeId(events) {
  const max = events.reduce((acc, e) => Math.max(acc, Number(e?.id) || 0), 0);
  return max + 1;
}

function sanitizeBranchName(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

async function main() {
  console.log("Parsing issue #" + issueNumber);
  const parsed = parseEventFromBody(issueBody);
  if (!parsed) {
    console.error(
      "Could not parse an event from the issue body. Expect a JSON code block or key: value lines."
    );
    process.exit(1);
  }

  const events = readEvents();

  const newEvent = Object.assign({}, parsed);
  if (!newEvent.title) newEvent.title = issueTitle || newEvent.title;

  const errors = [];

  if (!newEvent.title) errors.push("title is required");

  if (newEvent.teamNumber === undefined || newEvent.teamNumber === null || newEvent.teamNumber === "") {
    errors.push("teamNumber is required");
  } else {
    const tn = String(newEvent.teamNumber).trim();
    if (!/^\d+$/.test(tn)) errors.push("teamNumber must be numeric only");
    else newEvent.teamNumber = parseInt(tn, 10);
  }

  if (!newEvent.contact) errors.push("contact (email) is required");
  else {
    const email = String(newEvent.contact).trim();
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(email)) errors.push("contact must be a valid email address");
  }

  if (newEvent.start && newEvent.end) {
    const s = new Date(newEvent.start);
    const e = new Date(newEvent.end);
    if (isNaN(s.getTime())) errors.push("start must be a valid date/time (ISO 8601 recommended)");
    if (isNaN(e.getTime())) errors.push("end must be a valid date/time (ISO 8601 recommended)");
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s >= e)
      errors.push("start must be before end");
  }

  if (errors.length) {
    console.error("Validation failed:");
    errors.forEach(err => console.error("- " + err));
    try {
      const errFile = path.join(workspace, "validation-errors.txt");
      fs.writeFileSync(errFile, errors.map(e => "- " + e).join("\n") + "\n", "utf8");
      console.log("Wrote validation errors to", errFile);
    } catch (writeErr) {
      console.error("Failed to write validation errors file:", writeErr.message);
    }
    process.exit(1);
  }

  newEvent.id = makeId(events);
  events.push(newEvent);

  writeEvents(events);

  console.log("Appended new event with id", newEvent.id);
  console.log("Wrote", eventsPath);
  const branch = "add-event-" + newEvent.id + "-" + sanitizeBranchName(newEvent.title);
  console.log("Suggested branch name:", branch);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  module.exports = {
    extractCodeBlock,
    parseKeyValue,
    parseEventFromBody,
    readEvents,
    writeEvents,
    makeId,
    sanitizeBranchName,
    main,
  };
}
