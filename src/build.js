"use strict";

const fs = require("fs");
const path = require("path");
const buildTheme = require("./buildTheme");
const themes = require("./themes");

for (const [name, palette] of Object.entries(themes)) {
    const theme = buildTheme(palette);
    const outPath = path.join(__dirname, "../themes/", `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify(theme, null, 4));
}

console.log("Done writing themes");
