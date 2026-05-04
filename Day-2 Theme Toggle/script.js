const toggle = document.getElementById("toggle");
const body = document.body;
const icon = document.getElementById("icon");

// Load theme
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
    icon.innerHTML = '<i class="bi bi-moon-fill"></i>';
}

toggle.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        icon.innerHTML = '<i class="bi bi-moon-fill"></i>';
    } else {
        localStorage.setItem("theme", "light");
        icon.innerHTML = '<i class="bi bi-sun-fill"></i>';
    }
});