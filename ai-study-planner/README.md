# 🎓 AI Study Planner

A Generative-AI web app that turns a student's details (subject, topics, hours/day, exam date, level) into a personalised study plan: topic priorities, daily timetable, revision dates, practice recommendations, tips and exam strategy. Includes a progress tracker and an AI quiz generator (5 MCQs + 5 short answers).

## Architecture

```
Browser (HTML/CSS/JS)  ──POST /api/generate──▶  Node server (server.js)  ──▶  AI provider API
   student form                                  builds the prompt,            returns JSON plan
   renders cards/table  ◀────── JSON plan ─────  holds the secret API key  ◀──
```

The API key lives only on the server (environment variable), never in browser code.

## Run in GitHub Codespaces

```bash
node -v                      # needs Node 18+
export AI_API_KEY="your-key"
export AI_MODEL="model-id"                      # same model you picked in /connect
export AI_BASE_URL="https://opencode.ai/zen/v1" # OpenAI-compatible endpoint
node server.js
```

Codespaces shows a pop-up "Open in Browser" for port 3000.

> The app calls an OpenAI-compatible `/chat/completions` endpoint, so any such provider works — just change `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`.

## Features

- Input form with sample-data button (Rahul / Generative AI / 15 days / 3 h / Beginner)
- Loading spinner, error messages, responsive dashboard layout
- Topic priority cards (High / Medium / Low) with difficulty and a revision date per topic
- Daily timetable table, revision schedule, difficult/important topics, practice recommendations
- Tips personalised by level (Beginner / Intermediate / Advanced)
- Progress tracker (checkboxes → progress bar, saved in the browser)
- Prompt selector: Basic / Structured / Advanced (for Step E)
- Quiz generator, print/PDF button

## Files

| File | Purpose |
|---|---|
| `server.js` | Backend: serves the page, builds prompts, calls the AI API |
| `public/index.html`, `style.css`, `app.js` | Frontend |
| `REPORT.md` | Steps, prompts, comparison, Step F and viva answers |
