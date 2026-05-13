// ---- Config ----
const DEBOUNCE_MS = 600;

// ---- Mock Data (10 users) ----
const MOCK_DATA = [
    {
        name: 'Aisha Patel', role: 'Frontend Dev', tag: 'React',
        bg: 'rgba(139,92,246,0.25)', tc: '#c4b5fd',
        tagBg: 'rgba(139,92,246,0.2)', tagC: '#a78bfa', tagBd: 'rgba(139,92,246,0.4)'
    },
    {
        name: 'Rohan Sharma', role: 'Backend Eng', tag: 'Node.js',
        bg: 'rgba(16,185,129,0.2)', tc: '#6ee7b7',
        tagBg: 'rgba(16,185,129,0.15)', tagC: '#34d399', tagBd: 'rgba(16,185,129,0.35)'
    },
    {
        name: 'Priya Nair', role: 'UI Designer', tag: 'Figma',
        bg: 'rgba(236,72,153,0.2)', tc: '#f9a8d4',
        tagBg: 'rgba(236,72,153,0.15)', tagC: '#f472b6', tagBd: 'rgba(236,72,153,0.35)'
    },
    {
        name: 'Vikram Joshi', role: 'DevOps Lead', tag: 'Docker',
        bg: 'rgba(56,189,248,0.2)', tc: '#7dd3fc',
        tagBg: 'rgba(56,189,248,0.15)', tagC: '#38bdf8', tagBd: 'rgba(56,189,248,0.35)'
    },
    {
        name: 'Meera Iyer', role: 'Data Scientist', tag: 'Python',
        bg: 'rgba(251,191,36,0.2)', tc: '#fde68a',
        tagBg: 'rgba(251,191,36,0.15)', tagC: '#fbbf24', tagBd: 'rgba(251,191,36,0.35)'
    },
    {
        name: 'Arjun Das', role: 'Mobile Dev', tag: 'Flutter',
        bg: 'rgba(239,68,68,0.2)', tc: '#fca5a5',
        tagBg: 'rgba(239,68,68,0.15)', tagC: '#f87171', tagBd: 'rgba(239,68,68,0.35)'
    },
    {
        name: 'Sneha Kulkarni', role: 'Product Mgr', tag: 'Agile',
        bg: 'rgba(249,115,22,0.2)', tc: '#fed7aa',
        tagBg: 'rgba(249,115,22,0.15)', tagC: '#fb923c', tagBd: 'rgba(249,115,22,0.35)'
    },
    {
        name: 'Rahul Mehta', role: 'QA Engineer', tag: 'Testing',
        bg: 'rgba(139,92,246,0.2)', tc: '#ddd6fe',
        tagBg: 'rgba(139,92,246,0.15)', tagC: '#a78bfa', tagBd: 'rgba(139,92,246,0.35)'
    },
    {
        name: 'Deepa Reddy', role: 'ML Engineer', tag: 'TensorFlow',
        bg: 'rgba(16,185,129,0.18)', tc: '#a7f3d0',
        tagBg: 'rgba(16,185,129,0.13)', tagC: '#6ee7b7', tagBd: 'rgba(16,185,129,0.3)'
    },
    {
        name: 'Karan Singh', role: 'Fullstack Dev', tag: 'Vue.js',
        bg: 'rgba(56,189,248,0.18)', tc: '#bae6fd',
        tagBg: 'rgba(56,189,248,0.13)', tagC: '#7dd3fc', tagBd: 'rgba(56,189,248,0.3)'
    },
];

// ---- State ----
let debounceTimer = null;
let progressTimer = null;
let keystrokeCount = 0;
let apiCallCount = 0;
let progressStart = 0;

// ---- DOM Elements ----
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const dot = document.getElementById('dot');
const statusText = document.getElementById('statusText');
const timerBadge = document.getElementById('timerBadge');
const progressFill = document.getElementById('progressFill');
const resultsArea = document.getElementById('resultsArea');
const resultsLabel = document.getElementById('resultsLabel');
const keystrokeEl = document.getElementById('keystrokeCount');
const apiCallEl = document.getElementById('apiCallCount');
const savedEl = document.getElementById('savedCount');

// ---- Helper: highlight matched text ----
function highlight(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        text.slice(0, idx) +
        '<span class="hl">' + text.slice(idx, idx + query.length) + '</span>' +
        text.slice(idx + query.length)
    );
}

// ---- Set status dot + text ----
function setStatus(state, message) {
    dot.className = 'dot ' + state;
    statusText.textContent = message;
}

// ---- Stop progress bar ----
function stopProgress() {
    clearInterval(progressTimer);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
}

// ---- Start progress bar countdown ----
function startProgress() {
    stopProgress();
    progressStart = Date.now();
    progressFill.style.transition = 'width .1s linear';
    progressTimer = setInterval(() => {
        const elapsed = Date.now() - progressStart;
        const percent = Math.min((elapsed / DEBOUNCE_MS) * 100, 100);
        const remaining = Math.max(0, Math.ceil(DEBOUNCE_MS - elapsed));
        progressFill.style.width = percent + '%';
        timerBadge.textContent = remaining > 0 ? remaining + 'ms left' : 'firing...';
        if (percent >= 100) clearInterval(progressTimer);
    }, 50);
}

// ---- Fake API call (simulates server response) ----
function fakeApiCall(query) {
    apiCallCount++;
    apiCallEl.textContent = apiCallCount;
    savedEl.textContent = Math.max(0, keystrokeCount - apiCallCount);

    setStatus('searching', 'calling API... query: "' + query + '"');
    timerBadge.textContent = 'fetching...';

    // Simulate ~260ms network delay
    setTimeout(() => {
        const q = query.toLowerCase().trim();

        // Filter data: check name, role, tag
        const results = q.length === 0
            ? []
            : MOCK_DATA.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.role.toLowerCase().includes(q) ||
                d.tag.toLowerCase().includes(q)
            ).slice(0, 5);

        // Render results
        if (results.length === 0 && q.length > 0) {
            resultsLabel.textContent = '';
            resultsArea.innerHTML = `
    <div class="empty-state">
        <i class="ti ti-mood-sad"></i>
        No results for "${query}"
    </div>`;
        } else if (q.length === 0) {
            resultsLabel.textContent = '';
            resultsArea.innerHTML = `
    <div class="empty-state">
        <i class="ti ti-database"></i>
        Start typing to search the database
    </div>`;
        } else {
            resultsLabel.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '') + ' found';
            resultsArea.innerHTML = results.map(r => `
    <div class="result-card">
        <div class="avatar" style="background:${r.bg};color:${r.tc}">
            ${r.name.split(' ').map(w => w[0]).join('')}
        </div>
        <div>
            <div class="result-name">${highlight(r.name, query)}</div>
            <div class="result-role">${highlight(r.role, query)}</div>
        </div>
        <span class="result-tag" style="background:${r.tagBg};color:${r.tagC};border-color:${r.tagBd}">
            ${highlight(r.tag, query)}
        </span>
    </div>
    `).join('');
        }

        // Update status
        setStatus('done', 'done — ' + results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + query + '"');
        timerBadge.textContent = '600ms delay';

        // Reset progress bar
        stopProgress();
        progressFill.style.width = '100%';
        setTimeout(() => {
            progressFill.style.transition = 'width .5s';
            progressFill.style.width = '0%';
        }, 700);

    }, 260);
}

// ---- Main: Input event with Debounce ----
searchInput.addEventListener('input', () => {
    const value = searchInput.value;

    // Show / hide clear button
    clearBtn.style.display = value.length ? 'flex' : 'none';

    // Update keystroke counter
    keystrokeCount++;
    keystrokeEl.textContent = keystrokeCount;
    savedEl.textContent = Math.max(0, keystrokeCount - apiCallCount);

    // *** DEBOUNCE LOGIC ***
    clearTimeout(debounceTimer);           // Cancel previous timer

    if (!value.trim()) {
        setStatus('', 'ready — waiting for input');
        stopProgress();
        timerBadge.textContent = '600ms delay';
        resultsLabel.textContent = '';
        resultsArea.innerHTML = `
    <div class="empty-state">
        <i class="ti ti-database"></i>
        Start typing to search the database
    </div>`;
        return;
    }

    setStatus('typing', 'typing... debounce timer reset');
    startProgress();

    debounceTimer = setTimeout(() => {    // Set new timer
        fakeApiCall(value);
    }, DEBOUNCE_MS);
});

// ---- Clear button ----
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    clearTimeout(debounceTimer);
    stopProgress();
    timerBadge.textContent = '600ms delay';
    setStatus('', 'ready — waiting for input');
    resultsLabel.textContent = '';
    resultsArea.innerHTML = `
    <div class="empty-state">
        <i class="ti ti-database"></i>
        Start typing to search the database
    </div>`;
    searchInput.focus();
});