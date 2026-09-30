# pi-taste

My look-and-feel layer for pi. Not needed for anything to work; leave it out when sharing.

| Extension | What it does |
|---|---|
| `tui-tool-calls.ts` | Custom tool-call rendering (split bash pipelines, "Loaded <rules>" lines) |
| `tui-skill-invocations.ts` | Renders `/skill:name` like tool calls |
| `statusline.ts` | Custom footer status line |
| `working-timer.ts` | Rainbow spinner with elapsed time |
| `usage.ts` | `/usage`: Copilot quota and Codex rate limits |
| `system-prompt.ts` | `/system-prompt` inspector |
| `brainstorm-mode/` | Tab-toggled read-only brainstorm mode |


## Depends on pi-core

Imports `../../pi-core/extensions/shared/*`, so pi-core must be a sibling directory:
`~/Developer/pi-core` + `~/Developer/pi-taste` locally, or both installed as
`git:github.com/smeshko/...` (pi places them side by side under `<agentDir>/git/github.com/smeshko/`).
Load order in settings: pi-core first.
