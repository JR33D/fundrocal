# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

## Creating events via GitHub Issues

You can create a draft event by opening a new GitHub Issue and adding the `event` label (or using the issue template named `Event` if available). When the issue is opened a workflow will:

- parse a JSON code block from the issue body (preferred) or simple `key: value` lines
- append a new event to `public/events.json` and create a branch + pull request

Example issue body (JSON code block):

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

Or as simple key/value lines:

```
title: Community Pancake Breakfast
start: 2025-11-15T08:00:00
end: 2025-11-15T11:00:00
location: Town Hall
description: Breakfast to raise funds
teamNumber: 834
```

The workflow will open a PR so maintainers can review and adjust fields (start/end formatting, timezone, team number) before merging.

Validation rules applied by the automation:

- Required fields: `title`, `teamNumber`, `contact` (email)
- `teamNumber` must be numeric-only (e.g. 834)
- If both `start` and `end` are supplied, `start` must be before `end` (ISO 8601 strings recommended)

If validation fails the workflow will stop and the run logs will show the validation errors for maintainers to correct in the issue.
```
