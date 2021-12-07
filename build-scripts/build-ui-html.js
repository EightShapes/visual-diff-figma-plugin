const fs = require("fs");

const scripts = fs.readFileSync("dist/ui.js", "utf-8");
const html = fs.readFileSync("src/ui.html", "utf-8");

const contents = `${html}<script>${scripts}</script>`;

fs.writeFileSync("dist/ui-autogen.html", contents);
