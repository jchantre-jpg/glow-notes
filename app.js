const KEY = "glow-notes-v2";
const listEl = document.getElementById("noteList");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const colorEl = document.getElementById("color");
const searchEl = document.getElementById("search");
const hint = document.getElementById("savedHint");
const wordCount = document.getElementById("wordCount");

let notes = load();
let activeId = notes[0]?.id || null;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(raw) && raw.length) return raw;
  } catch {}
  return [
    { id: crypto.randomUUID(), title: "Ideas de portafolio", body: "Añadir demos live y capturas cortas.\nPriorizar proyectos con UI pulida.", color: "#f0abfc", updated: Date.now() },
    { id: crypto.randomUUID(), title: "Checklist entrevista", body: "- Explicar un proyecto end-to-end\n- Hablar de tradeoffs\n- Preguntar por el equipo", color: "#c084fc", updated: Date.now() - 1e5 },
  ];
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(notes));
  hint.textContent = "Guardado · " + new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
function active() { return notes.find((n) => n.id === activeId); }
function words(text) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function renderList() {
  const q = searchEl.value.trim().toLowerCase();
  listEl.innerHTML = "";
  notes
    .slice()
    .sort((a, b) => b.updated - a.updated)
    .filter((n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(q))
    .forEach((n) => {
      const li = document.createElement("li");
      if (n.id === activeId) li.classList.add("active");
      li.style.borderLeftColor = n.color || "#f0abfc";
      li.innerHTML = `<strong>${n.title || "Sin título"}</strong><span>${new Date(n.updated).toLocaleDateString("es-CO")} · ${words(n.body)} palabras</span>`;
      li.addEventListener("click", () => {
        activeId = n.id;
        paintEditor();
        renderList();
      });
      listEl.appendChild(li);
    });
}

function paintEditor() {
  const n = active();
  if (!n) {
    titleEl.value = "";
    bodyEl.value = "";
    wordCount.textContent = "0 palabras";
    return;
  }
  titleEl.value = n.title;
  bodyEl.value = n.body;
  colorEl.value = n.color || "#f0abfc";
  wordCount.textContent = `${words(n.body)} palabras`;
}

function persistField() {
  const n = active();
  if (!n) return;
  n.title = titleEl.value;
  n.body = bodyEl.value;
  n.color = colorEl.value;
  n.updated = Date.now();
  wordCount.textContent = `${words(n.body)} palabras`;
  save();
  renderList();
}

document.getElementById("newNote").addEventListener("click", () => {
  const n = { id: crypto.randomUUID(), title: "Nueva nota", body: "", color: "#f0abfc", updated: Date.now() };
  notes.unshift(n);
  activeId = n.id;
  save();
  paintEditor();
  renderList();
  titleEl.focus();
  titleEl.select();
});

document.getElementById("deleteNote").addEventListener("click", () => {
  if (!activeId) return;
  if (!confirm("¿Eliminar esta nota?")) return;
  notes = notes.filter((n) => n.id !== activeId);
  activeId = notes[0]?.id || null;
  save();
  paintEditor();
  renderList();
});

document.getElementById("exportNotes").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "glow-notes-backup.json";
  a.click();
});

searchEl.addEventListener("input", renderList);
titleEl.addEventListener("input", persistField);
bodyEl.addEventListener("input", persistField);
colorEl.addEventListener("input", persistField);

paintEditor();
renderList();
save();
