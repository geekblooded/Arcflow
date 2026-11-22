/**
 * Arcflow — Background Service Worker (Manifest V3)
 *
 * Powers:
 * 1. Default settings initialization & migration (`DiaPatches.dylib` parity)
 * 2. Dynamic injection into already-open HTTP(S) tabs on install/reload
 * 3. Keyboard command shortcuts (`Cmd+K`, `Cmd+Shift+L`, `Cmd+Shift+C`, `Cmd+Shift+D`)
 * 4. Open-tab querying, switching, closing (`_DPCloseFromTabSwitcherEntry`), pinning, & reopening
 * 5. Smart Tab Grouping: `Group Tabs by Domain` (`_DPGroupTabsEntry`) & `Tidy Tabs` (`_DPTidyTabsEntry`)
 * 6. Full-screen & Frameless browser window (`type: 'popup'`) management
 */

const DEFAULT_SETTINGS = {
  enabled: false,
  activationMode: 'fullscreen',
  edgeToEdge: false,        // _DPEdgeToEdgeEntry
  bezelSize: 10,
  cornerRadius: 12,
  squareSidebarCorners: false, // _DPSquareSidebarCornersEntry
  frameColor: '#ebecf7',
  framePreset: 'arc-lavender', // 'arc-lavender' | 'frost' | 'warm-sand' | 'mint-sage' | 'rose-quartz' | 'sky-breeze' | 'obsidian' | 'glass' | 'arc-navy' | 'warm-clay' | 'midnight-purple' | 'forest-night' | 'custom'
  insetContent: true,
  showInnerBorder: true,
  commandBarEnabled: true,
  openNewTabInCommandBar: true, // _DPOpenOverBlank
  commandBarPosition: 'spotlight', // 'spotlight' | 'center' (_DPCommandBarPositions)
  commandBarBlur: true,     // _DPCommandBarBlurEntry
  commandBarBlurRadius: 18,
  commandBarDarken: true,   // _DPCommandBarDarkenEntry
  commandBarDarkness: 48,
  commandBarKeepText: true, // _DPCommandBarKeepTextEntry
  compactCommandBar: false, // _DPCompactCommandBarEntry
  copyURLToast: true,       // _DPCopyToastEntry
  revealToolbarOnHover: true, // _DPRevealToolbarOnHoverEntry
  sidebarMode: 'always',    // 'auto' | 'always' | 'pinned' | 'off'
  hidePinnedTabBorder: false, // _DPHidePinnedTabBorderEntry
  diaShortcutsEnabled: true, // Use Arcflow keyboard shortcuts
  uiTheme: 'light',
  userChangedTheme: false,
  searchEngine: 'google'
};

const TAB_GROUP_COLORS = ['blue', 'purple', 'cyan', 'green', 'yellow', 'orange', 'pink', 'red', 'grey'];
const FOLDER_PARENT_KEY = 'arcchromeFolderParents';
const RECENT_TABS_KEY = 'arcflowRecentTabsByWindow';
let recentTabsWriteQueue = Promise.resolve();

function recordRecentTab({ tabId, windowId }) {
  if (!Number.isInteger(tabId) || !Number.isInteger(windowId)) return recentTabsWriteQueue;
  recentTabsWriteQueue = recentTabsWriteQueue.then(async () => {
    const stored = await chrome.storage.session.get(RECENT_TABS_KEY);
    const byWindow = stored[RECENT_TABS_KEY] || {};
    const previous = Array.isArray(byWindow[String(windowId)]) ? byWindow[String(windowId)] : [];
    byWindow[String(windowId)] = [tabId, ...previous.filter((id) => id !== tabId)].slice(0, 100);
    await chrome.storage.session.set({ [RECENT_TABS_KEY]: byWindow });
  }).catch(() => {});
  return recentTabsWriteQueue;
}

function isInjectableUrl(url) {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

async function ensureTabInjected(tabId, url) {
  if (!tabId || !isInjectableUrl(url)) return false;
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['styles/dia-frame.css']
    });
  } catch {
    // CSS already injected or restricted page
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/fullscreen-frame.js', 'content/command-palette.js']
    });
    return true;
  } catch {
    return false;
  }
}

async function injectIntoAllOpenTabs() {
  try {
    const { enabled = false } = await chrome.storage.sync.get({ enabled: false });
    if (!enabled || !await isArcflowActive()) return;
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && isInjectableUrl(tab.url)) {
        await ensureTabInjected(tab.id, tab.url);
      }
    }
  } catch {
    // Ignore errors during startup enumeration
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const existing = await chrome.storage.sync.get(null);
    const { arcInsetDefaultMigrated } = await chrome.storage.local.get('arcInsetDefaultMigrated');
    const nextSettings = { ...DEFAULT_SETTINGS, ...existing, activationMode: 'fullscreen' };
    if (!arcInsetDefaultMigrated) nextSettings.insetContent = true;
    if (existing && existing.userChangedTheme && existing.uiTheme) {
      nextSettings.uiTheme = existing.uiTheme;
      nextSettings.userChangedTheme = true;
      if (existing.framePreset) nextSettings.framePreset = existing.framePreset;
      if (existing.frameColor) nextSettings.frameColor = existing.frameColor;
    }
    await chrome.storage.sync.set(nextSettings);
    await chrome.storage.local.set(nextSettings);
    await chrome.storage.local.set({ arcInsetDefaultMigrated: true });
  } catch (err) {
    console.error('[Arcflow] Failed to initialize settings:', err);
  }

  await injectIntoAllOpenTabs();
});

async function sendToTabWithInjectionFallback(tab, payload) {
  if (!tab || !tab.id) return false;
  try {
    await chrome.tabs.sendMessage(tab.id, payload);
    return true;
  } catch {
    if (isInjectableUrl(tab.url)) {
      const injected = await ensureTabInjected(tab.id, tab.url);
      if (injected) {
        try {
          await chrome.tabs.sendMessage(tab.id, payload);
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  }
}

async function toggleFramelessWindow(sourceTab) {
  try {
    const win = sourceTab?.windowId
      ? await chrome.windows.get(sourceTab.windowId)
      : await chrome.windows.getLastFocused();
    if (win.type !== 'normal') {
      return { ok: false, error: 'Full screen is available in a normal Chrome window.' };
    }
    const state = win.state === 'fullscreen' ? 'normal' : 'fullscreen';
    await chrome.windows.update(win.id, { state });
    return { ok: true, state };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function isArcflowActive() {
  const { arcflowActivated } = await chrome.storage.session.get('arcflowActivated');
  return arcflowActivated === true;
}

async function notifyWindowMode(tabId, windowId) {
  try {
    const win = await chrome.windows.get(windowId);
    await chrome.tabs.sendMessage(tabId, {
      type: 'DIA_WINDOW_STATE_CHANGED',
      isFullscreen: win.state === 'fullscreen' && await isArcflowActive(),
      isFrameless: win.type === 'popup',
      windowState: win.state,
      windowType: win.type
    });
  } catch {
    // The new document may not have installed its content script yet.
  }
}

// Extract clean domain label for _DPGroupTabsEntry
function extractDomainLabel(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    let host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const parts = host.split('.');
    if (parts.length >= 2) {
      const sld = parts[parts.length - 2];
      if (sld.length > 2 || parts.length === 2) {
        return sld.charAt(0).toUpperCase() + sld.slice(1);
      }
    }
    return host;
  } catch {
    return 'Other';
  }
}

// Smart intent & project folder classifier for "Tidy up"
const INTENT_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'you', 'are', 'was',
  'new', 'tab', 'page', 'home', 'google', 'search', 'web', 'app', 'com', 'org', 'net',
  'how', 'what', 'why', 'when', 'where', 'best', 'free', 'online', 'official', 'site',
  'login', 'sign', 'dashboard', 'welcome', 'untitled', 'index', 'http', 'https', 'www'
]);

function extractSignificantKeywords(tab) {
  const raw = `${tab.title || ''} ${ extractDomainLabel(tab.url || '') }`
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .toLowerCase();
  const words = raw.split(/\s+/).filter((w) => w.length >= 3 && !INTENT_STOPWORDS.has(w) && !/^\d+$/.test(w));
  return [...new Set(words)];
}

function classifyTabIntentProject(tab, sharedProjectKeywordMap) {
  // 1. Check if tab belongs to a multi-tab shared project/topic cluster inferred from open tab titles
  if (sharedProjectKeywordMap) {
    const words = extractSignificantKeywords(tab);
    for (const [kw, projectTitle] of sharedProjectKeywordMap.entries()) {
      if (words.includes(kw)) {
        return projectTitle;
      }
    }
  }

  const title = (tab.title || '').toLowerCase();
  const url = (tab.url || '').toLowerCase();
  const combined = `${title} ${url}`;

  if (/figma\.com|dribbble\.com|behance\.net|iconly|hugeicons|mobbin|framer\.com|canva\.com|font|typography|design|ui|ux|prototype|color/.test(combined)) {
    return 'Design & UI';
  }
  if (/github\.com|gitlab\.com|stackoverflow\.com|localhost|127\.0\.0\.1|vercel\.com|netlify\.com|npmjs\.com|developer\.chrome\.com|mdn|docs\.|api|code|pull request|issue|repo|terminal/.test(combined)) {
    return 'Engineering & Dev';
  }
  if (/chatgpt\.com|claude\.ai|gemini\.google|perplexity\.ai|huggingface\.co|openai\.com|anthropic|arxiv\.org|scholar\.google|research|llm|model/.test(combined)) {
    return 'AI & Research';
  }
  if (/docs\.google\.com|sheets\.google|slides\.google|notion\.so|linear\.app|jira|atlassian|confluence|slack\.com|miro\.com|calendar\.google|trello|asana|roadmap|sprint/.test(combined)) {
    return 'Workspace & Docs';
  }
  if (/youtube\.com|netflix\.com|spotify\.com|twitch\.tv|vimeo\.com|soundcloud\.com|music|video|podcast/.test(combined)) {
    return 'Media & Watch';
  }
  if (/amazon\.|flipkart\.|ebay\.|nike\.|adidas\.|shop|cart|checkout|price|buy|store|product/.test(combined)) {
    return 'Shopping';
  }
  if (/mail\.google\.com|outlook\.|proton\.me|inbox|message/.test(combined)) {
    return 'Communications';
  }
  if (/twitter\.com|x\.com|reddit\.com|linkedin\.com|news\.ycombinator\.com|threads\.net|instagram\.com|medium\.com|substack\.com/.test(combined)) {
    return 'Social & Reading';
  }
  const domain = extractDomainLabel(tab.url);
  return domain && domain !== 'Other' ? `${domain} Space` : 'General Explore';
}

function buildSharedProjectMap(tabs) {
  const freq = new Map();
  for (const tab of tabs) {
    const words = extractSignificantKeywords(tab);
    for (const w of words) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  // Pick top specific keywords shared by at least 2 tabs (up to 3 dynamic project clusters)
  const candidates = [...freq.entries()]
    .filter(([w, count]) => count >= 2 && w.length >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const projectMap = new Map();
  for (const [kw] of candidates) {
    const formatted = kw.charAt(0).toUpperCase() + kw.slice(1);
    projectMap.set(kw, `${formatted} Project`);
  }
  return projectMap;
}

async function groupTabsByDomain(windowId) {
  try {
    const tabs = await chrome.tabs.query(windowId ? { windowId } : { currentWindow: true });
    const unpinned = tabs.filter((t) => !t.pinned && t.id && isInjectableUrl(t.url));
    if (unpinned.length === 0) {
      return { ok: true, groupsCreated: 0, tabsGrouped: 0, message: 'No loose web tabs to group.' };
    }

    const byDomain = new Map();
    for (const tab of unpinned) {
      const label = extractDomainLabel(tab.url);
      if (!byDomain.has(label)) byDomain.set(label, []);
      byDomain.get(label).push(tab.id);
    }

    let groupsCreated = 0;
    let tabsGrouped = 0;
    let colorIdx = 0;

    for (const [domainLabel, tabIds] of byDomain.entries()) {
      if (tabIds.length < 1) continue;
      // Group domains with 2+ tabs, or all domains if fewer than 4 total domains
      if (tabIds.length >= 2 || byDomain.size <= 4) {
        const groupId = await chrome.tabs.group({ tabIds });
        if (chrome.tabGroups && typeof chrome.tabGroups.update === 'function') {
          await chrome.tabGroups.update(groupId, {
            title: domainLabel,
            color: TAB_GROUP_COLORS[colorIdx % TAB_GROUP_COLORS.length]
          });
        }
        colorIdx++;
        groupsCreated++;
        tabsGrouped += tabIds.length;
      }
    }

    const message =
      groupsCreated > 0
        ? `Grouped ${tabsGrouped} tab${tabsGrouped === 1 ? '' : 's'} into ${groupsCreated} domain group${groupsCreated === 1 ? '' : 's'}`
        : 'No multi-tab domains found to group.';
    return { ok: true, groupsCreated, tabsGrouped, message };
  } catch (err) {
    return { ok: false, error: String(err), message: 'Could not group tabs in this window.' };
  }
}

const customTabFolderAssignment = new Map();

async function tidyTabsBySubject(windowId) {
  try {
    const allTabs = await getEnrichedOpenTabs();
    const unpinned = allTabs.filter((t) => !t.pinned && t.id);
    if (unpinned.length === 0) {
      return { ok: true, groupsCreated: 0, tabsGrouped: 0, message: 'There are no loose tabs to tidy.' };
    }

    const sharedProjectMap = buildSharedProjectMap(unpinned);
    const bySubject = new Map();
    for (const tab of unpinned) {
      const subject = classifyTabIntentProject(tab, sharedProjectMap);
      const key = `${tab.windowId}:${subject}`;
      if (!bySubject.has(key)) bySubject.set(key, { subject, tabIds: [] });
      bySubject.get(key).tabIds.push(tab.id);
    }

    let groupsCreated = 0;
    let tabsGrouped = 0;
    let colorIdx = 0;

    for (const { subject, tabIds } of bySubject.values()) {
      if (tabIds.length === 0) continue;
      const color = TAB_GROUP_COLORS[colorIdx % TAB_GROUP_COLORS.length];
      colorIdx++;

      if (tabIds.length > 0) {
        try {
          const groupId = await chrome.tabs.group({ tabIds });
          if (chrome.tabGroups && typeof chrome.tabGroups.update === 'function') {
            await chrome.tabGroups.update(groupId, {
              title: subject,
              color
            });
          }
        } catch {
          continue;
        }
      }

      groupsCreated++;
      tabsGrouped += tabIds.length;
    }

    const message =
      groupsCreated > 0
        ? `Organized ${tabsGrouped} tab${tabsGrouped === 1 ? '' : 's'} into ${groupsCreated} smart folder${groupsCreated === 1 ? '' : 's'}`
        : 'No tabs clearly belonged together.';
    return { ok: true, groupsCreated, tabsGrouped, message };
  } catch (err) {
    return { ok: false, error: String(err), message: 'Could not tidy tabs in this window.' };
  }
}

async function getEnrichedOpenTabs() {
  const tabs = await chrome.tabs.query({});
  const [storedFolders, recentStored] = await Promise.all([
    chrome.storage.local.get({ [FOLDER_PARENT_KEY]: {} }),
    chrome.storage.session.get(RECENT_TABS_KEY)
  ]);
  const folderParents = storedFolders[FOLDER_PARENT_KEY] || {};
  const recentByWindow = recentStored[RECENT_TABS_KEY] || {};
  const groupMap = new Map();
  if (chrome.tabGroups && typeof chrome.tabGroups.query === 'function') {
    try {
      const groups = await chrome.tabGroups.query({});
      for (const g of groups) {
        groupMap.set(g.id, { title: g.title || 'Folder', color: g.color || 'grey', collapsed: g.collapsed });
      }
    } catch {
      // Ignore tabGroups errors if unsupported in popup windows
    }
  }

  const enriched = [];

  for (const t of tabs) {
    const groupInfo =
      t.groupId && t.groupId > -1
        ? groupMap.get(t.groupId)
        : customTabFolderAssignment.get(t.id) || null;
    enriched.push({
      id: t.id,
      windowId: t.windowId,
      index: t.index,
      title: t.title || 'Untitled',
      url: t.url || '',
      favIconUrl: t.favIconUrl || '',
      active: Boolean(t.active),
      recentIndex: (recentByWindow[String(t.windowId)] || []).indexOf(t.id),
      pinned: Boolean(t.pinned),
      audible: Boolean(t.audible),
      groupId: t.groupId ?? -1,
      groupTitle: groupInfo ? groupInfo.title : null,
      groupColor: groupInfo ? groupInfo.color : null,
      parentGroupId: t.groupId >= 0 ? Number(folderParents[String(t.groupId)] ?? -1) : -1
    });
  }

  return enriched;
}

function buildExtensionBadgeDataUrl(name, id) {
  const palette = ['#5e5ce6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
  let hash = 0;
  const seed = id || name || 'ext';
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bg = palette[hash % palette.length];
  const clean = (name || 'E').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const initials = clean.slice(0, 2) || 'EX';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${bg}"/><text x="16" y="20.5" text-anchor="middle" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="13" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const realExtIconMemoryCache = new Map();
const KNOWN_EXTENSION_ICONS = {
  degmhkcaeoamggineifpdgneflgajiog:
    'data:image/png;base64,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',
  ghbmnnjooekpmoecnnnilnnbdlolhkhi:
    'data:image/png;base64,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',
  gmloihcgbhbonllenincdakeijmikcne:
    'data:image/png;base64,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',
  hkgfoiooedgoejojocmhlaklaeopbecg:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAA3NCSVQICAjb4U/gAAAAP1BMVEVHcEz///////8AAAD////////////////////////BwcGCgoLKysrGxsa2trbU1NRDQ0NlZWWamprMzMxHcEwZSsnNAAAAFXRSTlMABf//3YVAVOmK/////////////wAgUrRDAAAAs0lEQVRYhe2X2Q6DIBBF8SLKUsHl//+1irFPpHGYNrXtnCde7glLMrkoJVyE3rUg07r+yBt6esfseQfEUZMZI+Dy/oGJHt+YgO0UFnNdXusZVqkGqM1rDTSqw1AvGNCtV+DzOt1IpBzy6yUcAuoTiuDKAssWnJ0M7xNwj3CavxHEUCASBKE0hoIIRCCCLxQkXyARBE/4RcEykFgeAnbNYxdNdtXll21O3Tev+XDwvzzCp7kD788qqx2w2hwAAAAASUVORK5CYII='
};

async function fetchUrlAsDataUri(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const blob = await resp.blob();
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${blob.type || 'image/png'};base64,${btoa(binary)}`;
}

async function resolveExtensionIconDataUrl(ext) {
  if (!ext || !ext.id) return buildExtensionBadgeDataUrl('Ext', 'ext');

  if (realExtIconMemoryCache.has(ext.id)) {
    return realExtIconMemoryCache.get(ext.id);
  }

  // 1. Self extension icon
  if (ext.id === chrome.runtime.id) {
    try {
      const dataUri = await fetchUrlAsDataUri(chrome.runtime.getURL('icons/icon-48.png'));
      realExtIconMemoryCache.set(ext.id, dataUri);
      return dataUri;
    } catch {
      // Fall through
    }
  }

  // 2. Known official developer extension icons (DesignOS, Google Docs Offline, QR Code Reader, Picture-in-Picture, etc.)
  if (KNOWN_EXTENSION_ICONS[ext.id]) {
    realExtIconMemoryCache.set(ext.id, KNOWN_EXTENSION_ICONS[ext.id]);
    return KNOWN_EXTENSION_ICONS[ext.id];
  }
  if (/designos/i.test(ext.name || '')) {
    const icon = KNOWN_EXTENSION_ICONS.degmhkcaeoamggineifpdgneflgajiog;
    realExtIconMemoryCache.set(ext.id, icon);
    return icon;
  }

  // 3. Check persistent storage cache
  try {
    const cacheKey = `extIcon_${ext.id}`;
    const stored = await chrome.storage.local.get(cacheKey);
    if (stored && stored[cacheKey]) {
      realExtIconMemoryCache.set(ext.id, stored[cacheKey]);
      return stored[cacheKey];
    }
  } catch {
    // Ignore storage read error
  }

  return buildExtensionBadgeDataUrl(ext.shortName || ext.name, ext.id);
}

async function getInstalledExtensionsList() {
  if (!chrome.management || typeof chrome.management.getAll !== 'function') {
    return [];
  }
  try {
    const all = await chrome.management.getAll();
    const enabledExts = all.filter((item) => item.enabled && item.type === 'extension');
    const result = [];
    for (const ext of enabledExts.slice(0, 8)) {
      const iconDataUrl = await resolveExtensionIconDataUrl(ext);
      result.push({
        id: ext.id,
        name: ext.shortName || ext.name,
        fullName: ext.name,
        optionsUrl: ext.optionsUrl || '',
        isSelf: ext.id === chrome.runtime.id,
        iconDataUrl
      });
    }
    return result;
  } catch {
    return [];
  }
}

// Listen for global keyboard shortcuts defined in manifest.json
chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || !activeTab.id) return;

    if (command === 'toggle-frameless-window') {
      await toggleFramelessWindow(activeTab);
      return;
    }

    const { enabled = false } = await chrome.storage.sync.get({ enabled: false });
    const activeWindow = await chrome.windows.get(activeTab.windowId);
    if (!enabled || activeWindow.state !== 'fullscreen' || !await isArcflowActive()) return;

    if (command === 'copy-current-url') {
      await sendToTabWithInjectionFallback(activeTab, {
        type: 'DIA_COPY_CURRENT_URL',
        format: 'url'
      });
      return;
    }

    const mode = command === 'open-url-bar' ? 'url' : 'command';
    await sendToTabWithInjectionFallback(activeTab, {
      type: 'DIA_TOGGLE_COMMAND_BAR',
      mode
    });
  } catch (err) {
    console.error('[Arcflow] Command error:', err);
  }
});

// Broadcast window fullscreen state changes to active tab
chrome.windows.onBoundsChanged.addListener(async (win) => {
  try {
    const isFullscreen = win.state === 'fullscreen';
    const session = await chrome.storage.session.get(['arcFullscreenWindowId', 'arcSetupWindowId']);
    if (isFullscreen && session.arcSetupWindowId === win.id && session.arcFullscreenWindowId !== win.id) {
      await chrome.storage.session.set({ arcFullscreenWindowId: win.id });
    }
    if (!isFullscreen && session.arcFullscreenWindowId === win.id) {
      await chrome.storage.session.remove(['arcFullscreenWindowId', 'arcSetupWindowId', 'arcflowActivated', 'arcflowWelcomeWindowId']);
      await chrome.storage.sync.set({ enabled: false });
      await chrome.storage.local.set({ enabled: false });
    }
    const isFrameless = win.type === 'popup';
    const tabs = await chrome.tabs.query({ active: true, windowId: win.id });
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'DIA_WINDOW_STATE_CHANGED',
            isFullscreen: isFullscreen && await isArcflowActive(),
            isFrameless,
            windowState: win.state,
            windowType: win.type
          });
        } catch {
          // Restricted page
        }
      }
    }
  } catch {
    // Ignore transient window lookup errors
  }
});

// Broadcast tab list updates so the in-page Arcflow sidebar updates live
async function broadcastTabsUpdated() {
  try {
    const { enabled = false } = await chrome.storage.sync.get({ enabled: false });
    if (!enabled || !await isArcflowActive()) return;
    const enriched = await getEnrichedOpenTabs();
    const activeTabs = await chrome.tabs.query({ active: true });
    for (const tab of activeTabs) {
      if (tab.id && isInjectableUrl(tab.url)) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'DIA_TABS_UPDATED',
            tabs: enriched,
            activeTabId: tab.id
          });
        } catch {
          // Ignore tabs without content script
        }
      }
    }
  } catch {
    // Ignore transient broadcast errors
  }
}

chrome.tabs.onCreated.addListener(() => { broadcastTabsUpdated(); });
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`arcRecovery:${tabId}`).catch(() => {});
  chrome.storage.session.remove(`arcSettingsToken:${tabId}`).catch(() => {});
  broadcastTabsUpdated();
});
chrome.tabGroups?.onRemoved?.addListener(async (group) => {
  try {
    const stored = await chrome.storage.local.get({ [FOLDER_PARENT_KEY]: {} });
    const parents = stored[FOLDER_PARENT_KEY] || {};
    delete parents[String(group.id)];
    for (const [childId, parentId] of Object.entries(parents)) {
      if (Number(parentId) === group.id) delete parents[childId];
    }
    await chrome.storage.local.set({ [FOLDER_PARENT_KEY]: parents });
    await broadcastTabsUpdated();
  } catch {
    // A group can disappear while its cleanup is being persisted.
  }
});
chrome.tabGroups?.onUpdated?.addListener(() => { broadcastTabsUpdated(); });
chrome.tabs.onActivated.addListener((activeInfo) => {
  void notifyWindowMode(activeInfo.tabId, activeInfo.windowId);
  recordRecentTab(activeInfo).finally(() => broadcastTabsUpdated());
});
chrome.tabs.onMoved.addListener(() => { broadcastTabsUpdated(); });
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.title || changeInfo.status === 'complete' || changeInfo.pinned !== undefined || changeInfo.favIconUrl) {
    broadcastTabsUpdated();
  }
});

// Chrome's own network error pages cannot host the injected Arc interface.
// Recover only common main-frame network failures in an active Arc window.
const RECOVERABLE_NETWORK_ERRORS = new Set([
  'net::ERR_NAME_NOT_RESOLVED', 'net::ERR_NAME_RESOLUTION_FAILED',
  'net::ERR_INTERNET_DISCONNECTED', 'net::ERR_CONNECTION_TIMED_OUT',
  'net::ERR_CONNECTION_REFUSED', 'net::ERR_CONNECTION_RESET',
  'net::ERR_ADDRESS_UNREACHABLE'
]);
chrome.webNavigation.onErrorOccurred.addListener((details) => {
  // Ignore navigation metadata unless Arcflow is enabled by the user.
  chrome.storage.sync.get({ enabled: false }).then(({ enabled }) => {
    if (!enabled || details.frameId !== 0 || !isInjectableUrl(details.url) || !RECOVERABLE_NETWORK_ERRORS.has(details.error)) return;
    setTimeout(async () => {
      try {
        const [settings, tab, frame] = await Promise.all([
          chrome.storage.sync.get({ enabled: false }),
          chrome.tabs.get(details.tabId),
          chrome.webNavigation.getFrame({ tabId: details.tabId, frameId: 0 })
        ]);
        if (!settings.enabled || !frame?.errorOccurred || frame.url !== details.url) return;
        const win = await chrome.windows.get(tab.windowId);
        if (win.state !== 'fullscreen' || !await isArcflowActive()) return;
        const key = `arcRecovery:${details.tabId}`;
        await chrome.storage.session.set({ [key]: { url: details.url, error: details.error } });
        // Recheck after asynchronous work so a newer navigation is never replaced.
        const current = await chrome.webNavigation.getFrame({ tabId: details.tabId, frameId: 0 });
        if (!current?.errorOccurred || current.url !== details.url) return;
        await chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL('newtab/recovery.html?recovery=1') });
      } catch {
        // The tab or window may have closed or navigated while the error was handled.
      }
    }, 350);
  }).catch(() => {});
});

// Message router for content scripts, navigation recovery, and popup UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === 'ARC_SETTINGS_TOKEN') {
    (async () => {
      try {
        if (!sender.tab?.id || sender.frameId !== 0 || typeof message.token !== 'string' || !/^[a-f0-9]{64}$/.test(message.token)) throw new Error('Invalid request');
        await chrome.storage.session.set({ [`arcSettingsToken:${sender.tab.id}`]: message.token });
        sendResponse({ ok: true });
      } catch { sendResponse({ ok: false }); }
    })();
    return true;
  }
  if (message.type === 'ARC_SETTINGS_VERIFY') {
    (async () => {
      try {
        if (!sender.tab?.id || !sender.frameId || !sender.url?.startsWith(chrome.runtime.getURL('popup/embedded.html'))) throw new Error('Invalid frame');
        const key = `arcSettingsToken:${sender.tab.id}`;
        const stored = await chrome.storage.session.get(key);
        const ok = typeof message.token === 'string' && stored[key] === message.token;
        if (ok) await chrome.storage.session.remove(key);
        sendResponse({ ok });
      } catch { sendResponse({ ok: false }); }
    })();
    return true;
  }

  if (message.type === 'DIA_ACTIVATE_ARC') {
    (async () => {
      try {
        const win = Number.isInteger(message.windowId)
          ? await chrome.windows.get(message.windowId)
          : await chrome.windows.getLastFocused();
        if (win.state === 'fullscreen') {
          sendResponse({ ok: false, error: 'Exit full screen to activate Arcflow.' });
          return;
        }
        if (win.type !== 'normal') throw new Error('Open a normal Chrome window to enter full screen.');
        await chrome.storage.sync.set({ enabled: true, activationMode: 'fullscreen' });
        await chrome.storage.session.set({ arcSetupWindowId: win.id });
        await chrome.windows.update(win.id, { state: 'fullscreen' });
        const [activeTab] = await chrome.tabs.query({ active: true, windowId: win.id });
        const googleUrl = 'https://www.google.com/';
        const activeUrl = activeTab?.pendingUrl || activeTab?.url;
        if (!activeTab) {
          await chrome.tabs.create({ windowId: win.id, url: googleUrl });
        } else if (['chrome://newtab/', 'chrome://new-tab-page/', 'about:blank', chrome.runtime.getURL('newtab/newtab.html')].includes(activeUrl)) {
          await chrome.tabs.update(activeTab.id, { url: googleUrl });
        } else if (isInjectableUrl(activeUrl)) {
          await ensureTabInjected(activeTab.id, activeUrl);
        }
        await chrome.storage.session.set({
          arcFullscreenWindowId: win.id,
          arcflowActivated: true,
          arcflowWelcomeWindowId: win.id
        });
        const tabs = await chrome.tabs.query({ active: true });
        await Promise.all(tabs.filter(tab => tab.id != null).map(tab => notifyWindowMode(tab.id, tab.windowId)));
        await broadcastTabsUpdated();
        sendResponse({ ok: true });
      } catch (err) {
        await chrome.storage.session.remove(['arcFullscreenWindowId', 'arcSetupWindowId', 'arcflowActivated', 'arcflowWelcomeWindowId']);
        await chrome.storage.sync.set({ enabled: false });
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_DEACTIVATE_ARC') {
    (async () => {
      try {
        const session = await chrome.storage.session.get('arcFullscreenWindowId');
        await chrome.storage.session.remove(['arcFullscreenWindowId', 'arcSetupWindowId', 'arcflowActivated', 'arcflowWelcomeWindowId']);
        await chrome.storage.sync.set({ enabled: false });
        if (session.arcFullscreenWindowId != null) {
          const win = await chrome.windows.get(session.arcFullscreenWindowId).catch(() => null);
          if (win?.state === 'fullscreen') await chrome.windows.update(win.id, { state: 'normal' });
        }
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_GET_WINDOW_STATE') {
    (async () => {
      try {
        const windowId = sender.tab?.windowId;
        const win = windowId
          ? await chrome.windows.get(windowId)
          : await chrome.windows.getCurrent();
        sendResponse({
          isFullscreen: win.state === 'fullscreen' && await isArcflowActive(),
          isFrameless: win.type === 'popup',
          windowState: win.state,
          windowType: win.type,
          activeTabId: sender.tab?.id ?? null
        });
      } catch {
        sendResponse({ isFullscreen: false, isFrameless: false, windowState: 'normal', windowType: 'normal' });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_GET_OPEN_TABS') {
    (async () => {
      try {
        const { enabled = false } = await chrome.storage.sync.get({ enabled: false });
        if (!enabled || !await isArcflowActive()) { sendResponse({ tabs: [] }); return; }
        const tabs = await getEnrichedOpenTabs();
        sendResponse({ tabs, activeTabId: sender.tab?.id ?? null });
      } catch (err) {
        sendResponse({ tabs: [], error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_SWITCH_TAB') {
    (async () => {
      try {
        const { tabId, windowId } = message;
        if (!tabId) {
          sendResponse({ ok: false });
          return;
        }
        const targetTab = await chrome.tabs.get(tabId);
        await chrome.tabs.update(tabId, { active: true });
        await chrome.windows.update(windowId || targetTab.windowId, { focused: true });
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_CLOSE_TAB') {
    (async () => {
      try {
        const targetId = message.tabId || sender.tab?.id;
        if (targetId) {
          await chrome.tabs.remove(targetId);
        }
        const tabs = await getEnrichedOpenTabs();
        sendResponse({ ok: true, tabs });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_TOGGLE_PIN_TAB') {
    (async () => {
      try {
        const targetId = message.tabId || sender.tab?.id;
        if (!targetId) {
          sendResponse({ ok: false });
          return;
        }
        const tab = await chrome.tabs.get(targetId);
        const updated = await chrome.tabs.update(targetId, { pinned: !tab.pinned });
        sendResponse({ ok: true, pinned: updated.pinned });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_REOPEN_CLOSED_TAB') {
    (async () => {
      try {
        if (chrome.sessions && typeof chrome.sessions.restore === 'function') {
          await chrome.sessions.restore();
          sendResponse({ ok: true });
        } else {
          sendResponse({ ok: false, error: 'Sessions API unavailable' });
        }
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_GROUP_TABS_BY_DOMAIN') {
    (async () => {
      const result = await groupTabsByDomain(sender.tab?.windowId || message.windowId);
      await broadcastTabsUpdated();
      sendResponse(result);
    })();
    return true;
  }

  if (message.type === 'DIA_TIDY_TABS') {
    (async () => {
      const result = await tidyTabsBySubject(sender.tab?.windowId || message.windowId);
      await broadcastTabsUpdated();
      sendResponse(result);
    })();
    return true;
  }

  if (message.type === 'DIA_RENAME_FOLDER') {
    (async () => {
      try {
        const groupId = Number(message.groupId);
        const title = typeof message.title === 'string' ? message.title.trim() : '';
        if (!Number.isInteger(groupId) || groupId < 0 || !title || title.length > 100) throw new Error('Enter a folder name.');
        await chrome.tabGroups.update(groupId, { title });
        await broadcastTabsUpdated();
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_MOVE_TAB_TO_FOLDER') {
    (async () => {
      try {
        const tabId = Number(message.tabId);
        const folderGroupId = Number(message.folderGroupId);
        const targetWindowId = Number(message.windowId);
        if (!Number.isInteger(tabId)) throw new Error('Invalid tab');

        const tab = await chrome.tabs.get(tabId);
        if (Number.isInteger(targetWindowId) && tab.windowId !== targetWindowId) {
          await chrome.tabs.move(tabId, { windowId: targetWindowId, index: -1 });
        }
        if (Number.isInteger(folderGroupId) && folderGroupId >= 0) {
          await chrome.tabs.group({ groupId: folderGroupId, tabIds: [tabId] });
        } else if (tab.groupId >= 0) {
          await chrome.tabs.ungroup([tabId]);
        }
        if (Number.isInteger(message.index) && message.index >= 0) {
          const movedTab = await chrome.tabs.get(tabId);
          await chrome.tabs.move(tabId, { windowId: movedTab.windowId, index: message.index });
        }
        customTabFolderAssignment.delete(tabId);
        await broadcastTabsUpdated();
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_MOVE_FOLDER') {
    (async () => {
      try {
        const groupId = Number(message.groupId);
        const parentGroupId = Number(message.parentGroupId);
        if (!Number.isInteger(groupId) || groupId < 0 || groupId === parentGroupId) {
          throw new Error('Invalid folder destination');
        }
        const stored = await chrome.storage.local.get({ [FOLDER_PARENT_KEY]: {} });
        const parents = stored[FOLDER_PARENT_KEY] || {};
        let ancestorId = parentGroupId;
        const visited = new Set([groupId]);
        while (ancestorId >= 0) {
          if (visited.has(ancestorId)) throw new Error('Folders cannot be nested inside themselves');
          visited.add(ancestorId);
          ancestorId = Number(parents[String(ancestorId)] ?? -1);
        }
        if (parentGroupId < 0) delete parents[String(groupId)];
        else parents[String(groupId)] = parentGroupId;
        await chrome.storage.local.set({ [FOLDER_PARENT_KEY]: parents });
        await broadcastTabsUpdated();
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_NAVIGATE') {
    (async () => {
      try {
        const { url, newTab } = message;
        if (!url) {
          sendResponse({ ok: false });
          return;
        }
        // If caller opens a New Tab (+ New Tab / ⌘T / ⌘K)
        if (newTab) {
          const createOptions = { url, active: true };
          if (sender.tab?.windowId) {
            createOptions.windowId = sender.tab.windowId;
          }
          if (sender.tab?.id) {
            // Keep this tab associated with its source so frameless-window
            // handoff can adopt it into the same Chrome window if needed.
            createOptions.openerTabId = sender.tab.id;
          }
          await chrome.tabs.create(createOptions);
        } else if (sender.tab?.id) {
          await chrome.tabs.update(sender.tab.id, { url });
        } else {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab?.id) {
            await chrome.tabs.update(activeTab.id, { url });
          } else {
            await chrome.tabs.create({ url });
          }
        }
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_TOGGLE_FULLSCREEN') {
    (async () => {
      try {
        const windowId = sender.tab?.windowId;
        const win = windowId
          ? await chrome.windows.get(windowId)
          : await chrome.windows.getCurrent();
        const nextState = win.state === 'fullscreen' ? 'normal' : 'fullscreen';
        await chrome.windows.update(win.id, { state: nextState });
        sendResponse({ ok: true, state: nextState });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_TOGGLE_FRAMELESS_WINDOW') {
    (async () => {
      const result = await toggleFramelessWindow(sender.tab);
      sendResponse(result);
    })();
    return true;
  }

  if (message.type === 'DIA_ENSURE_ACTIVE_TAB_INJECTED') {
    (async () => {
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab || !activeTab.id) {
          sendResponse({ ok: false, restricted: true });
          return;
        }
        if (!isInjectableUrl(activeTab.url)) {
          sendResponse({ ok: false, restricted: true, url: activeTab.url });
          return;
        }
        const ok = await ensureTabInjected(activeTab.id, activeTab.url);
        sendResponse({ ok, restricted: !ok, url: activeTab.url });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_LIST_DOWNLOADS') {
    (async () => {
      try {
        const { enabled = false } = await chrome.storage.sync.get({ enabled: false });
        if (!enabled || !await isArcflowActive()) { sendResponse({ ok: false, items: [] }); return; }
        const query = String(message.query || '').trim().slice(0, 200);
        const items = await chrome.downloads.search({ limit: 200, orderBy: ['-startTime'], ...(query ? { query: query.split(/\s+/) } : {}) });
        sendResponse({ ok: true, items: items.map(({ id, filename, state, danger, exists, startTime, bytesReceived, totalBytes, paused, error }) => ({ id, filename, state, danger, exists, startTime, bytesReceived, totalBytes, paused, error })) });
      } catch (err) { sendResponse({ ok: false, error: String(err) }); }
    })();
    return true;
  }

  if (message.type === 'DIA_DOWNLOAD_ACTION') {
    (async () => {
      try {
        const id = Number(message.id);
        if (!Number.isInteger(id) || id < 0 || !['open', 'show'].includes(message.action)) throw new Error('Invalid download action');
        // Call open immediately so Chrome can associate it with the user's click.
        // Chrome itself enforces completion and download safety for open().
        if (message.action === 'open') await chrome.downloads.open(id);
        else {
          const [item] = await chrome.downloads.search({ id });
          if (!item || item.state !== 'complete' || item.exists === false || !['safe', 'accepted'].includes(item.danger)) throw new Error('This file is not available.');
          await chrome.downloads.show(id);
        }
        sendResponse({ ok: true });
      } catch (err) { sendResponse({ ok: false, error: String(err) }); }
    })();
    return true;
  }

  if (message.type === 'DIA_OPEN_DOWNLOADS') {
    (async () => {
      try {
        const downloadsUrl = 'chrome://downloads/';
        if (sender.tab?.windowId) {
          await chrome.tabs.create({ windowId: sender.tab.windowId, url: downloadsUrl, active: true });
          sendResponse({ ok: true });
          return;
        }
        const currentWin = await chrome.windows.getCurrent();
        if (currentWin && currentWin.type === 'normal') {
          await chrome.tabs.create({ windowId: currentWin.id, url: downloadsUrl, active: true });
        } else {
          await chrome.tabs.create({ url: downloadsUrl, active: true });
        }
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_OPEN_SHORTCUTS_SETTINGS') {
    (async () => {
      try {
        const targetUrl = 'chrome://extensions/shortcuts';
        if (sender.tab?.windowId) {
          await chrome.tabs.create({ windowId: sender.tab.windowId, url: targetUrl, active: true });
          sendResponse({ ok: true });
          return;
        }
        await chrome.tabs.create({ url: targetUrl, active: true });
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_GET_INSTALLED_EXTENSIONS') {
    (async () => {
      try {
        const { enabled = false } = await chrome.storage.sync.get({ enabled: false });
        if (!enabled || !await isArcflowActive()) { sendResponse({ ok: true, extensions: [] }); return; }
        const extensions = await getInstalledExtensionsList();
        sendResponse({ ok: true, extensions });
      } catch (err) {
        sendResponse({ ok: false, extensions: [], error: String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'DIA_OPEN_EXTENSION') {
    (async () => {
      if (!message.isSelf) {
        sendResponse({
          ok: false,
          unsupported: true,
          message: 'Use the extension’s native Chrome toolbar icon to open its popup.'
        });
        return;
      }

      try {
        if (typeof chrome.action?.openPopup !== 'function') {
          throw new Error('Chrome action popup API is unavailable');
        }
        const options = sender.tab?.windowId ? { windowId: sender.tab.windowId } : undefined;
        await chrome.action.openPopup(options);
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({
          ok: false,
          unsupported: true,
          error: String(err),
          message: 'Open Arcflow from its native Chrome toolbar icon.'
        });
      }
    })();
    return true;
  }

  return false;
});
