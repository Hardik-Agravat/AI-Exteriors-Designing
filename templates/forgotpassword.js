document.getElementById("forgotForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = sessionStorage.getItem("resetEmail");
  const oldPass = document.getElementById("oldPassword").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();
  const confirmPass = document.getElementById("confirmPassword").value.trim();

  if (!oldPass || !newPass || !confirmPass) {
    showAlert("Please fill in all fields");
    return;
  }

  if (!email) {
    showAlert("Email not found in session. Please login again.");
    return;
  }

  if (newPass !== confirmPass) {
    showAlert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword: oldPass, newPassword: newPass })
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Password changed successfully");
      setTimeout(() => {
        sessionStorage.removeItem("resetEmail"); // clear session email
        window.location.href = "login.html";
      }, 2000);
    } else {
      showAlert(data.message || "Failed to change password");
    }
  } catch (err) {
    console.error(err);
    showAlert("Server error");
  }
});

function showAlert(message) {
  const alert = document.getElementById("alertBox");
  alert.textContent = message;
  alert.style.display = "block";

  setTimeout(() => {
    alert.style.display = "none";
  }, 2000);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
