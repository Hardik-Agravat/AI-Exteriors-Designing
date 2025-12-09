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
  const promptInput = document.getElementById("prompt");
  if (promptInput) {
    promptInput.value += (promptInput.value ? ", " : "") + text;
  }
}

// Handle file upload and display
document.addEventListener("DOMContentLoaded", function() {
  const fileInput = document.getElementById("image");

  // Handle file selection
  if (fileInput) {
    fileInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        // Display preview
        const reader = new FileReader();
        reader.onload = function(event) {
          const previewBox = document.querySelector(".preview-box");
          if (previewBox) {
            previewBox.innerHTML = `
              <div class="preview-icon">🖼️</div>
              <h4>Reference Image</h4>
              <img src="${event.target.result}" alt="Reference image" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-top: 10px;" />
              <p style="margin-top: 10px;">Image loaded. Enter your design description and generate.</p>
            `;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

//for generate image
document.addEventListener("DOMContentLoaded", function() {
  const generateBtn = document.getElementById("generate-btn");
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      const promptInput = document.getElementById("prompt");
      const prompt = promptInput ? promptInput.value.trim() : "";
      const fileInput = document.getElementById("image");
      const file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;

      if (!prompt) {
        alert("Please enter a prompt.");
        return;
      }

      // Show loading state
      const imageContainer = document.getElementById("imageResults");
      if (imageContainer) {
        imageContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><p>⏳ Generating image... Please wait.</p></div>';
      }

      try {
        const formData = new FormData();
        formData.append("prompt", prompt);
        if (file) {
          formData.append("referenceImage", file);
        }

        const response = await fetch("http://localhost:5000/api/design/generate-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
          const errorDetails = errorData.details ? `\n\nDetails: ${errorData.details}` : '';
          throw new Error(errorMessage + errorDetails);
        }

        const data = await response.json();

        if (imageContainer) {
          imageContainer.innerHTML = ""; // clear previous result

          if (data.image) {
            const img = document.createElement("img");
            img.src = `data:image/png;base64,${data.image}`;
            img.alt = "Generated design";
            img.style.width = "100%";
            img.style.maxWidth = "600px";
            img.style.height = "auto";
            img.style.borderRadius = "8px";
            img.style.margin = "10px auto";
            img.style.display = "block";
            img.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            imageContainer.appendChild(img);
          } else if (data.error) {
            const errorDetails = data.details ? `<br><small style="font-size: 0.9em; opacity: 0.8;">${data.details}</small>` : '';
            imageContainer.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">❌ ${data.error}${errorDetails}</div>`;
          } else {
            imageContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No image returned.</div>';
          }
        }
      } catch (err) {
        console.error("Error generating image:", err);
        const imageContainer = document.getElementById("imageResults");
        if (imageContainer) {
          imageContainer.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">❌ Something went wrong while generating the image. ${err.message}</div>`;
        } else {
          alert("Something went wrong while generating the image: " + err.message);
        }
      }
    });
  }
});
