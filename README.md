# VORA Icon System (`@/components/icon`)

Centralized, type-safe icon management system based on [`react-icons`](https://react-icons.github.io/react-icons/).

---

## 📁 Directory Structure

```text
src/components/icon/
├── Icon.jsx          # Main Icon component & icon registry (iconMap)
├── IconGallery.jsx   # Interactive visual explorer UI (/check-icons)
├── check-icons.js    # Static validator script (CLI: pnpm check-icons)
└── README.md         # Documentation
```

---

## 🚀 Quick Usage

Import the `Icon` component from `@/components/icon/Icon`:

```jsx
import Icon from "@/components/icon/Icon";

export default function MyComponent() {
  return (
    <div className="flex items-center gap-2">
      {/* Basic usage */}
      <Icon name="dashboard" />

      {/* Custom size (px or em) */}
      <Icon name="shield" size="20px" />

      {/* Custom styling & Tailwind colors */}
      <Icon name="check-circle" size="24px" className="text-emerald-500 hover:scale-110 transition-transform" />

      {/* Inline styles */}
      <Icon name="settings" size="18px" style={{ color: "var(--primary)" }} />
    </div>
  );
}
```

---

## ⚙️ Component Props (`Icon.jsx`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Required** | The registered semantic key from `iconMap` (e.g. `"dashboard"`, `"delete"`, `"edit"`). |
| `size` | `string \| number` | `"1em"` | Icon dimension. Accepts `"16px"`, `"24px"`, `"1.5rem"`, or numbers (e.g. `24`). |
| `className` | `string` | `""` | Tailwind or CSS class names (text color, margins, animations, etc.). |
| `style` | `object` | `{}` | Inline CSS styles applied to the icon element. |

> **Note**: If you pass an icon name that is not registered in `iconMap`, a clear error is thrown at runtime:
> ```text
> Error: Icon "xyz" is not available in Icon.jsx. Please add it to the iconMap or use a valid icon name.
> ```

---

## 🏷️ Naming Rules

- **One icon = one name.** Never register the same icon component under multiple names (no aliases).
- Names must describe the icon itself, in `kebab-case` (e.g. `user-plus`, `chevron-down`).
- Do **not** add library prefixes or suffixes such as `md-`, `-fi`, `-tb`, `-ios`.
- If two different icons would get the same name (e.g. a filled and an outlined shield), differentiate them by style, not by library: `shield` and `shield-outline`.

---

## ➕ How to Add a New Icon (`Icon.jsx`)

Whenever you need a new icon in the project:

### Step 1: Import the icon from `react-icons`
File: `src/components/icon/Icon.jsx`

```javascript
import { MdOutlineFingerprint } from "react-icons/md";
```

### Step 2: Register it in `iconMap`
Add it under the relevant category heading with a semantic, clean name (without library prefixes like `md-` or `-fi`):

```javascript
const iconMap = {
  // ... existing icons

  // Security
  fingerprint: MdOutlineFingerprint,
};
```

> **Tip:** The `// Heading` comments inside `iconMap` are what the explorer uses to build its categories. To create a new category, simply add a new `// Category Name` comment and put the icons below it.

### Step 3: Use it
```jsx
<Icon name="fingerprint" size="20px" className="text-primary" />
```

---

## 🎨 Interactive Icon Explorer (`/check-icons`)

A built-in explorer lets you see how every icon looks, browse it by category, and copy ready-made snippets:

1. Start the dev server:
   ```bash
   pnpm dev
   ```
2. Open in your browser:
   ```text
   http://localhost:5173/check-icons
   ```

### Explorer Features
- 🔍 **Real-time Search**: Type an icon name to filter. Matching works both ways: the icon name can contain your query (`analy` → `analytics`), or your query can contain the icon name (`analytics-fi` → `analytics`).
- 📐 **Size Switcher**: Toggle live sizes (`16px`, `20px`, `24px`, `32px`).
- 📋 **1-Click Copy**:
  - **Copy Name Only** (e.g. `dashboard`)
  - **Copy JSX Snippet** (e.g. `<Icon name="dashboard" size="24px" />`)
- 🗂️ **Categorized View**: Icons are grouped by category regardless of which `react-icons` package they come from. Categories are read dynamically from the `// Heading` comments inside `iconMap` in `Icon.jsx`, so there is no separate list to maintain.

---

## 🧪 Icon Validation CLI (`pnpm check-icons`)

Scans the entire codebase to verify that no invalid or misspelled icon name is being used:

```bash
pnpm check-icons
```

- If an invalid icon is found, the script prints the exact file and line number and exits with a non-zero code.
- If everything is valid, it prints `All static icon usages are valid.`
