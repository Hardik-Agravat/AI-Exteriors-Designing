 document.addEventListener("DOMContentLoaded", function () {
      function reveal() {
        var reveals = document.querySelectorAll(".reveal");
        for (var i = 0; i < reveals.length; i++) {
          var windowHeight = window.innerHeight;
          var elementTop = reveals[i].getBoundingClientRect().top;
          var elementVisible = 100;

          if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
          }
        }
      }
      window.addEventListener("scroll", reveal);
      reveal();
    });

//for navbar link
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

//for log out

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logout-btn");
  const logoutModal = document.getElementById("logoutModal");
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

  logoutBtn.addEventListener("click", function () {
    logoutModal.style.display = "flex";
  });

  confirmLogoutBtn.addEventListener("click", function () {
    window.location.href = "login.html"; // Redirect on confirmation
  });

  cancelLogoutBtn.addEventListener("click", function () {
    logoutModal.style.display = "none";
  });
});


//for contact form

const form = document.getElementById("contact-form");
  const toast = document.getElementById("toast");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Basic validation
    if (name === "" || email === "" || message === "") {
      alert("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Success: Show toast
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);

    // Optionally reset the form
    form.reset();
  });

  function validateEmail(email) {
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return re.test(email);
  }

// for generate prompt button

function appendToPrompt(text) {
        const textarea = document.getElementById("design-desc");
        textarea.value += (textarea.value ? ", " : "") + text;
}

//for generate image
document.getElementById("generate-btn").addEventListener("click", async () => {
  const promptInput = document.getElementById("prompt");
  const prompt = promptInput ? promptInput.value.trim() : "";

  if (!prompt) {
    alert("Please enter a prompt.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/design/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    const imageContainer = document.getElementById("result");
    imageContainer.innerHTML = ""; // clear previous result

    if (data.image) {
      const img = document.createElement("img");
      img.src = `data:image/png;base64,${data.image}`;
      img.alt = "Generated design";
      img.style.width = "300px";
      img.style.margin = "10px";
      imageContainer.appendChild(img);
    } else {
      imageContainer.innerText = "No image returned.";
    }
  } catch (err) {
    console.error("Error generating image:", err);
    alert("Something went wrong while generating the image.");
  }
});
