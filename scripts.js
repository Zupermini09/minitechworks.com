// scripts.js

// Set year in all footers
document.addEventListener("DOMContentLoaded", () => {
  const yearEls = document.querySelectorAll("#year");
  const year = new Date().getFullYear();
  yearEls.forEach(el => (el.textContent = year));

  setupPrintForm();
  setupPcBuildForm();
  setupContactForm();
});

// -----------------------------
// 3D PRINT ORDER FORM
// -----------------------------
function setupPrintForm() {
  const form = document.getElementById("print-order-form");
  const messageEl = document.getElementById("print-order-message");
  if (!form || !messageEl) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch("https://api.minitechworks.com/api/print-orders", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        messageEl.textContent = "Your 3D print order was sent successfully!";
        messageEl.style.color = "green";
        form.reset();
      } else {
        messageEl.textContent = "Error sending your 3D print order.";
        messageEl.style.color = "red";
      }
    } catch (err) {
      messageEl.textContent = "Server error. Try again later.";
      messageEl.style.color = "red";
    }
  });
}

// -----------------------------
// PC BUILD FORM
// -----------------------------
function setupPcBuildForm() {
  const form = document.getElementById("pc-build-form");
  const messageEl = document.getElementById("pc-build-message");
  if (!form || !messageEl) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch("https://api.minitechworks.com/api/pc-builds", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        messageEl.textContent = "Your PC build request was submitted!";
        messageEl.style.color = "green";
        form.reset();
      } else {
        messageEl.textContent = "Error sending your PC build request.";
        messageEl.style.color = "red";
      }
    } catch (err) {
      messageEl.textContent = "Server error. Try again later.";
      messageEl.style.color = "red";
    }
  });
}

// -----------------------------
// CONTACT FORM
// -----------------------------
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const messageEl = document.getElementById("contact-message-info");
  if (!form || !messageEl) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch("https://api.minitechworks.com/api/contact", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        messageEl.textContent = "Your message has been sent successfully!";
        messageEl.style.color = "green";
        form.reset();
      } else {
        messageEl.textContent = "Error sending your message.";
        messageEl.style.color = "red";
      }
    } catch (err) {
      messageEl.textContent = "Server error. Try again later.";
      messageEl.style.color = "red";
    }
  });
}
