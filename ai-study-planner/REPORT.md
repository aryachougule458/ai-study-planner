# Practical Assignment No. 7 — AI-Powered Student Study Planner

**Course:** Generative AI Lab  **Tools:** OpenCode, GitHub Codespaces, AI API, HTML/CSS/JS (+ small Node.js backend)

> ✏️ Items marked **[YOU]** must be done on your own machine/account (screenshots, repo link, real model outputs). Everything else is ready to submit.

---

## 1. Short explanation of the project

The AI Study Planner takes a student's name, subject, topics, daily study hours, exam date and knowledge level. The browser sends this to a small Node.js server, which builds a prompt and calls a Generative-AI model through an API. The model returns a structured JSON plan, which the page renders as a dashboard: topic priority cards (High/Medium/Low), a daily timetable, revision dates, practice recommendations, level-specific tips and an exam strategy. Extra features: a progress tracker, and a quiz generator (5 MCQs + 5 short-answer questions with answers, difficulty and explanations).

```
Student Information → Prompt + API call → AI Processing → Personalised Study Plan
```

## 2. Steps to complete (Steps A–D) — checklist

**Step A – AI connection**
1. Sign up at opencode.ai and copy your API key.
2. Sign up at github.com.
3. New repository `ai-study-planner` with README.md.
4. Code → Codespaces → *Create codespace on main*.
5. In the Codespace terminal: `npm i -g opencode-ai`
6. Start it: `opencode`
7. Inside OpenCode: `/connect` → choose provider → paste API key → pick a model. **[YOU] Screenshot this screen (Submission #3).**

**Step B – Build.** Paste the assignment's big prompt into OpenCode (or upload the files from this project). Note the model id you selected.

**Step C – Test.** Run:
```bash
export AI_API_KEY="your-key"; export AI_MODEL="model-id"; export AI_BASE_URL="https://opencode.ai/zen/v1"
node server.js
```
Open the forwarded port 3000, click **Fill sample data (Rahul)** → **Generate Study Plan**. **[YOU] Screenshot the input form and the generated output (Submission #2, #4).**

**Step D – Features** (already implemented in this project; if you want to demonstrate OpenCode, paste these as prompts):
1. *"Add a progress bar showing the percentage of topics completed."*
2. *"Classify each topic as High, Medium or Low priority with colour-coded cards."*
3. *"Generate a recommended revision date for every topic."*
4. *"Generate different study tips for Beginner, Intermediate and Advanced students."*

**Extension:** Quiz generator (button at the bottom of the plan).

---

## 3. Three prompts used for experimentation (Step E)

| # | Type | Prompt |
|---|---|---|
| 1 | Basic | *Create a study plan for this student.* |
| 2 | Structured | *Create a 15-day study plan and divide the topics into daily targets. Include revision and practice sessions.* |
| 3 | Advanced | *Act as an expert academic study planner. Analyze the student's subjects, available study time, knowledge level and examination date. Create an optimized study plan that prioritizes difficult and important topics. Balance learning, practice and revision. Explain why each topic has been assigned its priority and provide an exam-focused revision strategy.* |

In the app, use the **Prompt style** dropdown to switch. The student data (name, subject, topics, hours, dates, level) is appended to each prompt automatically.

## 4. Comparison of the three outputs

Run each prompt with the Rahul sample data and fill in your observed result. The "typical behaviour" column is what these prompt styles generally produce from LLMs; **replace with what you actually saw [YOU]**.

| Aspect | Prompt 1 – Basic | Prompt 2 – Structured | Prompt 3 – Advanced |
|---|---|---|---|
| Typical length/detail | Short, generic | Medium, day-by-day | Longest, most detailed |
| Daily timetable | Vague or weekly grouping | Full 15-day plan | Full plan, time-boxed |
| Topic priorities | Often missing/implicit | Sometimes included | Explicit High/Med/Low with reasons |
| Revision plan | Brief mention | Revision/practice days included | Spaced revision + final strategy |
| Reasoning for choices | None | Little | Explained for every topic |
| Matches student's level/time | Weak | Moderate | Strong |
| **Your observation [YOU]** | | | |

**Conclusion:** Prompt 3 (Advanced) is expected to be best, because it gives the model a role, tells it which inputs to analyse, states the goals (balance learning/practice/revision) and requires explanations — leaving less room for generic output. Prompt 2 beats Prompt 1 because it fixes the time horizon and the output structure. Confirm this against your own outputs and adjust the table.

---

## 5. Step F — Answers

1. **How does Generative AI generate the study plan?** A large language model predicts text token by token based on patterns learned in training. Given the student's details and instructions, it produces a plan that statistically fits what a good study plan looks like; it is generated fresh for each input rather than looked up.
2. **What is given to the AI as input?** The prompt (instructions + required JSON format) plus student name, subject, topics, hours/day, today's date, exam date, days left, and knowledge level.
3. **Role of the API?** It is the interface that lets our app send the prompt over HTTPS to the hosted model and receive the response (the plan) back, without running the model ourselves.
4. **Why an API key?** It identifies and authenticates the account, controls access, enforces rate limits and billing.
5. **Role of OpenCode?** An AI coding assistant in the terminal: it connects to a model provider and helps write, edit and debug the application from natural-language prompts.
6. **Role of GitHub Codespaces?** A cloud-hosted development environment (VS Code in the browser) with Node.js preinstalled, so the app can be built, run and shared without local setup; it also hosts the repo.
7. **How does changing the prompt affect the output?** The prompt defines role, scope, format and depth. Vague prompts give generic plans; specific, structured prompts give detailed, structured, more useful plans.
8. **Which prompt was best and why?** The Advanced prompt (Prompt 3) — role-based, analytical, requires reasoning and an exam-focused strategy. *(Confirm with your observations.)*
9. **What happens when study hours are reduced?** The plan has less time per topic, so the AI must prioritise: low-priority topics are shortened or covered only in revision, sessions get shorter, and High-priority/difficult topics get most of the time. If hours are too few, the plan may not cover everything.
10. **How can it be improved?** User login and saved plans; calendar/reminder integration (Google Calendar, notifications); real progress analytics; upload syllabus/PDF; streaming responses; multiple subjects with clash detection; adaptive re-planning when days are missed; export to PDF/Excel; mobile app version; caching to cut API cost.

---

## 6. Challenges faced (sample — edit to your real experience)

- Getting the model to return strictly valid JSON (solved with a schema in the prompt and extracting the text between the first `{` and last `}`).
- Keeping the API key secret (solved by calling the AI from the server using environment variables, never from browser code).
- Making the plan fit the available hours and dates (solved by passing days left and the rule "total minutes per day must not exceed available hours").
- Differences between providers' model names/endpoints (made `AI_BASE_URL` and `AI_MODEL` configurable).
- Layout on small screens (CSS grid with a mobile breakpoint).
- AI output varying between runs (lowered temperature to 0.4).

## 7. Suggestions for future improvements
See Step F, Q10. Also: input validation of AI output, offline mode, multi-language support, voice input.

---

## 8. Viva questions — model answers

1. **Generative AI** — AI that creates new content (text, images, code, audio) learned from data, e.g. ChatGPT, Claude.
2. **API** — Application Programming Interface: a defined way for one program to request services/data from another, usually over HTTP.
3. **Why an API key** — to authenticate the caller, track usage/billing and prevent misuse.
4. **OpenCode** — an open-source AI coding agent that runs in the terminal and connects to many model providers.
5. **GitHub Codespaces** — a cloud development environment configured from a GitHub repository, accessed in the browser.
6. **Prompt engineering** — designing and refining the instructions given to an AI model (role, context, format, constraints, examples) to get better outputs.
7. **Normal program vs AI-powered app** — a normal program follows fixed, hand-written rules and gives deterministic output; an AI app delegates part of the logic to a model, producing flexible, context-dependent (and variable) output.
8. **How the prompt influences output** — the model conditions its response on the prompt; role, detail, format and constraints directly shape content, structure and quality.
9. **Why keep API keys private** — anyone with the key can use your quota, incur charges, and access your account's data; leaked keys must be revoked. Never commit them to GitHub (use environment variables / `.gitignore`).
10. **Convert to a mobile app** — wrap the responsive web app as a PWA, or use Capacitor/Cordova (WebView), or rebuild in React Native/Flutter that calls the same backend API; host the backend publicly.

---

## 9. Submission checklist

| # | Item | Status |
|---|---|---|
| 1 | GitHub repository link | **[YOU]** push this project to `ai-study-planner` |
| 2 | App screenshots | **[YOU]** |
| 3 | OpenCode `/connect` screenshot | **[YOU]** |
| 4 | Successful AI output screenshot | **[YOU]** |
| 5 | Source code | ✅ `server.js`, `public/*` |
| 6 | Three prompts | ✅ Section 3 |
| 7 | Comparison of outputs | ⚠️ Fill your observations in Section 4 |
| 8 | Short explanation | ✅ Section 1 |
| 9 | Challenges | ✅ Section 6 |
| 10 | Future improvements | ✅ Section 7 |
