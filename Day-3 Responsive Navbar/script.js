/* ═══════════════════════════════════════════
    THEME TOGGLE
    ═══════════════════════════════════════════ */
    const html           = document.documentElement;
    const desktopIcon    = document.getElementById('desktopIcon');
    const mobileIcon     = document.getElementById('mobileIcon');
    const themeDesktop   = document.getElementById('themeToggleDesktop');
    const themeMobile    = document.getElementById('themeToggleMobile');

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateIcons(savedTheme);

    function updateIcons(theme) {
    const isDark = theme === 'dark';
    const cls = isDark ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    if (desktopIcon) {desktopIcon.className = `bi ${cls}`; }
    if (mobileIcon)  {mobileIcon.className = `bi ${cls}`; }
}

    function toggleTheme() {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcons(next);
}

    themeDesktop && themeDesktop.addEventListener('click', toggleTheme);
    themeMobile  && themeMobile.addEventListener('click',  toggleTheme);

    /* ═══════════════════════════════════════════
       MOBILE SIDEBAR
    ═══════════════════════════════════════════ */
    const hamburgerBtn   = document.getElementById('hamburgerBtn');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose   = document.getElementById('sidebarClose');

    function openSidebar() {
        sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
    hamburgerBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
}

    function closeSidebar() {
        sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    hamburgerBtn.classList.remove('open');
    document.body.style.overflow = '';
}

    hamburgerBtn   && hamburgerBtn.addEventListener('click', openSidebar);
    sidebarClose   && sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay && sidebarOverlay.addEventListener('click', closeSidebar);

// Close on link click
document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', closeSidebar);
});
