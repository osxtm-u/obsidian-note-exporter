# Privacy Policy for Obsidian Note Exporter

_Last updated: July 10, 2026_

Obsidian Note Exporter is a Chrome extension and local companion server for saving webpage text, links, and short notes into an Obsidian vault on your own computer.

This policy explains what data the extension and local server access, where that data is stored, and when any content may leave your computer.

## Summary

Obsidian Note Exporter is designed to keep normal note capture and export activity local.

- Notes waiting to be exported are stored locally in `saved_notes.json`.
- Your Obsidian vault path is stored locally in `vault_path.txt`.
- Extension settings, recent notes, theme settings, selected note state, and summary preview state are stored locally in Chrome storage.
- Normal save, queue, export, note picker, theme, shortcut, and settings features do not send your note content to the developer.
- The optional AI summary feature can send selected text or extracted webpage content to OpenAI through your local Flask server when you choose to use that feature.
- The Donate button opens an external PayPal page, but it does not send your notes or vault data to PayPal.

## Data the Extension Accesses

Depending on which features you use, Obsidian Note Exporter may access:

- Text you type into the extension popup.
- Text you highlight on webpages.
- Links you right-click and choose to save or export.
- The current page title and URL when saving a source link or using shortcut fallback behavior.
- Extracted readable page text when you use the AI summary shortcut without highlighted text.
- Names and relative paths of Markdown notes in your configured Obsidian vault, so the extension can show a searchable note picker.
- Local extension settings, such as theme choices, recent notes, selected note, and metadata preferences.

The extension does not read Chrome address-bar text directly. It also rejects browser-internal, extension, empty, and unusable URLs for save/export shortcut behavior.

## Local Storage

Obsidian Note Exporter stores data locally on your computer.

### Local server/project files

The local Flask server and command-line scripts use these runtime files:

- `saved_notes.json` - stores notes waiting to be exported.
- `vault_path.txt` - stores the full local path to your Obsidian vault.

These files may contain personal information, including private notes or local file paths. Do not commit them to Git, upload them publicly, or share them unless you have reviewed their contents.

### Chrome local storage

The Chrome extension uses `chrome.storage.local` for extension-only state, including:

- Recent notes.
- Active selected note.
- Extension settings.
- Theme and custom theme values.
- Summary preview/loading state.

This data stays in your local Chrome profile unless you manually export, share, sync, or back it up through browser/system tools outside of this project.

## Local Server Communication

The extension communicates with the local Flask server at:

```text
http://localhost:5000
```

The local server is used to:

- Save queued notes.
- List notes from your configured Obsidian vault.
- Create new Markdown notes.
- Export queued notes.
- Export selected queued notes.
- Directly append selected text or links to an Obsidian note.
- Preview AI summaries when the optional summary feature is used.

For normal note capture and export features, the extension sends data only to the local server running on your own computer. The local server then writes to local project files and your local Obsidian vault.

## AI Summary Feature

AI summaries are optional.

When you use the summary shortcut or summary feature, Obsidian Note Exporter may send the following content from the local Flask server to OpenAI:

- Highlighted webpage text, if text is selected.
- Extracted readable page content, if no text is selected.
- Optional page metadata such as title, URL, and summary mode.

This content is sent only when you intentionally use the AI summary feature.

The OpenAI API key is read from the local server-side `OPENAI_API_KEY` environment variable. The key is not stored in the Chrome extension, frontend JavaScript, `manifest.json`, or committed project files.

Use of the AI summary feature is also subject to OpenAI's own policies and terms. Review OpenAI's policies before using this feature with sensitive, confidential, private, or regulated information.

## External Services

### OpenAI

OpenAI receives selected text or extracted page content only when you use the optional AI summary feature.

### PayPal

The Donate button opens this external PayPal page:

```text
https://paypal.me/donatext
```

Opening the PayPal page may share ordinary browser request information with PayPal, such as your IP address, browser information, and referrer behavior depending on your browser settings. Obsidian Note Exporter does not intentionally send your notes, queue, vault path, or Obsidian note list to PayPal.

## Data the Developer Receives

The developer does not receive your notes, vault path, queue, selected text, page content, settings, themes, or Obsidian note list through normal extension or local server use.

The developer may receive information only if you choose to provide it directly, such as by:

- Opening a GitHub issue.
- Sending an email or support message.
- Sharing logs, screenshots, project files, or other debugging information.

Before sharing support materials, review them for private notes, local paths, API keys, or other sensitive information.

## Permissions

Obsidian Note Exporter requests Chrome extension permissions needed for its features, such as:

- Storage, for local settings and state.
- Context menus, for right-click save/export actions.
- Notifications, for save/export success and error messages.
- Active tab or scripting-related access, for reading selected text or extracting readable page content when using shortcuts and summary features.
- Access to `http://localhost:5000/*`, so the extension can communicate with the local Flask server.

The exact permission list may change as the project changes. The extension should only request permissions needed to provide its stated features.

## Data Retention and Deletion

Because data is stored locally, you control deletion.

To remove queued notes, use the extension's Clear Queue feature or delete/empty `saved_notes.json`.

To remove the saved vault path, delete or edit `vault_path.txt`.

To remove extension settings, recent notes, themes, or selected-note state, clear the extension's local Chrome storage or remove the extension from Chrome.

To remove generated Obsidian notes or exported content, delete or edit those Markdown files directly in your Obsidian vault.

## Children's Privacy

Obsidian Note Exporter is not intended for children under 13. The project does not knowingly collect personal information from children.

## Changes to This Policy

This privacy policy may be updated as the project changes. The updated version should be included with the public project files and linked from the Chrome Web Store listing if the extension is published there.

## Contact

For support, bug reports, or feature requests, open an issue on GitHub:

```text
https://github.com/osxtm-u/obsidian-note-exporter/issues
```
