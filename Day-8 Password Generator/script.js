// ===========================
//   STATE
// ===========================
const state = {
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
    ambiguous: false,
    norepeat: false,
    minNumbers: 1,
    minSymbols: 1,
    length: 16,
    history: [],
    currentPw: ''
};

// ===========================
//   CHARACTER SETS
// ===========================
const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const AMBIGUOUS = /[il1Lo0O]/g;

// ===========================
//   LENGTH SLIDER
// ===========================
function updateLength(val) {
    state.length = parseInt(val);
    document.getElementById('lengthVal').textContent = val;

    // Update slider track fill via CSS variable
    const pct = ((val - 4) / (64 - 4)) * 100;
    document.getElementById('lengthSlider').style.setProperty('--progress', pct + '%');
}

// ===========================
//   TOGGLE OPTIONS
// ===========================
function toggleOption(key) {
    const el = document.getElementById('opt-' + key);
    const active = el.classList.contains('active');

    // Prevent turning off all character types
    if (active && ['upper', 'lower', 'numbers', 'symbols'].includes(key)) {
        const typesOn = ['upper', 'lower', 'numbers', 'symbols'].filter(k => state[k]);
        if (typesOn.length <= 1) {
            showToast('⚠ Keep at least one type!');
            return;
        }
    }

    state[key] = !active;
    el.classList.toggle('active');
    el.querySelector('.toggle-box').textContent = state[key] ? '✓' : '';
}

// ===========================
//   MIN QUANTITY CONTROLS
// ===========================
function changeQty(key, delta) {
    state[key] = Math.max(0, Math.min(8, state[key] + delta));
    document.getElementById(key).textContent = state[key];
}

// ===========================
//   BUILD CHARSET
// ===========================
function buildCharset() {
    let charset = '';
    if (state.upper) charset += CHARS.upper;
    if (state.lower) charset += CHARS.lower;
    if (state.numbers) charset += CHARS.numbers;
    if (state.symbols) charset += CHARS.symbols;
    if (state.ambiguous) charset = charset.replace(AMBIGUOUS, '');
    return charset;
}

// ===========================
//   GENERATE PASSWORD
// ===========================
function generatePassword() {
    const charset = buildCharset();
    if (!charset) {
        showToast('⚠ No characters available!');
        return;
    }

    const len = state.length;
    const picks = [];

    // Guarantee minimum numbers
    if (state.numbers && state.minNumbers > 0) {
        const nums = state.ambiguous
            ? CHARS.numbers.replace(AMBIGUOUS, '')
            : CHARS.numbers;
        for (let i = 0; i < state.minNumbers && picks.length < len; i++) {
            const r = new Uint32Array(1);
            crypto.getRandomValues(r);
            picks.push(nums[r[0] % nums.length]);
        }
    }

    // Guarantee minimum symbols
    if (state.symbols && state.minSymbols > 0) {
        for (let i = 0; i < state.minSymbols && picks.length < len; i++) {
            const r = new Uint32Array(1);
            crypto.getRandomValues(r);
            picks.push(CHARS.symbols[r[0] % CHARS.symbols.length]);
        }
    }

    // Fill remaining characters
    let remaining = charset;
    if (state.norepeat) {
        const usedChars = new Set(picks);
        remaining = [...charset].filter(c => !usedChars.has(c)).join('');
        if (!remaining) remaining = charset;
    }

    for (let i = picks.length; i < len; i++) {
        if (state.norepeat && remaining.length === 0) remaining = charset;
        const r = new Uint32Array(1);
        crypto.getRandomValues(r);
        const ch = remaining[r[0] % remaining.length];
        picks.push(ch);
        if (state.norepeat) remaining = remaining.replace(ch, '');
    }

    // Fisher-Yates shuffle
    for (let i = picks.length - 1; i > 0; i--) {
        const r = new Uint32Array(1);
        crypto.getRandomValues(r);
        const j = r[0] % (i + 1);
        [picks[i], picks[j]] = [picks[j], picks[i]];
    }

    const pw = picks.slice(0, len).join('');
    state.currentPw = pw;

    // Update display
    const pwEl = document.getElementById('pwText');
    pwEl.textContent = pw;
    pwEl.classList.remove('empty');
    pwEl.classList.add('flicker');
    setTimeout(() => pwEl.classList.remove('flicker'), 400);

    updateStrength(pw);
    addHistory(pw);

    // Spin the generate icon
    const icon = document.getElementById('genIcon');
    icon.classList.add('spin');
    setTimeout(() => icon.classList.remove('spin'), 500);
}

// ===========================
//   STRENGTH METER
// ===========================
function updateStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (pw.length >= 24) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    const levels = [
        { name: 'WEAK', color: '#ff4466', pct: 15 },
        { name: 'POOR', color: '#ff7744', pct: 30 },
        { name: 'FAIR', color: '#ffaa00', pct: 50 },
        { name: 'GOOD', color: '#aadd00', pct: 68 },
        { name: 'STRONG', color: '#00dd99', pct: 82 },
        { name: 'EXCELLENT', color: '#00ffe7', pct: 100 },
    ];

    const idx = Math.min(Math.floor(score / 1.4), 5);
    const lvl = levels[idx];

    const nameEl = document.getElementById('strengthName');
    nameEl.textContent = lvl.name;
    nameEl.style.color = lvl.color;

    const fill = document.getElementById('strengthFill');
    fill.style.width = lvl.pct + '%';
    fill.style.background = `linear-gradient(90deg, ${lvl.color}99, ${lvl.color})`;
    fill.style.boxShadow = `0 0 10px ${lvl.color}88`;
}

// ===========================
//   HISTORY
// ===========================
function addHistory(pw) {
    state.history.unshift(pw);
    if (state.history.length > 8) state.history.pop();
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('historyList');
    document.getElementById('histCount').textContent = state.history.length + ' saved';

    if (state.history.length === 0) {
        list.innerHTML = '<div style="color:var(--muted);font-size:0.75rem;text-align:center;padding:12px;">No history yet...</div>';
        return;
    }

    list.innerHTML = state.history.map((pw) => `
    <div class="history-item">
      <span class="history-pw">${pw}</span>
      <button class="history-copy" onclick="copyText('${pw}', event)">
        <i class="fa-solid fa-clipboard"></i>
      </button>
    </div>
  `).join('');
}

// ===========================
//   COPY TO CLIPBOARD
// ===========================
function copyPassword() {
    if (!state.currentPw) {
        showToast('⚠ Generate a password first!');
        return;
    }
    copyText(state.currentPw);

    const btn = document.getElementById('copyBtn');
    btn.textContent = '✅';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.textContent = '<i class="fa-solid fa-clipboard"></i>';
        btn.classList.remove('copied');
    }, 1800);
}

function copyText(text, e) {
    if (e) e.stopPropagation();

    navigator.clipboard.writeText(text)
        .then(() => showToast('✓ Copied to clipboard!'))
        .catch(() => {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('✓ Copied!');
        });
}

// ===========================
//   CLEAR ALL
// ===========================
function clearAll() {
    state.currentPw = '';
    state.history = [];

    const pwEl = document.getElementById('pwText');
    pwEl.textContent = 'Click GENERATE to create password...';
    pwEl.classList.add('empty');

    document.getElementById('strengthFill').style.width = '0%';
    document.getElementById('strengthName').textContent = '—';

    renderHistory();
    showToast('🗑 Cleared!');
}

// ===========================
//   TOAST NOTIFICATION
// ===========================
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
}

// ===========================
//   INIT ON PAGE LOAD
// ===========================
updateLength(16);
generatePassword();