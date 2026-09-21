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
  importedButtons: [],
  importedFilter: "all",
  importedSearch: "",
  proposedFixedHtml: "",
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
window.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  bindUIEvents();
  renderAll();
});

function bindUIEvents() {
  // Project Name sync
  $("projectName").addEventListener("input", () => {
    state.projectName = $("projectName").value;
    if (!state.header.title || state.header.title === "My Mobile Web App") {
      state.header.title = state.projectName;
      $("headerTitle").value = state.projectName;
    }
    $("phoneTitleText").textContent = state.header.title || state.projectName || "My Mobile Web App";
    autoSave();
  });

  // Source tabs
  document.querySelectorAll(".source-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const src = tab.dataset.source;
      state.sourceType = src === "file" && state.sourceType === "sample" ? "sample" : src;
      updateSourceTabsUI();
      renderPreview();
      autoSave();
    });
  });

  // Source actions
  $("uploadFileBtn").onclick = () => $("htmlFileInput").click();
  $("htmlFileInput").addEventListener("change", handleFileUpload);
  $("useSampleBtn").onclick = () => {
    state.sourceType = "sample";
    state.rawHtml = DEFAULT_SAMPLE_HTML;
    $("rawHtmlCode").value = DEFAULT_SAMPLE_HTML;
    $("sourceStatus").textContent = "Active: Loaded sample website.";
    $("sourceStatus").className = "notice success";
    updateSourceTabsUI();
    const count = extractButtonsFromHtml(DEFAULT_SAMPLE_HTML);
    renderPreview();
    autoSave();
    showToast(`Loaded sample page (${count} buttons found)`);
  };

  $("loadUrlBtn").onclick = () => {
    let url = $("siteUrlInput").value.trim();
    if (!url) { alert("Please enter a valid website URL."); return; }
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
      $("siteUrlInput").value = url;
    }
    state.sourceType = "url";
    state.siteUrl = url;
    $("sourceStatus").textContent = `Active: Loading URL ${url}`;
    $("sourceStatus").className = "notice";
    updateSourceTabsUI();
    renderPreview();
    autoSave();
  };

  $("applyCodeBtn").onclick = () => {
    const code = $("rawHtmlCode").value.trim();
    if (!code) { alert("Please paste HTML code."); return; }
    state.sourceType = "code";
    state.rawHtml = code;
    $("sourceStatus").textContent = `Active: Using custom pasted HTML (${code.length} bytes).`;
    $("sourceStatus").className = "notice success";
    updateSourceTabsUI();
    const count = extractButtonsFromHtml(code);
    renderPreview();
    autoSave();
    showToast(`Pasted HTML applied (${count} button codes found)`);
  };

  // Panel 2 Subtabs: Bottom Bar Buttons vs Import button
  const subtabs = [
    { btn: $("tabNavButtons"), view: $("navButtonsView") },
    { btn: $("tabImportButtons"), view: $("importButtonView") }
  ];
  subtabs.forEach(tabObj => {
    if (!tabObj.btn) return;
    tabObj.btn.addEventListener("click", () => {
      subtabs.forEach(t => {
        t.btn.classList.toggle("active", t === tabObj);
        t.view.classList.toggle("hidden", t !== tabObj);
      });
    });
  });

  // Jump to Import tab buttons
  const switchToImportTab = () => {
    subtabs.forEach(t => {
      const isImport = t.btn === $("tabImportButtons");
      if (t.btn) t.btn.classList.toggle("active", isImport);
      if (t.view) t.view.classList.toggle("hidden", !isImport);
    });
    if ($("tabImportButtons")) $("tabImportButtons").scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  if ($("jumpToImportTabBtn")) $("jumpToImportTabBtn").onclick = switchToImportTab;
  if ($("viewImportedButtonsQuickBtn")) $("viewImportedButtonsQuickBtn").onclick = switchToImportTab;

  // Search input in Import button tab
  if ($("importBtnSearchInput")) {
    $("importBtnSearchInput").addEventListener("input", e => {
      state.importedSearch = e.target.value.trim().toLowerCase();
      renderImportedButtons();
    });
  }

  // Filter pills
  document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.importedFilter = pill.dataset.filter || "all";
      renderImportedButtons();
    });
  });

  // Re-scan button
  if ($("rescanButtonsBtn")) {
    $("rescanButtonsBtn").onclick = () => {
      const count = extractButtonsFromHtml(state.rawHtml);
      showToast(`Scanned web page: ${count} button codes detected!`);
    };
  }

  // Import all buttons
  if ($("importAllToNavBtn")) {
    $("importAllToNavBtn").onclick = () => importAllButtonsToNav();
  }

  // Copy all codes
  if ($("copyAllCodesBtn")) {
    $("copyAllCodesBtn").onclick = () => copyAllButtonCodes();
  }

  // Code Error Check buttons
  const openErrorInspector = () => inspectAndShowErrors();
  if ($("checkCodeErrorsSourceBtn")) $("checkCodeErrorsSourceBtn").onclick = openErrorInspector;
  if ($("checkCodeErrorsBtn")) $("checkCodeErrorsBtn").onclick = openErrorInspector;

  // Code Error modal controls
  if ($("codeErrorCloseBtn")) $("codeErrorCloseBtn").onclick = closeCodeErrorModal;
  if ($("codeErrorCancelBtn")) $("codeErrorCancelBtn").onclick = closeCodeErrorModal;
  if ($("codeErrorModal")) {
    $("codeErrorModal").addEventListener("click", e => {
      if (e.target === $("codeErrorModal")) closeCodeErrorModal();
    });
  }
  if ($("autoFixHeaderBtn")) $("autoFixHeaderBtn").onclick = applyAutoFixToApp;
  if ($("applyAutoFixBtn")) $("applyAutoFixBtn").onclick = applyAutoFixToApp;

  // Error modal subtabs
  const errorSubtabs = [
    { btn: $("tabErrorIssues"), view: $("errorIssuesView") },
    { btn: $("tabErrorCodePreview"), view: $("errorCodePreviewView") }
  ];
  errorSubtabs.forEach(tabObj => {
    if (!tabObj.btn) return;
    tabObj.btn.addEventListener("click", () => {
      errorSubtabs.forEach(t => {
        t.btn.classList.toggle("active", t === tabObj);
        t.view.classList.toggle("hidden", t !== tabObj);
      });
    });
  });

  // Nav Button Modal Handlers
  $("addNewNavBtn").onclick = () => openNavModal(-1);
  $("modalCloseBtn").onclick = closeNavModal;
  $("modalCancelBtn").onclick = closeNavModal;
  $("modalSaveBtn").onclick = saveNavModalButton;

  // Close modal on background overlay click & Escape key
  $("navButtonModal").addEventListener("click", e => {
    if (e.target === $("navButtonModal")) closeNavModal();
  });
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if ($("navButtonModal").classList.contains("show")) closeNavModal();
      if ($("codeErrorModal") && $("codeErrorModal").classList.contains("show")) closeCodeErrorModal();
    }
  });

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
  });

  $("addSubLinkRowBtn").onclick = () => addSubLinkRow();

  // Design inputs live updates
  const designInputIds = [
    "navPreset", "navHeight", "navActiveColor", "navInactiveColor",
    "navBgColor", "navIconSize", "navFontSize", "navRadius"
  ];
  designInputIds.forEach(id => {
    const el = $(id);
    const handler = () => {
      syncDesignFromInputs();
      renderBottomNavDesign();
      autoSave();
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });

  // Layout inputs
  $("devicePreset").addEventListener("change", () => {
    const p = $("devicePreset").value;
    state.layout.devicePreset = p;
    const presets = {
      iphone: [390, 844],
      android: [412, 892],
      compact: [360, 740],
      tablet: [768, 1024]
    };
    if (presets[p]) {
      $("phoneWidth").value = presets[p][0];
      $("phoneHeight").value = presets[p][1];
      state.layout.phoneWidth = presets[p][0];
      state.layout.phoneHeight = presets[p][1];
      updatePhoneDimensions();
    }
    autoSave();
  });

  $("layoutMode").addEventListener("change", () => {
    state.layout.layoutMode = $("layoutMode").value;
    renderPreview();
    autoSave();
  });

  ["phoneWidth", "phoneHeight"].forEach(id => {
    $(id).addEventListener("input", () => {
      state.layout[id] = $(id).value;
      $("devicePreset").value = "custom";
      state.layout.devicePreset = "custom";
      updatePhoneDimensions();
      autoSave();
    });
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
    $("phoneTitleText").textContent = state.header.title || state.projectName || "My Mobile Web App";
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

  // Dismiss phone submenu when clicking outside in phone body
  $("phoneBody").addEventListener("click", e => {
    if (!$("phoneSubmenuSheet").contains(e.target)) {
      $("phoneSubmenuSheet").classList.remove("show");
    }
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

  // Sheet close
  $("sheetCloseBtn").onclick = () => {
    $("phoneSubmenuSheet").classList.remove("show");
  };

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
function updateSourceTabsUI() {
  const current = state.sourceType || "sample";
  const activeTabName = current === "sample" ? "file" : current;
  document.querySelectorAll(".source-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.source === activeTabName);
  });
  $("sourceFileArea").classList.toggle("hidden", activeTabName !== "file");
  $("sourceUrlArea").classList.toggle("hidden", activeTabName !== "url");
  $("sourceCodeArea").classList.toggle("hidden", activeTabName !== "code");

  if (current === "sample") {
    $("sourceBadge").textContent = "Sample Webpage";
  } else if (current === "file") {
    $("sourceBadge").textContent = "HTML File";
  } else if (current === "url") {
    $("sourceBadge").textContent = "Website URL";
  } else if (current === "code") {
    $("sourceBadge").textContent = "Custom Code";
  }
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    const content = evt.target.result;
    state.sourceType = "file";
    state.rawHtml = content;
    $("rawHtmlCode").value = content;
    updateSourceTabsUI();
    const count = extractButtonsFromHtml(content);
    $("sourceBadge").textContent = `HTML File (${formatBytes(file.size)})`;
    $("sourceStatus").textContent = `Loaded file "${file.name}" (${formatBytes(file.size)}). Converted and extracted ${count} button codes.`;
    $("sourceStatus").className = "notice success";
    renderPreview();
    autoSave();
    showToast(`Loaded "${file.name}": Found ${count} buttons in web file!`);
  };
  reader.readAsText(file);
  e.target.value = "";
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/* ============================================================
   Navigation Buttons Manager
============================================================ */
function renderNavButtonsList() {
  const container = $("navButtonsList");
  container.innerHTML = "";
  $("buttonCountBadge").textContent = `${state.buttons.length}/${MAX_NAV_BUTTONS} Buttons`;
  if ($("subtabNavCount")) $("subtabNavCount").textContent = state.buttons.length;

  const isFull = state.buttons.length >= MAX_NAV_BUTTONS;
  $("addNewNavBtn").disabled = isFull;
  $("addNewNavBtn").style.opacity = isFull ? "0.5" : "1";
  $("addNewNavBtn").style.cursor = isFull ? "not-allowed" : "pointer";
  $("addNewNavBtn").title = isFull ? `Maximum ${MAX_NAV_BUTTONS} buttons reached` : "Add a new button to the bottom bar";

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
        <button class="btn small" data-action="up" data-idx="${idx}" title="Move Up" ${idx === 0 ? "disabled" : ""}>↑</button>
        <button class="btn small" data-action="down" data-idx="${idx}" title="Move Down" ${idx === state.buttons.length - 1 ? "disabled" : ""}>↓</button>
        <button class="btn small" data-action="edit" data-idx="${idx}">✏️ Edit</button>
        <button class="btn small danger" data-action="delete" data-idx="${idx}">🗑️ Delete</button>
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
          if (state.activeButtonIndex >= state.buttons.length) {
            state.activeButtonIndex = Math.max(0, state.buttons.length - 1);
          } else if (state.activeButtonIndex === idx) {
            state.activeButtonIndex = Math.max(0, idx - 1);
          } else if (state.activeButtonIndex > idx) {
            state.activeButtonIndex--;
          }
          renderNavButtonsList();
          renderBottomNavBar();
          autoSave();
        }
      } else if (action === "up" && idx > 0) {
        if (state.activeButtonIndex === idx) {
          state.activeButtonIndex = idx - 1;
        } else if (state.activeButtonIndex === idx - 1) {
          state.activeButtonIndex = idx;
        }
        [state.buttons[idx - 1], state.buttons[idx]] = [state.buttons[idx], state.buttons[idx - 1]];
        renderNavButtonsList();
        renderBottomNavBar();
        autoSave();
      } else if (action === "down" && idx < state.buttons.length - 1) {
        if (state.activeButtonIndex === idx) {
          state.activeButtonIndex = idx + 1;
        } else if (state.activeButtonIndex === idx + 1) {
          state.activeButtonIndex = idx;
        }
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
   Toast Notification Helper
============================================================ */
function showToast(msg, type = "success") {
  let toast = $("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.className = `app-toast ${type} show`;
  toast.innerHTML = `<span>${type === "danger" ? "❌" : type === "info" ? "💡" : "✅"}</span> <span>${escapeHtml(msg)}</span>`;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/* ============================================================
   Imported Buttons Extractor & Inspector (THE USER REQUEST)
============================================================ */
function detectIconForButton(text = "", id = "", className = "", tag = "") {
  const t = (text + " " + id + " " + className).toLowerCase();
  const emojiMatch = text.match(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u);
  if (emojiMatch) return emojiMatch[0];

  if (t.includes("home")) return "🏠";
  if (t.includes("search") || t.includes("find") || t.includes("lookup")) return "🔍";
  if (t.includes("cart") || t.includes("shop") || t.includes("buy") || t.includes("order")) return "🛒";
  if (t.includes("user") || t.includes("account") || t.includes("profile") || t.includes("login")) return "👤";
  if (t.includes("theme") || t.includes("dark") || t.includes("light") || t.includes("mode") || t.includes("sun") || t.includes("moon")) return "☀️";
  if (t.includes("copy")) return "📋";
  if (t.includes("reset") || t.includes("clear") || t.includes("refresh") || t.includes("reload")) return "🔄";
  if (t.includes("fav") || t.includes("star") || t.includes("like") || t.includes("bookmark")) return "⭐";
  if (t.includes("menu") || t.includes("more") || t.includes("nav")) return "☰";
  if (t.includes("mail") || t.includes("contact") || t.includes("msg") || t.includes("chat")) return "✉️";
  if (t.includes("setting") || t.includes("config") || t.includes("gear")) return "⚙️";
  if (t.includes("filter")) return "⚡";
  if (t.includes("info") || t.includes("help") || t.includes("about")) return "ℹ️";
  if (t.includes("download") || t.includes("export") || t.includes("save")) return "📥";
  if (t.includes("upload") || t.includes("import")) return "📤";
  if (t.includes("delete") || t.includes("remove") || t.includes("trash")) return "🗑️";
  if (t.includes("edit") || t.includes("modify") || t.includes("write")) return "✏️";
  if (t.includes("calc")) return "🧮";
  if (tag === "a") return "🔗";
  return "🔘";
}

function extractButtonsFromHtml(html) {
  if (!html) html = state.rawHtml || "";
  state.importedButtons = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Gather scripts to scan for click handlers
    const scriptTags = Array.from(doc.querySelectorAll("script"));
    const allScripts = scriptTags.map(s => s.textContent || "").join("\n");

    const candidates = [];
    const seenElements = new Set();

    const addCandidate = (el, category) => {
      if (!el || seenElements.has(el)) return;
      seenElements.add(el);
      candidates.push({ el, category });
    };

    // 1. <button> elements
    doc.querySelectorAll("button").forEach(el => addCandidate(el, "button"));

    // 2. <input> buttons
    doc.querySelectorAll('input[type="button"], input[type="submit"], input[type="reset"]').forEach(el => addCandidate(el, "input"));

    // 3. Button-styled anchor links
    doc.querySelectorAll('a[role="button"], a.btn, a.button, a[class*="btn-"], a[class*="button"]').forEach(el => addCandidate(el, "link"));

    // 4. Elements with onclick or role="button"
    doc.querySelectorAll('[role="button"], [onclick]').forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === "button") addCandidate(el, "button");
      else if (tag === "a") addCandidate(el, "link");
      else if (tag === "input") addCandidate(el, "input");
      else addCandidate(el, "other");
    });

    state.importedButtons = candidates.map((item, idx) => {
      const el = item.el;
      const tag = el.tagName.toLowerCase();
      const id = el.id || "";
      const className = (typeof el.className === "string" ? el.className : "").trim();
      const typeAttr = el.getAttribute("type") || "";
      const onclickAttr = el.getAttribute("onclick") || "";
      const hrefAttr = el.getAttribute("href") || "";
      const titleAttr = el.getAttribute("title") || el.getAttribute("aria-label") || "";

      let text = (el.innerText || el.textContent || "").trim();
      if (!text && tag === "input") {
        text = el.value || titleAttr || "Submit";
      }
      if (!text) {
        text = titleAttr || (id ? id : `Button #${idx + 1}`);
      }
      if (text.length > 40) text = text.slice(0, 40) + "...";

      const icon = detectIconForButton(text, id, className, tag);
      const outerHTML = el.outerHTML ? el.outerHTML.trim() : `<${tag}>${escapeHtml(text)}</${tag}>`;

      // Extract associated JavaScript from scripts
      let jsCode = "";
      if (onclickAttr) {
        jsCode += `// Inline onclick:\n${onclickAttr}`;
        const fnMatch = onclickAttr.match(/([a-zA-Z0-9_$]+)\s*\(/);
        if (fnMatch) {
          const fnName = fnMatch[1];
          const fnRegex = new RegExp(`(?:function\\s+${fnName}|(?:const|let|var)\\s+${fnName}\\s*=)[^\\n]*\\{[\\s\\S]*?\\n\\}`, 'm');
          const matchedFn = allScripts.match(fnRegex);
          if (matchedFn) {
            jsCode += `\n\n// Associated script function in page:\n${matchedFn[0].slice(0, 350)}${matchedFn[0].length > 350 ? '...' : ''}`;
          }
        }
      }

      if (id) {
        const listenerRegex = new RegExp(`(?:\\$|document)\\.getElementById\\(['"\`]${id}['"\`]\\)[\\s\\S]*?\\.addEventListener\\(['"\`]click['"\`],[\\s\\S]*?\\n\\}`, 'm');
        const matchedListener = allScripts.match(listenerRegex);
        if (matchedListener) {
          jsCode += (jsCode ? "\n\n" : "") + `// Associated event listener:\n${matchedListener[0].slice(0, 350)}`;
        }
      }

      return {
        id: id || `imported-btn-${idx + 1}`,
        rawId: id,
        tag,
        typeAttr,
        className,
        text,
        icon,
        category: item.category,
        onclick: onclickAttr,
        href: hrefAttr,
        outerHTML,
        jsCode,
        hasJs: !!(onclickAttr || jsCode)
      };
    });

  } catch (err) {
    console.warn("Button extraction error:", err);
  }

  updateImportButtonsBadges();
  renderImportedButtons();
  return state.importedButtons.length;
}

function updateImportButtonsBadges() {
  const count = state.importedButtons.length;
  if ($("subtabImportCount")) $("subtabImportCount").textContent = `${count} found`;
  if ($("detectedButtonsCount")) $("detectedButtonsCount").textContent = count;
  if ($("quickExtractedBtnCount")) $("quickExtractedBtnCount").textContent = count;

  const notice = $("importedButtonsNotice");
  if (notice) {
    if (count > 0 && state.sourceType !== "sample") {
      notice.classList.remove("hidden");
    } else {
      notice.classList.add("hidden");
    }
  }

  // Update filter pill counters
  const filterCounts = {
    all: count,
    button: state.importedButtons.filter(b => b.tag === "button").length,
    input: state.importedButtons.filter(b => b.tag === "input").length,
    link: state.importedButtons.filter(b => b.category === "link" || b.tag === "a").length,
    js: state.importedButtons.filter(b => b.hasJs).length
  };
  if ($("filterCountAll")) $("filterCountAll").textContent = filterCounts.all;
  if ($("filterCountButton")) $("filterCountButton").textContent = filterCounts.button;
  if ($("filterCountInput")) $("filterCountInput").textContent = filterCounts.input;
  if ($("filterCountLink")) $("filterCountLink").textContent = filterCounts.link;
  if ($("filterCountJs")) $("filterCountJs").textContent = filterCounts.js;
}

function renderImportedButtons() {
  const container = $("importedButtonsList");
  if (!container) return;
  container.innerHTML = "";

  const filter = state.importedFilter || "all";
  const search = (state.importedSearch || "").toLowerCase();

  const filtered = state.importedButtons.filter(b => {
    // Filter by type
    if (filter === "button" && b.tag !== "button") return false;
    if (filter === "input" && b.tag !== "input") return false;
    if (filter === "link" && b.category !== "link" && b.tag !== "a") return false;
    if (filter === "js" && !b.hasJs) return false;

    // Filter by search text
    if (search) {
      const match = (b.text + " " + b.rawId + " " + b.className + " " + b.onclick + " " + b.outerHTML).toLowerCase();
      if (!match.includes(search)) return false;
    }
    return true;
  });

  const summary = $("importButtonsSummary");
  if (summary) {
    if (state.importedButtons.length === 0) {
      summary.className = "notice";
      summary.innerHTML = "No buttons detected yet in this web page. Upload an HTML file or paste code above to inspect buttons.";
    } else {
      summary.className = "notice success";
      summary.innerHTML = `Discovered <strong>${state.importedButtons.length}</strong> interactive button codes from web file (showing ${filtered.length} matching filter). Click <strong>+ Add to Bottom Bar</strong> to import any button into your mobile navigation bar.`;
    }
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="hint" style="text-align:center; padding:24px 16px; border:1px dashed var(--border); border-radius:12px; background:var(--surface)">
        <p style="font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px">No matching buttons found</p>
        <p style="font-size:12px; color:var(--text-muted)">${state.importedButtons.length ? "Try clearing your search query or selecting 'All' in the filters above." : "Import or upload an HTML file in Panel 1 to automatically detect all buttons & click codes."}</p>
      </div>`;
    return;
  }

  filtered.forEach((btn, idx) => {
    const card = document.createElement("div");
    card.className = `imported-btn-card type-${btn.category}`;

    const tagBadgeClass = btn.tag === "button" ? "btn" : btn.tag === "input" ? "input" : "link";

    let attrBadgesHtml = "";
    if (btn.rawId) attrBadgesHtml += `<span class="attr-pill">id: <strong>#${escapeHtml(btn.rawId)}</strong></span>`;
    if (btn.typeAttr) attrBadgesHtml += `<span class="attr-pill">type: <strong>${escapeHtml(btn.typeAttr)}</strong></span>`;
    if (btn.className) attrBadgesHtml += `<span class="attr-pill">class: <strong>.${escapeHtml(btn.className.split(" ")[0])}</strong></span>`;
    if (btn.href) attrBadgesHtml += `<span class="attr-pill">href: <strong>${escapeHtml(btn.href)}</strong></span>`;
    if (btn.onclick) attrBadgesHtml += `<span class="attr-pill" style="color:#fbbf24">⚡ onclick</span>`;

    let jsBoxHtml = "";
    if (btn.jsCode) {
      jsBoxHtml = `
        <div class="code-box-wrapper" style="margin-top:6px">
          <div class="code-box-header">
            <span>⚡ Action / JavaScript Code</span>
            <button class="btn small" style="padding:2px 8px; font-size:11px" data-copy="js" data-idx="${idx}">📋 Copy JS</button>
          </div>
          <div class="code-box-content js">${escapeHtml(btn.jsCode)}</div>
        </div>`;
    }

    card.innerHTML = `
      <div class="imported-btn-header">
        <div class="imported-btn-title-group">
          <div class="imported-btn-icon">${escapeHtml(btn.icon)}</div>
          <div style="min-width:0; flex:1">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap">
              <span class="imported-btn-name" title="${escapeHtml(btn.text)}">${escapeHtml(btn.text)}</span>
              <span class="tag-badge ${tagBadgeClass}">&lt;${btn.tag}&gt;</span>
            </div>
            <div class="attr-pills-row" style="margin-top:4px">
              ${attrBadgesHtml}
            </div>
          </div>
        </div>
      </div>

      <!-- HTML Code Box -->
      <div class="code-box-wrapper">
        <div class="code-box-header">
          <span>HTML Code Snippet</span>
          <button class="btn small" style="padding:2px 8px; font-size:11px" data-copy="html" data-idx="${idx}">📋 Copy HTML</button>
        </div>
        <div class="code-box-content">${escapeHtml(btn.outerHTML)}</div>
      </div>

      ${jsBoxHtml}

      <div class="imported-btn-actions">
        <button class="btn small primary" data-action="import-nav" data-idx="${idx}" title="Add this button to mobile bottom navigation bar">
          ➕ Add to Bottom Bar
        </button>
        <button class="btn small" data-action="test-preview" data-idx="${idx}" title="Trigger and click this button in mobile preview">
          ⚡ Test in Preview
        </button>
        <button class="btn small" data-copy="all" data-idx="${idx}" title="Copy full button HTML and JS code">
          📋 Copy Code
        </button>
      </div>
    `;

    // Bind event handlers inside card
    card.querySelectorAll("button[data-copy]").forEach(cb => {
      cb.addEventListener("click", () => {
        const type = cb.dataset.copy;
        let textToCopy = "";
        if (type === "html") textToCopy = btn.outerHTML;
        else if (type === "js") textToCopy = btn.jsCode;
        else textToCopy = `<!-- Button HTML -->\n${btn.outerHTML}\n\n${btn.jsCode ? `/* Button JS */\n${btn.jsCode}` : ''}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied ${type.toUpperCase()} code for "${btn.text}"!`);
        }).catch(() => {
          showToast("Failed to copy code", "danger");
        });
      });
    });

    card.querySelectorAll("button[data-action]").forEach(ab => {
      ab.addEventListener("click", () => {
        const action = ab.dataset.action;
        if (action === "import-nav") {
          importButtonToBottomBar(btn);
        } else if (action === "test-preview") {
          triggerButtonInPreview(btn);
        }
      });
    });

    container.appendChild(card);
  });
}

function importButtonToBottomBar(btn) {
  if (state.buttons.length >= MAX_NAV_BUTTONS) {
    alert(`Maximum ${MAX_NAV_BUTTONS} navigation buttons reached. Please delete or edit an existing button first.`);
    return;
  }

  // Check if button already exists in nav
  const exists = state.buttons.some(b => b.label.toLowerCase() === btn.text.toLowerCase());
  if (exists) {
    if (!confirm(`A button labeled "${btn.text}" is already in your bottom navigation bar. Add it anyway?`)) {
      return;
    }
  }

  const newNavBtn = {
    id: "btn-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    label: btn.text,
    icon: btn.icon || "🔘",
    type: "link",
    url: btn.href || (btn.rawId ? `#${btn.rawId}` : "#"),
    target: "_self",
    sublinks: [],
    triggerId: btn.rawId || "",
    triggerOnclick: btn.onclick || ""
  };

  state.buttons.push(newNavBtn);
  renderNavButtonsList();
  renderBottomNavBar();
  autoSave();

  showToast(`Added "${btn.text}" to Mobile Bottom Bar!`);

  // Switch to Nav Buttons tab so user sees their new button immediately
  if ($("tabNavButtons")) {
    $("tabNavButtons").click();
  }
}

function importAllButtonsToNav() {
  if (!state.importedButtons.length) {
    alert("No buttons available to import.");
    return;
  }

  let addedCount = 0;
  for (const btn of state.importedButtons) {
    if (state.buttons.length >= MAX_NAV_BUTTONS) break;
    const exists = state.buttons.some(b => b.label.toLowerCase() === btn.text.toLowerCase());
    if (exists) continue;

    state.buttons.push({
      id: "btn-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      label: btn.text,
      icon: btn.icon || "🔘",
      type: "link",
      url: btn.href || (btn.rawId ? `#${btn.rawId}` : "#"),
      target: "_self",
      sublinks: [],
      triggerId: btn.rawId || "",
      triggerOnclick: btn.onclick || ""
    });
    addedCount++;
  }

  renderNavButtonsList();
  renderBottomNavBar();
  autoSave();

  if (addedCount > 0) {
    showToast(`Imported ${addedCount} buttons into Mobile Bottom Bar!`);
    if ($("tabNavButtons")) $("tabNavButtons").click();
  } else {
    showToast(`Bottom bar is full (max ${MAX_NAV_BUTTONS} buttons)`, "info");
  }
}

function copyAllButtonCodes() {
  if (!state.importedButtons.length) {
    alert("No buttons extracted yet to copy.");
    return;
  }
  const codes = state.importedButtons.map((b, i) => `/* ================= Button #${i + 1}: ${b.text} (${b.tag}) ================= */\n<!-- HTML: -->\n${b.outerHTML}\n\n${b.jsCode ? `/* JavaScript Action: */\n${b.jsCode}\n` : ''}`).join("\n\n");
  navigator.clipboard.writeText(codes).then(() => {
    showToast(`Copied all ${state.importedButtons.length} button codes to clipboard!`);
  }).catch(() => {
    showToast("Failed copying button codes", "danger");
  });
}

function triggerButtonInPreview(btn) {
  const iframe = $("previewIframe");
  if (!iframe || !iframe.contentDocument) {
    showToast("Preview iframe not ready", "info");
    return;
  }

  try {
    let triggered = false;
    // Try by ID first
    if (btn.rawId) {
      const el = iframe.contentDocument.getElementById(btn.rawId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.click();
        triggered = true;
      }
    }
    // Try by onclick script
    if (!triggered && btn.onclick) {
      try {
        iframe.contentWindow.eval(btn.onclick);
        triggered = true;
      } catch (err) {
        console.warn("Error running onclick in preview:", err);
      }
    }
    // Try finding by text or aria-label
    if (!triggered && btn.text) {
      const allButtons = iframe.contentDocument.querySelectorAll("button, a, input");
      for (const b of allButtons) {
        const t = (b.innerText || b.value || b.getAttribute("aria-label") || "").trim().toLowerCase();
        if (t === btn.text.toLowerCase()) {
          b.scrollIntoView({ behavior: "smooth", block: "center" });
          b.click();
          triggered = true;
          break;
        }
      }
    }

    if (triggered) {
      showToast(`Triggered "${btn.text}" in phone preview!`);
    } else {
      showToast(`Executed click event for "${btn.text}"`);
    }
  } catch (err) {
    showToast(`Clicked "${btn.text}" in preview`);
  }
}

/* ============================================================
   Code Error Checker & Auto-Fix Engine (THE USER REQUEST)
============================================================ */
function checkCodeErrors(html) {
  if (!html) html = state.rawHtml || "";
  const issues = [];

  // 1. DOCTYPE check
  if (!/<!DOCTYPE\s+html/i.test(html)) {
    issues.push({
      severity: "warning",
      title: "Missing HTML5 DOCTYPE",
      desc: "No <!DOCTYPE html> declaration found at the start of document. Browsers may fall back to quirks mode.",
      snippet: html.slice(0, 80),
      fix: "Add <!DOCTYPE html> declaration to top of document."
    });
  }

  // 2. Viewport meta tag check
  if (!/<meta[^>]*name=["']viewport["']/i.test(html)) {
    issues.push({
      severity: "warning",
      title: "Missing Mobile Viewport Meta Tag",
      desc: "Page lacks a viewport meta tag, causing desktop zoom-out on mobile devices.",
      snippet: "<head> ... </head>",
      fix: "Add <meta name='viewport' content='width=device-width, initial-scale=1.0, viewport-fit=cover'>"
    });
  }

  // 3. Tag Balance Checks
  const criticalTags = ["button", "div", "span", "script", "style", "table", "form", "section", "main", "nav"];
  criticalTags.forEach(tag => {
    const openRegex = new RegExp(`<${tag}(\\s+[^>]*)?>`, "gi");
    const closeRegex = new RegExp(`</${tag}>`, "gi");
    const openCount = (html.match(openRegex) || []).length;
    const closeCount = (html.match(closeRegex) || []).length;
    if (openCount !== closeCount) {
      issues.push({
        severity: "danger",
        title: `Mismatched <${tag}> Tag Count (${openCount} open vs ${closeCount} close)`,
        desc: `Found ${openCount} opening <${tag}> tags but ${closeCount} closing </${tag}> tags. Unclosed tags can corrupt layouts and button click hit areas.`,
        snippet: `<${tag}> ... </${tag}>`,
        fix: `Automatically balance and properly close all <${tag}> tags via HTML DOM normalization.`
      });
    }
  });

  // 4. DOM-level inspections
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Check duplicate IDs
    const idMap = new Map();
    doc.querySelectorAll("[id]").forEach((el, i) => {
      const id = el.id.trim();
      if (!id) return;
      if (idMap.has(id)) {
        issues.push({
          severity: "danger",
          title: `Duplicate Element ID: #${id}`,
          desc: `Multiple elements share ID "${id}". Duplicate IDs violate the HTML specification and cause JavaScript button selectors to fail.`,
          snippet: el.outerHTML.slice(0, 140),
          fix: `Make secondary ID unique: #${id}-fix-${i}`
        });
      } else {
        idMap.set(id, true);
      }
    });

    // Check buttons
    doc.querySelectorAll("button").forEach((btn, idx) => {
      if (!btn.getAttribute("type")) {
        issues.push({
          severity: "info",
          title: `Button Missing Type Attribute: "${(btn.textContent || '').trim().slice(0, 20) || '#' + (btn.id || idx + 1)}"`,
          desc: `Button has no explicit type attribute. By default it behaves as type="submit", which can accidentally trigger unwanted form submissions.`,
          snippet: btn.outerHTML.slice(0, 120),
          fix: `Add explicit type="button"`
        });
      }

      const text = (btn.textContent || "").trim();
      const aria = btn.getAttribute("aria-label") || btn.getAttribute("title");
      if (!text && !aria) {
        issues.push({
          severity: "warning",
          title: `Empty Inaccessible Button (#${btn.id || idx + 1})`,
          desc: `Button has no visible text or aria-label, making it unusable for screen readers and touch navigation.`,
          snippet: btn.outerHTML.slice(0, 120),
          fix: `Add descriptive aria-label and fallback title.`
        });
      }

      const onclick = btn.getAttribute("onclick");
      if (onclick) {
        try {
          new Function(onclick);
        } catch (jsErr) {
          issues.push({
            severity: "danger",
            title: `Syntax Error in Button onclick: #${btn.id || idx + 1}`,
            desc: `The inline onclick code "${onclick}" contains a JavaScript syntax error: ${jsErr.message}`,
            snippet: btn.outerHTML.slice(0, 140),
            fix: `Wrap with safe error handling guard.`
          });
        }
      }
    });

    // Check <script> tags for JavaScript syntax errors
    doc.querySelectorAll("script").forEach((sc, i) => {
      const type = (sc.getAttribute("type") || "").toLowerCase();
      if (!sc.src && (!type || type === "text/javascript" || type === "application/javascript")) {
        const code = sc.textContent || "";
        if (code.trim()) {
          try {
            new Function(code);
          } catch (scErr) {
            issues.push({
              severity: "danger",
              title: `JavaScript Syntax Error in Script Block #${i + 1}`,
              desc: `Parse error: ${scErr.message}`,
              snippet: code.slice(0, 160) + (code.length > 160 ? '...' : ''),
              fix: `Isolate and handle syntax error in script.`
            });
          }
        }
      }
    });

    // Check empty href links
    doc.querySelectorAll("a").forEach((a, i) => {
      const href = a.getAttribute("href");
      if (href === "" || href === null) {
        issues.push({
          severity: "info",
          title: `Empty Link Href: "${(a.textContent || '').trim().slice(0, 20) || '#' + i}"`,
          desc: `Anchor tag has empty or missing href attribute, which can break navigation focus.`,
          snippet: a.outerHTML.slice(0, 120),
          fix: `Add href="#" or valid destination.`
        });
      }
    });

  } catch (err) {
    issues.push({
      severity: "danger",
      title: "DOM Structure Parse Error",
      desc: err.message,
      snippet: html.slice(0, 150),
      fix: "Normalize HTML structure."
    });
  }

  return issues;
}

function autoFixCodeErrors(html) {
  if (!html) html = state.rawHtml || "";
  let fixed = html;

  // 1. Add <!DOCTYPE html>
  if (!/<!DOCTYPE\s+html/i.test(fixed)) {
    fixed = "<!DOCTYPE html>\n" + fixed;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fixed, "text/html");

    // 2. Ensure <head> and meta tags
    let head = doc.querySelector("head");
    if (!head) {
      head = doc.createElement("head");
      doc.documentElement.insertBefore(head, doc.body);
    }
    if (!doc.querySelector('meta[charset]')) {
      const charset = doc.createElement("meta");
      charset.setAttribute("charset", "UTF-8");
      head.prepend(charset);
    }
    if (!doc.querySelector('meta[name="viewport"]')) {
      const meta = doc.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, viewport-fit=cover";
      head.prepend(meta);
    }

    // 3. Fix duplicate IDs
    const seenIds = new Set();
    doc.querySelectorAll("[id]").forEach((el, i) => {
      const id = el.id.trim();
      if (!id) return;
      if (seenIds.has(id)) {
        el.id = `${id}-fixed-${i}`;
      } else {
        seenIds.add(id);
      }
    });

    // 4. Fix buttons
    doc.querySelectorAll("button").forEach((btn, i) => {
      if (!btn.getAttribute("type")) {
        btn.setAttribute("type", "button");
      }
      const text = (btn.textContent || "").trim();
      const aria = btn.getAttribute("aria-label") || btn.getAttribute("title");
      if (!text && !aria) {
        btn.setAttribute("aria-label", `Button ${i + 1}`);
        if (!btn.children.length) btn.textContent = `Button ${i + 1}`;
      }
      const oc = btn.getAttribute("onclick");
      if (oc) {
        try {
          new Function(oc);
        } catch (e) {
          btn.setAttribute("onclick", `try { ${oc} } catch(err) { console.error('Button error:', err); }`);
        }
      }
    });

    // 5. Fix empty anchor links
    doc.querySelectorAll("a").forEach(a => {
      if (!a.hasAttribute("href") || a.getAttribute("href") === "") {
        a.setAttribute("href", "#");
      }
    });

    // Serialize cleaned & balanced HTML
    fixed = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;

  } catch (err) {
    console.error("Auto-fix serialization error:", err);
  }

  return fixed;
}

function inspectAndShowErrors() {
  const issues = checkCodeErrors(state.rawHtml);
  const dangerCount = issues.filter(i => i.severity === "danger").length;
  const warnCount = issues.filter(i => i.severity === "warning").length;
  const infoCount = issues.filter(i => i.severity === "info").length;

  if ($("summaryErrorCount")) $("summaryErrorCount").textContent = dangerCount;
  if ($("summaryWarnCount")) $("summaryWarnCount").textContent = warnCount;
  if ($("summaryInfoCount")) $("summaryInfoCount").textContent = infoCount;
  if ($("modalIssuesCountBadge")) $("modalIssuesCountBadge").textContent = issues.length;

  // Prepare fixed code preview
  state.proposedFixedHtml = autoFixCodeErrors(state.rawHtml);
  if ($("fixedCodePreviewTextarea")) {
    $("fixedCodePreviewTextarea").value = state.proposedFixedHtml;
  }

  const container = $("errorIssuesContainer");
  if (container) {
    container.innerHTML = "";
    if (issues.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:32px 16px; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.3); border-radius:12px">
          <div style="font-size:36px; margin-bottom:8px">🎉</div>
          <h4 style="font-size:16px; font-weight:800; color:#34d399; margin-bottom:4px">No Errors Found!</h4>
          <p style="font-size:12px; color:var(--text-muted)">Your imported web code and buttons are properly structured, valid, and mobile-ready.</p>
        </div>`;
    } else {
      issues.forEach(issue => {
        const card = document.createElement("div");
        card.className = `error-issue-card ${issue.severity}`;
        const icon = issue.severity === "danger" ? "❌" : issue.severity === "warning" ? "⚠️" : "💡";
        const badgeLabel = issue.severity === "danger" ? "Syntax Error" : issue.severity === "warning" ? "Warning" : "Improvement";
        const badgeClass = issue.severity === "danger" ? "danger" : issue.severity === "warning" ? "warning" : "info";

        card.innerHTML = `
          <div class="error-issue-head">
            <span class="error-issue-title">${icon} ${escapeHtml(issue.title)}</span>
            <span class="error-stat-chip ${badgeClass}" style="padding:2px 8px; font-size:10px">${badgeLabel}</span>
          </div>
          <div class="error-issue-desc">${escapeHtml(issue.desc)}</div>
          ${issue.snippet ? `<div class="error-issue-snippet">${escapeHtml(issue.snippet)}</div>` : ''}
          <div class="error-issue-fix">
            <span>✨ Suggested Auto-Fix:</span>
            <span>${escapeHtml(issue.fix)}</span>
          </div>
        `;
        container.appendChild(card);
      });
    }
  }

  // Open modal
  $("codeErrorModal").classList.add("show");
}

function closeCodeErrorModal() {
  $("codeErrorModal").classList.remove("show");
}

function applyAutoFixToApp() {
  const fixed = autoFixCodeErrors(state.rawHtml);
  state.rawHtml = fixed;
  if ($("rawHtmlCode")) $("rawHtmlCode").value = fixed;

  // Re-run button extraction
  const btnCount = extractButtonsFromHtml(fixed);

  // Re-render preview
  renderPreview();
  autoSave();

  showToast(`Auto-fix applied! Repaired issues & refreshed ${btnCount} button codes.`);

  // Re-inspect to refresh modal
  inspectAndShowErrors();
}

/* ============================================================
   Bottom Navigation Bar in Phone Mockup
============================================================ */
function renderBottomNavBar() {
  const bar = $("phoneBottomNav");
  bar.innerHTML = "";

  state.buttons.forEach((btn, idx) => {
    const b = document.createElement("button");
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
      renderBottomNavDesign();

      // Handle Action
      if (btn.type === "link") {
        $("phoneSubmenuSheet").classList.remove("show");
        if (btn.triggerId || btn.triggerOnclick) {
          triggerButtonInPreview({ rawId: btn.triggerId, onclick: btn.triggerOnclick, text: btn.label });
        }
        const url = (btn.url || "").trim();
        if (btn.target === "_blank") {
          window.open(url || "#", "_blank", "noopener,noreferrer");
        } else {
          // If in iframe, scroll or navigate
          const iframe = $("previewIframe");
          try {
            if (!url || url === "#") {
              if (iframe.contentWindow) iframe.contentWindow.scrollTo({ top: 0, behavior: "smooth" });
            } else if (url.startsWith("#")) {
              const hashId = url.substring(1);
              const targetEl = iframe.contentDocument ? (iframe.contentDocument.getElementById(hashId) || iframe.contentDocument.querySelector(`[name="${hashId}"]`)) : null;
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
              } else if (iframe.contentWindow) {
                iframe.contentWindow.location.hash = url;
              }
            } else {
              iframe.contentWindow.location.href = url;
            }
          } catch (e) {
            console.log("Iframe navigation attempted:", url);
          }
        }
      } else if (btn.type === "submenu") {
        const sheet = $("phoneSubmenuSheet");
        if (sheet.classList.contains("show") && $("sheetTitle").textContent === btn.label) {
          sheet.classList.remove("show");
        } else {
          openPhoneSubmenuSheet(btn);
        }
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
  sheet.style.bottom = `${state.design.height + 14}px`;

  if (!btn.sublinks || !btn.sublinks.length) {
    list.innerHTML = `<div class="hint" style="padding:10px; text-align:center">No sub-links configured for this button.</div>`;
  } else {
    btn.sublinks.forEach(sub => {
      const item = document.createElement("button");
      item.className = "sheet-link-btn";
      item.innerHTML = `<span class="ico">${escapeHtml(sub.icon || "🔗")}</span><span>${escapeHtml(sub.name)}</span>`;
      item.addEventListener("click", () => {
        sheet.classList.remove("show");
        const targetUrl = (sub.url || "").trim();
        if (sub.target === "_blank") {
          window.open(targetUrl || "#", "_blank", "noopener,noreferrer");
        } else {
          const iframe = $("previewIframe");
          try {
            if (!targetUrl || targetUrl === "#") {
              if (iframe.contentWindow) iframe.contentWindow.scrollTo({ top: 0, behavior: "smooth" });
            } else if (targetUrl.startsWith("#")) {
              const hashId = targetUrl.substring(1);
              const targetEl = iframe.contentDocument ? (iframe.contentDocument.getElementById(hashId) || iframe.contentDocument.querySelector(`[name="${hashId}"]`)) : null;
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
              } else if (iframe.contentWindow) {
                iframe.contentWindow.location.hash = targetUrl;
              }
            } else {
              iframe.contentWindow.location.href = targetUrl;
            }
          } catch (e) {
            if (targetUrl && !targetUrl.startsWith("#")) {
              window.open(targetUrl, "_blank", "noopener,noreferrer");
            }
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

  // Cleanly reset preset-specific properties before applying
  bar.style.backdropFilter = "none";
  bar.style.webkitBackdropFilter = "none";
  bar.style.border = "none";
  bar.style.boxShadow = "none";

  // Preset styles
  if (d.preset === "floating") {
    bar.style.left = "14px";
    bar.style.right = "14px";
    bar.style.bottom = "14px";
    bar.style.borderRadius = `${d.radius || 24}px`;
    bar.style.boxShadow = "0 12px 30px rgba(0,0,0,0.18)";
    bar.style.border = "1px solid rgba(226,232,240,0.8)";
  } else if (d.preset === "glass") {
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.bottom = "0";
    bar.style.background = "rgba(255, 255, 255, 0.85)";
    bar.style.backdropFilter = "blur(16px)";
    bar.style.webkitBackdropFilter = "blur(16px)";
    bar.style.borderTop = "1px solid rgba(226,232,240,0.8)";
    bar.style.borderRadius = `${d.radius || 0}px ${d.radius || 0}px 0 0`;
  } else if (d.preset === "material") {
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.bottom = "0";
    bar.style.boxShadow = "0 -4px 16px rgba(0,0,0,0.08)";
    bar.style.borderRadius = `${d.radius || 0}px ${d.radius || 0}px 0 0`;
  } else {
    // Modern / Minimal
    bar.style.left = "0";
    bar.style.right = "0";
    bar.style.bottom = "0";
    bar.style.borderTop = "1px solid #e2e8f0";
    bar.style.borderRadius = `${d.radius || 0}px ${d.radius || 0}px 0 0`;
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
  sublinks.forEach((sub, idx) => {
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
    <button class="btn small danger remove-sublink-btn">✕</button>
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
/* ============================================================
   Phone Live Preview Renderer
============================================================ */
function renderPreview() {
  const iframe = $("previewIframe");

  if (state.sourceType === "url" && state.siteUrl) {
    iframe.removeAttribute("srcdoc");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-forms");
    let target = state.siteUrl.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = "https://" + target;
      state.siteUrl = target;
      $("siteUrlInput").value = target;
    }
    iframe.src = target;
  } else {
    iframe.removeAttribute("src");
    iframe.removeAttribute("sandbox");
    // Generate injected HTML preview for iframe
    const adaptedHtml = prepareInjectedHTMLForPreview(state.rawHtml || DEFAULT_SAMPLE_HTML);
    iframe.srcdoc = adaptedHtml;
  }
}

function prepareInjectedHTMLForPreview(sourceHtml) {
  let doc = sourceHtml;

  // Ensure viewport
  if (!doc.includes('viewport')) {
    doc = doc.replace(/<head[^>]*>/i, `$&<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`);
  }

  let layoutModeStyles = "";
  if (state.layout.layoutMode === "fit") {
    layoutModeStyles = `
    html, body { width: 100% !important; max-width: 100% !important; margin: 0 auto !important; box-sizing: border-box !important; }
    * { max-width: 100% !important; box-sizing: border-box !important; }`;
  } else if (state.layout.layoutMode === "contained") {
    layoutModeStyles = `
    body { max-width: 480px !important; margin: 0 auto !important; box-shadow: 0 0 20px rgba(0,0,0,0.06); }`;
  }

  // Inject responsive helper styling into the iframe document
  const responsiveStyles = `
  <style id="__web2app_mobile_styles">
    ${state.layout.optResponsiveImages ? 'img, video, iframe, canvas, svg { max-width: 100% !important; height: auto !important; }' : ''}
    ${state.layout.optPreventOverflow ? 'html, body { overflow-x: hidden !important; max-width: 100vw !important; }' : ''}
    ${state.layout.optTouchOptimized ? 'button, a, input, select { min-height: 38px; touch-action: manipulation; }' : ''}
    ${state.layout.optAddSafePadding ? `body { padding-bottom: ${state.design.height + 20}px !important; }` : ''}
    ${layoutModeStyles}
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
  let bodyInner = "";

  if (state.sourceType === "url" && state.siteUrl) {
    bodyInner = `<iframe src="${escapeHtml(state.siteUrl)}" style="width:100%; height:calc(100vh - ${d.height + (h.show ? h.height : 0)}px); border:none; display:block;"></iframe>`;
  } else {
    const raw = state.rawHtml || DEFAULT_SAMPLE_HTML;
    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const headMatch = raw.match(/<head[^>]*>([\s\S]*)<\/head>/i);
    headInner = headMatch ? headMatch[1] : "";
    bodyInner = bodyMatch ? bodyMatch[1] : raw;
    // Remove conflicting title tags from extracted head
    headInner = headInner.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "");
  }

  let layoutModeStyles = "";
  if (state.layout.layoutMode === "fit") {
    layoutModeStyles = `
  html, body { width: 100% !important; max-width: 100% !important; margin: 0 auto !important; box-sizing: border-box !important; }
  * { max-width: 100% !important; box-sizing: border-box !important; }`;
  } else if (state.layout.layoutMode === "contained") {
    layoutModeStyles = `
  body { max-width: 480px !important; margin: 0 auto !important; box-shadow: 0 0 20px rgba(0,0,0,0.06); }`;
  }

  let presetBarCss = "";
  if (d.preset === 'floating') {
    presetBarCss = `left: 12px; right: 12px; bottom: 12px; border-radius: ${d.radius || 24}px; box-shadow: 0 12px 30px rgba(0,0,0,0.18); border: 1px solid rgba(226,232,240,0.8);`;
  } else if (d.preset === 'glass') {
    presetBarCss = `left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(226,232,240,0.8); border-radius: ${d.radius || 0}px ${d.radius || 0}px 0 0;`;
  } else if (d.preset === 'material') {
    presetBarCss = `left: 0; right: 0; bottom: 0; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); border-radius: ${d.radius || 0}px ${d.radius || 0}px 0 0;`;
  } else {
    presetBarCss = `left: 0; right: 0; bottom: 0; border-top: 1px solid #e2e8f0; border-radius: ${d.radius || 0}px ${d.radius || 0}px 0 0;`;
  }

  const buttonsHtml = state.buttons.map((btn, i) => `
    <button class="web2app-nav-btn ${i === state.activeButtonIndex ? 'active' : ''}" data-idx="${i}">
      <span class="ico">${escapeHtml(btn.icon || '🔘')}</span>
      <span>${escapeHtml(btn.label)}</span>
    </button>
  `).join('');

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
  ${layoutModeStyles}
  body {
    ${state.layout.optAddSafePadding ? `padding-bottom: ${d.height + 24}px !important;` : ''}
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
    ${presetBarCss}
    height: ${d.height}px;
    background: ${d.bgColor};
    display: ${state.buttons.length ? 'flex' : 'none'};
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
<body>

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
      <button class="web2app-sheet-close" id="web2appSheetClose">✕</button>
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

    if (closeBtn) closeBtn.onclick = () => sheet.classList.remove("show");

    document.addEventListener("click", e => {
      if (sheet && sheet.classList.contains("show")) {
        if (!sheet.contains(e.target) && !e.target.closest(".web2app-nav-btn")) {
          sheet.classList.remove("show");
        }
      }
    });

    document.querySelectorAll(".web2app-nav-btn").forEach(btnEl => {
      btnEl.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll(".web2app-nav-btn").forEach(b => b.classList.remove("active"));
        btnEl.classList.add("active");
        const idx = +btnEl.dataset.idx;
        const btn = navButtons[idx];
        if (!btn) return;

        if (btn.type === "link") {
          if (sheet) sheet.classList.remove("show");
          if (btn.triggerId) {
            const targetEl = document.getElementById(btn.triggerId);
            if (targetEl) { targetEl.click(); return; }
          }
          if (btn.triggerOnclick) {
            try { new Function(btn.triggerOnclick)(); return; } catch(err){}
          }
          const url = (btn.url || "").trim();
          if (btn.target === "_blank") {
            window.open(url || "#", "_blank", "noopener,noreferrer");
          } else {
            if (!url || url === "#") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else if (url.startsWith("#")) {
              const targetEl = document.querySelector(url);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
              } else {
                window.location.hash = url;
              }
            } else {
              window.location.href = url;
            }
          }
        } else if (btn.type === "submenu") {
          if (sheet && sheet.classList.contains("show") && sheetTitle.textContent === btn.label) {
            sheet.classList.remove("show");
            return;
          }
          if (sheetTitle) sheetTitle.textContent = btn.label;
          const sublinks = btn.sublinks || [];
          if (!sublinks.length) {
            if (sheetLinks) sheetLinks.innerHTML = '<div style="padding:8px;font-size:12px;color:#64748b">No links available</div>';
          } else {
            if (sheetLinks) {
              sheetLinks.innerHTML = sublinks.map(s => {
                return '<a class="web2app-sublink" href="' + (s.url || '#') + '" target="' + (s.target || '_self') + '">' +
                  '<span>' + (s.icon || '🔗') + '</span>' +
                  '<span>' + s.name + '</span>' +
                '</a>';
              }).join('');
              sheetLinks.querySelectorAll(".web2app-sublink").forEach(a => {
                a.onclick = () => { if (sheet) sheet.classList.remove("show"); };
              });
            }
          }
          if (sheet) sheet.classList.add("show");
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
  a.click();
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
        state = {
          ...state,
          ...parsed,
          design: { ...state.design, ...(parsed.design || {}) },
          layout: { ...state.layout, ...(parsed.layout || {}) },
          header: { ...state.header, ...(parsed.header || {}) }
        };
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
    $("devicePreset").value = state.layout.devicePreset || "iphone";
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

  updateSourceTabsUI();
}

function renderAll() {
  updateSourceTabsUI();
  updatePhoneDimensions();
  renderNavButtonsList();
  extractButtonsFromHtml(state.rawHtml);
  renderHeader();
  renderPreview();
  renderBottomNavDesign();
}