import { useState, useMemo, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Icon, { iconNames, getIconPackage } from "@/components/custom/icon/Icon";
import iconSourceCode from "@/components/custom/icon/Icon.jsx?raw";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// How many icon cards are rendered at once (more load automatically on scroll)
const PAGE_SIZE = 240;

/**
 * Parse which react-icons package each icon name comes from.
 * Example: import { MdDashboard } from "react-icons/md" -> { dashboard: "react-icons/md" }
 */
const parseIconLibraries = (source) => {
  const compToPackage = {};
  const importRegex = /import\s*\{([\s\S]*?)\}\s*from\s*["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(source)) !== null) {
    // strip `// comments` first so the identifier after a comment isn't lost
    const rawImports = match[1].replace(/\/\/.*$/gm, "");
    const pkg = match[2];
    if (pkg.includes("react-icons")) {
      const identifiers = rawImports
        .split(",")
        .map((s) =>
          s
            .trim()
            .split(/\s+as\s+/)[0]
            .trim()
        )
        .filter(Boolean);
      for (const id of identifiers) compToPackage[id] = pkg;
    }
  }

  const mapMatch = source.match(/const iconMap = \{([\s\S]*?)\n\};/);
  const nameToPackage = {};
  if (mapMatch) {
    const lineRegex = /^\s*(["']?[a-zA-Z0-9_-]+["']?)\s*:\s*([a-zA-Z0-9_]+)/gm;
    let lineMatch;
    while ((lineMatch = lineRegex.exec(mapMatch[1])) !== null) {
      const iconKey = lineMatch[1].replace(/["']/g, "").trim();
      const compName = lineMatch[2].trim();
      if (compToPackage[compName])
        nameToPackage[iconKey] = compToPackage[compName];
    }
  }
  return nameToPackage;
};

/**
 * Parse category groups from the `// Heading` comments inside iconMap in Icon.jsx.
 * Every icon key below a comment belongs to that group (any package).
 */
const parseIconGroups = (source) => {
  const mapMatch = source.match(/const iconMap = \{([\s\S]*?)\n\};/);
  const groups = new Map();
  if (!mapMatch) return groups;

  let current = "Other";
  for (const line of mapMatch[1].split("\n")) {
    const comment = line.match(/^\s*\/\/\s*(.+?)\s*$/);
    if (comment) {
      // ignore commented-out entries like `// foo: Bar,`
      if (/^["']?[\w-]+["']?\s*:/.test(comment[1])) continue;
      current = comment[1].replace(/^[-\s]+|[-\s]+$/g, "");
      continue;
    }
    const key = line.match(/^\s*["']?([a-zA-Z0-9_-]+)["']?\s*:/);
    if (key) {
      if (!groups.has(current)) groups.set(current, []);
      groups.get(current).push(key[1]);
    }
  }
  return groups;
};

/**
 * Two-way search match:
 *  - icon name contains the query   ("analy"        -> analytics)
 *  - query contains the icon name   ("analytics-fi" -> analytics)
 */
const matchesSearch = (name, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const n = name.toLowerCase();
  return n.includes(q) || q.includes(n);
};

function IconCardItem({
  name,
  packageName,
  selectedSize,
  copiedInfo,
  onCopyName,
  onCopySnippet,
}) {
  const isCopied = copiedInfo?.name === name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={`Click to copy "${name}" (${packageName})`}
          className={`group h-18 p-1.5 rounded border text-center flex flex-col items-center justify-center transition-all cursor-pointer relative ${
            isCopied
              ? "border-primary bg-primary/10 ring-1 ring-primary/40 text-primary"
              : "border-border/70 bg-card hover:border-primary/60 hover:bg-primary/5 hover:scale-102 active:scale-98 shadow-2xs"
          }`}
        >
          <div className="h-8 flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
            <Icon name={name} size={selectedSize} />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground truncate w-full px-0.5 mt-0.5 font-medium leading-none">
            {name}
          </span>
          {isCopied && (
            <span className="absolute -top-1.5 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 rounded shadow-xs leading-tight">
              {copiedInfo.type === "name" ? "Name" : "JSX"}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        side="bottom"
        sideOffset={4}
        className="w-65 p-1.5 shadow-xl"
      >
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/70 mb-1 bg-muted/30 rounded">
          <div className="flex items-center gap-2 truncate">
            <Icon name={name} size="18px" className="text-primary shrink-0" />
            <span className="font-mono text-xs font-bold text-foreground truncate">
              {name}
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] font-mono px-1 py-0 h-3.5 shrink-0 ml-1"
          >
            {packageName.replace("react-icons/", "")}
          </Badge>
        </div>
        <DropdownMenuItem
          onClick={() => onCopyName(name)}
          className="cursor-pointer flex items-center justify-between text-xs py-1.5 rounded"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Icon name="copy" size="13px" />
            Copy Name Only
          </span>
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-20">
            {name}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onCopySnippet(name)}
          className="cursor-pointer flex items-center justify-between text-xs py-1.5 rounded"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Icon name="copy" size="13px" />
            Copy JSX with Size
          </span>
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {selectedSize}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarItem({ label, count, active, onClick }) {
  const empty = count === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-left text-xs transition-colors cursor-pointer border-l-2 ${
        active
          ? "bg-primary/10 text-primary font-semibold border-primary"
          : empty
            ? "text-muted-foreground/50 border-transparent hover:bg-muted/40"
            : "text-foreground/80 border-transparent hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <span className="truncate">{label}</span>
      <span
        className={`shrink-0 font-mono text-[10px] px-1.5 rounded ${
          active
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

const ALL = "__all__";

export default function CheckIcons() {
  const [search, setSearch] = useState("");
  const [selectedSize, setSelectedSize] = useState("24px");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [copiedInfo, setCopiedInfo] = useState(null); // { name, type: 'name' | 'jsx' }
  const [limitState, setLimitState] = useState({ key: "", value: PAGE_SIZE });

  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  // name -> package (e.g. "react-icons/fi"), parsed from Icon.jsx
  const iconPackageMap = useMemo(() => parseIconLibraries(iconSourceCode), []);
  const getPackage = (name) => iconPackageMap[name] || getIconPackage(name);

  const allIcons = useMemo(() => [...iconNames].sort(), []);

  // Category groups, dynamically built from the `// Heading` comments in Icon.jsx
  const categoryGroups = useMemo(() => {
    const parsed = parseIconGroups(iconSourceCode);
    const valid = new Set(iconNames);
    const used = new Set();
    const result = [];

    for (const [category, names] of parsed.entries()) {
      const icons = names.filter((n) => valid.has(n) && !used.has(n));
      icons.forEach((n) => used.add(n));
      if (icons.length) result.push({ category, icons: icons.sort() });
    }

    // Safety net: anything in iconMap that wasn't found by the parser
    const leftovers = iconNames.filter((n) => !used.has(n)).sort();
    if (leftovers.length) {
      const other = result.find((g) => g.category === "Other");
      if (other) other.icons = [...other.icons, ...leftovers].sort();
      else result.push({ category: "Other", icons: leftovers });
    }
    return result;
  }, []);

  // Sidebar counts follow the current search
  const sidebarGroups = useMemo(
    () =>
      categoryGroups.map((g) => ({
        ...g,
        count: g.icons.filter((n) => matchesSearch(n, search)).length,
      })),
    [categoryGroups, search]
  );
  const totalMatches = useMemo(
    () => allIcons.filter((n) => matchesSearch(n, search)).length,
    [allIcons, search]
  );

  const activeLabel = activeCategory === ALL ? "All icons" : activeCategory;

  // Icons shown on the right = selected category + search
  const results = useMemo(() => {
    const base =
      activeCategory === ALL
        ? allIcons
        : (categoryGroups.find((g) => g.category === activeCategory)?.icons ??
          []);
    return base.filter((n) => matchesSearch(n, search));
  }, [activeCategory, allIcons, categoryGroups, search]);

  // Progressive rendering: reset the limit whenever the filter changes
  const limitKey = `${activeCategory}|${search}`;
  const limit = limitState.key === limitKey ? limitState.value : PAGE_SIZE;
  const visibleIcons = results.slice(0, limit);
  const hasMore = results.length > limit;

  useEffect(() => {
    if (!hasMore) return undefined;
    const node = sentinelRef.current;
    const root = scrollRef.current;
    if (!node || !root) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLimitState({ key: limitKey, value: limit + PAGE_SIZE });
        }
      },
      { root, rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, limit, limitKey]);

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0 });

  const selectCategory = (cat) => {
    setActiveCategory(cat);
    scrollToTop();
  };

  const copyNameOnly = (iconName) => {
    navigator.clipboard.writeText(iconName);
    setCopiedInfo({ name: iconName, type: "name" });
    toast.success(`Copied name: "${iconName}"`);
    setTimeout(() => {
      setCopiedInfo((curr) => (curr?.name === iconName ? null : curr));
    }, 2000);
  };

  const copySnippet = (iconName) => {
    const tag = "Icon";
    const textToCopy = `<${tag} name="${iconName}" size="${selectedSize}" />`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedInfo({ name: iconName, type: "jsx" });
    toast.success(`Copied JSX: ${textToCopy}`);
    setTimeout(() => {
      setCopiedInfo((curr) => (curr?.name === iconName ? null : curr));
    }, 2000);
  };

  return (
    <div className="h-screen flex bg-background text-foreground font-sans overflow-hidden">
      <Helmet>
        <title>Icon System Explorer | VORA</title>
      </Helmet>

      {/* ───────────── Sidebar (fits screen, own scroll) ───────────── */}
      <aside className="hidden md:flex w-60 shrink-0 h-full flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="shrink-0 flex items-center gap-2.5 px-3 py-2.5 border-b border-border">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
            <Icon name="search" size="16px" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight leading-none truncate">
                Icon Explorer
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 h-4"
              >
                {allIcons.length}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-none font-mono truncate">
              /check-icons
            </p>
          </div>
        </div>

        {/* Category list */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-2 space-y-0.5">
          <SidebarItem
            label="All icons"
            count={totalMatches}
            active={activeCategory === ALL}
            onClick={() => selectCategory(ALL)}
          />
          <div className="px-2.5 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            Categories ({categoryGroups.length})
          </div>
          {sidebarGroups.map((g) => (
            <SidebarItem
              key={g.category}
              label={g.category}
              count={g.count}
              active={activeCategory === g.category}
              onClick={() => selectCategory(g.category)}
            />
          ))}
        </nav>
      </aside>

      {/* ───────────── Right section ───────────── */}
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {/* Header: title + search + size */}
        <header className="shrink-0 flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 border-b border-border bg-card">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight leading-none truncate">
                {activeLabel}
              </h2>
              <Badge
                variant="secondary"
                className="text-[10px] font-mono px-1.5 py-0 h-4"
              >
                {results.length} icons
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-none">
              Click any icon to copy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-44 sm:w-56">
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  scrollToTop();
                }}
                placeholder="Search icon..."
                className="h-7.5 text-xs bg-muted/40 pr-6"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    scrollToTop();
                  }}
                  className="absolute right-2 top-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-0.5 bg-muted/30 border border-border rounded p-0.5">
              {["16px", "20px", "24px", "32px"].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-all cursor-pointer ${
                    selectedSize === sz
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Mobile: category strip (sidebar is hidden on small screens) */}
        <div className="md:hidden shrink-0 flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-b border-border bg-card">
          {[
            { category: ALL, label: "All", count: totalMatches },
            ...sidebarGroups.map((g) => ({
              category: g.category,
              label: g.category,
              count: g.count,
            })),
          ].map((c) => (
            <button
              key={c.category}
              type="button"
              onClick={() => selectCategory(c.category)}
              className={`shrink-0 px-2 py-0.5 rounded border text-[11px] font-mono cursor-pointer ${
                activeCategory === c.category
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-muted/40 text-muted-foreground border-border"
              }`}
            >
              {c.label} ({c.count})
            </button>
          ))}
        </div>

        {/* Icons grid (own scroll) */}
        <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4">
          {results.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded bg-card">
              <Icon
                name="search"
                size="24px"
                className="text-muted-foreground mx-auto mb-1.5 opacity-50"
              />
              <p className="text-xs font-semibold text-foreground">
                No icons match &quot;{search}&quot; in {activeLabel}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Try another keyword or pick a different category
              </p>
            </div>
          ) : (
            <>
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                }}
              >
                {visibleIcons.map((name) => (
                  <IconCardItem
                    key={name}
                    name={name}
                    packageName={getPackage(name)}
                    selectedSize={selectedSize}
                    copiedInfo={copiedInfo}
                    onCopyName={copyNameOnly}
                    onCopySnippet={copySnippet}
                  />
                ))}
              </div>

              <div
                ref={sentinelRef}
                className="py-4 text-center text-[11px] text-muted-foreground"
              >
                {hasMore
                  ? `Showing ${visibleIcons.length} of ${results.length} · scroll for more`
                  : `Showing all ${results.length} icons`}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
