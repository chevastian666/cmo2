const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src");

function fixFiles(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory() && \!file.startsWith(".")) {
      count += fixFiles(fullPath);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      try {
        let content = fs.readFileSync(fullPath, "utf8");
        const original = content;
        
        // Fix any types
        content = content.replace(/: any\[\]/g, ": unknown[]");
        content = content.replace(/: any\)/g, ": unknown)");
        content = content.replace(/: any;/g, ": unknown;");
        content = content.replace(/Record<string, any>/g, "Record<string, unknown>");
        
        if (content \!== original) {
          fs.writeFileSync(fullPath, content);
          count++;
        }
      } catch (e) {}
    }
  }
  return count;
}

console.log("Fixed", fixFiles(srcDir), "files");
