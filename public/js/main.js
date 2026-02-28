const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const signUpCard = document.getElementById('signUpCard');
const showSignUpBtn = document.getElementById('showSignUp');
const backToSignInBtn = document.getElementById('backToSignIn');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
const passwordStrength = document.getElementById('passwordStrength');
const signupPassword = document.getElementById('signup-password');
const sectionTitle = document.getElementById('sectionTitle');
const sectionContent = document.getElementById('sectionContent');
const dashboardStatus = document.getElementById('dashboardStatus');
const navItems = document.querySelectorAll('.nav-item');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

const helpBtn = document.getElementById('helpBtn');
const notifyBtn = document.getElementById('notifyBtn');
const accountBtn = document.getElementById('accountBtn');
const helpDropdown = document.getElementById('helpDropdown');
const notifyDropdown = document.getElementById('notifyDropdown');
const accountDropdown = document.getElementById('accountDropdown');
const signOutBtn = document.getElementById('signOutBtn');

const sectionRenderers = {
  'Control Center': renderControlCenter,
  'Grade Book': renderGradeBook,
  Attendance: renderAttendance,
  Roster: renderRoster,
  'Seating Charts': renderSeatingCharts,
  'Student Groups': renderStudentGroups,
  'Post Grades': renderPostGrades
};

const classes = [
  { name: 'Math 6', period: '1st Period', room: 'Room 101', students: 28 },
  { name: 'Science 6', period: '2nd Period', room: 'Room 204', students: 26 },
  { name: 'ELA 6', period: '3rd Period', room: 'Room 117', students: 29 },
  { name: 'Math Intervention', period: '4th Period', room: 'Room 111', students: 18 }
];

const gradebookRows = [
  ['Addison, Anthony L', '84', 'B'],
  ['Coffenwood, Irene S', '93', 'A'],
  ['Cudish, Ava P', '88', 'B+'],
  ['Gallegos, Robert M', '76', 'C'],
  ['Lawler, Keegan A', '95', 'A'],
  ['Martinez, Sophia L', '91', 'A-']
];

const attendanceRows = [
  ['15', 'Alder, Walter (Walt)', 'P', 'A', 'T', ''],
  ['01', 'Aft, Ervin', 'P', 'A', 'T', 'Doctor note'],
  ['01', 'Anderson, Adalberto', 'P', 'A', 'T', ''],
  ['01', 'Armitage, Dexter', 'P', 'A', 'T', ''],
  ['01', 'Baar, Man', 'P', 'A', 'T', 'Parent call'],
  ['01', 'Barns, Jamison', 'P', 'A', 'T', '']
];

function setStatus(message) {
  dashboardStatus.textContent = message;
}

function renderSection(sectionName) {
  sectionTitle.textContent = sectionName;
  sectionContent.innerHTML = '';

  const renderer = sectionRenderers[sectionName];
  if (!renderer) {
    sectionContent.innerHTML = '<div class="panel">No section configured.</div>';
    return;
  }

  renderer();
  setStatus(`Loaded ${sectionName}`);
}

function passwordScore(value) {
  if (!value) {
    return 0;
  }

  let score = Math.min(value.length * 8, 40);
  if (/[A-Z]/.test(value)) score += 20;
  if (/[0-9]/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 20;
  return Math.min(score, 100);
}

function renderControlCenter() {
  const classCards = classes
    .map(
      (cls) => `
      <article class="class-card">
        <h3>${cls.name}</h3>
        <p><strong>${cls.period}</strong></p>
        <p>${cls.room}</p>
        <p>${cls.students} students</p>
      </article>
    `
    )
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <h3>Classes</h3>
      <div class="class-list">${classCards}</div>
    </section>
  `;
}

function renderGradeBook() {
  const studentRows = gradebookRows
    .map(
      (row) => `
      <div class="student-row"><span>${row[0]}</span><span>▶</span></div>
    `
    )
    .join('');

  const scoreRows = gradebookRows
    .map(
      (row) => `
      <div class="score-row"><span>${row[1]}%</span><span>${row[2]}</span></div>
    `
    )
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="table-toolbar">
        <select class="select-small"><option>Term S1</option></select>
        <select class="select-small"><option>Math 6 (Gravy)</option></select>
        <select class="select-small"><option>Task: Term Final</option></select>
        <button class="toolbar-btn" type="button">Save</button>
      </div>

      <div class="gradebook-layout">
        <div class="gradebook-col">
          <div class="col-head">Setup</div>
          <div class="student-row"><span>Assignments</span><span>›</span></div>
          <div class="student-row"><span>Categories</span><span>›</span></div>
          <div class="student-row"><span>Grading Scales</span><span>›</span></div>
          <div class="student-row"><span>Section Groups</span><span>›</span></div>
          <div class="student-row"><span>Score Copier</span><span>›</span></div>
        </div>

        <div class="gradebook-col">
          <div class="col-head">Students</div>
          ${studentRows}
        </div>

        <div class="gradebook-col">
          <div class="col-head">Posted</div>
          ${scoreRows}
        </div>
      </div>
    </section>
  `;
}

function renderAttendance() {
  const rows = attendanceRows
    .map(
      (row) => `
      <tr>
        <td>${row[0]}</td>
        <td>${row[1]}</td>
        <td class="attendance-p">${row[2]}</td>
        <td class="attendance-mark">${row[3]}</td>
        <td class="attendance-mark">${row[4]}</td>
        <td>${row[5]}</td>
      </tr>
    `
    )
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="table-toolbar">
        <label><input class="sharp-radio" type="radio" name="period" checked /> Period AM</label>
        <label><input class="sharp-radio" type="radio" name="period" /> Period PM</label>
        <button class="toolbar-btn" type="button">Save</button>
      </div>
      <div class="attendance-header">100-1 AM Attendance</div>
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Lunch</th>
            <th>Student</th>
            <th>P</th>
            <th>A</th>
            <th>T</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderRoster() {
  sectionContent.innerHTML = `
    <section class="panel simple-grid">
      <article class="class-card"><h3>Current Students</h3><p>28 Active</p></article>
      <article class="class-card"><h3>New Enrollments</h3><p>2 This Week</p></article>
      <article class="class-card"><h3>Guardian Contacts</h3><p>56 Contacts</p></article>
    </section>
  `;
}

function renderSeatingCharts() {
  sectionContent.innerHTML = `
    <section class="panel">
      <h3>Seating Chart 7.2 Socially</h3>
      <div class="simple-grid">
        <article class="class-card"><h3>Front Left</h3><p>Desk A1 · Ava P.</p></article>
        <article class="class-card"><h3>Front Right</h3><p>Desk A2 · Robert M.</p></article>
        <article class="class-card"><h3>Center</h3><p>Desk B3 · Sophia L.</p></article>
        <article class="class-card"><h3>Back Row</h3><p>Desk D4 · Anthony L.</p></article>
      </div>
    </section>
  `;
}

function renderStudentGroups() {
  sectionContent.innerHTML = `
    <section class="panel simple-grid">
      <article class="class-card"><h3>Reading Group</h3><p>9 Students</p></article>
      <article class="class-card"><h3>Math Group</h3><p>10 Students</p></article>
      <article class="class-card"><h3>Intervention Group</h3><p>6 Students</p></article>
    </section>
  `;
}

function renderPostGrades() {
  sectionContent.innerHTML = `
    <section class="panel simple-grid">
      <article class="class-card"><h3>Term Final</h3><p>Ready to Post</p></article>
      <article class="class-card"><h3>Posting History</h3><p>Last posted: 2 days ago</p></article>
      <article class="class-card"><h3>Validation</h3><p>2 Warnings</p></article>
    </section>
  `;
}

showSignUpBtn.addEventListener('click', () => {
  signInForm.parentElement.classList.add('hidden');
  signUpCard.classList.remove('hidden');
});

backToSignInBtn.addEventListener('click', () => {
  signUpCard.classList.add('hidden');
  signInForm.parentElement.classList.remove('hidden');
});

signupPassword.addEventListener('input', () => {
  passwordStrength.textContent = `Password Strength: ${passwordScore(signupPassword.value)}%`;
});

signUpForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (!username || !password || !confirm) {
    alert('Please complete all Create Account fields.');
    return;
  }

  if (password !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  alert(`Create Account complete for ${username}.`);
  signUpForm.reset();
  passwordStrength.textContent = 'Password Strength: 0%';
  signUpCard.classList.add('hidden');
  signInForm.parentElement.classList.remove('hidden');
});

signInForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('signin-username').value.trim();
  const password = document.getElementById('signin-password').value;

  if (!username || !password) {
    alert('Enter username and password.');
    return;
  }

  authView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  renderSection('Control Center');
});

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((el) => el.classList.remove('active'));
    item.classList.add('active');
    renderSection(item.dataset.section);
  });
});

toggleSidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
  setStatus('Sidebar toggled.');
});

function closeAllDropdowns() {
  helpDropdown.classList.add('hidden');
  notifyDropdown.classList.add('hidden');
  accountDropdown.classList.add('hidden');
}

function toggleDropdown(target) {
  const willOpen = target.classList.contains('hidden');
  closeAllDropdowns();
  if (willOpen) {
    target.classList.remove('hidden');
  }
}

helpBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleDropdown(helpDropdown);
});

notifyBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleDropdown(notifyDropdown);
});

accountBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleDropdown(accountDropdown);
});

document.querySelectorAll('.dropdown-item').forEach((item) => {
  item.addEventListener('click', () => {
    setStatus(`${item.dataset.action} selected.`);
    closeAllDropdowns();
  });
});

signOutBtn.addEventListener('click', () => {
  authView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
  signInForm.reset();
  setStatus('');
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.dropdown-wrap')) {
    closeAllDropdowns();
  }
});
