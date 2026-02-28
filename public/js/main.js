const STORAGE_KEY = 'gradebook.v0.5.0';

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
const classMeta = document.getElementById('classMeta');
const dashboardStatus = document.getElementById('dashboardStatus');
const navItems = document.querySelectorAll('.nav-item');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const mainLayout = document.getElementById('mainLayout');
const classSelector = document.getElementById('classSelector');
const openSettingsBtn = document.getElementById('openSettingsBtn');

const helpBtn = document.getElementById('helpBtn');
const notifyBtn = document.getElementById('notifyBtn');
const accountBtn = document.getElementById('accountBtn');
const helpDropdown = document.getElementById('helpDropdown');
const notifyDropdown = document.getElementById('notifyDropdown');
const accountDropdown = document.getElementById('accountDropdown');
const signOutBtn = document.getElementById('signOutBtn');

const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayBody = document.getElementById('overlayBody');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');

const today = new Date().toISOString().slice(0, 10);

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function createDefaultState() {
  const classes = [
    { id: uid('cls'), name: 'Math 6 (Gravy)', room: '101', teacher: 'Ms. Gravy' },
    { id: uid('cls'), name: 'Science 6', room: '204', teacher: 'Mr. Walker' }
  ];

  const categories = [
    { id: uid('cat'), name: 'Assessments', weight: 50 },
    { id: uid('cat'), name: 'Homework', weight: 30 },
    { id: uid('cat'), name: 'Participation', weight: 20 }
  ];

  const students = [
    { id: uid('stu'), firstName: 'Anthony', lastName: 'Addison', code: 'S1001', classId: classes[0].id },
    { id: uid('stu'), firstName: 'Irene', lastName: 'Coffenwood', code: 'S1002', classId: classes[0].id },
    { id: uid('stu'), firstName: 'Ava', lastName: 'Cudish', code: 'S1003', classId: classes[0].id },
    { id: uid('stu'), firstName: 'Robert', lastName: 'Gallegos', code: 'S1004', classId: classes[0].id }
  ];

  const assignments = [
    {
      id: uid('asg'), classId: classes[0].id, categoryId: categories[0].id,
      name: 'Unit Quiz 1', startDate: today, dueDate: today, points: 100, multiplier: 1, description: 'Chapter 1 quiz'
    },
    {
      id: uid('asg'), classId: classes[0].id, categoryId: categories[1].id,
      name: 'Homework Packet', startDate: today, dueDate: today, points: 100, multiplier: 1, description: 'Practice set'
    }
  ];

  const grades = {};
  students.forEach((student, si) => {
    assignments.forEach((assignment, ai) => {
      grades[`${student.id}|${assignment.id}`] = 65 + ((si * 9 + ai * 11) % 35);
    });
  });

  const attendance = {};
  students.forEach((student) => {
    attendance[student.id] = { status: 'P', note: '' };
  });

  return {
    classes,
    categories,
    students,
    assignments,
    grades,
    attendance,
    currentClassId: classes[0].id,
    term: 'T1',
    semester: 'S1',
    settings: {
      maxOverallGrade: 100,
      terms: { T1: true, T2: true, T3: true, T4: true },
      semesters: { S1: true, S2: true, S3: false, S4: false }
    }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    const fallback = createDefaultState();
    return {
      ...fallback,
      ...parsed,
      settings: {
        ...fallback.settings,
        ...(parsed.settings || {}),
        terms: { ...fallback.settings.terms, ...((parsed.settings || {}).terms || {}) },
        semesters: { ...fallback.settings.semesters, ...((parsed.settings || {}).semesters || {}) }
      }
    };
  } catch {
    return createDefaultState();
  }
}

const state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setStatus(message) {
  dashboardStatus.textContent = message;
}

function activeClass() {
  return state.classes.find((item) => item.id === state.currentClassId) || state.classes[0];
}

function studentsForClass(classId = state.currentClassId) {
  return state.students.filter((item) => item.classId === classId);
}

function assignmentsForClass(classId = state.currentClassId) {
  return state.assignments.filter((item) => item.classId === classId);
}

function fullName(student) {
  return `${student.lastName}, ${student.firstName}`;
}

function getScoreClass(value) {
  if (value === '' || value === null || value === undefined || Number.isNaN(Number(value))) return 'blank';
  return Number(value) >= 70 ? 'pass' : 'fail';
}

function renderClassSelector() {
  classSelector.innerHTML = state.classes.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
  classSelector.value = state.currentClassId;
}

function renderClassMeta() {
  const cls = activeClass();
  const count = studentsForClass().length;
  classMeta.textContent = `${cls.name} · ${count} students · Room ${cls.room} · ${cls.teacher}`;
}

function passwordScore(value) {
  if (!value) return 0;
  let score = Math.min(value.length * 8, 40);
  if (/[A-Z]/.test(value)) score += 20;
  if (/[0-9]/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 20;
  return Math.min(score, 100);
}

function renderSection(sectionName) {
  sectionTitle.textContent = sectionName;
  renderClassMeta();

  if (sectionName === 'Control Center') renderControlCenter();
  if (sectionName === 'Grade Book') renderGradeBook();
  if (sectionName === 'Attendance') renderAttendance();
  if (sectionName === 'Roster') renderRoster();
  if (sectionName === 'Seating Charts') renderSeating();
  if (sectionName === 'Student Groups') renderGroups();
  if (sectionName === 'Post Grades') renderPostGrades();

  setStatus(`Loaded ${sectionName}.`);
}

function renderControlCenter() {
  const cards = state.classes
    .map((cls) => {
      const count = studentsForClass(cls.id).length;
      return `
      <article class="class-card">
        <h3>${cls.name}</h3>
        <p>${count} students</p>
        <p>Room ${cls.room} · ${cls.teacher}</p>
        <div class="class-icons">
          <button class="quick-icon" data-class-switch="${cls.id}" data-open-section="Attendance" title="Attendance"><span class="material-icons">fact_check</span></button>
          <button class="quick-icon" data-class-switch="${cls.id}" data-open-section="Grade Book" title="Grade Book"><span class="material-icons">assessment</span></button>
          <button class="quick-icon" data-class-switch="${cls.id}" data-open-section="Roster" title="Roster"><span class="material-icons">groups</span></button>
        </div>
      </article>`;
    })
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="action-row">
        <button class="toolbar-btn" id="manageClassesBtn" type="button">Manage Classes</button>
      </div>
      <div class="card-grid">${cards}</div>
    </section>
  `;

  document.getElementById('manageClassesBtn').addEventListener('click', () => openOverlay('classes'));

  sectionContent.querySelectorAll('[data-class-switch]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentClassId = button.dataset.classSwitch;
      classSelector.value = state.currentClassId;
      saveState();
      selectNavBySection(button.dataset.openSection);
      renderSection(button.dataset.openSection);
    });
  });
}

function renderGradeBook() {
  const assignments = assignmentsForClass();
  const students = studentsForClass();

  const assignmentHeader = assignments.map((item) => `<th>${item.name}</th>`).join('');
  const gradeRows = students
    .map((student) => {
      const cells = assignments
        .map((assignment) => {
          const key = `${student.id}|${assignment.id}`;
          const value = key in state.grades ? state.grades[key] : '';
          return `<td class="score-cell ${getScoreClass(value)}"><input class="score-input" type="number" min="0" max="${state.settings.maxOverallGrade}" value="${value}" data-grade-key="${key}" /></td>`;
        })
        .join('');
      return `<tr><td>${fullName(student)}</td>${cells}</tr>`;
    })
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="action-row">
        <select id="termSelector"><option>T1</option><option>T2</option><option>T3</option><option>T4</option></select>
        <select id="semesterSelector"><option>S1</option><option>S2</option><option>S3</option><option>S4</option></select>
        <button class="toolbar-btn" id="manageAssignmentsBtn" type="button">Manage Assignments</button>
        <button class="toolbar-btn" id="manageCategoriesBtn" type="button">Manage Categories</button>
        <button class="toolbar-btn" id="bulkPassBtn" type="button">Bulk Fill Pass</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Student</th>${assignmentHeader || '<th>No assignments</th>'}</tr></thead>
          <tbody>${gradeRows || '<tr><td colspan="99">No students in this class.</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;

  const termSelector = document.getElementById('termSelector');
  const semesterSelector = document.getElementById('semesterSelector');
  termSelector.value = state.term;
  semesterSelector.value = state.semester;

  termSelector.addEventListener('change', () => {
    state.term = termSelector.value;
    saveState();
  });
  semesterSelector.addEventListener('change', () => {
    state.semester = semesterSelector.value;
    saveState();
  });

  document.getElementById('manageAssignmentsBtn').addEventListener('click', () => openOverlay('assignments'));
  document.getElementById('manageCategoriesBtn').addEventListener('click', () => openOverlay('categories'));
  document.getElementById('bulkPassBtn').addEventListener('click', () => {
    const max = Number(state.settings.maxOverallGrade) || 100;
    students.forEach((student) => {
      assignments.forEach((assignment) => {
        state.grades[`${student.id}|${assignment.id}`] = Math.round(max * 0.85);
      });
    });
    saveState();
    renderSection('Grade Book');
  });

  sectionContent.querySelectorAll('[data-grade-key]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.gradeKey;
      const raw = input.value.trim();
      state.grades[key] = raw === '' ? '' : Math.max(0, Math.min(Number(state.settings.maxOverallGrade), Number(raw)));
      saveState();
      const td = input.closest('.score-cell');
      td.classList.remove('blank', 'fail', 'pass');
      td.classList.add(getScoreClass(state.grades[key]));
    });
  });
}

function renderAttendance() {
  const rows = studentsForClass()
    .map((student, index) => {
      const item = state.attendance[student.id] || { status: 'P', note: '' };
      const mk = (status) => `<button class="pat-btn ${item.status === status ? 'active' : ''}" data-pat="${student.id}|${status}">${status}</button>`;
      return `<tr><td>${index + 1}</td><td>${fullName(student)}</td><td><div class="pat-group">${mk('P')}${mk('A')}${mk('T')}</div></td><td><input data-note="${student.id}" value="${item.note || ''}" /></td></tr>`;
    })
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="action-row"><button class="toolbar-btn" id="saveAttendanceBtn" type="button">Save Attendance</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Student</th><th>P / A / T</th><th>Comments</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No students.</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;

  sectionContent.querySelectorAll('[data-pat]').forEach((button) => {
    button.addEventListener('click', () => {
      const [studentId, status] = button.dataset.pat.split('|');
      state.attendance[studentId] = { ...(state.attendance[studentId] || {}), status };
      saveState();
      renderSection('Attendance');
    });
  });

  sectionContent.querySelectorAll('[data-note]').forEach((input) => {
    input.addEventListener('change', () => {
      const studentId = input.dataset.note;
      state.attendance[studentId] = { ...(state.attendance[studentId] || { status: 'P' }), note: input.value };
      saveState();
    });
  });

  document.getElementById('saveAttendanceBtn').addEventListener('click', () => {
    saveState();
    setStatus('Attendance saved locally.');
  });
}

function renderRoster() {
  const rows = studentsForClass()
    .map((student, index) => `<tr><td>${index + 1}</td><td>${student.firstName}</td><td>${student.lastName}</td><td>${student.code || '-'}</td></tr>`)
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="action-row"><button class="toolbar-btn" id="manageStudentsBtn" type="button">Manage Students</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>First</th><th>Last</th><th>Code</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No students.</td></tr>'}</tbody></table></div>
    </section>
  `;

  document.getElementById('manageStudentsBtn').addEventListener('click', () => openOverlay('students'));
}

function renderSeating() {
  const cards = studentsForClass().slice(0, 12).map((student, i) => `<article class="class-card"><h3>Desk ${i + 1}</h3><p>${fullName(student)}</p></article>`).join('');
  sectionContent.innerHTML = `<section class="panel"><div class="card-grid">${cards || '<p>No students.</p>'}</div></section>`;
}

function renderGroups() {
  const students = studentsForClass();
  const half = Math.ceil(students.length / 2);
  const a = students.slice(0, half).map(fullName).join(', ') || 'No students';
  const b = students.slice(half).map(fullName).join(', ') || 'No students';
  sectionContent.innerHTML = `<section class="panel card-grid"><article class="class-card"><h3>Group A</h3><p>${a}</p></article><article class="class-card"><h3>Group B</h3><p>${b}</p></article></section>`;
}

function renderPostGrades() {
  const count = Object.values(state.grades).filter((v) => v !== '' && v !== null && v !== undefined).length;
  sectionContent.innerHTML = `<section class="panel card-grid"><article class="class-card"><h3>Recorded Scores</h3><p>${count}</p></article><article class="class-card"><h3>Local Save</h3><p>Enabled</p></article></section>`;
}

function overlayAssignments() {
  const categories = state.categories.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
  const rows = assignmentsForClass()
    .map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.startDate}</td><td>${item.dueDate}</td><td>${item.points}</td><td>${Number(item.multiplier).toFixed(2)}</td><td>${item.description || '-'}</td></tr>`)
    .join('');

  overlayBody.innerHTML = `
    <form id="assignmentModalForm" class="form-grid">
      <div><label>Assignment Name</label><input id="assignmentName" required /></div>
      <div><label>Category</label><select id="assignmentCategory">${categories}</select></div>
      <div><label>Start Date (today)</label><input id="assignmentStart" type="date" value="${today}" /></div>
      <div><label>Due Date (today)</label><input id="assignmentDue" type="date" value="${today}" /></div>
      <div><label>Total Points (100)</label><input id="assignmentPoints" type="number" value="100" /></div>
      <div><label>Multiplier (1.00)</label><input id="assignmentMultiplier" type="number" step="0.01" value="1.00" /></div>
      <div class="full-span"><label>Description (optional)</label><textarea id="assignmentDescription"></textarea></div>
      <div><button class="toolbar-btn" type="submit">Add Assignment</button></div>
    </form>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Name</th><th>Start</th><th>Due</th><th>Points</th><th>Multiplier</th><th>Description</th></tr></thead><tbody>${rows || '<tr><td colspan="7">No assignments.</td></tr>'}</tbody></table></div>
  `;

  document.getElementById('assignmentModalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('assignmentName').value.trim();
    if (!name) return;
    state.assignments.push({
      id: uid('asg'),
      classId: state.currentClassId,
      categoryId: document.getElementById('assignmentCategory').value,
      name,
      startDate: document.getElementById('assignmentStart').value || today,
      dueDate: document.getElementById('assignmentDue').value || today,
      points: Number(document.getElementById('assignmentPoints').value || 100),
      multiplier: Number(document.getElementById('assignmentMultiplier').value || 1),
      description: document.getElementById('assignmentDescription').value.trim()
    });
    saveState();
    openOverlay('assignments');
    renderSection('Grade Book');
  });
}

function overlayCategories() {
  const rows = state.categories.map((item) => `<div class="drag-item" draggable="true" data-cat-id="${item.id}"><span>${item.name}</span><strong>${item.weight}%</strong></div>`).join('');
  overlayBody.innerHTML = `
    <form id="categoryModalForm" class="form-grid">
      <div><label>Category Name</label><input id="categoryName" required /></div>
      <div><label>Weight</label><input id="categoryWeight" type="number" min="0" max="100" required /></div>
      <div><button class="toolbar-btn" type="submit">Add Category</button></div>
    </form>
    <div id="categoryDragList" class="drag-list">${rows}</div>
  `;

  document.getElementById('categoryModalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('categoryName').value.trim();
    const weight = Number(document.getElementById('categoryWeight').value);
    if (!name) return;
    state.categories.push({ id: uid('cat'), name, weight: Number.isFinite(weight) ? weight : 0 });
    saveState();
    openOverlay('categories');
    renderSection('Grade Book');
  });

  setupCategoryDragDrop();
}

function overlayStudents() {
  const rows = studentsForClass().map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.firstName}</td><td>${item.lastName}</td><td>${item.code || '-'}</td></tr>`).join('');
  overlayBody.innerHTML = `
    <form id="studentModalForm" class="form-grid">
      <div><label>First Name</label><input id="studentFirst" /></div>
      <div><label>Last Name</label><input id="studentLast" /></div>
      <div><label>Student Code</label><input id="studentCode" /></div>
      <div><button class="toolbar-btn" type="submit">Add Student</button></div>
      <div class="full-span"><label>Quick Fill Students (First, Last, Code each line)</label><textarea id="studentQuickFill"></textarea><button class="toolbar-btn" id="studentQuickBtn" type="button">Quick Fill Add</button></div>
    </form>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>First</th><th>Last</th><th>Code</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No students.</td></tr>'}</tbody></table></div>
  `;

  document.getElementById('studentModalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const first = document.getElementById('studentFirst').value.trim();
    const last = document.getElementById('studentLast').value.trim();
    if (!first || !last) return;
    const student = { id: uid('stu'), firstName: first, lastName: last, code: document.getElementById('studentCode').value.trim(), classId: state.currentClassId };
    state.students.push(student);
    state.attendance[student.id] = { status: 'P', note: '' };
    saveState();
    openOverlay('students');
    renderSection('Roster');
  });

  document.getElementById('studentQuickBtn').addEventListener('click', () => {
    const lines = document.getElementById('studentQuickFill').value.split('\n').map((line) => line.trim()).filter(Boolean);
    lines.forEach((line) => {
      const [first = '', last = '', code = ''] = line.split(',').map((item) => item.trim());
      if (!first || !last) return;
      const student = { id: uid('stu'), firstName: first, lastName: last, code, classId: state.currentClassId };
      state.students.push(student);
      state.attendance[student.id] = { status: 'P', note: '' };
    });
    saveState();
    openOverlay('students');
    renderSection('Roster');
  });
}

function overlayClasses() {
  const rows = state.classes.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.room}</td><td>${item.teacher}</td><td>${studentsForClass(item.id).length}</td></tr>`).join('');
  overlayBody.innerHTML = `
    <form id="classModalForm" class="form-grid">
      <div><label>Class Name</label><input id="className" required /></div>
      <div><label>Room</label><input id="classRoom" /></div>
      <div><label>Teacher</label><input id="classTeacher" /></div>
      <div><button class="toolbar-btn" type="submit">Add Class</button></div>
    </form>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Class</th><th>Room</th><th>Teacher</th><th>Students</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No classes.</td></tr>'}</tbody></table></div>
  `;

  document.getElementById('classModalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('className').value.trim();
    if (!name) return;
    const cls = { id: uid('cls'), name, room: document.getElementById('classRoom').value.trim() || '-', teacher: document.getElementById('classTeacher').value.trim() || '-' };
    state.classes.push(cls);
    state.currentClassId = cls.id;
    saveState();
    renderClassSelector();
    openOverlay('classes');
    renderSection('Control Center');
  });
}

function overlaySettings() {
  const terms = ['T1', 'T2', 'T3', 'T4'];
  const sems = ['S1', 'S2', 'S3', 'S4'];
  overlayBody.innerHTML = `
    <form id="settingsForm" class="form-grid">
      <div><label>Max Overall Grade</label><input id="maxOverallGrade" type="number" value="${state.settings.maxOverallGrade}" /></div>
      <div class="full-span"><strong>TERMS</strong><div class="action-row">${terms.map((term) => `<label><input type="checkbox" data-term="${term}" ${state.settings.terms[term] ? 'checked' : ''}/> ${term}</label>`).join('')}</div></div>
      <div class="full-span"><strong>SEMESTER</strong><div class="action-row">${sems.map((sem) => `<label><input type="checkbox" data-semester="${sem}" ${state.settings.semesters[sem] ? 'checked' : ''}/> ${sem}</label>`).join('')}</div></div>
      <div><button class="toolbar-btn" type="submit">Save Settings</button></div>
    </form>
  `;

  document.getElementById('settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const max = Number(document.getElementById('maxOverallGrade').value || 100);
    state.settings.maxOverallGrade = max;
    ['T1', 'T2', 'T3', 'T4'].forEach((term) => {
      const input = overlayBody.querySelector(`[data-term="${term}"]`);
      state.settings.terms[term] = input.checked;
    });
    ['S1', 'S2', 'S3', 'S4'].forEach((sem) => {
      const input = overlayBody.querySelector(`[data-semester="${sem}"]`);
      state.settings.semesters[sem] = input.checked;
    });
    saveState();
    closeOverlay();
    renderSection('Grade Book');
  });
}

function openOverlay(kind) {
  overlay.classList.remove('hidden');
  if (kind === 'assignments') {
    overlayTitle.textContent = 'Manage Assignments';
    overlayAssignments();
  }
  if (kind === 'categories') {
    overlayTitle.textContent = 'Manage Categories';
    overlayCategories();
  }
  if (kind === 'students') {
    overlayTitle.textContent = 'Manage Students';
    overlayStudents();
  }
  if (kind === 'classes') {
    overlayTitle.textContent = 'Manage Classes';
    overlayClasses();
  }
  if (kind === 'settings') {
    overlayTitle.textContent = 'Grade Settings / Bulk Options';
    overlaySettings();
  }
}

function closeOverlay() {
  overlay.classList.add('hidden');
}

function setupCategoryDragDrop() {
  const items = overlayBody.querySelectorAll('.drag-item[data-cat-id]');
  let draggedId = null;
  items.forEach((item) => {
    item.addEventListener('dragstart', () => { draggedId = item.dataset.catId; });
    item.addEventListener('dragover', (event) => { event.preventDefault(); item.classList.add('drag-over'); });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', (event) => {
      event.preventDefault();
      item.classList.remove('drag-over');
      const targetId = item.dataset.catId;
      if (!draggedId || draggedId === targetId) return;
      const from = state.categories.findIndex((cat) => cat.id === draggedId);
      const to = state.categories.findIndex((cat) => cat.id === targetId);
      if (from < 0 || to < 0) return;
      const [moved] = state.categories.splice(from, 1);
      state.categories.splice(to, 0, moved);
      saveState();
      openOverlay('categories');
      renderSection('Grade Book');
    });
  });
}

function closeAllDropdowns() {
  helpDropdown.classList.add('hidden');
  notifyDropdown.classList.add('hidden');
  accountDropdown.classList.add('hidden');
}

function toggleDropdown(target) {
  const shouldOpen = target.classList.contains('hidden');
  closeAllDropdowns();
  if (shouldOpen) target.classList.remove('hidden');
}

function selectNavBySection(section) {
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.section === section);
  });
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
  if (!username || !password || !confirm) return;
  if (password !== confirm) return;
  signUpForm.reset();
  passwordStrength.textContent = 'Password Strength: 0%';
  signUpCard.classList.add('hidden');
  signInForm.parentElement.classList.remove('hidden');
});

signInForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('signin-username').value.trim();
  const password = document.getElementById('signin-password').value;
  if (!username || !password) return;
  authView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  renderClassSelector();
  selectNavBySection('Control Center');
  renderSection('Control Center');
});

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    selectNavBySection(item.dataset.section);
    renderSection(item.dataset.section);
  });
});

classSelector.addEventListener('change', () => {
  state.currentClassId = classSelector.value;
  saveState();
  renderSection(sectionTitle.textContent);
});

openSettingsBtn.addEventListener('click', () => openOverlay('settings'));

toggleSidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
  mainLayout.classList.toggle('sidebar-collapsed', sidebar.classList.contains('hidden'));
  setStatus('Sidebar toggled.');
});

helpBtn.addEventListener('click', (event) => { event.stopPropagation(); toggleDropdown(helpDropdown); });
notifyBtn.addEventListener('click', (event) => { event.stopPropagation(); toggleDropdown(notifyDropdown); });
accountBtn.addEventListener('click', (event) => { event.stopPropagation(); toggleDropdown(accountDropdown); });

Array.from(document.querySelectorAll('.dropdown-item')).forEach((item) => {
  item.addEventListener('click', () => {
    setStatus(`${item.dataset.action} selected.`);
    closeAllDropdowns();
  });
});

signOutBtn.addEventListener('click', () => {
  authView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
  signInForm.reset();
});

Array.from(document.querySelectorAll('.dock-btn')).forEach((button) => {
  button.addEventListener('click', () => {
    const section = button.dataset.openSection;
    selectNavBySection(section);
    renderSection(section);
  });
});

closeOverlayBtn.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeOverlay();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.dropdown-wrap')) closeAllDropdowns();
});

saveState();
