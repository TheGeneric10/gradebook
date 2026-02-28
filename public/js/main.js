const STORAGE_KEY = 'gradebook.v0.6.0';

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

const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayBody = document.getElementById('overlayBody');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');

const confirmOverlay = document.getElementById('confirmOverlay');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');

const assignmentMenu = document.getElementById('assignmentMenu');

const helpBtn = document.getElementById('helpBtn');
const notifyBtn = document.getElementById('notifyBtn');
const accountBtn = document.getElementById('accountBtn');
const helpDropdown = document.getElementById('helpDropdown');
const notifyDropdown = document.getElementById('notifyDropdown');
const accountDropdown = document.getElementById('accountDropdown');
const signOutBtn = document.getElementById('signOutBtn');

const today = new Date().toISOString().slice(0, 10);
const FLAGS = ['T', 'X', 'I', 'M', 'L', 'Ch', 'Dr'];
let pendingDeleteAction = null;
let assignmentMenuTargetId = null;

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createDefaultState() {
  const clsA = { id: uid('cls'), name: 'Math 6 (Gravy)', room: '101', teacher: 'Ms. Gravy', gradeLevel: '6' };
  const clsB = { id: uid('cls'), name: 'Science 6', room: '204', teacher: 'Mr. Walker', gradeLevel: '6' };

  const categories = [
    { id: uid('cat'), name: 'Projects', weight: 20 },
    { id: uid('cat'), name: 'Homework', weight: 20 },
    { id: uid('cat'), name: 'Classwork', weight: 30 },
    { id: uid('cat'), name: 'Participation', weight: 30 }
  ];

  const students = [
    { id: uid('stu'), firstName: 'Brooke', lastName: 'Barnes', code: 'S1001', classId: clsA.id },
    { id: uid('stu'), firstName: 'Daniel', lastName: 'Dominguez', code: 'S1002', classId: clsA.id },
    { id: uid('stu'), firstName: 'Loziel', lastName: 'Donato', code: 'S1003', classId: clsA.id },
    { id: uid('stu'), firstName: 'Richard', lastName: 'Dugan', code: 'S1004', classId: clsA.id }
  ];

  const assignments = [
    { id: uid('asg'), classId: clsA.id, name: 'SMC', startDate: today, dueDate: today, points: 100, multiplier: 1, description: '', categoryId: categories[0].id, notSetTotal: false },
    { id: uid('asg'), classId: clsA.id, name: 'Investigate', startDate: today, dueDate: today, points: 100, multiplier: 1, description: '', categoryId: categories[1].id, notSetTotal: false },
    { id: uid('asg'), classId: clsA.id, name: 'Collab', startDate: today, dueDate: today, points: 100, multiplier: 1, description: '', categoryId: categories[2].id, notSetTotal: false },
    { id: uid('asg'), classId: clsA.id, name: 'JOR', startDate: today, dueDate: today, points: 100, multiplier: 1, description: '', categoryId: categories[3].id, notSetTotal: false }
  ];

  const grades = {};
  students.forEach((student, si) => {
    assignments.forEach((assignment, ai) => {
      grades[`${student.id}|${assignment.id}`] = { score: 55 + ((si * 12 + ai * 14) % 46), flag: FLAGS[(si + ai) % 3 === 0 ? 0 : 1] };
    });
  });

  const attendance = {};
  students.forEach((student) => {
    attendance[student.id] = { status: 'P', note: '' };
  });

  return {
    classes: [clsA, clsB],
    categories,
    students,
    assignments,
    grades,
    attendance,
    currentClassId: clsA.id,
    selectedStudentId: null,
    term: 'T1',
    semester: 'S1',
    expandedRows: {},
    studentRoundedView: false,
    settings: {
      maxOverallGrade: 100,
      terms: { T1: true, T2: true, T3: true, T4: true },
      semesters: { S1: true, S2: true, S3: false, S4: false }
    }
  };
}

function normalizeGradeEntry(value) {
  if (value && typeof value === 'object') {
    return { score: value.score ?? '', flag: value.flag || '' };
  }
  if (value === '' || value === null || value === undefined) {
    return { score: '', flag: '' };
  }
  return { score: Number(value), flag: '' };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const fallback = createDefaultState();
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const merged = {
      ...fallback,
      ...parsed,
      settings: {
        ...fallback.settings,
        ...(parsed.settings || {}),
        terms: { ...fallback.settings.terms, ...((parsed.settings || {}).terms || {}) },
        semesters: { ...fallback.settings.semesters, ...((parsed.settings || {}).semesters || {}) }
      }
    };
    const fixedGrades = {};
    Object.entries(merged.grades || {}).forEach(([key, value]) => {
      fixedGrades[key] = normalizeGradeEntry(value);
    });
    merged.grades = fixedGrades;
    if (!merged.classes.length) return fallback;
    return merged;
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

function passwordScore(value) {
  if (!value) return 0;
  let score = Math.min(value.length * 8, 40);
  if (/[A-Z]/.test(value)) score += 20;
  if (/[0-9]/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 20;
  return Math.min(score, 100);
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
function categoryName(id) {
  return state.categories.find((item) => item.id === id)?.name || 'Uncategorized';
}
function assignmentById(id) {
  return state.assignments.find((item) => item.id === id);
}

function getScoreClass(score) {
  if (score === '' || score === null || score === undefined || Number.isNaN(Number(score))) return 'blank';
  return Number(score) >= 70 ? 'pass' : 'fail';
}

function effectivePoints(assignment) {
  return assignment.notSetTotal ? 0 : Number(assignment.points || 0);
}

function studentOverall(studentId) {
  const assignments = assignmentsForClass();
  let totalWeight = 0;
  let total = 0;
  assignments.forEach((assignment) => {
    const key = `${studentId}|${assignment.id}`;
    const entry = normalizeGradeEntry(state.grades[key]);
    if (entry.flag === 'X' || entry.flag === 'Dr') return;
    const points = effectivePoints(assignment);
    const score = entry.score === '' ? 0 : Number(entry.score);
    if (points <= 0) return;
    totalWeight += points;
    total += Math.max(0, Math.min(points, score));
  });
  if (totalWeight === 0) return 'N/A';
  return `${((total / totalWeight) * 100).toFixed(1)}%`;
}

function renderClassSelector() {
  classSelector.innerHTML = state.classes.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
  classSelector.value = state.currentClassId;
}

function renderClassMeta() {
  const cls = activeClass();
  const count = studentsForClass().length;
  classMeta.textContent = `${cls.name} · ${count} students · Grade ${cls.gradeLevel} · Room ${cls.room} · ${cls.teacher}`;
}

function selectNavBySection(section) {
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.section === section));
}

function closeAllDropdowns() {
  helpDropdown.classList.add('hidden');
  notifyDropdown.classList.add('hidden');
  accountDropdown.classList.add('hidden');
}

function toggleDropdown(target) {
  const willOpen = target.classList.contains('hidden');
  closeAllDropdowns();
  if (willOpen) target.classList.remove('hidden');
}

function openConfirm(message, onConfirm) {
  confirmMessage.textContent = message;
  pendingDeleteAction = onConfirm;
  confirmOverlay.classList.remove('hidden');
}

function closeConfirm() {
  confirmOverlay.classList.add('hidden');
  pendingDeleteAction = null;
}

function renderSection(sectionName) {
  sectionTitle.textContent = sectionName;
  renderClassMeta();
  if (sectionName === 'Control Center') renderControlCenter();
  if (sectionName === 'Grade Book') renderGradeBook();
  if (sectionName === 'Attendance') renderAttendance();
  if (sectionName === 'Roster') renderRoster();
  if (sectionName === 'Seating Charts') renderSeatingCharts();
  if (sectionName === 'Student Groups') renderGroups();
  if (sectionName === 'Post Grades') renderPostGrades();
  setStatus(`Loaded ${sectionName}.`);
}

function classCardTemplate(cls) {
  const count = studentsForClass(cls.id).length;
  return `
    <article class="class-card">
      <h3>${cls.name}</h3>
      <p><strong>${count}</strong> students</p>
      <p>Grade Level: ${cls.gradeLevel}</p>
      <p>Room ${cls.room} · ${cls.teacher}</p>
      <div class="action-row">
        <button class="toolbar-btn" data-edit-class="${cls.id}">Edit</button>
        <button class="danger-btn" data-delete-class="${cls.id}">Delete</button>
      </div>
      <div class="class-icons-bottom">
        <button class="quick-icon" data-class-switch="${cls.id}" data-open-section="Grade Book" title="Grade Book"><span class="material-icons">assessment</span></button>
        <button class="quick-icon" data-class-switch="${cls.id}" data-open-section="Attendance" title="Attendance"><span class="material-icons">fact_check</span></button>
        <button class="quick-icon" data-class-switch="${cls.id}" data-open-section="Roster" title="Roster"><span class="material-icons">groups</span></button>
      </div>
    </article>
  `;
}

function renderControlCenter() {
  sectionContent.innerHTML = `
    <section class="panel">
      <div class="action-row"><button class="toolbar-btn" id="manageClassesBtn" type="button">Manage Classes</button></div>
      <div class="card-grid">${state.classes.map(classCardTemplate).join('')}</div>
    </section>
  `;

  document.getElementById('manageClassesBtn').addEventListener('click', () => openOverlay('classes'));
  wireClassQuickButtons(sectionContent);
}

function renderFlagsLegend() {
  return `
    <div class="badge-list">
      <span class="flag-badge flag-t">T Turned In</span>
      <span class="flag-badge flag-x">X Exempt</span>
      <span class="flag-badge flag-i">I Incomplete</span>
      <span class="flag-badge flag-m">M Missing</span>
      <span class="flag-badge flag-l">L Late</span>
      <span class="flag-badge flag-ch">Ch Cheated</span>
      <span class="flag-badge flag-dr">Dr Dropped</span>
      <span class="flag-badge">Venture Independent Study</span>
      <span class="flag-badge">Venture Independent Study +4</span>
    </div>
  `;
}

function renderGradeBook() {
  const students = studentsForClass();
  const assignments = assignmentsForClass();

  const headers = assignments
    .map((assignment) => `<th class="assignment-thin" data-assignment-title="${assignment.id}"><div class="th-label">${assignment.name}</div></th>`)
    .join('');

  const rows = students
    .map((student) => {
      const rowId = `${state.currentClassId}|${student.id}`;
      const expanded = !!state.expandedRows[rowId];

      const gradeCells = assignments
        .map((assignment) => {
          const key = `${student.id}|${assignment.id}`;
          const entry = normalizeGradeEntry(state.grades[key]);
          const points = effectivePoints(assignment);
          const label = assignment.notSetTotal ? `${entry.score === '' ? '-' : entry.score}/0` : `${entry.score === '' ? '-' : entry.score}/${points}`;
          return `<td class="score-cell ${getScoreClass(entry.score)}"><input class="score-input" type="number" min="0" max="${state.settings.maxOverallGrade}" value="${entry.score}" data-grade-key="${key}" /><div>${label}${entry.flag ? `<span class="grade-flag-pill">${entry.flag}</span>` : ''}</div></td>`;
        })
        .join('');

      return `
      <tr>
        <td><button class="student-name-btn" data-student-view="${student.id}">${fullName(student)}</button></td>
        <td class="count-col">${studentOverall(student.id)}</td>
        <td class="count-col"><button class="row-arrow" data-row-toggle="${rowId}">${expanded ? '▼' : '▶'} ${state.categories.length}</button></td>
        <td class="count-col">${assignments.length}</td>
        ${gradeCells}
      </tr>
      ${expanded ? `<tr class="collapsed-row"><td colspan="${4 + assignments.length}">Categories: ${state.categories.map((item) => `${item.name} (${item.weight}%)`).join(' · ')}</td></tr>` : ''}
      `;
    })
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="action-row">
        <select id="termSelector"><option>T1</option><option>T2</option><option>T3</option><option>T4</option></select>
        <select id="semesterSelector"><option>S1</option><option>S2</option><option>S3</option><option>S4</option></select>
        <button class="toolbar-btn" id="manageAssignmentsBtn" type="button">Manage Assignments</button>
        <button class="toolbar-btn" id="manageCategoriesBtn" type="button">Manage Categories</button>
      </div>
      ${renderFlagsLegend()}
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student List</th>
              <th class="count-col">Overall Grade</th>
              <th class="count-col"># Categories</th>
              <th class="count-col"># Assignments</th>
              ${headers}
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="${4 + Math.max(1, assignments.length)}">No students in this class.</td></tr>`}
          </tbody>
        </table>
      </div>
      <div id="studentViewPanel"></div>
    </section>
  `;

  document.getElementById('termSelector').value = state.term;
  document.getElementById('semesterSelector').value = state.semester;
  document.getElementById('termSelector').addEventListener('change', (event) => {
    state.term = event.target.value;
    saveState();
  });
  document.getElementById('semesterSelector').addEventListener('change', (event) => {
    state.semester = event.target.value;
    saveState();
  });

  document.getElementById('manageAssignmentsBtn').addEventListener('click', () => openOverlay('assignments'));
  document.getElementById('manageCategoriesBtn').addEventListener('click', () => openOverlay('categories'));

  sectionContent.querySelectorAll('[data-grade-key]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.gradeKey;
      const value = input.value.trim();
      const current = normalizeGradeEntry(state.grades[key]);
      current.score = value === '' ? '' : Math.max(0, Math.min(state.settings.maxOverallGrade, Number(value)));
      state.grades[key] = current;
      saveState();
      renderGradeBook();
    });
  });

  sectionContent.querySelectorAll('[data-row-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const rowId = button.dataset.rowToggle;
      state.expandedRows[rowId] = !state.expandedRows[rowId];
      saveState();
      renderGradeBook();
    });
  });

  sectionContent.querySelectorAll('[data-student-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedStudentId = button.dataset.studentView;
      saveState();
      renderStudentView();
    });
  });

  sectionContent.querySelectorAll('[data-assignment-title]').forEach((head) => {
    head.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      assignmentMenuTargetId = head.dataset.assignmentTitle;
      assignmentMenu.style.left = `${event.clientX}px`;
      assignmentMenu.style.top = `${event.clientY}px`;
      assignmentMenu.classList.remove('hidden');
    });
  });

  renderStudentView();
}

function renderStudentView() {
  const panel = document.getElementById('studentViewPanel');
  if (!panel) return;
  if (!state.selectedStudentId) {
    panel.innerHTML = '';
    return;
  }
  const student = state.students.find((item) => item.id === state.selectedStudentId);
  if (!student) {
    panel.innerHTML = '';
    return;
  }

  const assignments = assignmentsForClass();
  const categorySelect = `<option value="all">All Categories</option>${state.categories.map((item) => `<option value="${item.id}">${item.name}</option>`).join('')}`;
  const rows = assignments
    .map((assignment) => {
      const key = `${student.id}|${assignment.id}`;
      const entry = normalizeGradeEntry(state.grades[key]);
      const total = assignment.notSetTotal ? 0 : assignment.points;
      return `
        <div class="assignment-student-row" data-assignment-row="${assignment.id}" data-category-id="${assignment.categoryId}">
          <div>
            <strong>${assignment.name}</strong>
            <div>${categoryName(assignment.categoryId)} · Due ${assignment.dueDate}</div>
          </div>
          <div>${entry.score === '' ? '-' : entry.score} / ${total}</div>
          <div>
            <select data-flag-edit="${key}">
              <option value="">No Flag</option>
              ${FLAGS.map((flag) => `<option value="${flag}" ${entry.flag === flag ? 'selected' : ''}>${flag}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
    })
    .join('');

  panel.innerHTML = `
    <div class="student-view ${state.studentRoundedView ? 'rounded-student-view' : ''}">
      <div class="action-row">
        <strong>${fullName(student)} · Student View</strong>
        <select id="studentCategoryFilter">${categorySelect}</select>
        <label class="control-row"><input id="roundedViewToggle" type="checkbox" class="sharp-checkbox" ${state.studentRoundedView ? 'checked' : ''}/> Rounded View</label>
      </div>
      <div id="studentAssignmentList">${rows || '<p>No assignments.</p>'}</div>
    </div>
  `;

  document.getElementById('studentCategoryFilter').addEventListener('change', (event) => {
    const selected = event.target.value;
    panel.querySelectorAll('[data-assignment-row]').forEach((row) => {
      row.classList.toggle('hidden', selected !== 'all' && row.dataset.categoryId !== selected);
    });
  });

  document.getElementById('roundedViewToggle').addEventListener('change', (event) => {
    state.studentRoundedView = event.target.checked;
    saveState();
    renderStudentView();
  });

  panel.querySelectorAll('[data-flag-edit]').forEach((select) => {
    select.addEventListener('change', () => {
      const key = select.dataset.flagEdit;
      const entry = normalizeGradeEntry(state.grades[key]);
      entry.flag = select.value;
      state.grades[key] = entry;
      saveState();
      renderGradeBook();
    });
  });
}

function renderAttendance() {
  const rows = studentsForClass()
    .map((student, idx) => {
      const item = state.attendance[student.id] || { status: 'P', note: '' };
      const btn = (status) => `<button class="pat-btn ${item.status === status ? 'active' : ''}" data-pat="${student.id}|${status}">${status}</button>`;
      return `<tr><td>${idx + 1}</td><td>${fullName(student)}</td><td><div class="pat-group">${btn('P')}${btn('A')}${btn('T')}</div></td><td><input data-note="${student.id}" value="${item.note}" /></td></tr>`;
    })
    .join('');

  sectionContent.innerHTML = `
    <section class="panel">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Student</th><th>P/A/T</th><th>Comments</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No students.</td></tr>'}</tbody></table></div>
    </section>
  `;

  sectionContent.querySelectorAll('[data-pat]').forEach((button) => {
    button.addEventListener('click', () => {
      const [studentId, status] = button.dataset.pat.split('|');
      state.attendance[studentId] = { ...(state.attendance[studentId] || {}), status };
      saveState();
      renderAttendance();
    });
  });

  sectionContent.querySelectorAll('[data-note]').forEach((input) => {
    input.addEventListener('change', () => {
      const id = input.dataset.note;
      state.attendance[id] = { ...(state.attendance[id] || { status: 'P' }), note: input.value };
      saveState();
    });
  });
}

function renderRoster() {
  const rows = studentsForClass()
    .map((student, idx) => `<tr><td>${idx + 1}</td><td>${student.firstName}</td><td>${student.lastName}</td><td>${student.code}</td></tr>`)
    .join('');
  sectionContent.innerHTML = `
    <section class="panel">
      <div class="action-row"><button id="manageStudentsBtn" class="toolbar-btn" type="button">Manage Students</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>First</th><th>Last</th><th>Code</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No students.</td></tr>'}</tbody></table></div>
    </section>
  `;
  document.getElementById('manageStudentsBtn').addEventListener('click', () => openOverlay('students'));
}

function renderSeatingCharts() {
  const seats = studentsForClass().slice(0, 12).map((student, i) => `<article class="class-card"><h3>Desk ${i + 1}</h3><p>${fullName(student)}</p></article>`).join('');
  sectionContent.innerHTML = `<section class="panel"><div class="card-grid">${seats || '<p>No students.</p>'}</div></section>`;
}

function renderGroups() {
  const students = studentsForClass();
  const mid = Math.ceil(students.length / 2);
  const a = students.slice(0, mid).map(fullName).join(', ') || 'No students';
  const b = students.slice(mid).map(fullName).join(', ') || 'No students';
  sectionContent.innerHTML = `<section class="panel card-grid"><article class="class-card"><h3>Group A</h3><p>${a}</p></article><article class="class-card"><h3>Group B</h3><p>${b}</p></article></section>`;
}

function renderPostGrades() {
  const count = Object.values(state.grades).filter((item) => normalizeGradeEntry(item).score !== '').length;
  sectionContent.innerHTML = `<section class="panel card-grid"><article class="class-card"><h3>Recorded Scores</h3><p>${count}</p></article><article class="class-card"><h3>Local Save</h3><p>Enabled</p></article></section>`;
}

function wireClassQuickButtons(root) {
  root.querySelectorAll('[data-class-switch]').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentClassId = button.dataset.classSwitch;
      renderClassSelector();
      saveState();
      selectNavBySection(button.dataset.openSection);
      renderSection(button.dataset.openSection);
    });
  });

  root.querySelectorAll('[data-edit-class]').forEach((button) => {
    button.addEventListener('click', () => openOverlay('classes', button.dataset.editClass));
  });

  root.querySelectorAll('[data-delete-class]').forEach((button) => {
    button.addEventListener('click', () => {
      const classId = button.dataset.deleteClass;
      const cls = state.classes.find((item) => item.id === classId);
      openConfirm(`Delete class ${cls?.name || ''}?`, () => {
        state.classes = state.classes.filter((item) => item.id !== classId);
        state.students = state.students.filter((item) => item.classId !== classId);
        state.assignments = state.assignments.filter((item) => item.classId !== classId);
        if (!state.classes.length) state.classes = [createDefaultState().classes[0]];
        if (!state.classes.some((item) => item.id === state.currentClassId)) state.currentClassId = state.classes[0].id;
        saveState();
        renderClassSelector();
        renderSection('Control Center');
      });
    });
  });
}

function openOverlay(kind, editId = null) {
  overlay.classList.remove('hidden');
  if (kind === 'assignments') {
    overlayTitle.textContent = 'Manage Assignments';
    overlayAssignments(editId);
  }
  if (kind === 'categories') {
    overlayTitle.textContent = 'Manage Categories';
    overlayCategories(editId);
  }
  if (kind === 'students') {
    overlayTitle.textContent = 'Manage Students';
    overlayStudents(editId);
  }
  if (kind === 'classes') {
    overlayTitle.textContent = 'Manage Classes';
    overlayClasses(editId);
  }
  if (kind === 'settings') {
    overlayTitle.textContent = 'Grade Settings / Bulk Options';
    overlaySettings();
  }
  if (kind === 'bulk') {
    overlayTitle.textContent = 'Bulk Mass Grade Change';
    overlayBulkMass();
  }
  if (kind === 'comments') {
    overlayTitle.textContent = 'Manage Student Comments';
    overlayBody.innerHTML = '<p>Comment manager placeholder for the selected assignment.</p>';
  }
}

function closeOverlay() {
  overlay.classList.add('hidden');
}

function overlayAssignments(editId = null) {
  const categories = state.categories.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');
  const editItem = editId ? assignmentById(editId) : null;

  const rows = assignmentsForClass().map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${item.name}</td>
      <td>${item.startDate}</td>
      <td>${item.dueDate}</td>
      <td>${item.points}</td>
      <td>${Number(item.multiplier).toFixed(2)}</td>
      <td>${item.notSetTotal ? 'Not Set' : 'Set'}</td>
      <td>
        <button class="toolbar-btn" data-edit-assignment="${item.id}" type="button">Edit</button>
        <button class="danger-btn" data-delete-assignment="${item.id}" type="button">Delete</button>
      </td>
    </tr>
  `).join('');

  overlayBody.innerHTML = `
    <form id="assignmentForm" class="form-grid">
      <input id="assignmentEditId" type="hidden" value="${editItem?.id || ''}" />
      <div><label>Assignment Name</label><input id="assignmentName" value="${editItem?.name || ''}" required /></div>
      <div><label>Category</label><select id="assignmentCategory">${categories}</select></div>
      <div><label>Start Date (today)</label><input id="assignmentStart" type="date" value="${editItem?.startDate || today}" /></div>
      <div><label>Due Date (today)</label><input id="assignmentDue" type="date" value="${editItem?.dueDate || today}" /></div>
      <div><label>Total Points (100)</label><input id="assignmentPoints" type="number" value="${editItem?.points ?? 100}" /></div>
      <div><label>Multiplier</label><input id="assignmentMultiplier" type="number" step="0.01" value="${editItem?.multiplier ?? 1}" /></div>
      <div><label>Not Set total points</label><label class="control-row"><input id="assignmentNotSetTotal" type="checkbox" class="sharp-checkbox" ${editItem?.notSetTotal ? 'checked' : ''}/> enable</label></div>
      <div class="full-span"><label>Description</label><textarea id="assignmentDescription">${editItem?.description || ''}</textarea></div>
      <div><button class="toolbar-btn" type="submit">${editItem ? 'Save Assignment' : 'Add Assignment'}</button></div>
    </form>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Name</th><th>Start</th><th>Due</th><th>Points</th><th>Mult</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows || '<tr><td colspan="8">No assignments.</td></tr>'}</tbody></table></div>
  `;

  const categorySelect = document.getElementById('assignmentCategory');
  if (editItem) categorySelect.value = editItem.categoryId;

  document.getElementById('assignmentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('assignmentEditId').value;
    const payload = {
      classId: state.currentClassId,
      name: document.getElementById('assignmentName').value.trim(),
      categoryId: document.getElementById('assignmentCategory').value,
      startDate: document.getElementById('assignmentStart').value || today,
      dueDate: document.getElementById('assignmentDue').value || today,
      points: Number(document.getElementById('assignmentPoints').value || 100),
      multiplier: Number(document.getElementById('assignmentMultiplier').value || 1),
      notSetTotal: document.getElementById('assignmentNotSetTotal').checked,
      description: document.getElementById('assignmentDescription').value.trim()
    };
    if (!payload.name) return;

    if (id) {
      const index = state.assignments.findIndex((item) => item.id === id);
      if (index >= 0) state.assignments[index] = { ...state.assignments[index], ...payload };
    } else {
      state.assignments.push({ id: uid('asg'), ...payload });
    }
    saveState();
    openOverlay('assignments');
    renderSection('Grade Book');
  });

  overlayBody.querySelectorAll('[data-edit-assignment]').forEach((button) => {
    button.addEventListener('click', () => openOverlay('assignments', button.dataset.editAssignment));
  });

  overlayBody.querySelectorAll('[data-delete-assignment]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.deleteAssignment;
      const assignment = assignmentById(id);
      openConfirm(`Delete assignment ${assignment?.name || ''}?`, () => {
        state.assignments = state.assignments.filter((item) => item.id !== id);
        Object.keys(state.grades).forEach((key) => {
          if (key.endsWith(`|${id}`)) delete state.grades[key];
        });
        saveState();
        openOverlay('assignments');
        renderSection('Grade Book');
      });
    });
  });
}

function overlayCategories(editId = null) {
  const editItem = editId ? state.categories.find((item) => item.id === editId) : null;
  overlayBody.innerHTML = `
    <form id="categoryForm" class="form-grid">
      <input id="categoryEditId" type="hidden" value="${editItem?.id || ''}" />
      <div><label>Category Name</label><input id="categoryName" value="${editItem?.name || ''}" required /></div>
      <div><label>Weight</label><input id="categoryWeight" type="number" min="0" max="100" value="${editItem?.weight ?? ''}" required /></div>
      <div><button class="toolbar-btn" type="submit">${editItem ? 'Save Category' : 'Add Category'}</button></div>
    </form>
    <div id="categoryList" class="drag-list">
      ${state.categories.map((item) => `<div class="drag-item" draggable="true" data-cat-id="${item.id}"><span>${item.name} (${item.weight}%)</span><span><button class="toolbar-btn" data-edit-cat="${item.id}" type="button">Edit</button> <button class="danger-btn" data-del-cat="${item.id}" type="button">Delete</button></span></div>`).join('')}
    </div>
  `;

  document.getElementById('categoryForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('categoryEditId').value;
    const name = document.getElementById('categoryName').value.trim();
    const weight = Number(document.getElementById('categoryWeight').value);
    if (!name) return;
    if (id) {
      const index = state.categories.findIndex((item) => item.id === id);
      if (index >= 0) state.categories[index] = { ...state.categories[index], name, weight };
    } else {
      state.categories.push({ id: uid('cat'), name, weight });
    }
    saveState();
    openOverlay('categories');
    renderSection('Grade Book');
  });

  overlayBody.querySelectorAll('[data-edit-cat]').forEach((button) => {
    button.addEventListener('click', () => openOverlay('categories', button.dataset.editCat));
  });
  overlayBody.querySelectorAll('[data-del-cat]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.delCat;
      const cat = state.categories.find((item) => item.id === id);
      openConfirm(`Delete category ${cat?.name || ''}?`, () => {
        state.categories = state.categories.filter((item) => item.id !== id);
        saveState();
        openOverlay('categories');
        renderSection('Grade Book');
      });
    });
  });

  setupCategoryDragDrop();
}

function overlayStudents(editId = null) {
  const editItem = editId ? state.students.find((item) => item.id === editId) : null;

  overlayBody.innerHTML = `
    <form id="studentForm" class="form-grid">
      <input id="studentEditId" type="hidden" value="${editItem?.id || ''}" />
      <div><label>First Name</label><input id="studentFirst" value="${editItem?.firstName || ''}" /></div>
      <div><label>Last Name</label><input id="studentLast" value="${editItem?.lastName || ''}" /></div>
      <div><label>Student Code</label><input id="studentCode" value="${editItem?.code || ''}" /></div>
      <div><button class="toolbar-btn" type="submit">${editItem ? 'Save Student' : 'Add Student'}</button></div>
      <div class="full-span"><label>Quick Fill (First, Last, Code per line)</label><textarea id="studentQuick"></textarea><button id="studentQuickBtn" type="button" class="toolbar-btn">Quick Fill Add</button></div>
    </form>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>First</th><th>Last</th><th>Code</th><th>Actions</th></tr></thead><tbody>
      ${studentsForClass().map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.firstName}</td><td>${item.lastName}</td><td>${item.code}</td><td><button class="toolbar-btn" data-edit-stu="${item.id}" type="button">Edit</button> <button class="danger-btn" data-del-stu="${item.id}" type="button">Delete</button></td></tr>`).join('') || '<tr><td colspan="5">No students.</td></tr>'}
    </tbody></table></div>
  `;

  document.getElementById('studentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('studentEditId').value;
    const first = document.getElementById('studentFirst').value.trim();
    const last = document.getElementById('studentLast').value.trim();
    const code = document.getElementById('studentCode').value.trim();
    if (!first || !last) return;

    if (id) {
      const index = state.students.findIndex((item) => item.id === id);
      if (index >= 0) state.students[index] = { ...state.students[index], firstName: first, lastName: last, code };
    } else {
      const student = { id: uid('stu'), firstName: first, lastName: last, code, classId: state.currentClassId };
      state.students.push(student);
      state.attendance[student.id] = { status: 'P', note: '' };
    }
    saveState();
    openOverlay('students');
    renderSection('Roster');
  });

  document.getElementById('studentQuickBtn').addEventListener('click', () => {
    const lines = document.getElementById('studentQuick').value.split('\n').map((line) => line.trim()).filter(Boolean);
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

  overlayBody.querySelectorAll('[data-edit-stu]').forEach((button) => {
    button.addEventListener('click', () => openOverlay('students', button.dataset.editStu));
  });

  overlayBody.querySelectorAll('[data-del-stu]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.delStu;
      const student = state.students.find((item) => item.id === id);
      openConfirm(`Delete student ${student ? fullName(student) : ''}?`, () => {
        state.students = state.students.filter((item) => item.id !== id);
        delete state.attendance[id];
        Object.keys(state.grades).forEach((key) => {
          if (key.startsWith(`${id}|`)) delete state.grades[key];
        });
        saveState();
        openOverlay('students');
        renderSection('Roster');
      });
    });
  });
}

function overlayClasses(editId = null) {
  const editItem = editId ? state.classes.find((item) => item.id === editId) : null;
  overlayBody.innerHTML = `
    <form id="classForm" class="form-grid">
      <input id="classEditId" type="hidden" value="${editItem?.id || ''}" />
      <div><label>Class Name</label><input id="className" value="${editItem?.name || ''}" required /></div>
      <div><label>Grade Level</label><input id="classGradeLevel" value="${editItem?.gradeLevel || ''}" required /></div>
      <div><label>Room</label><input id="classRoom" value="${editItem?.room || ''}" /></div>
      <div><label>Teacher</label><input id="classTeacher" value="${editItem?.teacher || ''}" /></div>
      <div><button class="toolbar-btn" type="submit">${editItem ? 'Save Class' : 'Add Class'}</button></div>
    </form>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Class</th><th>Grade</th><th>Room</th><th>Teacher</th><th>Students</th><th>Actions</th></tr></thead><tbody>
      ${state.classes.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.gradeLevel}</td><td>${item.room}</td><td>${item.teacher}</td><td>${studentsForClass(item.id).length}</td><td><button class="toolbar-btn" data-edit-class-row="${item.id}" type="button">Edit</button> <button class="danger-btn" data-del-class-row="${item.id}" type="button">Delete</button></td></tr>`).join('')}
    </tbody></table></div>
  `;

  document.getElementById('classForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('classEditId').value;
    const payload = {
      name: document.getElementById('className').value.trim(),
      gradeLevel: document.getElementById('classGradeLevel').value.trim(),
      room: document.getElementById('classRoom').value.trim() || '-',
      teacher: document.getElementById('classTeacher').value.trim() || '-'
    };
    if (!payload.name || !payload.gradeLevel) return;

    if (id) {
      const index = state.classes.findIndex((item) => item.id === id);
      if (index >= 0) state.classes[index] = { ...state.classes[index], ...payload };
    } else {
      const cls = { id: uid('cls'), ...payload };
      state.classes.push(cls);
      state.currentClassId = cls.id;
    }
    saveState();
    renderClassSelector();
    openOverlay('classes');
    renderSection('Control Center');
  });

  overlayBody.querySelectorAll('[data-edit-class-row]').forEach((button) => {
    button.addEventListener('click', () => openOverlay('classes', button.dataset.editClassRow));
  });

  overlayBody.querySelectorAll('[data-del-class-row]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.delClassRow;
      const cls = state.classes.find((item) => item.id === id);
      openConfirm(`Delete class ${cls?.name || ''}?`, () => {
        state.classes = state.classes.filter((item) => item.id !== id);
        state.students = state.students.filter((item) => item.classId !== id);
        state.assignments = state.assignments.filter((item) => item.classId !== id);
        if (!state.classes.length) state.classes = createDefaultState().classes;
        if (!state.classes.some((item) => item.id === state.currentClassId)) state.currentClassId = state.classes[0].id;
        saveState();
        renderClassSelector();
        openOverlay('classes');
        renderSection('Control Center');
      });
    });
  });
}

function overlayBulkMass() {
  overlayBody.innerHTML = `
    <form id="bulkMassForm" class="form-grid">
      <div><label>Min Grade</label><input id="bulkMin" type="number" value="60" /></div>
      <div><label>Max Grade</label><input id="bulkMax" type="number" value="95" /></div>
      <div><label>Difficulty</label><select id="bulkDifficulty"><option>very easy</option><option>easy</option><option selected>medium</option><option>hard</option><option>very hard</option></select></div>
      <div><label>Set all grades to</label><input id="bulkSetValue" type="text" placeholder="blank or number" /></div>
      <div class="full-span action-row">
        <label><input type="checkbox" id="replaceBlankOnly" class="sharp-checkbox" /> Replace blank grades only</label>
        <label><input type="checkbox" id="replaceExistingOnly" class="sharp-checkbox" /> Replace existing grades only</label>
        <label><input type="checkbox" id="replaceAll" class="sharp-checkbox" checked /> Replace all grades</label>
      </div>
      <div><button class="toolbar-btn" type="submit">Apply Bulk Mass Grade</button></div>
    </form>
  `;

  document.getElementById('bulkMassForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const min = Number(document.getElementById('bulkMin').value || 0);
    const max = Number(document.getElementById('bulkMax').value || 100);
    const difficulty = document.getElementById('bulkDifficulty').value;
    const setValue = document.getElementById('bulkSetValue').value.trim();
    const replaceBlankOnly = document.getElementById('replaceBlankOnly').checked;
    const replaceExistingOnly = document.getElementById('replaceExistingOnly').checked;

    const difficultyMap = { 'very easy': 0.95, easy: 0.88, medium: 0.75, hard: 0.62, 'very hard': 0.5 };
    const bias = difficultyMap[difficulty] || 0.75;

    studentsForClass().forEach((student) => {
      assignmentsForClass().forEach((assignment) => {
        const key = `${student.id}|${assignment.id}`;
        const entry = normalizeGradeEntry(state.grades[key]);
        const isBlank = entry.score === '' || entry.score === null || entry.score === undefined;
        if (replaceBlankOnly && !isBlank) return;
        if (replaceExistingOnly && isBlank) return;

        if (setValue.toLowerCase() === 'blank') {
          entry.score = '';
        } else if (setValue !== '') {
          entry.score = Math.max(0, Math.min(state.settings.maxOverallGrade, Number(setValue)));
        } else {
          const roll = Math.round(min + (max - min) * (0.25 + 0.75 * Math.random()) * bias);
          entry.score = Math.max(0, Math.min(state.settings.maxOverallGrade, roll));
        }
        state.grades[key] = entry;
      });
    });

    saveState();
    closeOverlay();
    renderSection('Grade Book');
  });
}

function overlaySettings() {
  overlayBody.innerHTML = `
    <form id="settingsForm" class="form-grid">
      <div><label>Max Overall Grade</label><input id="maxOverallGrade" type="number" value="${state.settings.maxOverallGrade}" /></div>
      <div class="full-span"><strong>TERMS</strong><div class="action-row">${['T1', 'T2', 'T3', 'T4'].map((term) => `<label><input data-term="${term}" class="sharp-checkbox" type="checkbox" ${state.settings.terms[term] ? 'checked' : ''} /> ${term}</label>`).join('')}</div></div>
      <div class="full-span"><strong>SEMESTER</strong><div class="action-row">${['S1', 'S2', 'S3', 'S4'].map((sem) => `<label><input data-sem="${sem}" class="sharp-checkbox" type="checkbox" ${state.settings.semesters[sem] ? 'checked' : ''} /> ${sem}</label>`).join('')}</div></div>
      <div><button class="toolbar-btn" type="submit">Save Settings</button></div>
    </form>
  `;

  document.getElementById('settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.settings.maxOverallGrade = Number(document.getElementById('maxOverallGrade').value || 100);
    ['T1', 'T2', 'T3', 'T4'].forEach((term) => {
      const input = overlayBody.querySelector(`[data-term="${term}"]`);
      state.settings.terms[term] = input.checked;
    });
    ['S1', 'S2', 'S3', 'S4'].forEach((sem) => {
      const input = overlayBody.querySelector(`[data-sem="${sem}"]`);
      state.settings.semesters[sem] = input.checked;
    });
    saveState();
    closeOverlay();
    renderSection('Grade Book');
  });
}

function setupCategoryDragDrop() {
  const items = overlayBody.querySelectorAll('.drag-item[data-cat-id]');
  let dragged = null;
  items.forEach((item) => {
    item.addEventListener('dragstart', () => {
      dragged = item.dataset.catId;
    });
    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', (event) => {
      event.preventDefault();
      item.classList.remove('drag-over');
      const target = item.dataset.catId;
      if (!dragged || dragged === target) return;
      const from = state.categories.findIndex((cat) => cat.id === dragged);
      const to = state.categories.findIndex((cat) => cat.id === target);
      if (from < 0 || to < 0) return;
      const [moved] = state.categories.splice(from, 1);
      state.categories.splice(to, 0, moved);
      saveState();
      openOverlay('categories');
      renderSection('Grade Book');
    });
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
  if (!username || !password || !confirm || password !== confirm) return;
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
  state.selectedStudentId = null;
  saveState();
  renderSection(sectionTitle.textContent);
});

openSettingsBtn.addEventListener('click', () => openOverlay('settings'));
closeOverlayBtn.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeOverlay();
});

confirmYesBtn.addEventListener('click', () => {
  if (pendingDeleteAction) pendingDeleteAction();
  closeConfirm();
});
confirmNoBtn.addEventListener('click', closeConfirm);
confirmOverlay.addEventListener('click', (event) => {
  if (event.target === confirmOverlay) closeConfirm();
});

toggleSidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
  mainLayout.classList.toggle('sidebar-collapsed', sidebar.classList.contains('hidden'));
  setStatus('Sidebar toggled.');
});

helpBtn.addEventListener('click', (event) => { event.stopPropagation(); toggleDropdown(helpDropdown); });
notifyBtn.addEventListener('click', (event) => { event.stopPropagation(); toggleDropdown(notifyDropdown); });
accountBtn.addEventListener('click', (event) => { event.stopPropagation(); toggleDropdown(accountDropdown); });

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
});

document.querySelectorAll('.dock-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const section = button.dataset.openSection;
    selectNavBySection(section);
    renderSection(section);
  });
});

assignmentMenu.querySelectorAll('button[data-menu-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.menuAction;
    assignmentMenu.classList.add('hidden');
    if (!assignmentMenuTargetId) return;
    if (action === 'edit') openOverlay('assignments', assignmentMenuTargetId);
    if (action === 'delete') {
      const assignment = assignmentById(assignmentMenuTargetId);
      openConfirm(`Delete assignment ${assignment?.name || ''}?`, () => {
        state.assignments = state.assignments.filter((item) => item.id !== assignmentMenuTargetId);
        Object.keys(state.grades).forEach((key) => {
          if (key.endsWith(`|${assignmentMenuTargetId}`)) delete state.grades[key];
        });
        saveState();
        renderSection('Grade Book');
      });
    }
    if (action === 'comments') openOverlay('comments');
    if (action === 'bulk') openOverlay('bulk');
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.dropdown-wrap')) closeAllDropdowns();
  if (!event.target.closest('#assignmentMenu')) assignmentMenu.classList.add('hidden');
});

window.addEventListener('resize', () => {
  assignmentMenu.classList.add('hidden');
});

saveState();
