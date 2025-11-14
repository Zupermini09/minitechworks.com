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

function setupPrintForm() {
  const form = document.getElementById("print-order-form");
  const messageEl = document.getElementById("print-order-message");
  if (!form || !messageEl) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // TODO: replace this with a real API call to your backend
    // Example:
    // const formData = new FormData(form);
    // fetch("https://api.minitechworks.com/print-orders", {
    //   method: "POST",
    //   body: formData,
    // }).then(...)

    messageEl.textContent =
      "Thank you! This would send your 3D print order to the server once the backend is connected.";
  });
}

function setupPcBuildForm() {
  const form = document.getElementById("pc-build-form");
  const messageEl = document.getElementById("pc-build-message");
  if (!form || !messageEl) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // TODO: replace with real API call
    // const data = Object.fromEntries(new FormData(form).entries());
    // fetch("https://api.minitechworks.com/pc-builds", { ... })

    messageEl.textContent =
      "Thanks! This would send your PC build request to the backend once it is connected.";
  });
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const messageEl = document.getElementById("contact-message-info");
  if (!form || !messageEl) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // TODO: real API call later
    messageEl.textContent =
      "Your message would be sent to the server here. For now, you can contact me using the email or links in the future.";
  });
}
