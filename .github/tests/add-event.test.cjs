const fs = require('fs');
const path = require('path');

beforeEach(() => {
  jest.resetModules();
  jest.resetAllMocks();

  // Mock fs
  fs.existsSync = jest.fn();
  fs.readFileSync = jest.fn();
  fs.writeFileSync = jest.fn();

  // Default env
  process.env.ISSUE_TITLE = "Fallback Title";
});

function loadModule() {
  return require('../scripts/add-event.cjs');
}

describe('extractCodeBlock', () => {
  test('extracts JSON block', () => {
    const { extractCodeBlock } = loadModule();
    const body = "```json\n{ \"title\": \"Test\" }\n```";
    expect(extractCodeBlock(body)).toBe('{ "title": "Test" }');
  });

  test('handles escaped GitHub Action ISSUE_BODY', () => {
    const { extractCodeBlock } = loadModule();
    const body = '"```json\\n{ \\"title\\": \\"Test\\" }\\n```"';
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

  test('happy path: appends new event', async () => {
    const { main } = loadModule();

    // Simulate GitHub ISSUE_BODY with escaped newlines
    process.env.ISSUE_BODY =
      '"```json\\n{ \\"title\\": \\"Hatboro Havoc\\", \\"start\\": \\"2025-10-11T08:00:00\\", \\"end\\": \\"2025-10-11T19:00:00\\", \\"location\\": \\"Hatboro-Horsham High School\\", \\"description\\": \\"An off-season FIRST Robotics Competition Event\\", \\"teamNumber\\": 708, \\"contact\\": \\"hhrobotics@hatboro-horsham.org\\" }\\n```"';
    process.env.ISSUE_NUMBER = "100";

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue("[]");

    await main();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      eventsPath,
      expect.stringContaining('"title": "Hatboro Havoc"'),
      'utf8'
    );

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Suggested branch name:'));
  });
});
