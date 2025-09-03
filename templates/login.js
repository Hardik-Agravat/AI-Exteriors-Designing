function toggleForm(mode) {
  const signIn = document.getElementById("signin-form");
  const signUp = document.getElementById("signup-form");

  if (mode === "signup") {
    signIn.style.display = "none";
    signUp.style.display = "block";
  } else {
    signIn.style.display = "block";
    signUp.style.display = "none";
  }
}

document.getElementById('signin-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value.trim();

  if (!email || !password) {
    showAlert('Please fill in all fields.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert('Invalid email format.');
    return;
  }

  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast('Sign in successful');
      setTimeout(() => window.location.href = 'index.html', 2000);
    } else {
      showAlert(data.error || 'Login failed');
    }
  } catch (err) {
    showAlert('Login error');
  }
});

function showAlert(msg) {
  showToast(msg, 'error');
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;

  // Reset all type classes
  toast.classList.remove('toast-success', 'toast-error');

  // Add class based on type
  if (type === 'success') {
    toast.classList.add('toast-success');
  } else {
    toast.classList.add('toast-error');
  }

  // Show and auto-hide
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ✅ TEST TOAST ON PAGE LOAD
window.addEventListener('load', () => {
  // Uncomment this line to test:
  //showToast("✅ Toast working!");
});


