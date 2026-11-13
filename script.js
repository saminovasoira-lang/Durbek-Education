
// ============================================
// DURBEK EDUCATION 2.0
// HTML + CSS + JAVASCRIPT
// ============================================

// 1. DATABASE

const defaults = {
    users: [
        {id: 1, username: "admin", password: "1234", name: "Durbek", role: "admin", phone: "90 000 00 00"},
        {id: 2, username: "jasur", password: "1234", name: "Jasur Ustoz", role: "teacher", phone: "90 555 11 22"},
        {id: 3, username: "ali", password: "1234", name: "Ali Valiyev", role: "student", phone: "90 111 22 33"}
    ],

    students: [
        {id: 1, name: "Ali Valiyev", group: "IELTS B2", phone: "90 111 22 33", score: 95},
        {id: 2, name: "Vali Karimov", group: "Frontend", phone: "91 222 33 44", score: 88},
        {id: 3, name: "Sardor Akbarov", group: "IELTS B2", phone: "93 333 44 55", score: 76},
        {id: 4, name: "Madina Aliyeva", group: "Beginner", phone: "94 444 55 66", score: 99}
    ],

    teachers: [
        {id: 1, name: "Jasur Ustoz", subject: "English", phone: "90 555 11 22"},
        {id: 2, name: "Aziz Ustoz", subject: "Programming", phone: "91 666 22 33"}
    ],

    courses: [
        {id: 1, name: "IELTS B2", teacher: "Jasur Ustoz", price: 500000},
        {id: 2, name: "Frontend", teacher: "Aziz Ustoz", price: 400000},
        {id: 3, name: "Beginner", teacher: "Jasur Ustoz", price: 350000}
    ],

    groups: [
        {id: 1, name: "IELTS B2", teacher: "Jasur Ustoz", course: "IELTS B2", time: "09:00"},
        {id: 2, name: "Frontend", teacher: "Aziz Ustoz", course: "Frontend", time: "14:00"},
        {id: 3, name: "Beginner", teacher: "Jasur Ustoz", course: "Beginner", time: "16:00"}
    ],

    attendance: [],
    payments: [],
    notifications: [
        {id: 1, text: "Durbek Education 2.0 tizimiga xush kelibsiz!", date: new Date().toLocaleDateString("uz-UZ"), read: false}
    ]
};

function load(key) {
    const saved = localStorage.getItem("de2_" + key);

    if (saved === null) {
        localStorage.setItem("de2_" + key, JSON.stringify(defaults[key]));
        return structuredClone(defaults[key]);
    }

    try {
        return JSON.parse(saved);
    } catch {
        return structuredClone(defaults[key]);
    }
}

let users = load("users");
let students = load("students");
let teachers = load("teachers");
let courses = load("courses");
let groups = load("groups");
let attendance = load("attendance");
let payments = load("payments");
let notifications = load("notifications");

let currentUser = null;
let currentPage = "dashboard";

const $ = id => document.getElementById(id);

function save() {
    const data = {
        users, students, teachers, courses,
        groups, attendance, payments, notifications
    };

    Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem("de2_" + key, JSON.stringify(value));
    });
}

// 2. HELPER FUNCTIONS

function money(value) {
    return Number(value).toLocaleString("uz-UZ") + " so'm";
}

function dateNow() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function toast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("show");

    setTimeout(() => {
        $("toast").classList.remove("show");
    }, 2500);
}

function addNotification(text) {
    notifications.unshift({
        id: Date.now(),
        text,
        date: dateNow(),
        read: false
    });

    save();
    updateNotifications();
}

function updateNotifications() {
    const count = notifications.filter(n => !n.read).length;
    $("notificationCount").textContent = count;
}

// 3. LOGIN

$("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = $("username").value.trim().toLowerCase();
    const password = $("password").value;

    const user = users.find(u =>
        u.username.toLowerCase() === username &&
        u.password === password
    );

    if (!user) {
        toast("Login yoki parol noto'g'ri!");
        return;
    }

    currentUser = user;

    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");

    $("profileName").textContent = user.name;
    $("avatar").textContent = user.name[0].toUpperCase();
    $("topAvatar").textContent = user.name[0].toUpperCase();

    const roles = {
        admin: "Administrator",
        teacher: "O'qituvchi",
        student: "O'quvchi"
    };

    $("profileRole").textContent = roles[user.role];

    updateNavigation();
    updateNotifications();
    navigate("dashboard");

    toast("Xush kelibsiz, " + user.name + "!");
});

// 4. PERMISSIONS

const permissions = {
    admin: [
        "dashboard", "students", "teachers", "courses",
        "groups", "attendance", "history", "tests",
        "ranking", "payments", "reports", "profile",
        "notifications"
    ],

    teacher: [
        "dashboard", "attendance", "history",
        "tests", "ranking", "profile", "notifications"
    ],

    student: [
        "dashboard", "tests", "ranking",
        "history", "profile", "notifications"
    ]
};

function updateNavigation() {
    document.querySelectorAll(".nav-link").forEach(link => {
        const page = link.dataset.page;

        link.style.display =
            permissions[currentUser.role].includes(page)
                ? "block"
                : "none";
    });
}

// 5. NAVIGATION

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();

        navigate(link.dataset.page);
        $("sidebar").classList.remove("open");
    });
});

function navigate(page) {
    if (!permissions[currentUser.role].includes(page)) {
        toast("Bu sahifaga ruxsatingiz yo'q!");
        return;
    }

    currentPage = page;

    const titles = {
        dashboard: "Dashboard",
        students: "O'quvchilar",
        teachers: "O'qituvchilar",
        courses: "Kurslar",
        groups: "Guruhlar",
        attendance: "Davomat",
        history: "Davomat tarixi",
        tests: "Online test",
        ranking: "Reyting",
        payments: "To'lovlar",
        reports: "Hisobotlar",
        profile: "Mening profilim",
        notifications: "Bildirishnomalar"
    };

    $("pageTitle").textContent = titles[page];

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    render();
}

function render() {
    const pages = {
        dashboard: dashboardPage,
        students: studentsPage,
        teachers: teachersPage,
        courses: coursesPage,
        groups: groupsPage,
        attendance: attendancePage,
        history: historyPage,
        tests: testsPage,
        ranking: rankingPage,
        payments: paymentsPage,
        reports: reportsPage,
        profile: profilePage,
        notifications: notificationsPage
    };

    $("content").innerHTML = "";
    pages[currentPage]();
}

// 6. DASHBOARD

function dashboardPage() {
    if (currentUser.role === "student") {
        studentDashboard();
        return;
    }

    if (currentUser.role === "teacher") {
        teacherDashboard();
        return;
    }

    const income = payments.reduce((s, p) => s + p.amount, 0);

    $("content").innerHTML = `
        <div class="welcome">
            <h2>Assalomu alaykum, ${safe(currentUser.name)}!</h2>
            <p>Durbek Education boshqaruv markaziga xush kelibsiz.</p>
        </div>

        <div class="stats">
            ${stat("👨‍🎓", "O'quvchilar", students.length)}
            ${stat("👨‍🏫", "O'qituvchilar", teachers.length)}
            ${stat("📚", "Kurslar", courses.length)}
            ${stat("💰", "Tushum", money(income))}
        </div>

        <div class="panel">
            <h3>O'quvchilar statistikasi</h3>
            <div class="chart">
                ${chartBar("O'quvchilar", students.length, students.length || 1)}
                ${chartBar("O'qituvchilar", teachers.length, students.length || 1)}
                ${chartBar("Guruhlar", groups.length, students.length || 1)}
                ${chartBar("Kurslar", courses.length, students.length || 1)}
            </div>
        </div>

        <div class="panel">
            <h3>So'nggi o'quvchilar</h3>
            ${studentTable()}
        </div>
    `;
}

function stat(icon, title, value) {
    return `
        <div class="stat-card">
            <div class="stat-icon">${icon}</div>
            <p>${title}</p>
            <h2>${value}</h2>
        </div>
    `;
}

function chartBar(label, value, max) {
    const height = Math.max(5, value / max * 100);

    return `
        <div class="chart-item">
            <strong>${value}</strong>
            <div class="bar" style="height:${height}%"></div>
            <small>${label}</small>
        </div>
    `;
}

function studentDashboard() {
    const student = findCurrentStudent();

    if (!student) {
        $("content").innerHTML = `
            <div class="welcome">
                <h2>Xush kelibsiz!</h2>
                <p>Siz hali o'quvchilar ro'yxatiga biriktirilmagansiz.</p>
            </div>
        `;
        return;
    }

    const paid = getPaid(student.id);
    const due = getDue(student);
    const records = attendance.filter(a => a.studentId === student.id);
    const present = records.filter(a => a.status === "Keldi").length;

    $("content").innerHTML = `
        <div class="welcome">
            <h2>Salom, ${safe(student.name)}!</h2>
            <p>Shaxsiy o'quvchi kabinetingiz.</p>
        </div>

        <div class="stats">
            ${stat("📚", "Guruh", safe(student.group))}
            ${stat("🏆", "Ball", student.score + "%")}
            ${stat("📅", "Kelgan kunlar", present)}
            ${stat("💰", "To'langan", money(paid))}
        </div>

        <div class="panel">
            <h3>To'lov holati</h3>
            <p>Oylik to'lov: ${money(getMonthlyPrice(student))}</p>
            <br>
            <p>Jami to'langan: ${money(paid)}</p>
            <br>
            <p>Qarzdorlik: <strong>${money(due)}</strong></p>
        </div>

        <div class="panel">
            <h3>So'nggi davomat</h3>
            ${historyTable(records.slice(-5).reverse())}
        </div>
    `;
}

function teacherDashboard() {
    const teacher = teachers.find(t =>
        t.name.toLowerCase() === currentUser.name.toLowerCase()
    );

    const ownGroups = groups.filter(g => g.teacher === currentUser.name);
    const ownStudents = students.filter(s =>
        ownGroups.some(g => g.name === s.group)
    );

    $("content").innerHTML = `
        <div class="welcome">
            <h2>Xush kelibsiz, ${safe(currentUser.name)}!</h2>
            <p>O'qituvchi kabineti.</p>
        </div>

        <div class="stats">
            ${stat("👨‍🎓", "O'quvchilar", ownStudents.length)}
            ${stat("📚", "Guruhlar", ownGroups.length)}
            ${stat("📅", "Bugungi davomat", attendance.filter(a => a.date === dateNow() && a.status === "Keldi").length)}
            ${stat("📖", "Fan", teacher ? safe(teacher.subject) : "Belgilanmagan")}
        </div>

        <div class="panel">
            <h3>Sizning guruhlaringiz</h3>
            ${ownGroups.map(g => `
                <div class="rank-item">
                    <strong>${safe(g.name)}</strong>
                    <span>${safe(g.time)}</span>
                </div>
            `).join("") || "Guruh topilmadi"}
        </div>

        <div class="panel">
            <h3>Sizning o'quvchilaringiz</h3>
            ${studentTable(ownStudents)}
        </div>
    `;
}

function findCurrentStudent() {
    return students.find(s =>
        s.name.toLowerCase() === currentUser.name.toLowerCase()
    );
}

// 7. STUDENT TABLE

function studentTable(list = students) {
    if (!list.length) return `<p class="muted">Ma'lumot mavjud emas.</p>`;

    return `
        <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Ism</th>
                    <th>Guruh</th>
                    <th>Telefon</th>
                    <th>Ball</th>
                    <th>Amal</th>
                </tr>
            </thead>
            <tbody>
                ${list.map(s => `
                    <tr>
                        <td>${safe(s.name)}</td>
                        <td>${safe(s.group)}</td>
                        <td>${safe(s.phone)}</td>
                        <td><span class="badge blue">${s.score}%</span></td>
                        <td>
                            ${currentUser.role === "admin"
                                ? `<button class="danger-btn" onclick="deleteStudent(${s.id})">O'chirish</button>`
                                : "-"}
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        </div>
    `;
}

// 8. STUDENTS

function studentsPage() {
    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>O'quvchilar</h2>
                <p class="muted">Jami: ${students.length}</p>
            </div>
            <button class="action-btn" onclick="showStudentForm()">+ O'quvchi qo'shish</button>
        </div>

        <div id="studentForm"></div>

        <div class="panel">
            ${studentTable()}
        </div>
    `;
}

function showStudentForm() {
    $("studentForm").innerHTML = `
        <div class="panel">
            <h3>Yangi o'quvchi</h3>

            <form id="addStudentForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Ism</label>
                        <input name="name" required>
                    </div>

                    <div class="form-group">
                        <label>Guruh</label>
                        <select name="group" required>
                            ${groups.map(g => `<option value="${safe(g.name)}">${safe(g.name)}</option>`).join("")}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Telefon</label>
                        <input name="phone" required>
                    </div>

                    <div class="form-group">
                        <label>Login</label>
                        <input name="username" required>
                    </div>

                    <div class="form-group">
                        <label>Parol</label>
                        <input name="password" required>
                    </div>
                </div>

                <button class="action-btn" style="margin-top:18px">Saqlash</button>
            </form>
        </div>
    `;

    $("addStudentForm").addEventListener("submit", e => {
        e.preventDefault();

        const f = new FormData(e.target);
        const name = f.get("name").trim();
        const username = f.get("username").trim().toLowerCase();

        if (users.some(u => u.username.toLowerCase() === username)) {
            toast("Bu login band!");
            return;
        }

        students.push({
            id: Date.now(),
            name,
            group: f.get("group"),
            phone: f.get("phone"),
            score: 0
        });

        users.push({
            id: Date.now() + 1,
            username,
            password: f.get("password"),
            name,
            role: "student",
            phone: f.get("phone")
        });

        save();
        addNotification(name + " yangi o'quvchi sifatida qo'shildi.");
        render();
        toast("O'quvchi va login yaratildi!");
    });
}

function deleteStudent(id) {
    if (!confirm("O'quvchini o'chirasizmi?")) return;

    const student = students.find(s => s.id === id);

    students = students.filter(s => s.id !== id);
    attendance = attendance.filter(a => a.studentId !== id);
    payments = payments.filter(p => p.studentId !== id);

    if (student) {
        users = users.filter(u =>
            !(u.role === "student" && u.name === student.name)
        );
    }

    save();
    render();
    toast("O'quvchi o'chirildi!");
}

// 9. TEACHERS

function teachersPage() {
    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>O'qituvchilar</h2>
                <p class="muted">Jami: ${teachers.length}</p>
            </div>
            <button class="action-btn" onclick="showTeacherForm()">+ O'qituvchi qo'shish</button>
        </div>

        <div id="teacherForm"></div>

        <div class="panel">
            <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Ism</th><th>Fan</th><th>Telefon</th><th>Amal</th></tr>
                </thead>
                <tbody>
                    ${teachers.map(t => `
                        <tr>
                            <td>${safe(t.name)}</td>
                            <td>${safe(t.subject)}</td>
                            <td>${safe(t.phone)}</td>
                            <td><button class="danger-btn" onclick="deleteTeacher(${t.id})">O'chirish</button></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            </div>
        </div>
    `;
}

function showTeacherForm() {
    $("teacherForm").innerHTML = `
        <div class="panel">
            <h3>Yangi o'qituvchi</h3>
            <form id="addTeacherForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Ism</label>
                        <input name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Fan</label>
                        <input name="subject" required>
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input name="phone" required>
                    </div>
                    <div class="form-group">
                        <label>Login</label>
                        <input name="username" required>
                    </div>
                    <div class="form-group">
                        <label>Parol</label>
                        <input name="password" required>
                    </div>
                </div>
                <button class="action-btn" style="margin-top:18px">Saqlash</button>
            </form>
        </div>
    `;

    $("addTeacherForm").addEventListener("submit", e => {
        e.preventDefault();

        const f = new FormData(e.target);
        const username = f.get("username").trim().toLowerCase();
        const name = f.get("name").trim();

        if (users.some(u => u.username.toLowerCase() === username)) {
            toast("Bu login band!");
            return;
        }

        teachers.push({
            id: Date.now(),
            name,
            subject: f.get("subject"),
            phone: f.get("phone")
        });

        users.push({
            id: Date.now() + 1,
            username,
            password: f.get("password"),
            name,
            role: "teacher",
            phone: f.get("phone")
        });

        save();
        addNotification(name + " yangi o'qituvchi sifatida qo'shildi.");
        render();
        toast("O'qituvchi qo'shildi!");
    });
}

function deleteTeacher(id) {
    if (!confirm("O'qituvchini o'chirasizmi?")) return;

    const teacher = teachers.find(t => t.id === id);

    teachers = teachers.filter(t => t.id !== id);

    if (teacher) {
        users = users.filter(u =>
            !(u.role === "teacher" && u.name === teacher.name)
        );
    }

    save();
    render();
    toast("O'qituvchi o'chirildi!");
}

// 10. COURSES

function coursesPage() {
    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>Kurslar</h2>
                <p class="muted">Ta'lim yo'nalishlari</p>
            </div>
            <button class="action-btn" onclick="showCourseForm()">+ Kurs qo'shish</button>
        </div>

        <div id="courseForm"></div>

        <div class="stats">
            ${courses.map(c => `
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <h3>${safe(c.name)}</h3>
                    <p>${safe(c.teacher)}</p>
                    <h2>${money(c.price)}</h2>
                    <button class="danger-btn" onclick="deleteCourse(${c.id})">O'chirish</button>
                </div>
            `).join("")}
        </div>
    `;
}

function showCourseForm() {
    $("courseForm").innerHTML = `
        <div class="panel">
            <h3>Yangi kurs</h3>
            <form id="addCourseForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Kurs nomi</label>
                        <input name="name" required>
                    </div>
                    <div class="form-group">
                        <label>O'qituvchi</label>
                        <select name="teacher">
                            ${teachers.map(t => `<option>${safe(t.name)}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Oylik to'lov</label>
                        <input name="price" type="number" min="0" required>
                    </div>
                </div>
                <button class="action-btn" style="margin-top:18px">Saqlash</button>
            </form>
        </div>
    `;

    $("addCourseForm").addEventListener("submit", e => {
        e.preventDefault();

        const f = new FormData(e.target);

        courses.push({
            id: Date.now(),
            name: f.get("name").trim(),
            teacher: f.get("teacher"),
            price: Number(f.get("price"))
        });

        save();
        render();
        toast("Kurs yaratildi!");
    });
}

function deleteCourse(id) {
    if (!confirm("Kursni o'chirishni xohlaysizmi?")) return;

    courses = courses.filter(c => c.id !== id);
    save();
    render();
}

// 11. GROUPS

function groupsPage() {
    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>Guruhlar boshqaruvi</h2>
                <p class="muted">Jami ${groups.length} ta guruh</p>
            </div>
            <button class="action-btn" onclick="showGroupForm()">+ Guruh yaratish</button>
        </div>

        <div id="groupForm"></div>

        <div class="stats">
            ${groups.map(g => {
                const count = students.filter(s => s.group === g.name).length;

                return `
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <h3>${safe(g.name)}</h3>
                        <p>O'qituvchi: ${safe(g.teacher)}</p>
                        <p>Kurs: ${safe(g.course)}</p>
                        <p>Dars vaqti: ${safe(g.time)}</p>
                        <h2>${count} ta o'quvchi</h2>
                        <button class="danger-btn" onclick="deleteGroup(${g.id})">O'chirish</button>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function showGroupForm() {
    $("groupForm").innerHTML = `
        <div class="panel">
            <h3>Yangi guruh</h3>
            <form id="addGroupForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Guruh nomi</label>
                        <input name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Kurs</label>
                        <select name="course">
                            ${courses.map(c => `<option>${safe(c.name)}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>O'qituvchi</label>
                        <select name="teacher">
                            ${teachers.map(t => `<option>${safe(t.name)}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dars vaqti</label>
                        <input type="time" name="time" required>
                    </div>
                </div>
                <button class="action-btn" style="margin-top:18px">Guruh yaratish</button>
            </form>
        </div>
    `;

    $("addGroupForm").addEventListener("submit", e => {
        e.preventDefault();

        const f = new FormData(e.target);
        const name = f.get("name").trim();

        if (groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
            toast("Bu guruh mavjud!");
            return;
        }

        groups.push({
            id: Date.now(),
            name,
            course: f.get("course"),
            teacher: f.get("teacher"),
            time: f.get("time")
        });

        save();
        addNotification(name + " guruhi yaratildi.");
        render();
        toast("Guruh yaratildi!");
    });
}

function deleteGroup(id) {
    const group = groups.find(g => g.id === id);

    if (!group) return;

    if (students.some(s => s.group === group.name)) {
        toast("Guruhda o'quvchilar bor. Avval ularni boshqa guruhga o'tkazing.");
        return;
    }

    if (!confirm("Guruhni o'chirasizmi?")) return;

    groups = groups.filter(g => g.id !== id);
    save();
    render();
    toast("Guruh o'chirildi!");
}

// 12. ATTENDANCE

function attendancePage() {
    const ownGroups = currentUser.role === "teacher"
        ? groups.filter(g => g.teacher === currentUser.name)
        : groups;

    const list = currentUser.role === "teacher"
        ? students.filter(s => ownGroups.some(g => g.name === s.group))
        : students;

    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>Davomat</h2>
                <p class="muted">Bugungi sana: ${dateNow()}</p>
            </div>
        </div>

        <div class="panel">
            <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>O'quvchi</th><th>Guruh</th><th>Davomat</th></tr>
                </thead>
                <tbody>
                    ${list.map(s => {
                        const record = attendance.find(a =>
                            a.studentId === s.id && a.date === dateNow()
                        );

                        return `
                            <tr>
                                <td>${safe(s.name)}</td>
                                <td>${safe(s.group)}</td>
                                <td>
                                    <select onchange="setAttendance(${s.id}, this.value)">
                                        <option value="">Belgilanmagan</option>
                                        <option value="Keldi" ${record?.status === "Keldi" ? "selected" : ""}>Keldi</option>
                                        <option value="Kelmagan" ${record?.status === "Kelmagan" ? "selected" : ""}>Kelmagan</option>
                                        <option value="Kechikdi" ${record?.status === "Kechikdi" ? "selected" : ""}>Kechikdi</option>
                                    </select>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
            </div>
        </div>
    `;
}

function setAttendance(id, status) {
    attendance = attendance.filter(a =>
        !(a.studentId === id && a.date === dateNow())
    );

    if (status) {
        attendance.push({
            id: Date.now(),
            studentId: id,
            date: dateNow(),
            status
        });
    }

    save();
    toast("Davomat saqlandi!");
}

// 13. ATTENDANCE HISTORY

function historyTable(records) {
    if (!records.length) {
        return `<p class="muted">Davomat yozuvlari yo'q.</p>`;
    }

    return `
        <div class="table-wrap">
        <table>
            <thead>
                <tr><th>Sana</th><th>O'quvchi</th><th>Holat</th></tr>
            </thead>
            <tbody>
                ${records.map(a => {
                    const student = students.find(s => s.id === a.studentId);

                    return `
                        <tr>
                            <td>${safe(a.date)}</td>
                            <td>${safe(student?.name || "O'chirilgan o'quvchi")}</td>
                            <td><span class="badge ${a.status === "Kelmagan" ? "red" : "blue"}">${safe(a.status)}</span></td>
                        </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
        </div>
    `;
}

function historyPage() {
    let records = [...attendance];

    if (currentUser.role === "student") {
        const student = findCurrentStudent();
        records = records.filter(a => student && a.studentId === student.id);
    }

    if (currentUser.role === "teacher") {
        const ownGroups = groups.filter(g => g.teacher === currentUser.name);
        const ids = students
            .filter(s => ownGroups.some(g => g.name === s.group))
            .map(s => s.id);

        records = records.filter(a => ids.includes(a.studentId));
    }

    records.reverse();

    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>Davomat tarixi</h2>
                <p class="muted">Barcha davomat yozuvlari</p>
            </div>
        </div>

        <div class="panel">
            ${historyTable(records)}
        </div>
    `;
}

// 14. ONLINE TEST

const questions = [
    {q: "What is the past form of GO?", options: ["Goed", "Went", "Gone", "Going"], answer: 1},
    {q: "Choose the correct sentence:", options: ["She are happy", "She am happy", "She is happy", "She be happy"], answer: 2},
    {q: "Opposite of Difficult?", options: ["Easy", "Hard", "Strong", "Big"], answer: 0},
    {q: "I _____ a student.", options: ["is", "are", "am", "be"], answer: 2},
    {q: "Plural of Child?", options: ["Childs", "Children", "Childes", "Childrens"], answer: 1}
];

function testsPage() {
    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>English Grammar Test</h2>
                <p class="muted">5 ta savol / 100 ball</p>
            </div>
        </div>

        <div class="panel">
            <form id="testForm">
                ${questions.map((q, i) => `
                    <div class="test-question">${i + 1}. ${q.q}</div>
                    ${q.options.map((option, j) => `
                        <label class="test-option">
                            <input type="radio" name="q${i}" value="${j}" required>
                            ${option}
                        </label>
                    `).join("")}
                `).join("")}

                <button class="action-btn">Testni yakunlash</button>
            </form>
            <div id="testResult"></div>
        </div>
    `;

    $("testForm").addEventListener("submit", e => {
        e.preventDefault();

        const f = new FormData(e.target);
        let score = 0;

        questions.forEach((q, i) => {
            if (Number(f.get("q" + i)) === q.answer) score++;
        });

        const percent = score * 20;

        if (currentUser.role === "student") {
            const student = findCurrentStudent();

            if (student) {
                student.score = Math.max(student.score, percent);
                save();
            }
        }

        $("testResult").innerHTML = `
            <div class="welcome" style="margin-top:20px">
                <h2>Natijangiz: ${percent}%</h2>
                <p>${score} / 5 ta to'g'ri javob.</p>
            </div>
        `;

        e.target.querySelector("button").disabled = true;
        toast("Test yakunlandi!");
    });
}

// 15. RANKING

function rankingPage() {
    let list = [...students].sort((a, b) => b.score - a.score);

    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>O'quvchilar reytingi</h2>
                <p class="muted">Test natijalari bo'yicha</p>
            </div>
        </div>

        <div class="panel">
            ${list.map((s, i) => `
                <div class="rank-item">
                    <div style="display:flex;align-items:center;gap:14px">
                        <span class="rank-number">${i + 1}</span>
                        <div>
                            <strong>${safe(s.name)}</strong>
                            <p class="muted">${safe(s.group)}</p>
                        </div>
                    </div>
                    <strong>${s.score}%</strong>
                </div>
            `).join("")}
        </div>
    `;
}

// 16. PAYMENT CALCULATIONS

function getPaid(studentId) {
    return payments
        .filter(p => p.studentId === studentId)
        .reduce((sum, p) => sum + p.amount, 0);
}

function getMonthlyPrice(student) {
    const course = courses.find(c => c.name === student.group);
    return course ? course.price : 0;
}

function getDue(student) {
    const price = getMonthlyPrice(student);
    return Math.max(0, price - getPaid(student.id));
}

// 17. PAYMENTS

function paymentsPage() {
    const income = payments.reduce((sum, p) => sum + p.amount, 0);

    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>To'lovlar</h2>
                <p class="muted">Moliyaviy boshqaruv</p>
            </div>
            <button class="action-btn" onclick="showPaymentForm()">+ To'lov qo'shish</button>
        </div>

        <div id="paymentForm"></div>

        <div class="stats">
            ${stat("💰", "Jami tushum", money(income))}
            ${stat("🧾", "To'lovlar soni", payments.length)}
            ${stat("⚠️", "Qarzdorlar", students.filter(s => getDue(s) > 0).length)}
            ${stat("👨‍🎓", "O'quvchilar", students.length)}
        </div>

        <div class="panel">
            <h3>To'lovlar tarixi</h3>
            <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>O'quvchi</th><th>Miqdor</th><th>Sana</th><th>Amal</th></tr>
                </thead>
                <tbody>
                    ${payments.map(p => `
                        <tr>
                            <td>${safe(p.studentName)}</td>
                            <td>${money(p.amount)}</td>
                            <td>${safe(p.date)}</td>
                            <td><button class="danger-btn" onclick="deletePayment(${p.id})">O'chirish</button></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            </div>
        </div>
    `;
}

function showPaymentForm() {
    $("paymentForm").innerHTML = `
        <div class="panel">
            <h3>Yangi to'lov</h3>
            <form id="addPaymentForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>O'quvchi</label>
                        <select name="studentId" required>
                            ${students.map(s => `<option value="${s.id}">${safe(s.name)}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Miqdor</label>
                        <input name="amount" type="number" min="1" required>
                    </div>
                </div>
                <button class="action-btn" style="margin-top:18px">To'lovni saqlash</button>
            </form>
        </div>
    `;

    $("addPaymentForm").addEventListener("submit", e => {
        e.preventDefault();

        const f = new FormData(e.target);
        const student = students.find(s => s.id === Number(f.get("studentId")));

        if (!student) return;

        payments.push({
            id: Date.now(),
            studentId: student.id,
            studentName: student.name,
            amount: Number(f.get("amount")),
            date: dateNow()
        });

        save();
        addNotification(student.name + " uchun to'lov qabul qilindi.");
        render();
        toast("To'lov saqlandi!");
    });
}

function deletePayment(id) {
    if (!confirm("To'lovni o'chirasizmi?")) return;

    payments = payments.filter(p => p.id !== id);
    save();
    render();
    toast("To'lov yozuvi o'chirildi!");
}

// 18. REPORTS

function reportsPage() {
    const income = payments.reduce((s, p) => s + p.amount, 0);
    const debts = students.reduce((s, student) => s + getDue(student), 0);

    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>Moliyaviy hisobot</h2>
                <p class="muted">Joriy oylik to'lovlar holati</p>
            </div>
        </div>

        <div class="stats">
            ${stat("💰", "Jami tushum", money(income))}
            ${stat("⚠️", "Qarzdorlik", money(debts))}
            ${stat("👨‍🎓", "O'quvchilar", students.length)}
            ${stat("📚", "Kurslar", courses.length)}
        </div>

        <div class="panel">
            <h3>O'quvchilar to'lov holati</h3>
            <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>O'quvchi</th>
                        <th>Guruh</th>
                        <th>Oylik narx</th>
                        <th>To'langan</th>
                        <th>Qarz</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(s => `
                        <tr>
                            <td>${safe(s.name)}</td>
                            <td>${safe(s.group)}</td>
                            <td>${money(getMonthlyPrice(s))}</td>
                            <td>${money(getPaid(s.id))}</td>
                            <td><span class="badge ${getDue(s) > 0 ? "red" : ""}">${money(getDue(s))}</span></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            </div>
            <button class="action-btn" onclick="exportReport()" style="margin-top:18px">CSV hisobot yuklab olish</button>
        </div>
    `;
}

function exportReport() {
    const rows = [
        ["Ism", "Guruh", "Oylik", "Tolangan", "Qarz"],
        ...students.map(s => [
            s.name,
            s.group,
            getMonthlyPrice(s),
            getPaid(s.id),
            getDue(s)
        ])
    ];

    const csv = "\uFEFF" + rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";")
    ).join("\n");

    const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "durbek-education-report.csv";
    a.click();

    URL.revokeObjectURL(url);
    toast("Hisobot yuklandi!");
}

// 19. PROFILE

function profilePage() {
    const user = users.find(u => u.id === currentUser.id);

    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>Mening profilim</h2>
                <p class="muted">Shaxsiy ma'lumotlarni boshqarish</p>
            </div>
        </div>

        <div class="panel">
            <div class="avatar profile-large">${safe(user.name[0].toUpperCase())}</div>

            <form id="profileForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Ism</label>
                        <input name="name" value="${safe(user.name)}" required>
                    </div>
                    <div class="form-group">
                        <label>Login</label>
                        <input value="${safe(user.username)}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input name="phone" value="${safe(user.phone || "")}">
                    </div>
                    <div class="form-group">
                        <label>Yangi parol</label>
                        <input name="password" type="password" placeholder="Yangi parol (ixtiyoriy)">
                    </div>
                </div>

                <button class="action-btn" style="margin-top:20px">Profilni saqlash</button>
            </form>
        </div>
    `;

    $("profileForm").addEventListener("submit", e => {
        e.preventDefault();

        const f = new FormData(e.target);
        const oldName = user.name;
        const newName = f.get("name").trim();

        user.name = newName;
        user.phone = f.get("phone").trim();

        if (f.get("password")) {
            user.password = f.get("password");
        }

        if (user.role === "student") {
            const student = students.find(s => s.name === oldName);
            if (student) student.name = newName;
        }

        if (user.role === "teacher") {
            const teacher = teachers.find(t => t.name === oldName);
            if (teacher) {
                teacher.name = newName;
                groups.forEach(g => {
                    if (g.teacher === oldName) g.teacher = newName;
                });
                courses.forEach(c => {
                    if (c.teacher === oldName) c.teacher = newName;
                });
            }
        }

        currentUser = user;

        $("profileName").textContent = newName;
        $("avatar").textContent = newName[0].toUpperCase();
        $("topAvatar").textContent = newName[0].toUpperCase();

        save();
        toast("Profil yangilandi!");
        render();
    });
}

// 20. NOTIFICATIONS

function notificationsPage() {
    $("content").innerHTML = `
        <div class="section-head">
            <div>
                <h2>Bildirishnomalar</h2>
                <p class="muted">Tizim xabarlari</p>
            </div>
            <button class="secondary-btn" onclick="markAllRead()">Barchasini o'qilgan qilish</button>
        </div>

        <div class="panel">
            ${notifications.map(n => `
                <div class="notice">
                    <p>${safe(n.text)}</p>
                    <small>${safe(n.date)} ${n.read ? "• O'qilgan" : "• Yangi"}</small>
                </div>
            `).join("") || "Bildirishnomalar yo'q"}
        </div>
    `;
}

function markAllRead() {
    notifications.forEach(n => n.read = true);
    save();
    updateNotifications();
    render();
    toast("Barcha xabarlar o'qildi!");
}

$("notificationBtn").addEventListener("click", () => {
    navigate("notifications");
});

// 21. MOBILE MENU

$("menuBtn").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
});

// 22. LOGOUT

$("logoutBtn").addEventListener("click", () => {
    currentUser = null;

    $("app").classList.add("hidden");
    $("loginPage").classList.remove("hidden");
    $("loginForm").reset();
    $("sidebar").classList.remove("open");

    toast("Tizimdan chiqdingiz!");
});

// ============================================
// END OF DURBEK EDUCATION 2.0
// ============================================
