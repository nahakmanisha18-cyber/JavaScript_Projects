// ============ STATE ============
let state = {
    tasks: [],
    notes: [],
    profile: { firstname: 'Arjun', lastname: 'Kumar', email: 'arjun@nexboard.io', phone: '+91 98765 43210', bio: '' }
};

const PAGES = { dashboard: 'Dashboard', analytics: 'Analytics', tasks: 'Tasks', notes: 'Notes', projects: 'Projects', team: 'Team', notifications: 'Notifications', profile: 'Profile', settings: 'Settings' };

// ============ INIT ============
function init() {
    loadFromStorage();
    renderTasks();
    renderNotes();
    updateCounts();
    initCharts();
    initMiniCharts();
    initTeam();
    updateGreeting();
    updateStorageStats();
    loadProfile();

    document.getElementById('task-input').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
    document.getElementById('note-title').addEventListener('keydown', e => { if (e.key === 'Enter') addNote(); });
}

// ============ NAVIGATION ============
function navigate(page, clickedEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    if (clickedEl) clickedEl.classList.add('active');
    else {
        document.querySelectorAll('.nav-item').forEach(n => {
            if (n.textContent.toLowerCase().includes(page.toLowerCase().split(' ')[0])) n.classList.add('active');
        });
    }
    document.getElementById('header-title').textContent = PAGES[page] || page;
    if (page === 'notifications') { document.getElementById('notif-count').textContent = '0'; document.getElementById('notif-dot').style.display = 'none'; }
    if (page === 'settings') updateStorageStats();
}

// ============ LOCALSTORAGE ============
function saveToStorage() {
    localStorage.setItem('nexboard_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('nexboard_notes', JSON.stringify(state.notes));
    localStorage.setItem('nexboard_profile', JSON.stringify(state.profile));
}

function loadFromStorage() {
    const tasks = localStorage.getItem('nexboard_tasks');
    const notes = localStorage.getItem('nexboard_notes');
    const profile = localStorage.getItem('nexboard_profile');
    if (tasks) state.tasks = JSON.parse(tasks);
    if (notes) state.notes = JSON.parse(notes);
    if (profile) state.profile = JSON.parse(profile);
}

// ============ TASKS ============
function addTask() {
    const input = document.getElementById('task-input');
    const priority = document.getElementById('task-priority').value;
    const text = input.value.trim();
    if (!text) return;
    state.tasks.unshift({ id: Date.now(), text, priority, done: false, created: new Date().toISOString() });
    input.value = '';
    saveToStorage();
    renderTasks();
    updateCounts();
    showToast('Task added!', 'ti-check');
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) { task.done = !task.done; saveToStorage(); renderTasks(); updateCounts(); }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveToStorage(); renderTasks(); updateCounts();
}

function clearDone() {
    state.tasks = state.tasks.filter(t => !t.done);
    saveToStorage(); renderTasks(); updateCounts();
    showToast('Cleared completed tasks', 'ti-trash');
}

function renderTasks() {
    const list = document.getElementById('task-list');
    const empty = document.getElementById('task-empty');
    if (!state.tasks.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    const pColors = { high: 'danger', medium: 'warning', low: 'success' };
    list.innerHTML = state.tasks.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}">
        <div class="task-check ${t.done ? 'checked' : ''}" onclick="toggleTask(${t.id})"></div>
        <span class="task-text">${t.text}</span>
        <span class="badge ${pColors[t.priority]} task-priority">${t.priority}</span>
        <button onclick="deleteTask(${t.id})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px;transition:color 0.2s" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--text3)'"><i class="ti ti-trash"></i></button>
    </div>
    `).join('');
}

// ============ NOTES ============
function addNote() {
    const title = document.getElementById('note-title').value.trim();
    const body = document.getElementById('note-body').value.trim();
    if (!title && !body) return;
    state.notes.unshift({ id: Date.now(), title: title || 'Untitled', body, created: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) });
    clearNoteForm();
    saveToStorage(); renderNotes(); updateCounts();
    showToast('Note saved!', 'ti-note');
}

function deleteNote(id) {
    state.notes = state.notes.filter(n => n.id !== id);
    saveToStorage(); renderNotes(); updateCounts();
}

function clearNoteForm() {
    document.getElementById('note-title').value = '';
    document.getElementById('note-body').value = '';
}

const NOTE_COLORS = ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--cyan)', 'var(--pink)', 'var(--red)'];

function renderNotes() {
    const grid = document.getElementById('notes-grid');
    const empty = document.getElementById('notes-empty');
    if (!state.notes.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    grid.innerHTML = state.notes.map((n, i) => `
    <div class="note-card" style="border-top:3px solid ${NOTE_COLORS[i % NOTE_COLORS.length]}">
        <h4>${n.title}</h4>
        <p>${n.body || '<em style="color:var(--text3)">No content</em>'}</p>
        <div class="note-card-footer">
            <span class="note-date">${n.created}</span>
            <button class="delete-note" onclick="deleteNote(${n.id})"><i class="ti ti-trash"></i></button>
        </div>
    </div>
    `).join('');
}

// ============ PROFILE ============
function saveProfile() {
    state.profile = {
        firstname: document.getElementById('pf-firstname').value,
        lastname: document.getElementById('pf-lastname').value,
        email: document.getElementById('pf-email').value,
        phone: document.getElementById('pf-phone').value,
        bio: document.getElementById('pf-bio').value
    };
    saveToStorage(); loadProfile();
    showToast('Profile saved!', 'ti-check');
}

function loadProfile() {
    const p = state.profile;
    const initials = (p.firstname[0] || 'A') + (p.lastname[0] || 'K');
    const fullName = p.firstname + ' ' + p.lastname;
    document.getElementById('profile-avatar-display').textContent = initials;
    document.getElementById('profile-name-display').textContent = fullName;
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('sidebar-name').textContent = fullName;
    document.getElementById('header-avatar').textContent = initials;
    document.getElementById('greeting-name').textContent = p.firstname;
    document.getElementById('pf-firstname').value = p.firstname;
    document.getElementById('pf-lastname').value = p.lastname;
    document.getElementById('pf-email').value = p.email;
    document.getElementById('pf-phone').value = p.phone;
    document.getElementById('pf-bio').value = p.bio;
}

// ============ COUNTS ============
function updateCounts() {
    const pendingTasks = state.tasks.filter(t => !t.done).length;
    document.getElementById('task-count').textContent = pendingTasks;
    document.getElementById('note-count').textContent = state.notes.length;
}

// ============ GREETING ============
function updateGreeting() {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('greeting-date').textContent = now.toLocaleDateString('en-IN', opts);
}

// ============ NOTIFICATIONS ============
function clearNotifs() {
    document.getElementById('notif-count').textContent = '0';
    document.getElementById('notif-dot').style.display = 'none';
    showToast('All notifications marked as read', 'ti-bell');
}

// ============ TOAST ============
function showToast(msg, icon = 'ti-check') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<i class="ti ${icon}" style="color:var(--accent);font-size:16px"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ============ STORAGE STATS ============
function updateStorageStats() {
    let total = 0;
    for (let k in localStorage) { if (k.startsWith('nexboard_')) total += (localStorage[k] || '').length; }
    const kb = (total / 1024).toFixed(2);
    const pct = Math.min((total / (5 * 1024 * 1024)) * 100, 100);
    document.getElementById('storage-usage').textContent = `${kb} KB / 5 MB`;
    document.getElementById('storage-bar').style.width = Math.max(pct, 2) + '%';
}

function exportData() {
    const data = { tasks: state.tasks, notes: state.notes, profile: state.profile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'nexboard-data.json'; a.click();
    showToast('Data exported!', 'ti-download');
}

function clearAllData() {
    if (confirm('Clear all saved data? This cannot be undone.')) {
        ['nexboard_tasks', 'nexboard_notes', 'nexboard_profile'].forEach(k => localStorage.removeItem(k));
        state.tasks = []; state.notes = [];
        renderTasks(); renderNotes(); updateCounts(); updateStorageStats();
        showToast('All data cleared', 'ti-trash');
    }
}

// ============ TEAM ============
const TEAM = [
    { name: 'Arjun Kumar', role: 'Admin', avatar: 'AK', color: 'linear-gradient(135deg,var(--accent),var(--pink))', status: 'online' },
    { name: 'Priya Sharma', role: 'Designer', avatar: 'PS', color: 'linear-gradient(135deg,var(--green),var(--cyan))', status: 'online' },
    { name: 'Rohan Mehta', role: 'Developer', avatar: 'RM', color: 'linear-gradient(135deg,var(--amber),var(--red))', status: 'away' },
    { name: 'Ananya Singh', role: 'Product Manager', avatar: 'AS', color: 'linear-gradient(135deg,var(--cyan),var(--accent))', status: 'online' },
    { name: 'Vikram Nair', role: 'DevOps', avatar: 'VN', color: 'linear-gradient(135deg,var(--pink),var(--amber))', status: 'offline' },
    { name: 'Kavya Patel', role: 'QA Engineer', avatar: 'KP', color: 'linear-gradient(135deg,var(--green),var(--amber))', status: 'online' },
];

const STATUS_COLORS = { online: 'var(--green)', away: 'var(--amber)', offline: 'var(--text3)' };

function initTeam() {
    const container = document.getElementById('team-members-container');
    container.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:16px';
    container.innerHTML = TEAM.map(m => `
    <div class="card" style="text-align:center;padding:24px 16px">
        <div style="position:relative;display:inline-block;margin-bottom:12px">
            <div class="avatar" style="width:52px;height:52px;font-size:18px;background:${m.color};margin:0 auto">${m.avatar}</div>
            <span style="position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:${STATUS_COLORS[m.status]};border:2px solid var(--bg3)"></span>
        </div>
        <div style="font-weight:600;font-size:14px">${m.name}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">${m.role}</div>
        <span class="badge" style="margin-top:8px;background:${STATUS_COLORS[m.status]}20;color:${STATUS_COLORS[m.status]}">${m.status}</span>
    </div>
    `).join('');
}

// ============ CHARTS ============
function initCharts() {
    Chart.defaults.color = '#9898b0';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

    // Revenue Bar
    new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue ($)',
                data: [42000, 38000, 55000, 48000, 62000, 58000, 71000, 65000, 78000, 72000, 84250, 91000],
                backgroundColor: ctx => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                    g.addColorStop(0, 'rgba(124,111,247,0.8)');
                    g.addColorStop(1, 'rgba(124,111,247,0.1)');
                    return g;
                },
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '$' + (v / 1000) + 'k' } }, x: { grid: { display: false } } }
        }
    });

    // Donut
    new Chart(document.getElementById('donutChart'), {
        type: 'doughnut',
        data: {
            labels: ['Organic', 'Direct', 'Social', 'Referral', 'Email'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: ['#7c6ff7', '#2ecc8a', '#38bdf8', '#f5c842', '#f472b6'],
                borderWidth: 0, hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, pointStyleWidth: 8 } } },
            cutout: '65%'
        }
    });

    // Line Chart (Analytics)
    new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Users', data: [8200, 9100, 10400, 9800, 11200, 12000, 11800, 13100, 12600, 14200, 13800, 14900],
                    borderColor: '#2ecc8a', backgroundColor: 'rgba(46,204,138,0.08)',
                    borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3
                },
                {
                    label: 'Revenue ($)', data: [42000, 38000, 55000, 48000, 62000, 58000, 71000, 65000, 78000, 72000, 84250, 91000],
                    borderColor: '#7c6ff7', backgroundColor: 'rgba(124,111,247,0.08)',
                    borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v.toLocaleString() } },
                y1: { position: 'right', grid: { display: false }, ticks: { callback: v => '$' + (v / 1000) + 'k' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function initMiniCharts() {
    const data1 = [30, 45, 35, 55, 48, 62, 58, 70];
    const data2 = [55, 50, 48, 42, 45, 38, 36, 32];
    const data3 = [3.8, 4.0, 3.9, 4.1, 4.2, 4.3, 4.4, 4.5];

    function makeMini(id, data, color) {
        const el = document.getElementById(id);
        if (!el) return;
        const max = Math.max(...data);
        el.innerHTML = data.map(v => `<div class="mini-bar" style="height:${(v / max * 100)}%;background:${color}"></div>`).join('');
    }

    makeMini('mini1', data1, 'var(--accent)');
    makeMini('mini2', data2, 'var(--amber)');
    makeMini('mini3', data3, 'var(--cyan)');
}

// ============ START ============
init();
