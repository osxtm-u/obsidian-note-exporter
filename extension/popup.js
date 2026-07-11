const DONATION_URL = "https://paypal.me/donatext";

const noteInput = document.getElementById("note");
const searchInput = document.getElementById("note-search");
const noteList = document.getElementById("note-list");
const saveButton = document.getElementById("save-button");
const exportButton = document.getElementById("export-button");
const donateLink = document.getElementById("donate-link");
const statusMessage = document.getElementById("status");
const queueCount = document.getElementById("queue-count");
const queueList = document.getElementById("queue-list");
const saveExportTab = document.getElementById("save-export-tab");
const queueTab = document.getElementById("queue-tab");
const settingsTab = document.getElementById("settings-tab");
const summaryTab = document.getElementById("summary-tab");
const saveExportPanel = document.getElementById("save-export-panel");
const queuePanel = document.getElementById("queue-panel");
const settingsPanel = document.getElementById("settings-panel");
const summaryPanel = document.getElementById("summary-panel");
const clearQueueButton = document.getElementById("clear-queue-button");
const clearConfirmation = document.getElementById("clear-confirmation");
const cancelClearQueueButton = document.getElementById("cancel-clear-queue-button");
const confirmClearQueueButton = document.getElementById("confirm-clear-queue-button");
const selectAllCheckbox = document.getElementById("select-all-checkbox");
const selectedCount = document.getElementById("selected-count");
const exportSelectedButton = document.getElementById("export-selected-button");
const queueStatus = document.getElementById("queue-status");
const showTrashNotesCheckbox = document.getElementById("show-trash-notes");
const addSelectedToRecentsCheckbox = document.getElementById("add-selected-to-recents");
const addDateTimeCheckbox = document.getElementById("add-date-time");
const addSourceLinkCheckbox = document.getElementById("add-source-link");
const settingsStatus = document.getElementById("settings-status");
const summaryMessage = document.getElementById("summary-message");
const summarySource = document.getElementById("summary-source");
const summaryText = document.getElementById("summary-text");
const originalTextWrapper = document.getElementById("original-text-wrapper");
const originalTextLabel = document.getElementById("original-text-label");
const originalText = document.getElementById("original-text");
const closeSummaryButton = document.getElementById("close-summary-button");
const colorPaletteSelect = document.getElementById("color-palette");
const themeColorFields = document.getElementById("theme-color-fields");
const resetPaletteButton = document.getElementById("reset-palette-button");
const resetAllThemesButton = document.getElementById("reset-all-themes-button");
const resetThemesConfirmation = document.getElementById("reset-themes-confirmation");
const cancelResetThemesButton = document.getElementById("cancel-reset-themes-button");
const confirmResetThemesButton = document.getElementById("confirm-reset-themes-button");
const newThemeNameInput = document.getElementById("new-theme-name");
const saveNewThemeButton = document.getElementById("save-new-theme-button");
const deleteCustomThemeButton = document.getElementById("delete-custom-theme-button");
const deleteThemeConfirmation = document.getElementById("delete-theme-confirmation");
const deleteThemeConfirmationText = document.getElementById("delete-theme-confirmation-text");
const cancelDeleteThemeButton = document.getElementById("cancel-delete-theme-button");
const confirmDeleteThemeButton = document.getElementById("confirm-delete-theme-button");
const builtInPaletteIds = ["afterglow", "ether", "pastel", "neonRose"];
const paletteNames = {
  neonRose: "Neon Rose",
  afterglow: "Afterglow",
  pastel: "Pastel",
  ether: "Ether"
};
const themeColorFieldsConfig = [
  {
    key: "background",
    label: "Background",
    variables: ["--page-bg"]
  },
  {
    key: "surface",
    label: "Surface / card background",
    variables: ["--surface", "--surface-muted"]
  },
  {
    key: "borderFocus",
    label: "Border / focus color",
    variables: ["--border", "--focus-color"]
  },
  {
    key: "mainText",
    label: "Main text color",
    variables: ["--text-main"]
  }
];
const gradientColorFieldsConfig = [
  {
    key: "gradientStart",
    label: "Gradient start"
  },
  {
    key: "gradientMiddle",
    label: "Gradient middle"
  },
  {
    key: "gradientEnd",
    label: "Gradient end"
  }
];
const dangerColorFieldsConfig = [
  {
    key: "dangerSoftBackground",
    label: "Danger soft background",
    variables: ["--danger-soft", "--danger", "--danger-hover"]
  },
  {
    key: "dangerText",
    label: "Danger text",
    variables: ["--danger-text", "--danger-button-text"]
  },
  {
    key: "neutralButtonBackground",
    label: "Neutral button background",
    variables: ["--neutral-button"]
  }
];
const derivedTextVariables = [
  "--text-muted",
  "--text-soft",
  "--placeholder",
  "--disabled-text",
  "--accent-text",
  "--accent-soft-text"
];
const gradientThemeVariables = [
  "--accent",
  "--accent-soft",
  "--accent-dark",
  "--primary-gradient",
  "--primary-gradient-hover",
  "--primary-action-bg",
  "--primary-action-bg-hover",
  "--secondary-action-bg",
  "--secondary-action-bg-hover",
  "--donate-bg",
  "--donate-bg-hover"
];
const builtInThemeColors = {
  neonRose: {
    background: "#07030a",
    surface: "#120713",
    borderFocus: "#8f1d72",
    mainText: "#fff4fc",
    gradientStart: "#f52aa8",
    gradientMiddle: "#b93dde",
    gradientEnd: "#8b5cff",
    dangerSoftBackground: "#3b1026",
    dangerText: "#ffd7ec",
    neutralButtonBackground: "#251128"
  },
  afterglow: {
    background: "#000000",
    surface: "#080505",
    borderFocus: "#241111",
    mainText: "#f2f2f2",
    gradientStart: "#1a0061",
    gradientMiddle: "#420040",
    gradientEnd: "#2e0000",
    dangerSoftBackground: "#2b0303",
    dangerText: "#cbc8c8",
    neutralButtonBackground: "#2b0303"
  },
  pastel: {
    background: "#ffeae6",
    surface: "#fff4f1",
    borderFocus: "#c9b9d9",
    mainText: "#2a2634",
    gradientStart: "#c2c3f3",
    gradientMiddle: "#eec4d7",
    gradientEnd: "#ffdce4",
    dangerSoftBackground: "#eec4d7",
    dangerText: "#35283c",
    neutralButtonBackground: "#c9b9d9"
  },
  ether: {
    background: "#02030a",
    surface: "#080716",
    borderFocus: "#32105c",
    mainText: "#f4f7ff",
    gradientStart: "#24b8ff",
    gradientMiddle: "#8755ff",
    gradientEnd: "#c13cff",
    dangerSoftBackground: "#421026",
    dangerText: "#ffd8e0",
    neutralButtonBackground: "#17112e"
  }
};
const editableThemeVariables = Array.from(new Set(
  themeColorFieldsConfig.flatMap((field) => {
    return field.variables;
  }).concat(dangerColorFieldsConfig.flatMap((field) => {
    return field.variables;
  })).concat(derivedTextVariables)
));
let vaultNotes = [];
let activeSelectedNote = "";
let recentNotes = [];
let queuedNotes = [];
let selectedQueueIndexes = new Set();
let showTrashNotes = false;
let addSelectedNotesToRecents = false;
let addDateTime = false;
let addSourceLink = false;
let colorPalette = "afterglow";
let customThemes = {};
let currentSummaryState = null;
let isCreatingNote = false;
let builtInThemeOverrides = {};


function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
}


function showQueueStatus(message, type) {
  queueStatus.textContent = message;
  queueStatus.className = type;
}


function showSettingsStatus(message, type) {
  settingsStatus.textContent = message;
  settingsStatus.className = type;
}


function normalizeHexColor(value) {
  const text = String(value || "").trim();
  const colorText = text.startsWith("#") ? text.slice(1) : text;

  if (/^[0-9a-fA-F]{6}$/.test(colorText)) {
    return `#${colorText}`.toLowerCase();
  }

  return "";
}


function normalizeHexForDisplay(value) {
  const color = normalizeHexColor(value);

  return color === "" ? "" : color.toUpperCase();
}


function hexToRgb(color) {
  const hex = normalizeHexColor(color);

  if (hex === "") {
    return null;
  }

  return {
    red: parseInt(hex.slice(1, 3), 16),
    green: parseInt(hex.slice(3, 5), 16),
    blue: parseInt(hex.slice(5, 7), 16)
  };
}


function rgbToHex(rgb) {
  const toHex = (channel) => {
    return Math.max(0, Math.min(255, Math.round(channel)))
      .toString(16)
      .padStart(2, "0");
  };

  return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
}


function parseCssColor(color) {
  const normalizedHex = normalizeHexColor(color);

  if (normalizedHex !== "") {
    return hexToRgb(normalizedHex);
  }

  const rgbMatch = String(color || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

  if (!rgbMatch) {
    return null;
  }

  return {
    red: Number(rgbMatch[1]),
    green: Number(rgbMatch[2]),
    blue: Number(rgbMatch[3])
  };
}


function blendColors(firstColor, secondColor, firstWeight) {
  const firstRgb = parseCssColor(firstColor);
  const secondRgb = parseCssColor(secondColor);

  if (!firstRgb || !secondRgb) {
    return normalizeHexColor(firstColor) || normalizeHexColor(secondColor) || "#000000";
  }

  const secondWeight = 1 - firstWeight;

  return rgbToHex({
    red: (firstRgb.red * firstWeight) + (secondRgb.red * secondWeight),
    green: (firstRgb.green * firstWeight) + (secondRgb.green * secondWeight),
    blue: (firstRgb.blue * firstWeight) + (secondRgb.blue * secondWeight)
  });
}


function getRelativeLuminance(color) {
  const rgb = parseCssColor(color);

  if (!rgb) {
    return 0;
  }

  const channels = [rgb.red, rgb.green, rgb.blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}


function getContrastRatio(firstColor, secondColor) {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}


function getReadableTextColor(backgroundColor) {
  const darkText = "#111827";
  const lightText = "#ffffff";
  const darkTextContrast = getContrastRatio(backgroundColor, darkText);
  const lightTextContrast = getContrastRatio(backgroundColor, lightText);

  return darkTextContrast >= lightTextContrast ? darkText : lightText;
}


function getGradientTextColor(startColor, middleColor, endColor) {
  const lightText = "#ffffff";
  const darkText = "#111827";
  const lightTextWorstContrast = Math.min(
    getContrastRatio(startColor, lightText),
    getContrastRatio(middleColor, lightText),
    getContrastRatio(endColor, lightText)
  );
  const darkTextWorstContrast = Math.min(
    getContrastRatio(startColor, darkText),
    getContrastRatio(middleColor, darkText),
    getContrastRatio(endColor, darkText)
  );

  return darkTextWorstContrast >= lightTextWorstContrast ? darkText : lightText;
}


function setDerivedTextColor(textVariableName, backgroundVariableName) {
  const backgroundColor = getComputedStyle(document.body)
    .getPropertyValue(backgroundVariableName)
    .trim();

  if (parseCssColor(backgroundColor)) {
    document.body.style.setProperty(textVariableName, getReadableTextColor(backgroundColor));
  }
}


function setDerivedNormalTextColors() {
  const mainTextColor = getComputedStyle(document.body)
    .getPropertyValue("--text-main")
    .trim();
  const pageBackgroundColor = getComputedStyle(document.body)
    .getPropertyValue("--page-bg")
    .trim();

  if (!parseCssColor(mainTextColor) || !parseCssColor(pageBackgroundColor)) {
    return;
  }

  document.body.style.setProperty("--text-muted", blendColors(mainTextColor, pageBackgroundColor, 0.78));
  document.body.style.setProperty("--text-soft", blendColors(mainTextColor, pageBackgroundColor, 0.6));
  document.body.style.setProperty("--placeholder", blendColors(mainTextColor, pageBackgroundColor, 0.46));
  document.body.style.setProperty("--disabled-text", blendColors(mainTextColor, pageBackgroundColor, 0.55));
}


function isBuiltInPalette(paletteName) {
  return builtInPaletteIds.includes(paletteName);
}


function paletteExists(paletteName) {
  return isBuiltInPalette(paletteName) || Boolean(customThemes[paletteName]);
}


function getPaletteLabel(paletteName) {
  if (isBuiltInPalette(paletteName)) {
    return paletteNames[paletteName] || "Palette";
  }

  return customThemes[paletteName] ? customThemes[paletteName].name : "Custom Theme";
}


function sanitizeThemeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}


function makeCustomThemeId(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "custom-theme";
  let customId = `custom:${slug}`;
  let number = 2;

  while (customThemes[customId]) {
    customId = `custom:${slug}-${number}`;
    number = number + 1;
  }

  return customId;
}


function themeNameExists(name) {
  const normalizedName = name.toLowerCase();

  for (const builtInName of Object.values(paletteNames)) {
    if (builtInName.toLowerCase() === normalizedName) {
      return true;
    }
  }

  return Object.values(customThemes).some((theme) => {
    return theme.name.toLowerCase() === normalizedName;
  });
}


function cleanThemeColors(colors) {
  const cleanColors = {};

  if (typeof colors !== "object" || colors === null) {
    return cleanColors;
  }

  const migratedColors = {
    ...colors
  };

  if (!migratedColors.dangerSoftBackground) {
    migratedColors.dangerSoftBackground = colors.dangerSoftBackground || colors.dangerBackground || colors.dangerHover;
  }

  if (!migratedColors.dangerText) {
    migratedColors.dangerText = colors.dangerText || colors.dangerButtonText;
  }

  for (const field of themeColorFieldsConfig) {
    const color = normalizeHexColor(migratedColors[field.key]);

    if (color !== "") {
      cleanColors[field.key] = color;
    }
  }

  for (const field of gradientColorFieldsConfig) {
    const color = normalizeHexColor(migratedColors[field.key]);

    if (color !== "") {
      cleanColors[field.key] = color;
    }
  }

  for (const field of dangerColorFieldsConfig) {
    const color = normalizeHexColor(migratedColors[field.key]);

    if (color !== "") {
      cleanColors[field.key] = color;
    }
  }

  return cleanColors;
}


function cleanBuiltInThemeOverrides(rawOverrides) {
  const cleanOverrides = {};

  if (typeof rawOverrides !== "object" || rawOverrides === null) {
    return cleanOverrides;
  }

  for (const [paletteId, colors] of Object.entries(rawOverrides)) {
    if (!isBuiltInPalette(paletteId)) {
      continue;
    }

    const cleanColors = cleanThemeColors(colors);

    if (Object.keys(cleanColors).length > 0) {
      cleanOverrides[paletteId] = cleanColors;
    }
  }

  return cleanOverrides;
}


function cleanCustomThemes(rawThemes) {
  const cleanThemes = {};

  if (typeof rawThemes !== "object" || rawThemes === null) {
    return cleanThemes;
  }

  for (const [themeId, theme] of Object.entries(rawThemes)) {
    if (!themeId.startsWith("custom:") || typeof theme !== "object" || theme === null) {
      continue;
    }

    const name = sanitizeThemeName(theme.name);
    const colors = cleanThemeColors(theme.colors);
    const defaultColors = cleanThemeColors(theme.defaultColors);
    const basePalette = isBuiltInPalette(theme.basePalette) ? theme.basePalette : "afterglow";

    if (name !== "" && Object.keys(colors).length > 0) {
      cleanThemes[themeId] = {
        name: name,
        colors: colors,
        defaultColors: Object.keys(defaultColors).length > 0 ? defaultColors : cloneThemeColors(colors),
        basePalette: basePalette
      };
    }
  }

  return cleanThemes;
}


function getPaletteColors(paletteName) {
  if (!isBuiltInPalette(paletteName)) {
    const customTheme = customThemes[paletteName];

    if (!customTheme) {
      return builtInThemeColors.afterglow;
    }

    const basePalette = isBuiltInPalette(customTheme.basePalette)
      ? customTheme.basePalette
      : "afterglow";

    return {
      ...(builtInThemeColors[basePalette] || builtInThemeColors.afterglow),
      ...customTheme.colors
    };
  }

  return {
    ...(builtInThemeColors[paletteName] || builtInThemeColors.afterglow),
    ...(builtInThemeOverrides[paletteName] || {})
  };
}


function cloneThemeColors(colors) {
  return {
    ...cleanThemeColors(colors)
  };
}


function getGradientValue(colors) {
  return `linear-gradient(90deg, ${colors.gradientStart} 0%, ${colors.gradientMiddle} 55%, ${colors.gradientEnd} 100%)`;
}


function getHoverGradientValue(colors) {
  return `linear-gradient(90deg, ${blendColors(colors.gradientStart, "#ffffff", 0.82)} 0%, ${blendColors(colors.gradientMiddle, "#ffffff", 0.82)} 55%, ${blendColors(colors.gradientEnd, "#ffffff", 0.82)} 100%)`;
}


function getCompleteGradientColors(colors, paletteName = colorPalette) {
  const fallbackColors = getPaletteColors(getPaletteBase(paletteName));
  const gradientStart = normalizeHexColor(colors.gradientStart) || fallbackColors.gradientStart || "#2563eb";
  const gradientMiddle = normalizeHexColor(colors.gradientMiddle) || fallbackColors.gradientMiddle || gradientStart;
  const gradientEnd = normalizeHexColor(colors.gradientEnd) || fallbackColors.gradientEnd || gradientMiddle;

  return {
    ...colors,
    gradientStart: gradientStart,
    gradientMiddle: gradientMiddle,
    gradientEnd: gradientEnd
  };
}


function setGradientActionVariables(colors) {
  const gradientColors = getCompleteGradientColors(colors, colorPalette);
  const gradient = getGradientValue(gradientColors);
  const hoverGradient = getHoverGradientValue(gradientColors);
  const gradientText = getGradientTextColor(
    gradientColors.gradientStart,
    gradientColors.gradientMiddle,
    gradientColors.gradientEnd
  );

  document.body.style.setProperty("--primary-gradient", gradient);
  document.body.style.setProperty("--primary-gradient-hover", hoverGradient);
  document.body.style.setProperty("--primary-action-bg", gradient);
  document.body.style.setProperty("--primary-action-bg-hover", hoverGradient);
  document.body.style.setProperty("--secondary-action-bg", gradient);
  document.body.style.setProperty("--secondary-action-bg-hover", hoverGradient);
  document.body.style.setProperty("--donate-bg", gradient);
  document.body.style.setProperty("--donate-bg-hover", hoverGradient);
  document.body.style.setProperty("--accent-text", gradientText);
  document.body.style.setProperty("--accent-soft-text", gradientText);
}


function getThemeEditorColors() {
  return getPaletteColors(colorPalette);
}


function getPaletteBase(paletteName) {
  if (isBuiltInPalette(paletteName)) {
    return paletteName;
  }

  return customThemes[paletteName] && isBuiltInPalette(customThemes[paletteName].basePalette)
    ? customThemes[paletteName].basePalette
    : "afterglow";
}


function removeEditableThemeVariables() {
  for (const variableName of editableThemeVariables.concat(gradientThemeVariables)) {
    document.body.style.removeProperty(variableName);
  }
}


function applyThemeSettings() {
  const paletteBase = getPaletteBase(colorPalette);
  document.body.dataset.palette = paletteBase;
  removeEditableThemeVariables();

  const customColors = getPaletteColors(colorPalette);

  for (const field of themeColorFieldsConfig) {
    const color = normalizeHexColor(customColors[field.key]);

    if (color !== "") {
      for (const variableName of field.variables) {
        document.body.style.setProperty(variableName, color);
      }
    }
  }

  const gradientColors = getCompleteGradientColors(customColors, colorPalette);
  document.body.style.setProperty("--accent", gradientColors.gradientMiddle);
  document.body.style.setProperty("--accent-soft", gradientColors.gradientEnd);
  document.body.style.setProperty("--accent-dark", gradientColors.gradientStart);
  setGradientActionVariables(gradientColors);

  for (const field of dangerColorFieldsConfig) {
    const color = normalizeHexColor(customColors[field.key]);

    if (color !== "") {
      for (const variableName of field.variables) {
        document.body.style.setProperty(variableName, color);
      }
    }
  }

  setDerivedNormalTextColors();
  setDerivedTextColor("--accent-text", "--accent");
  setDerivedTextColor("--accent-soft-text", "--accent-soft");

  setGradientActionVariables(gradientColors);
}


function addPaletteOptions(selectElement) {
  selectElement.innerHTML = "";

  const builtInGroup = document.createElement("optgroup");
  builtInGroup.label = "Built-in Themes";

  for (const paletteId of builtInPaletteIds) {
    const option = document.createElement("option");
    option.value = paletteId;
    option.textContent = paletteNames[paletteId];
    builtInGroup.appendChild(option);
  }

  selectElement.appendChild(builtInGroup);

  const customThemeEntries = Object.entries(customThemes).sort((first, second) => {
    return first[1].name.localeCompare(second[1].name);
  });

  if (customThemeEntries.length > 0) {
    const customGroup = document.createElement("optgroup");
    customGroup.label = "Custom Themes";

    for (const [themeId, theme] of customThemeEntries) {
      const option = document.createElement("option");
      option.value = themeId;
      option.textContent = theme.name;
      customGroup.appendChild(option);
    }

    selectElement.appendChild(customGroup);
  }
}


function rebuildPaletteDropdowns() {
  addPaletteOptions(colorPaletteSelect);
}


function updateThemeControls() {
  rebuildPaletteDropdowns();

  colorPaletteSelect.value = colorPalette;
}


function setHexInputDisplayValue(hexInput, color) {
  if (!hexInput || document.activeElement === hexInput) {
    return;
  }

  hexInput.value = normalizeHexForDisplay(color);
  hexInput.setCustomValidity("");
}


function getCurrentEditorColorValue(colorKey) {
  const colors = getThemeEditorColors();
  const gradientColors = getCompleteGradientColors(colors);
  const color = normalizeHexColor(colors[colorKey]) || normalizeHexColor(gradientColors[colorKey]);

  return color || "#000000";
}


function revertHexInput(hexInput, colorKey, message) {
  if (!hexInput) {
    return;
  }

  hexInput.value = normalizeHexForDisplay(getCurrentEditorColorValue(colorKey));
  hexInput.setCustomValidity("");
  showSettingsStatus(message, "error");
}


function handleHexInputTyping(hexInput, colorKey, updateHandler) {
  const color = normalizeHexColor(hexInput.value);

  hexInput.setCustomValidity("");

  if (color !== "") {
    updateHandler(colorKey, color, hexInput);
  }
}


function commitHexInput(hexInput, colorKey, updateHandler) {
  const color = normalizeHexColor(hexInput.value);

  if (color === "") {
    revertHexInput(hexInput, colorKey, "Invalid hex color reverted.");
    return;
  }

  hexInput.value = normalizeHexForDisplay(color);
  hexInput.setCustomValidity("");
  updateHandler(colorKey, color, hexInput);
}


function handleHexInputKeydown(event, colorKey, updateHandler) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  commitHexInput(event.currentTarget, colorKey, updateHandler);
}


function wireThemeHexInput(hexInput, colorKey, updateHandler) {
  hexInput.addEventListener("input", () => {
    handleHexInputTyping(hexInput, colorKey, updateHandler);
  });
  hexInput.addEventListener("blur", () => {
    commitHexInput(hexInput, colorKey, updateHandler);
  });
  hexInput.addEventListener("keydown", (event) => {
    handleHexInputKeydown(event, colorKey, updateHandler);
  });
}


function updateThemeEditorControls() {
  rebuildPaletteDropdowns();
  colorPaletteSelect.value = colorPalette;

  const paletteLabel = getPaletteLabel(colorPalette);
  const paletteColors = getThemeEditorColors();
  const isCustomTheme = !isBuiltInPalette(colorPalette);

  resetPaletteButton.textContent = `Reset ${paletteLabel}`;
  deleteCustomThemeButton.classList.toggle("hidden", !isCustomTheme);
  hideDeleteThemeConfirmation();

  for (const field of themeColorFieldsConfig) {
    const color = normalizeHexColor(paletteColors[field.key]) || "#000000";
    const colorInput = document.querySelector(`[data-theme-color="${field.key}"]`);
    const hexInput = document.querySelector(`[data-theme-hex="${field.key}"]`);

    if (colorInput) {
      colorInput.value = color;
    }

    if (hexInput) {
      setHexInputDisplayValue(hexInput, color);
    }
  }

  const gradientControls = document.getElementById("theme-gradient-controls");

  if (gradientControls) {
    gradientControls.classList.remove("hidden");
  }

  const gradientColors = getCompleteGradientColors(paletteColors);

  for (const field of gradientColorFieldsConfig) {
    const colorInput = document.querySelector(`[data-theme-gradient-color="${field.key}"]`);
    const hexInput = document.querySelector(`[data-theme-gradient-hex="${field.key}"]`);
    const color = gradientColors[field.key];

    if (colorInput) {
      colorInput.value = color;
    }

    if (hexInput) {
      setHexInputDisplayValue(hexInput, color);
    }
  }

  for (const field of dangerColorFieldsConfig) {
    const color = normalizeHexColor(paletteColors[field.key]) || "#000000";
    const colorInput = document.querySelector(`[data-theme-danger-color="${field.key}"]`);
    const hexInput = document.querySelector(`[data-theme-danger-hex="${field.key}"]`);

    if (colorInput) {
      colorInput.value = color;
    }

    if (hexInput) {
      setHexInputDisplayValue(hexInput, color);
    }
  }

  updateGradientPreview(gradientColors);
}


function createThemeEditorFields() {
  themeColorFields.innerHTML = "";

  for (const field of themeColorFieldsConfig) {
    const row = document.createElement("div");
    row.className = "theme-color-row";

    const label = document.createElement("label");
    label.textContent = field.label;

    const colorInput = document.createElement("input");
    colorInput.className = "theme-color-picker";
    colorInput.type = "color";
    colorInput.dataset.themeColor = field.key;
    colorInput.title = field.label;

    const hexInput = document.createElement("input");
    hexInput.className = "theme-hex-input";
    hexInput.type = "text";
    hexInput.dataset.themeHex = field.key;
    hexInput.placeholder = "#000000";
    hexInput.maxLength = 7;
    hexInput.title = `${field.label} hex value`;

    colorInput.addEventListener("input", () => {
      updateCustomThemeColor(field.key, colorInput.value);
    });
    wireThemeHexInput(hexInput, field.key, updateCustomThemeColor);

    row.appendChild(label);
    row.appendChild(colorInput);
    row.appendChild(hexInput);
    themeColorFields.appendChild(row);
  }

  const gradientControls = document.createElement("div");
  gradientControls.id = "theme-gradient-controls";
  gradientControls.className = "theme-gradient-controls";

  for (const field of gradientColorFieldsConfig) {
    const row = document.createElement("div");
    row.className = "theme-color-row";

    const label = document.createElement("label");
    label.textContent = field.label;

    const colorInput = document.createElement("input");
    colorInput.className = "theme-color-picker";
    colorInput.type = "color";
    colorInput.dataset.themeGradientColor = field.key;
    colorInput.title = field.label;

    const hexInput = document.createElement("input");
    hexInput.className = "theme-hex-input";
    hexInput.type = "text";
    hexInput.dataset.themeGradientHex = field.key;
    hexInput.placeholder = "#000000";
    hexInput.maxLength = 7;
    hexInput.title = `${field.label} hex value`;

    colorInput.addEventListener("input", () => {
      updateGradientColor(field.key, colorInput.value);
    });
    wireThemeHexInput(hexInput, field.key, updateGradientColor);

    row.appendChild(label);
    row.appendChild(colorInput);
    row.appendChild(hexInput);
    gradientControls.appendChild(row);
  }

  const preview = document.createElement("div");
  preview.id = "theme-gradient-preview";
  preview.className = "theme-gradient-preview";
  preview.textContent = "Gradient preview";
  gradientControls.appendChild(preview);
  themeColorFields.appendChild(gradientControls);

  const dangerSection = document.createElement("details");
  dangerSection.className = "theme-danger-section";

  const dangerHeading = document.createElement("summary");
  dangerHeading.className = "theme-section-label";
  dangerHeading.textContent = "Danger Colors";
  dangerSection.appendChild(dangerHeading);

  for (const field of dangerColorFieldsConfig) {
    const row = document.createElement("div");
    row.className = "theme-color-row";

    const label = document.createElement("label");
    label.textContent = field.label;

    const colorInput = document.createElement("input");
    colorInput.className = "theme-color-picker";
    colorInput.type = "color";
    colorInput.dataset.themeDangerColor = field.key;
    colorInput.title = field.label;

    const hexInput = document.createElement("input");
    hexInput.className = "theme-hex-input";
    hexInput.type = "text";
    hexInput.dataset.themeDangerHex = field.key;
    hexInput.placeholder = "#000000";
    hexInput.maxLength = 7;
    hexInput.title = `${field.label} hex value`;

    colorInput.addEventListener("input", () => {
      updateDangerColor(field.key, colorInput.value);
    });
    wireThemeHexInput(hexInput, field.key, updateDangerColor);

    row.appendChild(label);
    row.appendChild(colorInput);
    row.appendChild(hexInput);
    dangerSection.appendChild(row);
  }

  themeColorFields.appendChild(dangerSection);

  updateThemeEditorControls();
}


async function showTab(tabName) {
  const showQueue = tabName === "queue";
  const showSettings = tabName === "settings";
  const showSummary = tabName === "summary";

  saveExportTab.classList.toggle("active", tabName === "save-export");
  queueTab.classList.toggle("active", showQueue);
  settingsTab.classList.toggle("active", showSettings);
  summaryTab.classList.toggle("active", showSummary);
  saveExportPanel.classList.toggle("active", tabName === "save-export");
  queuePanel.classList.toggle("active", showQueue);
  settingsPanel.classList.toggle("active", showSettings);
  summaryPanel.classList.toggle("active", showSummary);

  if (showQueue) {
    await loadQueuedNotes();
  }
}


function summaryStateIsVisible(summaryState) {
  return (
    summaryState &&
    ["loading", "success", "error"].includes(summaryState.status)
  );
}


function renderSummaryState(summaryState) {
  currentSummaryState = summaryState || null;

  if (!summaryStateIsVisible(currentSummaryState)) {
    summaryTab.classList.add("hidden");
    summaryPanel.classList.remove("active");

    if (summaryTab.classList.contains("active")) {
      showTab("save-export");
    }

    return;
  }

  summaryTab.classList.remove("hidden");
  summarySource.textContent = currentSummaryState.label || "Highlighted text";
  summaryMessage.className = "summary-message";
  summaryText.className = "summary-text";

  if (currentSummaryState.status === "loading") {
    summaryMessage.textContent = "Summarizing...";
    summaryText.textContent = "";
  } else if (currentSummaryState.status === "success") {
    summaryMessage.textContent = currentSummaryState.message || "Summary ready.";
    summaryMessage.classList.add("success");
    summaryText.textContent = currentSummaryState.summary || "";
  } else {
    summaryMessage.textContent = currentSummaryState.message || "Could not generate a summary.";
    summaryMessage.classList.add("error");
    summaryText.textContent = "";
  }

  if (currentSummaryState.originalText && currentSummaryState.originalText.trim() !== "") {
    originalTextWrapper.classList.remove("hidden");
    originalTextLabel.textContent = currentSummaryState.mode === "page"
      ? "Original page content"
      : "Original highlighted text";
    originalText.textContent = currentSummaryState.originalText;
  } else {
    originalTextWrapper.classList.add("hidden");
    originalText.textContent = "";
  }

  showTab("summary");
}


function loadSummaryState() {
  chrome.storage.local.get(["summaryState"], (result) => {
    renderSummaryState(result.summaryState || null);
  });
}


function clearSummaryState() {
  chrome.storage.local.remove(["summaryState"], () => {
    renderSummaryState(null);
    showTab("save-export");
  });
}


function updateQueueSelectionUi() {
  const selectedTotal = selectedQueueIndexes.size;

  selectedCount.textContent = `${selectedTotal} selected.`;
  exportSelectedButton.disabled = selectedTotal === 0;
  selectAllCheckbox.disabled = queuedNotes.length === 0;
  selectAllCheckbox.checked = queuedNotes.length > 0 && selectedTotal === queuedNotes.length;
  selectAllCheckbox.indeterminate = selectedTotal > 0 && selectedTotal < queuedNotes.length;
}


function keepValidQueueSelections() {
  selectedQueueIndexes = new Set(
    Array.from(selectedQueueIndexes).filter((index) => {
      return index >= 0 && index < queuedNotes.length;
    })
  );
}


function toggleQueueSelection(index, isSelected) {
  if (isSelected) {
    selectedQueueIndexes.add(index);
  } else {
    selectedQueueIndexes.delete(index);
  }

  updateQueueSelectionUi();
}


function toggleSelectAll() {
  selectedQueueIndexes.clear();

  if (selectAllCheckbox.checked) {
    for (let index = 0; index < queuedNotes.length; index = index + 1) {
      selectedQueueIndexes.add(index);
    }
  }

  showQueuedNotes(queuedNotes);
}


function updateSelectionAfterDelete(deletedIndex) {
  const updatedSelection = new Set();

  for (const index of selectedQueueIndexes) {
    if (index < deletedIndex) {
      updatedSelection.add(index);
    } else if (index > deletedIndex) {
      updatedSelection.add(index - 1);
    }
  }

  selectedQueueIndexes = updatedSelection;
}


function showClearConfirmation() {
  if (queuedNotes.length === 0) {
    return;
  }

  clearQueueButton.classList.add("hidden");
  clearConfirmation.classList.remove("hidden");
}


function hideClearConfirmation() {
  clearConfirmation.classList.add("hidden");
  clearQueueButton.classList.remove("hidden");
}


function getStoredSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get([
      "activeSelectedNote",
      "recentNotes",
      "showTrashNotes",
      "addSelectedNotesToRecents",
      "addDateTime",
      "addSourceLink",
      "colorPalette",
      "builtInThemeOverrides",
      "customThemes"
    ], (result) => {
      const savedCustomThemes = cleanCustomThemes(result.customThemes);
      const savedBuiltInThemeOverrides = cleanBuiltInThemeOverrides(result.builtInThemeOverrides);
      const savedColorPalette = result.colorPalette || "afterglow";
      resolve({
        activeSelectedNote: result.activeSelectedNote || "",
        recentNotes: result.recentNotes || [],
        showTrashNotes: result.showTrashNotes === true,
        addSelectedNotesToRecents: result.addSelectedNotesToRecents === true,
        addDateTime: result.addDateTime === true,
        addSourceLink: result.addSourceLink === true,
        colorPalette: builtInPaletteIds.includes(savedColorPalette) || savedCustomThemes[savedColorPalette]
          ? savedColorPalette
          : "afterglow",
        builtInThemeOverrides: savedBuiltInThemeOverrides,
        customThemes: savedCustomThemes
      });
    });
  });
}


function saveStoredSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      activeSelectedNote: activeSelectedNote,
      recentNotes: recentNotes,
      showTrashNotes: showTrashNotes,
      addSelectedNotesToRecents: addSelectedNotesToRecents,
      addDateTime: addDateTime,
      addSourceLink: addSourceLink,
      colorPalette: colorPalette,
      builtInThemeOverrides: builtInThemeOverrides,
      customThemes: customThemes
    }, resolve);
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


function makeMarkdownSource(tab) {
  if (!tab || typeof tab.url !== "string") {
    return "";
  }

  let url;

  try {
    url = new URL(tab.url);
  } catch (error) {
    return "";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "";
  }

  const title = typeof tab.title === "string" && tab.title.trim() !== ""
    ? tab.title.trim()
    : "Source";
  const safeTitle = title.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
  const safeUrl = url.href.replace(/\(/g, "%28").replace(/\)/g, "%29");

  return `[${safeTitle}](${safeUrl})`;
}


async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs.length > 0 ? tabs[0] : null;
}


async function formatCapturedText(text) {
  const additions = [];
  const capturedAt = new Date();

  if (addDateTime) {
    additions.push(formatCaptureDate(capturedAt));
  }

  if (addSourceLink) {
    const source = makeMarkdownSource(await getActiveTab());

    if (source !== "") {
      additions.push(source);
    }
  }

  if (additions.length === 0) {
    return text;
  }

  return `${text} \u2013 ${additions.join(" \u2013 ")}`;
}


async function saveActiveSelectedNote(noteTitle) {
  activeSelectedNote = noteTitle;

  return new Promise((resolve) => {
    chrome.storage.local.set({
      activeSelectedNote: activeSelectedNote
    }, resolve);
  });
}


async function rememberExportedNote(noteTitle) {
  if (noteTitle !== "") {
    recentNotes = recentNotes.filter((note) => {
      return note !== noteTitle;
    });
    recentNotes.unshift(noteTitle);
    recentNotes = cleanRecentNotes(recentNotes);
    return new Promise((resolve) => {
      chrome.storage.local.set({
        recentNotes: recentNotes
      }, resolve);
    });
  }
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


function getSelectedNote() {
  return noteList.value;
}


function setSelectedNote(note) {
  noteList.value = note;
}


function isTrashNote(note) {
  return note.split("/").includes(".trash");
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


function showNotes(notes, preferredNote, allowFallback = true) {
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
    setSelectedNote(preferredNote);
  } else if (allowFallback) {
    setSelectedNote(getFirstSelectableNote());
  }
}


function filterNotes() {
  const searchText = searchInput.value.trim().toLowerCase();
  const matchingNotes = vaultNotes.filter((note) => {
    return note.toLowerCase().includes(searchText);
  });

  showNotes(matchingNotes, activeSelectedNote);
}


function showQueuedNotes(notes) {
  queuedNotes = notes;
  keepValidQueueSelections();
  queueList.innerHTML = "";
  clearQueueButton.disabled = notes.length === 0;
  confirmClearQueueButton.disabled = notes.length === 0;
  cancelClearQueueButton.disabled = false;
  updateQueueSelectionUi();

  if (notes.length === 0) {
    hideClearConfirmation();
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

    const checkbox = document.createElement("input");
    checkbox.className = "queue-select-checkbox";
    checkbox.type = "checkbox";
    checkbox.title = "Select queued note";
    checkbox.checked = selectedQueueIndexes.has(index);
    checkbox.addEventListener("change", () => {
      toggleQueueSelection(index, checkbox.checked);
    });

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

    row.appendChild(checkbox);
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
      updateSelectionAfterDelete(index);
      await loadQueuedNotes();
    }
  } catch (error) {
    await loadQueuedNotes();
  }
}


async function clearQueue() {
  if (queuedNotes.length === 0) {
    hideClearConfirmation();
    return;
  }

  confirmClearQueueButton.disabled = true;
  cancelClearQueueButton.disabled = true;

  try {
    const response = await fetch("http://localhost:5000/queue", {
      method: "DELETE"
    });

    if (response.ok) {
      selectedQueueIndexes.clear();
      hideClearConfirmation();
      await loadQueuedNotes();
    }
  } catch (error) {
    await loadQueuedNotes();
  }
}


async function exportSelectedNotes() {
  const noteTitle = getSelectedNote();
  const indexes = Array.from(selectedQueueIndexes).sort((first, second) => {
    return first - second;
  });

  if (indexes.length === 0) {
    showQueueStatus("Select at least one queued note first.", "error");
    return;
  }

  if (noteTitle === "") {
    showQueueStatus("Please select an Obsidian note in the Save / Export tab.", "error");
    showStatus("Please select an Obsidian note.", "error");
    return;
  }

  exportSelectedButton.disabled = true;
  showQueueStatus("Exporting selected notes...", "");

  try {
    const response = await fetch("http://localhost:5000/export-selected", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: noteTitle,
        indexes: indexes
      })
    });

    const result = await response.json();

    if (response.ok) {
      selectedQueueIndexes.clear();
      await rememberExportedNote(noteTitle);
      await loadQueuedNotes();
      filterNotes();
      showQueueStatus(result.message || "Selected notes exported", "success");
      showStatus(result.message || "Selected notes exported", "success");
    } else {
      showQueueStatus(result.message || "The selected notes could not be exported.", "error");
    }
  } catch (error) {
    showQueueStatus("Could not reach the local server. Make sure python server.py is running.", "error");
  }

  updateQueueSelectionUi();
}


async function loadVaultNotes(preferredNote = "") {
  const storedSettings = await getStoredSettings();
  showTrashNotes = storedSettings.showTrashNotes;
  addSelectedNotesToRecents = storedSettings.addSelectedNotesToRecents;
  addDateTime = storedSettings.addDateTime;
  addSourceLink = storedSettings.addSourceLink;
  colorPalette = storedSettings.colorPalette;
  builtInThemeOverrides = storedSettings.builtInThemeOverrides;
  customThemes = storedSettings.customThemes;
  applyThemeSettings();
  updateThemeControls();
  updateThemeEditorControls();
  showTrashNotesCheckbox.checked = showTrashNotes;
  addSelectedToRecentsCheckbox.checked = addSelectedNotesToRecents;
  addDateTimeCheckbox.checked = addDateTime;
  addSourceLinkCheckbox.checked = addSourceLink;

  try {
    const notesUrl = `http://localhost:5000/notes?includeTrash=${showTrashNotes ? "true" : "false"}`;
    const response = await fetch(notesUrl);
    const result = await response.json();

    if (response.ok) {
      vaultNotes = result.notes || [];
      activeSelectedNote = preferredNote || storedSettings.activeSelectedNote;
      recentNotes = cleanRecentNotes(storedSettings.recentNotes);
      const hiddenTrashSelection = (
        activeSelectedNote !== "" &&
        isTrashNote(activeSelectedNote) &&
        !showTrashNotes &&
        !vaultNotes.includes(activeSelectedNote)
      );

      if (activeSelectedNote !== "" && !vaultNotes.includes(activeSelectedNote)) {
        activeSelectedNote = "";
      }

      await saveStoredSettings();
      showNotes(vaultNotes, activeSelectedNote, !hiddenTrashSelection);

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


async function updateTrashSetting() {
  showTrashNotes = showTrashNotesCheckbox.checked;
  await saveStoredSettings();

  await loadVaultNotes();
  showSettingsStatus("Note picker updated.", "success");
}


async function updateColorPaletteSetting() {
  colorPalette = paletteExists(colorPaletteSelect.value)
    ? colorPaletteSelect.value
    : "afterglow";
  applyThemeSettings();
  updateThemeEditorControls();
  await saveStoredSettings();
  showSettingsStatus("Color palette updated.", "success");
}


function updateGradientPreview(colors = null) {
  const preview = document.getElementById("theme-gradient-preview");

  if (!preview) {
    return;
  }

  const gradientColors = getCompleteGradientColors(colors || getThemeEditorColors());
  preview.style.background = getGradientValue(gradientColors);
  preview.style.color = getGradientTextColor(
    gradientColors.gradientStart,
    gradientColors.gradientMiddle,
    gradientColors.gradientEnd
  );
}


function setThemeEditorColorValue(colorKey, color) {
  if (isBuiltInPalette(colorPalette)) {
    builtInThemeOverrides[colorPalette] = {
      ...getThemeEditorColors(),
      [colorKey]: color
    };
    return;
  }

  if (customThemes[colorPalette]) {
    customThemes[colorPalette].colors = {
      ...customThemes[colorPalette].colors,
      [colorKey]: color
    };
  }
}


function resetPaletteToDefault(paletteId) {
  if (isBuiltInPalette(paletteId)) {
    delete builtInThemeOverrides[paletteId];
    return;
  }

  if (customThemes[paletteId]) {
    customThemes[paletteId].colors = cloneThemeColors(customThemes[paletteId].defaultColors);
  }
}


async function finishThemeEditorUpdate(message) {
  await saveStoredSettings();

  applyThemeSettings();

  updateThemeEditorControls();
  showSettingsStatus(message, "success");
}


async function updateCustomThemeColor(colorKey, rawValue, inputElement = null) {
  const color = normalizeHexColor(rawValue);

  if (color === "") {
    if (inputElement) {
      inputElement.setCustomValidity("Use a hex color like #1212B8.");
    }

    return;
  }

  if (inputElement) {
    inputElement.setCustomValidity("");
  }

  setThemeEditorColorValue(colorKey, color);
  await finishThemeEditorUpdate(`${getPaletteLabel(colorPalette)} color updated.`);
}


async function updateGradientColor(colorKey, rawValue, inputElement = null) {
  const color = normalizeHexColor(rawValue);

  if (color === "") {
    if (inputElement) {
      inputElement.setCustomValidity("Use a hex color like #1212B8.");
    }

    return;
  }

  if (inputElement) {
    inputElement.setCustomValidity("");
  }

  setThemeEditorColorValue(colorKey, color);
  await finishThemeEditorUpdate(`${getPaletteLabel(colorPalette)} gradient updated.`);
}


async function updateDangerColor(colorKey, rawValue, inputElement = null) {
  const color = normalizeHexColor(rawValue);

  if (color === "") {
    if (inputElement) {
      inputElement.setCustomValidity("Use a hex color like #7C0000.");
    }

    return;
  }

  if (inputElement) {
    inputElement.setCustomValidity("");
  }

  setThemeEditorColorValue(colorKey, color);
  await finishThemeEditorUpdate(`${getPaletteLabel(colorPalette)} danger color updated.`);
}


async function resetCurrentPaletteTheme() {
  resetPaletteToDefault(colorPalette);

  await saveStoredSettings();

  applyThemeSettings();

  updateThemeEditorControls();
  showSettingsStatus(`${getPaletteLabel(colorPalette)} reset.`, "success");
}


function getCurrentThemeEditorColors() {
  const colors = {};

  for (const field of themeColorFieldsConfig) {
    const hexInput = document.querySelector(`[data-theme-hex="${field.key}"]`);
    const color = normalizeHexColor(hexInput ? hexInput.value : "");

    if (color === "") {
      return null;
    }

    colors[field.key] = color;
  }

  for (const field of gradientColorFieldsConfig) {
    const hexInput = document.querySelector(`[data-theme-gradient-hex="${field.key}"]`);
    const color = normalizeHexColor(hexInput ? hexInput.value : "");

    if (color === "") {
      return null;
    }

    colors[field.key] = color;
  }

  for (const field of dangerColorFieldsConfig) {
    const hexInput = document.querySelector(`[data-theme-danger-hex="${field.key}"]`);
    const color = normalizeHexColor(hexInput ? hexInput.value : "");

    if (color === "") {
      return null;
    }

    colors[field.key] = color;
  }

  return colors;
}


async function saveAsNewTheme() {
  const themeName = sanitizeThemeName(newThemeNameInput.value);

  if (themeName === "") {
    showSettingsStatus("Enter a theme name.", "error");
    return;
  }

  if (themeNameExists(themeName)) {
    showSettingsStatus("A theme with that name already exists.", "error");
    return;
  }

  const colors = getCurrentThemeEditorColors();

  if (colors === null) {
    showSettingsStatus("Fix invalid hex colors before saving.", "error");
    return;
  }

  const sourceTheme = colorPalette;
  const themeId = makeCustomThemeId(themeName);
  customThemes[themeId] = {
    name: themeName,
    colors: cloneThemeColors(colors),
    defaultColors: cloneThemeColors(colors),
    basePalette: getPaletteBase(sourceTheme)
  };

  resetPaletteToDefault(sourceTheme);
  colorPalette = themeId;
  newThemeNameInput.value = "";

  applyThemeSettings();
  updateThemeControls();
  updateThemeEditorControls();
  await saveStoredSettings();
  showSettingsStatus(`Saved theme: ${themeName}`, "success");
}


function showDeleteThemeConfirmation() {
  if (isBuiltInPalette(colorPalette)) {
    return;
  }

  deleteThemeConfirmationText.textContent = `Delete "${getPaletteLabel(colorPalette)}"?`;
  deleteCustomThemeButton.classList.add("hidden");
  deleteThemeConfirmation.classList.remove("hidden");
}


function hideDeleteThemeConfirmation() {
  deleteThemeConfirmation.classList.add("hidden");

  if (!isBuiltInPalette(colorPalette)) {
    deleteCustomThemeButton.classList.remove("hidden");
  }
}


async function deleteCurrentCustomTheme() {
  if (isBuiltInPalette(colorPalette)) {
    return;
  }

  const deletedThemeId = colorPalette;
  const deletedThemeName = getPaletteLabel(colorPalette);
  delete customThemes[deletedThemeId];
  colorPalette = "afterglow";

  await saveStoredSettings();
  applyThemeSettings();
  updateThemeControls();
  updateThemeEditorControls();
  hideDeleteThemeConfirmation();
  showSettingsStatus(`Deleted theme: ${deletedThemeName}`, "success");
}


function showResetThemesConfirmation() {
  resetAllThemesButton.classList.add("hidden");
  resetThemesConfirmation.classList.remove("hidden");
}


function hideResetThemesConfirmation() {
  resetThemesConfirmation.classList.add("hidden");
  resetAllThemesButton.classList.remove("hidden");
}


async function resetAllThemeColors() {
  builtInThemeOverrides = {};

  for (const theme of Object.values(customThemes)) {
    if (theme && theme.defaultColors) {
      theme.colors = cloneThemeColors(theme.defaultColors);
    }
  }

  await saveStoredSettings();
  applyThemeSettings();
  updateThemeControls();
  updateThemeEditorControls();
  hideResetThemesConfirmation();
  showSettingsStatus("Theme colors reset.", "success");
}


async function updateRecentsSetting() {
  addSelectedNotesToRecents = addSelectedToRecentsCheckbox.checked;

  if (addSelectedNotesToRecents && getSelectedNote() !== "") {
    await rememberExportedNote(getSelectedNote());
    filterNotes();
  } else {
    await saveStoredSettings();
  }

  showSettingsStatus("Recent Notes setting updated.", "success");
}


async function updateCaptureSettings() {
  addDateTime = addDateTimeCheckbox.checked;
  addSourceLink = addSourceLinkCheckbox.checked;
  await saveStoredSettings();
  showSettingsStatus("Saved note formatting updated.", "success");
}


async function createNewNote() {
  const noteTitle = searchInput.value;

  if (isCreatingNote) {
    return;
  }

  if (noteTitle.trim() === "") {
    return;
  }

  isCreatingNote = true;
  showStatus("Creating note...", "");

  try {
    const response = await fetch("http://localhost:5000/notes", {
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
      const createdNote = result.note || "";
      searchInput.value = "";
      await loadVaultNotes(createdNote);
      setSelectedNote(createdNote);
      await saveActiveSelectedNote(createdNote);

      if (addSelectedNotesToRecents) {
        await rememberExportedNote(createdNote);
      }

      showNotes(vaultNotes, createdNote);
      showStatus(result.message || "Note created", "success");
    } else {
      showStatus(result.message || "The note could not be created.", "error");
    }
  } catch (error) {
    showStatus("Could not reach the local server. Make sure python server.py is running.", "error");
  } finally {
    isCreatingNote = false;
  }
}


function createNewNoteFromSearch(event) {
  if (event.key !== "Enter" || searchInput.value.trim() === "") {
    return;
  }

  event.preventDefault();
  createNewNote();
}


function addRequiredListener(element, label, eventName, handler) {
  if (!element) {
    throw new Error(`Required popup element is missing: ${label}`);
  }

  element.addEventListener(eventName, handler);
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
    const formattedNote = await formatCapturedText(noteText);
    const response = await fetch("http://localhost:5000/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        note: formattedNote
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
  const noteTitle = getSelectedNote();

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
      await rememberExportedNote(noteTitle);
      selectedQueueIndexes.clear();
      await loadQueuedNotes();
      filterNotes();
      showStatus(result.message || "Notes exported", "success");
    } else {
      showStatus(result.message || "The notes could not be exported.", "error");
    }
  } catch (error) {
    showStatus("Could not reach the local server. Make sure python server.py is running.", "error");
  }

  exportButton.disabled = false;
}


async function rememberSelectedNote() {
  const selectedNote = getSelectedNote();

  if (selectedNote !== "") {
    await saveActiveSelectedNote(selectedNote);

    if (addSelectedNotesToRecents) {
      await rememberExportedNote(selectedNote);
    }

    filterNotes();
  }
}


addRequiredListener(saveButton, "#save-button", "click", saveNote);
addRequiredListener(exportButton, "#export-button", "click", exportNotes);
addRequiredListener(searchInput, "#note-search", "input", filterNotes);
addRequiredListener(searchInput, "#note-search", "keydown", createNewNoteFromSearch);
addRequiredListener(noteList, "#note-list", "input", rememberSelectedNote);
addRequiredListener(noteList, "#note-list", "change", rememberSelectedNote);
addRequiredListener(noteList, "#note-list", "click", rememberSelectedNote);
addRequiredListener(selectAllCheckbox, "#select-all-checkbox", "change", toggleSelectAll);
addRequiredListener(exportSelectedButton, "#export-selected-button", "click", exportSelectedNotes);
addRequiredListener(saveExportTab, "#save-export-tab", "click", () => {
  showTab("save-export");
});
addRequiredListener(queueTab, "#queue-tab", "click", () => {
  showTab("queue");
});
addRequiredListener(settingsTab, "#settings-tab", "click", () => {
  showTab("settings");
});
addRequiredListener(summaryTab, "#summary-tab", "click", () => {
  showTab("summary");
});
addRequiredListener(clearQueueButton, "#clear-queue-button", "click", showClearConfirmation);
addRequiredListener(cancelClearQueueButton, "#cancel-clear-queue-button", "click", hideClearConfirmation);
addRequiredListener(confirmClearQueueButton, "#confirm-clear-queue-button", "click", clearQueue);
addRequiredListener(showTrashNotesCheckbox, "#show-trash-notes", "change", updateTrashSetting);
addRequiredListener(addSelectedToRecentsCheckbox, "#add-selected-to-recents", "change", updateRecentsSetting);
addRequiredListener(addDateTimeCheckbox, "#add-date-time", "change", updateCaptureSettings);
addRequiredListener(addSourceLinkCheckbox, "#add-source-link", "change", updateCaptureSettings);
addRequiredListener(colorPaletteSelect, "#color-palette", "change", updateColorPaletteSetting);
addRequiredListener(resetPaletteButton, "#reset-palette-button", "click", resetCurrentPaletteTheme);
addRequiredListener(resetAllThemesButton, "#reset-all-themes-button", "click", showResetThemesConfirmation);
addRequiredListener(cancelResetThemesButton, "#cancel-reset-themes-button", "click", hideResetThemesConfirmation);
addRequiredListener(confirmResetThemesButton, "#confirm-reset-themes-button", "click", resetAllThemeColors);
addRequiredListener(saveNewThemeButton, "#save-new-theme-button", "click", saveAsNewTheme);
addRequiredListener(deleteCustomThemeButton, "#delete-custom-theme-button", "click", showDeleteThemeConfirmation);
addRequiredListener(cancelDeleteThemeButton, "#cancel-delete-theme-button", "click", hideDeleteThemeConfirmation);
addRequiredListener(confirmDeleteThemeButton, "#confirm-delete-theme-button", "click", deleteCurrentCustomTheme);
addRequiredListener(closeSummaryButton, "#close-summary-button", "click", clearSummaryState);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.summaryState) {
    renderSummaryState(changes.summaryState.newValue || null);
  }
});
if (donateLink) {
  donateLink.href = DONATION_URL;
}
createThemeEditorFields();
loadVaultNotes();
loadQueuedNotes();
loadSummaryState();
