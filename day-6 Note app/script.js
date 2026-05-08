// ============================================
//   NOTES APP - script.js
// ============================================

// ─────────────────────────── DATA ───────────────────────────

const NOTE_COLORS = [
    { hex: '#ff6b6b', name: 'coral' },
    { hex: '#feca57', name: 'sun' },
    { hex: '#48dbfb', name: 'sky' },
    { hex: '#ff9ff3', name: 'pink' },
    { hex: '#54a0ff', name: 'blue' },
    { hex: '#5f27cd', name: 'violet' },
    { hex: '#00d2d3', name: 'teal' },
    { hex: '#1dd1a1', name: 'mint' },
];

const TAG_COLORS = [
    'rgba(255,107,107,0.25)',
    'rgba(254,202,87,0.25)',
    'rgba(72,219,251,0.25)',
    'rgba(255,159,243,0.25)',
    'rgba(84,160,255,0.25)',
    'rgba(29,209,161,0.25)',
];

// Notes array loaded from localStorage
let notes = JSON.parse(localStorage.getItem('notesApp_v2') || '[]');

// Editor state
let currentTags = [];
let selectedColor = NOTE_COLORS[4].hex;
let editingId = null;
let currentFilter = 'all';

// ─────────────────────────── INIT ───────────────────────────

function init() {
    buildColorPicker();
    renderNotes();
}

// Build the color dot picker inside editor
function buildColorPicker() {
    const cp = document.getElementById('colorPicker');
    cp.innerHTML = NOTE_COLORS.map((c, i) =>
        `<div class="color-dot${i === 4 ? ' selected' : ''}"
         style="background:${c.hex}"
         title="${c.name}"
         onclick="selectColor('${c.hex}', this)"></div>`
    ).join('');
}

// When user clicks a color dot
function selectColor(hex, el) {
    selectedColor = hex;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
}

// ─────────────────────────── TAGS ───────────────────────────

// Handle tag input — press Enter or comma to add tag
function handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = e.target.value.trim().replace(',', '');
        if (val && !currentTags.includes(val)) {
            currentTags.push(val);
            renderCurrentTags();
        }
        e.target.value = '';
    }
}

// Render tags inside editor
function renderCurrentTags() {
    const ct = document.getElementById('currentTags');
    ct.innerHTML = currentTags.map((t, i) =>
        `<button class="tag"
             style="background:${TAG_COLORS[i % TAG_COLORS.length]};color:#eee"
             onclick="removeTag(${i})">
       ${t} ✕
     </button>`
    ).join('');
}

// Remove a tag from editor
function removeTag(i) {
    currentTags.splice(i, 1);
    renderCurrentTags();
}

// ─────────────────────────── SAVE / EDIT ───────────────────────────

// Save a new note OR update an existing one
function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const body = document.getElementById('noteBody').value.trim();

    if (!title && !body) {
        showToast('⚠️ Write something first!');
        return;
    }

    if (editingId) {
        // Update existing note
        const idx = notes.findIndex(n => n.id === editingId);
        if (idx !== -1) {
            notes[idx] = {
                ...notes[idx],
                title,
                body,
                color: selectedColor,
                tags: [...currentTags],
                updatedAt: Date.now()
            };
        }
        editingId = null;
        showToast('✏️ Note updated!');
    } else {
        // Create new note
        notes.unshift({
            id: Date.now().toString(),
            title: title || 'Untitled',
            body,
            color: selectedColor,
            tags: [...currentTags],
            pinned: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        showToast('✅ Note saved!');
    }

    saveToStorage();
    clearEditor();
    renderNotes();
}

// Clear the editor fields
function clearEditor() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteBody').value = '';
    document.getElementById('tagInput').value = '';
    currentTags = [];
    editingId = null;
    renderCurrentTags();
    document.getElementById('noteTitle').placeholder = '✏️ Note title...';
}

// Load a note into editor for editing
function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    editingId = id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteBody').value = note.body;
    currentTags = [...note.tags];
    selectedColor = note.color;

    buildColorPicker();
    const dots = document.querySelectorAll('.color-dot');
    NOTE_COLORS.forEach((c, i) => {
        if (c.hex === note.color) dots[i].classList.add('selected');
    });

    renderCurrentTags();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('noteTitle').placeholder = '✏️ Editing...';
    document.getElementById('noteTitle').focus();
}

// Delete a note
function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveToStorage();
    renderNotes();
    showToast('🗑️ Note deleted!');
}

// Toggle pin on a note
function togglePin(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.pinned = !note.pinned;
        saveToStorage();
        renderNotes();
        showToast(note.pinned ? '📌 Pinned!' : '📌 Unpinned!');
    }
}

// ─────────────────────────── FILTER / SEARCH ───────────────────────────

// Switch active filter (All / Pinned)
function setFilter(f, el) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderNotes();
}

// Return filtered + searched notes
function getFiltered() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    let result = [...notes];

    if (currentFilter === 'pinned') {
        result = result.filter(n => n.pinned);
    }

    if (q) {
        result = result.filter(n =>
            n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            n.tags.some(t => t.toLowerCase().includes(q))
        );
    }

    // Pinned notes first, then by last updated
    result.sort((a, b) => b.pinned - a.pinned || b.updatedAt - a.updatedAt);
    return result;
}

// ─────────────────────────── RENDER ───────────────────────────

// Main render function — draws all note cards
function renderNotes() {
    const grid = document.getElementById('notesGrid');
    const filtered = getFiltered();
    updateStats();

    document.getElementById('notesLabel').textContent =
        currentFilter === 'pinned' ? '📌 Pinned Notes' : 'All Notes';

    if (!filtered.length) {
        grid.innerHTML = `
      <div class="empty-state">
        <span class="emoji">📭</span>
        <h3>${notes.length ? 'No results found' : 'No notes yet'}</h3>
        <p>${notes.length ? 'Try a different search' : 'Create your first note above!'}</p>
      </div>`;
        return;
    }

    grid.innerHTML = filtered.map(note => {
        const date = new Date(note.updatedAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short'
        });

        const tagHtml = note.tags.map((t, i) =>
            `<span class="tag"
             style="background:${TAG_COLORS[i % TAG_COLORS.length]};color:#ddd;font-size:0.7rem">
         ${t}
       </span>`
        ).join('');

        return `
      <div class="note-card" style="border-top: 4px solid ${note.color}"
           onclick="openModal('${note.id}')">

        <div class="note-card-header">
          <div class="note-title">${escHtml(note.title)}</div>
          <div class="note-actions" onclick="event.stopPropagation()">
            <button class="icon-btn pin"    title="Pin"    onclick="togglePin('${note.id}')">📌</button>
            <button class="icon-btn"        title="Edit"   onclick="editNote('${note.id}')">✏️</button>
            <button class="icon-btn delete" title="Delete" onclick="deleteNote('${note.id}')"><i class="bi bi-trash3"></i></button>
          </div>
        </div>

        ${note.body ? `<div class="note-body">${escHtml(note.body)}</div>` : ''}
        ${tagHtml ? `<div class="note-tags">${tagHtml}</div>` : ''}

        <div class="note-footer">
          <span>${date}</span>
          ${note.pinned ? '<span class="pinned-badge">PINNED</span>' : ''}
        </div>

      </div>`;
    }).join('');
}

// Update stats badges at the top
function updateStats() {
    document.getElementById('totalCount').textContent = notes.length;
    document.getElementById('pinnedCount').textContent = notes.filter(n => n.pinned).length;

    const allTags = [...new Set(notes.flatMap(n => n.tags))];
    document.getElementById('tagCount').textContent = allTags.length;
}

// ─────────────────────────── MODAL ───────────────────────────

// Open the full note modal
function openModal(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    document.getElementById('modalTitle').textContent = note.title;
    document.getElementById('modalBody').textContent = note.body || '(No content)';
    document.getElementById('modalTags').innerHTML = note.tags.map((t, i) =>
        `<span class="tag" style="background:${TAG_COLORS[i % TAG_COLORS.length]};color:#ddd">${t}</span>`
    ).join('');

    document.getElementById('modalOverlay').classList.add('open');
}

// Close modal when clicking outside
function closeModal(e) {
    if (e.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').classList.remove('open');
    }
}

// ─────────────────────────── UTILS ───────────────────────────

// Save notes array to localStorage
function saveToStorage() {
    localStorage.setItem('notesApp_v2', JSON.stringify(notes));
}

// Show a toast notification
function showToast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

// Escape HTML to prevent XSS
function escHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ─────────────────────────── START ───────────────────────────
init();