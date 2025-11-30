// ---- Data & Storage ----
let habits = [];

const STORAGE_KEY = "smartHabitTrackerHabits";

function loadHabits() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        habits = JSON.parse(stored);
    } else {
        habits = [];
    }
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// ---- Helpers ----
function todayString() {
    return new Date().toDateString(); // same string for same day
}

// ---- Rendering ----
function renderHabits() {
    const list = document.getElementById("habit-list");
    const emptyText = document.getElementById("no-habits-text");

    list.innerHTML = "";

    if (habits.length === 0) {
        emptyText.style.display = "block";
        return;
    } else {
        emptyText.style.display = "none";
    }

    habits.forEach(habit => {
        const card = document.createElement("div");
        card.className = "habit-card";

        const header = document.createElement("div");
        header.className = "habit-header";

        const leftSide = document.createElement("div");
        const nameEl = document.createElement("div");
        nameEl.className = "habit-name";
        nameEl.textContent = habit.name;

        const freqEl = document.createElement("div");
        freqEl.className = "habit-frequency";
        freqEl.textContent = habit.frequency === "daily" ? "Daily habit" : "Weekly habit";

        leftSide.appendChild(nameEl);
        leftSide.appendChild(freqEl);

        const streakEl = document.createElement("div");
        streakEl.className = "habit-meta";
        streakEl.textContent = `🔥 Streak: ${habit.streak} days`;

        header.appendChild(leftSide);
        header.appendChild(streakEl);

        const meta = document.createElement("div");
        meta.className = "habit-meta";
        const lastText = habit.lastCompleted
            ? `Last done: ${habit.lastCompleted}`
            : "Not completed yet";
        meta.textContent = `${lastText} • Total completions: ${habit.totalCompleted}`;

        const actions = document.createElement("div");
        actions.className = "habit-actions";

        const doneBtn = document.createElement("button");
        doneBtn.className = "btn-small btn-primary";
        doneBtn.textContent = "Done Today";
        doneBtn.dataset.id = habit.id;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-small btn-secondary";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.id = habit.id;
        deleteBtn.dataset.action = "delete";

        actions.appendChild(doneBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(header);
        card.appendChild(meta);
        card.appendChild(actions);

        list.appendChild(card);
    });
}

// ---- Actions ----
function addHabit() {
    const nameInput = document.getElementById("habit-name");
    const freqSelect = document.getElementById("habit-frequency");

    const name = nameInput.value.trim();
    const frequency = freqSelect.value;

    if (!name) {
        alert("Please enter a habit name.");
        return;
    }

    const newHabit = {
        id: Date.now().toString(),
        name,
        frequency,       // "daily" or "weekly"
        totalCompleted: 0,
        streak: 0,
        lastCompleted: null
    };

    habits.push(newHabit);
    saveHabits();
    renderHabits();

    nameInput.value = "";
}

function markDoneToday(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = todayString();

    if (habit.lastCompleted === today) {
        alert("You've already marked this habit as done today.");
        return;
    }

    // New day completion
    habit.totalCompleted += 1;

    // If previous completion was yesterday, keep streak going;
    // otherwise reset streak to 1.
    if (habit.lastCompleted) {
        const lastDate = new Date(habit.lastCompleted);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate.toDateString() === yesterday.toDateString()) {
            habit.streak += 1;
        } else {
            habit.streak = 1;
        }
    } else {
        habit.streak = 1;
    }

    habit.lastCompleted = today;
    saveHabits();
    renderHabits();
}

function deleteHabit(habitId) {
    habits = habits.filter(h => h.id !== habitId);
    saveHabits();
    renderHabits();
}

// ---- Event Listeners ----
document.addEventListener("DOMContentLoaded", () => {
    loadHabits();
    renderHabits();

    document.getElementById("add-habit-btn")
        .addEventListener("click", addHabit);

    // Event delegation for Done/Delete buttons
    document.getElementById("habit-list")
        .addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            if (!id) return;

            if (e.target.dataset.action === "delete") {
                deleteHabit(id);
            } else {
                markDoneToday(id);
            }
        });
});
