const KEY = "glow-notes-v1";
const listEl = document.getElementById("noteList");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const hint = document.getElementById("savedHint");

let notes = load();
let activeId = notes[0]?.id || null;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(raw) && raw.length) return raw;
  } catch {}
  return [
    { id: crypto.randomUUID(), title: "Ideas de portafolio", body: "Añadir demos live y capturas cortas.\nPriorizar proyectos con UI pulida.", updated: Date.now() },
    { id: crypto.randomUUID(), title: "Checklist entrevista", body: "- Explicar un proyecto end-to-end\n- Hablar de tradeoffs\n- Preguntar por el equipo", updated: Date.now() - 1e5 },
  ];
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(notes));
  hint.textContent = "Guardado · " + new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
function active() { return notes.find((n) => n.id === activeId); }

function renderList() {
  listEl.innerHTML = "";
  notes
    .slice()
    .sort((a, b) => b.updated - a.updated)
    .forEach((n) => {
      const li = document.createElement("li");
      if (n.id === activeId) li.classList.add("active");
      li.innerHTML = `<strong>${n.title || "Sin título"}</strong><span>${new Date(n.updated).toLocaleDateString("es-CO")}</span>`;
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
    return;
  }
  titleEl.value = n.title;
  bodyEl.value = n.body;
}

function persistField() {
  const n = active();
  if (!n) return;
  n.title = titleEl.value;
  n.body = bodyEl.value;
  n.updated = Date.now();
  save();
  renderList();
}

document.getElementById("newNote").addEventListener("click", () => {
  const n = { id: crypto.randomUUID(), title: "Nueva nota", body: "", updated: Date.now() };
  notes.unshift(n);
  activeId = n.id;
  save();
  paintEditor();
  renderList();
  titleEl.focus();
  titleEl.select();
});

titleEl.addEventListener("input", persistField);
bodyEl.addEventListener("input", persistField);

paintEditor();
renderList();
save();
