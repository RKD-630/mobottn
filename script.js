/* ============================================================
   State Management
============================================================ */
const MAX_NAV_BUTTONS = 7;
let zoomLevel = 1.0;

// Default sample website HTML
const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Desktop Store & Services</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
  .site-header { background: #1e293b; color: #fff; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-size: 20px; font-weight: 800; color: #38bdf8; }
  .hero { background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; padding: 36px 20px; text-align: center; }
  .hero h1 { font-size: 24px; margin-bottom: 8px; font-weight: 800; }
  .hero p { font-size: 14px; opacity: 0.9; max-width: 500px; margin: 0 auto 16px; }
  .hero .cta { display: inline-block; background: #fff; color: #0284c7; padding: 10px 20px; border-radius: 99px; font-weight: 700; text-decoration: none; }
  .container { padding: 20px; max-width: 800px; margin: 0 auto; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 16px; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
  .card h3 { font-size: 16px; margin-bottom: 6px; color: #0f172a; }
  .card p { font-size: 13px; color: #64748b; margin-bottom: 10px; }
  .card a { display: inline-block; font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none; }
  .features-section { margin-top: 24px; }
  .features-section h2 { font-size: 18px; margin-bottom: 12px; }
  .banner { background: #f1f5f9; border-radius: 12px; padding: 16px; margin-top: 16px; font-size: 13px; color: #475569; }
</style>
</head>
<body>
  <div class="site-header">
    <div class="logo">✦ Acme Portal</div>
    <div style="font-size:12px; color:#cbd5e1">Converted to Mobile</div>
  </div>
  <div class="hero">
    <h1>Welcome to Your Mobile Store</h1>
    <p>This desktop website has been transformed with touch responsiveness and a bottom navigation bar.</p>
    <a href="#products" class="cta">Browse Products ↓</a>
  </div>
  <div class="container">
    <div class="features-section">
      <h2>Popular Categories</h2>
      <div class="grid">
        <div class="card">
          <h3>📦 Fast Delivery</h3>
          <p>Global courier services to your doorstep.</p>
          <a href="#delivery">Learn More →</a>
        </div>
        <div class="card">
          <h3>⚡ Instant Support</h3>
          <p>Reach out to our specialists 24/7 anytime.</p>
          <a href="#support">Chat Now →</a>
        </div>
        <div class="card">
          <h3>🔒 Safe Payments</h3>
          <p>Protected transactions with modern encryption.</p>
          <a href="#security">View Details →</a>
        </div>
      </div>
    </div>
    <div class="banner" id="products">
      <strong>✨ Bottom Navigation Active:</strong> Use the bottom bar buttons to jump between sections or open links.
    </div>
  </div>
</body>
</html>`;

// Application config state
let state = {
  projectName: "My Mobile Web App",
  sourceType: "sample", // 'sample', 'file', 'url', 'code'
  rawHtml: DEFAULT_SAMPLE_HTML,
  siteUrl: "",
  logoData: "",
  activeButtonIndex: 0,
  buttons: [
    {
      id: "btn-1",
      label: "Home",
      icon: "🏠",
      type: "link",
      url: "#",
      target: "_self",
      sublinks: []
    },
    {
      id: "btn-2",
      label: "Search",
      icon: "🔍",
      type: "link",
      url: "#products",
      target: "_self",
      sublinks: []
    },
    {
      id: "btn-3",
      label: "Explore",
      icon: "☰",
      type: "submenu",
      url: "",
      target: "_self",
      sublinks: [
        { name: "Best Sellers", url: "#products", icon: "🔥", target: "_self" },
        { name: "Customer Support", url: "#support", icon: "💬", target: "_self" },
        { name: "My Account", url: "#account", icon: "👤", target: "_self" }
      ]
    },
    {
      id: "btn-4",
      label: "Contact",
      icon: "✉️",
      type: "link",
      url: "#support",
      target: "_self",
      sublinks: []
    }
  ],
  design: {
    preset: "modern",
    height: 68,
    activeColor: "#3b82f6",
    inactiveColor: "#64748b",
    bgColor: "#ffffff",
    iconSize: 20,
    fontSize: 10,
    radius: 0
  },
  layout: {
    devicePreset: "iphone",
    layoutMode: "responsive",
    phoneWidth: 390,
    phoneHeight: 780,
    optResponsiveImages: true,
    optPreventOverflow: true,
    optTouchOptimized: true,
    optAddSafePadding: true
  },
  header: {
    show: true,
    title: "My Mobile Web App",
    height: 56,
    bg: "#ffffff"
  }
};

const $ = id => document.getElementById(id);

function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

/* ============================================================
   Initialization & Event Listeners
============================================================ */
function init() {
  loadFromLocalStorage();
  bindUIEvents();
  renderAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function bindUIEvents() {
  // Project Name live update
  $("projectName").addEventListener("input", () => {
    state.projectName = $("projectName").value.trim() || "My Mobile Web App";
    if (!state.header.title) {
      $("phoneTitleText").textContent = state.projectName;
    }
    autoSave();
  });

  // Source tabs
  document.querySelectorAll(".source-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".source-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const src = tab.dataset.source;
      $("sourceFileArea").classList.toggle("hidden", src !== "file");
      $("sourceUrlArea").classList.toggle("hidden", src !== "url");
      $("sourceCodeArea").classList.toggle("hidden", src !== "code");
    });
  });

  // Source actions
  $("uploadFileBtn").onclick = () => $("htmlFileInput").click();
  $("htmlFileInput").addEventListener("change", handleFileUpload);
  $("useSampleBtn").onclick = () => {
    state.sourceType = "sample";
    state.rawHtml = DEFAULT_SAMPLE_HTML;
    $("sourceStatus").textContent = "Active: Loaded sample website.";
    $("sourceStatus").className = "notice success";
    renderPreview();
    autoSave();
  };

  $("siteUrlInput").addEventListener("input", () => {
    state.siteUrl = $("siteUrlInput").value.trim();
    autoSave();
  });

  $("loadUrlBtn").onclick = () => {
    const url = $("siteUrlInput").value.trim();
    if (!url) { alert("Please enter a valid website URL."); return; }
    state.sourceType = "url";
    state.siteUrl = url;
    $("sourceStatus").textContent = `Active: Loading URL ${url}`;
    $("sourceStatus").className = "notice";
    renderPreview();
    autoSave();
  };

  $("rawHtmlCode").addEventListener("input", () => {
    state.rawHtml = $("rawHtmlCode").value;
    autoSave();
  });

  $("applyCodeBtn").onclick = () => {
    const code = $("rawHtmlCode").value.trim();
    if (!code) { alert("Please paste HTML code."); return; }
    state.sourceType = "code";
    state.rawHtml = code;
    $("sourceStatus").textContent = `Active: Using custom pasted HTML (${code.length} bytes).`;
    $("sourceStatus").className = "notice success";
    renderPreview();
    autoSave();
  };

  // Nav Button Modal Handlers
  $("addNewNavBtn").onclick = () => openNavModal(-1);
  $("modalCloseBtn").onclick = closeNavModal;
  $("modalCancelBtn").onclick = closeNavModal;
  $("modalSaveBtn").onclick = saveNavModalButton;

  // Icon pills click
  document.querySelectorAll(".icon-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      $("modalBtnIcon").value = pill.dataset.icon;
    });
  });

  // Action type switcher in modal
  $("modalBtnType").addEventListener("change", () => {
    const isSubmenu = $("modalBtnType").value === "submenu";
    $("modalDirectLinkSection").classList.toggle("hidden", isSubmenu);
    $("modalSubmenuSection").classList.toggle("hidden", !isSubmenu);
    if (isSubmenu && !$("subLinksContainer").children.length) {
      addSubLinkRow("Page 1", "#page1", "📄", "_self");
    }
  });

  $("addSubLinkRowBtn").onclick = () => addSubLinkRow();

  // Design inputs live updates
  const designInputIds = [
    "navPreset", "navHeight", "navActiveColor", "navInactiveColor",
    "navBgColor", "navIconSize", "navFontSize", "navRadius"
  ];
  designInputIds.forEach(id => {
    $(id).addEventListener("input", () => {
      syncDesignFromInputs();
      renderBottomNavDesign();
      autoSave();
    });
  });

  // Layout inputs
  $("devicePreset").addEventListener("change", () => {
    const p = $("devicePreset").value;
    const presets = {
      iphone: [390, 844],
      android: [412, 892],
      compact: [360, 740],
      tablet: [768, 1024]
    };
    state.layout.devicePreset = p;
    if (presets[p]) {
      $("phoneWidth").value = presets[p][0];
      $("phoneHeight").value = presets[p][1];
      state.layout.phoneWidth = presets[p][0];
      state.layout.phoneHeight = presets[p][1];
      updatePhoneDimensions();
    }
    autoSave();
  });

  ["phoneWidth", "phoneHeight"].forEach(id => {
    $(id).addEventListener("input", () => {
      state.layout[id] = $(id).value;
      updatePhoneDimensions();
      autoSave();
    });
  });

  $("layoutMode").addEventListener("change", () => {
    state.layout.layoutMode = $("layoutMode").value;
    renderPreview();
    autoSave();
  });

  ["optResponsiveImages", "optPreventOverflow", "optTouchOptimized", "optAddSafePadding"].forEach(id => {
    $(id).addEventListener("change", () => {
      state.layout[id] = $(id).checked;
      renderPreview();
      autoSave();
    });
  });

  // Header inputs
  $("optShowHeader").addEventListener("change", () => {
    state.header.show = $("optShowHeader").checked;
    renderHeader();
    autoSave();
  });
  $("headerTitle").addEventListener("input", () => {
    state.header.title = $("headerTitle").value;
    $("phoneTitleText").textContent = state.header.title || state.projectName;
    autoSave();
  });
  $("headerHeight").addEventListener("input", () => {
    state.header.height = +$("headerHeight").value || 56;
    renderHeader();
    autoSave();
  });
  $("headerBg").addEventListener("input", () => {
    state.header.bg = $("headerBg").value;
    renderHeader();
    autoSave();
  });

  $("headerLogoInput").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      state.logoData = r.result;
      renderHeader();
      autoSave();
    };
    r.readAsDataURL(f);
  });

  // Zoom buttons
  $("zoomInBtn").onclick = () => {
    zoomLevel = Math.min(1.4, +(zoomLevel + 0.1).toFixed(1));
    applyZoom();
  };
  $("zoomOutBtn").onclick = () => {
    zoomLevel = Math.max(0.6, +(zoomLevel - 0.1).toFixed(1));
    applyZoom();
  };

  // Preview in new tab
  $("previewInNewTabBtn").onclick = () => {
    const html = generateCompleteMobileHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Sheet close button
  $("sheetCloseBtn").onclick = () => {
    $("phoneSubmenuSheet").classList.remove("show");
  };

  // Close sheet when tapping outside
  document.addEventListener("click", e => {
    const sheet = $("phoneSubmenuSheet");
    if (
      sheet.classList.contains("show") &&
      !sheet.contains(e.target) &&
      !e.target.closest(".phone-nav-btn")
    ) {
      sheet.classList.remove("show");
    }
  });

  // Generate & Download
  $("generateBtn").onclick = () => {
    const html = generateCompleteMobileHTML();
    downloadFile(`${slugify(state.projectName || "mobile-website")}.html`, html, "text/html;charset=utf-8");
  };

  // Topbar project actions
  $("newProjectBtn").onclick = () => {
    if (!confirm("Start new project and reset settings?")) return;
    localStorage.removeItem("web2AppConverterState");
    location.reload();
  };
  $("saveProjectBtn").onclick = () => {
    autoSave();
    alert("Project saved successfully in your browser!");
  };
  $("loadProjectBtn").onclick = () => {
    loadFromLocalStorage();
    renderAll();
    alert("Project loaded from browser storage.");
  };

  // Config export / import
  $("exportConfigBtn").onclick = () => {
    const json = JSON.stringify(state, null, 2);
    downloadFile(`${slugify(state.projectName || "project")}-config.json`, json, "application/json");
  };
  $("importConfigBtn").onclick = () => $("configFileInput").click();
  $("configFileInput").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const loaded = JSON.parse(r.result);
        if (loaded && loaded.buttons) {
          state = loaded;
          populateInputsFromState();
          renderAll();
          autoSave();
          alert("Configuration imported successfully!");
        }
      } catch (err) {
        alert("Invalid JSON configuration file: " + err.message);
      }
    };
    r.readAsText(f);
  });
  $("resetBtn").onclick = () => {
    if (confirm("Reset all settings to default?")) {
      localStorage.removeItem("web2AppConverterState");
      location.reload();
    }
  };
}

function applyZoom() {
  $("phoneContainer").style.transform = `scale(${zoomLevel})`;
  $("zoomLabel").textContent = `${Math.round(zoomLevel * 100)}%`;
}

function updatePhoneDimensions() {
  const w = Math.min(800, Math.max(280, +state.layout.phoneWidth || 390));
  const h = Math.min(1200, Math.max(500, +state.layout.phoneHeight || 780));
  $("phoneMockup").style.width = w + "px";
  $("phoneMockup").style.height = h + "px";
}

/* ============================================================
   File Upload Handling
============================================================ */
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    const content = evt.target.result;
    state.sourceType = "file";
    state.rawHtml = content;
    $("rawHtmlCode").value = content;
    $("sourceBadge").textContent = `HTML File (${formatBytes(file.size)})`;
    $("sourceStatus").textContent = `Loaded file "${file.name}" (${formatBytes(file.size)}). Converted and previewing live below.`;
    $("sourceStatus").className = "notice success";
    renderPreview();
    autoSave();
  };
  reader.readAsText(file);
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function slugify(text) {
  const s = (text || "mobile-website").toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
  return s || "mobile-website";
}

/* ============================================================
   Navigation Buttons Manager
============================================================ */
function renderNavButtonsList() {
  const container = $("navButtonsList");
  container.innerHTML = "";
  $("buttonCountBadge").textContent = `${state.buttons.length}/${MAX_NAV_BUTTONS} Buttons`;

  if (!state.buttons.length) {
    container.innerHTML = `<div class="hint" style="text-align:center; padding:16px; border:1px dashed var(--border); border-radius:10px">
      No navigation bottom bar buttons added yet. Click the button below to add your first button with a link or submenu!
    </div>`;
    renderBottomNavBar();
    return;
  }

  state.buttons.forEach((btn, idx) => {
    const card = document.createElement("div");
    card.className = "nav-item-card";

    const isDirectLink = btn.type === "link";
    const actionBadge = isDirectLink
      ? `<span class="nav-item-action-badge link">Direct Link (${escapeHtml(btn.target || "_self")})</span>`
      : `<span class="nav-item-action-badge submenu">Submenu (${(btn.sublinks || []).length} links)</span>`;

    const linkDetail = isDirectLink
      ? `URL: ${escapeHtml(btn.url || "#")}`
      : `Links: ${(btn.sublinks || []).map(s => s.name).join(", ") || "None"}`;

    card.innerHTML = `
      <div class="nav-item-main">
        <div class="nav-item-icon">${escapeHtml(btn.icon || "🔘")}</div>
        <div class="nav-item-meta">
          <div class="nav-item-title">
            <span>${escapeHtml(btn.label)}</span>
            ${actionBadge}
          </div>
          <div class="nav-item-link-display">${linkDetail}</div>
        </div>
      </div>
      <div class="nav-item-controls">
        <button type="button" class="btn small" data-action="up" data-idx="${idx}" title="Move Up" ${idx === 0 ? "disabled" : ""}>↑</button>
        <button type="button" class="btn small" data-action="down" data-idx="${idx}" title="Move Down" ${idx === state.buttons.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" class="btn small" data-action="edit" data-idx="${idx}">✏️ Edit</button>
        <button type="button" class="btn small danger" data-action="delete" data-idx="${idx}">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Bind controls
  container.querySelectorAll("button[data-action]").forEach(b => {
    b.addEventListener("click", e => {
      const idx = +b.dataset.idx;
      const action = b.dataset.action;
      if (action === "edit") openNavModal(idx);
      else if (action === "delete") {
        if (confirm(`Delete button "${state.buttons[idx].label}"?`)) {
          state.buttons.splice(idx, 1);
          renderNavButtonsList();
          renderBottomNavBar();
          autoSave();
        }
      } else if (action === "up" && idx > 0) {
        [state.buttons[idx - 1], state.buttons[idx]] = [state.buttons[idx], state.buttons[idx - 1]];
        renderNavButtonsList();
        renderBottomNavBar();
        autoSave();
      } else if (action === "down" && idx < state.buttons.length - 1) {
        [state.buttons[idx + 1], state.buttons[idx]] = [state.buttons[idx], state.buttons[idx + 1]];
        renderNavButtonsList();
        renderBottomNavBar();
        autoSave();
      }
    });
  });

  renderBottomNavBar();
}

/* ============================================================
   Bottom Navigation Bar in Phone Mockup
============================================================ */
function renderBottomNavBar() {
  const bar = $("phoneBottomNav");
  bar.innerHTML = "";

  state.buttons.forEach((btn, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `phone-nav-btn ${idx === state.activeButtonIndex ? "active" : ""}`;
    b.dataset.idx = idx;
    b.innerHTML = `
      <span class="nav-ico">${escapeHtml(btn.icon || "🔘")}</span>
      <span>${escapeHtml(btn.label)}</span>
    `;

    b.addEventListener("click", () => {
      state.activeButtonIndex = idx;
      bar.querySelectorAll(".phone-nav-btn").forEach(btnEl => btnEl.classList.remove("active"));
      b.classList.add("active");

      // Handle Action
      if (btn.type === "link") {
        $("phoneSubmenuSheet").classList.remove("show");
        const url = btn.url || "#";
        if (btn.target === "_blank") {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          const iframe = $("previewIframe");
          try {
            if (url === "#") {
              iframe.contentWindow?.scrollTo({ top: 0, behavior: "smooth" });
            } else if (url.startsWith("#")) {
              const targetEl = iframe.contentDocument?.querySelector(url);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
              } else if (iframe.contentWindow) {
                iframe.contentWindow.location.hash = url;
              }
            } else if (url) {
              iframe.src = url;
            }
          } catch (e) {
            try {
              iframe.src = url;
            } catch (err) {
              window.open(url, "_blank", "noopener,noreferrer");
            }
          }
        }
      } else if (btn.type === "submenu") {
        openPhoneSubmenuSheet(btn);
      }
    });

    bar.appendChild(b);
  });

  renderBottomNavDesign();
}

function openPhoneSubmenuSheet(btn) {
  const sheet = $("phoneSubmenuSheet");
  $("sheetTitle").textContent = btn.label;
  const list = $("sheetLinksList");
  list.innerHTML = "";

  if (!btn.sublinks || !btn.sublinks.length) {
    list.innerHTML = `<div class="hint" style="padding:10px; text-align:center">No sub-links configured for this button.</div>`;
  } else {
    btn.sublinks.forEach(sub => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "sheet-link-btn";
      item.innerHTML = `<span class="ico">${escapeHtml(sub.icon || "🔗")}</span><span>${escapeHtml(sub.name)}</span>`;
      item.addEventListener("click", () => {
        sheet.classList.remove("show");
        const targetUrl = sub.url || "#";
        if (sub.target === "_blank") {
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        } else {
          const iframe = $("previewIframe");
          try {
            if (targetUrl === "#") {
              iframe.contentWindow?.scrollTo({ top: 0, behavior: "smooth" });
            } else if (targetUrl.startsWith("#")) {
              const targetEl = iframe.contentDocument?.querySelector(targetUrl);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
              } else if (iframe.contentWindow) {
                iframe.contentWindow.location.hash = targetUrl;
              }
            } else if (targetUrl) {
              iframe.src = targetUrl;
            }
          } catch (e) {
            window.open(targetUrl, "_blank", "noopener,noreferrer");
          }
        }
      });
      list.appendChild(item);
    });
  }

  sheet.classList.add("show");
}

function renderBottomNavDesign() {
  const d = state.design;
  const bar = $("phoneBottomNav");
  bar.style.height = `${d.height}px`;
  bar.style.background = d.bgColor;

  // Preset styles
  if (d.preset === "floating") {
    bar.style.left = "14px";
    bar.style.right = "14px";
    bar.style.bottom = "14px";
    bar.style.borderRadius = `${d.radius || 24}px`;
    bar.style.boxShadow = "0 12px 30px rgba(0,0,0,0.18)";
    bar.style.border = "1px solid rgba(226,232,240,0.8)";
    bar.style.backdropFilter = "none";
  } else if (d.preset === "glass") {
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.bottom = "0";
    bar.style.background = "rgba(255, 255, 255, 0.85)";
    bar.style.backdropFilter = "blur(16px)";
    bar.style.borderTop = "1px solid rgba(226,232,240,0.8)";
    bar.style.borderRadius = `${d.radius || 0}px ${d.radius || 0}px 0 0`;
    bar.style.boxShadow = "0 -2px 10px rgba(0,0,0,0.04)";
  } else if (d.preset === "material") {
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.bottom = "0";
    bar.style.boxShadow = "0 -4px 16px rgba(0,0,0,0.08)";
    bar.style.borderTop = "none";
    bar.style.borderRadius = `${d.radius || 0}px ${d.radius || 0}px 0 0`;
    bar.style.backdropFilter = "none";
  } else {
    // Modern / Minimal
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.bottom = "0";
    bar.style.boxShadow = "none";
    bar.style.borderTop = "1px solid #e2e8f0";
    bar.style.borderRadius = `${d.radius || 0}px ${d.radius || 0}px 0 0`;
    bar.style.backdropFilter = "none";
  }

  // Buttons styling
  bar.querySelectorAll(".phone-nav-btn").forEach(btn => {
    btn.style.fontSize = `${d.fontSize}px`;
    const ico = btn.querySelector(".nav-ico");
    if (ico) ico.style.fontSize = `${d.iconSize}px`;

    if (btn.classList.contains("active")) {
      btn.style.color = d.activeColor;
    } else {
      btn.style.color = d.inactiveColor;
    }
  });
}

function syncDesignFromInputs() {
  state.design = {
    preset: $("navPreset").value,
    height: +$("navHeight").value || 68,
    activeColor: $("navActiveColor").value,
    inactiveColor: $("navInactiveColor").value,
    bgColor: $("navBgColor").value,
    iconSize: +$("navIconSize").value || 20,
    fontSize: +$("navFontSize").value || 10,
    radius: +$("navRadius").value || 0
  };
}

/* ============================================================
   Navigation Modal (Add / Edit)
============================================================ */
function openNavModal(editIndex = -1) {
  $("editButtonIndex").value = editIndex;
  const isEditing = editIndex >= 0;

  $("modalTitle").textContent = isEditing ? "Edit Bottom Bar Button" : "Add Bottom Bar Button";

  if (isEditing) {
    const btn = state.buttons[editIndex];
    $("modalBtnLabel").value = btn.label;
    $("modalBtnIcon").value = btn.icon;
    $("modalBtnType").value = btn.type;
    $("modalBtnUrl").value = btn.url || "";
    $("modalBtnTarget").value = btn.target || "_self";
    renderModalSublinks(btn.sublinks || []);
  } else {
    if (state.buttons.length >= MAX_NAV_BUTTONS) {
      alert(`Maximum of ${MAX_NAV_BUTTONS} buttons reached for the bottom navigation bar.`);
      return;
    }
    $("modalBtnLabel").value = "New Button";
    $("modalBtnIcon").value = "🔗";
    $("modalBtnType").value = "link";
    $("modalBtnUrl").value = "#";
    $("modalBtnTarget").value = "_self";
    renderModalSublinks([
      { name: "Page 1", url: "#page1", icon: "📄", target: "_self" },
      { name: "Page 2", url: "#page2", icon: "📄", target: "_self" }
    ]);
  }

  const isSubmenu = $("modalBtnType").value === "submenu";
  $("modalDirectLinkSection").classList.toggle("hidden", isSubmenu);
  $("modalSubmenuSection").classList.toggle("hidden", !isSubmenu);

  $("navButtonModal").classList.add("show");
}

function closeNavModal() {
  $("navButtonModal").classList.remove("show");
}

function renderModalSublinks(sublinks) {
  const container = $("subLinksContainer");
  container.innerHTML = "";
  sublinks.forEach(sub => {
    addSubLinkRow(sub.name, sub.url, sub.icon, sub.target);
  });
}

function addSubLinkRow(name = "Link Name", url = "#", icon = "🔗", target = "_self") {
  const container = $("subLinksContainer");
  const row = document.createElement("div");
  row.className = "row sublink-row";
  row.style.background = "var(--surface-card)";
  row.style.padding = "8px";
  row.style.borderRadius = "8px";
  row.style.border = "1px solid var(--border)";
  row.innerHTML = `
    <input type="text" class="sublink-icon" value="${escapeHtml(icon)}" style="width:48px; text-align:center" placeholder="Icon">
    <input type="text" class="sublink-name" value="${escapeHtml(name)}" style="flex:1" placeholder="Title">
    <input type="text" class="sublink-url" value="${escapeHtml(url)}" style="flex:1" placeholder="URL (# or https://)">
    <button type="button" class="btn small danger remove-sublink-btn">✕</button>
  `;
  row.querySelector(".remove-sublink-btn").onclick = () => row.remove();
  container.appendChild(row);
}

function saveNavModalButton() {
  const editIndex = +$("editButtonIndex").value;
  const label = $("modalBtnLabel").value.trim() || "Button";
  const icon = $("modalBtnIcon").value.trim() || "🔘";
  const type = $("modalBtnType").value;
  const url = $("modalBtnUrl").value.trim();
  const target = $("modalBtnTarget").value;

  const sublinks = [];
  if (type === "submenu") {
    $("subLinksContainer").querySelectorAll(".sublink-row").forEach(row => {
      const sIcon = row.querySelector(".sublink-icon").value.trim() || "🔗";
      const sName = row.querySelector(".sublink-name").value.trim() || "Link";
      const sUrl = row.querySelector(".sublink-url").value.trim() || "#";
      sublinks.push({ name: sName, url: sUrl, icon: sIcon, target: "_self" });
    });
    if (!sublinks.length) {
      sublinks.push({ name: "Page 1", url: "#", icon: "📄", target: "_self" });
    }
  }

  const btnData = {
    id: editIndex >= 0 ? state.buttons[editIndex].id : `btn-${Date.now()}`,
    label,
    icon,
    type,
    url,
    target,
    sublinks
  };

  if (editIndex >= 0) {
    state.buttons[editIndex] = btnData;
  } else {
    state.buttons.push(btnData);
  }

  closeNavModal();
  renderNavButtonsList();
  renderBottomNavBar();
  autoSave();
}

/* ============================================================
   Header Renderer
============================================================ */
function renderHeader() {
  const h = state.header;
  const headerEl = $("phoneHeader");
  headerEl.style.display = h.show ? "flex" : "none";
  headerEl.style.height = `${h.height}px`;
  headerEl.style.background = h.bg;
  $("phoneTitleText").textContent = h.title || state.projectName || "Mobile App";

  if (state.logoData) {
    $("phoneLogoImg").src = state.logoData;
    $("phoneLogoImg").classList.remove("hidden");
  } else {
    $("phoneLogoImg").classList.add("hidden");
  }
}

/* ============================================================
   Phone Live Preview Renderer
============================================================ */
function renderPreview() {
  const iframe = $("previewIframe");

  if (state.sourceType === "url" && state.siteUrl) {
    iframe.src = state.siteUrl;
  } else {
    const adaptedHtml = prepareInjectedHTMLForPreview(state.rawHtml || DEFAULT_SAMPLE_HTML);
    iframe.srcdoc = adaptedHtml;
  }
}

function prepareInjectedHTMLForPreview(sourceHtml) {
  let doc = sourceHtml;

  // Viewport injection
  if (!doc.includes('viewport')) {
    if (doc.includes('<head>')) {
      doc = doc.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">');
    } else if (doc.includes('<html>')) {
      doc = doc.replace('<html>', '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"></head>');
    } else {
      doc = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">' + doc;
    }
  }

  const layoutRules = state.layout.layoutMode === 'fit'
    ? 'html, body { width: 100% !important; overflow-x: hidden !important; }'
    : (state.layout.layoutMode === 'contained' ? 'body { max-width: 600px !important; margin: 0 auto !important; }' : '');

  const responsiveStyles = `
  <style id="__web2app_mobile_styles">
    ${state.layout.optResponsiveImages ? 'img, video, iframe, canvas, svg { max-width: 100% !important; height: auto !important; }' : ''}
    ${state.layout.optPreventOverflow ? 'html, body { overflow-x: hidden !important; max-width: 100vw !important; }' : ''}
    ${state.layout.optTouchOptimized ? 'button, a, input, select { min-height: 38px; touch-action: manipulation; }' : ''}
    ${layoutRules}
    ${state.layout.optAddSafePadding ? `body { padding-bottom: ${state.design.height + 20}px !important; }` : ''}
  </style>`;

  if (doc.includes('</head>')) {
    doc = doc.replace('</head>', `${responsiveStyles}</head>`);
  } else {
    doc = responsiveStyles + doc;
  }

  return doc;
}

/* ============================================================
   HTML Code Generator for Export/Download
============================================================ */
function generateCompleteMobileHTML() {
  const title = escapeHtml(state.projectName || "Converted Mobile App");
  const buttonsJson = JSON.stringify(state.buttons).replace(/</g, '\\u003c');
  const d = state.design;
  const h = state.header;

  let headInner = "";
  let bodyAttrs = "";
  let bodyInner = "";

  if (state.sourceType === "url" && state.siteUrl) {
    bodyInner = `<iframe src="${escapeHtml(state.siteUrl)}" style="width:100%; height:calc(100vh - ${d.height + (h.show ? h.height : 0)}px); border:none; display:block;"></iframe>`;
  } else {
    const raw = state.rawHtml || DEFAULT_SAMPLE_HTML;
    const bodyMatch = raw.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
    const headMatch = raw.match(/<head[^>]*>([\s\S]*)<\/head>/i);
    headInner = headMatch ? headMatch[1] : "";
    bodyAttrs = bodyMatch ? bodyMatch[1] : "";
    bodyInner = bodyMatch ? bodyMatch[2] : raw;
  }

  const buttonsHtml = state.buttons.map((btn, i) => `
    <button type="button" class="web2app-nav-btn ${i === 0 ? 'active' : ''}" data-idx="${i}">
      <span class="ico">${escapeHtml(btn.icon || '🔘')}</span>
      <span>${escapeHtml(btn.label)}</span>
    </button>
  `).join('');

  // Nav styling by preset
  let navCustomStyle = "";
  if (d.preset === "floating") {
    navCustomStyle = `left: 12px; right: 12px; bottom: 12px; border-radius: ${d.radius || 20}px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid rgba(226,232,240,0.8);`;
  } else if (d.preset === "glass") {
    navCustomStyle = `left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(226,232,240,0.8); border-radius: ${d.radius || 0}px ${d.radius || 0}px 0 0;`;
  } else if (d.preset === "material") {
    navCustomStyle = `left: 0; right: 0; bottom: 0; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); border-top: none; border-radius: ${d.radius || 0}px ${d.radius || 0}px 0 0;`;
  } else {
    navCustomStyle = `left: 0; right: 0; bottom: 0; border-top: 1px solid #e2e8f0; border-radius: ${d.radius || 0}px ${d.radius || 0}px 0 0;`;
  }

  const layoutRules = state.layout.layoutMode === 'fit'
    ? 'html, body { width: 100% !important; overflow-x: hidden !important; }'
    : (state.layout.layoutMode === 'contained' ? 'body { max-width: 600px !important; margin: 0 auto !important; }' : '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${title}</title>
${headInner}
<style>
  /* Web2App Mobile Layout Overrides */
  ${state.layout.optResponsiveImages ? 'img, video, iframe, canvas, svg { max-width: 100% !important; height: auto !important; }' : ''}
  ${state.layout.optPreventOverflow ? 'html, body { overflow-x: hidden !important; max-width: 100vw !important; }' : ''}
  ${state.layout.optTouchOptimized ? 'button, a, input, select { min-height: 38px; touch-action: manipulation; }' : ''}
  ${layoutRules}
  body {
    padding-bottom: ${d.height + 24}px !important;
    margin: 0;
  }

  /* Mobile App Header */
  .web2app-header {
    height: ${h.height}px;
    background: ${h.bg};
    display: ${h.show ? "flex" : "none"};
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 999;
    font-weight: 800;
    font-size: 15px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .web2app-header-logo {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    margin-right: 10px;
    object-fit: cover;
  }

  /* Mobile Bottom Navigation Bar */
  .web2app-bottom-bar {
    position: fixed;
    ${navCustomStyle}
    height: ${d.height}px;
    background: ${d.bgColor};
    display: flex;
    align-items: center;
    z-index: 1000;
    font-family: system-ui, -apple-system, sans-serif;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .web2app-nav-btn {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    color: ${d.inactiveColor};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: ${d.fontSize}px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .web2app-nav-btn.active {
    color: ${d.activeColor} !important;
    font-weight: 700;
  }
  .web2app-nav-btn .ico {
    font-size: ${d.iconSize}px;
    line-height: 1;
  }

  /* Submenu Popup Sheet */
  .web2app-sheet {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: ${d.height + 16}px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 14px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
    z-index: 1001;
    display: none;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .web2app-sheet.show { display: block; }
  .web2app-sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 13px;
    font-weight: 700;
  }
  .web2app-sheet-close {
    border: none;
    background: #f1f5f9;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 11px;
    cursor: pointer;
  }
  .web2app-sublink {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f8fafc;
    color: #1e293b;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    margin: 4px 0;
    box-sizing: border-box;
  }
  .web2app-sublink:hover { background: #e2e8f0; }
</style>
</head>
<body ${bodyAttrs}>

  <!-- Converted Mobile Header -->
  <header class="web2app-header">
    ${state.logoData ? `<img src="${state.logoData}" class="web2app-header-logo" alt="Logo">` : ''}
    <div>${escapeHtml(h.title || state.projectName || "Mobile Web App")}</div>
  </header>

  <!-- Original Webpage Content -->
  ${bodyInner}

  <!-- Mobile Submenu Popup Sheet -->
  <div class="web2app-sheet" id="web2appSheet">
    <div class="web2app-sheet-head">
      <span id="web2appSheetTitle">Menu</span>
      <button type="button" class="web2app-sheet-close" id="web2appSheetClose">✕</button>
    </div>
    <div id="web2appSheetLinks"></div>
  </div>

  <!-- Mobile Navigation Bottom Bar -->
  <nav class="web2app-bottom-bar" id="web2appBottomBar">
    ${buttonsHtml}
  </nav>

  <script>
    const navButtons = ${buttonsJson};
    const sheet = document.getElementById("web2appSheet");
    const sheetTitle = document.getElementById("web2appSheetTitle");
    const sheetLinks = document.getElementById("web2appSheetLinks");
    const closeBtn = document.getElementById("web2appSheetClose");

    closeBtn.onclick = () => sheet.classList.remove("show");

    // Close sheet when tapping outside
    window.addEventListener("click", e => {
      if (
        sheet.classList.contains("show") &&
        !sheet.contains(e.target) &&
        !e.target.closest(".web2app-nav-btn")
      ) {
        sheet.classList.remove("show");
      }
    });

    // Sublink clicks
    sheetLinks.addEventListener("click", e => {
      const link = e.target.closest(".web2app-sublink");
      if (link) {
        sheet.classList.remove("show");
        const href = link.getAttribute("href");
        if (href === "#") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (href && href.startsWith("#")) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    });

    document.querySelectorAll(".web2app-nav-btn").forEach(btnEl => {
      btnEl.onclick = () => {
        document.querySelectorAll(".web2app-nav-btn").forEach(b => b.classList.remove("active"));
        btnEl.classList.add("active");
        const idx = +btnEl.dataset.idx;
        const btn = navButtons[idx];
        if (!btn) return;

        if (btn.type === "link") {
          sheet.classList.remove("show");
          if (btn.target === "_blank") {
            window.open(btn.url, "_blank", "noopener,noreferrer");
          } else {
            if (btn.url === "#") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else if (btn.url && btn.url.startsWith("#")) {
              const targetEl = document.querySelector(btn.url);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
              } else {
                window.location.hash = btn.url;
              }
            } else if (btn.url) {
              window.location.href = btn.url;
            }
          }
        } else if (btn.type === "submenu") {
          sheetTitle.textContent = btn.label;
          const sublinks = btn.sublinks || [];
          if (!sublinks.length) {
            sheetLinks.innerHTML = '<div style="padding:8px;font-size:12px;color:#64748b">No links available</div>';
          } else {
            sheetLinks.innerHTML = sublinks.map(s => {
              return '<a class="web2app-sublink" href="' + (s.url || '#') + '" target="' + (s.target || '_self') + '">' +
                '<span>' + (s.icon || '🔗') + '</span>' +
                '<span>' + s.name + '</span>' +
              '</a>';
            }).join('');
          }
          sheet.classList.add("show");
        }
      };
    });
  <\/script>
</body>
</html>`;
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ============================================================
   Storage & State Persistence
============================================================ */
function autoSave() {
  localStorage.setItem("web2AppConverterState", JSON.stringify(state));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("web2AppConverterState");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.buttons) {
        state = parsed;
        populateInputsFromState();
      }
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
  }
}

function populateInputsFromState() {
  $("projectName").value = state.projectName || "";
  $("siteUrlInput").value = state.siteUrl || "";
  $("rawHtmlCode").value = state.rawHtml || "";

  // Design
  if (state.design) {
    $("navPreset").value = state.design.preset || "modern";
    $("navHeight").value = state.design.height || 68;
    $("navActiveColor").value = state.design.activeColor || "#3b82f6";
    $("navInactiveColor").value = state.design.inactiveColor || "#64748b";
    $("navBgColor").value = state.design.bgColor || "#ffffff";
    $("navIconSize").value = state.design.iconSize || 20;
    $("navFontSize").value = state.design.fontSize || 10;
    $("navRadius").value = state.design.radius || 0;
  }

  // Layout
  if (state.layout) {
    $("phoneWidth").value = state.layout.phoneWidth || 390;
    $("phoneHeight").value = state.layout.phoneHeight || 780;
    $("layoutMode").value = state.layout.layoutMode || "responsive";
    $("optResponsiveImages").checked = !!state.layout.optResponsiveImages;
    $("optPreventOverflow").checked = !!state.layout.optPreventOverflow;
    $("optTouchOptimized").checked = !!state.layout.optTouchOptimized;
    $("optAddSafePadding").checked = !!state.layout.optAddSafePadding;
  }

  // Header
  if (state.header) {
    $("optShowHeader").checked = !!state.header.show;
    $("headerTitle").value = state.header.title || "";
    $("headerHeight").value = state.header.height || 56;
    $("headerBg").value = state.header.bg || "#ffffff";
  }
}

function renderAll() {
  updatePhoneDimensions();
  renderNavButtonsList();
  renderHeader();
  renderPreview();
  renderBottomNavDesign();
}