<div align="center">

# Captain Todo · 船长待办

A local-first desktop kanban: columns per project, drag cards into order, and your data stays on your own computer.

[简体中文](README.md) · English

</div>

![Captain Todo](index.png)

## What it is

Once there's enough going on, a to-do list stops being enough. You want separate projects, columns for "not started, doing, done", cards you can drag around, and you'd rather not hand all of it to a cloud service. Captain Todo is a small tool for exactly that.

- Keep several projects and switch between them; each one gets its own board.
- Add, rename and recolor columns as you like.
- Cards hold a title, description, priority, dates and a done flag, and can be dragged within a column or across columns.
- Everything is stored in a local SQLite database. No network, no account.

Want to see it first? There's an [online preview](https://heihuzicity-todo.figma.site/).

## Getting it running

You need Node.js 18 or newer, plus Rust 1.85 or newer to run or package the desktop app.

```bash
npm install
npm run tauri:dev      # desktop app in development mode
npm run tauri:build    # build the desktop installer
```

To just look at the UI in a browser, run `npm run dev` and open `http://localhost:5173`.

## Development

The UI is React and TypeScript, Tauri 2 turns it into a desktop app, and data access happens on the Rust side.

```text
src/          React UI: board, cards, project switcher, state hooks
src-tauri/    Rust backend: Tauri commands, SQLite schema, migrations and CRUD
docs/         project notes
```

Architecture, data flow and conventions are in the [project notes](docs/项目说明.md) (in Chinese).

## License

[MIT](LICENSE).

---

<sub>Part of the Captain series from [heihuzi-labs](https://github.com/heihuzi-labs): [Captain Agents](https://github.com/heihuzi-labs/captain-agents) · [Captain Kube](https://github.com/heihuzi-labs/captain-kube) · [Captain Ops](https://github.com/heihuzi-labs/captain-ops) · **Captain Todo**</sub>
