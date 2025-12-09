// scripts.js — shared logic for all pages

const DISCORD_WEBHOOK_B64 =
  "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQzOTI2NTc4MDcwODU0MDQxNi9GNjNGTG5FNTQzcXFiVHk2Q01UbEQybUh5SjF2djFadzFOQXBpTjJlbXFNUTQwLVJYOEJhVndxWTQ2dVBacEFFcDRBbg==";

const DISCORD_WEBHOOK_URL = atob(DISCORD_WEBHOOK_B64);

const PRICE_PER_GRAM = 0.4;

document.addEventListener("DOMContentLoaded", () => {
  setHeaderHeight(); // Ensure it's set after DOM is ready
  setFooterYear();
  initPrintEstimator();
  bindPrintForm();
  bindPcForm();
  bindContactForm();
  initWikiList();
  initWikiArticle();
});

function setHeaderHeight() {
  const header = document.querySelector('.site-header');
  if (header) {
    const height = header.offsetHeight;
    // Only update if different to avoid unnecessary repaints
    const currentHeight = getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim();
    if (currentHeight !== `${height}px`) {
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }
}

// Update header height on resize with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(setHeaderHeight, 100);
});

function setFooterYear() {
  const yearEls = document.querySelectorAll("#year");
  const year = new Date().getFullYear();
  yearEls.forEach(el => (el.textContent = year));
}

/**
 * Generic helper for webhook-backed forms (Discord).
 */
function bindWebhookForm({ formId, statusId, buildContent }) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  if (!form || !status) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const content = buildContent(formData);

    status.textContent = "Sending…";
    status.className = "form-status";
    if (btn) btn.disabled = true;

    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      status.textContent = "Sent! I’ll reply to your email soon.";
      status.classList.add("success");
      form.reset();
      // Reset calculated estimate if relevant
      initPrintEstimator();
    } catch (err) {
      status.textContent =
        "Failed to send. School/work networks sometimes block Discord.";
      status.classList.add("error");
    }

    if (btn) btn.disabled = false;
  });
}

// 3D print cost estimator
function initPrintEstimator() {
  const gramsInput = document.getElementById("gramsInput");
  const estText = document.getElementById("estimateText");
  if (!gramsInput || !estText) return;

  const updateEstimate = () => {
    const grams = Number(gramsInput.value) || 0;
    estText.textContent = `Estimated: ${(grams * PRICE_PER_GRAM).toFixed(2)} NOK`;
  };

  if (!gramsInput.dataset.bound) {
    gramsInput.addEventListener("input", updateEstimate);
    gramsInput.dataset.bound = "true";
  }
  updateEstimate();
}

function bindPrintForm() {
  bindWebhookForm({
    formId: "printForm",
    statusId: "printStatus",
    buildContent: (form) => {
      const grams = Number(form.get("grams") || 0);
      const estimatedPrice = grams > 0
        ? `${(grams * PRICE_PER_GRAM).toFixed(2)} NOK`
        : "N/A";

      return (
        "🧱 **New 3D Print Request – MiniTechWorks**\n\n" +
        `**Name:** ${form.get("name")}\n` +
        `**Email:** ${form.get("email")}\n\n` +
        "**Shipping Address**\n" +
        `- ${form.get("country")}\n` +
        `- ${form.get("street")}\n` +
        `- ${form.get("postcode")} ${form.get("city")}\n\n` +
        `**Model Link:** ${form.get("fileLink")}\n` +
        `**Material:** ${form.get("material")}\n` +
        `**Color:** ${form.get("color") || "N/A"}\n\n` +
        `**Estimated Weight:** ${grams || "N/A"} g\n` +
        `**Estimated Price:** ${estimatedPrice}\n\n` +
        `**Notes:** ${form.get("notes") || "N/A"}`
      );
    }
  });
}

function bindPcForm() {
  bindWebhookForm({
    formId: "pcForm",
    statusId: "pcStatus",
    buildContent: (form) => (
      "🖥️ **New PC Build Request – MiniTechWorks**\n\n" +
      `**Name:** ${form.get("name")}\n` +
      `**Email:** ${form.get("email")}\n\n` +
      "**Shipping Address**\n" +
      `- ${form.get("country")}\n` +
      `- ${form.get("street")}\n` +
      `- ${form.get("postcode")} ${form.get("city")}\n\n` +
      `**Budget:** ${form.get("budget")} NOK\n` +
      `**Colors:** ${form.get("colors") || "N/A"}\n` +
      `**Preferences:** ${form.get("preferences") || "N/A"}\n\n` +
      `**Notes:** ${form.get("notes") || "N/A"}`
    )
  });
}

function bindContactForm() {
  bindWebhookForm({
    formId: "contact-form",
    statusId: "contact-message-info",
    buildContent: (form) => (
      "📨 **New Contact Form Message – MiniTechWorks**\n\n" +
      `**Name:** ${form.get("name")}\n` +
      `**Email:** ${form.get("email")}\n` +
      `**Topic:** ${form.get("topic") || "N/A"}\n\n` +
      `**Message:**\n${form.get("message") || "No message provided."}`
    )
  });
}

// Wiki list page (wiki.html)
function initWikiList() {
  const statusEl = document.getElementById("wiki-status");
  const container = document.getElementById("wiki-container");
  const searchInput = document.getElementById("search-bar");
  const categoryList = document.getElementById("category-list");
  if (!statusEl || !container || !searchInput || !categoryList) return;

  let articles = [];
  let filteredArticles = [];
  let activeCategory = "all";

  fetch("https://cms.minitechworks.com/articles")
    .then(res => res.json())
    .then(json => {
      if (!Array.isArray(json)) {
        statusEl.textContent = "CMS error: returned invalid data.";
        return;
      }

      articles = json;
      filteredArticles = json;
      statusEl.textContent = "";

      renderCategories();
      renderArticles();
    })
    .catch(() => {
      statusEl.textContent = "Failed to load articles. CMS might be offline.";
    });

  function renderArticles() {
    container.innerHTML = "";

    if (filteredArticles.length === 0) {
      container.innerHTML = "<p>No articles found.</p>";
      return;
    }

    filteredArticles.forEach(item => {
      const imgHtml = item.image
        ? `<img src="https://cms.minitechworks.com${item.image.url}" alt="Article Image">`
        : "";

      container.innerHTML += `
        <a class="wiki-link" href="wiki-article.html?slug=${item.slug}">
          <article class="card wiki-card">
            ${imgHtml}
            <h2>${item.title}</h2>
            <p>${item.excerpt || ""}</p>
          </article>
        </a>
      `;
    });
  }

  function renderCategories() {
    categoryList.innerHTML = `<button class="category-btn active" data-cat="all">All</button>`;

    const cats = [...new Set(articles.map(a => a.category).filter(Boolean))];
    cats.forEach(cat => {
      categoryList.innerHTML += `<button class="category-btn" data-cat="${cat.toLowerCase()}">${cat}</button>`;
    });

    categoryList.querySelectorAll(".category-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        categoryList.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.cat;
        filterByCategory();
      });
    });
  }

  function filterByCategory() {
    let result = activeCategory === "all"
      ? [...articles]
      : articles.filter(a => a.category && a.category.toLowerCase() === activeCategory);

    const text = searchInput.value.toLowerCase();
    filteredArticles = result.filter(a =>
      a.title.toLowerCase().includes(text) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(text)) ||
      (a.content && a.content.toLowerCase().includes(text))
    );

    renderArticles();
  }

  searchInput.addEventListener("input", () => {
    filterByCategory();
  });
}

// Wiki article page (wiki-article.html)
function initWikiArticle() {
  const titleEl = document.getElementById("article-title");
  const subtitleEl = document.getElementById("article-subtitle");
  const coverEl = document.getElementById("article-cover");
  const contentEl = document.getElementById("article-content");
  if (!titleEl || !subtitleEl || !coverEl || !contentEl) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    titleEl.textContent = "Article Not Found";
    contentEl.textContent = "No article selected.";
    return;
  }

  fetch(`https://cms.minitechworks.com/articles?slug=${slug}`)
    .then(res => res.json())
    .then(json => {
      if (!Array.isArray(json) || json.length === 0) {
        titleEl.textContent = "Not Found";
        contentEl.textContent = "This article does not exist.";
        return;
      }

      const article = json[0];
      document.title = `${article.title} – MiniTechWorks`;
      titleEl.textContent = article.title;
      subtitleEl.textContent = article.excerpt || "";

      if (article.image) {
        coverEl.src = "https://cms.minitechworks.com" + article.image.url;
        coverEl.style.display = "block";
      }

      let html = article.content || "";

      html = html.replace(/\[warning\]([\s\S]*?)\[\/warning\]/gi,
        '<div class="article-warning">$1</div>'
      );

      html = html.replace(/\[info\]([\s\S]*?)\[\/info\]/gi,
        '<div class="article-info">$1</div>'
      );

      html = html.replace(/\n/g, "<br>");

      html = html.replace(
        /((https?:\/\/)[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      contentEl.innerHTML = html;
    })
    .catch(() => {
      titleEl.textContent = "Error loading article";
      contentEl.textContent = "CMS appears to be offline.";
    });
}
