const fs = require('fs');
const path = require('path');

beforeEach(() => {
  jest.resetModules();     // reset require cache
  jest.resetAllMocks();    // reset mocks between tests

  // Provide fresh mocks for fs
  fs.existsSync = jest.fn();
  fs.readFileSync = jest.fn();
  fs.writeFileSync = jest.fn();

  // Default env so parseEventFromBody sees them on require
  process.env.ISSUE_TITLE = "Fallback Title";
});

// Helper to load the module fresh with current env
function loadModule() {
  return require('../scripts/add-event.cjs');
}

describe('extractCodeBlock', () => {
  test('extracts JSON block', () => {
    const { extractCodeBlock } = loadModule();
    const body = "```json\n{ \"title\": \"Test\" }\n```";
    expect(extractCodeBlock(body)).toBe('{ "title": "Test" }');
  });
});

describe('parseKeyValue', () => {
  test('parses kv pairs', () => {
    const { parseKeyValue } = loadModule();
    const body = "title: My Event\nteamNumber: 123";
    expect(parseKeyValue(body)).toEqual({ title: 'My Event', teamNumber: 123 });
  });
});

describe('parseEventFromBody', () => {
  test('uses JSON block', () => {
    const { parseEventFromBody } = loadModule();
    const body = "```json\n{ \"title\": \"My Event\" }\n```";
    expect(parseEventFromBody(body)).toEqual({ title: 'My Event' });
  });

  test('falls back to ISSUE_TITLE', () => {
    const { parseEventFromBody } = loadModule();
    expect(parseEventFromBody("")).toEqual({ title: "Fallback Title" });
  });
});

describe('readEvents/writeEvents', () => {
  const eventsPath = path.join(process.cwd(), 'public', 'events.json');

  test('returns [] if missing', () => {
    const { readEvents } = loadModule();
    fs.existsSync.mockReturnValue(false);
    expect(readEvents()).toEqual([]);
  });

  test('writes file', () => {
    const { writeEvents } = loadModule();
    const events = [{ id: 1 }];
    writeEvents(events);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      eventsPath,
      JSON.stringify(events, null, 2) + '\n',
      'utf8'
    );
  });
});

describe('makeId', () => {
  test('increments max id', () => {
    const { makeId } = loadModule();
    expect(makeId([{ id: 2 }, { id: 5 }])).toBe(6);
  });
});

describe('sanitizeBranchName', () => {
  test('cleans name', () => {
    const { sanitizeBranchName } = loadModule();
    expect(sanitizeBranchName("Hello World!!")).toBe("hello-world");
  });
});

describe('main integration', () => {
  let exitSpy, logSpy, errorSpy;
  const eventsPath = path.join(process.cwd(), 'public', 'events.json');

  beforeEach(() => {
    jest.resetModules();
    fs.existsSync = jest.fn();
    fs.readFileSync = jest.fn();
    fs.writeFileSync = jest.fn();

    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function load() {
    return require('../scripts/add-event.cjs');
  }

  test('fails if missing required fields', async () => {
    process.env.ISSUE_BODY = "```json\n{ \"title\": \"\" }\n```"; // empty title
    process.env.ISSUE_TITLE = "";
    process.env.ISSUE_NUMBER = "42";

    const { main } = load();

    await expect(main()).rejects.toThrow('process.exit');
    expect(errorSpy.mock.calls.some(call => call.join(' ').includes('Validation failed:'))).toBe(true);
    expect(errorSpy.mock.calls.some(call => call.join(' ').includes('title is required'))).toBe(true);
  });

  test('fails if teamNumber is non-numeric', async () => {
    process.env.ISSUE_BODY = "```json\n{ \"title\": \"My Event\", \"teamNumber\": \"ABC\", \"contact\": \"a@b.com\" }\n```";
    process.env.ISSUE_NUMBER = "43";

    const { main } = load();

    await expect(main()).rejects.toThrow('process.exit');
    expect(errorSpy.mock.calls.some(call => call.join(' ').includes('teamNumber must be numeric only'))).toBe(true);
  });

  test('fails if email is invalid', async () => {
    process.env.ISSUE_BODY = "```json\n{ \"title\": \"My Event\", \"teamNumber\": 123, \"contact\": \"not-an-email\" }\n```";
    process.env.ISSUE_NUMBER = "44";

    const { main } = load();

    await expect(main()).rejects.toThrow('process.exit');
    expect(errorSpy.mock.calls.some(call => call.join(' ').includes('contact must be a valid email'))).toBe(true);
  });

  test('fails if start >= end', async () => {
    process.env.ISSUE_BODY = "```json\n{ \"title\": \"My Event\", \"teamNumber\": 123, \"contact\": \"a@b.com\", \"start\": \"2025-01-01\", \"end\": \"2025-01-01\" }\n```";
    process.env.ISSUE_NUMBER = "45";

    const { main } = load();

    await expect(main()).rejects.toThrow('process.exit');
    expect(errorSpy.mock.calls.some(call => call.join(' ').includes('start must be before end'))).toBe(true);
  });

  test('happy path: appends new event and suggests branch name', async () => {
    const validBody = {
      title: "My Event",
      teamNumber: 123,
      contact: "a@b.com",
      start: "2025-01-01",
      end: "2025-01-02"
    };

    process.env.ISSUE_BODY = "```json\n" + JSON.stringify(validBody) + "\n```";
    process.env.ISSUE_NUMBER = "46";

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue("[]"); // start empty

    const { main } = load();

    await main();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      eventsPath,
      expect.stringContaining('"title": "My Event"'),
      'utf8'
    );

    // fix for multi-arg console.log
    expect(logSpy.mock.calls.some(call => call.join(' ').includes('Suggested branch name:'))).toBe(true);
  });

  test('fails if existing events.json is invalid JSON', async () => {
    process.env.ISSUE_BODY = "```json\n{ \"title\": \"My Event\", \"teamNumber\": 123, \"contact\": \"a@b.com\" }\n```";
    process.env.ISSUE_NUMBER = "47";

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue("not-json");

    const { main } = load();

    await expect(main()).rejects.toThrow('process.exit');

    // fix for multi-arg console.error
    expect(errorSpy.mock.calls.some(call => call.join(' ').includes('Failed to parse existing events.json:'))).toBe(true);
  });
});
