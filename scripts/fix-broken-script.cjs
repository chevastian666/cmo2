const fs = require("fs");
const path = require("path");

function fixBrokenScript() {
  const filePath = path.join(__dirname, "final-any-cleanup.cjs");
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    content = content.replace(/\\!/g, "\!");
    fs.writeFileSync(filePath, content);
    console.log("Fixed broken script");
  }
}

fixBrokenScript();
