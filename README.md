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
| `name` | `string` | **Required** | The registered semantic key from `iconMap` (e.g. `"dashboard"`, `"trash"`, `"edit"`). |
| `size` | `string \| number` | `"1em"` | Icon dimension. Accepts `"16px"`, `"24px"`, `"1.5rem"`, or numbers (e.g. `24`). |
| `className` | `string` | `""` | Tailwind or CSS class names (text color, margins, animations, etc.). |
| `style` | `object` | `{}` | Inline CSS styles applied to the wrapper icon. |

> **Note**: Agar koi aisa icon name pass kiya jo `iconMap` me registered nahi hai, toh runtime pe clear error throw hoga:
> ```text
> Error: Icon "xyz" is not available in Icon.jsx. Please add it to the iconMap or use a valid icon name.
> ```

---

## ➕ Naya Icon Kaise Add Karein (`Icon.jsx`)

Jab bhi naya icon project me chahiye ho:

### Step 1: `react-icons` se icon import karein
File: `src/components/icon/Icon.jsx`

```javascript
import { MdOutlineFingerprint } from "react-icons/md";
```

### Step 2: `iconMap` me register karein
Relevant category heading ke niche semantic, clean name ke sath add karein (without library prefixes like `md-` or `-fi`):

```javascript
const iconMap = {
  // ... existing icons

  // Security
  fingerprint: MdOutlineFingerprint,
};
```

### Step 3: Use karein
```jsx
<Icon name="fingerprint" size="20px" className="text-primary" />
```

---

## 🎨 Interactive Icon Explorer (`/check-icons`)

Har icon ka visual look, category aur copy snippet dekhne ke liye built-in explorer available hai:

1. Dev server start karein:
   ```bash
   pnpm dev
   ```
2. Browser me open karein:
   ```text
   http://localhost:5173/check-icons
   ```

### Explorer Features:
- 🔍 **Real-time Search**: Icon ka naam type karke search kar sakte hain.
- 📐 **Size Switcher**: Live sizes (`16px`, `20px`, `24px`, `32px`) toggle karke dekh sakte hain.
- 📋 **1-Click Copy**:
  - **Copy Name Only** (e.g. `dashboard`)
  - **Copy JSX Snippet** (e.g. `<Icon name="dashboard" size="24px" />`)
- 🗂️ **Categorized View**: Category-wise icons dekh sakte hain.

---

## 🧪 Icon Validation CLI (`pnpm check-icons`)

Pura codebase scan karke verify karne ke liye ki koi invalid ya misspelled icon name use toh nahi hua:

```bash
pnpm check-icons
```

- Agar koi invalid icon use hua hoga, toh script exact file aur line number print karegi aur non-zero code ke saath exit hogi.
- Sab valid hone par `All static icon usages are valid.` message show hoga.
