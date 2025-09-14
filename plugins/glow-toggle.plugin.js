/**
 * @name LuminaraGlowToggle
 * @version 1.0.0
 * @description Injects Luminara aura element and provides a persistent toggle + intensity setting.
 * @author you
 */

module.exports = class LuminaraGlowToggle {
  constructor() {
    this.initialized = false;
    this.name = "LuminaraGlowToggle";
    this.key = "LuminaraGlowToggle";
    this.defaultSettings = {
      enabled: true,
      intensity: "normal" // options: low, normal, high
    };
  }

  getName() { return this.name; }
  getVersion() { return "1.0.0"; }
  getAuthor() { return "you"; }
  getDescription() { return "Injects Luminara aura element and provides a persistent toggle + intensity."; }

  load() {}

  start() {
    try {
      this.settings = BdApi.loadData(this.key, "settings") || this.defaultSettings;
    } catch(e) {
      this.settings = this.defaultSettings;
    }

    this.createAura();
    this.injectToggleButton(); // small UI in bottom-left for quick toggling (optional)
    this.initialized = true;
  }

  stop() {
    this.removeAura();
    this.removeToggleButton();
    this.initialized = false;
  }

  createAura() {
    if (document.querySelector(".theme-auras.luminara")) {
      this.updateAuraAttributes();
      return;
    }
    const aura = document.createElement("div");
    aura.className = "theme-auras luminara";
    aura.setAttribute("data-origin", "LuminaraGlowToggle");
    aura.setAttribute("data-intensity", this.settings.intensity || "normal");
    if (!this.settings.enabled) aura.style.display = "none";
    document.body.appendChild(aura);
    this.aura = aura;
  }

  removeAura() {
    const el = document.querySelector(".theme-auras.luminara[data-origin='LuminaraGlowToggle']");
    if (el) el.remove();
    this.aura = null;
  }

  updateAuraAttributes() {
    const el = document.querySelector(".theme-auras.luminara[data-origin='LuminaraGlowToggle']");
    if (!el) return;
    el.setAttribute("data-intensity", this.settings.intensity || "normal");
    el.style.display = this.settings.enabled ? "" : "none";
  }

  // Quick floating toggle button for demo; the plugin settings UI below is the preferred way.
  injectToggleButton() {
    if (document.getElementById("luminara-glow-toggle-btn")) return;
    const btn = document.createElement("button");
    btn.id = "luminara-glow-toggle-btn";
    btn.innerText = this.settings.enabled ? "Luminara: ON" : "Luminara: OFF";
    Object.assign(btn.style, {
      position: "fixed",
      left: "12px",
      bottom: "12px",
      zIndex: 99999,
      padding: "6px 10px",
      borderRadius: "10px",
      backdropFilter: "blur(6px)",
      cursor: "pointer",
      border: "none",
      fontWeight: "600"
    });
    btn.addEventListener("click", () => {
      this.settings.enabled = !this.settings.enabled;
      this.saveSettings();
      this.updateAuraAttributes();
      btn.innerText = this.settings.enabled ? "Luminara: ON" : "Luminara: OFF";
    });
    document.body.appendChild(btn);
    this._toggleBtn = btn;
  }

  removeToggleButton() {
    if (this._toggleBtn) this._toggleBtn.remove();
    this._toggleBtn = null;
  }

  saveSettings() {
    try {
      BdApi.saveData(this.key, "settings", this.settings);
    } catch(e) {
      console.error("LuminaraGlowToggle: failed to save settings", e);
    }
  }

  /* Plugin Settings Panel shown in BetterDiscord's plugin settings area */
  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.padding = "10px";

    // Enabled toggle
    const enabledRow = document.createElement("div");
    enabledRow.style.marginBottom = "8px";
    const enabledLabel = document.createElement("label");
    enabledLabel.textContent = "Enable Luminara Glow: ";
    enabledLabel.style.marginRight = "8px";
    const enabledInput = document.createElement("input");
    enabledInput.type = "checkbox";
    enabledInput.checked = !!this.settings.enabled;
    enabledInput.addEventListener("change", () => {
      this.settings.enabled = enabledInput.checked;
      this.updateAuraAttributes();
      this.saveSettings();
      if (this._toggleBtn) this._toggleBtn.innerText = this.settings.enabled ? "Luminara: ON" : "Luminara: OFF";
    });
    enabledRow.appendChild(enabledLabel);
    enabledRow.appendChild(enabledInput);
    panel.appendChild(enabledRow);

    // Intensity select
    const intensityRow = document.createElement("div");
    intensityRow.style.marginBottom = "8px";
    const intensityLabel = document.createElement("label");
    intensityLabel.textContent = "Glow intensity: ";
    intensityLabel.style.marginRight = "8px";
    const intensitySelect = document.createElement("select");
    ["low","normal","high"].forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v[0].toUpperCase() + v.slice(1);
      if (this.settings.intensity === v) opt.selected = true;
      intensitySelect.appendChild(opt);
    });
    intensitySelect.addEventListener("change", () => {
      this.settings.intensity = intensitySelect.value;
      const el = document.querySelector(".theme-auras.luminara[data-origin='LuminaraGlowToggle']");
      if (el) el.setAttribute("data-intensity", this.settings.intensity);
      this.saveSettings();
    });
    intensityRow.appendChild(intensityLabel);
    intensityRow.appendChild(intensitySelect);
    panel.appendChild(intensityRow);

    // Reset button
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset to defaults";
    resetBtn.style.marginTop = "8px";
    resetBtn.addEventListener("click", () => {
      this.settings = Object.assign({}, this.defaultSettings);
      enabledInput.checked = this.settings.enabled;
      intensitySelect.value = this.settings.intensity;
      this.updateAuraAttributes();
      this.saveSettings();
      if (this._toggleBtn) this._toggleBtn.innerText = this.settings.enabled ? "Luminara: ON" : "Luminara: OFF";
    });
    panel.appendChild(resetBtn);

    return panel;
  }
};
