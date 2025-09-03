document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otp").value;
    const email = localStorage.getItem("otpEmail");

    const res = await fetch("http://localhost:5000/api/auth/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (res.ok) {
      window.location.href = "reset-password.html";
    } else {
      alert("Invalid or expired OTP");
    }
});