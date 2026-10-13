# VORA Icon System (`@/components/custom/icon`)

Centralized, type-safe icon management system based on [`react-icons`](https://react-icons.github.io/react-icons/).

---

## 📁 Directory Structure

```text
src/components/custom/icon/
├── Icon.jsx          # Main Icon component & centralized icon registry (iconMap)
├── IconGallery.jsx   # Interactive visual explorer UI (/check-icons)
├── check-icons.js    # Strict validation CLI script (pnpm check-icons)
└── README.md         # Documentation & guide
```

---

## 🚀 Quick Usage

Import the `Icon` component from `@/components/custom/icon/Icon`:

```jsx
import Icon from "@/components/custom/icon/Icon";

export default function MyComponent() {
  return (
    <div className="flex items-center gap-2">
      {/* Basic usage */}
      <Icon name="dashboard" />

      {/* Custom size (px, rem, or em) */}
      <Icon name="security" size="20px" />

      {/* Tailwind colors & animations */}
      <Icon name="check-circle" size="24px" className="text-emerald-500 hover:scale-110 transition-transform" />

      {/* Conditional / Ternary */}
      <Icon name={isActive ? "chevron-up" : "chevron-down"} size="16px" />

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
| `name` | `string` | **Required** | The semantic key registered in `iconMap` (e.g. `"dashboard"`, `"edit"`, `"delete"`). |
| `size` | `string \| number` | `"1em"` | Icon dimension. Accepts `"16px"`, `"24px"`, `"1.5rem"`, or numbers (e.g. `24`). |
| `className` | `string` | `""` | Tailwind or custom CSS classes (color, hover styles, animations). |
| `style` | `object` | `{}` | Inline CSS styles applied to the icon element. |

> **Graceful Fallback:** If an icon name is not found in `iconMap`, the application will **not crash**. A warning is logged to the console, and a safe, low-opacity fallback icon (`help-circle` / `alert-circle`) is rendered.

---

## 🏷️ Naming Rules

1. **One icon = one name**: Never register the same icon component under multiple aliases.
2. **Kebab-case semantic names**: Names must describe the purpose of the icon (e.g. `user-plus`, `file-text`, `chevron-down`).
3. **No library prefixes/suffixes**: Do not add library prefixes or suffixes such as `md-`, `-fi`, `-lu`, `-ios`.
4. **Style variants**: If filled and outlined versions are needed, differentiate them by style suffix: e.g. `shield` and `shield-outline`.

---

## ➕ How to Add a New Icon (`Icon.jsx`)

Whenever you need a new icon in the project:

### Step 1: Import the icon from `react-icons`
File: `src/components/custom/icon/Icon.jsx`

```javascript
import { MdOutlineFingerprint } from "react-icons/md";
```

### Step 2: Register it in `iconMap`
Add it under the relevant category heading using a clean semantic name:

```javascript
const iconMap = {
  // ... existing icons

  // Security
  fingerprint: MdOutlineFingerprint,
};
```

> **Tip:** The `// Heading` comments inside `iconMap` are read dynamically by the `/check-icons` explorer to generate category groups.

### Step 3: Use it in JSX
```jsx
<Icon name="fingerprint" size="20px" className="text-primary" />
```

---

## 🎨 Interactive Icon Explorer (`/check-icons`)

A built-in explorer page allows you to preview, search, and copy snippets for all 2,100+ icons:

1. Start the dev server:
   ```bash
   pnpm dev
   ```
2. Open in your browser:
   ```text
   http://localhost:5173/check-icons
   ```

### Explorer Features
- 🔍 **Real-time Two-Way Search**: Filter by icon name.
- 📐 **Live Size Switcher**: Toggle preview sizes (`16px`, `20px`, `24px`, `32px`).
- 📋 **1-Click Copy**:
  - **Copy Name Only** (e.g. `dashboard`)
  - **Copy JSX Snippet** (e.g. `<Icon name="dashboard" size="24px" />`)
- 🗂️ **Categorized Explorer**: View icons grouped by domain and functional category.

---

## 🧪 Icon Validation CLI (`pnpm check-icons`)

Static code validation script designed for builds and pre-commit checks:

```bash
pnpm check-icons
```

### What It Validates:
1. **Direct JSX Usages**: `<Icon name="xyz" />`
2. **Ternary Expressions**: `<Icon name={isSort ? "arrow-up" : "arrow-down"} />` (only validates return branches, ignoring comparison values)
3. **Fallback Expressions**: `<Icon name={iconName || "default-icon"} />`
4. **Dynamic Props**: Permitted in reusable components (`<Icon name={item.icon} />`), which are safely checked at runtime.

- If an invalid icon name is found: Prints the exact file path, line number, column, and exits with a non-zero code.
- If all usages are valid: Prints `All statically checkable Icon names are valid.`

---

## 🟦 Reusing in TypeScript (`.ts` / `.tsx`) Projects

To reuse this icon system in a TypeScript project:

1. **Native Types (`Icon.tsx`)**:
   ```typescript
   export type IconName = keyof typeof iconMap;

   export interface IconProps {
     name: IconName; // <--- Full IntelliSense autocomplete & compile-time checking
     size?: string | number;
     className?: string;
     style?: React.CSSProperties;
   }
   ```
2. **`check-icons.js`**:
   The validator reads `.tsx` and `.ts` files out of the box. You can customize paths using environment variables if needed:
   ```bash
   ICON_COMPONENT_PATH="./src/components/custom/icon/Icon.tsx" pnpm check-icons
   ```
