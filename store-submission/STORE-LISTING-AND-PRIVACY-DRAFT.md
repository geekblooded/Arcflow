# Chrome Web Store update — Arcflow

Status: Draft update to the existing Arcflow listing. The unpublished 1.0.1 submission candidate is `arcflow-1.0.1-rev2.zip`. The original 1.0.1 ZIP is retained as a backup.

## Store listing

**Name**  
Arcflow

**Short description**  
Bring Arc-inspired tabs, sidebar navigation, and workspace controls to Chrome.

**Detailed description**  
Arcflow brings Arc-inspired navigation to Google Chrome with a left-side tab sidebar, a focused command bar, searchable tabs, tab groups and nested folders, download controls, an embedded settings panel, and optional page styling. Use keyboard shortcuts to search tabs, enter or copy URLs, organize tabs, and reach browser controls.

On a new installation, Arcflow stays off until you review its onboarding notice and choose to enable it. After activation, tab titles and URLs are processed on your device to show and organize tabs. A clicked link destination is read only when you use a supported link-opening gesture. Download records and installed extension details are read only when you open those panels. Arcflow does not send this information to a developer-operated service. Search text is sent to your selected provider only when you submit a search. Chrome may sync preferences and your workspace name when Chrome Sync is enabled. Arcflow does not read page text, images, forms, or page storage.

Arcflow does not replace Chrome's New Tab page. Some browser-controlled pages, including Chrome internal pages and Chrome Web Store pages, restrict extension features.

**Category**
Productivity

**Language**  
English

**Support email**
gaurav.sathe16@gmail.com

**Homepage / support URL**  
https://geekblooded.github.io/Arcflow/

**Privacy policy URL**
https://geekblooded.github.io/Arcflow/privacy.html

## Dashboard answers to review

### Single purpose

Arcflow provides Arc-inspired tab navigation and browser workspace controls in Google Chrome, including a sidebar, command bar, tab organization, download controls, and optional page styling.

### Remote code

**No.** The package does not load or execute remotely hosted JavaScript or WebAssembly. User-entered search terms are sent to the selected search provider only when the user submits a search.

### Data types

- **Web history:** Select. Arcflow reads tab titles and URLs locally to provide sidebar, search, switching, navigation, and organization features.
- **Website content:** Select, then explain narrowly. Arcflow reads the current page title and URL and, only when a supported link-opening gesture is used, the clicked hyperlink destination. It does not read page body text, images, media, form entries, or page storage.
- **User activity:** Select, then explain narrowly. Click, key, and pointer events are handled transiently to operate controls and reveal the sidebar. Arcflow does not record or retain event logs or browsing behavior analytics.
- **Search queries:** Select if the Dashboard offers this category. Search text entered in Arcflow is sent to the provider selected in settings only when you submit a search; it is not saved as a search history.
- **Files and documents / downloads:** Select the corresponding category if the Dashboard offers one. Arcflow reads download filenames and metadata (a filename may include its local path) when you open the downloads panel, but it does not read downloaded file contents.
- **Personally identifiable information:** Select and disclose that titles, URLs, and download filenames/paths may incidentally contain identifying details. Arcflow does not request or extract identity fields as a separate feature.
- **Other data:** Download metadata, installed extension details, and preferences are accessed for their corresponding interface features. Download data is read when that panel is opened. Preferences and workspace name may sync through Chrome Sync. None of this is sent to an Arcflow-operated service.
- **Do not select:** Health, financial/payment, authentication, personal communications, and location. Arcflow does not access these as separate data types or features.

These are conservative data-type recommendations based on the current package behavior. In the Dashboard, describe local processing and user-facing purposes for every selected type; do not equate local access with transmission to the developer.

### Limited use and sharing

The extension uses Chrome API information only to provide its disclosed navigation, tab management, downloads, extension information, and styling features. The developer does not sell user data, use it for personalized or retargeted advertising, transfer it to data brokers, or provide it to a developer-operated service. Search query transmission occurs only when the user submits a search to the chosen provider. Chrome Sync may transmit preferences when enabled by the user.

### Permission justifications

- **`storage`:** Save appearance and feature preferences and local workspace state.
- **`tabs`:** Read tab titles and URLs for the sidebar and command bar and create, switch, move, group, pin, update, or close tabs in response to user actions.
- **`tabGroups`:** Create and manage Chrome tab groups and nested folder organization.
- **`sessions`:** Restore a recently closed tab or window when the user requests it.
- **`webNavigation`:** Detect eligible navigation errors and show the extension’s recovery interface.
- **`downloads`:** Display and search Chrome download records and reveal a selected file.
- **`downloads.open`:** Open a selected completed download after the user chooses that action.
- **`scripting`:** Add or refresh Arcflow's sidebar, command bar, and optional styling on eligible web pages.
- **`management`:** Display installed extension details and icons in Arcflow's interface.
- **`<all_urls>` host access:** Provide the in-page interface and optional styling across sites. Chrome internal and other browser-restricted pages remain inaccessible.

## Privacy policy URL content

The public policy is maintained in `docs/privacy.html`. Its effective date is November 19, 2026. Before submission, publish the latest version at the URL above and confirm that it matches the uploaded package.

## Assets and release file

- Upload: the approved update ZIP from this folder. Confirm its manifest version is higher than the published version.
- Store icon: use `icons/icon-128.png` (128 × 128 PNG)
- Screenshots: add current screenshots from the final extension build in the Dashboard; do not use the website's illustrative browser mockup as if it were a functional extension screenshot.

## Before submitting

1. Install the unpacked contents of the approved ZIP in a clean Chrome profile and test before uploading it to the existing Arcflow item.
2. Set the listing name, description, support email, homepage URL, and privacy URL above.
3. Complete each Dashboard data-use field and permission declaration to match the package and policy. Check “No” for remotely hosted executable code. The Dashboard's public disclosures are your certification.
4. Upload real screenshots of the extension's current UI.
5. Review the live policy URL, then submit the item for review.
