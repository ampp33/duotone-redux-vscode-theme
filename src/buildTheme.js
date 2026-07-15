"use strict";

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l * 100];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) {
        const v = Math.round(l * 255).toString(16).padStart(2, "0");
        return `#${v}${v}${v}`;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return "#" + [h + 1 / 3, h, h - 1 / 3]
        .map(t => Math.round(hue2rgb(t) * 255).toString(16).padStart(2, "0"))
        .join("");
}

function lighten(hex, amount) {
    const [h, s, l] = hexToHsl(hex);
    return hslToHex(h, s, Math.min(100, l + amount));
}

function withAlpha(hex, opacity) {
    return hex + Math.round(opacity * 255).toString(16).padStart(2, "0");
}

function mix(hex1, hex2, weight) {
    const parse = (h, o) => parseInt(h.slice(o, o + 2), 16);
    const ch = (h) => [parse(h, 1), parse(h, 3), parse(h, 5)];
    const [r1, g1, b1] = ch(hex1);
    const [r2, g2, b2] = ch(hex2);
    return "#" + [
        Math.round(r1 * weight + r2 * (1 - weight)),
        Math.round(g1 * weight + g2 * (1 - weight)),
        Math.round(b1 * weight + b2 * (1 - weight)),
    ].map(v => v.toString(16).padStart(2, "0")).join("");
}

function buildTheme(p) {
    const selection = lighten(p.BACKGROUND, 12);
    const cursorLine = withAlpha(selection, 0.26);
    // Slightly lighter than the flat background, used for list/quick-pick
    // selection so a selected row is still visibly distinct now that every
    // panel shares the same base background.
    const selectionDark = lighten(p.BACKGROUND, 6);
    const hoverDark = lighten(p.BACKGROUND, 4);
    // Deepest UNO tier (#49495A in Space), used as a seam/border color so
    // adjacent same-background panels read as visually distinct regions.
    const panelBorder = p.UNO5;

    // Strict two-hue terminal palette: every ANSI slot is a shade of the
    // theme's own warm (DUO) or cool (UNO) hue rather than a true
    // green/blue/cyan, so the terminal reads as fully part of the duotone
    // rather than introducing foreign hues. Red/magenta reuse the
    // INVALID_BG/DEPRECATED_BG accents already established elsewhere in
    // the theme. Green/yellow split off the DUO hue (+/-12deg), blue/cyan
    // split off the UNO hue (+/-12deg); "bright" tiers use the more vivid
    // DUO1/UNO2 shade, "normal" tiers use the more muted DUO2/UNO3 shade.
    const dim = (hex) => mix(hex, p.BACKGROUND, 0.65);
    const [duo1H, duo1S, duo1L] = hexToHsl(p.DUO1);
    const [duo2H, duo2S, duo2L] = hexToHsl(p.DUO2);
    const [uno2H, uno2S, uno2L] = hexToHsl(p.UNO2);
    const [uno3H, uno3S, uno3L] = hexToHsl(p.UNO3);
    const green = hslToHex(duo2H - 12, duo2S, duo2L);
    const brightGreen = hslToHex(duo1H - 12, duo1S, duo1L);
    const yellow = hslToHex(duo2H + 12, duo2S, duo2L);
    const brightYellow = hslToHex(duo1H + 12, duo1S, duo1L);
    const blue = hslToHex(uno3H - 12, uno3S, uno3L);
    const brightBlue = hslToHex(uno2H - 12, uno2S, uno2L);
    const cyan = hslToHex(uno3H + 12, uno3S, uno3L);
    const brightCyan = hslToHex(uno2H + 12, uno2S, uno2L);

    return {
        name: `DuoTone Dark ${p.NAME}`,
        type: "dark",
        semanticClass: `theme.duotone_dark_${p.ID}`,
        author: "Brian Douglas",
        colors: {
            "foreground": p.UNO1,
            "editor.background": p.BACKGROUND,
            "editor.foreground": p.UNO1,
            "activityBar.background": p.BACKGROUND,
            "activityBar.foreground": p.UNO1,
            "statusBar.background": p.BACKGROUND,
            "statusBar.foreground": p.UNO1,
            "sideBar.background": p.BACKGROUND,
            "sideBar.foreground": p.UNO1,
            "sideBar.border": panelBorder,
            "tab.inactiveBackground": p.BACKGROUND,
            "tab.inactiveForeground": p.UNO1,
            "tab.activeBackground": p.BACKGROUND,
            "tab.activeForeground": p.UNO1,
            "editorGroupHeader.tabsBackground": p.BACKGROUND,
            "editorGroup.border": panelBorder,
            "editor.lineHighlightBackground": cursorLine,
            "editor.lineHighlightBorder": "#00000000",
            "editor.selectionBackground": withAlpha(selection, 0.60),
            "editor.selectionHighlightBackground": withAlpha(selection, 0.40),
            "editor.wordHighlightBackground": withAlpha(p.DUO1, 0.15),
            "editor.wordHighlightStrongBackground": withAlpha(p.DUO1, 0.25),
            "editorCursor.foreground": p.DUO1,
            "editorBracketHighlight.foreground1": p.UNO4,
            "editorBracketHighlight.foreground2": p.UNO4,
            "editorBracketHighlight.foreground3": p.UNO4,
            "editorBracketHighlight.foreground4": p.UNO4,
            "editorBracketHighlight.foreground5": p.UNO4,
            "editorBracketHighlight.foreground6": p.UNO4,
            // Muted rather than the hard INVALID_BG accent: some grammars
            // (e.g. Kotlin's "->" arrow) misreport a lone bracket-like char
            // as "unexpected" on ordinary, valid code, so a jarring pink-red
            // flash reads as an error where there isn't one.
            "editorBracketHighlight.unexpectedBracket.foreground": brightYellow,
            "scrollbar.shadow": "#00000000",
            "scrollbarSlider.background": withAlpha(p.UNO5, 0.30),
            "scrollbarSlider.hoverBackground": withAlpha(p.UNO5, 0.50),
            "scrollbarSlider.activeBackground": withAlpha(p.UNO5, 0.70),
            "editorGutter.background": p.BACKGROUND,
            "editorLineNumber.foreground": mix(p.UNO2, p.BACKGROUND, 0.33),
            "editorLineNumber.activeForeground": mix(p.UNO2, p.BACKGROUND, 0.66),
            "editorIndentGuide.background": lighten(p.BACKGROUND, 10),
            "editorIndentGuide.activeBackground": p.UNO4,
            "editorIndentGuide.background1": lighten(p.BACKGROUND, 10),
            "editorIndentGuide.activeBackground1": p.UNO4,
            "titleBar.activeBackground": p.BACKGROUND,
            "titleBar.activeForeground": p.UNO1,
            "titleBar.inactiveBackground": p.BACKGROUND,
            "titleBar.inactiveForeground": p.UNO1,
            "titleBar.border": panelBorder,
            "list.activeSelectionBackground": selectionDark,
            "list.hoverBackground": hoverDark,
            "list.inactiveSelectionBackground": selectionDark,
            "list.focusBackground": selectionDark,
            "quickInputList.focusBackground": lighten(p.BACKGROUND, 12),
            "panel.background": p.BACKGROUND,
            "panel.border": panelBorder,
            "dropdown.background": p.BACKGROUND,
            "dropdown.listBackground": p.BACKGROUND,
            "dropdown.border": p.BACKGROUND,
            "button.background": p.UNO2,
            "button.foreground": p.BACKGROUND,
            "button.hoverBackground": lighten(p.UNO2, -8),
            "input.background": p.BACKGROUND,
            "badge.background": p.UNO3,
            "statusBarItem.remoteBackground": p.UNO3,
            "statusBarItem.errorBackground": p.DEPRECATED_BG,
            "statusBarItem.hoverBackground": p.BACKGROUND,
            "statusBarItem.prominentHoverBackground": p.BACKGROUND,
            "menubar.selectionBackground": selectionDark,
            "menu.background": selectionDark,
            "menu.foreground": p.UNO1,
            "menu.selectionBackground": lighten(p.BACKGROUND, 12),
            "menu.selectionForeground": p.UNO1,
            "menu.separatorBackground": p.INVISIBLES,
            "menu.border": p.BACKGROUND,
            "commandCenter.background": p.BACKGROUND,
            "commandCenter.activeBackground": p.BACKGROUND,
            "quickInput.background": selectionDark,

            // Terminal
            "terminal.background": p.BACKGROUND,
            "terminal.foreground": p.UNO1,
            "terminal.selectionBackground": withAlpha(selection, 0.50),
            "terminalCursor.background": p.BACKGROUND,
            "terminalCursor.foreground": p.DUO1,
            "terminal.ansiBlack": p.INVISIBLES,
            "terminal.ansiBrightBlack": p.UNO5,
            "terminal.ansiWhite": p.UNO3,
            "terminal.ansiBrightWhite": p.UNO1,
            "terminal.ansiRed": dim(p.INVALID_BG),
            "terminal.ansiBrightRed": p.INVALID_BG,
            "terminal.ansiGreen": green,
            "terminal.ansiBrightGreen": brightGreen,
            "terminal.ansiYellow": yellow,
            "terminal.ansiBrightYellow": brightYellow,
            "terminal.ansiBlue": blue,
            "terminal.ansiBrightBlue": brightBlue,
            "terminal.ansiMagenta": dim(p.DEPRECATED_BG),
            "terminal.ansiBrightMagenta": p.DEPRECATED_BG,
            "terminal.ansiCyan": cyan,
            "terminal.ansiBrightCyan": brightCyan,

            // Focus / badges
            "focusBorder": withAlpha(p.UNO4, 0.60),
            "sash.hoverBorder": p.UNO4,
            "activityBarBadge.background": p.DUO1,
            "activityBarBadge.foreground": p.BACKGROUND,
            "activityBar.activeBorder": p.DUO1,

            // Git decorations
            "gitDecoration.addedResourceForeground": brightGreen,
            "gitDecoration.modifiedResourceForeground": brightBlue,
            "gitDecoration.deletedResourceForeground": p.INVALID_BG,
            "gitDecoration.untrackedResourceForeground": brightGreen,
            "gitDecoration.ignoredResourceForeground": p.UNO5,
            "gitDecoration.conflictingResourceForeground": brightYellow,
            "gitDecoration.stageModifiedResourceForeground": brightBlue,
            "gitDecoration.stageDeletedResourceForeground": p.INVALID_BG,
            "editorGutter.modifiedBackground": brightBlue,
            "editorGutter.addedBackground": brightGreen,
            "editorGutter.deletedBackground": p.INVALID_BG,

            // Diagnostics
            "editorError.foreground": p.INVALID_BG,
            "editorWarning.foreground": brightYellow,
            "editorInfo.foreground": brightBlue,

            // Unicode highlight (ambiguous/invisible/non-basic-ASCII chars, e.g. em dash, »)
            "editorUnicodeHighlight.border": withAlpha(p.UNO4, 0.45),
            "editorUnicodeHighlight.background": withAlpha(p.UNO4, 0.12),

            // Diff editor
            "diffEditor.insertedTextBackground": withAlpha(brightGreen, 0.15),
            "diffEditor.removedTextBackground": withAlpha(p.INVALID_BG, 0.15),
            "diffEditor.insertedLineBackground": withAlpha(brightGreen, 0.10),
            "diffEditor.removedLineBackground": withAlpha(p.INVALID_BG, 0.10),

            // Floating widgets (hover, suggest, peek)
            "editorWidget.background": selectionDark,
            "editorWidget.foreground": p.UNO1,
            "editorWidget.border": p.BACKGROUND,
            "editorHoverWidget.background": selectionDark,
            "editorHoverWidget.border": p.BACKGROUND,
            "editorSuggestWidget.background": selectionDark,
            "editorSuggestWidget.foreground": p.UNO1,
            "editorSuggestWidget.selectedBackground": lighten(p.BACKGROUND, 12),
            "editorSuggestWidget.border": p.BACKGROUND,
            "editorSuggestWidget.highlightForeground": p.DUO1,
            "peekView.border": p.UNO4,
            "peekViewEditor.background": selectionDark,
            "peekViewResult.background": selectionDark,
            "peekViewTitle.background": selectionDark,

            // Notifications
            "notifications.background": p.BACKGROUND,
            "notifications.foreground": p.UNO1,
            "notificationCenterHeader.background": p.BACKGROUND,
            "notificationCenterHeader.foreground": p.UNO1,

            // Inputs & lists
            "input.foreground": p.UNO1,
            "input.border": p.BACKGROUND,
            "input.placeholderForeground": withAlpha(p.UNO1, 0.40),
            "list.activeSelectionForeground": p.UNO1,
            "list.inactiveSelectionForeground": p.UNO1,
            "list.hoverForeground": p.UNO1,
            "list.focusForeground": p.UNO1,
            "list.highlightForeground": p.DUO1,
            "list.focusHighlightForeground": p.DUO1,
            "pickerGroup.foreground": p.UNO2,
            "pickerGroup.border": p.BACKGROUND,

            // Links (markdown preview, dialogs/panels like "Build with Agent")
            "textLink.foreground": p.DUO1,
            "textLink.activeForeground": lighten(p.DUO1, 8),

            // Tabs, progress, checkboxes, sidebar/breadcrumb headers
            "tab.activeBorder": p.DUO2,
            "progressBar.background": p.DUO2,
            "checkbox.background": p.BACKGROUND,
            "checkbox.border": p.UNO4,
            "sideBarSectionHeader.background": p.BACKGROUND,
            "sideBarSectionHeader.foreground": p.UNO1,
            "sideBarTitle.foreground": p.UNO1,
            "breadcrumb.background": p.BACKGROUND,
            "breadcrumb.foreground": p.UNO4,
            "breadcrumb.focusForeground": p.UNO1,
            "breadcrumb.activeSelectionForeground": p.UNO1,
            "breadcrumbPicker.background": p.BACKGROUND,
        },
        tokenColors: [
            {
                name: "Comment",
                scope: "comment",
                settings: { foreground: p.UNO5, fontStyle: " italic" },
            },
            {
                name: "Comment in Params",
                scope: "meta.parameters comment.block",
                settings: { foreground: p.DUO3, fontStyle: " italic" },
            },
            {
                name: "String",
                scope: "string",
                settings: { foreground: p.DUO1 },
            },
            {
                name: "Number",
                scope: "constant.numeric",
                settings: { foreground: p.DUO1 },
            },
            {
                name: "Built-in constant",
                scope: "constant.language",
                settings: { foreground: p.DUO1 },
            },
            {
                name: "User-defined constant",
                scope: ["constant.character", "constant.other"],
                settings: { foreground: p.DUO1 },
            },
            {
                name: "Constant variable",
                scope: "variable.other.constant",
                settings: { foreground: p.UNO2 },
            },
            {
                name: "Variable",
                scope: ["variable", "support.other.variable"],
                settings: { fontStyle: "", foreground: p.UNO2 },
            },
            {
                name: "Keyword",
                scope: "keyword",
                settings: { foreground: p.DUO2 },
            },
            {
                name: "Storage",
                scope: "storage",
                settings: { fontStyle: "", foreground: p.DUO2 },
            },
            {
                name: "Storage type",
                scope: "storage.type",
                settings: { fontStyle: "italic", foreground: p.DUO2 },
            },
            {
                name: "Arrow function",
                scope: "storage.type.function.arrow",
                settings: { fontStyle: "", foreground: p.DUO1 },
            },
            {
                name: "Class name",
                scope: "entity.name.class",
                settings: { fontStyle: "underline", foreground: p.UNO1 },
            },
            {
                name: "Type Name",
                scope: "support.type",
                settings: { fontStyle: "", foreground: p.UNO1 },
            },
            {
                name: "Entity type name",
                scope: "entity.name.type",
                settings: { fontStyle: "", foreground: p.DUO1 },
            },
            {
                name: "Module/namespace name",
                scope: "entity.name.type.module",
                settings: { fontStyle: "", foreground: p.UNO4 },
            },
            {
                name: "Inherited class",
                scope: "entity.other.inherited-class",
                settings: { fontStyle: "italic underline", foreground: p.UNO1 },
            },
            {
                name: "Function name",
                scope: "entity.name.function",
                settings: { fontStyle: "", foreground: p.UNO4 },
            },
            {
                name: "Function argument",
                scope: "variable.parameter",
                settings: { fontStyle: "italic", foreground: p.UNO3 },
            },
            {
                name: "Tag name",
                scope: ["entity.name.tag", "entity.other.attribute-name.class", "entity.other.attribute-name.id"],
                settings: { fontStyle: "", foreground: p.UNO1 },
            },
            {
                name: "Tag attribute",
                scope: "entity.other.attribute-name",
                settings: { fontStyle: "", foreground: p.UNO2 },
            },
            {
                name: "Library function",
                scope: "support.function",
                settings: { fontStyle: "", foreground: p.UNO1 },
            },
            {
                name: "Library constant",
                scope: "support.constant",
                settings: { fontStyle: "", foreground: p.DUO1 },
            },
            {
                name: "Library class/type",
                scope: "support.class",
                settings: { foreground: p.UNO2 },
            },
            {
                name: "Library variable",
                scope: "support.other.variable",
                settings: { fontStyle: "" },
            },
            {
                name: "Invalid",
                scope: "invalid",
                settings: { background: p.INVALID_BG, fontStyle: "", foreground: p.INVALID },
            },
            {
                name: "Invalid deprecated",
                scope: "invalid.deprecated",
                settings: { background: p.DEPRECATED_BG, foreground: p.DEPRECATED },
            },
            {
                name: "Punctuation Meta",
                scope: ["meta.brace", "punctuation"],
                settings: { foreground: p.UNO4 },
            },
            {
                name: "String Punctuation",
                scope: "punctuation.definition.string",
                settings: { foreground: p.DUO3 },
            },
            {
                name: "Accessor Punctuation",
                scope: "punctuation.accessor",
                settings: { foreground: p.UNO2 },
            },
            {
                name: "Optional Accessor Punctuation",
                scope: "punctuation.accessor.optional",
                settings: { foreground: p.DUO2 },
            },
            {
                name: "Object Property",
                scope: ["variable.other.property", "variable.other.object.property", "support.variable.property"],
                settings: { foreground: p.UNO3 },
            },
            {
                name: "Optional Chaining Operator",
                scope: ["keyword.operator.optional", "keyword.operator.safe-navigation"],
                settings: { foreground: p.DUO2 },
            },
            {
                name: "C Comment",
                scope: "comment.block.c",
                settings: { fontStyle: " italic", foreground: p.DUO3 },
            },
            {
                name: "CSS Property",
                scope: ["meta.property-name", "support.type.property-name"],
                settings: { foreground: p.UNO3 },
            },
            {
                name: "CSS Meta",
                scope: "meta.property-value",
                settings: { foreground: p.UNO5 },
            },
            {
                name: "Object Literal Key",
                scope: "meta.object-literal.key",
                settings: { foreground: p.DUO1 },
            },
            {
                name: "Import Block Meta",
                scope: "variable.other.readwrite.alias",
                settings: { foreground: p.UNO2 },
            },
            {
                name: "Special Objects",
                scope: ["variable.language.this", "support.variable.object", "support.variable.dom"],
                settings: { foreground: p.UNO3 },
            },
            {
                name: "HTML Text",
                scope: "text.html",
                settings: { foreground: p.UNO4 },
            },

            // CSS / SCSS / SASS / Less
            {
                name: "CSS Source Base",
                scope: "source.css",
                settings: { foreground: p.UNO5 },
            },
            {
                name: "CSS Unit",
                scope: "keyword.other.unit",
                settings: { foreground: p.DUO2 },
            },
            {
                name: "CSS Function",
                scope: ["support.function.css", "support.function.scss", "support.function.sass"],
                settings: { foreground: p.DUO3 },
            },
            {
                name: "CSS Terminator",
                scope: ["punctuation.terminator.rule.css", "punctuation.terminator.rule.scss", "punctuation.terminator.rule.sass"],
                settings: { foreground: p.DUO3 },
            },
            {
                name: "CSS At-Rule",
                scope: "keyword.control.at-rule",
                settings: { foreground: p.UNO1 },
            },
            {
                name: "CSS Parent Selector",
                scope: "entity.other.attribute-name.parent-selector-suffix",
                settings: { foreground: p.UNO1 },
            },

            // JSON
            {
                name: "JSON Key",
                scope: "support.type.property-name.json",
                settings: { foreground: p.UNO2 },
            },
            {
                name: "JSON Constant",
                scope: "constant.language.json",
                settings: { foreground: p.DUO2 },
            },

            // YAML
            {
                name: "YAML Tag",
                scope: "entity.name.tag.yaml",
                settings: { foreground: p.UNO2 },
            },
            {
                name: "YAML Constant",
                scope: "constant.language.yaml",
                settings: { foreground: p.DUO2 },
            },

            // Markdown / GFM
            {
                name: "Markdown Bold",
                scope: "markup.bold",
                settings: { fontStyle: "bold" },
            },
            {
                name: "Markdown Italic",
                scope: "markup.italic",
                settings: { fontStyle: "italic" },
            },
            {
                name: "Markdown Link",
                scope: "markup.underline.link",
                settings: { foreground: p.UNO2 },
            },
            {
                name: "Markdown Heading 1-3",
                scope: ["markup.heading.1", "markup.heading.2", "markup.heading.3"],
                settings: { foreground: p.DUO1 },
            },
            {
                name: "Markdown Heading 4-6",
                scope: ["markup.heading.4", "markup.heading.5", "markup.heading.6"],
                settings: { foreground: p.DUO2 },
            },
            {
                name: "Markdown Fenced Code",
                scope: "markup.fenced_code.block",
                settings: { foreground: p.DUO1 },
            },
            {
                name: "Markdown Quote",
                scope: "markup.quote",
                settings: { foreground: p.UNO4 },
            },
            {
                name: "Markdown Strikethrough",
                scope: "markup.strikethrough",
                settings: { foreground: p.UNO5 },
            },

            // CoffeeScript
            {
                name: "CoffeeScript Source",
                scope: "source.coffee",
                settings: { foreground: p.UNO4 },
            },

            // Jade / Pug
            {
                name: "Jade/Pug Attribute Tag",
                scope: ["constant.name.attribute.tag.jade", "constant.name.attribute.tag.pug"],
                settings: { foreground: p.UNO4 },
            },

            {
                name: "Sidebar Background",
                scope: "sidebar",
                settings: { background: p.BACKGROUND },
            },
        ],
    };
}

module.exports = buildTheme;
