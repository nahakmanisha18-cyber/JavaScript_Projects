
/* ── helpers ── */
const $ = id => document.getElementById(id);
const gU = () => JSON.parse(localStorage.getItem('afwiz') || '[]');
const sU = u => localStorage.setItem('afwiz', JSON.stringify(u));

/* social buttons HTML */
const socialHTML = `
  <button class="soc" onclick="soc('Google')" title="Google">
    <i class="fa-brands fa-google"></i>
  </button>

  <button class="soc" onclick="soc('Facebook')" title="Facebook">
    <i class="fa-brands fa-facebook-f"></i>
  </button>

  <button class="soc" onclick="soc('GitHub')" title="GitHub">
    <i class="fa-brands fa-github"></i>
  </button>

  <button class="soc" onclick="soc('LinkedIn')" title="LinkedIn">
    <i class="fa-brands fa-linkedin-in"></i>
  </button>
`;

$('loginSocials').innerHTML = socialHTML;
$('regSocials').innerHTML = socialHTML;

/* toast */
// function toast(msg, type = 's') {
//     const t = $('toast');
//     $('tmsg').textContent = msg;
//     t.className = 'toast ' + type;
//     t.classList.add('show');
//     clearTimeout(t._t);
//     t._t = setTimeout(() => t.classList.remove('show'), 3200);
// }
// function soc(n) { toast(n + ' auth coming soon! 🚀') }

/* field state */
function sf(fieldId, msgId, state, msg) {

    const field = $(fieldId);
    const msgBox = $(msgId);

    field.classList.remove('err', 'ok');

    if (state) {
        field.classList.add(state);
    }

    if (msgBox) {
        msgBox.innerHTML = msg || '';
    }
}

/* eye toggle */
function tg(id, btn) {
    const el = $(id), show = el.type === 'password';
    el.type = show ? 'text' : 'password';
    btn.style.opacity = show ? '.45' : '1';
}

/* panel switch */
function goPanel(p) {
    $('loginP').classList.toggle('on', p === 'login');
    $('signupP').classList.toggle('on', p === 'signup');
    $('swLogin').classList.toggle('on', p === 'login');
    $('swReg').classList.toggle('on', p === 'signup');
    if (p === 'login') {
        $('ltitle').innerHTML = 'Hello,<br>Welcome!';
        $('lsub').textContent = "Don't have an account?";
        $('pillTxt').textContent = 'Register';
    } else {
        $('ltitle').innerHTML = 'Join Us<br>Today!';
        $('lsub').textContent = 'Already have an account?';
        $('pillTxt').textContent = 'Login';
        resetSteps();
    }
    clearLogin();
}

/* ── LOGIN validators ── */
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function vle() {

    const input = $('lemail');
    const v = input.value.trim();

    if (!v) {
        sf('lef', 'lemsg', 'err', 'Email is required');
        input.focus();
        return false;
    }

    if (!isEmail(v)) {
        sf('lef', 'lemsg', 'err', 'Email format is wrong');
        input.focus();
        return false;
    }

    sf('lef', 'lemsg', 'ok', '');
    return true;
}

function vlp() {

    const input = $('lpass');
    const v = input.value;

    if (!v) {
        sf('lpf', 'lpmsg', 'err', 'Password is required');
        input.focus();
        return false;
    }

    if (v.length < 6) {
        sf('lpf', 'lpmsg', 'err', 'Password must be at least 6 characters');
        input.focus();
        return false;
    }

    sf('lpf', 'lpmsg', 'ok', '');
    return true;
}
function clearLogin() {
    ['lemail', 'lpass'].forEach(id => { const e = $(id); if (e) e.value = '' });
    sf('lef', '', ''); sf('lpf', '', '');
}

function doLogin() {

    if (!vle() || !vlp()) {
        return;
    }

    const email = $('lemail').value.trim();
    const pass = $('lpass').value;

    // pehle email check karo
    const existingUser = gU().find(
        u => u.email === email
    );

    // agar email exist nahi karta
    if (!existingUser) {
        sf('lef', 'lemsg', 'err', 'Email does not exist');
        return;
    }

    // password check karo
    if (existingUser.pwd !== btoa(pass)) {
        sf('lpf', 'lpmsg', 'err', 'Incorrect password');
        return;
    }

    // login success
    sf('lef', 'lemsg', 'ok', '');
    sf('lpf', 'lpmsg', 'ok', 'Login successful');

    console.log('Welcome back, ' + existingUser.name);
}

/* ── STEP state ── */
let curStep = 0;

function resetSteps() {
    curStep = 0;
    showStep(0, false);
    updateStepper();
    ['rfn', 'rln', 'remail', 'rpass', 'rconf'].forEach(id => { const e = $(id); if (e) e.value = '' });
    [['rfnf', 'rfnmsg'], ['ref', 'remsg'], ['rpf', 'rpmsg'], ['rcf', 'rcmsg']].forEach(([f, m]) => sf(f, m, '', ''));
    for (let i = 1; i <= 4; i++)$('sb' + i).style.background = '#e2e5f5';
    $('stlbl').textContent = 'Enter a password';
}

function showStep(n, goingBack = false) {
    document.querySelectorAll('.step-slide').forEach((el, i) => {
        el.classList.remove('on', 'back');
        if (i === n) { el.classList.add('on'); if (goingBack) el.classList.add('back') }
    });
}

function updateStepper() {
    for (let i = 0; i < 3; i++) {
        const si = $('si' + i);
        const sc = $('sc' + i);
        si.className = 'step-item';
        if (i < curStep) {
            si.classList.add('done');
            sc.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else if (i === curStep) {
            si.classList.add('active');
            sc.innerHTML = i + 1;
        } else {
            sc.innerHTML = i + 1;
        }
    }
}

/* ── STEP 1 validators ── */
function vrfn() {

    const v = $('rfn').value.trim();

    if (!v) {
        sf('rfnf', 'rfnmsg', 'err', 'First name is required');
        return false;
    }

    if (v.length < 2) {
        sf('rfnf', 'rfnmsg', 'err', 'Too short');
        return false;
    }

    sf('rfnf', 'rfnmsg', 'ok', '');
    return true;
}
function vre() {

    const input = $('remail');
    const v = input.value.trim();

    if (!v) {
        sf('ref', 'remsg', 'err', 'Email is required');
        input.focus();
        return false;
    }

    if (!isEmail(v)) {
        sf('ref', 'remsg', 'err', 'Email format is wrong');
        input.focus();
        return false;
    }

    if (gU().find(u => u.email === $('remail').value.trim())) {
        sf('ref', 'remsg', 'err', 'Email already registered');
        return;
    }

    sf('ref', 'remsg', 'ok', '');
    return true;
}
function vrln() {

    const v = $('rln').value.trim();

    if (!v) {
        sf('rlnf', 'rlnmsg', 'err', 'Last name is required');
        return false;
    }

    if (v.length < 2) {
        sf('rlnf', 'rlnmsg', 'err', 'Too short');
        return false;
    }

    sf('rlnf', 'rlnmsg', 'ok', '');
    return true;
}
/* ── STEP 2 validators ── */
function vrp() {

    const input = $('rpass');
    const v = input.value;

    if (!v) {
        sf('rpf', 'rpmsg', 'err', 'Password is required');
        return false;
    }

    if (v.length < 6) {
        sf('rpf', 'rpmsg', 'err', 'Password must be at least 6 characters');
        return false;
    }

    sf('rpf', 'rpmsg', 'ok', '');
    return true;
}
function vrc() {

    const input = $('rconf');

    const p = $('rpass').value;
    const c = input.value;

    if (!c) {
        sf('rcf', 'rcmsg', 'err', 'Confirm password is required');
        input.focus();
        return false;
    }

    if (p !== c) {
        sf('rcf', 'rcmsg', 'err', 'Passwords do not match');
        input.focus();
        return false;
    }

    sf('rcf', 'rcmsg', 'ok', 'Passwords match');
    return true;
}

/* ── Navigation ── */
function nextStep() {
    if (curStep === 0) {
        const fnOk = vrfn();
        const lnOk = vrln();
        const emOk = vre();
        if(!fnOk || !lnOk || !emOk) { return }
    }
    curStep++;
    showStep(curStep, false);
    updateStepper();
}
function prevStep() {
    curStep--;
    showStep(curStep, true);
    updateStepper();
}

/* ── Final submit ── */
function doSignup() {
    if (!vrp() || !vrc()) { return }
    if (!$('rterms').checked) {  return }
    const fn = $('rfn').value.trim(), ln = $('rln').value.trim();
    const user = {
        id: Date.now(),
        name: (fn + ' ' + ln).trim(),
        email: $('remail').value.trim(),
        pwd: btoa($('rpass').value),
        date: new Date().toLocaleDateString('en-IN')
    };
    const users = gU(); users.push(user); sU(users);
    renderU();
    // go to success step
    curStep = 2;
    showStep(2, false);
    updateStepper();
    // toast('Account created! Welcome ' + user.name + ' ✨');
}

/* ── Users ── */
const avC = [['#ede9fe', '#7c3aed'], ['#dbeafe', '#1d4ed8'], ['#dcfce7', '#15803d'], ['#fef3c7', '#b45309'], ['#ffe4e6', '#be123c']];
function renderU() {
    const users = gU(), box = $('ubox');
    if (!users.length) { box.style.display = 'none'; return }
    box.style.display = 'block';
    $('ulist').innerHTML = users.map((u, i) => {
        const [bg, fg] = avC[i % avC.length];
        const init = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        return `<div class="uchip"><div class="uav" style="background:${bg};color:${fg}">${init}</div><div style="flex:1"><div class="un">${u.name}</div><div class="ue">${u.email} · ${u.date}</div></div><button class="udel" onclick="delU(${u.id})">✕</button></div>`;
    }).join('');
}
function delU(id) { sU(gU().filter(u => u.id !== id)); renderU(); // toast('User removed')
}
renderU();
