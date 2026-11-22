/**
 * Arcflow — Unified Viewport Bezel, Corner Mask & Window Geometry Controller
 *
 * Ensures the 4-sided viewport bezel (`--dia-frame-color`) and the left vertical sidebar
 * always share the exact same unified theme surface color (Cra / Arc continuous canvas).
 */

(() => {
  if (window.__workspaceFrameVersion) {
    try {
      if (typeof window.__workspaceFrameCleanup === 'function') {
        window.__workspaceFrameCleanup();
      }
    } catch {
      // Ignore cleanup errors
    }
    delete window.__workspaceFrameVersion;
    delete window.__diaFullscreenFrameLoaded;
    document.getElementById('dia-chrome-tweaks-frame-root')?.remove();
  }
  if (window.__diaFullscreenFrameLoaded) return;
  window.__diaFullscreenFrameLoaded = true;

  const DEFAULT_SETTINGS = {
    enabled: false,
    uiTheme: 'light',
    userChangedTheme: false,
    activationMode: 'always', // 'always' | 'fullscreen'
    edgeToEdge: false,        // _DPEdgeToEdgeEntry: 0px padding when true
    bezelSize: 10,
    cornerRadius: 12,
    squareSidebarCorners: false, // _DPSquareSidebarCornersEntry
    frameColor: '#ebecf7',
    framePreset: 'arc-lavender',
    insetContent: true,
    showInnerBorder: true
  };

  const PRESET_COLORS = {
    // Light themes
    'arc-lavender': '#ebecf7',
    frost: '#e8eaed',
    'warm-sand': '#f3ede4',
    'mint-sage': '#e6f2ec',
    'rose-quartz': '#f6e8ee',
    'sky-breeze': '#e5eff8',
    // Dark themes
    obsidian: '#16161a',
    glass: '#141522',
    'arc-navy': '#131926',
    'warm-clay': '#221d1a',
    'midnight-purple': '#1b1626',
    'forest-night': '#131f1c'
  };

  const LIGHT_PRESETS = new Set([
    'arc-lavender',
    'frost',
    'warm-sand',
    'mint-sage',
    'rose-quartz',
    'sky-breeze'
  ]);

  const DARK_PRESETS = new Set([
    'obsidian',
    'glass',
    'arc-navy',
    'warm-clay',
    'midnight-purple',
    'forest-night'
  ]);

  let currentSettings = { ...DEFAULT_SETTINGS };
  let isBrowserFullscreen = false;
  let frameRoot = null;

  function resolveEffectiveThemeMode(settings) {
    const mode = settings.uiTheme || 'light';
    if (mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }

  function resolveFrameColor(settings) {
    if (settings.framePreset === 'custom' && settings.frameColor) {
      return settings.frameColor;
    }

    const effectiveMode = resolveEffectiveThemeMode(settings);
    const preset = settings.framePreset || 'arc-lavender';

    // Keep bezel color 100% unified with the active Light/Dark UI theme
    if (effectiveMode === 'light') {
      if (LIGHT_PRESETS.has(preset)) {
        return PRESET_COLORS[preset];
      }
      return PRESET_COLORS['arc-lavender'];
    }

    if (effectiveMode === 'dark') {
      if (DARK_PRESETS.has(preset)) {
        return PRESET_COLORS[preset];
      }
      return PRESET_COLORS.obsidian;
    }

    return PRESET_COLORS[preset] || '#ebecf7';
  }

  function resolveBorderGlow(hexColor, showBorder) {
    if (!showBorder) return 'transparent';
    const clean = (hexColor || '#ebecf7').replace('#', '');
    if (clean.length === 6) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.6 ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)';
    }
    return 'rgba(0, 0, 0, 0.08)';
  }

  function ensureFrameDOM() {
    if (frameRoot && document.documentElement.contains(frameRoot)) {
      return frameRoot;
    }
    const existing = document.getElementById('dia-chrome-tweaks-frame-root');
    if (existing) {
      frameRoot = existing;
      return frameRoot;
    }

    const root = document.createElement('div');
    root.id = 'dia-chrome-tweaks-frame-root';
    root.setAttribute('aria-hidden', 'true');

    const edges = ['top', 'bottom', 'left', 'right'];
    for (const pos of edges) {
      const edge = document.createElement('div');
      edge.className = `dia-frame-edge dia-frame-edge--${pos}`;
      root.appendChild(edge);
    }

    const cutout = document.createElement('div');
    cutout.className = 'dia-frame-inner-cutout';
    root.appendChild(cutout);

    document.documentElement.appendChild(root);
    frameRoot = root;
    return frameRoot;
  }

  function applyFrameVariables() {
    const html = document.documentElement;
    if (!html) return;

    ensureFrameDOM();

    const color = resolveFrameColor(currentSettings);
    const glow = resolveBorderGlow(color, currentSettings.showInnerBorder);
    const effectiveBezel = currentSettings.edgeToEdge ? 0 : Number(currentSettings.bezelSize ?? 10);
    const effectiveRadius = currentSettings.edgeToEdge ? 0 : Number(currentSettings.cornerRadius ?? 12);

    html.style.setProperty('--dia-bezel-size', `${effectiveBezel}px`);
    html.style.setProperty('--dia-corner-radius', `${effectiveRadius}px`);
    html.style.setProperty('--dia-frame-color', color);
    html.style.setProperty('--dia-border-glow', glow);

    html.setAttribute('data-dia-edge-to-edge', currentSettings.edgeToEdge ? 'true' : 'false');
    html.setAttribute(
      'data-dia-square-sidebar-corners',
      currentSettings.squareSidebarCorners ? 'true' : 'false'
    );
    html.setAttribute(
      'data-dia-material',
      currentSettings.framePreset === 'glass' ? 'glass' : 'solid'
    );
    html.setAttribute(
      'data-dia-inset-content',
      currentSettings.insetContent ? 'true' : 'false'
    );

    const htmlElementFullscreen = Boolean(
      document.fullscreenElement || document.webkitFullscreenElement
    );

    const shouldActivate =
      currentSettings.enabled &&
      !htmlElementFullscreen &&
      !currentSettings.edgeToEdge &&
      isBrowserFullscreen;

    html.setAttribute('data-dia-bezel-active', shouldActivate ? 'true' : 'false');
  }

  async function syncWindowState() {

    try {
      const response = await chrome.runtime.sendMessage({ type: 'DIA_GET_WINDOW_STATE' });
      if (response && typeof response.isFullscreen === 'boolean') {
        isBrowserFullscreen = response.isFullscreen;
      }
    } catch {
      // Keep the previous confirmed state if the worker is unavailable.
    }
    applyFrameVariables();
  }

  async function init() {
    try {
      const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      currentSettings = { ...DEFAULT_SETTINGS, ...stored };
      if (!currentSettings.userChangedTheme && currentSettings.uiTheme === 'light' && DARK_PRESETS.has(currentSettings.framePreset)) {
        currentSettings.framePreset = 'arc-lavender';
        currentSettings.frameColor = '#ebecf7';
      }
    } catch {
      currentSettings = { ...DEFAULT_SETTINGS };
    }

    await syncWindowState();

    window.addEventListener('resize', () => {
      syncWindowState();
    }, { passive: true });

    document.addEventListener('fullscreenchange', () => {
      syncWindowState();
    });

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', () => {
      applyFrameVariables();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync' && area !== 'local') return;
      for (const [key, change] of Object.entries(changes)) {
        if (key in currentSettings && change.newValue !== undefined) {
          currentSettings[key] = change.newValue;
        }
      }
      applyFrameVariables();
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'DIA_WINDOW_STATE_CHANGED') {
        isBrowserFullscreen = Boolean(message.isFullscreen);
        applyFrameVariables();
        sendResponse({ ok: true });
      } else if (message?.type === 'DIA_SETTINGS_UPDATED' && message.settings) {
        currentSettings = { ...currentSettings, ...message.settings };
        applyFrameVariables();
        sendResponse({ ok: true });
      }
      return false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
