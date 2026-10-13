/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Override these with environment variables if your project layout differs.
const iconFilePath = path.resolve(
  process.env.ICON_COMPONENT_PATH || path.join(__dirname, "Icon.jsx")
);
const srcDir = path.resolve(
  process.env.ICON_SCAN_DIR || path.resolve(__dirname, "../../../")
);
const extensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "build",
  "node_modules",
]);

function fail(message) {
  console.error(`\x1b[31mError:\x1b[0m ${message}`);
  process.exit(1);
}

function stripComments(source) {
  // Keep line breaks and character positions stable for accurate diagnostics.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(
      /(^|[^:])\/\/.*$/gm,
      (match, prefix) =>
        `${prefix}${" ".repeat(Math.max(0, match.length - prefix.length))}`
    );
}

function getLineAndColumn(source, index) {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  const lastNewline = before.lastIndexOf("\n");
  return { line, column: index - lastNewline };
}

function report(filePath, source, index, message) {
  const { line, column } = getLineAndColumn(source, index);
  console.error(
    `\x1b[31mError:\x1b[0m ${message} in \x1b[36m${path.relative(srcDir, filePath)}:${line}:${column}\x1b[0m`
  );
}

function extractValidIconNames(source) {
  const mapMatch = source.match(/\bconst\s+iconMap\s*=\s*\{([\s\S]*?)^\s*\};/m);
  if (!mapMatch) {
    fail(`Could not find "const iconMap = { ... }" in ${iconFilePath}`);
  }

  const validNames = new Set();
  const keyRegex = /^\s*(?:([A-Za-z_$][\w$-]*)|(["'])([^"']+)\2)\s*:/gm;
  let match;
  while ((match = keyRegex.exec(mapMatch[1])) !== null) {
    validNames.add(match[1] || match[3]);
  }

  if (validNames.size === 0) {
    fail(`No icon names were extracted from iconMap in ${iconFilePath}`);
  }
  return validNames;
}

function readBalancedExpression(source, openBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = openBraceIndex; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0)
        return { text: source.slice(openBraceIndex + 1, i), end: i + 1 };
    }
  }
  return null;
}

function validateIconTag(
  filePath,
  originalSource,
  source,
  tagStart,
  tagText,
  validNames
) {
  const nameMatch = /\bname\s*=\s*/.exec(tagText);
  if (!nameMatch) return false;

  const valueStart = nameMatch.index + nameMatch[0].length;
  const remaining = tagText.slice(valueStart);
  const quotedValue = /^(?:"([^"]*)"|'([^']*)')/.exec(remaining);
  if (quotedValue) {
    const name = quotedValue[1] ?? quotedValue[2];
    if (!validNames.has(name)) {
      report(
        filePath,
        originalSource,
        tagStart + valueStart,
        `Invalid Icon name "${name}". Use a name defined in iconMap`
      );
      return true;
    }
    return false;
  }

  if (remaining.startsWith("{")) {
    const expression = readBalancedExpression(remaining, 0);
    if (!expression) {
      report(
        filePath,
        originalSource,
        tagStart + valueStart,
        "Unable to parse Icon name expression"
      );
      return true;
    }

    const expressionText = expression.text.trim();
    const expressionLiteral = /^(?:"([^"]*)"|'([^']*)')$/.exec(expressionText);
    if (expressionLiteral) {
      const name = expressionLiteral[1] ?? expressionLiteral[2];
      if (!validNames.has(name)) {
        report(
          filePath,
          originalSource,
          tagStart + valueStart,
          `Invalid Icon name "${name}". Use a name defined in iconMap`
        );
        return true;
      }
      return false;
    }

    // 1. Ternary condition: condition ? "iconA" : "iconB"
    // Only check the consequence and alternate values, NOT the condition (e.g. order === "asc")
    const ternaryMatch = /^([\s\S]*?)\?([\s\S]*?):([\s\S]*)$/.exec(
      expressionText
    );
    if (ternaryMatch) {
      const branches = [
        {
          text: ternaryMatch[2].trim(),
          offset: expressionText.indexOf("?") + 1,
        },
        {
          text: ternaryMatch[3].trim(),
          offset: expressionText.lastIndexOf(":") + 1,
        },
      ];
      let hasError = false;
      for (const branch of branches) {
        const branchLiteral = /^(?:"([^"]*)"|'([^']*)')$/.exec(branch.text);
        if (branchLiteral) {
          const name = branchLiteral[1] ?? branchLiteral[2];
          if (!validNames.has(name)) {
            report(
              filePath,
              originalSource,
              tagStart + valueStart + branch.offset,
              `Invalid Icon name "${name}". Use a name defined in iconMap`
            );
            hasError = true;
          }
        }
      }
      return hasError;
    }

    // 2. Logical OR / fallback: iconName || "default-icon"
    const orMatch = /\|\|\s*(?:"([^"]*)"|'([^']*)')/.exec(expressionText);
    if (orMatch) {
      const name = orMatch[1] ?? orMatch[2];
      if (!validNames.has(name)) {
        report(
          filePath,
          originalSource,
          tagStart + valueStart + orMatch.index,
          `Invalid Icon name "${name}". Use a name defined in iconMap`
        );
        return true;
      }
      return false;
    }

    // 3. Dynamic identifiers or props (e.g. <Icon name={icon} />, <Icon name={item.icon} />)
    // Dynamic icon variables are standard in reusable components and are verified at runtime by Icon.jsx
    return false;
  }

  report(
    filePath,
    originalSource,
    tagStart + valueStart,
    "Icon name must be a quoted string or a JSX expression"
  );
  return true;
}

function scanFile(filePath, validNames) {
  const originalSource = fs.readFileSync(filePath, "utf8");
  const source = stripComments(originalSource);
  let hasError = false;
  // This checks Icon component tags, not IconButton or similarly named components.
  const iconTagRegex = /<Icon\b(?=[\s/>])([\s\S]*?)(?:\/?>)/g;
  let tagMatch;
  while ((tagMatch = iconTagRegex.exec(source)) !== null) {
    const tagText = tagMatch[0];
    if (
      validateIconTag(
        filePath,
        originalSource,
        source,
        tagMatch.index,
        tagText,
        validNames
      )
    ) {
      hasError = true;
    }
  }
  return hasError;
}

function scanDirectory(directory, validNames) {
  let hasError = false;
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    fail(`Cannot read scan directory "${directory}": ${error.message}`);
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.isDirectory()) continue;
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      if (scanDirectory(path.join(directory, entry.name), validNames))
        hasError = true;
      continue;
    }

    const filePath = path.join(directory, entry.name);
    if (!extensions.has(path.extname(entry.name))) continue;
    if (path.resolve(filePath) === path.resolve(iconFilePath)) continue;
    if (path.resolve(filePath) === path.resolve(__filename)) continue;
    if (scanFile(filePath, validNames)) hasError = true;
  }
  return hasError;
}

if (!fs.existsSync(iconFilePath)) {
  fail(
    `Icon component not found: ${iconFilePath}. Set ICON_COMPONENT_PATH if needed.`
  );
}
if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) {
  fail(`Source directory not found: ${srcDir}. Set ICON_SCAN_DIR if needed.`);
}

console.log(`Checking Icon usages under: ${srcDir}`);
console.log(`Using icon map from: ${iconFilePath}`);
const validNames = extractValidIconNames(fs.readFileSync(iconFilePath, "utf8"));
console.log(`Loaded ${validNames.size} valid icon names.`);

const hasError = scanDirectory(srcDir, validNames);
if (hasError) {
  console.error(
    "\x1b[31mIcon validation failed. Replace invalid names with keys available in iconMap.\x1b[0m"
  );
  process.exit(1);
}
console.log("\x1b[32mAll statically checkable Icon names are valid.\x1b[0m");
