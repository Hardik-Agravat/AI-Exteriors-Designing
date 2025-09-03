document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const identifier = localStorage.getItem("otpEmail") || localStorage.getItem("otpPhone");
    const type = localStorage.getItem("otpEmail") ? "email" : "phone";

    const res = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, newPassword, type }),
    });

    if (res.ok) {
      alert("Password reset successful");
      window.location.href = "login.html";
    } else {
      alert("Failed to reset password");
    }
});