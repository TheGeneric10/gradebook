const signInView = document.getElementById('signInView');
const signUpView = document.getElementById('signUpView');
const announcementsPanel = document.getElementById('announcementsPanel');
const statusMessage = document.getElementById('statusMessage');

const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
const toSignUp = document.getElementById('toSignUp');
const backToSignIn = document.getElementById('backToSignIn');
const passwordStrength = document.getElementById('passwordStrength');
const signUpPassword = document.getElementById('signup-password');

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}

function showSignUp() {
  signInView.classList.add('hidden');
  announcementsPanel.classList.add('hidden');
  signUpView.classList.remove('hidden');
  showStatus('');
}

function showSignIn() {
  signUpView.classList.add('hidden');
  signInView.classList.remove('hidden');
  announcementsPanel.classList.remove('hidden');
  showStatus('');
}

function calculateStrength(password) {
  if (!password) {
    return 0;
  }

  let score = Math.min(password.length * 8, 40);

  if (/[A-Z]/.test(password)) {
    score += 20;
  }

  if (/[0-9]/.test(password)) {
    score += 20;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 20;
  }

  return Math.min(score, 100);
}

toSignUp.addEventListener('click', showSignUp);
backToSignIn.addEventListener('click', showSignIn);

signInForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('signin-username').value.trim();
  const password = document.getElementById('signin-password').value;

  if (!username || !password) {
    showStatus('Please enter username and password to continue.', true);
    return;
  }

  showStatus(`Simulated sign-in successful. Welcome, ${username}!`);
  signInForm.reset();
});

signUpPassword.addEventListener('input', () => {
  const strength = calculateStrength(signUpPassword.value);
  passwordStrength.textContent = `Password Strength: ${strength}%`;
});

signUpForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (!username || !password || !confirmPassword) {
    showStatus('Please fill out all Create Account fields.', true);
    return;
  }

  if (password !== confirmPassword) {
    showStatus('Passwords do not match. Please re-enter them.', true);
    return;
  }

  showStatus(`Create Account complete for ${username}. You can now sign in.`);
  signUpForm.reset();
  passwordStrength.textContent = 'Password Strength: 0%';
});
