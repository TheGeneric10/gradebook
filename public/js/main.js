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
const periodRadios = document.querySelectorAll('input[name="period"]');
const showMissing = document.getElementById('showMissing');

const sectionExamples = {
  'Control Center': ['Virtual Program of Choice', 'Upcoming Tasks', 'District Announcements'],
  'Grade Book': ['Class Scores', 'Category Weights', 'Score Copier'],
  Planner: ['Lesson Plans', 'Standards Mapping', 'Materials'],
  'Message Center': ['Parent Messages', 'Unread Alerts', 'Scheduled Sends'],
  Discussions: ['Recent Threads', 'Class Questions', 'Pinned Topics'],
  'Learning Tools': ['Assignments', 'Web Links', 'Integrations'],
  'Progress Monitor': ['At Risk Students', 'Trend Reports', 'Benchmarks'],
  Attendance: ['Period AM Attendance', 'Period PM Attendance', 'Attendance Notes'],
  Roster: ['Current Students', 'Enrollments', 'Contact Details'],
  'Seating Charts': ['Seat Map A', 'Seat Map B', 'Seat Rotation'],
  'Student Groups': ['Reading Group', 'Math Group', 'Project Teams'],
  'Post Grades': ['Final Grades', 'Posting History', 'Grade Validation']
};

function setStatus(message) {
  dashboardStatus.textContent = message;
}

function renderSection(sectionName) {
  sectionTitle.textContent = sectionName;
  sectionContent.innerHTML = '';

  const cards = sectionExamples[sectionName] || [];
  cards.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'info-card';
    card.innerHTML = `<h3>${index + 1}) ${item}</h3><p>Example module for ${sectionName}.</p>`;
    sectionContent.appendChild(card);
  });

  const selectedPeriod = document.querySelector('input[name="period"]:checked').value;
  const missingState = showMissing.checked ? 'On' : 'Off';
  setStatus(`Loaded ${sectionName} · Period ${selectedPeriod} · Missing Only ${missingState}`);
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

periodRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    renderSection(sectionTitle.textContent);
  });
});

showMissing.addEventListener('change', () => {
  renderSection(sectionTitle.textContent);
});

toggleSidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
  setStatus('Sidebar toggled.');
});

helpBtn.addEventListener('click', () => setStatus('Help clicked: Open support resources.'));
notifyBtn.addEventListener('click', () => setStatus('Notifications clicked: 3 new updates.'));
accountBtn.addEventListener('click', () => setStatus('Account clicked: Open user profile menu.'));
