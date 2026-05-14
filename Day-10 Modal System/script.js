
/* ── State ── */
let currentModal = null;
let wizStep = 1;

/* ── Wizard Steps Data ── */
const wizData = [
    {
        sub: 'Configure your workspace',
        label: 'Step 1 of 3',
        count: 'Workspace',
        html: `
    <div class="field">
        <label class="flabel">Workspace name</label>
        <input class="finput" type="text" placeholder="My Workspace" />
    </div>
    <div class="field">
        <label class="flabel">Industry</label>
        <select class="finput">
            <option>Design</option>
            <option>Engineering</option>
            <option>Marketing</option>
            <option>Finance</option>
        </select>
    </div>`
    },
    {
        sub: 'Add your team members',
        label: 'Step 2 of 3',
        count: 'Team',
        html: `
    <div class="field">
        <label class="flabel">Team size</label>
        <select class="finput">
            <option>Just me</option>
            <option>2 – 5</option>
            <option>6 – 20</option>
            <option>21 – 100</option>
            <option>100+</option>
        </select>
    </div>
    <div class="field">
        <label class="flabel">Invite emails (optional)</label>
        <input class="finput" type="text" placeholder="team@company.com, dev@company.com" />
    </div>`
    },
    {
        sub: 'Choose your plan',
        label: 'Step 3 of 3',
        count: 'Plan',
        html: `
    <div class="plan-card" onclick="selectPlan(this)">
        <p>Free</p>
        <span>Up to 3 members · 5 projects · 2 GB</span>
    </div>
    <div class="plan-card sel" onclick="selectPlan(this)">
        <p>Pro <span class="plan-badge">Popular</span></p>
        <span>Unlimited members · All features · ₹499/mo</span>
    </div>
    <div class="plan-card" onclick="selectPlan(this)">
        <p>Enterprise</p>
        <span>Custom pricing · SSO · Dedicated support</span>
    </div>`
    }
];

/* ── Open Modal ── */
function openModal(id) {
    if (currentModal) {
        document.getElementById('m-' + currentModal).style.display = 'none';
    }
    currentModal = id;
    if (id === 'wizard') { wizStep = 1; renderWizard(); }

    const modal = document.getElementById('m-' + id);
    modal.style.display = 'block';

    const backdrop = document.getElementById('backdrop');
    backdrop.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => backdrop.classList.add('open')));

    document.body.style.overflow = 'hidden';
}

/* ── Close Modal ── */
function closeModal() {
    const backdrop = document.getElementById('backdrop');
    backdrop.classList.remove('open');
    setTimeout(() => {
        if (currentModal) {
            document.getElementById('m-' + currentModal).style.display = 'none';
        }
        backdrop.style.display = 'none';
        currentModal = null;
    }, 280);
    document.body.style.overflow = '';
}

/* ── Backdrop Click ── */
function handleBackdropClick(e) {
    if (e.target === document.getElementById('backdrop')) closeModal();
}

/* ── ESC Key ── */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && currentModal) closeModal();
});

/* ── Wizard: Render Current Step ── */
function renderWizard() {
    const d = wizData[wizStep - 1];
    document.getElementById('wiz-sub').textContent = d.sub;
    document.getElementById('wiz-label').textContent = d.label;
    document.getElementById('wiz-count').textContent = d.count;
    document.getElementById('wiz-content').innerHTML = d.html;

    document.getElementById('wiz-back').style.display = wizStep > 1 ? 'inline-flex' : 'none';
    document.getElementById('wiz-next').innerHTML =
        wizStep === 3
            ? 'Finish <i class="ti ti-check"></i>'
            : 'Next <i class="ti ti-arrow-right"></i>';

    document.querySelectorAll('#wiz-steps .step').forEach((s, i) => {
        s.className = 'step' +
            (i < wizStep - 1 ? ' done' : i === wizStep - 1 ? ' active' : '');
    });
}

function wizNext() {
    if (wizStep < 3) {
        wizStep++;
        renderWizard();
    } else {
        closeModal();
        fireToast('Setup complete!', 'Your workspace is ready', '#10b981', 'rgba(16,185,129,.15)', 'ti-circle-check');
    }
}

function wizBack() {
    if (wizStep > 1) { wizStep--; renderWizard(); }
}

function selectPlan(el) {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('sel'));
    el.classList.add('sel');
}

/* ── Submit Invite ── */
function submitInvite() {
    const name = document.getElementById('inv-name').value.trim() || 'New member';
    closeModal();
    fireToast('Invite sent!', name + ' will receive an email', '#8b5cf6', 'rgba(139,92,246,.15)', 'ti-send');
}

/* ── Fire Toast ── */
function fireToast(title, msg, color, bg, icon) {
    const stack = document.getElementById('toastStack');

    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeft = '2px solid ' + color;
    t.innerHTML = `
    <div class="t-icon" style="background:${bg}; color:${color}">
        <i class="ti ${icon}"></i>
    </div>
    <div class="t-text">
        <p>${title}</p>
        <span>${msg}</span>
    </div>
    <div class="t-bar" style="background:${color}; width:100%"></div>`;

    stack.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));

    /* Shrink progress bar */
    setTimeout(() => {
        const bar = t.querySelector('.t-bar');
        if (bar) bar.style.width = '0';
    }, 80);

    /* Auto dismiss */
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 400);
    }, 3400);
}
