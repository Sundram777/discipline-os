// --- State Management ---
let habits = JSON.parse(localStorage.getItem('habits')) || [];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let editId = null;

// --- DOM Elements ---
const habitBody = document.getElementById('habitBody');
const todayCount = document.getElementById('todayCount');
const todayBar = document.getElementById('todayBar');
const weeklyAvg = document.getElementById('weeklyAvg');
const motivationMsg = document.getElementById('motivationMsg');
const habitModal = document.getElementById('habitModal');

// --- Initialization ---
function init() {
    loadTheme();
    renderHabits();
    updateStats();
    updateDate();
    lucide.createIcons();
}

// --- Theme Memory ---
function loadTheme(){
    if(localStorage.getItem("theme") === "dark"){
        document.documentElement.classList.add("dark");
    }
}

document.getElementById('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
});

// --- Render Logic ---
function renderHabits() {
    habitBody.innerHTML = '';
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    habits.forEach(habit => {
        const row = document.createElement('tr');
        row.className = "border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition";
        
        let daysHtml = '';
        days.forEach((day, index) => {
            const isCompleted = habit.completed[day];
            const isMissed = !isCompleted && index < todayIndex;
            let statusClass = isCompleted ? 'day-completed' : (isMissed ? 'day-missed' : 'day-pending');
            
            daysHtml += `
                <td class="p-2">
                    <div onclick="toggleDay('${habit.id}', '${day}')" class="day-cell ${statusClass}">
                        ${isCompleted ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                    </div>
                </td>
            `;
        });

        row.innerHTML = `
            <td class="p-6 font-semibold">${habit.name}</td>
            <td class="p-6"><span class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700">${habit.category}</span></td>
            ${daysHtml}
            <td class="p-6 text-center font-bold text-orange-500">${calculateStreak(habit)}</td>
            <td class="p-6 text-center">
                <button onclick="editHabit('${habit.id}')">✏</button>
                <button onclick="deleteHabit('${habit.id}')">🗑</button>
            </td>
        `;
        habitBody.appendChild(row);
    });
    lucide.createIcons();
}

// --- Operations ---
function toggleDay(habitId, day) {
    const habit = habits.find(h => h.id === habitId);
    habit.completed[day] = !habit.completed[day];
    save();
    renderHabits();
    updateStats();
}

function saveHabit() {
    const name = document.getElementById('habitInput').value;
    let category = document.getElementById('categoryInput').value;
    if (!name) return alert("Please enter a habit name");

    if (editId) {
        const h = habits.find(h => h.id === editId);
        h.name = name;
        h.category = category;
    } else {
        habits.push({
            id: Date.now().toString(),
            name,
            category,
            completed: {Mon:false,Tue:false,Wed:false,Thu:false,Fri:false,Sat:false,Sun:false}
        });
    }
    closeModal();
    save();
    renderHabits();
    updateStats();
}

function deleteHabit(id) {
    habits = habits.filter(h => h.id !== id);
    save();
    renderHabits();
    updateStats();
}

// --- Stats ---
function updateStats() {
    const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const done = habits.filter(h => h.completed[today]).length;
    const total = habits.length;

    todayCount.innerText = `${done}/${total} Habits`;
    todayBar.style.width = total === 0 ? '0%' : `${Math.round((done/total)*100)}%`;

    let totalChecks = 0;
    habits.forEach(h => days.forEach(d => { if(h.completed[d]) totalChecks++; }));
    const weeklyPercent = total === 0 ? 0 : Math.round((totalChecks/(total*7))*100);
    weeklyAvg.innerText = `${weeklyPercent}%`;

    if(weeklyPercent >= 80) motivationMsg.innerText = "Elite discipline level 💪";
    else if(weeklyPercent >= 50) motivationMsg.innerText = "Good progress — keep pushing 🚀";
    else if(weeklyPercent > 0) motivationMsg.innerText = "You're building momentum 👏";
    else motivationMsg.innerText = "Your future self is watching 👀";
}

// --- Streak Fix ---
function calculateStreak(habit) {
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    let streak = 0;
    for (let i = todayIndex; i >= 0; i--) {
        if (habit.completed[days[i]]) streak++;
        else break;
    }
    return streak;
}

// --- Storage ---
function save() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// --- Modal ---
function openModal(id=null){
    editId=id;
    document.getElementById('habitModal').classList.remove('hidden');
}
function closeModal(){
    document.getElementById('habitModal').classList.add('hidden');
}

function updateDate(){
    document.getElementById('currentDateText').innerText = new Date().toDateString();
}

// --- Extras ---
document.getElementById('resetWeek').onclick = () => {
    habits.forEach(h=>days.forEach(d=>h.completed[d]=false));
    save(); renderHabits(); updateStats();
};

document.getElementById('saveHabitBtn').onclick = saveHabit;

init();
