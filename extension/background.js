const SAVE_SELECTED_MENU_ID = "save-selected-text";
const EXPORT_SELECTED_MENU_ID = "export-selected-text";


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


function getLastSelectedNote() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["lastSelectedNote"], (result) => {
      resolve(result.lastSelectedNote || "");
    });
  });
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


async function saveSelectedText(selectedText) {
  try {
    const result = await sendJson("http://localhost:5000/save", {
      note: selectedText
    });

    showNotification("Obsidian Note Exporter", result.message || "Note saved");
  } catch (error) {
    showNotification("Obsidian Note Exporter", "Could not save selected text. Make sure python server.py is running.");
  }
}


async function exportSelectedText(selectedText) {
  const noteTitle = await getLastSelectedNote();

  if (noteTitle === "") {
    showNotification("Obsidian Note Exporter", "Select a note in the extension first.");
    return;
  }

  try {
    const result = await sendJson("http://localhost:5000/export-direct", {
      title: noteTitle,
      text: selectedText
    });

    rememberExportedNote(noteTitle);
    showNotification("Obsidian Note Exporter", result.message || `Exported to: ${noteTitle}`);
  } catch (error) {
    showNotification("Obsidian Note Exporter", error.message || "Could not export selected text.");
  }
}


chrome.runtime.onInstalled.addListener(() => {
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
});


chrome.contextMenus.onClicked.addListener((info) => {
  const selectedText = info.selectionText || "";

  if (selectedText.trim() === "") {
    showNotification("Obsidian Note Exporter", "No selected text found.");
    return;
  }

  if (info.menuItemId === SAVE_SELECTED_MENU_ID) {
    saveSelectedText(selectedText);
  }

  if (info.menuItemId === EXPORT_SELECTED_MENU_ID) {
    exportSelectedText(selectedText);
  }
});
