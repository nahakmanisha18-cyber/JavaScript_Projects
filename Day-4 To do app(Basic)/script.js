// ===== DATA =====
let tasks = [
  { id: 1, text: "Wake up early", done: false },
  { id: 2, text: "Exercise", done: false },
  { id: 3, text: "Learn coding", done: false },
  { id: 4, text: "Work on project", done: false }
];
let nextId = 5;
let currentFilter = "all";

// ===== DOM ELEMENTS =====
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const footerRow = document.getElementById("footer-row");
const statTotal = document.getElementById("stat-total");
const statPending = document.getElementById("stat-pending");
const statDone = document.getElementById("stat-done");
const filterBtns = document.querySelectorAll(".filter-btn");

// ===== EVENT LISTENERS =====

// Add task on button click
addBtn.addEventListener("click", addTask);

// Add task on Enter key
taskInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") addTask();
});

// Filter buttons
filterBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentFilter = btn.getAttribute("data-filter");

    // Remove active from all, add to clicked
    filterBtns.forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");

    render();
  });
});


// ===== FUNCTIONS =====

// Add a new task
function addTask() {
  const text = taskInput.value.trim();
  if (text === "") {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: nextId,
    text: text,
    done: false,
  };
  nextId++;

  tasks.unshift(newTask); // Add at top
  taskInput.value = "";
  taskInput.focus();

  render();
}


// ===== THEME TOGGLER =====
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
  }
});

// Toggle task done/undone
function toggleTask(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return { id: task.id, text: task.text, done: !task.done };
    }
    return task;
  });
  render();
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  render();
}

// Clear all completed tasks
function clearDone() {
  tasks = tasks.filter(function (task) {
    return !task.done;
  });
  render();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== RENDER =====
function render() {
  // Count stats
  const total = tasks.length;
  const doneCount = tasks.filter(function (t) { return t.done; }).length;
  const pendingCount = total - doneCount;

  statTotal.textContent = total;
  statPending.textContent = pendingCount;
  statDone.textContent = doneCount;

  // Filter tasks
  let visible = tasks;
  if (currentFilter === "active") {
    visible = tasks.filter(function (t) { return !t.done; });
  } else if (currentFilter === "done") {
    visible = tasks.filter(function (t) { return t.done; });
  }

  // Render empty state
  if (visible.length === 0) {
    let message = "No tasks yet — add one above!";
    let icon = '<i class="fa-solid fa-clipboard"></i>';

    if (currentFilter === "done") {
      message = "No completed tasks yet.";
      icon = '<i class="fa-solid fa-trophy"></i>';
    } else if (currentFilter === "active") {
      message = "All tasks are done! Great job 🎉";
      icon = '<i class="fa-solid fa-circle-check"></i>';
    }

    taskList.innerHTML =
      '<div class="empty">' +
      '<span>' + icon + '</span>' +
      message +
      '</div>';
  } else {
    // Render task items
    taskList.innerHTML = visible
      .map(function (task) {
        return (
          '<div class="task-item' + (task.done ? " done" : "") + '" id="task-' + task.id + '">' +
          '<button class="check-btn" onclick="toggleTask(' + task.id + ')" title="Toggle complete">' +
          (task.done ? "✓" : "") +
          "</button>" +
          '<span class="task-text">' + escapeHtml(task.text) + "</span>" +
          '<button class="del-btn" onclick="deleteTask(' + task.id + ')" title="Delete task">' +
          '<i class="bi bi-trash3"></i>' +
          "</button>" +
          "</div>"
        );
      })
      .join("");
  }

  // Render footer (clear completed button)
  if (doneCount > 0) {
    footerRow.innerHTML =
      '<button class="clear-btn" onclick="clearDone()">Clear ' + doneCount + ' completed</button>';
  } else {
    footerRow.innerHTML = "";
  }
}



// ===== INITIAL RENDER =====
render();