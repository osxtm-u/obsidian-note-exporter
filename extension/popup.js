const noteInput = document.getElementById("note");
const searchInput = document.getElementById("note-search");
const noteList = document.getElementById("note-list");
const saveButton = document.getElementById("save-button");
const exportButton = document.getElementById("export-button");
const statusMessage = document.getElementById("status");
const queueCount = document.getElementById("queue-count");
const queueList = document.getElementById("queue-list");
const saveExportTab = document.getElementById("save-export-tab");
const queueTab = document.getElementById("queue-tab");
const saveExportPanel = document.getElementById("save-export-panel");
const queuePanel = document.getElementById("queue-panel");
const clearQueueButton = document.getElementById("clear-queue-button");
let vaultNotes = [];
let lastSelectedNote = "";
let recentNotes = [];


function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
}


async function showTab(tabName) {
  const showQueue = tabName === "queue";

  saveExportTab.classList.toggle("active", !showQueue);
  queueTab.classList.toggle("active", showQueue);
  saveExportPanel.classList.toggle("active", !showQueue);
  queuePanel.classList.toggle("active", showQueue);

  if (showQueue) {
    await loadQueuedNotes();
  }
}


function getStoredSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["lastSelectedNote", "recentNotes"], (result) => {
      resolve({
        lastSelectedNote: result.lastSelectedNote || "",
        recentNotes: result.recentNotes || []
      });
    });
  });
}


function saveStoredSettings() {
  chrome.storage.local.set({
    lastSelectedNote: lastSelectedNote,
    recentNotes: recentNotes
  });
}


function cleanRecentNotes(notes) {
  const cleanedNotes = [];

  for (const note of notes) {
    if (vaultNotes.includes(note) && !cleanedNotes.includes(note)) {
      cleanedNotes.push(note);
    }
  }

  return cleanedNotes.slice(0, 3);
}


function addDivider(label) {
  const option = document.createElement("option");
  option.textContent = label;
  option.disabled = true;
  option.value = "";
  noteList.appendChild(option);
}


function addNoteOption(note) {
  const option = document.createElement("option");
  option.value = note;
  option.textContent = note;
  noteList.appendChild(option);
}


function getFirstSelectableNote() {
  for (const option of noteList.options) {
    if (!option.disabled && option.value !== "") {
      return option.value;
    }
  }

  return "";
}


function showNotes(notes, preferredNote) {
  noteList.innerHTML = "";

  const matchingRecentNotes = recentNotes.filter((note) => {
    return notes.includes(note);
  });
  const allNotes = notes.filter((note) => {
    return !matchingRecentNotes.includes(note);
  });

  if (matchingRecentNotes.length > 0) {
    addDivider("--- Recent Notes ---");

    for (const note of matchingRecentNotes) {
      addNoteOption(note);
    }
  }

  if (allNotes.length > 0) {
    addDivider("--- All Notes ---");

    for (const note of allNotes) {
      addNoteOption(note);
    }
  }

  if (notes.length === 0) {
    return;
  }

  if (preferredNote !== "" && notes.includes(preferredNote)) {
    noteList.value = preferredNote;
  } else {
    noteList.value = getFirstSelectableNote();
  }
}


function filterNotes() {
  const searchText = searchInput.value.trim().toLowerCase();
  const matchingNotes = vaultNotes.filter((note) => {
    return note.toLowerCase().includes(searchText);
  });

  showNotes(matchingNotes, lastSelectedNote);
}


function showQueuedNotes(notes) {
  queueList.innerHTML = "";
  clearQueueButton.disabled = notes.length === 0;

  if (notes.length === 0) {
    queueCount.textContent = "0 notes queued";

    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-queue";
    emptyMessage.textContent = "No queued notes.";
    queueList.appendChild(emptyMessage);
    return;
  }

  queueCount.textContent = `${notes.length} notes queued`;

  notes.forEach((note, index) => {
    const row = document.createElement("div");
    row.className = "queue-row";

    const noteItem = document.createElement("div");
    noteItem.className = "queue-note";
    noteItem.textContent = note;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-note-button";
    deleteButton.type = "button";
    deleteButton.title = "Delete queued note";
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => {
      deleteQueuedNote(index);
    });

    row.appendChild(noteItem);
    row.appendChild(deleteButton);
    queueList.appendChild(row);
  });
}


async function loadQueuedNotes() {
  try {
    const response = await fetch("http://localhost:5000/queue");
    const result = await response.json();

    if (response.ok) {
      showQueuedNotes(result.notes || []);
    } else {
      showQueuedNotes([]);
    }
  } catch (error) {
    showQueuedNotes([]);
  }
}


async function deleteQueuedNote(index) {
  try {
    const response = await fetch(`http://localhost:5000/queue/${index}`, {
      method: "DELETE"
    });

    if (response.ok) {
      await loadQueuedNotes();
    }
  } catch (error) {
    await loadQueuedNotes();
  }
}


async function clearQueue() {
  const shouldClear = confirm("Clear all queued notes?");

  if (!shouldClear) {
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/queue", {
      method: "DELETE"
    });

    if (response.ok) {
      await loadQueuedNotes();
    }
  } catch (error) {
    await loadQueuedNotes();
  }
}


async function loadVaultNotes() {
  try {
    const response = await fetch("http://localhost:5000/notes");
    const result = await response.json();

    if (response.ok) {
      vaultNotes = result.notes || [];
      const storedSettings = await getStoredSettings();
      lastSelectedNote = storedSettings.lastSelectedNote;
      recentNotes = cleanRecentNotes(storedSettings.recentNotes);

      if (lastSelectedNote !== "" && !vaultNotes.includes(lastSelectedNote)) {
        lastSelectedNote = "";
      }

      saveStoredSettings();
      showNotes(vaultNotes, lastSelectedNote);

      if (vaultNotes.length === 0) {
        showStatus("No Obsidian notes found in the vault.", "error");
      }
    } else {
      showStatus(result.message || "Could not load Obsidian notes.", "error");
    }
  } catch (error) {
    showStatus("Could not reach the local server. Make sure python server.py is running.", "error");
  }
}


async function saveNote() {
  const noteText = noteInput.value.trim();

  if (noteText === "") {
    showStatus("Please enter a note before saving.", "error");
    return;
  }

  saveButton.disabled = true;
  showStatus("Saving...", "");

  try {
    const response = await fetch("http://localhost:5000/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        note: noteText
      })
    });

    const result = await response.json();

    if (response.ok) {
      noteInput.value = "";
      await loadQueuedNotes();
      showStatus(result.message || "Note saved", "success");
    } else {
      showStatus(result.message || "The note could not be saved.", "error");
    }
  } catch (error) {
    showStatus("Could not reach the local server. Make sure python server.py is running.", "error");
  }

  saveButton.disabled = false;
}


async function exportNotes() {
  const noteTitle = noteList.value;

  if (noteTitle === "") {
    showStatus("Please select an Obsidian note.", "error");
    return;
  }

  exportButton.disabled = true;
  showStatus("Exporting...", "");

  try {
    const response = await fetch("http://localhost:5000/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: noteTitle
      })
    });

    const result = await response.json();

    if (response.ok) {
      rememberSelectedNote();
      await loadQueuedNotes();
      showStatus(result.message || "Notes exported", "success");
    } else {
      showStatus(result.message || "The notes could not be exported.", "error");
    }
  } catch (error) {
    showStatus("Could not reach the local server. Make sure python server.py is running.", "error");
  }

  exportButton.disabled = false;
}


function rememberSelectedNote() {
  lastSelectedNote = noteList.value;

  if (lastSelectedNote !== "") {
    recentNotes = recentNotes.filter((note) => {
      return note !== lastSelectedNote;
    });
    recentNotes.unshift(lastSelectedNote);
    recentNotes = cleanRecentNotes(recentNotes);
    saveStoredSettings();
    filterNotes();
  }
}


saveButton.addEventListener("click", saveNote);
exportButton.addEventListener("click", exportNotes);
searchInput.addEventListener("input", filterNotes);
noteList.addEventListener("change", rememberSelectedNote);
saveExportTab.addEventListener("click", () => {
  showTab("save-export");
});
queueTab.addEventListener("click", () => {
  showTab("queue");
});
clearQueueButton.addEventListener("click", clearQueue);
loadVaultNotes();
loadQueuedNotes();
