const $ = (id) => document.getElementById(id);
let student = null;
let plan = null;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// default exam date = 15 days from today
(function () {
  const d = new Date(); d.setDate(d.getDate() + 15);
  $('exam').value = iso(d);
  $('exam').min = iso(new Date(Date.now() + 86400000));
})();

$('sample').onclick = () => {
  $('name').value = 'Rahul';
  $('subject').value = 'Generative Artificial Intelligence';
  $('topics').value = ['Introduction to Generative AI', 'Neural Networks', 'Transformers', 'Large Language Models', 'Prompt Engineering', 'Generative AI Applications'].join('\n');
  $('hours').value = 3; $('level').value = 'Beginner';
  const d = new Date(); d.setDate(d.getDate() + 15); $('exam').value = iso(d);
};

function readForm() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exam = new Date($('exam').value + 'T00:00:00');
  return {
    name: $('name').value.trim(),
    subject: $('subject').value.trim(),
    topics: $('topics').value.split('\n').map((t) => t.trim()).filter(Boolean),
    hours: parseFloat($('hours').value),
    examDate: $('exam').value,
    today: iso(today),
    daysLeft: Math.round((exam - today) / 86400000),
    level: $('level').value,
  };
}

async function api(path, body) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}

$('form').onsubmit = async (e) => {
  e.preventDefault();
  student = readForm();
  $('error').classList.add('hidden'); $('empty').classList.add('hidden'); $('output').classList.add('hidden');
  $('loading').classList.remove('hidden'); $('go').disabled = true;
  try {
    plan = await api('/api/generate', { student, mode: $('mode').value });
    render();
  } catch (err) {
    $('error').textContent = '⚠️ ' + err.message; $('error').classList.remove('hidden');
  } finally {
    $('loading').classList.add('hidden'); $('go').disabled = false;
  }
};

const list = (id, items) => { $(id).innerHTML = (items || []).map((x) => `<li>${esc(x)}</li>`).join(''); };

// ---- Progress tracker (Feature 1), saved per student+subject in localStorage ----
const storeKey = () => `progress:${student.name}:${student.subject}`;
const loadDone = () => { try { return JSON.parse(localStorage.getItem(storeKey())) || []; } catch { return []; } };
function updateProgress() {
  const boxes = [...document.querySelectorAll('.topic input')];
  const done = boxes.filter((b) => b.checked).length;
  const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
  $('barFill').style.width = pct + '%';
  $('barText').textContent = `${pct}% complete (${done} of ${boxes.length} topics)`;
  try { localStorage.setItem(storeKey(), JSON.stringify(boxes.filter((b) => b.checked).map((b) => b.dataset.name))); } catch {}
}

function render() {
  $('summaryCard').innerHTML = `<h2>👤 ${esc(student.name)} — ${esc(student.subject)}</h2>
    <p>📅 Exam: <b>${esc(student.examDate)}</b> (${student.daysLeft} days) · ⏱️ ${student.hours} h/day · 🎚️ ${esc(student.level)}</p>
    <p>${esc(plan.summary)}</p>`;

  const done = loadDone();
  const order = { High: 0, Medium: 1, Low: 2 };
  const topics = [...(plan.topics || [])].sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  $('topicCards').innerHTML = topics.map((t) => `
    <div class="topic ${esc(t.priority)}">
      <h4>${t.important ? '⭐ ' : ''}${esc(t.name)}</h4>
      <span class="badge ${esc(t.priority)}">${esc(t.priority)} Priority</span>
      <span class="badge" style="background:#64748b">${esc(t.difficulty)}</span>
      <p>⏱️ ${esc(t.hours)} h total</p>
      <p>🔁 Revise on: <b>${esc(t.revisionDate)}</b></p>
      <p>${esc(t.reason)}</p>
      <p>✍️ ${esc(t.practice)}</p>
      <label><input type="checkbox" data-name="${esc(t.name)}" ${done.includes(t.name) ? 'checked' : ''}> Completed</label>
    </div>`).join('');
  document.querySelectorAll('.topic input').forEach((b) => (b.onchange = updateProgress));
  updateProgress();

  $('timetable').innerHTML = '<tr><th>Day</th><th>Date</th><th>Target</th><th>Sessions</th></tr>' +
    (plan.timetable || []).map((d) => `<tr><td>${esc(d.day)}</td><td>${esc(d.date)}</td><td>${esc(d.target)}</td>
      <td>${(d.sessions || []).map((s) => `${esc(s.topic)} — ${esc(s.minutes)} min <i>(${esc(s.activity)})</i>`).join('<br>')}</td></tr>`).join('');

  $('revision').innerHTML = (plan.revision?.schedule || []).map((r) => `<li><b>${esc(r.date)}</b>: ${esc(r.focus)}</li>`).join('');
  $('finalStrategy').textContent = plan.revision?.finalStrategy || '';
  list('difficult', plan.difficultTopics); list('important', plan.importantTopics);
  list('practice', plan.practiceRecommendations); list('tips', plan.tips);
  $('levelBadge').textContent = student.level;
  $('examStrategy').textContent = plan.examStrategy || '';
  $('quiz').innerHTML = '';
  $('output').classList.remove('hidden');
  $('output').scrollIntoView({ behavior: 'smooth' });
}

$('quizBtn').onclick = async () => {
  $('quizLoading').classList.remove('hidden'); $('quizBtn').disabled = true;
  try {
    const q = await api('/api/quiz', { student });
    const item = (x, i, mcq) => `<div class="q"><b>Q${i + 1}. ${esc(x.question)}</b> <span class="badge">${esc(x.difficulty)}</span>
      ${mcq ? '<ul>' + (x.options || []).map((o) => `<li>${esc(o)}</li>`).join('') + '</ul>' : ''}
      <details><summary>Show answer</summary><p><b>Answer:</b> ${esc(x.answer)}</p><p>${esc(x.explanation)}</p></details></div>`;
    $('quiz').innerHTML = '<h3>Multiple choice</h3>' + (q.mcqs || []).map((x, i) => item(x, i, true)).join('') +
      '<h3>Short answer</h3>' + (q.short || []).map((x, i) => item(x, i, false)).join('');
  } catch (err) {
    $('quiz').innerHTML = `<p class="error card">⚠️ ${esc(err.message)}</p>`;
  } finally {
    $('quizLoading').classList.add('hidden'); $('quizBtn').disabled = false;
  }
};

$('print').onclick = () => window.print();
