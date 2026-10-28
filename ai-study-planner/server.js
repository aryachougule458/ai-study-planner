// AI Study Planner - tiny backend (no npm packages needed, Node 18+).
// It keeps the API key on the server and builds the prompts.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE = (process.env.AI_BASE_URL || 'https://opencode.ai/zen/v1').replace(/\/$/, '');
const KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL;

const SCHEMA = `Return ONLY valid JSON (no markdown fences) with this exact shape:
{
 "summary": "2-3 sentence overview",
 "topics": [{"name": "", "priority": "High|Medium|Low", "difficulty": "Easy|Medium|Hard",
   "hours": 0, "reason": "why this priority", "important": true,
   "revisionDate": "YYYY-MM-DD", "practice": "practice recommendation"}],
 "timetable": [{"day": 1, "date": "YYYY-MM-DD", "target": "daily target",
   "sessions": [{"topic": "", "minutes": 0, "activity": "Learn|Practice|Revise"}]}],
 "revision": {"schedule": [{"date": "YYYY-MM-DD", "focus": ""}], "finalStrategy": ""},
 "difficultTopics": [""], "importantTopics": [""],
 "practiceRecommendations": [""], "tips": [""], "examStrategy": ""
}
Rules: total minutes per day must not exceed the available study hours. Cover every day from today until the day before the exam. Keep text concise.`;

const PROMPTS = {
  basic: 'Create a study plan for this student.',
  structured: (d) =>
    `Create a ${d.daysLeft}-day study plan and divide the topics into daily targets. Include revision and practice sessions.`,
  advanced:
    "Act as an expert academic study planner. Analyze the student's subjects, available study time, knowledge level and examination date. Create an optimized study plan that prioritizes difficult and important topics. Balance learning, practice and revision. Explain why each topic has been assigned its priority and provide an exam-focused revision strategy.",
};

function studentBlock(d) {
  return `Student: ${d.name}
Subject: ${d.subject}
Topics: ${d.topics.join('; ')}
Available study time: ${d.hours} hours/day
Today: ${d.today}
Exam date: ${d.examDate} (${d.daysLeft} days left)
Knowledge level: ${d.level}`;
}

async function callAI(system, user) {
  if (!KEY || !MODEL) throw new Error('Server not configured: set AI_API_KEY and AI_MODEL (and AI_BASE_URL if needed).');
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!r.ok) throw new Error(`AI provider error ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const text = j.choices?.[0]?.message?.content || '';
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('AI did not return JSON. Try again.');
  return JSON.parse(text.slice(s, e + 1));
}

function validate(d) {
  if (!d || !d.name || !d.subject || !Array.isArray(d.topics) || !d.topics.length) return 'Please fill all fields.';
  if (!(d.hours >= 0.5 && d.hours <= 16)) return 'Study hours must be between 0.5 and 16.';
  if (!(d.daysLeft >= 1)) return 'Exam date must be in the future.';
  return null;
}

async function handleApi(req, res, body) {
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
  try {
    const data = JSON.parse(body || '{}');
    const err = validate(data.student);
    if (err) return send(400, { error: err });
    const d = data.student;
    if (req.url === '/api/generate') {
      const p = PROMPTS[data.mode] || PROMPTS.advanced;
      const instruction = typeof p === 'function' ? p(d) : p;
      const plan = await callAI(
        'You are an AI study planner. ' + SCHEMA,
        `${instruction}\n\n${studentBlock(d)}\n\nPersonalise the tips for a ${d.level} learner.`
      );
      return send(200, plan);
    }
    if (req.url === '/api/quiz') {
      const quiz = await callAI(
        'You are an exam question writer. Return ONLY valid JSON: {"mcqs":[{"question":"","options":["A) ","B) ","C) ","D) "],"answer":"A","difficulty":"Easy|Medium|Hard","explanation":""}],"short":[{"question":"","answer":"","difficulty":"Easy|Medium|Hard","explanation":""}]}. Exactly 5 mcqs and 5 short items.',
        `Subject: ${d.subject}\nTopics: ${d.topics.join('; ')}\nLevel: ${d.level}\nCreate the quiz.`
      );
      return send(200, quiz);
    }
    send(404, { error: 'Not found' });
  } catch (e) {
    send(500, { error: e.message });
  }
}

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url.startsWith('/api/')) {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => handleApi(req, res, body));
    return;
  }
  const file = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const full = path.join(__dirname, 'public', path.normalize(file));
  if (!full.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'text/plain' });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`Study Planner running on http://localhost:${PORT}`));
