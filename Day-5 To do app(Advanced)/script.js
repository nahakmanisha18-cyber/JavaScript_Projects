// ============================================================
//  ADVANCED TO-DO APP  —  script.js
//  Features: Add, Edit, Delete, Complete, Priority,
//            Search, Filter, Sort, Progress, localStorage
// ============================================================
// ===========================
//0. THEME TOGGLER 
// ===========================
const toggleBtn = document.getElementById("theme-toggle");

// Load saved theme
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    toggleBtn.classList.remove("bi-sun-fill");
    toggleBtn.classList.add("bi-moon-fill");
}

// Toggle theme
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    // Icon change
    if (document.body.classList.contains("light")) {
        toggleBtn.classList.remove("bi-sun-fill");
        toggleBtn.classList.add("bi-moon-fill");
        localStorage.setItem("theme", "light");
    } else {
        toggleBtn.classList.remove("bi-moon-fill");
        toggleBtn.classList.add("bi-sun-fill");
        localStorage.setItem("theme", "dark");
    }3
});
// ===========================
// 1. DATA & STATE
// ===========================
var STORAGE_KEY = "advanced_todo_tasks";

var tasks = loadFromStorage();
var nextId = getNextId();
var currentFilter = "all";
var searchQuery = "";
var currentSort = "newest";
var editingId = null;

// ===========================
// 2. LOAD / SAVE  (localStorage)
// ===========================
function loadFromStorage() {
    try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Could not load from localStorage:", e);
    }
    // Default tasks if nothing stored
    return [
        { id: 1, text: "Buy groceries", done: false, priority: "high", createdAt: Date.now() - 300000 },
        { id: 2, text: "Read for 30 minutes", done: true, priority: "low", createdAt: Date.now() - 200000 },
        { id: 3, text: "Exercise", done: false, priority: "medium", createdAt: Date.now() - 100000 },
    ];
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error("Could not save to localStorage:", e);
    }
}

function getNextId() {
    if (tasks.length === 0) return 1;
    var maxId = tasks.reduce(function (max, t) {
        return t.id > max ? t.id : max;
    }, 0);
    return maxId + 1;
}

// ===========================
// 3. DOM ELEMENTS
// ===========================
var taskInput = document.getElementById("task-input");
var prioritySelect = document.getElementById("priority-select");
var addBtn = document.getElementById("add-btn");
var searchInput = document.getElementById("search-input");
var taskList = document.getElementById("task-list");
var footerRow = document.getElementById("footer-row");
var sortSelect = document.getElementById("sort-select");
var filterBtns = document.querySelectorAll(".filter-btn");
var clearAllBtn = document.getElementById("clear-all-btn");
var dateDisplay = document.getElementById("date-display");

// Modal elements
var modalOverlay = document.getElementById("modal-overlay");
var editInput = document.getElementById("edit-input");
var editPriority = document.getElementById("edit-priority");
var modalCancel = document.getElementById("modal-cancel");
var modalSave = document.getElementById("modal-save");

// ===========================
// 4. INIT
// ===========================
function init() {
    // Show today's date
    var today = new Date();
    var options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    dateDisplay.textContent = today.toLocaleDateString("en-IN", options);

    // Event listeners
    addBtn.addEventListener("click", addTask);

    taskInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") addTask();
    });

    searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value.trim().toLowerCase();
        render();
    });

    sortSelect.addEventListener("change", function () {
        currentSort = sortSelect.value;
        render();
    });

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            currentFilter = btn.getAttribute("data-filter");
            filterBtns.forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            render();
        });
    });

    clearAllBtn.addEventListener("click", function () {
        if (tasks.length === 0) return;
        if (confirm("Are you sure you want to delete ALL tasks?")) {
            tasks = [];
            saveToStorage();
            render();
        }
    });

    // Modal events
    modalCancel.addEventListener("click", closeModal);
    modalSave.addEventListener("click", saveEdit);
    modalOverlay.addEventListener("click", function (e) {
        if (e.target === modalOverlay) closeModal();
    });
    editInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") closeModal();
    });

    render();
}

// ===========================
// 5. ADD TASK
// ===========================
function addTask() {
    var text = taskInput.value.trim();
    if (text === "") {
        taskInput.focus();
        taskInput.style.borderColor = "#e05c3a";
        setTimeout(function () {
            taskInput.style.borderColor = "";
        }, 1000);
        return;
    }

    var newTask = {
        id: nextId,
        text: text,
        done: false,
        priority: prioritySelect.value,
        createdAt: Date.now(),
    };
    nextId++;
    tasks.unshift(newTask);

    saveToStorage();
    taskInput.value = "";
    taskInput.focus();
    render();
}

// ===========================
// 6. TOGGLE COMPLETE
// ===========================
function toggleTask(id) {
    tasks = tasks.map(function (task) {
        if (task.id === id) {
            return {
                id: task.id,
                text: task.text,
                done: !task.done,
                priority: task.priority,
                createdAt: task.createdAt,
            };
        }
        return task;
    });
    saveToStorage();
    render();
}

// ===========================
// 7. DELETE TASK
// ===========================
function deleteTask(id) {
    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });
    saveToStorage();
    render();
}

// ===========================
// 8. EDIT TASK  (Modal)
// ===========================
function openEdit(id) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (!task) return;

    editingId = id;
    editInput.value = task.text;
    editPriority.value = task.priority;

    modalOverlay.classList.add("active");
    setTimeout(function () { editInput.focus(); }, 100);
}

function closeModal() {
    modalOverlay.classList.remove("active");
    editingId = null;
}

function saveEdit() {
    var text = editInput.value.trim();
    if (text === "") return;

    tasks = tasks.map(function (task) {
        if (task.id === editingId) {
            return {
                id: task.id,
                text: text,
                done: task.done,
                priority: editPriority.value,
                createdAt: task.createdAt,
            };
        }
        return task;
    });

    saveToStorage();
    closeModal();
    render();
}

// ===========================
// 9. CLEAR COMPLETED
// ===========================
function clearDone() {
    tasks = tasks.filter(function (t) { return !t.done; });
    saveToStorage();
    render();
}

// ===========================
// 10. HELPERS
// ===========================
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatDate(timestamp) {
    var date = new Date(timestamp);
    var day = date.getDate();
    var month = date.toLocaleString("en-IN", { month: "short" });
    var hour = date.getHours();
    var min = date.getMinutes().toString().padStart(2, "0");
    var ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return day + " " + month + ", " + hour + ":" + min + " " + ampm;
}

function priorityOrder(p) {
    if (p === "high") return 1;
    if (p === "medium") return 2;
    return 3;
}

// ===========================
// 11. FILTER + SORT + SEARCH
// ===========================
function getVisibleTasks() {
    var result = tasks.slice();

    // Filter
    if (currentFilter === "active") {
        result = result.filter(function (t) { return !t.done; });
    } else if (currentFilter === "done") {
        result = result.filter(function (t) { return t.done; });
    } else if (currentFilter === "high") {
        result = result.filter(function (t) { return t.priority === "high"; });
    }

    // Search
    if (searchQuery !== "") {
        result = result.filter(function (t) {
            return t.text.toLowerCase().indexOf(searchQuery) !== -1;
        });
    }

    // Sort
    if (currentSort === "newest") {
        result.sort(function (a, b) { return b.createdAt - a.createdAt; });
    } else if (currentSort === "oldest") {
        result.sort(function (a, b) { return a.createdAt - b.createdAt; });
    } else if (currentSort === "priority") {
        result.sort(function (a, b) {
            return priorityOrder(a.priority) - priorityOrder(b.priority);
        });
    } else if (currentSort === "alpha") {
        result.sort(function (a, b) {
            return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
        });
    }

    return result;
}

// ===========================
// 12. RENDER
// ===========================
function render() {
    // Stats
    var total = tasks.length;
    var doneCount = tasks.filter(function (t) { return t.done; }).length;
    var pending = total - doneCount;
    var highCount = tasks.filter(function (t) { return t.priority === "high" && !t.done; }).length;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-pending").textContent = pending;
    document.getElementById("stat-done").textContent = doneCount;
    document.getElementById("stat-high").textContent = highCount;

    // Progress bar
    var percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("progress-percent").textContent = percent + "%";

    // Visible tasks
    var visible = getVisibleTasks();

    // Empty state
    if (visible.length === 0) {
        var icon = '<i class="fa-solid fa-clipboard"></i>';
        var msg = "No tasks yet — add one above!";

        if (searchQuery !== "") {
            icon = '<i class="fa-solid fa-magnifying-glass"></i>';
            msg = 'No tasks match "' + searchQuery + '"';
        } else if (currentFilter === "done") {
            icon = '<i class="fa-solid fa-trophy"></i>';
            msg = "No completed tasks yet.";
        } else if (currentFilter === "active") {
            icon = '<i class="fa-solid fa-circle-check"></i>';
            msg = "All tasks done! Great job 🎉";
        } else if (currentFilter === "high") {
            icon = '<i class="fa-solid fa-location-crosshairs"></i>';
            msg = "No high priority tasks.";
        }

        taskList.innerHTML =
            '<div class="empty">' +
            '<span class="empty-icon">' + icon + '</span>' +
            msg +
            '</div>';
    } else {
        taskList.innerHTML = visible.map(function (task) {
            var priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            return (
                '<div class="task-item priority-' + task.priority + (task.done ? " done" : "") + '" id="task-' + task.id + '">' +

                // Checkbox
                '<button class="check-btn" onclick="toggleTask(' + task.id + ')" title="Toggle complete">' +
                (task.done ? "✓" : "") +
                '</button>' +

                // Info
                '<div class="task-info">' +
                '<span class="task-text">' + escapeHtml(task.text) + '</span>' +
                '<div class="task-meta">' +
                '<span class="priority-badge ' + task.priority + '">' + priorityLabel + '</span>' +
                '<span class="task-date">' + formatDate(task.createdAt) + '</span>' +
                '</div>' +
                '</div>' +

                // Actions
                '<div class="task-actions">' +
                '<button class="action-btn edit-btn" onclick="openEdit(' + task.id + ')" title="Edit task"><i class="fa-solid fa-pen-to-square"></i></button>' +
                '<button class="action-btn del-btn"  onclick="deleteTask(' + task.id + ')" title="Delete task">' + '<i class="bi bi-trash3"></i>' +
                "</button>" +
                '</div>' +

                '</div>'
            );
        }).join("");
    }

    // Footer — clear completed button
    if (doneCount > 0) {
        footerRow.innerHTML =
            '<button class="clear-done-btn" onclick="clearDone()">Clear ' + doneCount + ' completed</button>';
    } else {
        footerRow.innerHTML = "";
    }
}

// ===========================
// 13. START
// ===========================
init();