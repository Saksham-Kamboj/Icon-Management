/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconFilePath = path.join(__dirname, "Icon.jsx");
const srcDir = path.resolve(__dirname, "../../../");

// 1. Extract valid icon names
const iconFileContent = fs.readFileSync(iconFilePath, "utf-8");
const iconMapMatch = iconFileContent.match(/const iconMap = \{([\s\S]*?)\};/);

if (!iconMapMatch) {
  console.error("Could not find iconMap in Icon.jsx");
  process.exit(1);
}

const iconMapString = iconMapMatch[1];
const validIcons = new Set();
// match keys like `dashboard: MdDashboard` or `"location": MdLocationOn`
const keyRegex = /^\s*([a-zA-Z0-9_-]+|"[a-zA-Z0-9_-]+"\s*):/gm;
let match;
while ((match = keyRegex.exec(iconMapString)) !== null) {
  const key = match[1].replace(/"/g, "").trim();
  validIcons.add(key);
}

// 2. Scan all files
function scanDirectory(dir) {
  let hasError = false;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (scanDirectory(fullPath)) {
        hasError = true;
      }
    } else if (fullPath.endsWith(".jsx") || fullPath.endsWith(".js")) {
      // Don't check the Icon.jsx file itself or this checker script
      if (fullPath === iconFilePath || fullPath === __filename) continue;

      const content = fs.readFileSync(fullPath, "utf-8");

      // Look for <Icon ... name="something" ... />
      // \b ensures we only match `<Icon` and not `<IconButton`
      const iconUsageRegex =
        /<Icon\b[^>]*?name\s*=\s*(?:(["'])([^"']+)\1|\{(["'])([^"']+)\3\})[^>]*?>/g;

      let usageMatch;
      while ((usageMatch = iconUsageRegex.exec(content)) !== null) {
        const usedName = usageMatch[2] || usageMatch[4];
        if (usedName && !validIcons.has(usedName)) {
          // Calculate line number for better error message
          const lineNumber = content
            .substring(0, usageMatch.index)
            .split("\n").length;
          console.error(
            `\x1b[31mError:\x1b[0m Invalid Icon name "\x1b[33m${usedName}\x1b[0m" used in \x1b[36m${fullPath}:${lineNumber}\x1b[0m`
          );
          hasError = true;
        }
      }
    }
  }
  return hasError;
}

console.log("Checking Icon usages...");
const hasError = scanDirectory(srcDir);

if (hasError) {
  console.error(
    "\x1b[31mBuild failed due to invalid icon names. Please use an available icon name.\x1b[0m"
  );
  process.exit(1);
} else {
  console.log("\x1b[32mAll static icon usages are valid.\x1b[0m");
}
