/**
 * Arcflow — Floating Arcflow Command Bar, Recreated Hover Vertical Sidebar,
 * Top-Edge Hover URL Pill, Copy URL Toast & Arcflow Keyboard Shortcut Engine
 *
 * Upgraded with:
 * - System typography across all UI surfaces
 * - Iconly 2px rounded stroke & duotone vector iconography
 * - Full Light & Dark UI mode support (Auto / Light / Dark)
 * - Hot-replacement support so reloading the extension updates open tabs cleanly
 */

(() => {
  const SCRIPT_VERSION = chrome.runtime.getManifest().version;
  if (window.__workspaceCommandVersion === SCRIPT_VERSION) return;

  if (typeof window.__workspaceCommandCleanup === 'function') {
    try {
      window.__workspaceCommandCleanup();
    } catch {
      // Ignore cleanup errors
    }
  }
  document.getElementById('dia-chrome-tweaks-command-host')?.remove();

  window.__workspaceCommandVersion = SCRIPT_VERSION;
  window.__diaCommandPaletteLoaded = true;

  const SEARCH_ENGINES = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    perplexity: 'https://www.perplexity.ai/search?q=',
    bing: 'https://www.bing.com/search?q='
  };

  const GROUP_COLOR_HEX = {
    blue: '#60a5fa',
    purple: '#a78bfa',
    cyan: '#22d3ee',
    green: '#34d399',
    yellow: '#fbbf24',
    orange: '#fb923c',
    pink: '#f472b6',
    red: '#f87171',
    grey: '#9ca3af'
  };

  // Iconly-style 2px rounded stroke + soft bulk accent vector icons
  const ICONLY = {
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11.5" cy="11.5" r="8.5" fill="currentColor" fill-opacity="0.12"></circle><circle cx="11.5" cy="11.5" r="8.5"></circle><path d="M17.8 17.8L21 21"></path></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.25 12.2743L19.25 12.2743"></path><path d="M10.2998 18.2987L4.2498 12.2747L10.2998 6.24969"></path></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.75 11.7257L4.75 11.7257"></path><path d="M13.7002 5.70131L19.7502 11.7253L13.7002 17.7503"></path></svg>`,
    reload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.0098 11.9999C20.0098 16.4209 16.4288 20.0019 12.0078 20.0019C7.58681 20.0019 4.00586 16.4209 4.00586 11.9999C4.00586 7.57886 7.58681 3.99792 12.0078 3.99792C14.7808 3.99792 17.2248 5.40792 18.6608 7.55192"></path><path d="M19.248 3.85498L18.882 7.82998L14.916 7.45498"></path></svg>`,
    windowFrame: `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10.5H5C3.1144 10.5 2.17155 10.5 1.5858 9.9142C1 9.32845 1 8.3856 1 6.5V5.5C1 3.61438 1 2.67157 1.5858 2.08578C2.17155 1.5 3.1144 1.5 5 1.5H7C8.88562 1.5 9.82842 1.5 10.4142 2.08578C11 2.67157 11 3.61438 11 5.5V6.5C11 8.3856 11 9.32845 10.4142 9.9142C9.82842 10.5 8.88562 10.5 7 10.5Z" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/><path d="M4.5 10.5V1.5" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/></svg>`,
    openWindow: `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10.5H5C3.1144 10.5 2.17155 10.5 1.5858 9.9142C1 9.32845 1 8.3856 1 6.5V5.5C1 3.61438 1 2.67157 1.5858 2.08578C2.17155 1.5 3.1144 1.5 5 1.5H7C8.88562 1.5 9.82842 1.5 10.4142 2.08578C11 2.67157 11 3.61438 11 5.5V6.5C11 8.3856 11 9.32845 10.4142 9.9142C9.82842 10.5 8.88562 10.5 7 10.5Z" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/><path d="M4.5 10.5V1.5" stroke="currentColor" stroke-width="0.85" stroke-linecap="round"/></svg>`,
    sidebarPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="4"></rect><path d="M9 4V20"></path><rect x="3" y="4" width="6" height="16" rx="2" fill="currentColor" fill-opacity="0.18" stroke="none"></rect></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="3.5" fill="currentColor" fill-opacity="0.14"></rect><rect x="4.5" y="10" width="15" height="10.5" rx="3.5"></rect><path d="M8 10V7.5C8 5.29086 9.79086 3.5 12 3.5C14.2091 3.5 16 5.29086 16 7.5V10"></path></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.10"></circle><circle cx="12" cy="12" r="9"></circle><path d="M3.6 9H20.4M3.6 15H20.4"></path><path d="M12 3C14.4 5.5 15.6 8.7 15.6 12C15.6 15.3 14.4 18.5 12 21C9.6 18.5 8.4 15.3 8.4 12C8.4 8.7 9.6 5.5 12 3Z"></path></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" fill="none"/><g fill="currentColor"><path d="M6.939 5.01c.57.044 1.122.216 1.619.503c.496.286.924.678 1.257 1.148l-1.63 1.157a2 2 0 0 0-.625-.573a1.8 1.8 0 0 0-1.564-.12c-.255.101-.49.26-.69.469l-1.75 1.848c-.355.391-.56.924-.555 1.486c.005.564.22 1.094.584 1.478c.362.383.841.59 1.33.594a1.85 1.85 0 0 0 1.333-.562l.308-.325a1 1 0 0 1 1.452 1.375l-.315.332l-.012.013A3.85 3.85 0 0 1 4.896 15a3.86 3.86 0 0 1-2.763-1.218A4.18 4.18 0 0 1 1 10.943a4.18 4.18 0 0 1 1.085-2.857l.012-.013l1.758-1.855a3.9 3.9 0 0 1 1.408-.953a3.8 3.8 0 0 1 1.676-.254"/><path d="M11.105 1a3.86 3.86 0 0 1 2.762 1.218A4.18 4.18 0 0 1 15 5.057a4.18 4.18 0 0 1-1.085 2.858l-.012.013l-1.758 1.854a3.9 3.9 0 0 1-1.408.953a3.8 3.8 0 0 1-3.295-.247a4 4 0 0 1-1.257-1.15l1.63-1.156c.17.24.386.434.626.573a1.79 1.79 0 0 0 1.563.12c.255-.1.49-.26.69-.469l1.751-1.847c.355-.391.56-.924.555-1.486a2.18 2.18 0 0 0-.584-1.48A1.86 1.86 0 0 0 11.086 3a1.85 1.85 0 0 0-1.334.564l-.313.328a1 1 0 0 1-1.447-1.38l.319-.334l.01-.01A3.85 3.85 0 0 1 11.104 1"/></g></svg>`,
    folderStack: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path fill="currentColor" fill-rule="evenodd" d="M16.7 15.77h.75c1.76 0 2.64 0 3.3-.36a3 3 0 0 0 1.23-1.22c.35-.66.35-1.54.35-3.3s0-2.64-.35-3.3a3 3 0 0 0-1.23-1.23c-.66-.35-1.54-.35-3.3-.35h-.52c-.7 0-1.06 0-1.4-.08a3 3 0 0 1-.7-.26c-.3-.16-.57-.39-1.1-.85c-.55-.45-.82-.68-1.12-.84a3 3 0 0 0-.7-.26c-.33-.08-.69-.08-1.4-.08h-.59A2.73 2.73 0 0 0 7.2 6.38V8.8l2.73 1.87h4.7l2.08 1.51z" clip-rule="evenodd" opacity=".2"/>
  <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
    <path d="M3.56 8.32h1.62c.46 0 .7 0 .91.04a3 3 0 0 1 1.25.49c.19.12.36.28.7.6c.33.3.5.47.68.6a3 3 0 0 0 1.25.48c.22.04.46.04.92.04h1.03c1.77 0 2.65 0 3.32.36a3 3 0 0 1 1.21 1.2c.36.68.36 1.56.36 3.33s0 2.66-.36 3.32A3 3 0 0 1 15.24 20c-.67.37-1.55.37-3.32.37H7.67c-2.83 0-4.25 0-5.12-.88s-.88-2.3-.88-5.12v-4.14c0-1.05.84-1.9 1.89-1.9"/>
    <path d="M16.87 15.77h.57c1.77 0 2.65 0 3.32-.36a3 3 0 0 0 1.21-1.21c.36-.67.36-1.55.36-3.32s0-2.66-.36-3.33a3 3 0 0 0-1.2-1.2c-.68-.37-1.56-.37-3.33-.37H16.4c-.46 0-.7 0-.92-.03a3 3 0 0 1-1.24-.5a6 6 0 0 1-.7-.59a6 6 0 0 0-.69-.6a3 3 0 0 0-1.25-.49c-.22-.03-.45-.03-.9-.03H9.07a1.9 1.9 0 0 0-1.9 1.9v3.05"/>
  </g>
</svg>`,
    folderAi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 20L6 20C4.3431 20 3 18.6569 3 17L3 7C3 5.3431 4.3431 4 6 4L8.6716 4C9.202 4 9.7107 4.2107 10.0858 4.5858L11.4142 5.9142C11.7893 6.2893 12.298 6.5 12.8284 6.5L18 6.5C19.6569 6.5 21 7.8431 21 9.5L21 11"/><path fill="currentColor" d="M18.5492 13.3739L19.1373 14.8648C19.3173 15.3213 19.6787 15.6827 20.1352 15.8627L21.6261 16.4508C21.8518 16.5397 22 16.7576 22 17C22 17.2424 21.8518 17.4603 21.6261 17.5492L20.1352 18.1373C19.6787 18.3173 19.3173 18.6787 19.1373 19.1352L18.5492 20.6261C18.4603 20.8518 18.2424 21 18 21C17.7576 21 17.5397 20.8518 17.4508 20.6261L16.8627 19.1352C16.6827 18.6787 16.3213 18.3173 15.8648 18.1373L14.3739 17.5492C14.1482 17.4603 14 17.2424 14 17C14 16.7576 14.1482 16.5397 14.3739 16.4508L15.8648 15.8627C16.3213 15.6827 16.6827 15.3213 16.8627 14.8648L17.4508 13.3739C17.5397 13.1482 17.7576 13 18 13C18.2424 13 18.4603 13.1482 18.5492 13.3739Z" stroke="none"/><path fill="currentColor" fill-opacity=".4" d="M12.8433 10.2337L13.2108 11.1655C13.3233 11.4508 13.5492 11.6767 13.8345 11.7892L14.7663 12.1567C14.9074 12.2123 15 12.3485 15 12.5C15 12.6515 14.9074 12.7877 14.7663 12.8433L13.8345 13.2108C13.5492 13.3233 13.3233 13.5492 13.2108 13.8345L12.8433 14.7663C12.7877 14.9074 12.6515 15 12.5 15C12.3485 15 12.2123 14.9074 12.1567 14.7663L11.7892 13.8345C11.6767 13.5492 11.4508 13.3233 11.1655 13.2108L10.2337 12.8433C10.0926 12.7877 10 12.6515 10 12.5C10 12.3485 10.0926 12.2123 10.2337 12.1567L11.1655 11.7892C11.4508 11.6767 11.6767 11.4508 11.7892 11.1655L12.1567 10.2337C12.2123 10.0926 12.3485 10 12.5 10C12.6515 10 12.7877 10.0926 12.8433 10.2337Z" stroke="none"/></g></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 20L6 20C4.3431 20 3 18.6569 3 17L3 7C3 5.3431 4.3431 4 6 4L8.6716 4C9.202 4 9.7107 4.2107 10.0858 4.5858L11.4142 5.9142C11.7893 6.2893 12.298 6.5 12.8284 6.5L18 6.5C19.6569 6.5 21 7.8431 21 9.5L21 11"/><path fill="currentColor" d="M18.5492 13.3739L19.1373 14.8648C19.3173 15.3213 19.6787 15.6827 20.1352 15.8627L21.6261 16.4508C21.8518 16.5397 22 16.7576 22 17C22 17.2424 21.8518 17.4603 21.6261 17.5492L20.1352 18.1373C19.6787 18.3173 19.3173 18.6787 19.1373 19.1352L18.5492 20.6261C18.4603 20.8518 18.2424 21 18 21C17.7576 21 17.5397 20.8518 17.4508 20.6261L16.8627 19.1352C16.6827 18.6787 16.3213 18.3173 15.8648 18.1373L14.3739 17.5492C14.1482 17.4603 14 17.2424 14 17C14 16.7576 14.1482 16.5397 14.3739 16.4508L15.8648 15.8627C16.3213 15.6827 16.6827 15.3213 16.8627 14.8648L17.4508 13.3739C17.5397 13.1482 17.7576 13 18 13C18.2424 13 18.4603 13.1482 18.5492 13.3739Z" stroke="none"/><path fill="currentColor" fill-opacity=".4" d="M12.8433 10.2337L13.2108 11.1655C13.3233 11.4508 13.5492 11.6767 13.8345 11.7892L14.7663 12.1567C14.9074 12.2123 15 12.3485 15 12.5C15 12.6515 14.9074 12.7877 14.7663 12.8433L13.8345 13.2108C13.5492 13.3233 13.3233 13.5492 13.2108 13.8345L12.8433 14.7663C12.7877 14.9074 12.6515 15 12.5 15C12.3485 15 12.2123 14.9074 12.1567 14.7663L11.7892 13.8345C11.6767 13.5492 11.4508 13.3233 11.1655 13.2108L10.2337 12.8433C10.0926 12.7877 10 12.6515 10 12.5C10 12.3485 10.0926 12.2123 10.2337 12.1567L11.1655 11.7892C11.4508 11.6767 11.6767 11.4508 11.7892 11.1655L12.1567 10.2337C12.2123 10.0926 12.3485 10 12.5 10C12.6515 10 12.7877 10.0926 12.8433 10.2337Z" stroke="none"/></g></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5C3 5.84315 4.34315 4.5 6 4.5H9.3C10.1 4.5 10.85 4.88 11.3 5.52L12.4 7.05C12.85 7.68 13.6 8.05 14.4 8.05H18C19.6569 8.05 21 9.39315 21 11.05V16.5C21 18.1569 19.6569 19.5 18 19.5H6C4.34315 19.5 3 18.1569 3 16.5V7.5Z" fill="currentColor" fill-opacity="0.15"></path></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19"></path><path d="M5 12H19"></path></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7L7 17"></path><path d="M7 7L17 17"></path></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3.5" fill="currentColor" fill-opacity="0.14"></rect><rect x="4" y="3" width="16" height="18" rx="3.5"></rect><path d="M8.5 8.5H15.5M8.5 12.5H15.5M8.5 16.5H12.5"></path></svg>`,
    maximize: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5.5C4.12 3 3 4.12 3 5.5V8M16 3H18.5C19.88 3 21 4.12 21 5.5V8M21 16V18.5C21 19.88 19.88 21 18.5 21H16M3 16V18.5C3 19.88 4.12 21 5.5 21H8"></path></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4L19.5 9L17.5 11L15 10.2L11.5 13.7L12.3 16.2L10.7 17.8L6.2 13.3L7.8 11.7L10.3 12.5L13.8 9L13 6.5L14.5 4Z" fill="currentColor" fill-opacity="0.16"></path><path d="M4.5 19.5L8.5 15.5"></path></svg>`,
    history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12C3.5 7.3 7.3 3.5 12 3.5C16.7 3.5 20.5 7.3 20.5 12C20.5 16.7 16.7 20.5 12 20.5C8.9 20.5 6.2 18.8 4.7 16.3"></path><polyline points="3.5 7.5 3.5 12 8 12"></polyline><polyline points="12 7.5 12 12 15 14"></polyline></svg>`,
    downloads: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.877a2 2 0 0 0 1.94-1.515L22 17"/></svg>`,
    palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3C7.03 3 3 6.8 3 11.5C3 16.2 7.03 20 12 20C13.38 20 14.5 18.88 14.5 17.5C14.5 16.86 14.26 16.28 13.86 15.84C13.48 15.42 13.25 14.88 13.25 14.25C13.25 12.87 14.37 11.75 15.75 11.75H17.5C19.43 11.75 21 10.18 21 8.25C21 5.35 16.97 3 12 3Z" fill="currentColor" fill-opacity="0.14"></path><circle cx="7.5" cy="10.5" r="1" fill="currentColor"></circle><circle cx="10.5" cy="7.5" r="1" fill="currentColor"></circle><circle cx="14.5" cy="7.5" r="1" fill="currentColor"></circle></svg>`
  };

  const THEME_PALETTES = {
    // Light themes
    'arc-lavender': { label: 'Arc Lavender', mode: 'light', hex: '#ebecf7', accent: '#5e5ce6' },
    frost:          { label: 'Frost White', mode: 'light', hex: '#e8eaed', accent: '#4f46e5' },
    'warm-sand':    { label: 'Warm Sand', mode: 'light', hex: '#f3ede4', accent: '#b45309' },
    'mint-sage':    { label: 'Mint Sage', mode: 'light', hex: '#e6f2ec', accent: '#059669' },
    'rose-quartz':  { label: 'Rose Quartz', mode: 'light', hex: '#f6e8ee', accent: '#db2777' },
    'sky-breeze':   { label: 'Sky Breeze', mode: 'light', hex: '#e5eff8', accent: '#0284c7' },
    // Dark themes
    obsidian:          { label: 'Obsidian', mode: 'dark', hex: '#16161a', accent: '#8b7cf8' },
    glass:             { label: 'Liquid Glass', mode: 'dark', hex: '#141522', accent: '#8b7cf8' },
    'arc-navy':        { label: 'Arc Navy', mode: 'dark', hex: '#131926', accent: '#60a5fa' },
    'warm-clay':       { label: 'Warm Clay', mode: 'dark', hex: '#221d1a', accent: '#fb923c' },
    'midnight-purple': { label: 'Midnight Purple', mode: 'dark', hex: '#1b1626', accent: '#c084fc' },
    'forest-night':    { label: 'Forest Night', mode: 'dark', hex: '#131f1c', accent: '#34d399' }
  };

  const THEME_CYCLE_ORDER = [
    'arc-lavender',
    'frost',
    'warm-sand',
    'mint-sage',
    'rose-quartz',
    'sky-breeze',
    'obsidian',
    'glass',
    'arc-navy',
    'warm-clay',
    'midnight-purple',
    'forest-night'
  ];

  let settings = {
    enabled: false,
    uiTheme: 'light', // Default light theme on first install until user changes manually
    userChangedTheme: false,
    framePreset: 'arc-lavender',
    frameColor: '#ebecf7',
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
    sidebarMode: 'always', // 'auto' | 'always' | 'pinned' | 'off'
    hidePinnedTabBorder: false,
    edgeToEdge: false,
    diaShortcutsEnabled: true,
    searchEngine: 'google'
  };

  let isOpen = false;
  let currentPaletteMode = 'command';
  let isSidebarHoverOpen = false;
  let isSidebarPinned = false;
  let isTopBarHoverOpen = false;
  let isFramelessWindow = false;
  let isFullscreenWindow = false;
  let activeTabId = null;

  let savedQueryText = '';
  let lastCloseWasEscape = false;
  let sidebarHideTimer = null;
  let settingsPanelOpen = false;
  let cleanupSettingsPanel = () => {};
  let topBarHideTimer = null;
  let toastTimer = null;
  let cleanupDownloadsView = () => {};

  let hostEl = null;
  let shadow = null;
  let backdropEl = null;
  let modalEl = null;
  let inputEl = null;
  let resultsEl = null;
  let modeBadgeEl = null;
  let footerEl = null;

  let leftHoverSensorEl = null;
  let sidebarEl = null;
  let sidebarWidth = 248;
  let sidebarResizeHandle = null;
  let cleanupSidebarResize = () => {};

  function setSidebarWidth(value) {
    sidebarWidth = Math.max(180, Math.min(480, Number(value) || 248));
    document.documentElement.style.setProperty('--arcflow-sidebar-width', `${sidebarWidth}px`);
    sidebarResizeHandle?.setAttribute('aria-valuenow', String(sidebarWidth));
  }
  let sidebarPinnedGridEl = null;
  let sidebarFoldersListEl = null;
  let sidebarTabsListEl = null;
  let sidebarUrlLabelEl = null;
  let sidebarPinBtnEl = null;
  let sidebarTabCountEl = null;
  let sbSectionLabelEl = null;
  let workspaceName = 'Workspace';

  let topHoverBarEl = null;
  let topHoverUrlEl = null;
  let topHoverUrlTextEl = null;

  let toastEl = null;
  let toastTextEl = null;

  let openTabs = [];
  let filteredItems = [];
  let selectedIndex = 0;

  function looksLikeUrl(input) {
    const trimmed = input.trim();
    if (!trimmed || /\s/.test(trimmed)) return false;
    if (/^(https?:\/\/|file:\/\/|chrome:\/\/|about:)/i.test(trimmed)) return true;
    if (/^localhost(:\d+)?(\/.*)?$/i.test(trimmed)) return true;
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(trimmed);
  }

  function normalizeDestination(input) {
    const trimmed = input.trim();
    if (/^[a-zA-Z]+:\/\//.test(trimmed) || trimmed.startsWith('about:')) {
      return trimmed;
    }
    if (/^localhost(:\d+)?(\/.*)?$/i.test(trimmed)) {
      return `http://${trimmed}`;
    }
    return `https://${trimmed}`;
  }

  function formatCleanHost(rawUrl) {
    try {
      const u = new URL(rawUrl || window.location.href);
      return u.hostname.replace(/^www\./, '') + (u.pathname && u.pathname !== '/' ? u.pathname : '');
    } catch {
      return window.location.hostname || 'New Tab';
    }
  }

  function setWorkspaceName(value) {
    workspaceName = String(value || '').trim().slice(0, 40) || 'Workspace';
    if (sbSectionLabelEl && sbSectionLabelEl.isConnected) {
      sbSectionLabelEl.textContent = workspaceName;
    }
  }

  function beginWorkspaceRename() {
    if (!sbSectionLabelEl || !sbSectionLabelEl.isConnected) return;
    const input = document.createElement('input');
    input.className = 'dia-sb-workspace-input';
    input.type = 'text';
    input.maxLength = 40;
    input.value = workspaceName;
    input.setAttribute('aria-label', 'Workspace name');
    sbSectionLabelEl.replaceWith(input);
    input.focus();
    input.select();

    let finished = false;
    const finish = async (save) => {
      if (finished) return;
      finished = true;
      const value = save ? input.value : workspaceName;
      setWorkspaceName(value);
      input.replaceWith(sbSectionLabelEl);
      if (save) {
        try {
          await chrome.storage.sync.set({ workspaceName });
        } catch {
          // The in-memory label remains usable if sync storage is unavailable.
        }
      }
    };

    input.addEventListener('blur', () => finish(true), { once: true });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        finish(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        finish(false);
      }
    });
  }

  function getDraggedTabId(event) {
    const value = event.dataTransfer?.getData('application/x-arcchrome-tab-id');
    const id = Number(value);
    return Number.isInteger(id) ? id : null;
  }

  function getDraggedFolderGroupId(event) {
    const value = event.dataTransfer?.getData('application/x-arcchrome-folder-group-id');
    const id = Number(value);
    return Number.isInteger(id) && id >= 0 ? id : null;
  }

  function hasDragType(event, type) {
    return Array.from(event.dataTransfer?.types || []).includes(type);
  }

  async function moveSidebarTab(tabId, folderGroupId = -1, windowId, index) {
    const result = await chrome.runtime.sendMessage({
      type: 'DIA_MOVE_TAB_TO_FOLDER',
      tabId,
      folderGroupId,
      windowId,
      index
    });
    if (!result?.ok) showToast('Could not move tab.', 'error');
  }

  async function moveSidebarFolder(groupId, parentGroupId = -1) {
    const result = await chrome.runtime.sendMessage({ type: 'DIA_MOVE_FOLDER', groupId, parentGroupId });
    if (!result?.ok) showToast(result?.error || 'Could not move folder.', 'error');
  }

  function buildShadowDOM() {
    if (hostEl && document.documentElement.contains(hostEl)) return;

    hostEl = document.createElement('div');
    hostEl.id = 'dia-chrome-tweaks-command-host';
    hostEl.style.all = 'initial';
    shadow = hostEl.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        --font-google: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif;

        /* Dark Mode Tokens (Default) */
        --surface-bg: rgba(20, 21, 28, 0.92);
        --surface-border: rgba(255, 255, 255, 0.13);
        --surface-shadow: 0 22px 54px rgba(0, 0, 0, 0.55);
        --surface-divider: rgba(255, 255, 255, 0.08);
        --item-bg: rgba(255, 255, 255, 0.06);
        --item-border: rgba(255, 255, 255, 0.09);
        --item-hover: rgba(255, 255, 255, 0.10);
        --item-active: rgba(255, 255, 255, 0.16);
        --active-card-bg: rgba(255, 255, 255, 0.14);
        --active-card-shadow: 0 2px 10px rgba(0, 0, 0, 0.28);
        --text-primary: #f5f6fa;
        --text-secondary: rgba(255, 255, 255, 0.76);
        --text-muted: rgba(255, 255, 255, 0.45);
        --accent: #8b7cf8;
        --accent-soft: rgba(139, 124, 248, 0.18);
        --accent-border: rgba(139, 124, 248, 0.42);
        --accent-text: #c4b5fd;
        --footer-bg: rgba(0, 0, 0, 0.24);
      }

      @media (prefers-color-scheme: light) {
        :host([data-ui-theme="auto"]) {
          --surface-bg: rgba(235, 236, 247, 0.95);
          --surface-border: rgba(0, 0, 0, 0.09);
          --surface-shadow: 0 20px 48px rgba(15, 23, 42, 0.16);
          --surface-divider: rgba(0, 0, 0, 0.07);
          --item-bg: rgba(0, 0, 0, 0.045);
          --item-border: rgba(0, 0, 0, 0.06);
          --item-hover: rgba(0, 0, 0, 0.065);
          --item-active: #ffffff;
          --active-card-bg: #ffffff;
          --active-card-shadow: 0 2px 8px rgba(15, 23, 42, 0.09);
          --text-primary: #18181b;
          --text-secondary: #3f3f46;
          --text-muted: #71717a;
          --accent: #5e5ce6;
          --accent-soft: rgba(94, 92, 230, 0.12);
          --accent-border: rgba(94, 92, 230, 0.32);
          --accent-text: #4f46e5;
          --footer-bg: rgba(0, 0, 0, 0.03);
        }
      }

      :host([data-ui-theme="light"]) {
        --surface-bg: rgba(235, 236, 247, 0.95);
        --surface-border: rgba(0, 0, 0, 0.09);
        --surface-shadow: 0 20px 48px rgba(15, 23, 42, 0.16);
        --surface-divider: rgba(0, 0, 0, 0.07);
        --item-bg: rgba(0, 0, 0, 0.045);
        --item-border: rgba(0, 0, 0, 0.06);
        --item-hover: rgba(0, 0, 0, 0.065);
        --item-active: #ffffff;
        --active-card-bg: #ffffff;
        --active-card-shadow: 0 2px 8px rgba(15, 23, 42, 0.09);
        --text-primary: #18181b;
        --text-secondary: #3f3f46;
        --text-muted: #71717a;
        --accent: #5e5ce6;
        --accent-soft: rgba(94, 92, 230, 0.12);
        --accent-border: rgba(94, 92, 230, 0.32);
        --accent-text: #4f46e5;
        --footer-bg: rgba(0, 0, 0, 0.03);
      }

      * {
        box-sizing: border-box;
        font-family: var(--font-google);
      }

      /* Left Edge Physical Hover Sensor Strip */
      .dia-left-edge-sensor {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 10px;
        z-index: 2147483645;
        pointer-events: auto;
      }

      .dia-left-edge-sensor.is-disabled {
        display: none;
        pointer-events: none;
      }

      /* =====================================================
         1. FLOATING COMMAND BAR (DPCommandBarOverlay)
         ===================================================== */
      .dia-backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(8, 8, 12, var(--dia-cb-darkness, 0.48));
        backdrop-filter: blur(var(--dia-cb-blur, 18px));
        -webkit-backdrop-filter: blur(var(--dia-cb-blur, 18px));
        z-index: 2147483647;
        display: none;
        align-items: flex-start;
        justify-content: center;
        padding-top: var(--dia-cb-top-offset, 15vh);
        opacity: 0;
        transition: opacity 130ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .dia-backdrop.is-open {
        display: flex;
        opacity: 1;
      }

      .dia-backdrop[data-position="center"] {
        align-items: center;
        padding-top: 0;
      }

      .dia-modal {
        width: min(650px, calc(100vw - 32px));
        background: var(--surface-bg);
        backdrop-filter: blur(28px) saturate(190%);
        -webkit-backdrop-filter: blur(28px) saturate(190%);
        border: 1px solid var(--surface-border);
        border-radius: 16px;
        box-shadow: var(--surface-shadow);
        color: var(--text-primary);
        overflow: hidden;
        transform: translateY(-8px) scale(0.985);
        transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .dia-backdrop.is-open .dia-modal {
        transform: translateY(0) scale(1);
      }

      .dia-input-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px 18px;
        border-bottom: 1px solid var(--surface-divider);
      }

      .dia-modal.is-compact .dia-input-row {
        padding: 10px 14px;
      }

      .dia-modal.is-switcher {
        width: min(480px, calc(100vw - 32px));
      }

      .dia-modal.is-switcher .dia-input-row {
        display: none;
      }

      .dia-modal.is-switcher .dia-results {
        max-height: min(420px, calc(100vh - 110px));
        padding: 10px;
      }

      .dia-switcher-heading {
        padding: 4px 12px 8px;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 650;
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      .dia-search-icon {
        width: 20px;
        height: 20px;
        color: var(--accent);
        flex-shrink: 0;
        display: flex;
      }

      .dia-search-icon svg {
        width: 20px;
        height: 20px;
      }

      .dia-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-size: 16px;
        font-weight: 500;
        line-height: 1.4;
        letter-spacing: -0.01em;
        font-family: var(--font-google);
      }

      .dia-input::placeholder {
        color: var(--text-muted);
        font-weight: 400;
      }

      .dia-mode-badge {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        padding: 3.5px 9px;
        border-radius: 7px;
        background: var(--accent-soft);
        color: var(--accent-text);
        border: 1px solid var(--accent-border);
        flex-shrink: 0;
      }

      .dia-results {
        max-height: 370px;
        overflow-y: auto;
        padding: 8px;
        scrollbar-width: thin;
        scrollbar-color: var(--item-border) transparent;
      }

      .dia-item {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 9px 12px;
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 80ms ease;
        user-select: none;
      }

      .dia-item.is-selected,
      .dia-item:hover {
        background: var(--item-hover);
      }

      .dia-item.is-selected {
        background: var(--item-active);
      }

      .dia-item-icon {
        width: 24px;
        height: 24px;
        border-radius: 7px;
        background: var(--item-bg);
        border: 1px solid var(--item-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
        color: var(--accent);
      }

      .dia-item-icon svg {
        width: 15px;
        height: 15px;
      }

      .dia-item-icon img {
        width: 15px;
        height: 15px;
        object-fit: contain;
      }

      .dia-item-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .dia-item-title {
        font-size: 13.5px;
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dia-group-pill {
        font-size: 10px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 99px;
        background: var(--accent-soft);
        color: var(--accent-text);
        flex-shrink: 0;
      }

      .dia-item-subtitle {
        font-size: 11.5px;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dia-item-shortcut {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-muted);
        background: var(--item-bg);
        border: 1px solid var(--item-border);
        padding: 2px 7px;
        border-radius: 6px;
        flex-shrink: 0;
      }

      .dia-item-close {
        width: 22px;
        height: 22px;
        border-radius: 0;
        border: none;
        background: transparent;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 100ms ease;
      }

      .dia-item-close svg {
        width: 24px;
        height: 24px;
      }

      .dia-item:hover .dia-item-close,
      .dia-item.is-selected .dia-item-close {
        opacity: 1;
      }

      .dia-item-close:hover {
        background: transparent;
        color: var(--text-muted);
      }

      .dia-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        background: var(--footer-bg);
        border-top: 1px solid var(--surface-divider);
        font-size: 11px;
        color: var(--text-muted);
      }

      .dia-modal.is-compact .dia-footer {
        display: none;
      }

      .dia-footer kbd {
        background: var(--item-bg);
        border: 1px solid var(--item-border);
        border-radius: 4px;
        padding: 1px 5px;
        font-family: var(--font-google);
        font-size: 10.5px;
        font-weight: 500;
        color: var(--text-secondary);
        margin: 0 2px;
      }

      /* =====================================================
         2. RECREATED HOVER / PINNED VERTICAL SIDEBAR (DPSidebar)
         ===================================================== */
      .dia-sidebar {
        position: fixed;
        top: 8px;
        bottom: 8px;
        left: 8px;
        width: var(--dia-sidebar-pinned-width, var(--arcflow-sidebar-width, 248px));
        background: var(--surface-bg);
        backdrop-filter: blur(28px) saturate(190%);
        -webkit-backdrop-filter: blur(28px) saturate(190%);
        border: 1px solid var(--surface-border);
        border-radius: 15px;
        box-shadow: var(--surface-shadow);
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        min-height: 0;
        color: var(--text-primary);
        transform: translateX(calc(-100% - 18px));
        opacity: 0;
        pointer-events: none;
        transition:
          transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 160ms ease;
        overflow: hidden;
      }

      .dia-sidebar.is-visible {
        transform: translateX(0);
        opacity: 1;
        pointer-events: auto;
      }

      .dia-sidebar.is-pinned {
        top: 0;
        bottom: 0;
        left: 0;
        width: var(--dia-sidebar-pinned-width, var(--arcflow-sidebar-width, 248px));
        border-radius: 0;
        border: none;
        background: var(--surface-solid, var(--surface-bg));
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        box-shadow: none;
        transform: translateX(0);
        opacity: 1;
        pointer-events: auto;
      }

      .dia-sb-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 10px 6px;
        gap: 4px;
      }

      .dia-sb-nav-group {
        display: flex;
        align-items: center;
        gap: 3px;
      }

      .dia-sb-icon-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 120ms ease, color 120ms ease;
      }

      .dia-sb-icon-btn svg {
        width: 16px;
        height: 16px;
      }

      .dia-sb-icon-btn:hover {
        background: var(--item-hover);
        color: var(--text-primary);
      }

      .dia-sb-icon-btn.is-active {
        background: var(--accent-soft);
        color: var(--accent);
      }

      .dia-sb-url-bar {
        margin: 4px 10px 8px;
        padding: 6px 10px;
        border-radius: 10px;
        background: var(--item-bg);
        border: 1px solid var(--item-border);
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease;
      }

      .dia-sb-url-bar:hover {
        background: var(--item-hover);
        border-color: var(--accent-border);
      }

      .dia-sb-url-lock {
        width: 15px;
        height: 15px;
        color: var(--text-muted);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dia-sb-url-lock svg {
        width: 14px;
        height: 14px;
      }

      .dia-sb-url-text {
        flex: 1;
        min-width: 0;
        font-size: 12.5px;
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Copy Link Button: Icon by default -> Sliding "Copy" text & color change on hover (no pill/padding) */
      .dia-sb-copy-btn {
        border: none;
        background: transparent;
        color: var(--text-secondary);
        border-radius: 0;
        padding: 0;
        font-size: 11.5px;
        font-weight: 500;
        cursor: pointer;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        transition: color 150ms ease;
      }

      .dia-sb-copy-btn svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .dia-sb-copy-btn .dia-copy-label {
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 0;
        transition:
          max-width 180ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 140ms ease,
          margin-left 140ms ease;
      }

      .dia-sb-copy-btn:hover {
        background: transparent;
        color: var(--accent-text);
        padding: 0;
      }

      .dia-sb-copy-btn.is-copied {
        background: transparent;
        color: #10b981;
        padding: 0;
      }

      .dia-sb-url-bar .dia-sb-copy-btn,
      .dia-top-url-pill .dia-sb-copy-btn {
        width: 26px;
        height: 26px;
        margin-left: auto;
        flex: 0 0 26px;
        border-radius: 7px;
        color: var(--accent);
      }

      .dia-sb-url-bar .dia-sb-copy-btn {
        width: auto;
        min-width: 26px;
        flex: 0 0 auto;
      }

      .dia-top-url-pill .dia-copy-label {
        display: inline-block;
      }

      .dia-sb-copy-btn:hover .dia-copy-label,
      .dia-sb-url-bar .dia-sb-copy-btn:focus-visible .dia-copy-label,
      .dia-sb-copy-btn.is-copied .dia-copy-label {
        max-width: 64px;
        opacity: 1;
        margin-left: 5px;
      }

      /* Pinned Tabs Grid (3-column macOS Arc layout) */
      .dia-sb-pinned-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 7px;
        padding: 0 10px 8px;
      }

      .dia-sb-pinned-grid:empty {
        display: none;
      }

      .dia-sb-pin-tile {
        height: 40px;
        border-radius: 10px;
        background: var(--item-bg);
        border: 1px solid var(--item-border);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-secondary);
        transition: background 120ms ease, transform 100ms ease, border-color 120ms ease;
      }

      .dia-sb-pin-tile svg {
        width: 17px;
        height: 17px;
      }

      .dia-sb-pin-tile:hover {
        background: var(--item-hover);
        transform: translateY(-1px);
      }

      .dia-sb-pin-tile.is-active {
        border-color: var(--accent);
        background: var(--active-card-bg);
        box-shadow: var(--active-card-shadow);
      }

      .dia-sidebar[data-hide-pin-border="true"] .dia-sb-pin-tile {
        border-color: transparent !important;
      }

      .dia-sb-pin-tile img {
        width: 17px;
        height: 17px;
        object-fit: contain;
      }

      /* Space Header & Smart "Tidy up" Action Bar */
      .dia-sb-tools {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 10px 4px;
      }

      .dia-sb-section-label {
        font-size: 11.5px;
        font-weight: 600;
        color: var(--text-muted);
        padding-left: 4px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: text;
        border-radius: 4px;
        outline-offset: 3px;
      }

      .dia-sb-workspace-input {
        width: min(140px, 55%);
        min-width: 60px;
        padding: 2px 4px;
        border: 1px solid var(--accent-border);
        border-radius: 5px;
        outline: none;
        background: var(--item-bg);
        color: var(--text-primary);
        font: inherit;
      }

      .dia-sb-tidy-btn {
        height: 26px;
        padding: 0 6px;
        border-radius: 999px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--accent);
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        transition:
          background 160ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 160ms ease,
          padding 160ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .dia-sb-tidy-btn svg {
        width: 15px;
        height: 15px;
        color: var(--accent);
        flex-shrink: 0;
      }

      .dia-sb-tidy-btn .dia-tidy-label {
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 0;
        color: inherit;
        transition:
          max-width 190ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 150ms ease,
          margin-left 150ms ease;
      }

      .dia-sb-tidy-btn:hover {
        background: var(--accent-soft);
        border-color: var(--accent-border);
        padding: 0 9px;
      }

      .dia-sb-tidy-btn:hover .dia-tidy-label {
        max-width: 72px;
        opacity: 1;
        margin-left: 5px;
      }

      /* Smart Folders Container (Above Divider Line, matching macOS Arc UI) */
      .dia-sb-folders-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0 8px;
      }

      .dia-sb-folders-list:empty {
        display: none;
      }

      /* Horizontal Divider + Flush "+ New Tab" Row Right Above Open Tabs */
      .dia-sb-divider {
        height: 1px;
        background: var(--surface-divider);
        margin: 5px 12px 3px;
        flex-shrink: 0;
      }

      .dia-sb-newtab-row {
        display: flex;
        align-items: center;
        padding: 0;
        flex-shrink: 0;
      }

      .dia-sb-newtab-btn {
        width: 100%;
        padding: 7px 16px;
        border-radius: 0;
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0;
        transition: background 120ms ease, color 120ms ease;
      }

      .dia-sb-newtab-btn svg {
        width: 15px;
        height: 15px;
        color: var(--text-muted);
        flex-shrink: 0;
        transition: color 120ms ease;
      }

      .dia-sb-newtab-btn .dia-newtab-label {
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        white-space: nowrap;
        margin-left: 0;
        transition:
          max-width 180ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 140ms ease,
          margin-left 140ms ease;
      }

      .dia-sb-newtab-btn:hover {
        background: var(--item-hover);
        color: var(--text-primary);
      }

      .dia-sb-newtab-btn:hover svg {
        color: var(--accent);
      }

      .dia-sb-newtab-btn:hover .dia-newtab-label {
        max-width: 90px;
        opacity: 1;
        margin-left: 9px;
      }

      /* Open Tabs List */
      .dia-sb-tabs {
        flex: 0 0 auto;
        overflow: visible;
        padding: 4px 8px 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        scrollbar-width: thin;
        scrollbar-color: var(--item-border) transparent;
      }

      .dia-sb-scroll-area {
        flex: 1 1 auto;
        min-height: 0;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: var(--item-border) transparent;
        display: flex;
        flex-direction: column;
      }

      .dia-sidebar.is-downloads .dia-sb-scroll-area {
        display: none;
      }

      .dia-sb-folder {
        margin-bottom: 3px;
        border-radius: 10px;
        background: transparent;
        overflow: hidden;
      }

      .dia-sb-folder.is-nested {
        margin-left: 13px;
        border-left: 1px solid var(--surface-divider);
        border-radius: 0 9px 9px 0;
      }

      .dia-sb-folder.is-drop-target .dia-sb-group-header,
      .dia-sb-tab.is-drop-target {
        background: var(--accent-soft);
        color: var(--text-primary);
      }

      .dia-sb-tab.is-dragging {
        opacity: 0.45;
      }

      .dia-sb-group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6.5px 9px;
        border-radius: 9px;
        font-size: 12.5px;
        font-weight: 550;
        color: var(--text-secondary);
        cursor: pointer;
        user-select: none;
        transition: background 100ms ease, color 100ms ease;
      }

      .dia-sb-group-header:hover {
        background: var(--item-hover);
        color: var(--text-primary);
      }

      .dia-sb-folder-icon {
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .dia-sb-folder-icon svg {
        width: 20px;
        height: 20px;
      }

      .dia-sb-folder-count {
        margin-left: auto;
        font-size: 10.5px;
        font-weight: 500;
        color: var(--text-muted);
      }
      .dia-sb-folder-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dia-sb-folder-count { flex-shrink: 0; }
      .dia-sb-resize-handle {
        position: absolute;
        inset: 0 0 0 auto;
        width: 10px;
        z-index: 2;
        cursor: col-resize;
        touch-action: none;
      }
      .dia-sb-folder-input {
        min-width: 0; width: 100%; padding: 2px 4px; border: 1px solid var(--accent);
        border-radius: 4px; outline: none; font: inherit; color: var(--text-primary); background: transparent;
      }

      .dia-sb-folder-items {
        display: flex;
        flex-direction: column;
        gap: 1px;
        padding: 2px 0 4px 12px;
      }

      .dia-sb-folder-reveal {
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows 200ms cubic-bezier(.25,.8,.4,1);
      }
      .dia-sb-folder.is-collapsed > .dia-sb-folder-reveal {
        grid-template-rows: 0fr;
      }
      .dia-sb-folder-clip {
        min-height: 0;
        overflow: clip;
      }
      .dia-sb-folder-chevron {
        width: 16px;
        height: 16px;
        flex: 0 0 16px;
        transition: transform 180ms ease-out;
      }
      .dia-sb-folder.is-collapsed > .dia-sb-group-header .dia-sb-folder-chevron {
        transform: rotate(180deg);
      }
      @media (prefers-reduced-motion: reduce) {
        .dia-sb-folder-reveal, .dia-sb-folder-chevron { transition: none; }
      }

      .dia-sb-tab {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 7.5px 10px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 12.5px;
        font-weight: 450;
        color: var(--text-secondary);
        transition: background 100ms ease, color 100ms ease, box-shadow 120ms ease;
      }

      .dia-sb-tab:hover {
        background: var(--item-hover);
        color: var(--text-primary);
      }

      /* Elevated Active Tab Card (matching macOS Arc screenshot) */
      .dia-sb-tab.is-active {
        background: var(--active-card-bg);
        box-shadow: var(--active-card-shadow);
        color: var(--text-primary);
        font-weight: 600;
      }

      .dia-sb-tab-fav {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
      }

      .dia-sb-tab-fav svg {
        width: 15px;
        height: 15px;
      }

      .dia-sb-tab-fav img {
        width: 15px;
        height: 15px;
        border-radius: 3px;
        object-fit: contain;
      }

      .dia-sb-tab-title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dia-sb-tab-close {
        width: 24px;
        height: 24px;
        padding: 0;
        flex: 0 0 24px;
        border-radius: 0;
        border: none;
        background: transparent;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 100ms ease;
      }

      .dia-sb-tab-close svg {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .dia-sb-tab:hover .dia-sb-tab-close {
        opacity: 1;
      }

      .dia-sb-tab-close:hover {
        background: transparent;
        color: var(--text-muted);
      }

      /* Bottom Utility Bar (macOS Arc Bottom Bar with Archive, Extensions Stack, and +) */
      .dia-sb-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px 8px;
        border-top: 1px solid var(--surface-divider);
      }

      .dia-sb-footer > .dia-sb-icon-btn {
        margin-left: auto;
      }

      /* =====================================================
         3. MINI-TOP HOVER URL PILL (Fullscreen / Top Hover Only)
            + Stacked Profile-Pic Extension Icons
         ===================================================== */
      .dia-top-hover-bar {
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translate(-50%, -80px);
        background: var(--surface-bg);
        backdrop-filter: blur(28px) saturate(190%);
        -webkit-backdrop-filter: blur(28px) saturate(190%);
        border: 1px solid var(--surface-border);
        border-radius: 999px;
        padding: 7px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: var(--surface-shadow);
        z-index: 2147483646;
        color: var(--text-primary);
        opacity: 0;
        pointer-events: none;
        transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 140ms ease;
      }

      .dia-top-hover-bar.is-visible {
        transform: translate(-50%, 0);
        opacity: 1;
        pointer-events: auto;
      }

      .dia-top-hover-bar .dia-sb-icon-btn {
        width: 34px;
        height: 34px;
        border-radius: 10px;
      }

      .dia-top-hover-bar .dia-sb-icon-btn svg {
        width: 18px;
        height: 18px;
      }

      .dia-top-url-pill {
        padding: 6.5px 16px;
        border-radius: 999px;
        background: var(--item-bg);
        border: 1px solid var(--item-border);
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        min-width: 280px;
        max-width: 420px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: background 120ms ease, border-color 120ms ease;
      }

      .dia-top-url-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dia-top-url-pill .dia-sb-copy-btn {
        width: auto;
        min-width: 26px;
        flex: 0 0 auto;
        border-left: 1px solid var(--surface-divider);
        border-radius: 0;
        padding-left: 10px;
      }

      .dia-top-url-pill svg {
        width: 15px;
        height: 15px;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .dia-top-url-pill:hover {
        background: var(--item-hover);
        border-color: var(--accent-border);
      }

      .dia-top-ext-divider {
        width: 1px;
        height: 20px;
        background: var(--surface-divider);
        flex-shrink: 0;
      }

      /* Stacked Avatar-Style Extension Icons with Equal Left/Right Gap on Hover */
      .dia-top-ext-tray {
        display: inline-flex;
        align-items: center;
        padding: 0 2px;
      }

      .dia-top-ext-tray:empty,
      .dia-top-ext-tray:empty + .dia-top-ext-divider {
        display: none;
      }

      .dia-top-ext-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid var(--surface-bg);
        background: var(--active-card-bg);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        margin-left: -8px;
        margin-right: 0;
        position: relative;
        z-index: 1;
        overflow: hidden;
        transition:
          margin-left 200ms cubic-bezier(0.16, 1, 0.3, 1),
          margin-right 200ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 180ms ease;
      }

      .dia-top-ext-btn:first-child {
        margin-left: 0;
      }

      .dia-top-ext-btn:hover {
        margin-left: 6px !important;
        margin-right: 6px !important;
        transform: scale(1.14);
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
      }

      .dia-top-ext-btn:first-child:hover {
        margin-left: 0 !important;
        margin-right: 6px !important;
      }

      .dia-top-ext-btn:last-child:hover {
        margin-right: 0 !important;
      }

      .dia-top-ext-btn img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }

      /* =====================================================
         4. FLOATING TOAST (DPCopyToastView)
         ===================================================== */
      .dia-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translate(-50%, 24px) scale(0.95);
        background: var(--surface-bg);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--surface-border);
        border-radius: 999px;
        padding: 9px 16px;
        display: flex;
        align-items: center;
        gap: 9px;
        box-shadow: var(--surface-shadow);
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 500;
        z-index: 2147483647;
        opacity: 0;
        pointer-events: none;
        transition:
          transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 150ms ease;
      }

      .dia-toast.is-visible {
        transform: translate(-50%, 0) scale(1);
        opacity: 1;
      }

      .dia-toast-badge {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #10b981;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dia-toast-badge svg {
        width: 13px;
        height: 13px;
      }
      .dia-toast[data-kind="error"] .dia-toast-badge { background: #e5484d; }
      .dia-toast[data-kind="info"] .dia-toast-badge { background: #3478f6; }
    `;

    // Left Edge Physical Sensor Strip
    leftHoverSensorEl = document.createElement('div');
    leftHoverSensorEl.className = 'dia-left-edge-sensor';
    leftHoverSensorEl.addEventListener('mouseenter', () => {
      if (settings.sidebarMode === 'off') return;
      if (sidebarHideTimer) clearTimeout(sidebarHideTimer);
      isSidebarHoverOpen = true;
      refreshSidebarTabs();
      updateSidebarVisibility();
    });

    // 1. Command Bar Overlay
    backdropEl = document.createElement('div');
    backdropEl.className = 'dia-backdrop';

    modalEl = document.createElement('div');
    modalEl.className = 'dia-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-label', 'Command Bar');

    const inputRow = document.createElement('div');
    inputRow.className = 'dia-input-row';
    const searchIconWrap = document.createElement('span');
    searchIconWrap.className = 'dia-search-icon';
    searchIconWrap.innerHTML = ICONLY.search;
    inputRow.appendChild(searchIconWrap);

    inputEl = document.createElement('input');
    inputEl.className = 'dia-input';
    inputEl.type = 'text';
    inputEl.placeholder = 'Type a command, search, URL, or switch tabs…';
    inputEl.autocomplete = 'off';
    inputEl.spellcheck = false;

    modeBadgeEl = document.createElement('span');
    modeBadgeEl.className = 'dia-mode-badge';
    modeBadgeEl.textContent = 'Command';

    inputRow.appendChild(inputEl);
    inputRow.appendChild(modeBadgeEl);

    resultsEl = document.createElement('div');
    resultsEl.className = 'dia-results';

    footerEl = document.createElement('div');
    footerEl.className = 'dia-footer';
    footerEl.innerHTML = `
      <span><kbd>↑</kbd><kbd>↓</kbd> Navigate &nbsp; <kbd>↵</kbd> Open &nbsp; <kbd>⌘↵</kbd> New Tab &nbsp; <kbd>⌘W</kbd> Close Tab</span>
      <span><kbd>⌘⇧C</kbd> Copy URL &nbsp; <kbd>Esc</kbd> Dismiss</span>
    `;

    modalEl.appendChild(inputRow);
    modalEl.appendChild(resultsEl);
    modalEl.appendChild(footerEl);
    backdropEl.appendChild(modalEl);

    // 2. Recreated Hover / Pinned Vertical Sidebar with system typography and Iconly
    sidebarEl = document.createElement('aside');
    sidebarEl.className = 'dia-sidebar';
    sidebarEl.setAttribute('aria-label', 'Vertical Tab Sidebar');

    const sbHeader = document.createElement('div');
    sbHeader.className = 'dia-sb-header';

    // Left: Sidebar Toggle Icon ([|] — toggles sidebar on tap instead of fullscreen/window mode)
    const sbLeftGroup = document.createElement('div');
    sbLeftGroup.className = 'dia-sb-nav-group';

    const framelessBtn = document.createElement('button');
    framelessBtn.className = 'dia-sb-icon-btn';
    framelessBtn.title = 'Toggle Vertical Sidebar (⌘S)';
    framelessBtn.innerHTML = ICONLY.openWindow;
    framelessBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebarFromIcon();
    });
    sidebarPinBtnEl = framelessBtn;

    sbLeftGroup.appendChild(framelessBtn);

    // Right: ← → ↻ Navigation buttons (Pointer 2: sidebar pin icon hidden)
    const sbNavGroup = document.createElement('div');
    sbNavGroup.className = 'dia-sb-nav-group';

    const backBtn = document.createElement('button');
    backBtn.className = 'dia-sb-icon-btn';
    backBtn.title = 'Back (⌘[)';
    backBtn.innerHTML = ICONLY.arrowLeft;
    backBtn.addEventListener('click', () => window.history.back());

    const fwdBtn = document.createElement('button');
    fwdBtn.className = 'dia-sb-icon-btn';
    fwdBtn.title = 'Forward (⌘])';
    fwdBtn.innerHTML = ICONLY.arrowRight;
    fwdBtn.addEventListener('click', () => window.history.forward());

    const reloadBtn = document.createElement('button');
    reloadBtn.className = 'dia-sb-icon-btn';
    reloadBtn.title = 'Reload Page (⌘R)';
    reloadBtn.innerHTML = ICONLY.reload;
    reloadBtn.addEventListener('click', () => window.location.reload());

    sbNavGroup.appendChild(backBtn);
    sbNavGroup.appendChild(fwdBtn);
    sbNavGroup.appendChild(reloadBtn);

    sbHeader.appendChild(sbLeftGroup);
    sbHeader.appendChild(sbNavGroup);

    // Clickable URL Pill in Sidebar
    const sbUrlBar = document.createElement('div');
    sbUrlBar.className = 'dia-sb-url-bar';
    sbUrlBar.title = 'Click to edit URL or search in Command Bar (⌘L)';

    const sbLock = document.createElement('span');
    sbLock.className = 'dia-sb-url-lock';
    sbLock.innerHTML = window.location.protocol === 'https:' ? ICONLY.lock : ICONLY.globe;

    sidebarUrlLabelEl = document.createElement('span');
    sidebarUrlLabelEl.className = 'dia-sb-url-text';
    sidebarUrlLabelEl.textContent = formatCleanHost(window.location.href);

    // Pointer 6: Copy URL icon by default -> Pill on hover -> Copied with tick on click
    const sbCopyBtn = document.createElement('button');
    sbCopyBtn.className = 'dia-sb-copy-btn';
    sbCopyBtn.title = 'Copy Current URL (⌘⇧C)';
    sbCopyBtn.setAttribute('aria-label', 'Copy current URL');
    sbCopyBtn.innerHTML = `${ICONLY.copy}<span class="dia-copy-label">Copy</span>`;
    sbCopyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyPageUrl('url', sbCopyBtn);
    });

    sbUrlBar.addEventListener('click', () => {
      openPalette('url');
    });

    sbUrlBar.appendChild(sbLock);
    sbUrlBar.appendChild(sidebarUrlLabelEl);
    sbUrlBar.appendChild(sbCopyBtn);

    // Pinned Tabs 3-Column Grid (matching macOS Arc reference)
    sidebarPinnedGridEl = document.createElement('div');
    sidebarPinnedGridEl.className = 'dia-sb-pinned-grid';

    // Pointer 1: Space Header + Folder AI Icon by default -> Pushes in "Tidy up" on hover
    const sbTools = document.createElement('div');
    sbTools.className = 'dia-sb-tools';

    sbSectionLabelEl = document.createElement('span');
    sbSectionLabelEl.className = 'dia-sb-section-label';
    sbSectionLabelEl.textContent = workspaceName;
    sbSectionLabelEl.title = 'Rename workspace';
    sbSectionLabelEl.tabIndex = 0;
    sbSectionLabelEl.setAttribute('role', 'button');
    sbSectionLabelEl.setAttribute('aria-label', 'Rename workspace');
    sbSectionLabelEl.addEventListener('click', beginWorkspaceRename);
    sbSectionLabelEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        beginWorkspaceRename();
      }
    });

    const tidyBtn = document.createElement('button');
    tidyBtn.className = 'dia-sb-tidy-btn';
    tidyBtn.title = 'Organize open tabs into folders (⌥⌘T)';
    tidyBtn.innerHTML = `${ICONLY.folderAi}<span class="dia-tidy-label">Organize</span>`;
    tidyBtn.addEventListener('click', () => runTidyTabs());

    sbTools.appendChild(sbSectionLabelEl);
    sbTools.appendChild(tidyBtn);

    // Smart Folders section (above the horizontal divider line, matching macOS Arc)
    sidebarFoldersListEl = document.createElement('div');
    sidebarFoldersListEl.className = 'dia-sb-folders-list';
    sidebarFoldersListEl.addEventListener('dragover', (event) => {
      if (hasDragType(event, 'application/x-arcchrome-folder-group-id')) event.preventDefault();
    });
    sidebarFoldersListEl.addEventListener('drop', async (event) => {
      if (event.target.closest('.dia-sb-folder')) return;
      const groupId = getDraggedFolderGroupId(event);
      if (groupId === null) return;
      event.preventDefault();
      await moveSidebarFolder(groupId, -1);
      await refreshSidebarTabs();
    });

    // Subtle 1px horizontal divider separating Space/Folders from "+ New Tab" & Open Tabs
    const sbDivider = document.createElement('div');
    sbDivider.className = 'dia-sb-divider';

    // Pointer 3 + macOS Arc placement: Flush "+ New Tab" row right above open tabs (icon by default, text on hover, 0 left/right container padding, no tab count)
    const sbNewTabRow = document.createElement('div');
    sbNewTabRow.className = 'dia-sb-newtab-row';

    const newTabBtn = document.createElement('button');
    newTabBtn.className = 'dia-sb-newtab-btn';
    newTabBtn.title = 'New Tab / Command Bar (⌘T)';
    newTabBtn.innerHTML = `${ICONLY.plus}<span class="dia-newtab-label">New Tab</span>`;
    newTabBtn.addEventListener('click', () => {
      openPalette('command');
    });

    sbNewTabRow.appendChild(newTabBtn);

    // Open Tabs List
    sidebarTabsListEl = document.createElement('div');
    sidebarTabsListEl.className = 'dia-sb-tabs';
    sidebarTabsListEl.addEventListener('dragover', (event) => {
      if (getDraggedTabId(event) !== null) event.preventDefault();
    });
    sidebarTabsListEl.addEventListener('drop', async (event) => {
      if (event.target.closest('.dia-sb-tab, .dia-sb-folder')) return;
      const tabId = getDraggedTabId(event);
      if (tabId === null) return;
      event.preventDefault();
      await moveSidebarTab(tabId, -1);
      await refreshSidebarTabs();
    });

    // Bottom Utility Bar: Downloads and Theme Palette on the left, New Tab on the right.
    const sbFooter = document.createElement('div');
    sbFooter.className = 'dia-sb-footer';

    const sbFooterLeft = document.createElement('div');
    sbFooterLeft.className = 'dia-sb-nav-group';

    const downloadsBtn = document.createElement('button');
    downloadsBtn.className = 'dia-sb-icon-btn';
    downloadsBtn.title = 'Downloads';
    downloadsBtn.setAttribute('aria-label', 'Show downloads');
    downloadsBtn.setAttribute('aria-pressed', 'false');
    downloadsBtn.innerHTML = ICONLY.downloads;
    const downloadHost = document.createElement('div');
    downloadHost.style.cssText = 'display:none; flex:1; min-height:0; overflow:hidden;';
    const downloadsShadow = downloadHost.attachShadow({ mode: 'closed' });
    downloadsShadow.innerHTML = `<style>
      :host{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--text-primary,#24252b)}
      *{box-sizing:border-box} .panel{height:100%;display:flex;flex-direction:column;padding:10px 10px 4px;gap:10px}
      .heading{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:650}
      button{font:inherit;cursor:pointer;color:inherit} .back{border:0;background:transparent;font-size:19px;padding:2px 5px;border-radius:6px}
      input{width:100%;border:1px solid rgba(120,120,135,.22);border-radius:9px;padding:8px;background:rgba(127,127,140,.09);color:inherit;font:inherit;font-size:12px;outline:none}
      .list{overflow-y:auto;min-height:0;flex:1} .item{padding:9px 2px;border-bottom:1px solid rgba(130,130,140,.15)}
      .item.is-openable{cursor:pointer;border-radius:8px}.item.is-openable:hover,.item.is-openable:focus-visible{background:rgba(127,127,140,.1);outline:none}
      .top{display:flex;gap:8px;align-items:center}.icon{width:28px;height:28px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:7px;background:rgba(127,127,140,.14);font-size:9px;font-weight:700;letter-spacing:.02em}.name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600;flex:1;min-width:0}
      .meta{font-size:11px;opacity:.7;margin:3px 0 0 36px;overflow-wrap:anywhere}.actions{display:flex;gap:3px;opacity:0;pointer-events:none;transition:opacity .12s}
      .item:hover .actions,.item:focus-within .actions{opacity:1;pointer-events:auto}
      .actions button{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border:0;border-radius:6px;padding:5px;background:transparent}.actions button:hover,.actions button:focus-visible{background:rgba(127,127,140,.18)}.actions svg{width:16px;height:16px}
      .empty{font-size:12px;opacity:.7;padding:12px 2px;line-height:1.5}.note{font-size:10px;opacity:.65;margin:0}
    </style><div class="panel"><div class="heading"><button class="back" type="button" aria-label="Back to tabs">←</button><span>Downloads</span></div><input type="search" aria-label="Search downloads" placeholder="Search downloads"><div class="list" aria-live="polite"></div><p class="note">Showing up to 200 downloads.</p></div>`;
    const downloadsList = downloadsShadow.querySelector('.list');
    const downloadsSearch = downloadsShadow.querySelector('input');
    const hiddenInDownloads = [sidebarPinnedGridEl, sbTools, sidebarFoldersListEl, sbDivider, sbNewTabRow, sidebarTabsListEl];
    let downloadsVisible = false;
    let downloadPoll = null;
    let downloadSearchTimer = null;
    let downloadRequest = 0;
    let lastDownloadRender = '';
    const refreshDownloads = async () => {
      const request = ++downloadRequest;
      try {
        const result = await chrome.runtime.sendMessage({ type: 'DIA_LIST_DOWNLOADS', query: downloadsSearch.value });
        if (!downloadsVisible || request !== downloadRequest) return;
        if (!result?.ok) throw new Error('Could not load downloads.');
        const signature = JSON.stringify(result.items);
        if (signature === lastDownloadRender) return;
        lastDownloadRender = signature;
        downloadsList.replaceChildren();
        if (!result.items.length) {
          const empty = document.createElement('p'); empty.className = 'empty';
          empty.textContent = downloadsSearch.value ? 'No matching downloads.' : 'Your downloads will appear here.';
          downloadsList.append(empty); return;
        }
        for (const item of result.items) {
          const row = document.createElement('div'); row.className = 'item';
          const top = document.createElement('div'); top.className = 'top';
          const name = document.createElement('span'); name.className = 'name';
          name.textContent = item.filename.split(/[\\/]/).pop() || 'Download'; name.title = name.textContent;
          const icon = document.createElement('span'); icon.className = 'icon';
          const extension = /\.([a-z0-9]{1,8})$/i.exec(name.textContent)?.[1];
          icon.textContent = extension ? extension.slice(0, 4).toUpperCase() : 'FILE';
          icon.setAttribute('aria-label', extension ? `${extension.toUpperCase()} file` : 'File');
          top.append(icon, name); row.append(top);
          const meta = document.createElement('div'); meta.className = 'meta';
          const unsafe = !['safe', 'accepted'].includes(item.danger);
          const date = item.startTime ? new Date(item.startTime).toLocaleDateString() : '';
          let state = item.state === 'complete' ? (item.exists === false ? 'File unavailable' : 'Completed') : item.state === 'interrupted' ? 'Interrupted' : item.paused ? 'Paused' : 'Downloading';
          if (unsafe) state = 'Blocked or flagged by Chrome';
          if (item.state === 'in_progress' && item.totalBytes > 0 && !unsafe) state += ` · ${Math.min(100, Math.round(item.bytesReceived / item.totalBytes * 100))}%`;
          meta.textContent = [state, date].filter(Boolean).join(' · '); row.append(meta);
          if (item.state === 'complete' && item.exists !== false && !unsafe) {
            const performAction = async (action) => {
              try {
                const response = await chrome.runtime.sendMessage({ type: 'DIA_DOWNLOAD_ACTION', id: item.id, action });
                if (!response?.ok) throw new Error();
              } catch { showToast('Could not access this download.', 'error'); }
            };
            row.classList.add('is-openable');
            row.setAttribute('role', 'button');
            row.setAttribute('tabindex', '0');
            row.setAttribute('aria-label', `Open ${name.textContent}`);
            row.addEventListener('click', () => performAction('open'));
            row.addEventListener('keydown', (event) => {
              if (event.target !== row || (event.key !== 'Enter' && event.key !== ' ')) return;
              event.preventDefault();
              performAction('open');
            });
            const actions = document.createElement('div'); actions.className = 'actions';
            for (const [action, label] of [['show', 'Show in Finder']]) {
              const button = document.createElement('button'); button.type = 'button';
              button.title = label; button.setAttribute('aria-label', `${label}: ${name.textContent}`);
              button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M19.99 8.46c.24.53.36.8.36 1.01a1 1 0 0 1-.6.91c-.19.1-.48.1-1.06.1H6.42c-.62 0-.92 0-1.17.15s-.37.43-.64.98L1.7 17.77l.38-11.31c.02-.82.04-1.23.29-1.5s.65-.32 1.46-.42l1.33-.16h2.33c.36 0 .54 0 .71.06s.3.18.58.41l2.43 2.06c.27.22.4.33.55.4c.16.05.33.06.67.07l6.32.24c.26.01.38.02.5.05a1 1 0 0 1 .52.35c.07.1.12.21.23.44" opacity=".2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.29 19.59h-3.6c-2.83 0-4.25 0-5.13-.88s-.87-2.3-.87-5.12V6.9a2.4 2.4 0 0 1 2.4-2.4h2.06c.51 0 .77 0 1.02.03a4 4 0 0 1 1.82.71c.2.15.4.32.77.66c.38.35.56.52.77.67a4 4 0 0 0 1.82.7c.25.04.5.04 1.02.04h4.45c1.7 0 3.07 1.37 3.07 3.07"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.8 10.42h6.87c2.67 0 4 0 4.6.87c.6.88.1 2.12-.89 4.6l-.46 1.17c-.49 1.23-.73 1.84-1.24 2.18c-.5.35-1.16.35-2.48.35H7.38c-2.59 0-3.88 0-4.48-.85c-.6-.86-.16-2.07.72-4.51l.42-1.17c.47-1.28.7-1.92 1.21-2.28c.52-.36 1.2-.36 2.56-.36z"/></svg>';
              button.addEventListener('click', (event) => {
                event.stopPropagation();
                performAction(action);
              });
              actions.append(button);
            }
            top.append(actions);
          }
          downloadsList.append(row);
        }
      } catch {
        if (downloadsVisible && request === downloadRequest) { downloadsList.textContent = 'Could not load downloads.'; lastDownloadRender = ''; }
      }
    };
    const setDownloadsVisible = (visible) => {
      downloadsVisible = visible;
      sidebarEl.classList.toggle('is-downloads', visible);
      if (visible) document.documentElement.setAttribute('data-dia-downloads-open', 'true');
      else document.documentElement.removeAttribute('data-dia-downloads-open');
      hiddenInDownloads.forEach(el => { el.style.display = visible ? 'none' : ''; });
      downloadHost.style.display = visible ? 'block' : 'none';
      downloadsBtn.classList.toggle('is-active', visible);
      downloadsBtn.setAttribute('aria-pressed', String(visible));
      downloadsBtn.setAttribute('aria-label', visible ? 'Return to tabs' : 'Show downloads');
      clearInterval(downloadPoll);
      if (visible) { lastDownloadRender = ''; refreshDownloads(); downloadPoll = setInterval(refreshDownloads, 3000); }
      else { downloadRequest++; downloadsList.replaceChildren(); downloadsSearch.value = ''; }
    };
    downloadsBtn.addEventListener('click', () => setDownloadsVisible(!downloadsVisible));
    downloadsShadow.querySelector('.back').addEventListener('click', () => setDownloadsVisible(false));
    downloadsSearch.addEventListener('input', () => { clearTimeout(downloadSearchTimer); downloadSearchTimer = setTimeout(refreshDownloads, 180); });
    cleanupDownloadsView = () => { downloadsVisible = false; document.documentElement.removeAttribute('data-dia-downloads-open'); downloadRequest++; clearInterval(downloadPoll); clearTimeout(downloadSearchTimer); };

    const themeCycleBtn = document.createElement('button');
    themeCycleBtn.className = 'dia-sb-icon-btn';
    themeCycleBtn.title = 'Cycle Space Theme Palette';
    themeCycleBtn.innerHTML = ICONLY.palette;
    themeCycleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleSpaceTheme();
    });

    sbFooterLeft.appendChild(downloadsBtn);
    sbFooterLeft.appendChild(themeCycleBtn);

    const quickAddBtn = document.createElement('button');
    quickAddBtn.className = 'dia-sb-icon-btn';
    quickAddBtn.title = 'New Tab / Command Bar (⌘T)';
    quickAddBtn.innerHTML = ICONLY.plus;
    quickAddBtn.addEventListener('click', () => {
      openPalette('command');
    });

    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'dia-sb-icon-btn';
    settingsBtn.title = 'Arcflow settings';
    settingsBtn.setAttribute('aria-label', 'Open Arcflow settings');
    settingsBtn.setAttribute('aria-expanded', 'false');
    settingsBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12.88v-1.76c0-1.04.85-1.9 1.9-1.9 1.81 0 2.55-1.28 1.64-2.85-.52-.9-.21-2.07.7-2.59l1.73-.99c.79-.47 1.81-.19 2.28.6l.11.19c.9 1.57 2.38 1.57 3.29 0l.11-.19c.47-.79 1.49-1.07 2.28-.6l1.73.99c.91.52 1.22 1.69.7 2.59-.91 1.57-.17 2.85 1.64 2.85 1.05 0 1.9.85 1.9 1.9v1.76c0 1.04-.85 1.9-1.9 1.9-1.81 0-2.55 1.28-1.64 2.85.52.9.21 2.07-.7 2.59l-1.73.99c-.79.47-1.81.19-2.28-.6l-.11-.19c-.9-1.57-2.38-1.57-3.29 0l-.11.19c-.47.79-1.49 1.07-2.28.6l-1.73-.99c-.91-.52-1.22-1.69-.7-2.59.91-1.57.17-2.85-1.64-2.85-1.05 0-1.9-.86-1.9-1.9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const settingsGroup = document.createElement('div');
    settingsGroup.className = 'dia-sb-nav-group';
    settingsGroup.append(quickAddBtn, settingsBtn);
    const panelHost = document.createElement('div');
    panelHost.style.cssText = 'position:fixed;z-index:2147483647;display:none;';
    const panelRoot = panelHost.attachShadow({ mode: 'closed' });
    panelRoot.innerHTML = '<style>:host{display:block}iframe{display:block;width:100%;height:100%;border:0;background:white;box-shadow:0 12px 38px rgba(0,0,0,.22);border-radius:12px}</style>';
    let settingsFrame = null;
    let panelGeneration = 0;
    let readyTimer = null;
    const closePanel = () => {
      panelGeneration++;
      settingsPanelOpen = false;
      clearTimeout(readyTimer);
      settingsFrame?.remove(); settingsFrame = null;
      panelHost.style.display = 'none';
      settingsBtn.classList.remove('is-active');
      settingsBtn.setAttribute('aria-expanded', 'false');
      isSidebarHoverOpen = sidebarEl.matches(':hover');
      updateSidebarVisibility();
    };
    const positionPanel = () => {
      const rect = settingsBtn.getBoundingClientRect();
      const width = Math.max(1, Math.min(560, window.innerWidth - 16));
      const height = Math.max(1, Math.min(490, window.innerHeight - 16));
      const left = Math.max(8, Math.min(rect.right + 8, window.innerWidth - width - 8));
      const top = Math.max(8, Math.min(rect.bottom - height, window.innerHeight - height - 8));
      Object.assign(panelHost.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
    };
    settingsBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      if (settingsPanelOpen) { closePanel(); return; }
      const generation = ++panelGeneration;
      settingsPanelOpen = true;
      if (sidebarHideTimer) clearTimeout(sidebarHideTimer);
      isSidebarHoverOpen = true; updateSidebarVisibility();
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const token = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
      try {
        const result = await chrome.runtime.sendMessage({ type: 'ARC_SETTINGS_TOKEN', token });
        if (generation !== panelGeneration) return;
        if (!result?.ok) throw new Error('Could not authorize settings');
        positionPanel(); panelHost.style.display = 'block';
        settingsFrame = document.createElement('iframe');
        settingsFrame.title = 'Arcflow settings';
        settingsFrame.src = chrome.runtime.getURL(`popup/embedded.html?token=${token}`);
        panelRoot.appendChild(settingsFrame);
        settingsBtn.classList.add('is-active'); settingsBtn.setAttribute('aria-expanded', 'true');
        readyTimer = setTimeout(async () => {
          if (generation !== panelGeneration) return;
          closePanel();
          try {
            const fallback = await chrome.runtime.sendMessage({ type: 'DIA_OPEN_EXTENSION', isSelf: true });
            if (!fallback?.ok) showToast('Open Arcflow from the Chrome toolbar.', 'info');
          } catch { showToast('Open Arcflow from the Chrome toolbar.', 'info'); }
        }, 4000);
      } catch { closePanel(); showToast('Could not open settings.', 'error'); }
    });
    const onSettingsMessage = (event) => {
      if (!settingsFrame || event.source !== settingsFrame.contentWindow || event.origin !== `chrome-extension://${chrome.runtime.id}`) return;
      if (event.data?.type === 'ARC_SETTINGS_READY') clearTimeout(readyTimer);
      if (event.data?.type === 'ARC_SETTINGS_CLOSE') closePanel();
    };
    const onSettingsOutside = (event) => { if (settingsPanelOpen && !event.composedPath().includes(hostEl)) closePanel(); };
    const onSettingsResize = () => { if (settingsPanelOpen) positionPanel(); };
    window.addEventListener('message', onSettingsMessage);
    window.addEventListener('resize', onSettingsResize);
    document.addEventListener('pointerdown', onSettingsOutside, true);
    cleanupSettingsPanel = () => { closePanel(); window.removeEventListener('message', onSettingsMessage); window.removeEventListener('resize', onSettingsResize); document.removeEventListener('pointerdown', onSettingsOutside, true); };

    sbFooter.appendChild(sbFooterLeft);
    sbFooter.appendChild(settingsGroup);
    shadow.appendChild(panelHost);

    const sbScrollArea = document.createElement('div');
    sbScrollArea.className = 'dia-sb-scroll-area';
    sbScrollArea.setAttribute('aria-label', 'Tabs and folders');
    sbScrollArea.appendChild(sidebarPinnedGridEl);
    sbScrollArea.appendChild(sbTools);
    sbScrollArea.appendChild(sidebarFoldersListEl);
    sbScrollArea.appendChild(sbDivider);
    sbScrollArea.appendChild(sbNewTabRow);
    sbScrollArea.appendChild(sidebarTabsListEl);

    sidebarEl.appendChild(sbHeader);
    sidebarEl.appendChild(sbUrlBar);
    sidebarEl.appendChild(sbScrollArea);
    sidebarEl.appendChild(downloadHost);
    sidebarEl.appendChild(sbFooter);

    sidebarResizeHandle = document.createElement('div');
    sidebarResizeHandle.className = 'dia-sb-resize-handle';
    sidebarResizeHandle.tabIndex = 0;
    sidebarResizeHandle.setAttribute('role', 'separator');
    sidebarResizeHandle.setAttribute('aria-label', 'Resize sidebar');
    sidebarResizeHandle.setAttribute('aria-orientation', 'vertical');
    sidebarResizeHandle.setAttribute('aria-valuemin', '180');
    sidebarResizeHandle.setAttribute('aria-valuemax', '480');
    setSidebarWidth(sidebarWidth);
    sidebarEl.appendChild(sidebarResizeHandle);

    const saveSidebarWidth = () => chrome.storage.sync.set({ sidebarWidth }).catch(() => {});
    let resizeStart = null;
    sidebarResizeHandle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || resizeStart) return;
      event.preventDefault();
      clearTimeout(sidebarHideTimer);
      resizeStart = {
        pointerId: event.pointerId,
        x: event.clientX,
        width: sidebarWidth,
        scale: sidebarEl.classList.contains('is-downloads') ? 1.15 : 1
      };
      sidebarResizeHandle.setPointerCapture(event.pointerId);
      sidebarResizeHandle.classList.add('is-dragging');
      document.documentElement.setAttribute('data-arcflow-sidebar-resizing', '');
    });
    const moveSidebarEdge = event => {
      if (event.pointerId !== resizeStart?.pointerId) return;
      const delta = (event.clientX - resizeStart.x) / resizeStart.scale;
      setSidebarWidth(Math.round(resizeStart.width + delta));
    };
    const finishSidebarResize = event => {
      if (event.pointerId !== resizeStart?.pointerId) return;
      if (event.type === 'pointerup') moveSidebarEdge(event);
      resizeStart = null;
      sidebarResizeHandle.classList.remove('is-dragging');
      document.documentElement.removeAttribute('data-arcflow-sidebar-resizing');
      void saveSidebarWidth();
    };
    window.addEventListener('pointermove', moveSidebarEdge, true);
    window.addEventListener('pointerup', finishSidebarResize, true);
    window.addEventListener('pointercancel', finishSidebarResize, true);
    sidebarResizeHandle.addEventListener('lostpointercapture', finishSidebarResize);
    cleanupSidebarResize = () => {
      window.removeEventListener('pointermove', moveSidebarEdge, true);
      window.removeEventListener('pointerup', finishSidebarResize, true);
      window.removeEventListener('pointercancel', finishSidebarResize, true);
    };
    sidebarResizeHandle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      event.stopPropagation();
      setSidebarWidth(sidebarWidth + (event.key === 'ArrowRight' ? 10 : -10));
      void saveSidebarWidth();
    });

    sidebarEl.addEventListener('mouseenter', () => {
      if (sidebarHideTimer) clearTimeout(sidebarHideTimer);
      isSidebarHoverOpen = true;
      updateSidebarVisibility();
    });

    sidebarEl.addEventListener('mouseleave', () => {
      if (sidebarHideTimer) clearTimeout(sidebarHideTimer);
      sidebarHideTimer = setTimeout(() => {
        if (sidebarResizeHandle?.classList.contains('is-dragging')) return;
        if (settingsPanelOpen) return;
        isSidebarHoverOpen = false;
        updateSidebarVisibility();
      }, 220);
    });

    // 3. Top-Edge Hover URL Pill (Pointer 5: +25% size, installed extensions tray, Open Window icon)
    topHoverBarEl = document.createElement('div');
    topHoverBarEl.className = 'dia-top-hover-bar';

    const topBackBtn = document.createElement('button');
    topBackBtn.className = 'dia-sb-icon-btn';
    topBackBtn.innerHTML = ICONLY.arrowLeft;
    topBackBtn.title = 'Back';
    topBackBtn.addEventListener('click', () => window.history.back());

    const topReloadBtn = document.createElement('button');
    topReloadBtn.className = 'dia-sb-icon-btn';
    topReloadBtn.innerHTML = ICONLY.reload;
    topReloadBtn.title = 'Reload';
    topReloadBtn.addEventListener('click', () => window.location.reload());

    topHoverUrlEl = document.createElement('div');
    topHoverUrlEl.className = 'dia-top-url-pill';
    topHoverUrlEl.title = 'Click to open Command Bar (⌘L)';
    const topUrlLock = document.createElement('span');
    topUrlLock.className = 'dia-sb-url-lock';
    topUrlLock.innerHTML = window.location.protocol === 'https:' ? ICONLY.lock : ICONLY.globe;
    topHoverUrlTextEl = document.createElement('span');
    topHoverUrlTextEl.className = 'dia-top-url-text';
    topHoverUrlTextEl.textContent = formatCleanHost(window.location.href);
    topHoverUrlEl.addEventListener('click', () => openPalette('url'));
    topHoverUrlEl.appendChild(topUrlLock);
    topHoverUrlEl.appendChild(topHoverUrlTextEl);

    const topCopyBtn = document.createElement('button');
    topCopyBtn.className = 'dia-sb-copy-btn';
    topCopyBtn.title = 'Copy Current URL (⌘⇧C)';
    topCopyBtn.innerHTML = `${ICONLY.copy}<span class="dia-copy-label">Copy</span>`;
    topCopyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyPageUrl('url', topCopyBtn);
    });
    topHoverUrlEl.appendChild(topCopyBtn);

    const topExtDivider = document.createElement('span');
    topExtDivider.className = 'dia-top-ext-divider';

    const topExtTray = document.createElement('div');
    topExtTray.className = 'dia-top-ext-tray';
    topExtTray.id = 'dia-top-ext-tray';

    const topFramelessBtn = document.createElement('button');
    topFramelessBtn.className = 'dia-sb-icon-btn';
    topFramelessBtn.innerHTML = ICONLY.openWindow;
    topFramelessBtn.title = 'Toggle Vertical Sidebar (⌘S)';
    topFramelessBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebarFromIcon();
    });

    topHoverBarEl.appendChild(topBackBtn);
    topHoverBarEl.appendChild(topReloadBtn);
    topHoverBarEl.appendChild(topHoverUrlEl);
    topHoverBarEl.appendChild(topExtTray);
    topHoverBarEl.appendChild(topExtDivider);
    topHoverBarEl.appendChild(topFramelessBtn);

    topHoverBarEl.addEventListener('mouseenter', () => {
      if (topBarHideTimer) clearTimeout(topBarHideTimer);
      isTopBarHoverOpen = true;
      topHoverBarEl.classList.add('is-visible');
    });

    topHoverBarEl.addEventListener('mouseleave', () => {
      if (topBarHideTimer) clearTimeout(topBarHideTimer);
      topBarHideTimer = setTimeout(() => {
        isTopBarHoverOpen = false;
        topHoverBarEl.classList.remove('is-visible');
      }, 250);
    });

    // 4. Floating Toast (DPCopyToastView)
    toastEl = document.createElement('div');
    toastEl.className = 'dia-toast';
    toastEl.innerHTML = `<span class="dia-toast-badge">${ICONLY.check}</span><span class="dia-toast-text">Copied current URL</span>`;
    toastTextEl = toastEl.querySelector('.dia-toast-text');

    shadow.appendChild(style);
    shadow.appendChild(leftHoverSensorEl);
    shadow.appendChild(sidebarEl);
    shadow.appendChild(topHoverBarEl);
    shadow.appendChild(backdropEl);
    shadow.appendChild(toastEl);
    document.documentElement.appendChild(hostEl);

    // Command Bar Event Listeners
    backdropEl.addEventListener('mousedown', (e) => {
      if (e.target === backdropEl) {
        closePalette(false);
      }
    });

    inputEl.addEventListener('input', () => {
      selectedIndex = 0;
      renderResults();
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closePalette(true);
        return;
      }
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        if (filteredItems.length > 0) {
          selectedIndex = (selectedIndex + 1) % filteredItems.length;
          updateSelectionVisuals();
        }
        return;
      }
      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        if (filteredItems.length > 0) {
          selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
          updateSelectionVisuals();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') {
        const chosen = filteredItems[selectedIndex];
        if (chosen && chosen.kind === 'tab' && chosen.tabId) {
          e.preventDefault();
          e.stopPropagation();
          closeTabFromList(chosen.tabId);
          return;
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const openInNewTab = e.metaKey || e.ctrlKey;
        executeSelected(openInNewTab);
      }
    });

    applyCommandBarStyles();
    updateSidebarVisibility();
  }

  function computeColorLuminance(hexColor) {
    const clean = (hexColor || '#ebecf7').replace('#', '');
    if (clean.length === 6) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    return 0.9;
  }

  function resolveUnifiedPalette() {
    const rawTheme = settings.uiTheme || 'light';
    const effectiveMode =
      rawTheme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : rawTheme;

    const preset = settings.framePreset || (effectiveMode === 'light' ? 'arc-lavender' : 'obsidian');

    if (preset === 'custom' && settings.frameColor) {
      const lum = computeColorLuminance(settings.frameColor);
      return {
        mode: lum > 0.55 ? 'light' : 'dark',
        hex: settings.frameColor,
        accent: lum > 0.55 ? '#5e5ce6' : '#8b7cf8',
        label: 'Custom'
      };
    }

    const entry = THEME_PALETTES[preset];
    if (entry && entry.mode === effectiveMode) {
      return entry;
    }

    return effectiveMode === 'light'
      ? THEME_PALETTES['arc-lavender']
      : THEME_PALETTES.obsidian;
  }

  function applyCommandBarStyles() {
    if (!hostEl || !backdropEl || !modalEl) return;

    const palette = resolveUnifiedPalette();
    hostEl.setAttribute('data-ui-theme', palette.mode);

    // Ensure the sidebar and the outer bezel frame share the EXACT same surface color (Cra continuous canvas)
    hostEl.style.setProperty('--surface-solid', palette.hex);
    hostEl.style.setProperty('--surface-bg', palette.hex);
    hostEl.style.setProperty('--accent', palette.accent);
    document.documentElement.style.setProperty('--dia-frame-color', palette.hex);

    const blurPx = settings.commandBarBlur ? Number(settings.commandBarBlurRadius ?? 18) : 0;
    const darknessAlpha = settings.commandBarDarken
      ? Math.max(0, Math.min(0.9, Number(settings.commandBarDarkness ?? 48) / 100))
      : 0;

    backdropEl.style.setProperty('--dia-cb-blur', `${blurPx}px`);
    backdropEl.style.setProperty('--dia-cb-darkness', String(darknessAlpha));
    backdropEl.setAttribute(
      'data-position',
      settings.commandBarPosition === 'center' ? 'center' : 'spotlight'
    );
    modalEl.classList.toggle('is-compact', Boolean(settings.compactCommandBar));

    if (sidebarEl) {
      sidebarEl.setAttribute(
        'data-hide-pin-border',
        settings.hidePinnedTabBorder ? 'true' : 'false'
      );
    }
  }

  async function cycleSpaceTheme() {
    const currentPreset = settings.framePreset || 'arc-lavender';
    const idx = THEME_CYCLE_ORDER.indexOf(currentPreset);
    const nextPreset = THEME_CYCLE_ORDER[(idx + 1) % THEME_CYCLE_ORDER.length];
    const nextEntry = THEME_PALETTES[nextPreset];
    if (!nextEntry) return;

    settings.framePreset = nextPreset;
    settings.frameColor = nextEntry.hex;
    settings.uiTheme = nextEntry.mode;
    settings.userChangedTheme = true;

    applyCommandBarStyles();
    try {
      await chrome.storage.sync.set({
        framePreset: nextPreset,
        frameColor: nextEntry.hex,
        uiTheme: nextEntry.mode,
        userChangedTheme: true
      });
    } catch {
      // Ignore storage error
    }
    showToast(`Theme: ${nextEntry.label}`);
  }

  function showToast(message, kind = 'success') {
    buildShadowDOM();
    if (!toastEl || !toastTextEl) return;
    toastTextEl.textContent = message;
    toastEl.dataset.kind = kind;
    const badge = toastEl.querySelector('.dia-toast-badge');
    if (badge) badge.innerHTML = kind === 'error' ? ICONLY.close : kind === 'info'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 10v6M12 7h.01"/></svg>'
      : ICONLY.check;
    toastEl.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  const collapsedFolders = new Set();
  let editingFolderGroupId = null;

  async function copyPageUrl(format = 'url', triggerBtn = null) {
    const url = window.location.href;
    const title = document.title || url;
    const textToCopy = format === 'markdown' ? `[${title}](${url})` : url;

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }

    // Pointer 6: Change copy button state to "Copied" with tick icon on click
    if (triggerBtn) {
      triggerBtn.classList.add('is-copied');
      triggerBtn.innerHTML = `${ICONLY.check}<span class="dia-copy-label">Copied</span>`;
      if (triggerBtn.__copyResetTimer) clearTimeout(triggerBtn.__copyResetTimer);
      triggerBtn.__copyResetTimer = setTimeout(() => {
        triggerBtn.classList.remove('is-copied');
        triggerBtn.innerHTML = `${ICONLY.copy}<span class="dia-copy-label">Copy</span>`;
      }, 1600);
    }

    if (settings.copyURLToast !== false) {
      showToast(format === 'markdown' ? 'Copied URL as Markdown' : 'Copied current URL');
    }
  }

  async function runTidyTabs() {
    showToast('Tidying open tabs into smart folders…', 'info');
    try {
      const res = await chrome.runtime.sendMessage({ type: 'DIA_TIDY_TABS' });
      if (res?.message) {
        showToast(res.message, res.ok === false ? 'error' : res.tabsGrouped === 0 ? 'info' : 'success');
      }
      await refreshSidebarTabs();
    } catch {
      showToast('Could not tidy tabs.', 'error');
    }
  }

  async function refreshTopBarExtensions() {
    if (!shadow) return;
    const trays = [shadow.getElementById('dia-top-ext-tray')].filter(Boolean);
    if (trays.length === 0) return;
    try {
      const res = await chrome.runtime.sendMessage({ type: 'DIA_GET_INSTALLED_EXTENSIONS' });
      if (!res || !Array.isArray(res.extensions)) return;
      for (const tray of trays) {
        tray.innerHTML = '';
        for (const ext of res.extensions) {
          const btn = document.createElement('button');
          btn.className = 'dia-top-ext-btn';
          btn.title = ext.isSelf
            ? 'Open Arcflow settings'
            : `${ext.fullName || ext.name} — open from Chrome’s toolbar`;
          const img = document.createElement('img');
          img.src = ext.iconDataUrl;
          img.alt = ext.name;
          btn.appendChild(img);
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const result = await chrome.runtime.sendMessage({
              type: 'DIA_OPEN_EXTENSION',
              id: ext.id,
              optionsUrl: ext.optionsUrl,
              isSelf: ext.isSelf
            });
            if (!result?.ok && result?.message) showToast(result.message, 'info');
          });
          tray.appendChild(btn);
        }
      }
    } catch {
      // Ignore extension query errors
    }
  }

  async function runGroupByDomain() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'DIA_GROUP_TABS_BY_DOMAIN' });
      if (res?.message) {
        showToast(res.message, res.ok === false ? 'error' : res.tabsGrouped === 0 ? 'info' : 'success');
      }
      await refreshSidebarTabs();
    } catch {
      showToast('Could not group tabs by domain.', 'error');
    }
  }

  function updateSidebarVisibility() {
    if (!sidebarEl) return;
    const html = document.documentElement;
    if (settings.enabled === false || !isFullscreenWindow) {
      sidebarEl.classList.remove('is-visible', 'is-pinned');
      html.setAttribute('data-dia-sidebar-pinned', 'false');
      return;
    }
    const mode = settings.sidebarMode || 'always';

    if (leftHoverSensorEl) {
      leftHoverSensorEl.classList.toggle('is-disabled', mode === 'off');
    }

    if (mode === 'off') {
      sidebarEl.classList.remove('is-visible', 'is-pinned');
      html.setAttribute('data-dia-sidebar-pinned', 'false');
      return;
    }

    const pinned = mode === 'pinned' || isSidebarPinned;
    if (pinned) {
      sidebarEl.classList.add('is-visible', 'is-pinned');
      html.setAttribute('data-dia-sidebar-pinned', 'true');
      if (sidebarPinBtnEl) sidebarPinBtnEl.classList.add('is-active');
      return;
    }

    html.setAttribute('data-dia-sidebar-pinned', 'false');
    if (sidebarPinBtnEl) sidebarPinBtnEl.classList.remove('is-active');
    sidebarEl.classList.remove('is-pinned');

    const allowHover =
      mode === 'always' ||
      mode === 'auto' ||
      isFramelessWindow ||
      isFullscreenWindow ||
      isSidebarHoverOpen;

    sidebarEl.classList.toggle('is-visible', Boolean(allowHover && isSidebarHoverOpen));
  }

  async function toggleSidebarFromIcon() {
    buildShadowDOM();
    const isCurrentlyVisible =
      isSidebarPinned ||
      settings.sidebarMode === 'pinned' ||
      (sidebarEl && sidebarEl.classList.contains('is-visible'));

    if (isCurrentlyVisible && (isSidebarPinned || settings.sidebarMode === 'pinned')) {
      // Collapse pinned sidebar back to hover mode and hide it immediately
      isSidebarPinned = false;
      isSidebarHoverOpen = false;
      settings.sidebarMode = 'always';
      try {
        await chrome.storage.sync.set({ sidebarMode: 'always' });
      } catch {
        // Ignore
      }
      updateSidebarVisibility();
      showToast('Sidebar Collapsed (Hover Left Edge or press ⌘S)');
    } else if (isCurrentlyVisible && !isSidebarPinned) {
      // If sidebar was only open on hover, tapping [|] collapses it if user wants to dismiss, or pins it:
      // Let's pin it open so user can dock it, and tapping [|] again collapses it!
      isSidebarPinned = true;
      settings.sidebarMode = 'pinned';
      try {
        await chrome.storage.sync.set({ sidebarMode: 'pinned' });
      } catch {
        // Ignore
      }
      await refreshSidebarTabs();
      updateSidebarVisibility();
      showToast('Sidebar Pinned (Tap icon or press ⌘S to collapse)');
    } else {
      // Sidebar was hidden -> Pin/open it
      isSidebarPinned = true;
      isSidebarHoverOpen = true;
      settings.sidebarMode = 'pinned';
      try {
        await chrome.storage.sync.set({ sidebarMode: 'pinned' });
      } catch {
        // Ignore
      }
      await refreshSidebarTabs();
      updateSidebarVisibility();
      showToast('Sidebar Opened (⌘S)');
    }
  }

  async function toggleSidebarPinned() {
    buildShadowDOM();
    isSidebarPinned = !isSidebarPinned;
    if (!isSidebarPinned) {
      isSidebarHoverOpen = false;
    }
    const nextMode = isSidebarPinned ? 'pinned' : 'always';
    settings.sidebarMode = nextMode;
    try {
      await chrome.storage.sync.set({ sidebarMode: nextMode });
    } catch {
      // Ignore storage error
    }
    if (isSidebarPinned) {
      await refreshSidebarTabs();
    }
    updateSidebarVisibility();
    showToast(isSidebarPinned ? 'Pinned Vertical Sidebar (⌘S)' : 'Sidebar Collapsed (⌘S)');
  }

  async function refreshSidebarTabs() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'DIA_GET_OPEN_TABS' });
      if (res && Array.isArray(res.tabs)) {
        openTabs = res.tabs;
        if (res.activeTabId) activeTabId = res.activeTabId;
        renderSidebarTabs();
      }
    } catch {
      // Service worker waking up
    }
  }

  function renderSidebarTabs() {
    if (!sidebarTabsListEl || !sidebarPinnedGridEl) return;
    if (editingFolderGroupId !== null) return;
    sidebarPinnedGridEl.innerHTML = '';
    if (sidebarFoldersListEl) sidebarFoldersListEl.innerHTML = '';
    sidebarTabsListEl.innerHTML = '';

    if (sidebarUrlLabelEl) {
      sidebarUrlLabelEl.textContent = formatCleanHost(window.location.href);
    }
    if (topHoverUrlEl) {
      if (topHoverUrlTextEl) topHoverUrlTextEl.textContent = formatCleanHost(window.location.href);
    }
    if (sidebarTabCountEl) {
      sidebarTabCountEl.textContent = `${openTabs.length} tab${openTabs.length === 1 ? '' : 's'}`;
    }

    const pinnedTabs = openTabs.filter((t) => t.pinned);
    const unpinnedTabs = openTabs.filter((t) => !t.pinned);

    for (const tab of pinnedTabs.slice(0, 12)) {
      const tile = document.createElement('div');
      const isCurrent = activeTabId ? tab.id === activeTabId : Boolean(tab.active);
      tile.className = `dia-sb-pin-tile${isCurrent ? ' is-active' : ''}`;
      tile.title = tab.title || tab.url;

      if (tab.favIconUrl && /^https?:\/\//i.test(tab.favIconUrl)) {
        const img = document.createElement('img');
        img.src = tab.favIconUrl;
        img.alt = '';
        img.onerror = () => {
          tile.innerHTML = ICONLY.globe;
        };
        tile.appendChild(img);
      } else {
        tile.innerHTML = ICONLY.globe;
      }

      tile.addEventListener('click', async () => {
        await chrome.runtime.sendMessage({
          type: 'DIA_SWITCH_TAB',
          tabId: tab.id,
          windowId: tab.windowId
        });
      });

      sidebarPinnedGridEl.appendChild(tile);
    }

    function createTabRowElement(tab) {
      const row = document.createElement('div');
      const isCurrent = activeTabId ? tab.id === activeTabId : Boolean(tab.active);
      row.className = `dia-sb-tab${isCurrent ? ' is-active' : ''}`;
      row.title = `${tab.title}\n${tab.url}`;
      row.draggable = true;
      row.addEventListener('dragstart', (event) => {
        event.dataTransfer?.setData('application/x-arcchrome-tab-id', String(tab.id));
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        row.classList.add('is-dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('is-dragging'));
      row.addEventListener('dragover', (event) => {
        if (hasDragType(event, 'application/x-arcchrome-tab-id')) {
          event.preventDefault();
          row.classList.add('is-drop-target');
        }
      });
      row.addEventListener('dragleave', () => row.classList.remove('is-drop-target'));
      row.addEventListener('drop', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        row.classList.remove('is-drop-target');
        const draggedId = getDraggedTabId(event);
        if (draggedId === null || draggedId === tab.id) return;
        await moveSidebarTab(draggedId, tab.groupId ?? -1, tab.windowId, tab.index);
        await refreshSidebarTabs();
      });

      const fav = document.createElement('div');
      fav.className = 'dia-sb-tab-fav';
      if (tab.favIconUrl && /^https?:\/\//i.test(tab.favIconUrl)) {
        const img = document.createElement('img');
        img.src = tab.favIconUrl;
        img.alt = '';
        img.onerror = () => {
          fav.innerHTML = ICONLY.globe;
        };
        fav.appendChild(img);
      } else {
        fav.innerHTML = ICONLY.globe;
      }

      const titleSpan = document.createElement('span');
      titleSpan.className = 'dia-sb-tab-title';
      titleSpan.textContent = tab.title || tab.url || 'Untitled';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'dia-sb-tab-close';
      closeBtn.title = 'Close Tab';
      closeBtn.innerHTML = ICONLY.close;
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTabFromList(tab.id);
      });

      row.addEventListener('click', async () => {
        await chrome.runtime.sendMessage({
          type: 'DIA_SWITCH_TAB',
          tabId: tab.id,
          windowId: tab.windowId
        });
      });

      row.appendChild(fav);
      row.appendChild(titleSpan);
      row.appendChild(closeBtn);
      return row;
    }

    // Group unpinned tabs into Smart Folders when groupTitle is present
    const folderBuckets = new Map();
    const looseTabs = [];
    for (const tab of unpinnedTabs) {
      if (tab.groupTitle) {
        const folderKey = tab.groupId >= 0 ? `group-${tab.groupId}` : `name-${tab.groupTitle}`;
        if (!folderBuckets.has(folderKey)) {
          folderBuckets.set(folderKey, {
            title: tab.groupTitle,
            color: tab.groupColor,
            groupId: tab.groupId ?? -1,
            windowId: tab.windowId,
            tabs: []
          });
        }
        folderBuckets.get(folderKey).tabs.push(tab);
      } else {
        looseTabs.push(tab);
      }
    }

    const folderRoots = [];
    const folderBucketsById = new Map();
    for (const [folderKey, bucket] of folderBuckets.entries()) {
      bucket.key = folderKey;
      bucket.parentGroupId = Number(bucket.tabs[0]?.parentGroupId ?? -1);
      bucket.children = [];
      folderBucketsById.set(bucket.groupId, bucket);
    }
    for (const bucket of folderBuckets.values()) {
      const parent = folderBucketsById.get(bucket.parentGroupId);
      if (parent && parent.groupId !== bucket.groupId) parent.children.push(bucket);
      else folderRoots.push(bucket);
    }

    function renderFolder(bucket, target) {
      const folderKey = bucket.key;
      const folderTitle = bucket.title;
      const folderWrap = document.createElement('div');
      const isCollapsed = collapsedFolders.has(folderKey);
      folderWrap.className = `dia-sb-folder${bucket.parentGroupId >= 0 ? ' is-nested' : ''}${isCollapsed ? ' is-collapsed' : ''}`;
      folderWrap.dataset.groupId = String(bucket.groupId);

      const groupHdr = document.createElement('div');
      groupHdr.className = 'dia-sb-group-header';
      groupHdr.draggable = bucket.groupId >= 0;
      groupHdr.setAttribute('role', 'button');
      groupHdr.setAttribute('tabindex', '0');
      groupHdr.setAttribute('aria-expanded', String(!isCollapsed));
      groupHdr.addEventListener('dragstart', (event) => {
        if (bucket.groupId < 0) return;
        event.dataTransfer?.setData('application/x-arcchrome-folder-group-id', String(bucket.groupId));
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });

      const folderIcon = document.createElement('span');
      folderIcon.className = 'dia-sb-folder-icon';
      folderIcon.style.color = GROUP_COLOR_HEX[bucket.color] || 'var(--accent)';
      folderIcon.innerHTML = ICONLY.folderStack;

      const label = document.createElement('span');
      label.className = 'dia-sb-folder-name';
      label.textContent = folderTitle;

      const countSpan = document.createElement('span');
      countSpan.className = 'dia-sb-folder-count';
      countSpan.textContent = String(bucket.tabs.length);

      groupHdr.appendChild(folderIcon);
      groupHdr.appendChild(label);
      groupHdr.appendChild(countSpan);

      const chevron = document.createElement('span');
      chevron.className = 'dia-sb-folder-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = '<svg viewBox="0 0 12 12" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7.5 3-3 3 3"/></svg>';
      groupHdr.appendChild(chevron);

      let labelToggleTimer;
      if (bucket.groupId >= 0) {
        const beginRename = (event) => {
          event.preventDefault();
          event.stopPropagation();
          clearTimeout(labelToggleTimer);
          if (editingFolderGroupId !== null) return;
          editingFolderGroupId = bucket.groupId;
          groupHdr.draggable = false;
          const input = document.createElement('input');
          input.className = 'dia-sb-folder-input';
          input.type = 'text';
          input.maxLength = 100;
          input.value = folderTitle;
          input.setAttribute('aria-label', 'Folder name');
          label.replaceWith(input);
          input.focus();
          input.select();
          let finished = false;
          const finish = async (save) => {
            if (finished) return;
            finished = true;
            const title = input.value.trim();
            try {
              if (save && title && title !== folderTitle) {
                const result = await chrome.runtime.sendMessage({ type: 'DIA_RENAME_FOLDER', groupId: bucket.groupId, title });
                if (!result?.ok) showToast('Could not rename folder.', 'error');
                else label.textContent = title;
              }
            } catch {
              showToast('Could not rename folder.', 'error');
            } finally {
              input.replaceWith(label);
              groupHdr.draggable = true;
              editingFolderGroupId = null;
              await refreshSidebarTabs();
            }
          };
          input.addEventListener('click', (e) => e.stopPropagation());
          input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); finish(true); }
            if (e.key === 'Escape') { e.preventDefault(); finish(false); }
          });
          input.addEventListener('blur', () => finish(true), { once: true });
        };
        label.title = `${folderTitle} · Double-click to rename`;
        groupHdr.addEventListener('keydown', event => {
          if (event.key === 'F2') beginRename(event);
        });
        label.addEventListener('dblclick', beginRename);
      }

      let folderBounce;
      const toggleFolder = () => {
        if (!groupHdr.isConnected || editingFolderGroupId === bucket.groupId) return;
        if (collapsedFolders.has(folderKey)) {
          collapsedFolders.delete(folderKey);
          folderWrap.classList.remove('is-collapsed');
          groupHdr.setAttribute('aria-expanded', 'true');
        } else {
          collapsedFolders.add(folderKey);
          folderWrap.classList.add('is-collapsed');
          groupHdr.setAttribute('aria-expanded', 'false');
        }
        const collapsed = collapsedFolders.has(folderKey);
        if (collapsed && itemsContainer.contains(shadow.activeElement)) groupHdr.focus();
        itemsContainer.inert = collapsed;
        folderBounce?.cancel();
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          folderBounce = itemsContainer.animate([
            { transform: 'translateY(0)' },
            { transform: `translateY(${collapsed ? 2 : 3}px)`, offset: 0.35 },
            { transform: 'translateY(-1px)', offset: 0.7 },
            { transform: 'translateY(0)' }
          ], { duration: 200, easing: 'ease-out' });
        }
      };
      groupHdr.addEventListener('click', event => {
        if (event.target === label && bucket.groupId >= 0) {
          clearTimeout(labelToggleTimer);
          if (event.detail === 1) labelToggleTimer = setTimeout(toggleFolder, 250);
          return;
        }
        toggleFolder();
      });
      groupHdr.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          groupHdr.click();
        }
      });

      folderWrap.addEventListener('dragover', (event) => {
        if (hasDragType(event, 'application/x-arcchrome-tab-id') ||
            hasDragType(event, 'application/x-arcchrome-folder-group-id')) {
          event.preventDefault();
          folderWrap.classList.add('is-drop-target');
        }
      });
      folderWrap.addEventListener('dragleave', (event) => {
        if (!folderWrap.contains(event.relatedTarget)) folderWrap.classList.remove('is-drop-target');
      });
      folderWrap.addEventListener('drop', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        folderWrap.classList.remove('is-drop-target');
        const draggedId = getDraggedTabId(event);
        const draggedFolderId = getDraggedFolderGroupId(event);
        if (draggedFolderId !== null) {
          await moveSidebarFolder(draggedFolderId, bucket.groupId);
        } else if (draggedId !== null && bucket.groupId >= 0) {
          await moveSidebarTab(draggedId, bucket.groupId, bucket.windowId);
        } else {
          return;
        }
        await refreshSidebarTabs();
      });

      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'dia-sb-folder-items';
      itemsContainer.inert = isCollapsed;
      for (const tab of bucket.tabs) {
        itemsContainer.appendChild(createTabRowElement(tab));
      }
      for (const child of bucket.children) renderFolder(child, itemsContainer);

      folderWrap.appendChild(groupHdr);
      const reveal = document.createElement('div');
      reveal.className = 'dia-sb-folder-reveal';
      const clip = document.createElement('div');
      clip.className = 'dia-sb-folder-clip';
      clip.appendChild(itemsContainer);
      reveal.appendChild(clip);
      folderWrap.appendChild(reveal);
      target.appendChild(folderWrap);
    }

    for (const bucket of folderRoots) renderFolder(bucket, sidebarFoldersListEl || sidebarTabsListEl);

    for (const tab of looseTabs) {
      sidebarTabsListEl.appendChild(createTabRowElement(tab));
    }
  }

  async function closeTabFromList(tabId) {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'DIA_CLOSE_TAB', tabId });
      if (res && Array.isArray(res.tabs)) {
        openTabs = res.tabs;
      } else {
        openTabs = openTabs.filter((t) => t.id !== tabId);
      }
      renderSidebarTabs();
      if (isOpen) renderResults();
    } catch {
      // Ignore close error
    }
  }

  function updateSelectionVisuals() {
    const items = resultsEl.querySelectorAll('.dia-item');
    items.forEach((el, idx) => {
      if (idx === selectedIndex) {
        el.classList.add('is-selected');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('is-selected');
      }
    });
  }

  function getDiaCommandItems() {
    return [
      {
        kind: 'action-tidy-tabs',
        title: 'Tidy Tabs — Smart Group Open Tabs by Subject',
        subtitle: 'Automatically organizes loose tabs into subject groups',
        badge: '⌥⌘T',
        iconSvg: ICONLY.sparkles
      },
      {
        kind: 'action-group-domain',
        title: 'Group Tabs by Domain',
        subtitle: 'Clusters open tabs sharing the same website domain',
        badge: '⌥⌘G',
        iconSvg: ICONLY.folder
      },
      {
        kind: 'action-frameless',
        title: 'Toggle Full Screen',
        subtitle: 'Use Chrome full screen; hide the toolbar in Chrome settings',
        badge: '⌘⇧D',
        iconSvg: ICONLY.windowFrame
      },
      {
        kind: 'action-sidebar',
        title: 'Pin / Unpin Vertical Tab Sidebar',
        subtitle: 'Toggle the collapsible left-edge vertical tab sidebar inside the viewport',
        badge: '⌘S',
        iconSvg: ICONLY.sidebarPin
      },
      {
        kind: 'action-copy-url',
        title: 'Copy Current Page URL',
        subtitle: `Copies ${window.location.href} with confirmation toast`,
        badge: '⌘⇧C',
        iconSvg: ICONLY.copy
      },
      {
        kind: 'action-copy-markdown',
        title: 'Copy Current URL as Markdown',
        subtitle: `Copies [${document.title || 'Page'}](${window.location.href})`,
        badge: '⌘⇧⌥C',
        iconSvg: ICONLY.document
      },
      {
        kind: 'action-edge-to-edge',
        title: settings.edgeToEdge
          ? 'Disable Edge-to-Edge (Restore Padded Bezel)'
          : 'Enable Edge-to-Edge Web Pages (0px Padding)',
        subtitle: 'Toggle between padded bezel and edge-to-edge viewport',
        badge: '⌥⌘E',
        iconSvg: ICONLY.maximize
      },
      {
        kind: 'action-pin-tab',
        title: 'Pin / Unpin Current Tab',
        subtitle: 'Add or remove this tab from your Pinned Tabs grid',
        badge: '⌘D',
        iconSvg: ICONLY.pin
      },
      {
        kind: 'action-reopen-closed',
        title: 'Reopen Last Closed Tab',
        subtitle: 'Restore your most recently closed tab or window',
        badge: '⌘⇧T',
        iconSvg: ICONLY.history
      },
      {
        kind: 'action-fullscreen',
        title: 'Toggle Full-Screen Mode',
        subtitle: 'Pair with Shift+Cmd+F in Chrome to auto-hide the native top bar in Full Screen',
        badge: '⌃⌘F',
        iconSvg: ICONLY.maximize
      }
    ];
  }

  function renderResults() {
    if (!resultsEl) return;
    const rawQuery = inputEl.value;
    const query = rawQuery.trim().toLowerCase();
    filteredItems = [];
    resultsEl.innerHTML = '';

    const actions = getDiaCommandItems();

    if (currentPaletteMode === 'switcher') {
      modeBadgeEl.textContent = 'Recent Tabs';
      const activeTab = openTabs.find((tab) => tab.id === activeTabId || tab.active);
      const currentWindowId = activeTab?.windowId;
      const recentTabs = openTabs
        .filter((tab) => tab.id !== activeTabId && (currentWindowId == null || tab.windowId === currentWindowId))
        .sort((a, b) => {
          const aRank = Number.isFinite(a.recentIndex) && a.recentIndex >= 0 ? a.recentIndex : Number.MAX_SAFE_INTEGER;
          const bRank = Number.isFinite(b.recentIndex) && b.recentIndex >= 0 ? b.recentIndex : Number.MAX_SAFE_INTEGER;
          return aRank - bRank || a.index - b.index;
        });
      const heading = document.createElement('div');
      heading.className = 'dia-switcher-heading';
      heading.textContent = 'Recently used';
      resultsEl.appendChild(heading);
      filteredItems = recentTabs.slice(0, 12).map((tab) => ({
        kind: 'tab',
        tabId: tab.id,
        windowId: tab.windowId,
        title: tab.title || 'Untitled Tab',
        subtitle: tab.url || '',
        favIconUrl: tab.favIconUrl || '',
        groupTitle: tab.groupTitle,
        groupColor: tab.groupColor,
        badge: 'Switch Tab'
      }));
    } else {

    if (rawQuery.trim().length > 0) {
      if (looksLikeUrl(rawQuery)) {
        const dest = normalizeDestination(rawQuery);
        filteredItems.push({
          kind: 'url',
          title: `Go to ${rawQuery.trim()}`,
          subtitle: dest,
          url: dest,
          badge: 'Open URL',
          iconSvg: ICONLY.globe
        });
        modeBadgeEl.textContent = 'URL';
      } else {
        const engineName =
          (settings.searchEngine || 'google').charAt(0).toUpperCase() +
          (settings.searchEngine || 'google').slice(1);
        const searchBase = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.google;
        filteredItems.push({
          kind: 'search',
          title: `Search ${engineName} for "${rawQuery.trim()}"`,
          subtitle: `${searchBase}${encodeURIComponent(rawQuery.trim())}`,
          url: `${searchBase}${encodeURIComponent(rawQuery.trim())}`,
          badge: `${engineName} Search`,
          iconSvg: ICONLY.search
        });
        modeBadgeEl.textContent = 'Search';
      }

      for (const act of actions) {
        if (act.title.toLowerCase().includes(query) || act.subtitle.toLowerCase().includes(query)) {
          filteredItems.push(act);
        }
      }
    } else {
      modeBadgeEl.textContent = 'Command';
    }

    const matchingTabs = openTabs
      .filter((t) => {
        if (!query) return true;
        return (
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.url && t.url.toLowerCase().includes(query)) ||
          (t.groupTitle && t.groupTitle.toLowerCase().includes(query))
        );
      })
      .slice(0, 10);

    for (const tab of matchingTabs) {
      filteredItems.push({
        kind: 'tab',
        tabId: tab.id,
        windowId: tab.windowId,
        title: tab.title || 'Untitled Tab',
        subtitle: tab.url || '',
        favIconUrl: tab.favIconUrl || '',
        groupTitle: tab.groupTitle,
        groupColor: tab.groupColor,
        badge: tab.active ? 'Active Tab' : 'Switch Tab'
      });
    }

    if (!query) {
      filteredItems.push(...actions);
    }
    }

    if (selectedIndex >= filteredItems.length) {
      selectedIndex = 0;
    }

    filteredItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `dia-item${idx === selectedIndex ? ' is-selected' : ''}`;

      const iconWrap = document.createElement('div');
      iconWrap.className = 'dia-item-icon';
      if (item.favIconUrl && /^https?:\/\//i.test(item.favIconUrl)) {
        const img = document.createElement('img');
        img.src = item.favIconUrl;
        img.alt = '';
        img.onerror = () => {
          iconWrap.innerHTML = ICONLY.globe;
        };
        iconWrap.appendChild(img);
      } else {
        iconWrap.innerHTML = item.iconSvg || ICONLY.globe;
      }

      const textWrap = document.createElement('div');
      textWrap.className = 'dia-item-text';

      const titleEl = document.createElement('div');
      titleEl.className = 'dia-item-title';
      const titleTextNode = document.createElement('span');
      titleTextNode.textContent = item.title;
      titleEl.appendChild(titleTextNode);

      if (item.groupTitle) {
        const groupPill = document.createElement('span');
        groupPill.className = 'dia-group-pill';
        groupPill.textContent = item.groupTitle;
        titleEl.appendChild(groupPill);
      }

      const subEl = document.createElement('div');
      subEl.className = 'dia-item-subtitle';
      subEl.textContent = item.subtitle;

      textWrap.appendChild(titleEl);
      textWrap.appendChild(subEl);

      const badgeEl = document.createElement('span');
      badgeEl.className = 'dia-item-shortcut';
      badgeEl.textContent = item.badge;

      row.appendChild(iconWrap);
      row.appendChild(textWrap);
      row.appendChild(badgeEl);

      if (item.kind === 'tab' && item.tabId) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'dia-item-close';
        closeBtn.title = 'Close Tab (⌘W)';
        closeBtn.innerHTML = ICONLY.close;
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeTabFromList(item.tabId);
        });
        row.appendChild(closeBtn);
      }

      row.addEventListener('mouseenter', () => {
        selectedIndex = idx;
        updateSelectionVisuals();
      });

      row.addEventListener('click', (e) => {
        executeSelected(e.metaKey || e.ctrlKey);
      });

      resultsEl.appendChild(row);
    });
  }

  async function executeSelected(openInNewTab = false) {
    const chosen = filteredItems[selectedIndex];
    if (!chosen) return;

    closePalette(false);

    try {
      if (chosen.kind === 'tab') {
        await chrome.runtime.sendMessage({
          type: 'DIA_SWITCH_TAB',
          tabId: chosen.tabId,
          windowId: chosen.windowId
        });
      } else if (chosen.kind === 'action-tidy-tabs') {
        await runTidyTabs();
      } else if (chosen.kind === 'action-group-domain') {
        await runGroupByDomain();
      } else if (chosen.kind === 'action-frameless') {
        await chrome.runtime.sendMessage({ type: 'DIA_TOGGLE_FRAMELESS_WINDOW' });
      } else if (chosen.kind === 'action-sidebar') {
        await toggleSidebarPinned();
      } else if (chosen.kind === 'action-copy-url') {
        await copyPageUrl('url');
      } else if (chosen.kind === 'action-copy-markdown') {
        await copyPageUrl('markdown');
      } else if (chosen.kind === 'action-edge-to-edge') {
        const nextEdge = !settings.edgeToEdge;
        settings.edgeToEdge = nextEdge;
        await chrome.storage.sync.set({ edgeToEdge: nextEdge });
        showToast(nextEdge ? 'Edge-to-Edge Web Pages On (0px)' : 'Padded Bezel Restored');
      } else if (chosen.kind === 'action-pin-tab') {
        const res = await chrome.runtime.sendMessage({ type: 'DIA_TOGGLE_PIN_TAB' });
        showToast(res?.pinned ? 'Pinned current tab' : 'Unpinned current tab');
        await refreshSidebarTabs();
      } else if (chosen.kind === 'action-reopen-closed') {
        await chrome.runtime.sendMessage({ type: 'DIA_REOPEN_CLOSED_TAB' });
      } else if (chosen.kind === 'action-fullscreen') {
        await chrome.runtime.sendMessage({ type: 'DIA_TOGGLE_FULLSCREEN' });
      } else if (chosen.kind === 'url' || chosen.kind === 'search') {
        const isNewTabDocument = location.href.startsWith(chrome.runtime.getURL('newtab/recovery.html'));
        const shouldOpenInNewTab = openInNewTab || (currentPaletteMode !== 'url' && !isNewTabDocument);
        await chrome.runtime.sendMessage({
          type: 'DIA_NAVIGATE',
          url: chosen.url,
          newTab: shouldOpenInNewTab
        });
      }
    } catch {
      if (chosen.url) {
        window.location.href = chosen.url;
      }
    }
  }

  async function openPalette(mode = 'command') {
    if (settings.enabled === false || !isFullscreenWindow) return;
    buildShadowDOM();
    applyCommandBarStyles();
    isOpen = true;
    currentPaletteMode = mode;
    selectedIndex = 0;
    modalEl.classList.toggle('is-switcher', mode === 'switcher');
    modalEl.setAttribute('aria-label', mode === 'switcher' ? 'Recently used tabs' : 'Command Bar');
    if (footerEl) {
      footerEl.innerHTML = mode === 'switcher'
        ? '<span><kbd>Ctrl</kbd>+<kbd>Tab</kbd> Cycle tabs</span><span>Release <kbd>Ctrl</kbd> to switch · <kbd>Esc</kbd> Cancel</span>'
        : '<span><kbd>↑</kbd><kbd>↓</kbd> Navigate &nbsp; <kbd>↵</kbd> Open &nbsp; <kbd>⌘↵</kbd> New Tab &nbsp; <kbd>⌘W</kbd> Close Tab</span><span><kbd>⌘⇧C</kbd> Copy URL &nbsp; <kbd>Esc</kbd> Dismiss</span>';
    }

    if (mode === 'url') {
      inputEl.value = window.location.href;
      inputEl.placeholder = 'Edit current URL or search…';
    } else if (settings.commandBarKeepText && lastCloseWasEscape && savedQueryText) {
      inputEl.value = savedQueryText;
      inputEl.placeholder = 'Type a URL or search to open in a new tab…';
    } else {
      inputEl.value = '';
      inputEl.placeholder = 'Type a URL or search to open in a new tab…';
    }

    backdropEl.classList.add('is-open');
    await refreshSidebarTabs();
    renderResults();

    if (mode !== 'switcher') {
      requestAnimationFrame(() => {
        inputEl.focus();
        if (inputEl.value) inputEl.select();
      });
    }
  }

  function closePalette(viaEscape = false) {
    if (!backdropEl) return;
    if (viaEscape && settings.commandBarKeepText) {
      savedQueryText = inputEl ? inputEl.value : '';
      lastCloseWasEscape = true;
    } else {
      savedQueryText = '';
      lastCloseWasEscape = false;
    }
    isOpen = false;
    backdropEl.classList.remove('is-open');
  }

  function togglePalette(mode = 'command') {
    if (isOpen) {
      closePalette(true);
    } else {
      openPalette(mode);
    }
  }

  function isEditableElement(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      Boolean(el.isContentEditable)
    );
  }

  function onMouseMove(e) {
    if (settings.enabled === false || !isFullscreenWindow) return;
    if (e.clientX <= 12 && settings.sidebarMode !== 'off') {
      if (sidebarHideTimer) clearTimeout(sidebarHideTimer);
      if (!isSidebarHoverOpen) {
        isSidebarHoverOpen = true;
        refreshSidebarTabs();
        updateSidebarVisibility();
      }
    }

    if (
      settings.revealToolbarOnHover &&
      (isFramelessWindow || isFullscreenWindow || !isSidebarPinned) &&
      e.clientY <= 10 &&
      e.clientX > window.innerWidth * 0.18 &&
      e.clientX < window.innerWidth * 0.82
    ) {
      if (topBarHideTimer) clearTimeout(topBarHideTimer);
      if (!isTopBarHoverOpen && topHoverBarEl) {
        isTopBarHoverOpen = true;
        if (topHoverUrlEl) {
          if (topHoverUrlTextEl) topHoverUrlTextEl.textContent = formatCleanHost(window.location.href);
        }
        topHoverBarEl.classList.add('is-visible');
      }
    }
  }

  function onLinkClick(e) {
    if (e.defaultPrevented || !isFramelessWindow || settings.enabled === false) return;
    const source = e.target instanceof Element ? e.target : e.target?.parentElement;
    const link = source?.closest?.('a[href]');
    if (!link) return;

    const requestsNewContext =
      link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1;
    if (!requestsNewContext || !/^https?:$/i.test(new URL(link.href, window.location.href).protocol)) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({
      type: 'DIA_NAVIGATE',
      url: link.href,
      newTab: true
    }).catch(() => {
      window.location.assign(link.href);
    });
  }

  function onKeyDown(e) {
    if (settings.enabled === false || !isFullscreenWindow) return;
    const isMeta = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();

    const sidebarShortcut = (isMeta && !e.shiftKey && !e.altKey && key === 's') ||
      (e.ctrlKey && !e.metaKey && e.shiftKey && !e.altKey && key === 's');
    if (settings.diaShortcutsEnabled && sidebarShortcut && !e.isComposing && !isEditableElement(e.composedPath()[0])) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!e.repeat) toggleSidebarPinned();
      return;
    }

    if (currentPaletteMode === 'switcher' && isOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closePalette(false);
      } else if (e.ctrlKey && !e.metaKey && e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredItems.length > 0) {
          const step = e.shiftKey ? -1 : 1;
          selectedIndex = (selectedIndex + step + filteredItems.length) % filteredItems.length;
          updateSelectionVisuals();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredItems.length > 0) {
          const step = e.key === 'ArrowDown' ? 1 : -1;
          selectedIndex = (selectedIndex + step + filteredItems.length) % filteredItems.length;
          updateSelectionVisuals();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        executeSelected(false);
      }
      return;
    }

    if (settings.commandBarEnabled) {
      if (isMeta && !e.shiftKey && !e.altKey && (key === 'k' || (key === 't' && settings.openNewTabInCommandBar !== false))) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) togglePalette('command');
        return;
      }
      if (isMeta && e.shiftKey && !e.altKey && key === 'l') {
        e.preventDefault();
        e.stopPropagation();
        togglePalette('url');
        return;
      }
    }

    if (!settings.diaShortcutsEnabled) return;

    if (isMeta && !e.shiftKey && !e.altKey && key === 'l') {
      e.preventDefault();
      e.stopPropagation();
      togglePalette('url');
      return;
    }

    if (isMeta && e.shiftKey && !e.altKey && key === 'c' && !isEditableElement(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      copyPageUrl('url');
      return;
    }

    if (isMeta && e.shiftKey && e.altKey && key === 'c') {
      e.preventDefault();
      e.stopPropagation();
      copyPageUrl('markdown');
      return;
    }

    if (isMeta && e.shiftKey && !e.altKey && key === 'd') {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'DIA_TOGGLE_FRAMELESS_WINDOW' });
      return;
    }

    if (isMeta && e.altKey && !e.shiftKey && key === 't') {
      e.preventDefault();
      e.stopPropagation();
      runTidyTabs();
      return;
    }

    if (isMeta && e.altKey && !e.shiftKey && key === 'g') {
      e.preventDefault();
      e.stopPropagation();
      runGroupByDomain();
      return;
    }

    if (isMeta && e.altKey && !e.shiftKey && key === 'e') {
      e.preventDefault();
      e.stopPropagation();
      const nextEdge = !settings.edgeToEdge;
      settings.edgeToEdge = nextEdge;
      chrome.storage.sync.set({ edgeToEdge: nextEdge });
      showToast(nextEdge ? 'Edge-to-Edge Web Pages On (0px)' : 'Padded Bezel Restored');
      return;
    }

    if (e.ctrlKey && !e.metaKey && !e.altKey && e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      if (!isOpen) {
        openPalette('switcher');
      } else if (filteredItems.length > 0) {
        selectedIndex = (selectedIndex + 1) % filteredItems.length;
        updateSelectionVisuals();
      }
    }
  }

  function onKeyUp(e) {
    if (currentPaletteMode === 'switcher' && isOpen && e.key === 'Control') {
      if (filteredItems.length > 0) executeSelected(false);
      else closePalette(false);
    }
  }

  function onStorageChanged(changes, area) {
    if (area !== 'sync' && area !== 'local') return;
    if (area === 'sync' && changes.sidebarWidth) setSidebarWidth(changes.sidebarWidth.newValue);
    for (const [key, change] of Object.entries(changes)) {
      if (key === 'workspaceName' && change.newValue !== undefined) {
        setWorkspaceName(change.newValue);
      }
      if (key in settings && change.newValue !== undefined) {
        settings[key] = change.newValue;
      }
    }
    isSidebarPinned = settings.sidebarMode === 'pinned';
    if (hostEl) {
      hostEl.style.display = settings.enabled === false || !isFullscreenWindow ? 'none' : '';
      if (settings.enabled === false || !isFullscreenWindow) closePalette(false);
    }
    applyCommandBarStyles();
    updateSidebarVisibility();
  }

  function onRuntimeMessage(message, _sender, sendResponse) {
    if (!message || !message.type) return false;

    if (message.type === 'DIA_TOGGLE_COMMAND_BAR') {
      const available = settings.enabled !== false && isFullscreenWindow && settings.commandBarEnabled;
      if (available) togglePalette(message.mode || 'command');
      sendResponse({ ok: available });
    } else if (message.type === 'DIA_COPY_CURRENT_URL') {
      copyPageUrl(message.format || 'url');
      sendResponse({ ok: true });
    } else if (message.type === 'DIA_TABS_UPDATED' && Array.isArray(message.tabs)) {
      openTabs = message.tabs;
      if (message.activeTabId) activeTabId = message.activeTabId;
      renderSidebarTabs();
      if (isOpen) renderResults();
      sendResponse({ ok: true });
    } else if (message.type === 'DIA_WINDOW_STATE_CHANGED') {
      isFullscreenWindow = Boolean(message.isFullscreen);
      isFramelessWindow = Boolean(message.isFrameless);
      if (hostEl) hostEl.style.display = settings.enabled === false || !isFullscreenWindow ? 'none' : '';
      if (!isFullscreenWindow) closePalette(false);
      updateSidebarVisibility();
      sendResponse({ ok: true });
    } else if (message.type === 'DIA_SETTINGS_UPDATED' && message.settings) {
      settings = { ...settings, ...message.settings };
      isSidebarPinned = settings.sidebarMode === 'pinned';
      if (hostEl) {
        hostEl.style.display = settings.enabled === false || !isFullscreenWindow ? 'none' : '';
        if (settings.enabled === false || !isFullscreenWindow) closePalette(false);
      }
      applyCommandBarStyles();
      updateSidebarVisibility();
      sendResponse({ ok: true });
    }
    return false;
  }

  window.__workspaceCommandCleanup = () => {
    cleanupSidebarResize();
    cleanupSettingsPanel();
    cleanupDownloadsView();
    document.documentElement.style.removeProperty('--arcflow-sidebar-width');
    document.documentElement.removeAttribute('data-arcflow-sidebar-resizing');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('keyup', onKeyUp, true);
    document.removeEventListener('click', onLinkClick, true);
    chrome.storage.onChanged.removeListener(onStorageChanged);
    chrome.runtime.onMessage.removeListener(onRuntimeMessage);
    clearTimeout(sidebarHideTimer);
    clearTimeout(topBarHideTimer);
    clearTimeout(toastTimer);
    document.getElementById('dia-chrome-tweaks-command-host')?.remove();
  };

  async function init() {
    // Build the UI shell at document_start. Keep startup reads parallel so a
    // tab navigation does not leave the sidebar hidden while each API responds.
    buildShadowDOM();

    const [stored, winState] = await Promise.all([
      chrome.storage.sync.get({ ...settings, workspaceName: 'Workspace', sidebarWidth: 248 }).catch(() => ({})),
      chrome.runtime.sendMessage({ type: 'DIA_GET_WINDOW_STATE' }).catch(() => null)
    ]);
    const { workspaceName = 'Workspace', sidebarWidth: savedSidebarWidth, ...storedSettings } = stored || {};
    settings = { ...settings, ...storedSettings };
    isSidebarPinned = settings.sidebarMode === 'pinned';
    setWorkspaceName(workspaceName);
    setSidebarWidth(savedSidebarWidth);

    if (winState) {
      isFramelessWindow = Boolean(winState.isFrameless);
      isFullscreenWindow = Boolean(winState.isFullscreen);
      if (winState.activeTabId) activeTabId = winState.activeTabId;
    }

    hostEl.style.display = settings.enabled === false || !isFullscreenWindow ? 'none' : '';
    applyCommandBarStyles();
    updateSidebarVisibility();

    chrome.storage.onChanged.addListener(onStorageChanged);
    chrome.runtime.onMessage.addListener(onRuntimeMessage);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);

    if (settings.enabled !== false) {
      // Make the sidebar visible before asking Chrome for tab and extension
      // details; these reads can take longer than the page's first paint.
      void refreshSidebarTabs();
      void refreshTopBarExtensions();
    }
  }

  document.addEventListener('click', onLinkClick, true);

  init();
})();
