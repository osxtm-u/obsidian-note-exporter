const SAVE_SELECTED_MENU_ID = "save-selected-text";
const EXPORT_SELECTED_MENU_ID = "export-selected-text";
const SAVE_LINK_MENU_ID = "save-link";
const EXPORT_LINK_MENU_ID = "export-link";
const OPEN_EXTENSION_POPUP_COMMAND_ID = "open-extension-popup";
const SAVE_SELECTION_SHORTCUT_ID = "save-selection-to-queue-shortcut";
const EXPORT_SELECTION_SHORTCUT_ID = "export-selection-direct-shortcut";
const SUMMARIZE_SHORTCUT_ID = "summarize-selection-or-page-shortcut";
const SUMMARY_PAGE_TEXT_LIMIT = 60000;
const SUMMARY_MIN_PAGE_TEXT_LENGTH = 250;


function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    title: title,
    message: message
  }, () => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
  });
}


function getActiveSelectedNote() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["activeSelectedNote"], (result) => {
      resolve(result.activeSelectedNote || "");
    });
  });
}


function setSummaryState(summaryState) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      summaryState: summaryState
    }, resolve);
  });
}


async function openExtensionPopup() {
  try {
    await chrome.action.openPopup();
  } catch (error) {
    console.log("Could not open popup automatically:", error.message);
  }
}


function getCaptureSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["addDateTime", "addSourceLink"], (result) => {
      resolve({
        addDateTime: result.addDateTime === true,
        addSourceLink: result.addSourceLink === true
      });
    });
  });
}


function formatCaptureDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = String(date.getFullYear()).slice(-2);
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() >= 12 ? "PM" : "AM";
  const hour = date.getHours() % 12 || 12;

  return `${month}-${day}-${year}, ${hour}:${minutes} ${period}`;
}


function getUsableUrl(urlText) {
  try {
    const url = new URL(urlText);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch (error) {
    return null;
  }
}


function escapeMarkdownText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
}


function makeMarkdownLink(urlText, preferredText, fallbackText = "") {
  const url = getUsableUrl(urlText);

  if (url === null) {
    return "";
  }

  let title = typeof preferredText === "string" ? preferredText.trim() : "";

  if (title === "" && typeof fallbackText === "string") {
    title = fallbackText.trim();
  }

  if (title === "") {
    title = "Source";
  }

  const safeTitle = escapeMarkdownText(title);
  const safeUrl = url.href.replace(/\(/g, "%28").replace(/\)/g, "%29");

  return `[${safeTitle}](${safeUrl})`;
}


function makeMarkdownSource(tab) {
  if (!tab) {
    return "";
  }

  return makeMarkdownLink(tab.url, tab.title, "Source");
}


function urlsMatch(firstUrl, secondUrl) {
  const first = getUsableUrl(firstUrl);
  const second = getUsableUrl(secondUrl);

  return first !== null && second !== null && first.href === second.href;
}


async function formatCapturedText(text, tab, capturedUrl = "") {
  const settings = await getCaptureSettings();
  const additions = [];
  const capturedAt = new Date();

  if (settings.addDateTime) {
    additions.push(formatCaptureDate(capturedAt));
  }

  if (settings.addSourceLink) {
    const source = makeMarkdownSource(tab);
    const sourceDuplicatesCapturedLink = tab && urlsMatch(tab.url, capturedUrl);

    if (source !== "" && !sourceDuplicatesCapturedLink) {
      additions.push(source);
    }
  }

  if (additions.length === 0) {
    return text;
  }

  return `${text} \u2013 ${additions.join(" \u2013 ")}`;
}


async function sendJson(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}


function rememberExportedNote(noteTitle) {
  chrome.storage.local.get(["recentNotes"], (result) => {
    let recentNotes = result.recentNotes || [];

    recentNotes = recentNotes.filter((note) => {
      return note !== noteTitle;
    });
    recentNotes.unshift(noteTitle);
    recentNotes = recentNotes.slice(0, 3);

    chrome.storage.local.set({
      recentNotes: recentNotes
    });
  });
}


async function saveSelectedText(selectedText, tab, capturedUrl = "") {
  try {
    const formattedText = await formatCapturedText(selectedText, tab, capturedUrl);
    const result = await sendJson("http://localhost:5000/save", {
      note: formattedText
    });

    showNotification("Obsidian Note Exporter", result.message || "Note saved");
  } catch (error) {
    showNotification("Obsidian Note Exporter", "Could not save the captured text or link. Make sure python server.py is running.");
  }
}


async function exportSelectedText(selectedText, tab, capturedUrl = "") {
  const noteTitle = await getActiveSelectedNote();

  if (noteTitle === "") {
    showNotification("Obsidian Note Exporter", "Select a note in the extension first.");
    return;
  }

  try {
    const formattedText = await formatCapturedText(selectedText, tab, capturedUrl);
    const result = await sendJson("http://localhost:5000/export-direct", {
      title: noteTitle,
      text: formattedText
    });

    rememberExportedNote(noteTitle);
    showNotification("Obsidian Note Exporter", result.message || `Exported to: ${noteTitle}`);
  } catch (error) {
    showNotification("Obsidian Note Exporter", error.message || "Could not export the captured text or link.");
  }
}


function makeSummaryLabel(mode) {
  return mode === "page" ? "This page" : "Highlighted text";
}


function getSummaryErrorMessage(error) {
  return error.message === "Failed to fetch"
    ? "Could not reach the local server. Make sure python server.py is running."
    : error.message || "Could not generate a summary.";
}


function createSummaryState(status, message, summarySource) {
  return {
    status: status,
    message: message,
    mode: summarySource.mode,
    label: makeSummaryLabel(summarySource.mode),
    title: summarySource.title || "",
    url: summarySource.url || "",
    originalText: summarySource.text || "",
    summary: "",
    updatedAt: Date.now()
  };
}


async function extractReadablePageContent(tab) {
  if (!tab || tab.id === undefined || !getUsableUrl(tab.url)) {
    return {
      text: "",
      title: "",
      url: ""
    };
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      func: (textLimit) => {
        function cleanText(text) {
          return String(text || "")
            .replace(/\r/g, "\n")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/[ \t]{2,}/g, " ")
            .trim();
        }

        function textFromElement(element) {
          if (!element) {
            return "";
          }

          const clone = element.cloneNode(true);
          const removeSelectors = [
            "script",
            "style",
            "noscript",
            "svg",
            "canvas",
            "iframe",
            "nav",
            "header",
            "footer",
            "aside",
            "form",
            "button",
            "input",
            "select",
            "textarea",
            "[role='navigation']",
            "[role='banner']",
            "[role='contentinfo']",
            "[role='complementary']",
            "[role='dialog']",
            "[aria-modal='true']",
            "[class*='cookie' i]",
            "[id*='cookie' i]",
            "[class*='banner' i]",
            "[class*='sidebar' i]",
            "[class*='nav' i]",
            "[class*='menu' i]",
            "[class*='footer' i]",
            "[class*='header' i]",
            "[class*='advert' i]",
            "[class*='ad-' i]"
          ];

          for (const selector of removeSelectors) {
            for (const node of clone.querySelectorAll(selector)) {
              node.remove();
            }
          }

          return cleanText(clone.innerText);
        }

        const selectors = [
          "article",
          "main",
          "[role='main']",
          "[class*='article' i]",
          "[class*='post-content' i]",
          "[class*='entry-content' i]",
          "[class*='story' i]",
          "[class*='content' i]",
          "[id*='article' i]",
          "[id*='content' i]"
        ];
        let bestText = "";

        for (const selector of selectors) {
          for (const element of document.querySelectorAll(selector)) {
            const text = textFromElement(element);

            if (text.length > bestText.length) {
              bestText = text;
            }
          }

          if (bestText.length >= 1200 && (selector === "article" || selector === "main")) {
            break;
          }
        }

        if (bestText.length < 500) {
          bestText = textFromElement(document.body);
        }

        if (bestText.length > textLimit) {
          bestText = bestText.slice(0, textLimit);
        }

        return {
          text: bestText,
          title: document.title || "",
          url: location.href
        };
      },
      args: [SUMMARY_PAGE_TEXT_LIMIT]
    });

    if (results.length === 0 || !results[0].result) {
      return {
        text: "",
        title: "",
        url: ""
      };
    }

    return results[0].result;
  } catch (error) {
    return {
      text: "",
      title: "",
      url: ""
    };
  }
}


async function getSummarySource() {
  const selection = await getSelectionFromActiveTab();
  const selectedText = selection.text.trim();

  if (selectedText !== "") {
    return {
      mode: "selected",
      text: selection.text,
      title: selection.tab && selection.tab.title ? selection.tab.title : "",
      url: selection.tab && selection.tab.url ? selection.tab.url : ""
    };
  }

  const tabUrl = selection.tab ? selection.tab.url : "";

  if (!getUsableUrl(tabUrl)) {
    throw new Error("This page cannot be summarized. Highlight webpage text instead.");
  }

  const pageContent = await extractReadablePageContent(selection.tab);
  const pageText = String(pageContent.text || "").trim();

  if (pageText.length < SUMMARY_MIN_PAGE_TEXT_LENGTH) {
    throw new Error("Could not find readable page content. Highlight text instead.");
  }

  return {
    mode: "page",
    text: pageText,
    title: pageContent.title || (selection.tab ? selection.tab.title : ""),
    url: pageContent.url || tabUrl
  };
}


async function summarizeSelectedText() {
  let summarySource;

  try {
    summarySource = await getSummarySource();
  } catch (error) {
    summarySource = {
      mode: "selected",
      text: "",
      title: "",
      url: ""
    };
    await setSummaryState(createSummaryState("error", error.message, summarySource));
    await openExtensionPopup();
    return;
  }

  await setSummaryState(createSummaryState("loading", "Summarizing...", summarySource));
  openExtensionPopup();

  try {
    const result = await sendJson("http://localhost:5000/summarize", {
      text: summarySource.text,
      mode: summarySource.mode,
      title: summarySource.title,
      url: summarySource.url
    });

    const summaryState = createSummaryState("success", result.message || "Summary ready.", summarySource);
    summaryState.summary = result.summary || "";
    await setSummaryState(summaryState);
  } catch (error) {
    await setSummaryState(createSummaryState("error", getSummaryErrorMessage(error), summarySource));
  }
}


async function getSelectionFromActiveTab() {
  let tabs = [];

  try {
    tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
  } catch (error) {
    return {
      text: "",
      tab: null
    };
  }

  if (tabs.length === 0 || tabs[0].id === undefined) {
    return {
      text: "",
      tab: null
    };
  }

  const tab = tabs[0];

  try {
    const results = await chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      func: () => window.getSelection().toString()
    });

    if (results.length === 0 || typeof results[0].result !== "string") {
      return {
        text: "",
        tab: tab
      };
    }

    return {
      text: results[0].result,
      tab: tab
    };
  } catch (error) {
    return {
      text: "",
      tab: tab
    };
  }
}


async function getVisibleLinkText(tab, linkUrl) {
  if (!tab || tab.id === undefined) {
    return "";
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      args: [linkUrl],
      func: (targetUrl) => {
        const matchingLink = Array.from(document.links).find((link) => {
          return link.href === targetUrl && link.textContent.trim() !== "";
        });

        return matchingLink ? matchingLink.textContent.trim() : "";
      }
    });

    return results.length > 0 && typeof results[0].result === "string"
      ? results[0].result
      : "";
  } catch (error) {
    return "";
  }
}


function handleCapturedTextAction(actionId, capturedText, tab, capturedUrl = "") {
  if (capturedText.trim() === "") {
    showNotification("Obsidian Note Exporter", "No highlighted text or usable page link found.");
    return;
  }

  if (actionId === SAVE_SELECTED_MENU_ID || actionId === SAVE_LINK_MENU_ID) {
    saveSelectedText(capturedText, tab, capturedUrl);
  }

  if (actionId === EXPORT_SELECTED_MENU_ID || actionId === EXPORT_LINK_MENU_ID) {
    exportSelectedText(capturedText, tab, capturedUrl);
  }
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: SAVE_SELECTED_MENU_ID,
      title: "Save selected text to queue",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: EXPORT_SELECTED_MENU_ID,
      title: "Export selected text to last selected note",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: SAVE_LINK_MENU_ID,
      title: "Save link to queue",
      contexts: ["link"]
    });

    chrome.contextMenus.create({
      id: EXPORT_LINK_MENU_ID,
      title: "Export link to selected Obsidian note",
      contexts: ["link"]
    });
  });
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === SAVE_LINK_MENU_ID || info.menuItemId === EXPORT_LINK_MENU_ID) {
    const visibleLinkText = info.selectionText || await getVisibleLinkText(tab, info.linkUrl);
    const fallbackTitle = tab && typeof tab.title === "string" ? tab.title : "";
    const markdownLink = makeMarkdownLink(info.linkUrl, visibleLinkText, fallbackTitle);

    handleCapturedTextAction(info.menuItemId, markdownLink, tab, info.linkUrl || "");
    return;
  }

  handleCapturedTextAction(info.menuItemId, info.selectionText || "", tab);
});


async function handleSelectionShortcut(actionId) {
  const selection = await getSelectionFromActiveTab();
  const selectedText = selection.text.trim();

  if (selectedText !== "") {
    handleCapturedTextAction(actionId, selection.text, selection.tab);
    return;
  }

  const tabUrl = selection.tab ? selection.tab.url : "";
  const tabTitle = selection.tab ? selection.tab.title : "";
  const markdownLink = makeMarkdownLink(tabUrl, tabTitle, "Source");

  handleCapturedTextAction(actionId, markdownLink, selection.tab, tabUrl);
}


chrome.commands.onCommand.addListener((command) => {
  console.log("Shortcut command received:", command);

  if (command === OPEN_EXTENSION_POPUP_COMMAND_ID) {
    openExtensionPopup();
    return;
  }

  if (command === SAVE_SELECTION_SHORTCUT_ID) {
    handleSelectionShortcut(SAVE_SELECTED_MENU_ID);
    return;
  }

  if (command === EXPORT_SELECTION_SHORTCUT_ID) {
    handleSelectionShortcut(EXPORT_SELECTED_MENU_ID);
    return;
  }

  if (command === SUMMARIZE_SHORTCUT_ID) {
    summarizeSelectedText();
  }
});
