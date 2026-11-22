/**
 * Arcflow — Popup Settings Controller (Split-View + Iconly + Light/Dark UI)
 */

const DEFAULT_SETTINGS = {
  enabled: false,
  uiTheme: 'light',
  userChangedTheme: false,
  activationMode: 'always',
  edgeToEdge: false,
  bezelSize: 10,
  cornerRadius: 12,
  squareSidebarCorners: false,
  frameColor: '#ebecf7',
  framePreset: 'arc-lavender',
  insetContent: true,
  showInnerBorder: true,
  commandBarEnabled: true,
  openNewTabInCommandBar: true,
  commandBarPosition: 'spotlight',
  commandBarBlur: true,
  commandBarBlurRadius: 18,
  commandBarDarken: true,
  commandBarDarkness: 48,
  commandBarKeepText: true,
  compactCommandBar: false,
  copyURLToast: true,
  revealToolbarOnHover: true,
  sidebarMode: 'always',
  hidePinnedTabBorder: false,
  diaShortcutsEnabled: true,
  searchEngine: 'google'
};

const PRESET_INFO = {
  'arc-lavender':    { label: 'Arc Lavender', hex: '#ebecf7', mode: 'light' },
  frost:             { label: 'Frost White', hex: '#e8eaed', mode: 'light' },
  'warm-sand':       { label: 'Warm Sand', hex: '#f3ede4', mode: 'light' },
  'mint-sage':       { label: 'Mint Sage', hex: '#e6f2ec', mode: 'light' },
  'rose-quartz':     { label: 'Rose Quartz', hex: '#f6e8ee', mode: 'light' },
  'sky-breeze':      { label: 'Sky Breeze', hex: '#e5eff8', mode: 'light' },
  obsidian:          { label: 'Obsidian', hex: '#16161a', mode: 'dark' },
  glass:             { label: 'Liquid Glass', hex: '#141522', mode: 'dark' },
  'arc-navy':        { label: 'Arc Navy', hex: '#131926', mode: 'dark' },
  'warm-clay':       { label: 'Warm Clay', hex: '#221d1a', mode: 'dark' },
  'midnight-purple': { label: 'Midnight Purple', hex: '#1b1626', mode: 'dark' },
  'forest-night':    { label: 'Forest Night', hex: '#131f1c', mode: 'dark' },
  custom:            { label: 'Custom', hex: '#ebecf7', mode: 'light' }
};

const els = {
  welcomeView: document.getElementById('welcomeView'),
  settingsShell: document.getElementById('settingsShell'),
  bigPowerBtn: document.getElementById('bigPowerBtn'),
  dataUseConsent: document.getElementById('dataUseConsent'),
  headerPowerToggleBtn: document.getElementById('headerPowerToggleBtn'),
  railItems: document.querySelectorAll('.dia-rail-item'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  navBackBtn: document.getElementById('navBackBtn'),
  navForwardBtn: document.getElementById('navForwardBtn'),
  paneTitle: document.getElementById('paneTitle'),
  patchSearchInput: document.getElementById('patchSearchInput'),
  statusToast: document.getElementById('statusToast'),
  overviewView: document.getElementById('overviewView'),
  detailViews: document.querySelectorAll('.dia-detail-view'),
  groups: document.querySelectorAll('.dia-group'),
  drillRows: document.querySelectorAll('.dia-card-row.is-drillable'),

  // Overview Toggles & Controls
  bezelEnabledToggle: document.getElementById('bezelEnabledToggle'),
  bezelSummaryText: document.getElementById('bezelSummaryText'),
  quickThemeSelect: document.getElementById('quickThemeSelect'),
  edgeToEdgeToggle: document.getElementById('edgeToEdgeToggle'),
  framelessModeToggle: document.getElementById('framelessModeToggle'),
  revealToolbarOnHoverToggle: document.getElementById('revealToolbarOnHoverToggle'),
  copyURLToastToggle: document.getElementById('copyURLToastToggle'),
  sidebarModeSelect: document.getElementById('sidebarModeSelect'),
  hidePinnedTabBorderToggle: document.getElementById('hidePinnedTabBorderToggle'),
  commandBarToggle: document.getElementById('commandBarToggle'),
  groupDomainRow: document.getElementById('groupDomainRow'),
  tidyTabsRow: document.getElementById('tidyTabsRow'),
  diaShortcutsToggle: document.getElementById('diaShortcutsToggle'),

  // Detail 1: Bezel
  bezelSizeInput: document.getElementById('bezelSizeInput'),
  bezelSizeValue: document.getElementById('bezelSizeValue'),
  cornerRadiusInput: document.getElementById('cornerRadiusInput'),
  cornerRadiusValue: document.getElementById('cornerRadiusValue'),
  presetChips: document.querySelectorAll('.dia-preset-chip[data-preset]'),
  customColorInput: document.getElementById('customColorInput'),
  activationModeSelect: document.getElementById('activationModeSelect'),
  squareSidebarCornersToggle: document.getElementById('squareSidebarCornersToggle'),
  innerBorderToggle: document.getElementById('innerBorderToggle'),
  insetContentToggle: document.getElementById('insetContentToggle'),
  resetGeometryBtn: document.getElementById('resetGeometryBtn'),

  // Detail 2: Command Bar
  openNewTabInCommandBarToggle: document.getElementById('openNewTabInCommandBarToggle'),
  commandBarPositionSelect: document.getElementById('commandBarPositionSelect'),
  searchEngineSelect: document.getElementById('searchEngineSelect'),
  commandBarBlurToggle: document.getElementById('commandBarBlurToggle'),
  commandBarBlurRadiusInput: document.getElementById('commandBarBlurRadiusInput'),
  commandBarBlurRadiusValue: document.getElementById('commandBarBlurRadiusValue'),
  commandBarDarkenToggle: document.getElementById('commandBarDarkenToggle'),
  commandBarDarknessInput: document.getElementById('commandBarDarknessInput'),
  commandBarDarknessValue: document.getElementById('commandBarDarknessValue'),
  commandBarKeepTextToggle: document.getElementById('commandBarKeepTextToggle'),
  compactCommandBarToggle: document.getElementById('compactCommandBarToggle'),
  openPaletteNowBtn: document.getElementById('openPaletteNowBtn'),

  // Detail 3: Shortcuts
  configureShortcutsBtn: document.getElementById('configureShortcutsBtn')
};

let currentSettings = { ...DEFAULT_SETTINGS };
let navHistory = ['detail-bezel'];
let navIndex = 0;
let activeCategory = 'page';
let currentWindowState = null;
let arcflowActivated = false;
let showActivationSuccess = false;

function celebrateActivation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const card = document.querySelector('.dia-welcome-card');
  const heroHeight = card.querySelector('.dia-welcome-hero').offsetHeight;
  const colors = ['#0878f9', '#f9b800', '#00a661', '#ef4545'];
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement('span');
    piece.className = 'dia-confetti-piece';
    piece.setAttribute('aria-hidden', 'true');
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.left = `${4 + ((i * 37) % 92)}%`;
    card.appendChild(piece);
    const drift = (i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 4);
    const duration = 4300 + (i % 7) * 220;
    piece.animate([
      { transform: 'translateY(-10px) rotate(-20deg)', opacity: 0 },
      { transform: `translate(${drift * .2}px, ${heroHeight * .14}px) rotate(10deg)`, opacity: .85, offset: .2 },
      { transform: `translate(${drift * .6}px, ${heroHeight * .48}px) rotate(45deg)`, opacity: .85, offset: .65 },
      { transform: `translate(${drift}px, ${heroHeight * .76}px) rotate(80deg)`, opacity: 0 }
    ], { duration, delay: -(i / 24) * duration, iterations: Infinity });
  }
}
const isEmbeddedSettings = location.pathname.endsWith('/popup/embedded.html');

function closeSettingsView() {
  if (isEmbeddedSettings) window.parent.postMessage({ type: 'ARC_SETTINGS_CLOSE' }, '*');
  else window.close();
}

const VIEW_TITLES = {
  overview: 'Patches',
  'detail-bezel': 'Viewport Bezel & Corners',
  'detail-spotlight': 'Command Bar Overlay',
  'detail-shortcuts': 'Keyboard Shortcuts'
};

async function loadSettings() {
  try {
    const syncData = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...syncData };
  } catch {
    const localData = await chrome.storage.local.get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...localData };
  }
}

async function saveSettings(partial) {
  currentSettings = { ...currentSettings, ...partial };
  try {
    await chrome.storage.sync.set(partial);
  } catch {
    // Fallback
  }
  await chrome.storage.local.set(partial);
  renderSettings(currentSettings);

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id && activeTab.url && /^https?:\/\//i.test(activeTab.url)) {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: 'DIA_SETTINGS_UPDATED',
        settings: currentSettings
      });
    }
  } catch {
    // Ignore restricted pages
  }
}

let inlineToastTimer;
function showInlineToast(msg, kind = 'success') {
  els.statusToast.dataset.kind = kind;
  const badge = document.createElement('span');
  badge.className = 'dia-inline-toast-badge';
  badge.setAttribute('aria-hidden', 'true');
  const path = kind === 'error' ? '<path d="M6 6l12 12M18 6 6 18"/>' : kind === 'info' ? '<path d="M12 10v6M12 7h.01"/>' : '<path d="m5 12 4.5 4.5L19 7"/>';
  badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  els.statusToast.replaceChildren(badge, document.createTextNode(msg));
  els.statusToast.hidden = false;
  clearTimeout(inlineToastTimer);
  inlineToastTimer = setTimeout(() => {
    els.statusToast.hidden = true;
  }, 2400);
}

function applyUiTheme(theme) {
  const mode = theme || 'auto';
  document.documentElement.setAttribute('data-ui-theme', mode);
  const dark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  els.themeToggleBtn.querySelector('span').textContent = dark ? '☾' : '☀';
  els.themeToggleBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  els.themeToggleBtn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
}

function renderSettings(s) {
  applyUiTheme(s.uiTheme);

  const isEnabled = s.enabled !== false;
  if (els.welcomeView && els.settingsShell) {
    const fullscreen = currentWindowState?.state === 'fullscreen';
    const setupComplete = isEnabled && fullscreen && arcflowActivated;
    const success = setupComplete && showActivationSuccess;
    const successView = document.getElementById('activationSuccess');
    const newlyVisible = success && successView?.hidden;
    if (successView) successView.hidden = !success;
    document.body.classList.toggle('dia-onboarding', !setupComplete || success);
    els.welcomeView.hidden = setupComplete && !success;
    els.settingsShell.hidden = !setupComplete || success;
    document.getElementById('welcomeIntro').hidden = setupComplete;
    if (newlyVisible) {
      successView.querySelector('h1').focus();
      celebrateActivation();
    } else if (!success) {
      els.welcomeView.querySelectorAll('.dia-confetti-piece').forEach(piece => {
        piece.getAnimations().forEach(animation => animation.cancel());
        piece.remove();
      });
    }
  }


  els.bezelEnabledToggle.checked = !s.edgeToEdge && Number(s.bezelSize ?? 10) > 0;
  els.edgeToEdgeToggle.checked = Boolean(s.edgeToEdge);

  const pad = s.edgeToEdge ? 0 : Number(s.bezelSize ?? 10);
  const rad = s.edgeToEdge ? 0 : Number(s.cornerRadius ?? 12);
  const presetKey = s.framePreset || 'arc-lavender';
  const presetLabel = PRESET_INFO[presetKey]?.label || 'Arc Lavender';
  els.bezelSummaryText.textContent = `${pad}px padding • ${rad}pt radius • ${presetLabel}`;
  if (els.quickThemeSelect) {
    els.quickThemeSelect.value = PRESET_INFO[presetKey] ? presetKey : 'arc-lavender';
  }

  els.revealToolbarOnHoverToggle.checked = s.revealToolbarOnHover !== false;
  els.copyURLToastToggle.checked = s.copyURLToast !== false;
  els.sidebarModeSelect.value = s.sidebarMode || 'always';
  els.hidePinnedTabBorderToggle.checked = Boolean(s.hidePinnedTabBorder);
  els.commandBarToggle.checked = s.commandBarEnabled !== false;
  els.diaShortcutsToggle.checked = s.diaShortcutsEnabled !== false;

  // Detail 1: Bezel
  els.bezelSizeInput.value = String(s.bezelSize ?? 10);
  els.bezelSizeValue.textContent = `${s.bezelSize ?? 10} px`;
  els.cornerRadiusInput.value = String(s.cornerRadius ?? 12);
  els.cornerRadiusValue.textContent = `${s.cornerRadius ?? 12} pt`;
  els.customColorInput.value = s.frameColor || '#ebecf7';
  els.activationModeSelect.value = 'fullscreen';
  els.squareSidebarCornersToggle.checked = Boolean(s.squareSidebarCorners);
  els.innerBorderToggle.checked = s.showInnerBorder !== false;
  els.insetContentToggle.checked = Boolean(s.insetContent);

  els.presetChips.forEach((chip) => {
    chip.classList.toggle('is-active', chip.dataset.preset === presetKey);
  });

  // Detail 2: Command Bar
  els.openNewTabInCommandBarToggle.checked = s.openNewTabInCommandBar !== false;
  els.commandBarPositionSelect.value = s.commandBarPosition || 'spotlight';
  els.searchEngineSelect.value = s.searchEngine || 'google';
  els.commandBarBlurToggle.checked = s.commandBarBlur !== false;
  els.commandBarBlurRadiusInput.value = String(s.commandBarBlurRadius ?? 18);
  els.commandBarBlurRadiusValue.textContent = `${s.commandBarBlurRadius ?? 18} pt`;
  els.commandBarDarkenToggle.checked = s.commandBarDarken !== false;
  els.commandBarDarknessInput.value = String(s.commandBarDarkness ?? 48);
  els.commandBarDarknessValue.textContent = `${s.commandBarDarkness ?? 48} %`;
  els.commandBarKeepTextToggle.checked = s.commandBarKeepText !== false;
  els.compactCommandBarToggle.checked = Boolean(s.compactCommandBar);
}

function navigateToView(viewId, pushHistory = true) {
  if (pushHistory) {
    navHistory = navHistory.slice(0, navIndex + 1);
    navHistory.push(viewId);
    navIndex = navHistory.length - 1;
  }

  const isOverview = viewId === 'overview';
  els.overviewView.hidden = !isOverview;
  els.detailViews.forEach((dv) => {
    dv.hidden = dv.id !== viewId;
  });

  els.paneTitle.textContent = VIEW_TITLES[viewId] || 'Patches';
  els.navBackBtn.disabled = navIndex <= 0;
  els.navForwardBtn.disabled = navIndex >= navHistory.length - 1;
}

function applyCategoryAndSearch() {
  const query = (els.patchSearchInput.value || '').trim().toLowerCase();

  els.groups.forEach((group) => {
    const groupName = group.dataset.group;
    const categoryMatch = activeCategory === 'all' || activeCategory === groupName;
    if (!categoryMatch && !query) {
      group.classList.add('is-hidden');
      return;
    }

    const rows = group.querySelectorAll('.dia-card-row');
    let visibleRows = 0;

    rows.forEach((row) => {
      if (!query) {
        row.classList.remove('is-hidden');
        visibleRows++;
        return;
      }
      const text = row.textContent.toLowerCase();
      const kw = (row.getAttribute('data-keywords') || '').toLowerCase();
      const match = text.includes(query) || kw.includes(query);
      row.classList.toggle('is-hidden', !match);
      if (match) visibleRows++;
    });

    group.classList.toggle('is-hidden', visibleRows === 0);
  });
}

function updateActivationAvailability() {
  if (!els.bigPowerBtn || !els.dataUseConsent) return;
  const fullscreen = currentWindowState?.state === 'fullscreen';
  document.getElementById('fullscreenActivationHint').hidden = !fullscreen;
  els.bigPowerBtn.disabled = currentWindowState?.type !== 'normal' || fullscreen ||
    !els.dataUseConsent.checked || els.bigPowerBtn.classList.contains('is-activating');
}

async function syncWindowStateToggles() {
  try {
    const win = await chrome.windows.getCurrent();
    currentWindowState = win;
    const session = await chrome.storage.session.get(['arcflowActivated', 'arcflowWelcomeWindowId']);
    arcflowActivated = session.arcflowActivated === true;
    showActivationSuccess = session.arcflowWelcomeWindowId === win.id;
    els.framelessModeToggle.checked = win.state === 'fullscreen';
    renderSettings(currentSettings);
    updateActivationAvailability();
  } catch {
    // Ignore
  }
}

function bindEvents() {
  document.getElementById('continueBrowsing')?.addEventListener('click', async () => {
    await chrome.storage.session.remove('arcflowWelcomeWindowId');
    showActivationSuccess = false;
    renderSettings(currentSettings);
    closeSettingsView();
  });
  els.railItems.forEach((item) => {
    item.addEventListener('click', () => {
      els.railItems.forEach((i) => i.classList.remove('is-active'));
      item.classList.add('is-active');
      activeCategory = item.dataset.category || 'all';
      const detail = { page: 'detail-bezel', window: 'detail-spotlight', shortcuts: 'detail-shortcuts' }[activeCategory];
      navigateToView(detail || 'overview');
      els.paneTitle.textContent = item.textContent.trim();
      if (!detail) applyCategoryAndSearch();
    });
  });

  els.navBackBtn.addEventListener('click', () => {
    if (navIndex > 0) {
      navIndex--;
      navigateToView(navHistory[navIndex], false);
    }
  });

  els.navForwardBtn.addEventListener('click', () => {
    if (navIndex < navHistory.length - 1) {
      navIndex++;
      navigateToView(navHistory[navIndex], false);
    }
  });

  els.drillRows.forEach((row) => {
    if (!row.classList.contains('is-drillable')) return;
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-stop-prop="true"]')) return;
      const targetView = row.dataset.drill;
      if (targetView) {
        navigateToView(targetView, true);
      }
    });
  });

  els.patchSearchInput.addEventListener('input', () => {
    const query = els.patchSearchInput.value.trim().toLowerCase();
    const pageControls = document.getElementById('detail-bezel');
    const pageMatches = `${pageControls.textContent} ${Array.from(pageControls.querySelectorAll('[data-keywords]'), row => row.dataset.keywords).join(' ')}`.toLowerCase().includes(query);
    if (activeCategory === 'page' && (!query || pageMatches)) {
      navigateToView('detail-bezel', false);
      return;
    }
    if (navHistory[navIndex] !== 'overview') {
      navigateToView('overview', false);
    }
    applyCategoryAndSearch();
  });

  els.themeToggleBtn.addEventListener('click', async () => {
    const isDark = currentSettings.uiTheme === 'dark' || (currentSettings.uiTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const uiTheme = isDark ? 'light' : 'dark';
    const curInfo = PRESET_INFO[currentSettings.framePreset];
    const nextPreset = !curInfo || curInfo.mode !== uiTheme ? (uiTheme === 'light' ? 'arc-lavender' : 'obsidian') : currentSettings.framePreset;
    await saveSettings({ uiTheme, userChangedTheme: true, framePreset: nextPreset, frameColor: PRESET_INFO[nextPreset]?.hex || currentSettings.frameColor });
  });

  if (els.quickThemeSelect) {
    els.quickThemeSelect.addEventListener('change', async (e) => {
      const preset = e.target.value;
      if (preset === 'custom') {
        navigateToView('detail-bezel', true);
        return;
      }
      const info = PRESET_INFO[preset];
      if (!info) return;
      applyUiTheme(info.mode);
      await saveSettings({
        framePreset: preset,
        frameColor: info.hex,
        uiTheme: info.mode,
        userChangedTheme: true,
        edgeToEdge: false
      });
      showInlineToast(`Applied ${info.label} theme`);
    });
  }

  if (els.dataUseConsent && els.bigPowerBtn) {
    els.dataUseConsent.addEventListener('change', updateActivationAvailability);
    chrome.windows.onBoundsChanged.addListener(win => {
      if (win.id === currentWindowState?.id) void syncWindowStateToggles();
    });

    els.bigPowerBtn.addEventListener('click', async () => {
      if (els.bigPowerBtn.disabled) return;
      const errorEl = document.getElementById('setupError');
      errorEl.hidden = true;
      els.bigPowerBtn.disabled = true;
      els.bigPowerBtn.classList.add('is-activating');
      try {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise(resolve => setTimeout(resolve, 500));
        const win = await chrome.windows.getCurrent();
        const res = await chrome.runtime.sendMessage({ type: 'DIA_ACTIVATE_ARC', windowId: win.id });
        if (!res?.ok) throw new Error(res?.error || 'Could not enter full screen.');
        currentSettings = { ...currentSettings, enabled: true, activationMode: 'fullscreen' };
        await syncWindowStateToggles();
      } catch (err) {
        await syncWindowStateToggles();
        errorEl.textContent = err.message || 'Could not enter full screen.';
        errorEl.hidden = false;
      } finally {
        els.bigPowerBtn.classList.remove('is-activating');
        updateActivationAvailability();
      }
    });
  }

  async function turnOff() {
    if (els.dataUseConsent) els.dataUseConsent.checked = false;
    if (els.bigPowerBtn) els.bigPowerBtn.disabled = true;
    await chrome.runtime.sendMessage({ type: 'DIA_DEACTIVATE_ARC' });
    await saveSettings({ enabled: false });
    await syncWindowStateToggles();
    if (isEmbeddedSettings) closeSettingsView();
  }
  els.headerPowerToggleBtn.addEventListener('click', turnOff);

  els.bezelEnabledToggle.addEventListener('change', async (e) => {
    const on = e.target.checked;
    await saveSettings({
      edgeToEdge: !on,
      bezelSize: on ? Math.max(Number(currentSettings.bezelSize) || 10, 6) : currentSettings.bezelSize
    });
  });

  els.edgeToEdgeToggle.addEventListener('change', async (e) => {
    await saveSettings({ edgeToEdge: e.target.checked });
  });

  els.framelessModeToggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({ type: 'DIA_TOGGLE_FRAMELESS_WINDOW' });
    closeSettingsView();
  });

  els.revealToolbarOnHoverToggle.addEventListener('change', async (e) => {
    await saveSettings({ revealToolbarOnHover: e.target.checked });
  });

  els.copyURLToastToggle.addEventListener('change', async (e) => {
    await saveSettings({ copyURLToast: e.target.checked });
  });

  els.sidebarModeSelect.addEventListener('change', async (e) => {
    await saveSettings({ sidebarMode: e.target.value });
  });

  els.hidePinnedTabBorderToggle.addEventListener('change', async (e) => {
    await saveSettings({ hidePinnedTabBorder: e.target.checked });
  });

  els.commandBarToggle.addEventListener('change', async (e) => {
    await saveSettings({ commandBarEnabled: e.target.checked });
  });

  els.diaShortcutsToggle.addEventListener('change', async (e) => {
    await saveSettings({ diaShortcutsEnabled: e.target.checked });
  });

  els.groupDomainRow.addEventListener('click', async () => {
    const res = await chrome.runtime.sendMessage({ type: 'DIA_GROUP_TABS_BY_DOMAIN' });
    showInlineToast(res?.message || 'Grouped tabs by domain', res?.ok === false ? 'error' : res?.tabsGrouped === 0 ? 'info' : 'success');
  });

  els.tidyTabsRow.addEventListener('click', async () => {
    const res = await chrome.runtime.sendMessage({ type: 'DIA_TIDY_TABS' });
    showInlineToast(res?.message || 'Tidied open tabs by subject', res?.ok === false ? 'error' : res?.tabsGrouped === 0 ? 'info' : 'success');
  });

  // Detail 1: Bezel Geometry
  els.bezelSizeInput.addEventListener('input', (e) => {
    els.bezelSizeValue.textContent = `${e.target.value} px`;
  });

  els.bezelSizeInput.addEventListener('change', async (e) => {
    await saveSettings({ bezelSize: Number(e.target.value), edgeToEdge: false });
  });

  els.cornerRadiusInput.addEventListener('input', (e) => {
    els.cornerRadiusValue.textContent = `${e.target.value} pt`;
  });

  els.cornerRadiusInput.addEventListener('change', async (e) => {
    await saveSettings({ cornerRadius: Number(e.target.value), edgeToEdge: false });
  });

  els.presetChips.forEach((chip) => {
    chip.addEventListener('click', async () => {
      const preset = chip.dataset.preset;
      const info = PRESET_INFO[preset];
      const color = chip.dataset.color || info?.hex || '#ebecf7';
      const mode = chip.dataset.mode || info?.mode || 'light';
      applyUiTheme(mode);
      await saveSettings({
        framePreset: preset,
        frameColor: color,
        uiTheme: mode,
        userChangedTheme: true,
        edgeToEdge: false
      });
    });
  });

  els.customColorInput.addEventListener('input', async (e) => {
    await saveSettings({
      framePreset: 'custom',
      frameColor: e.target.value,
      userChangedTheme: true,
      edgeToEdge: false
    });
  });

  els.activationModeSelect.addEventListener('change', async (e) => {
    await saveSettings({ activationMode: e.target.value });
  });

  els.squareSidebarCornersToggle.addEventListener('change', async (e) => {
    await saveSettings({ squareSidebarCorners: e.target.checked });
  });

  els.innerBorderToggle.addEventListener('change', async (e) => {
    await saveSettings({ showInnerBorder: e.target.checked });
  });

  els.insetContentToggle.addEventListener('change', async (e) => {
    await saveSettings({ insetContent: e.target.checked });
  });

  els.resetGeometryBtn.addEventListener('click', async () => {
    applyUiTheme('light');
    await saveSettings({
      edgeToEdge: false,
      bezelSize: 10,
      cornerRadius: 12,
      squareSidebarCorners: false,
      framePreset: 'arc-lavender',
      frameColor: '#ebecf7',
      uiTheme: 'light',
      activationMode: 'always',
      showInnerBorder: true,
      insetContent: true
    });
    showInlineToast('Reset bezel geometry & theme to defaults');
  });

  // Detail 2: Command Bar
  els.openNewTabInCommandBarToggle.addEventListener('change', async (e) => {
    await saveSettings({ openNewTabInCommandBar: e.target.checked });
  });

  els.commandBarPositionSelect.addEventListener('change', async (e) => {
    await saveSettings({ commandBarPosition: e.target.value });
  });

  els.searchEngineSelect.addEventListener('change', async (e) => {
    await saveSettings({ searchEngine: e.target.value });
  });

  els.commandBarBlurToggle.addEventListener('change', async (e) => {
    await saveSettings({ commandBarBlur: e.target.checked });
  });

  els.commandBarBlurRadiusInput.addEventListener('input', (e) => {
    els.commandBarBlurRadiusValue.textContent = `${e.target.value} pt`;
  });

  els.commandBarBlurRadiusInput.addEventListener('change', async (e) => {
    await saveSettings({ commandBarBlurRadius: Number(e.target.value) });
  });

  els.commandBarDarkenToggle.addEventListener('change', async (e) => {
    await saveSettings({ commandBarDarken: e.target.checked });
  });

  els.commandBarDarknessInput.addEventListener('input', (e) => {
    els.commandBarDarknessValue.textContent = `${e.target.value} %`;
  });

  els.commandBarDarknessInput.addEventListener('change', async (e) => {
    await saveSettings({ commandBarDarkness: Number(e.target.value) });
  });

  els.commandBarKeepTextToggle.addEventListener('change', async (e) => {
    await saveSettings({ commandBarKeepText: e.target.checked });
  });

  els.compactCommandBarToggle.addEventListener('change', async (e) => {
    await saveSettings({ compactCommandBar: e.target.checked });
  });

  els.openPaletteNowBtn.addEventListener('click', async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.id == null) throw new Error('No active tab');
      const response = await chrome.tabs.sendMessage(activeTab.id, {
        type: 'DIA_TOGGLE_COMMAND_BAR',
        mode: 'command'
      });
      if (!response?.ok) throw new Error('Command bar unavailable');
      closeSettingsView();
    } catch {
      showInlineToast('Open the command bar from a regular webpage in Arcflow.', 'info');
    }
  });

  // Detail 3: Shortcuts
  els.configureShortcutsBtn.addEventListener('click', async () => {
    await chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    closeSettingsView();
  });
}

async function init() {
  if (isEmbeddedSettings) {
    document.body.classList.add('dia-embedded');
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') window.parent.postMessage({ type: 'ARC_SETTINGS_CLOSE' }, '*');
    });
  }
  currentSettings = await loadSettings();
  // Put detailed controls directly under their top-level category.
  document.querySelector('#detail-bezel .dia-card-stack').prepend(document.querySelector('[data-drill="detail-bezel"]'));
  document.querySelector('#detail-bezel .dia-card-stack').append(els.edgeToEdgeToggle.closest('.dia-card-row'));
  // The preset grid already controls the same theme as this overview dropdown.
  els.quickThemeSelect?.closest('.dia-card-row')?.remove();
  document.querySelector('#detail-spotlight .dia-card-stack').prepend(document.querySelector('[data-drill="detail-spotlight"]'));
  document.querySelector('#detail-shortcuts .dia-card-stack').prepend(document.querySelector('[data-drill="detail-shortcuts"]'));
  for (const id of ['groupDomainRow', 'tidyTabsRow']) document.querySelector('[data-group="tabs"] .dia-card-stack').append(document.getElementById(id));
  document.querySelectorAll('#detail-bezel [data-drill], #detail-spotlight [data-drill], #detail-shortcuts [data-drill]').forEach(row => { row.classList.remove('is-drillable'); row.querySelector('.dia-chevron-btn')?.remove(); });
  document.querySelectorAll('.dia-history-pill').forEach(el => el.hidden = true);
  await syncWindowStateToggles();
  bindEvents();
  navigateToView('detail-bezel', false);
  applyCategoryAndSearch();
  if (isEmbeddedSettings) window.parent.postMessage({ type: 'ARC_SETTINGS_READY' }, '*');
}

init();
