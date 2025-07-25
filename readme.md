# SubTask

SubTask is a desktop project and task breakdown assistant built with Electron. It helps you split projects and steps into smaller, actionable substeps, recursively, in a clear and practical way.

## Features

- **Project and Step Management:** Create, edit, and delete projects and steps.
- **Recursive Task Breakdown:** Use AI (OpenAI API) to break down tasks into substeps.
- **Rich Sidebar:** Quickly navigate between projects.
- **Theme Customization:** Change the app’s appearance with a built-in theme editor.
- **Settings Modal:** Store your OpenAI API key and preferred model securely.
- **Persistent Storage:** All data is saved locally in your user data folder.
- **Electron Desktop App:** Cross-platform, runs on Windows, macOS, and Linux.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd SubTask
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the app:**
   ```sh
   npm start
   ```

### Packaging

To build a distributable app, use [Electron Forge](https://www.electronforge.io/) or [Electron Builder](https://www.electron.build/).

## Usage

- **Create a Project:** Click "New Project" in the sidebar.
- **Break Down Steps:** Click "Subtask this" on any step or substep.
- **Edit JSON:** Use the ⋮ menu next to a project to edit its raw JSON.
- **Theme & Settings:** Use the Preferences menu in the top navbar.
- **Save/Load:** All changes are saved automatically.

## Configuration

- **OpenAI API Key:** Set your API key in Preferences > Settings.
- **Model Selection:** Choose your preferred OpenAI model in Settings.
- **Theme:** Customize colors in Preferences > Theme.

## File Structure

- `main.js` — Electron main process, handles window and file I/O.
- `preload.js` — Secure bridge for renderer to access file APIs.
- `script.js` — Main UI logic and rendering.
- `style.css` — App styling and theming.
- `index.html` — Main HTML file.
- `icon.png` — App icon.
- `data.json` — User data (auto-generated in your user data folder).
- `system_prompt.txt` — Prompt template for AI breakdowns.

## Notes

- For best results on Windows, use a `.ico` file for the app icon.
- All user data is stored locally; no cloud sync is provided.
- The app requires an OpenAI API key for AI-powered breakdowns.

## License

MIT

---

**Made with ❤️ using [Electron](https://www.electronjs.org/).**