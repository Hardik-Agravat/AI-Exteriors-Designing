document.getElementById("emailForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  try {
    const res = await fetch("http://localhost:5000/api/auth/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("otpEmail", email);
      window.location.href = "varify-email-otp.html";
    } else {
      // If backend sends 404 for unregistered email
      showAlert(data.message || "Your Email is not registered");
    }
  } catch (error) {
    showAlert("Something went wrong. Please try again.");
  }
});

// ✅ Toast Alert Helper
function showAlert(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "show toast-error"; // red alert
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}
