"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Star,
  Bell,
  Search,
  Play,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
  X,
  Webhook,
  Zap,
  Package,
  Code,
  Activity,
  Terminal,
  LogOut,
  Lock,
  Globe,
  Copy,
  Shield,
  BookOpen,
  BarChart3,
  Database,
  Merge,
  Wifi,
  WifiOff,
  Tag,
  FileCode,
  ArrowRight,
  Settings,
  Moon,
  Sun,
  Palette,
  Monitor,
  PanelLeft,
  Filter,
  Download,
  Eye,
  GitFork,
  Clock,
  Hash,
  Users,
  TrendingUp,
  Inbox,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
══════════════════════════════════════════════════════════════════════ */
type Theme = "dark" | "dim" | "light";
type Accent = "violet" | "blue" | "green" | "amber" | "rose";
type SurfaceStyle = "default" | "glass" | "clay" | "minimal";

const ACCENTS: { id: Accent; color: string; label: string }[] = [
  { id: "violet", color: "#8b5cf6", label: "Violet" },
  { id: "blue", color: "#3b82f6", label: "Blue" },
  { id: "green", color: "#10b981", label: "Green" },
  { id: "amber", color: "#f59e0b", label: "Amber" },
  { id: "rose", color: "#f43f5e", label: "Rose" },
];

const NAV_GROUPS = [
  {
    label: "Dashboard",
    items: [
      { id: "overview", icon: BarChart3, label: "Overview" },
      { id: "repos", icon: BookOpen, label: "Repositories" },
    ],
  },
  {
    label: "Code",
    items: [
      { id: "commits", icon: GitCommit, label: "Commits" },
      { id: "branches", icon: GitBranch, label: "Branches" },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { id: "issues", icon: AlertCircle, label: "Issues" },
      { id: "pulls", icon: GitPullRequest, label: "Pull Requests" },
      { id: "releases", icon: Package, label: "Releases" },
    ],
  },
  {
    label: "CI / Hooks",
    items: [
      { id: "actions", icon: Zap, label: "Actions" },
      { id: "webhooks", icon: Webhook, label: "Webhooks" },
    ],
  },
  {
    label: "Discover",
    items: [
      { id: "search", icon: Search, label: "Search" },
      { id: "stars", icon: Star, label: "Stars" },
      { id: "gists", icon: Code, label: "Gists" },
      { id: "notifs", icon: Bell, label: "Notifications" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { id: "jobs", icon: Database, label: "Job Queue" },
      { id: "events", icon: Activity, label: "WH Events" },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
══════════════════════════════════════════════════════════════════════ */
const LS = {
  get: <T,>(k: string, d?: T): T => {
    if (typeof window === "undefined") return d as T;
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : (d as T);
    } catch {
      return d as T;
    }
  },
  set: (k: string, v: unknown) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
  del: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

/* ══════════════════════════════════════════════════════════════════════
   APP CONTEXT
══════════════════════════════════════════════════════════════════════ */
interface AppCtx {
  theme: Theme;
  accent: Accent;
  compact: boolean;
  useDeviceTheme: boolean;
  surfaceStyle: SurfaceStyle;
  seasonalFx: boolean;
  mouseFx: boolean;
  animationsOn: boolean;
  sidebarOpen: boolean;
  setTheme: (t: Theme) => void;
  setAccent: (a: Accent) => void;
  setCompact: (c: boolean) => void;
  setUseDeviceTheme: (v: boolean) => void;
  setSurfaceStyle: (s: SurfaceStyle) => void;
  setSeasonalFx: (v: boolean) => void;
  setMouseFx: (v: boolean) => void;
  setAnimationsOn: (v: boolean) => void;
  toggleSidebar: () => void;
  show: (msg: string, type?: "success" | "error" | "info") => void;
}

const Ctx = createContext<AppCtx>({} as AppCtx);
const useApp = () => useContext(Ctx);

/* ══════════════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════════════ */
function ago(d: string | Date): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d`;
  return `${Math.floor(s / 2592000)}mo`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const cp = (t: string) => navigator.clipboard?.writeText(t).catch(() => {});

/* ══════════════════════════════════════════════════════════════════════
   API HOOK
══════════════════════════════════════════════════════════════════════ */
function useApi(token: string) {
  return useCallback(
    async (path: string, opts: RequestInit & { body?: unknown } = {}) => {
      const url = path.startsWith("/api") ? path : `/api/github${path}`;
      const body =
        opts.body != null ?
          typeof opts.body === "string" ?
            opts.body
          : JSON.stringify(opts.body)
        : undefined;
      const res = await fetch(url, {
        ...opts,
        headers: {
          "x-github-token": token,
          "Content-Type": "application/json",
          ...(opts.headers || {}),
        },
        body,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `HTTP ${res.status}`);
      return json.data;
    },
    [token],
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
══════════════════════════════════════════════════════════════════════ */

/** Page wrapper with header */
function PageLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="anim-fade-up"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-right">{actions}</div>}
      </div>
      <div className="main-scroll">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

/** Stat card */
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="stat-card"
      style={accent ? { ["--accent" as any]: accent } : {}}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

/** Card with optional header */
function Card({
  title,
  actions,
  children,
  style,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="card" style={style}>
      {title && (
        <div className="card-header">
          <span className="card-title">{title}</span>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Data table with scroll */
function DataTable({
  cols,
  children,
  minWidth,
}: {
  cols: string[];
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="table-wrap" style={{ overflowX: "auto" }}>
      <table className="table" style={minWidth ? { minWidth } : {}}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Empty state */
function Empty({
  icon: Icon = AlertCircle,
  title,
  body,
}: {
  icon?: any;
  title: string;
  body?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{title}</p>
      {body && <p>{body}</p>}
    </div>
  );
}

/** Loading state */
function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "3rem",
        color: "var(--text-secondary)",
        fontSize: 13,
      }}
    >
      <span className="spinner" />
      {label}
    </div>
  );
}

/** Form panel */
function FormPanel({
  cols = 2,
  children,
}: {
  cols?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="form-panel"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {children}
    </div>
  );
}

function FG({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="input-group" style={full ? { gridColumn: "1/-1" } : {}}>
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

function FI({
  label,
  full,
  ...p
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  full?: boolean;
}) {
  return (
    <FG label={label} full={full}>
      <input className="input" {...p} />
    </FG>
  );
}

function FS({
  label,
  full,
  children,
  ...p
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  full?: boolean;
}) {
  return (
    <FG label={label} full={full}>
      <select className="input" {...p}>
        {children}
      </select>
    </FG>
  );
}

function FTA({
  label,
  full,
  ...p
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  full?: boolean;
}) {
  return (
    <FG label={label} full={full}>
      <textarea className="input" {...p} />
    </FG>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 13.5,
        color: "var(--text-secondary)",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
      />
      {label}
    </label>
  );
}

/** Repo selector */
function RepoSelect({
  repos,
  value,
  onChange,
}: {
  repos: any[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: 220, width: "auto" }}
    >
      <option value="">Select repository…</option>
      {repos.map((r: any) => (
        <option key={r.full_name} value={r.full_name}>
          {r.full_name}
        </option>
      ))}
    </select>
  );
}

/** Info banner */
function Banner({
  variant = "default",
  icon: Icon,
  children,
}: {
  variant?: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <div className={`info-banner ${variant}`}>
      {Icon && (
        <Icon
          size={15}
          style={{ flexShrink: 0, marginTop: 1, color: "var(--accent-text)" }}
        />
      )}
      <div>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   LOGIN SCREEN
══════════════════════════════════════════════════════════════════════ */
function LoginScreen({
  onConnect,
}: {
  onConnect: (token: string, user: any) => void;
}) {
  const [val, setVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function connect() {
    if (!val.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/github/user", {
        headers: { "x-github-token": val.trim() },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Invalid token");
      onConnect(val.trim(), json.data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--bg-app)",
      }}
    >
      <div className="anim-fade-up" style={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "var(--accent-soft)",
              border: "1px solid var(--accent-border)",
              marginBottom: "1.25rem",
              boxShadow: "0 0 32px var(--accent-glow)",
            }}
          >
            <Terminal size={28} color="var(--accent-text)" />
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-.03em",
              marginBottom: 6,
            }}
          >
            GH Control
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Your personal GitHub command center
          </p>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{ padding: "28px", boxShadow: "var(--shadow-xl)" }}
        >
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Personal Access Token</label>
            <input
              type="password"
              className="input"
              value={val}
              autoFocus
              autoComplete="off"
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              style={{ letterSpacing: "0.04em", fontSize: 14 }}
            />
            {err && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 6,
                  fontSize: 12,
                  color: "var(--red-text)",
                }}
              >
                <X size={11} />
                {err}
              </div>
            )}
          </div>

          <button
            className="w-full btn btn-solid"
            onClick={connect}
            disabled={loading || !val.trim()}
            style={{
              justifyContent: "center",
              padding: "11px",
              fontSize: 14,
              width: "100%",
            }}
          >
            {loading ?
              <>
                <span
                  className="spinner"
                  style={{
                    borderTopColor: "#fff",
                    borderColor: "rgba(255,255,255,.25)",
                  }}
                />
                Connecting…
              </>
            : <>
                <ArrowRight size={15} />
                Connect to GitHub
              </>
            }
          </button>

          {/* Required scopes */}
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            <p
              style={{
                color: "var(--text-tertiary)",
                marginBottom: 6,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                fontSize: 10,
              }}
            >
              Required scopes
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {[
                "repo",
                "read:user",
                "admin:repo_hook",
                "gist",
                "notifications",
              ].map((s) => (
                <code
                  key={s}
                  style={{
                    fontSize: 11.5,
                    background: "var(--bg-overlay)",
                    color: "var(--accent-text)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: "1px solid var(--accent-border)",
                    fontFamily: "var(--font-code)",
                  }}
                >
                  {s}
                </code>
              ))}
            </div>
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 8,
                fontSize: 12,
                color: "var(--accent-text)",
              }}
            >
              Generate token <ExternalLink size={10} />
            </a>
          </div>

          {/* Feature row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {[
              { icon: Shield, label: "Token local only" },
              { icon: Zap, label: "Redis caching" },
              { icon: Database, label: "Mongodb Logs" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "10px 8px",
                  background: "var(--bg-elevated)",
                  borderRadius: 8,
                  border: "1px solid var(--border-subtle)",
                  textAlign: "center",
                }}
              >
                <Icon size={14} color="var(--text-tertiary)" />
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SETTINGS PANEL
══════════════════════════════════════════════════════════════════════ */
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    compact,
    setCompact,
    useDeviceTheme,
    setUseDeviceTheme,
    surfaceStyle,
    setSurfaceStyle,
    seasonalFx,
    setSeasonalFx,
    mouseFx,
    setMouseFx,
    animationsOn,
    setAnimationsOn,
  } = useApp();

  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "dim", icon: Monitor, label: "Dim" },
    { id: "light", icon: Sun, label: "Light" },
  ];

  const surfaces: { id: SurfaceStyle; label: string }[] = [
    { id: "default", label: "Default" },
    { id: "glass", label: "Glass" },
    { id: "clay", label: "Clay" },
    { id: "minimal", label: "Minimal" },
  ];

  return (
    <>
      <div className="mobile-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-panel-header">
          <span style={{ fontWeight: 700, fontSize: 15 }}>Settings</span>
          <button
            title="btnClose"
            className="btn btn-ghost btn-icon-sm"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        <div className="settings-panel-body">
          {/* Theme */}
          <div className="settings-section">
            <h4>Theme</h4>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Use Device Theme</div>
                <div className="toggle-sub">
                  Auto-sync light/dark with your OS
                </div>
              </div>
              <button
                className={`toggle ${useDeviceTheme ? "on" : ""}`}
                onClick={() => setUseDeviceTheme(!useDeviceTheme)}
              />
            </div>
            <div className="theme-pills">
              {themes.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  className={`theme-pill ${theme === id ? "active" : ""}`}
                  disabled={useDeviceTheme}
                  style={
                    useDeviceTheme ?
                      { opacity: 0.55, cursor: "not-allowed" }
                    : undefined
                  }
                  onClick={() => setTheme(id)}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h4>Surface Style</h4>
            <div className="theme-pills">
              {surfaces.map((s) => (
                <button
                  key={s.id}
                  className={`theme-pill ${surfaceStyle === s.id ? "active" : ""}`}
                  onClick={() => setSurfaceStyle(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="settings-section">
            <h4>Accent Color</h4>
            <div className="accent-swatches">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  className={`swatch ${accent === a.id ? "active" : ""}`}
                  style={{ background: a.color }}
                  title={a.label}
                  onClick={() => setAccent(a.id)}
                >
                  {accent === a.id && (
                    <Check size={12} color="#fff" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-section">
            <h4>Preferences</h4>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Compact Mode</div>
                <div className="toggle-sub">Reduce row height in tables</div>
              </div>
              <button
                className={`toggle ${compact ? "on" : ""}`}
                onClick={() => setCompact(!compact)}
              />
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Seasonal Tweaks</div>
                <div className="toggle-sub">
                  Enable seasonal decorative accents
                </div>
              </div>
              <button
                className={`toggle ${seasonalFx ? "on" : ""}`}
                onClick={() => setSeasonalFx(!seasonalFx)}
              />
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Mouse Animations</div>
                <div className="toggle-sub">
                  Pointer-reactive highlight effect
                </div>
              </div>
              <button
                className={`toggle ${mouseFx ? "on" : ""}`}
                onClick={() => setMouseFx(!mouseFx)}
              />
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Other Animations</div>
                <div className="toggle-sub">
                  Enable transitions and motion effects
                </div>
              </div>
              <button
                className={`toggle ${animationsOn ? "on" : ""}`}
                onClick={() => setAnimationsOn(!animationsOn)}
              />
            </div>
          </div>

          {/* About */}
          <div className="settings-section">
            <h4>About</h4>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                lineHeight: 1.7,
              }}
            >
              <p>
                <strong style={{ color: "var(--text-secondary)" }}>
                  GH Control
                </strong>{" "}
                — GitHub Command Center
              </p>
              <p style={{ marginTop: 4 }}>
                Built with Next.js 14, MongoDB, Redis (RedisLabs), BullMQ
              </p>
              <p style={{ marginTop: 4 }}>
                Token stored in localStorage only — never sent to any 3rd party.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════════════== */
function Sidebar({
  user,
  tab,
  setTab,
  onDisconnect,
  onSettings,
}: {
  user: any;
  tab: string;
  setTab: (t: string) => void;
  onDisconnect: () => void;
  onSettings: () => void;
}) {
  const { sidebarOpen, toggleSidebar } = useApp();
  const collapsed = !sidebarOpen;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <button
          className="brand-icon"
          onClick={toggleSidebar}
          style={{ cursor: "pointer", border: "none" }}
          title="Toggle sidebar"
        >
          <Terminal size={15} color="var(--accent-text)" />
        </button>
        <div className="brand-text">
          <div
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: "var(--text-primary)",
              letterSpacing: "-.01em",
            }}
          >
            GH Control
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-tertiary)",
              letterSpacing: ".04em",
              textTransform: "uppercase",
            }}
          >
            Command Center
          </div>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-chip">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              className="user-avatar"
              alt={user.login}
            />
          )}
          <div className="user-meta" style={{ minWidth: 0, flex: 1 }}>
            <div className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>
              @{user.login}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
              {user.public_repos} repos
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="nav-section">
            <div className="nav-section-label">{group.label}</div>
            {group.items.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={`nav-item ${tab === id ? "active" : ""}`}
                onClick={() => setTab(id)}
                title={collapsed ? label : undefined}
              >
                <Icon size={14} className="nav-icon" />
                <span className="nav-label">{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="nav-item sidebar-action"
          onClick={onSettings}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={14} className="nav-icon" />
          <span className="nav-label">Settings</span>
        </button>
        <button
          className="nav-item sidebar-action disconnect-action"
          onClick={onDisconnect}
          style={{ color: "var(--red-text)" }}
          title={collapsed ? "Disconnect" : undefined}
        >
          <LogOut size={14} className="nav-icon" />
          <span className="nav-label">Disconnect</span>
        </button>
      </div>
    </aside>
  );
}

/**
 * Main App Component - Wraps the entire dashboard
 * Uses useAuth from context to manage authentication
 */
export default function App() {
  const { token, isAuthenticated, clearToken } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !token) {
    return null;
  }

  return <DashboardContent token={token} onLogout={() => clearToken()} />;
}

/**
 * Dashboard Content Component - Shows the actual dashboard
 * Separated from App so we can manage auth separately
 */
function DashboardContent({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState("overview");
  const [theme, setThemeS] = useState<Theme>("dark");
  const [accent, setAccentS] = useState<Accent>("violet");
  const [compact, setCompactS] = useState(false);
  const [useDeviceTheme, setUseDeviceThemeS] = useState(false);
  const [surfaceStyle, setSurfaceStyleS] = useState<SurfaceStyle>("default");
  const [seasonalFx, setSeasonalFxS] = useState(false);
  const [mouseFx, setMouseFxS] = useState(true);
  const [animationsOn, setAnimationsOnS] = useState(true);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("dark");
  const [sidebar, setSidebar] = useState(true);
  const [settings, setSettings] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(
    null,
  );
  const toastTimer = useRef<any>();

  // Load persisted prefs
  useEffect(() => {
    const u = LS.get<any>("gh_user");
    if (u) setUser(u);

    const th = LS.get<Theme>("gh_theme", "dark");
    setThemeS(th);
    const ac = LS.get<Accent>("gh_accent", "violet");
    setAccentS(ac);
    const cp = LS.get<boolean>("gh_compact", false);
    setCompactS(cp);
    const ud = LS.get<boolean>("gh_use_device_theme", false);
    setUseDeviceThemeS(ud);
    const sf = LS.get<SurfaceStyle>("gh_surface", "default");
    setSurfaceStyleS(sf);
    const se = LS.get<boolean>("gh_seasonal_fx", false);
    setSeasonalFxS(se);
    const mf = LS.get<boolean>("gh_mouse_fx", true);
    setMouseFxS(mf);
    const an = LS.get<boolean>("gh_animations", true);
    setAnimationsOnS(an);
    const sb = LS.get<boolean>("gh_sidebar", true);
    setSidebar(sb);

    // Fetch user if not cached
    if (!u) {
      fetch("/api/github/user", {
        headers: { "x-github-token": token },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setUser(d.data);
            LS.set("gh_user", d.data);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Apply theme/accent/effects to DOM
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const sync = () => setSystemTheme(mq.matches ? "light" : "dark");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const resolvedTheme =
      useDeviceTheme ?
        systemTheme === "light" ?
          "light"
        : "dark"
      : theme;
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [theme, useDeviceTheme, systemTheme]);
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);
  useEffect(() => {
    document.documentElement.setAttribute("data-surface", surfaceStyle);
  }, [surfaceStyle]);
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-seasonal",
      seasonalFx ? "on" : "off",
    );
  }, [seasonalFx]);
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-mousefx",
      mouseFx ? "on" : "off",
    );
  }, [mouseFx]);
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-animations",
      animationsOn ? "on" : "off",
    );
  }, [animationsOn]);

  function setTheme(t: Theme) {
    setThemeS(t);
    LS.set("gh_theme", t);
  }
  function setAccent(a: Accent) {
    setAccentS(a);
    LS.set("gh_accent", a);
  }
  function setCompact(c: boolean) {
    setCompactS(c);
    LS.set("gh_compact", c);
  }
  function setUseDeviceTheme(v: boolean) {
    setUseDeviceThemeS(v);
    LS.set("gh_use_device_theme", v);
  }
  function setSurfaceStyle(s: SurfaceStyle) {
    setSurfaceStyleS(s);
    LS.set("gh_surface", s);
  }
  function setSeasonalFx(v: boolean) {
    setSeasonalFxS(v);
    LS.set("gh_seasonal_fx", v);
  }
  function setMouseFx(v: boolean) {
    setMouseFxS(v);
    LS.set("gh_mouse_fx", v);
  }
  function setAnimationsOn(v: boolean) {
    setAnimationsOnS(v);
    LS.set("gh_animations", v);
  }
  function toggleSidebar() {
    setSidebar((s) => {
      LS.set("gh_sidebar", !s);
      return !s;
    });
  }

  function show(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }

  function disconnect() {
    LS.del("gh_user");
    onLogout();
    router.push("/login");
  }

  const api = useApi(token);
  const ctx: AppCtx = {
    theme,
    accent,
    compact,
    useDeviceTheme,
    surfaceStyle,
    seasonalFx,
    mouseFx,
    animationsOn,
    sidebarOpen: sidebar,
    setTheme,
    setAccent,
    setCompact,
    setUseDeviceTheme,
    setSurfaceStyle,
    setSeasonalFx,
    setMouseFx,
    setAnimationsOn,
    toggleSidebar,
    show,
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-app)",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  const tabProps = { api, user, show, compact };

  return (
    <Ctx.Provider value={ctx}>
      <div
        className="app-shell"
        onMouseMove={(e) => {
          if (!mouseFx || !animationsOn) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          e.currentTarget.style.setProperty("--mx", `${x}%`);
          e.currentTarget.style.setProperty("--my", `${y}%`);
        }}
      >
        <Sidebar
          user={user}
          tab={tab}
          setTab={setTab}
          onDisconnect={disconnect}
          onSettings={() => setSettings((s) => !s)}
        />

        {/* Mobile overlay when sidebar is open */}
        {sidebar && (
          <div className="mobile-overlay" onClick={() => toggleSidebar()} />
        )}

        <div className="main-area">
          {tab === "overview" && <OverviewTab {...tabProps} />}
          {tab === "repos" && <ReposTab {...tabProps} />}
          {tab === "commits" && <CommitsTab {...tabProps} />}
          {tab === "branches" && <BranchesTab {...tabProps} />}
          {tab === "issues" && <IssuesTab {...tabProps} />}
          {tab === "pulls" && <PullsTab {...tabProps} />}
          {tab === "releases" && <ReleasesTab {...tabProps} />}
          {tab === "actions" && <ActionsTab {...tabProps} />}
          {tab === "webhooks" && <WebhooksTab {...tabProps} />}
          {tab === "search" && <SearchTab {...tabProps} />}
          {tab === "stars" && <StarsTab {...tabProps} />}
          {tab === "gists" && <GistsTab {...tabProps} />}
          {tab === "notifs" && <NotifsTab {...tabProps} />}
          {tab === "jobs" && <JobsTab {...tabProps} />}
          {tab === "events" && <EventsTab {...tabProps} />}
        </div>

        {settings && <SettingsPanel onClose={() => setSettings(false)} />}
        {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
      </div>
    </Ctx.Provider>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ① OVERVIEW
══════════════════════════════════════════════════════════════════════ */
function OverviewTab({ api, user, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [rl, setRl] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/repos?sort=updated&per_page=10"), api("/rate-limit")])
      .then(([r, l]) => {
        setRepos(r || []);
        setRl(l);
      })
      .catch(() => show("Some data failed to load", "info"))
      .finally(() => setLoading(false));
  }, [api]);

  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const pct = rl ? Math.round((rl.rate.remaining / rl.rate.limit) * 100) : 0;
  const pColor =
    pct > 50 ? "var(--green)"
    : pct > 20 ? "var(--amber)"
    : "var(--red)";

  return (
    <PageLayout
      title="Overview"
      subtitle={`@${user.login}${user.name ? ` · ${user.name}` : ""}`}
      actions={
        <a
          href={`https://github.com/${user.login}`}
          target="_blank"
          className="btn btn-sm"
        >
          <ExternalLink size={12} />
          Profile
        </a>
      }
    >
      {/* Stats grid */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 14,
        }}
      >
        <StatCard
          label="Repositories"
          value={user.public_repos + (user.total_private_repos || 0)}
          sub={`${user.public_repos} public`}
        />
        <StatCard
          label="Followers"
          value={fmt(user.followers)}
          sub={`Following ${user.following}`}
          accent="var(--blue)"
        />
        <StatCard
          label="Total Stars"
          value={loading ? "…" : fmt(stars)}
          sub="across all repos"
          accent="var(--amber)"
        />
        <StatCard
          label="API Remaining"
          value={rl ? `${pct}%` : "…"}
          sub={rl ? `${rl.rate.remaining} / ${rl.rate.limit}` : ""}
          accent={pColor}
        />
      </div>

      {/* Rate limit bar */}
      {rl && (
        <div className="card" style={{ padding: "16px 18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "var(--text-tertiary)",
                letterSpacing: ".07em",
                textTransform: "uppercase",
                fontSize: 10,
              }}
            >
              API Rate Limit
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              Resets {ago(new Date(rl.rate.reset * 1000))} ago
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${pct}%`, background: pColor }}
            />
          </div>
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <div
          style={{
            padding: "14px 18px",
            background: "var(--bg-raised)",
            border: "1px solid var(--border-subtle)",
            borderLeft: "3px solid var(--accent)",
            borderRadius: 8,
            fontSize: 13.5,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          {user.bio}
        </div>
      )}

      {/* Recent repos */}
      <Card title="Recent Activity">
        {loading ?
          <Loading />
        : <DataTable
            cols={[
              "Repository",
              "Visibility",
              "Language",
              "Stars",
              "Forks",
              "Updated",
            ]}
            minWidth={600}
          >
            {repos.map((r: any) => (
              <tr key={r.id}>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <a
                      href={r.html_url}
                      target="_blank"
                      style={{
                        fontWeight: 600,
                        color: "var(--accent-text)",
                        fontSize: 13,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as any).style.textDecoration =
                          "underline")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as any).style.textDecoration = "none")
                      }
                    >
                      {r.full_name}
                    </a>
                    {r.fork && (
                      <span
                        className="badge badge-muted"
                        style={{ fontSize: 10 }}
                      >
                        fork
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p
                      className="truncate"
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-tertiary)",
                        maxWidth: 300,
                        marginTop: 1,
                      }}
                    >
                      {r.description}
                    </p>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${r.private ? "badge-muted" : "badge-blue"}`}
                  >
                    {r.private ?
                      <>
                        <Lock size={9} />
                        Private
                      </>
                    : <>
                        <Globe size={9} />
                        Public
                      </>
                    }
                  </span>
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>
                  {r.language || "—"}
                </td>
                <td style={{ color: "var(--amber-text)", fontSize: 12.5 }}>
                  ★ {r.stargazers_count}
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>
                  ⑂ {r.forks_count}
                </td>
                <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                  {ago(r.updated_at)} ago
                </td>
              </tr>
            ))}
          </DataTable>
        }
      </Card>
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ② REPOS
══════════════════════════════════════════════════════════════════════ */
function ReposTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("updated");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    private: false,
    auto_init: true,
  });
  const f = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const load = useCallback(() => {
    setLoading(true);
    api(`/repos?sort=${sort}&type=${type}&per_page=100`)
      .then(setRepos)
      .catch(() => show("Failed to load repos", "error"))
      .finally(() => setLoading(false));
  }, [api, sort, type]);
  useEffect(() => {
    load();
  }, [load]);

  async function createRepo() {
    try {
      await api("/repos", { method: "POST", body: form });
      show("Repo created!");
      setOpen(false);
      setForm({ name: "", description: "", private: false, auto_init: true });
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }
  async function deleteRepo(owner: string, repo: string) {
    if (!confirm(`Permanently delete ${owner}/${repo}?`)) return;
    try {
      await api(`/repos/${owner}/${repo}`, { method: "DELETE" });
      show("Deleted");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  const filtered = repos.filter(
    (r) =>
      !query ||
      r.full_name.toLowerCase().includes(query.toLowerCase()) ||
      r.description?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PageLayout
      title="Repositories"
      subtitle={`${filtered.length} of ${repos.length} repos`}
      actions={
        <>
          <div className="search-wrap hide-mobile">
            <Search size={13} className="search-icon" />
            <input
              className="input"
              placeholder="Filter repos…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
          <select
            className="input hide-mobile"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="updated">Updated</option>
            <option value="created">Created</option>
            <option value="pushed">Pushed</option>
            <option value="full_name">Name A-Z</option>
          </select>
          <select
            className="input hide-mobile"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">All</option>
            <option value="owner">Owner</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button className="btn btn-accent" onClick={() => setOpen((o) => !o)}>
            <Plus size={13} />
            New
          </button>
          <button className="btn btn-ghost btn-icon" onClick={load}>
            <RefreshCw size={13} />
          </button>
        </>
      }
    >
      {open && (
        <FormPanel cols={2}>
          <FI
            label="Repository Name *"
            value={form.name}
            onChange={(e) => f("name", e.target.value)}
            placeholder="my-awesome-repo"
          />
          <FI
            label="Description"
            value={form.description}
            onChange={(e) => f("description", e.target.value)}
            placeholder="What's this repo?"
          />
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Checkbox
              label="Private"
              checked={form.private}
              onChange={(v) => f("private", v)}
            />
            <Checkbox
              label="Init with README"
              checked={form.auto_init}
              onChange={(v) => f("auto_init", v)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-solid" onClick={createRepo}>
              Create Repository
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </FormPanel>
      )}

      <Card
        title={`${filtered.length} repositories`}
        actions={
          <button
            className="btn btn-ghost btn-icon-sm"
            title="Refresh"
            onClick={load}
          >
            <RefreshCw size={12} />
          </button>
        }
      >
        {loading ?
          <Loading />
        : !filtered.length ?
          <Empty icon={BookOpen} title="No repositories found" />
        : <DataTable
            cols={[
              "Repository",
              "Visibility",
              "Language",
              "Stars",
              "Forks",
              "Updated",
              "",
            ]}
            minWidth={700}
          >
            {filtered.map((r: any) => (
              <tr key={r.id}>
                <td>
                  <a
                    href={r.html_url}
                    target="_blank"
                    style={{ fontWeight: 600, color: "var(--accent-text)" }}
                  >
                    {r.full_name}
                  </a>
                  {r.description && (
                    <p
                      className="truncate"
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-tertiary)",
                        maxWidth: 280,
                        marginTop: 1,
                      }}
                    >
                      {r.description}
                    </p>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${r.private ? "badge-muted" : "badge-blue"}`}
                  >
                    {r.private ?
                      <>
                        <Lock size={9} />
                        Private
                      </>
                    : <>
                        <Globe size={9} />
                        Public
                      </>
                    }
                  </span>
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>
                  {r.language || "—"}
                </td>
                <td style={{ color: "var(--amber-text)" }}>
                  ★ {r.stargazers_count}
                </td>
                <td style={{ color: "var(--text-secondary)" }}>
                  ⑂ {r.forks_count}
                </td>
                <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                  {ago(r.updated_at)} ago
                </td>
                <td>
                  <div
                    className="row-actions"
                    style={{ display: "flex", gap: 4 }}
                  >
                    <button
                      className="btn btn-xs btn-ghost"
                      title="Copy clone URL"
                      onClick={() => {
                        cp(r.clone_url);
                        show("Copied!");
                      }}
                    >
                      <Copy size={11} />
                    </button>
                    <a
                      href={r.html_url}
                      target="_blank"
                      className="btn btn-xs btn-ghost"
                    >
                      <ExternalLink size={11} />
                    </a>
                    <button
                      className="btn btn-xs btn-danger"
                      onClick={() => deleteRepo(r.owner.login, r.name)}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        }
      </Card>
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ③ COMMITS
══════════════════════════════════════════════════════════════════════ */
function CommitsTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState(LS.get<string>("cr", ""));
  const [commits, setCommits] = useState<any[]>([]);
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/repos?per_page=100")
      .then(setRepos)
      .catch(() => {});
  }, [api]);

  const load = useCallback(() => {
    if (!repo) return;
    LS.set("cr", repo);
    setLoading(true);
    api(`/repos/${repo}/commits${sha ? `?sha=${sha}` : ""}`)
      .then(setCommits)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [repo, sha, api]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <PageLayout
      title="Commits"
      subtitle="Browse commit history"
      actions={
        <>
          <RepoSelect repos={repos} value={repo} onChange={setRepo} />
          <input
            className="input"
            placeholder="Branch / SHA…"
            value={sha}
            onChange={(e) => setSha(e.target.value)}
            style={{ width: 160 }}
          />
        </>
      }
    >
      {!repo ?
        <Empty
          icon={GitCommit}
          title="Select a repository"
          body="Choose a repo to browse its commits"
        />
      : loading ?
        <Loading />
      : <Card title={`${commits.length} commits`}>
          <DataTable
            cols={["SHA", "Message", "Author", "Date", ""]}
            minWidth={500}
          >
            {commits.map((c: any) => (
              <tr key={c.sha}>
                <td>
                  <a
                    href={c.html_url}
                    target="_blank"
                    style={{
                      fontFamily: "var(--font-code)",
                      fontSize: 12,
                      color: "var(--accent-text)",
                      fontWeight: 600,
                    }}
                  >
                    {c.sha.slice(0, 7)}
                  </a>
                </td>
                <td style={{ maxWidth: 340 }}>
                  <p className="truncate" style={{ fontWeight: 500 }}>
                    {c.commit.message.split("\n")[0]}
                  </p>
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>
                  {c.commit.author.name}
                </td>
                <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                  {ago(c.commit.author.date)} ago
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-ghost row-actions"
                    onClick={() => {
                      cp(c.sha);
                      show("SHA copied!");
                    }}
                  >
                    <Copy size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ④ BRANCHES
══════════════════════════════════════════════════════════════════════ */
function BranchesTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState(LS.get<string>("br", ""));
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ branch: "", from: "main" });

  useEffect(() => {
    api("/repos?per_page=100")
      .then(setRepos)
      .catch(() => {});
  }, [api]);

  const load = useCallback(() => {
    if (!repo) return;
    LS.set("br", repo);
    setLoading(true);
    api(`/repos/${repo}/branches`)
      .then(setBranches)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [repo, api]);
  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    const [o, r] = repo.split("/");
    try {
      await api(`/repos/${o}/${r}/branches`, { method: "POST", body: form });
      show(`Branch "${form.branch}" created!`);
      setOpen(false);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }
  async function del(b: string) {
    const [o, r] = repo.split("/");
    if (!confirm(`Delete branch "${b}"?`)) return;
    try {
      await api(`/repos/${o}/${r}/branches`, {
        method: "DELETE",
        body: { branch: b },
      });
      show("Deleted");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  return (
    <PageLayout
      title="Branches"
      subtitle={
        repo ? `${branches.length} branches in ${repo}` : "Manage branches"
      }
      actions={
        <>
          <RepoSelect repos={repos} value={repo} onChange={setRepo} />
          {repo && (
            <button
              className="btn btn-accent"
              onClick={() => setOpen((o) => !o)}
            >
              <Plus size={13} />
              New Branch
            </button>
          )}
        </>
      }
    >
      {open && (
        <FormPanel cols={3}>
          <FI
            label="Branch Name *"
            value={form.branch}
            onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
            placeholder="feature/my-feature"
          />
          <FS
            label="From Branch"
            value={form.from}
            onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))}
          >
            {branches.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </FS>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button className="btn btn-solid" onClick={create}>
              Create Branch
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </FormPanel>
      )}

      {!repo ?
        <Empty icon={GitBranch} title="Select a repository" />
      : loading ?
        <Loading />
      : <Card title={`${branches.length} branches`}>
          <DataTable cols={["Branch", "SHA", "Protection", ""]} minWidth={440}>
            {branches.map((b: any) => (
              <tr key={b.name}>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <GitBranch size={13} color="var(--accent-text)" />
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                  </div>
                </td>
                <td>
                  <code
                    style={{
                      fontSize: 12,
                      color: "var(--cyan-text)",
                      background: "var(--cyan-soft)",
                      padding: "2px 7px",
                      borderRadius: 4,
                    }}
                  >
                    {b.commit.sha.slice(0, 7)}
                  </code>
                </td>
                <td>
                  {b.protected ?
                    <span className="badge badge-amber">
                      <Shield size={9} />
                      Protected
                    </span>
                  : <span className="badge badge-muted">Open</span>}
                </td>
                <td>
                  <div
                    className="row-actions"
                    style={{ display: "flex", gap: 4 }}
                  >
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => {
                        cp(b.name);
                        show("Copied!");
                      }}
                    >
                      <Copy size={11} />
                    </button>
                    {!b.protected && (
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => del(b.name)}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑤ ISSUES
══════════════════════════════════════════════════════════════════════ */
function IssuesTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState(LS.get<string>("ir", ""));
  const [issues, setIssues] = useState<any[]>([]);
  const [state, setState] = useState("open");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    labels: "",
    assignees: "",
  });

  useEffect(() => {
    api("/repos?per_page=100")
      .then(setRepos)
      .catch(() => {});
  }, [api]);

  const load = useCallback(() => {
    if (!repo) return;
    LS.set("ir", repo);
    setLoading(true);
    api(`/repos/${repo}/issues?state=${state}`)
      .then(setIssues)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [repo, state, api]);
  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    const [o, r] = repo.split("/");
    try {
      await api(`/repos/${o}/${r}/issues`, {
        method: "POST",
        body: {
          title: form.title,
          body: form.body,
          labels: form.labels
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          assignees: form.assignees
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      show("Issue created!");
      setOpen(false);
      setForm({ title: "", body: "", labels: "", assignees: "" });
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  async function toggle(num: number, cur: string) {
    const [o, r] = repo.split("/");
    const next = cur === "open" ? "closed" : "open";
    try {
      await api(`/repos/${o}/${r}/issues/${num}`, {
        method: "PATCH",
        body: { state: next },
      });
      show(`Issue #${num} ${next}`);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  return (
    <PageLayout
      title="Issues"
      subtitle={repo ? `${issues.length} ${state} issues` : "Manage issues"}
      actions={
        <>
          <RepoSelect repos={repos} value={repo} onChange={setRepo} />
          <div className="tab-bar">
            {["open", "closed", "all"].map((s) => (
              <button
                key={s}
                className={`tab-item ${state === s ? "active" : ""}`}
                onClick={() => setState(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {repo && (
            <button
              className="btn btn-accent"
              onClick={() => setOpen((o) => !o)}
            >
              <Plus size={13} />
              New
            </button>
          )}
        </>
      }
    >
      {open && (
        <FormPanel cols={2}>
          <FI
            label="Title *"
            full
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Issue title"
          />
          <FTA
            label="Description"
            full
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            placeholder="Describe the issue…"
          />
          <FI
            label="Labels (comma-sep)"
            value={form.labels}
            onChange={(e) => setForm((p) => ({ ...p, labels: e.target.value }))}
            placeholder="bug, enhancement"
          />
          <FI
            label="Assignees (comma-sep)"
            value={form.assignees}
            onChange={(e) =>
              setForm((p) => ({ ...p, assignees: e.target.value }))
            }
            placeholder="username"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-solid" onClick={create}>
              Create Issue
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </FormPanel>
      )}

      {!repo ?
        <Empty icon={AlertCircle} title="Select a repository" />
      : loading ?
        <Loading />
      : !issues.length ?
        <Empty icon={Check} title="No issues found" />
      : <Card title={`${issues.length} issues`}>
          <DataTable
            cols={["#", "Title", "Status", "Labels", "Author", "Created", ""]}
            minWidth={680}
          >
            {issues.map((i: any) => (
              <tr key={i.id}>
                <td
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-code)",
                    fontSize: 12,
                  }}
                >
                  #{i.number}
                </td>
                <td style={{ maxWidth: 280 }}>
                  <a
                    href={i.html_url}
                    target="_blank"
                    className="truncate"
                    style={{ display: "block", fontWeight: 500 }}
                  >
                    {i.title}
                  </a>
                </td>
                <td>
                  <span
                    className={`badge ${i.state === "open" ? "badge-green" : "badge-muted"}`}
                  >
                    {i.state === "open" ?
                      <Check size={9} />
                    : <X size={9} />}
                    {i.state}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 3 }}>
                    {i.labels?.slice(0, 2).map((l: any) => (
                      <span
                        key={l.id}
                        className="badge"
                        style={{
                          background: `#${l.color}22`,
                          color: `#${l.color}`,
                          borderColor: `#${l.color}44`,
                        }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {i.user.login}
                </td>
                <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {ago(i.created_at)} ago
                </td>
                <td>
                  <button
                    className={`btn btn-xs row-actions ${i.state === "open" ? "btn-danger" : "btn-accent"}`}
                    onClick={() => toggle(i.number, i.state)}
                  >
                    {i.state === "open" ? "Close" : "Reopen"}
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑥ PULL REQUESTS
══════════════════════════════════════════════════════════════════════ */
function PullsTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState(LS.get<string>("pr", ""));
  const [pulls, setPulls] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [state, setState] = useState("open");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    head: "",
    base: "main",
    body: "",
    draft: false,
  });

  useEffect(() => {
    api("/repos?per_page=100")
      .then(setRepos)
      .catch(() => {});
  }, [api]);
  useEffect(() => {
    if (repo)
      api(`/repos/${repo}/branches`)
        .then(setBranches)
        .catch(() => {});
  }, [repo]);

  const load = useCallback(() => {
    if (!repo) return;
    LS.set("pr", repo);
    setLoading(true);
    api(`/repos/${repo}/pulls?state=${state}`)
      .then(setPulls)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [repo, state]);
  useEffect(() => {
    load();
  }, [load]);

  async function merge(num: number, method: string) {
    const [o, r] = repo.split("/");
    if (!confirm(`Merge PR #${num} via ${method}?`)) return;
    try {
      await api(`/repos/${o}/${r}/pulls/${num}`, {
        method: "PUT",
        body: { merge_method: method },
      });
      show(`PR #${num} merged!`);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }
  async function create() {
    const [o, r] = repo.split("/");
    try {
      await api(`/repos/${o}/${r}/pulls`, { method: "POST", body: form });
      show("PR created!");
      setOpen(false);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  return (
    <PageLayout
      title="Pull Requests"
      subtitle={repo ? `${pulls.length} ${state} PRs` : "Manage pull requests"}
      actions={
        <>
          <RepoSelect repos={repos} value={repo} onChange={setRepo} />
          <div className="tab-bar">
            {["open", "closed", "all"].map((s) => (
              <button
                key={s}
                className={`tab-item ${state === s ? "active" : ""}`}
                onClick={() => setState(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {repo && (
            <button
              className="btn btn-accent"
              onClick={() => setOpen((o) => !o)}
            >
              <Plus size={13} />
              New PR
            </button>
          )}
        </>
      }
    >
      {open && (
        <FormPanel cols={2}>
          <FI
            label="Title *"
            full
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="PR title"
          />
          <FS
            label="Head Branch *"
            value={form.head}
            onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))}
          >
            <option value="">Select branch…</option>
            {branches.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </FS>
          <FS
            label="Base Branch *"
            value={form.base}
            onChange={(e) => setForm((p) => ({ ...p, base: e.target.value }))}
          >
            {branches.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </FS>
          <FTA
            label="Description"
            full
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            placeholder="What does this PR do?"
          />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn btn-solid" onClick={create}>
              Create PR
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <Checkbox
              label="Draft"
              checked={form.draft}
              onChange={(v) => setForm((p) => ({ ...p, draft: v }))}
            />
          </div>
        </FormPanel>
      )}

      {!repo ?
        <Empty icon={GitPullRequest} title="Select a repository" />
      : loading ?
        <Loading />
      : !pulls.length ?
        <Empty icon={Check} title="No pull requests" />
      : <Card title={`${pulls.length} pull requests`}>
          <DataTable
            cols={["#", "Title", "Status", "Branches", "Author", "Created", ""]}
            minWidth={700}
          >
            {pulls.map((p: any) => (
              <tr key={p.id}>
                <td
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-code)",
                    fontSize: 12,
                  }}
                >
                  #{p.number}
                </td>
                <td style={{ maxWidth: 240 }}>
                  <a
                    href={p.html_url}
                    target="_blank"
                    className="truncate"
                    style={{ display: "block", fontWeight: 500 }}
                  >
                    {p.title}
                  </a>
                  {p.draft && (
                    <span
                      className="badge badge-muted"
                      style={{ marginTop: 2, fontSize: 10 }}
                    >
                      Draft
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${
                      p.state === "open" ? "badge-purple"
                      : p.merged_at ? "badge-blue"
                      : "badge-muted"
                    }`}
                  >
                    {p.state}
                  </span>
                </td>
                <td
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-code)",
                  }}
                >
                  {p.head.ref} → {p.base.ref}
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {p.user.login}
                </td>
                <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {ago(p.created_at)} ago
                </td>
                <td>
                  {p.state === "open" && (
                    <div
                      className="row-actions"
                      style={{ display: "flex", gap: 3 }}
                    >
                      <button
                        className="btn btn-xs btn-accent"
                        onClick={() => merge(p.number, "merge")}
                      >
                        <Merge size={10} />
                        Merge
                      </button>
                      <button
                        className="btn btn-xs"
                        onClick={() => merge(p.number, "squash")}
                      >
                        Squash
                      </button>
                      <button
                        className="btn btn-xs"
                        onClick={() => merge(p.number, "rebase")}
                      >
                        Rebase
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑦ RELEASES
══════════════════════════════════════════════════════════════════════ */
function ReleasesTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState(LS.get<string>("re", ""));
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tag_name: "",
    name: "",
    body: "",
    draft: false,
    prerelease: false,
    target_commitish: "main",
  });

  useEffect(() => {
    api("/repos?per_page=100")
      .then(setRepos)
      .catch(() => {});
  }, [api]);

  const load = useCallback(() => {
    if (!repo) return;
    LS.set("re", repo);
    setLoading(true);
    const [o, r] = repo.split("/");
    api(`/repos/${o}/${r}/releases`)
      .then(setReleases)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [repo]);
  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    const [o, r] = repo.split("/");
    try {
      await api(`/repos/${o}/${r}/releases`, { method: "POST", body: form });
      show("Release published!");
      setOpen(false);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  return (
    <PageLayout
      title="Releases"
      subtitle={repo ? `${releases.length} releases` : "Manage releases"}
      actions={
        <>
          <RepoSelect repos={repos} value={repo} onChange={setRepo} />
          {repo && (
            <button
              className="btn btn-accent"
              onClick={() => setOpen((o) => !o)}
            >
              <Plus size={13} />
              New Release
            </button>
          )}
        </>
      }
    >
      {open && (
        <FormPanel cols={2}>
          <FI
            label="Tag Name *"
            value={form.tag_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, tag_name: e.target.value }))
            }
            placeholder="v1.0.0"
          />
          <FI
            label="Release Title"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="v1.0.0 — Initial Release"
          />
          <FI
            label="Target Branch / SHA"
            value={form.target_commitish}
            onChange={(e) =>
              setForm((p) => ({ ...p, target_commitish: e.target.value }))
            }
            placeholder="main"
          />
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              paddingTop: 20,
            }}
          >
            <Checkbox
              label="Draft"
              checked={form.draft}
              onChange={(v) => setForm((p) => ({ ...p, draft: v }))}
            />
            <Checkbox
              label="Pre-release"
              checked={form.prerelease}
              onChange={(v) => setForm((p) => ({ ...p, prerelease: v }))}
            />
          </div>
          <FTA
            label="Release Notes"
            full
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            placeholder="What's new in this release?"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-solid" onClick={create}>
              Publish Release
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </FormPanel>
      )}

      {!repo ?
        <Empty icon={Package} title="Select a repository" />
      : loading ?
        <Loading />
      : !releases.length ?
        <Empty icon={Tag} title="No releases yet" />
      : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {releases.map((r: any) => (
            <div
              key={r.id}
              className="card anim-fade-in"
              style={{ padding: "18px 22px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      flexWrap: "wrap",
                      marginBottom: 5,
                    }}
                  >
                    <a
                      href={r.html_url}
                      target="_blank"
                      style={{ fontSize: 15, fontWeight: 700 }}
                    >
                      {r.name || r.tag_name}
                    </a>
                    <span className="badge badge-accent">{r.tag_name}</span>
                    {r.draft && (
                      <span className="badge badge-muted">Draft</span>
                    )}
                    {r.prerelease && (
                      <span className="badge badge-amber">Pre-release</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    by {r.author.login} · {ago(r.created_at)} ago
                  </p>
                  {r.body && (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.65,
                        maxWidth: 600,
                      }}
                    >
                      {r.body.slice(0, 260)}
                      {r.body.length > 260 ? "…" : ""}
                    </p>
                  )}
                </div>
                <a
                  href={r.html_url}
                  target="_blank"
                  className="btn btn-sm btn-ghost btn-icon"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑧ ACTIONS
══════════════════════════════════════════════════════════════════════ */
function ActionsTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState(LS.get<string>("ac", ""));
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/repos?per_page=100")
      .then(setRepos)
      .catch(() => {});
  }, [api]);

  const load = useCallback(() => {
    if (!repo) return;
    LS.set("ac", repo);
    setLoading(true);
    const [o, r] = repo.split("/");
    Promise.all([
      api(`/repos/${o}/${r}/actions`),
      api(`/repos/${o}/${r}/actions?runs=1`),
    ])
      .then(([w, rr]) => {
        setWorkflows(w.workflows || []);
        setRuns(rr.workflow_runs || []);
      })
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [repo]);
  useEffect(() => {
    load();
  }, [load]);

  const statusBadge: Record<string, string> = {
    success: "badge-green",
    failure: "badge-red",
    in_progress: "badge-cyan",
    queued: "badge-amber",
    cancelled: "badge-muted",
    completed: "badge-muted",
  };

  async function runAction(action: string, runId: number) {
    const [o, r] = repo.split("/");
    try {
      await api(`/repos/${o}/${r}/actions`, {
        method: "POST",
        body: { action, run_id: runId },
      });
      show("Done!");
    } catch (e: any) {
      show(e.message, "error");
    }
  }
  async function trigger(wfId: string) {
    const ref = prompt("Trigger on branch:", "main");
    if (!ref) return;
    const [o, r] = repo.split("/");
    try {
      await api(`/repos/${o}/${r}/actions`, {
        method: "POST",
        body: { workflow_id: wfId, ref },
      });
      show("Triggered!");
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  return (
    <PageLayout
      title="Actions"
      subtitle="Workflows & CI runs"
      actions={
        <>
          <RepoSelect repos={repos} value={repo} onChange={setRepo} />
          <button className="btn btn-ghost btn-icon" onClick={load}>
            <RefreshCw size={13} />
          </button>
        </>
      }
    >
      {!repo ?
        <Empty icon={Zap} title="Select a repository" />
      : loading ?
        <Loading />
      : <>
          {workflows.length > 0 && (
            <Card title="Workflows">
              <DataTable cols={["Name", "Path", "State", ""]} minWidth={400}>
                {workflows.map((w: any) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 500 }}>{w.name}</td>
                    <td
                      style={{
                        fontFamily: "var(--font-code)",
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {w.path}
                    </td>
                    <td>
                      <span
                        className={`badge ${w.state === "active" ? "badge-green" : "badge-muted"}`}
                      >
                        {w.state}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-accent row-actions"
                        onClick={() => trigger(String(w.id))}
                      >
                        <Play size={10} />
                        Trigger
                      </button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </Card>
          )}
          <Card title="Recent Runs">
            <DataTable
              cols={[
                "#",
                "Workflow",
                "Branch",
                "Status",
                "Conclusion",
                "Started",
                "",
              ]}
              minWidth={680}
            >
              {runs.map((r: any) => (
                <tr key={r.id}>
                  <td
                    style={{
                      fontFamily: "var(--font-code)",
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    #{r.run_number}
                  </td>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td
                    style={{
                      fontFamily: "var(--font-code)",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {r.head_branch}
                  </td>
                  <td>
                    <span
                      className={`badge ${statusBadge[r.status] || "badge-muted"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.conclusion && (
                      <span
                        className={`badge ${statusBadge[r.conclusion] || "badge-muted"}`}
                      >
                        {r.conclusion}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {ago(r.created_at)} ago
                  </td>
                  <td>
                    <div
                      className="row-actions"
                      style={{ display: "flex", gap: 3 }}
                    >
                      {r.status === "in_progress" && (
                        <button
                          className="btn btn-xs btn-danger"
                          onClick={() => runAction("cancel", r.id)}
                        >
                          Cancel
                        </button>
                      )}
                      {r.status === "completed" && (
                        <button
                          className="btn btn-xs"
                          onClick={() => runAction("rerun", r.id)}
                        >
                          <RefreshCw size={10} />
                        </button>
                      )}
                      <a
                        href={r.html_url}
                        target="_blank"
                        className="btn btn-xs btn-ghost"
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑨ WEBHOOKS
══════════════════════════════════════════════════════════════════════ */
function WebhooksTab({ api, show }: any) {
  const [repos, setRepos] = useState<any[]>([]);
  const [repo, setRepo] = useState(LS.get<string>("wh", ""));
  const [hooks, setHooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    url: "",
    events: "push,pull_request,issues,release",
    secret: "",
  });
  const receiverUrl =
    typeof window !== "undefined" ?
      `${window.location.origin}/api/webhooks/receive`
    : "/api/webhooks/receive";

  useEffect(() => {
    api("/repos?per_page=100")
      .then(setRepos)
      .catch(() => {});
  }, [api]);

  const load = useCallback(() => {
    if (!repo) return;
    LS.set("wh", repo);
    setLoading(true);
    const [o, r] = repo.split("/");
    api(`/repos/${o}/${r}/webhooks`)
      .then(setHooks)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [repo]);
  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    const [o, r] = repo.split("/");
    const events = form.events
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await api(`/repos/${o}/${r}/webhooks`, {
        method: "POST",
        body: { url: form.url, events, secret: form.secret || undefined },
      });
      show("Webhook created!");
      setOpen(false);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }
  async function del(id: number) {
    const [o, r] = repo.split("/");
    if (!confirm("Delete this webhook?")) return;
    try {
      await api(`/repos/${o}/${r}/webhooks`, {
        method: "POST",
        body: { action: "delete", hook_id: id },
      });
      show("Deleted");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }
  async function ping(id: number) {
    const [o, r] = repo.split("/");
    try {
      await api(`/repos/${o}/${r}/webhooks`, {
        method: "POST",
        body: { action: "ping", hook_id: id },
      });
      show("Ping sent!");
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  return (
    <PageLayout
      title="Webhooks"
      subtitle="Manage repository webhooks"
      actions={
        <>
          <RepoSelect repos={repos} value={repo} onChange={setRepo} />
          {repo && (
            <button
              className="btn btn-accent"
              onClick={() => setOpen((o) => !o)}
            >
              <Plus size={13} />
              Add
            </button>
          )}
        </>
      }
    >
      <Banner icon={Webhook}>
        <strong style={{ color: "var(--accent-text)" }}>Receiver URL: </strong>
        <code style={{ fontFamily: "var(--font-code)", fontSize: 12 }}>
          {receiverUrl}
        </code>
        <button
          className="btn btn-xs btn-accent"
          style={{ marginLeft: 8 }}
          onClick={() => {
            cp(receiverUrl);
            show("Copied!");
          }}
        >
          <Copy size={10} />
          Copy
        </button>
      </Banner>

      <Card title="Webhook setup help">
        <div style={{ padding: "14px 18px", display: "grid", gap: 10 }}>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
            Use a Personal Access Token with repository access and webhook scope
            to create hooks.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["repo", "admin:repo_hook", "read:user"].map((scope) => (
              <code
                key={scope}
                style={{
                  fontSize: 11.5,
                  background: "var(--bg-overlay)",
                  color: "var(--accent-text)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid var(--accent-border)",
                  fontFamily: "var(--font-code)",
                }}
              >
                {scope}
              </code>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            For this deployment, set Payload URL to:
            <span
              style={{
                marginLeft: 6,
                color: "var(--accent-text)",
                fontFamily: "var(--font-code)",
              }}
            >
              https://gh-control-nishu.vercel.app/api/webhooks/receive
            </span>
          </p>
        </div>
      </Card>

      {open && (
        <FormPanel cols={2}>
          <FI
            label="Payload URL *"
            full
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            placeholder="https://yourapp.vercel.app/api/webhooks/receive"
          />
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button
              className="btn btn-sm"
              onClick={() => setForm((p) => ({ ...p, url: receiverUrl }))}
            >
              Use receiver URL
            </button>
          </div>
          <FI
            label="Events (comma-sep)"
            value={form.events}
            onChange={(e) => setForm((p) => ({ ...p, events: e.target.value }))}
            placeholder="push,pull_request,issues"
          />
          <FI
            label="Secret (optional)"
            type="password"
            value={form.secret}
            onChange={(e) => setForm((p) => ({ ...p, secret: e.target.value }))}
            placeholder="Webhook secret"
          />
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button className="btn btn-solid" onClick={create}>
              Add Webhook
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </FormPanel>
      )}

      {!repo ?
        <Empty icon={Webhook} title="Select a repository" />
      : loading ?
        <Loading />
      : !hooks.length ?
        <Empty
          icon={Webhook}
          title="No webhooks configured"
          body="Add your first webhook above"
        />
      : <Card title={`${hooks.length} webhooks`}>
          {hooks.map((h: any, i: number) => (
            <div
              key={h.id}
              style={{
                padding: "16px 20px",
                borderBottom:
                  i < hooks.length - 1 ?
                    "1px solid var(--border-subtle)"
                  : "none",
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className={`badge ${h.active ? "badge-green" : "badge-red"}`}
                  >
                    {h.active ?
                      <>
                        <Wifi size={9} />
                        Active
                      </>
                    : <>
                        <WifiOff size={9} />
                        Inactive
                      </>
                    }
                  </span>
                  <code
                    style={{
                      fontSize: 12.5,
                      color: "var(--accent-text)",
                      fontFamily: "var(--font-code)",
                    }}
                  >
                    {h.config.url}
                  </code>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Events:{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    {h.events.join(", ")}
                  </span>{" "}
                  · ID: {h.id}
                </p>
              </div>
              <div
                style={{ display: "flex", gap: 6, alignItems: "flex-start" }}
              >
                <button className="btn btn-sm" onClick={() => ping(h.id)}>
                  Ping
                </button>
                <button
                  className="btn btn-sm btn-danger btn-icon"
                  onClick={() => del(h.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑩ SEARCH
══════════════════════════════════════════════════════════════════════ */
function SearchTab({ api, show }: any) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"repos" | "issues" | "code" | "users">(
    "repos",
  );
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      setResults(await api(`/search?q=${encodeURIComponent(q)}&type=${type}`));
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout
      title="Search GitHub"
      subtitle="Search across repositories, code, issues, and users"
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div className="tab-bar">
          {(["repos", "issues", "code", "users"] as const).map((t) => (
            <button
              key={t}
              className={`tab-item ${type === t ? "active" : ""}`}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={13} className="search-icon" />
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={`Search ${type} on GitHub…`}
          />
        </div>
        <button
          className="btn btn-solid"
          onClick={search}
          disabled={loading || !q.trim()}
        >
          <Search size={13} />
          Search
        </button>
      </div>

      {loading ?
        <Loading />
      : results && (
          <Card
            title={`${results.total_count?.toLocaleString()} results for "${q}"`}
          >
            <DataTable
              cols={
                type === "repos" ?
                  ["Repository", "Language", "Stars", "Forks", ""]
                : ["Item", ""]
              }
              minWidth={460}
            >
              {(results.items || []).map((item: any) => (
                <tr key={item.id || item.sha || item.login}>
                  <td>
                    {type === "repos" && (
                      <>
                        <a
                          href={item.html_url}
                          target="_blank"
                          style={{
                            fontWeight: 600,
                            color: "var(--accent-text)",
                          }}
                        >
                          {item.full_name}
                        </a>
                        {item.description && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--text-tertiary)",
                              marginTop: 2,
                              maxWidth: 480,
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                      </>
                    )}
                    {type === "issues" && (
                      <>
                        <a
                          href={item.html_url}
                          target="_blank"
                          style={{ fontWeight: 500 }}
                        >
                          {item.title}
                        </a>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--text-tertiary)",
                            marginTop: 2,
                          }}
                        >
                          {item.repository_url?.split("/").slice(-2).join("/")}{" "}
                          · {item.user.login}
                        </p>
                      </>
                    )}
                    {type === "code" && (
                      <>
                        <a
                          href={item.html_url}
                          target="_blank"
                          style={{
                            fontFamily: "var(--font-code)",
                            fontSize: 12.5,
                            color: "var(--accent-text)",
                          }}
                        >
                          {item.path}
                        </a>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--text-tertiary)",
                            marginTop: 2,
                          }}
                        >
                          {item.repository.full_name}
                        </p>
                      </>
                    )}
                    {type === "users" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <img
                          src={item.avatar_url}
                          alt=""
                          style={{ width: 30, height: 30, borderRadius: "50%" }}
                        />
                        <a
                          href={item.html_url}
                          target="_blank"
                          style={{
                            fontWeight: 600,
                            color: "var(--accent-text)",
                          }}
                        >
                          {item.login}
                        </a>
                        <span className="badge badge-muted">{item.type}</span>
                      </div>
                    )}
                  </td>
                  {type === "repos" && (
                    <>
                      <td
                        style={{
                          fontSize: 12.5,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item.language || "—"}
                      </td>
                      <td
                        style={{ color: "var(--amber-text)", fontSize: 12.5 }}
                      >
                        ★ {item.stargazers_count}
                      </td>
                      <td
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: 12.5,
                        }}
                      >
                        ⑂ {item.forks_count}
                      </td>
                    </>
                  )}
                  <td>
                    <a
                      href={item.html_url}
                      target="_blank"
                      className="btn btn-xs btn-ghost"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Card>
        )
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑪ STARS
══════════════════════════════════════════════════════════════════════ */
function StarsTab({ api, show }: any) {
  const [stars, setStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    api("/stars")
      .then(setStars)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [api]);

  async function unstar(owner: string, repo: string) {
    try {
      await api("/stars", {
        method: "POST",
        body: { owner, repo, action: "unstar" },
      });
      show("Unstarred");
      setStars((p) => p.filter((r) => r.full_name !== `${owner}/${repo}`));
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  const filtered = stars.filter(
    (r) => !query || r.full_name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PageLayout
      title="Starred Repos"
      subtitle={`${filtered.length} of ${stars.length} starred`}
      actions={
        <>
          <div className="search-wrap">
            <Search size={13} className="search-icon" />
            <input
              className="input"
              placeholder="Filter stars…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
          <button className="btn btn-ghost btn-icon" onClick={load}>
            <RefreshCw size={13} />
          </button>
        </>
      }
    >
      {loading ?
        <Loading />
      : !filtered.length ?
        <Empty icon={Star} title="No starred repos" />
      : <Card title={`${filtered.length} starred repos`}>
          <DataTable
            cols={["Repository", "Language", "Stars", "Updated", ""]}
            minWidth={520}
          >
            {filtered.map((r: any) => (
              <tr key={r.id}>
                <td>
                  <a
                    href={r.html_url}
                    target="_blank"
                    style={{ fontWeight: 600, color: "var(--accent-text)" }}
                  >
                    {r.full_name}
                  </a>
                  {r.description && (
                    <p
                      className="truncate"
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        maxWidth: 340,
                        marginTop: 2,
                      }}
                    >
                      {r.description}
                    </p>
                  )}
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {r.language || "—"}
                </td>
                <td style={{ color: "var(--amber-text)" }}>
                  ★ {r.stargazers_count}
                </td>
                <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {ago(r.updated_at)} ago
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-danger row-actions"
                    onClick={() => unstar(r.owner.login, r.name)}
                  >
                    <Star size={10} />
                    Unstar
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑫ GISTS
══════════════════════════════════════════════════════════════════════ */
function GistsTab({ api, show }: any) {
  const [gists, setGists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    filename: "snippet.js",
    content: "",
    public: false,
  });

  const load = () => {
    setLoading(true);
    api("/gists")
      .then(setGists)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [api]);

  async function create() {
    try {
      await api("/gists", {
        method: "POST",
        body: {
          description: form.description,
          public: form.public,
          files: { [form.filename]: { content: form.content } },
        },
      });
      show("Gist created!");
      setOpen(false);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  return (
    <PageLayout
      title="Gists"
      subtitle={`${gists.length} gists`}
      actions={
        <button className="btn btn-accent" onClick={() => setOpen((o) => !o)}>
          <Plus size={13} />
          New Gist
        </button>
      }
    >
      {open && (
        <FormPanel cols={2}>
          <FI
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="What does this do?"
          />
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <FI
              label="Filename"
              value={form.filename}
              onChange={(e) =>
                setForm((p) => ({ ...p, filename: e.target.value }))
              }
              placeholder="snippet.js"
            />
            <div style={{ paddingBottom: 2 }}>
              <Checkbox
                label="Public"
                checked={form.public}
                onChange={(v) => setForm((p) => ({ ...p, public: v }))}
              />
            </div>
          </div>
          <FTA
            label="Content *"
            full
            value={form.content}
            onChange={(e) =>
              setForm((p) => ({ ...p, content: e.target.value }))
            }
            placeholder="Your code here…"
            style={{ minHeight: 130 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-solid" onClick={create}>
              Create Gist
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </FormPanel>
      )}

      {loading ?
        <Loading />
      : !gists.length ?
        <Empty icon={FileCode} title="No gists yet" />
      : <Card title={`${gists.length} gists`}>
          <DataTable
            cols={["Filename", "Files", "Visibility", "Updated", ""]}
            minWidth={440}
          >
            {gists.map((g: any) => (
              <tr key={g.id}>
                <td>
                  <a
                    href={g.html_url}
                    target="_blank"
                    style={{
                      fontFamily: "var(--font-code)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--accent-text)",
                    }}
                  >
                    {Object.keys(g.files)[0]}
                  </a>
                  {g.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        marginTop: 2,
                      }}
                    >
                      {g.description}
                    </p>
                  )}
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>
                  {Object.keys(g.files).length} file
                  {Object.keys(g.files).length !== 1 ? "s" : ""}
                </td>
                <td>
                  <span
                    className={`badge ${g.public ? "badge-green" : "badge-muted"}`}
                  >
                    {g.public ? "Public" : "Secret"}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {ago(g.updated_at)} ago
                </td>
                <td>
                  <a
                    href={g.html_url}
                    target="_blank"
                    className="btn btn-xs btn-ghost"
                  >
                    <ExternalLink size={11} />
                  </a>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑬ NOTIFICATIONS
══════════════════════════════════════════════════════════════════════ */
function NotifsTab({ api, show }: any) {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api("/notifications")
      .then(setNotifs)
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [api]);

  async function markAll() {
    try {
      await api("/notifications", {
        method: "POST",
        body: { action: "mark_read" },
      });
      show("All marked read");
      setNotifs([]);
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  const typeBadge: Record<string, string> = {
    Issue: "badge-amber",
    PullRequest: "badge-purple",
    Release: "badge-blue",
    Discussion: "badge-green",
    Commit: "badge-cyan",
  };

  return (
    <PageLayout
      title="Notifications"
      subtitle={`${notifs.length} unread`}
      actions={
        <>
          <button className="btn btn-ghost btn-icon" onClick={load}>
            <RefreshCw size={13} />
          </button>
          {notifs.length > 0 && (
            <button className="btn btn-accent" onClick={markAll}>
              <Check size={13} />
              Mark All Read
            </button>
          )}
        </>
      }
    >
      {loading ?
        <Loading />
      : !notifs.length ?
        <Empty
          icon={Inbox}
          title="All caught up!"
          body="No unread notifications"
        />
      : <Card title={`${notifs.length} notifications`}>
          <DataTable
            cols={["Type", "Title", "Reason", "Updated"]}
            minWidth={500}
          >
            {notifs.map((n: any) => (
              <tr key={n.id}>
                <td>
                  <span
                    className={`badge ${typeBadge[n.subject.type] || "badge-muted"}`}
                  >
                    {n.subject.type}
                  </span>
                </td>
                <td style={{ maxWidth: 360 }}>
                  <p className="truncate" style={{ fontWeight: 500 }}>
                    {n.subject.title}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                      marginTop: 1,
                    }}
                  >
                    {n.repository.full_name}
                  </p>
                </td>
                <td style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {n.reason}
                </td>
                <td
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ago(n.updated_at)} ago
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑭ JOB QUEUE
══════════════════════════════════════════════════════════════════════ */
function JobsTab({ api, show }: any) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "sync_repos",
    owner: "",
    repo: "",
    branch: "",
    from: "",
    tag: "",
  });
  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/github/jobs${status ? `?status=${status}` : ""}`)
      .then((r) => r.json())
      .then((d) => setJobs(d.data || []))
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [status]);
  useEffect(() => {
    load();
  }, [load]);

  async function enqueue() {
    const body: any = { type: form.type };
    if (form.owner) body.owner = form.owner;
    if (form.repo) body.repo = form.repo;
    if (form.branch) body.branch = form.branch;
    if (form.from) body.from = form.from;
    if (form.tag) body.tag = form.tag;
    try {
      await api("/jobs", { method: "POST", body });
      show("Job enqueued!");
      setOpen(false);
      setTimeout(load, 800);
    } catch (e: any) {
      show(e.message, "error");
    }
  }

  const statusBadge: Record<string, string> = {
    pending: "badge-amber",
    active: "badge-cyan",
    completed: "badge-green",
    failed: "badge-red",
  };
  const needsRepo = form.type !== "sync_repos";

  return (
    <PageLayout
      title="Job Queue"
      subtitle="BullMQ background jobs"
      actions={
        <>
          <div className="tab-bar">
            {["", "pending", "active", "completed", "failed"].map((s) => (
              <button
                key={s}
                className={`tab-item ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {s || "all"}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={load}>
            <RefreshCw size={13} />
          </button>
          <button className="btn btn-accent" onClick={() => setOpen((o) => !o)}>
            <Plus size={13} />
            Enqueue
          </button>
        </>
      }
    >
      {open && (
        <FormPanel cols={3}>
          <FS
            label="Job Type"
            value={form.type}
            onChange={(e) => f("type", e.target.value)}
          >
            {[
              "sync_repos",
              "create_branch",
              "delete_branch",
              "close_issue",
              "merge_pr",
              "create_release",
              "fork_repo",
              "star_repo",
              "unstar_repo",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FS>
          {needsRepo && (
            <>
              <FI
                label="Owner"
                value={form.owner}
                onChange={(e) => f("owner", e.target.value)}
                placeholder="owner"
              />
              <FI
                label="Repo"
                value={form.repo}
                onChange={(e) => f("repo", e.target.value)}
                placeholder="repo-name"
              />
            </>
          )}
          {form.type === "create_branch" && (
            <>
              <FI
                label="New Branch"
                value={form.branch}
                onChange={(e) => f("branch", e.target.value)}
                placeholder="feature/x"
              />
              <FI
                label="From Branch"
                value={form.from}
                onChange={(e) => f("from", e.target.value)}
                placeholder="main"
              />
            </>
          )}
          {form.type === "create_release" && (
            <FI
              label="Tag"
              value={form.tag}
              onChange={(e) => f("tag", e.target.value)}
              placeholder="v1.0.0"
            />
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button className="btn btn-solid" onClick={enqueue}>
              Enqueue Job
            </button>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </FormPanel>
      )}

      {loading ?
        <Loading />
      : !jobs.length ?
        <Empty icon={Database} title="No jobs found" />
      : <Card title={`${jobs.length} jobs`}>
          <DataTable
            cols={["Job ID", "Type", "Status", "Created", "Duration", "Error"]}
            minWidth={640}
          >
            {jobs.map((j: any) => (
              <tr key={j._id}>
                <td
                  style={{
                    fontFamily: "var(--font-code)",
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                  }}
                >
                  {j.jobId?.slice(0, 10)}…
                </td>
                <td style={{ fontWeight: 500 }}>{j.type}</td>
                <td>
                  <span
                    className={`badge ${statusBadge[j.status] || "badge-muted"}`}
                  >
                    {j.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {ago(j.createdAt)} ago
                </td>
                <td
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-code)",
                  }}
                >
                  {j.finishedAt && j.startedAt ?
                    `${((new Date(j.finishedAt).getTime() - new Date(j.startedAt).getTime()) / 1000).toFixed(1)}s`
                  : "—"}
                </td>
                <td
                  style={{
                    fontSize: 12,
                    color: "var(--red-text)",
                    maxWidth: 200,
                  }}
                >
                  {j.error && (
                    <span className="truncate" style={{ display: "block" }}>
                      {j.error}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      }
    </PageLayout>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ⑮ WEBHOOK EVENTS
══════════════════════════════════════════════════════════════════════ */
function EventsTab({ show }: any) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/webhooks/events${filter ? `?event=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.data || []))
      .catch(() => show("Failed", "error"))
      .finally(() => setLoading(false));
  }, [filter]);
  useEffect(() => {
    load();
  }, [load]);

  const eventBadge: Record<string, string> = {
    push: "badge-green",
    pull_request: "badge-purple",
    issues: "badge-amber",
    release: "badge-blue",
    create: "badge-cyan",
    delete: "badge-red",
    star: "badge-amber",
    fork: "badge-muted",
  };

  return (
    <PageLayout
      title="Webhook Events"
      subtitle="App-triggered activity logs (Redis first, compact Mongo backup)"
      actions={
        <>
          <div className="search-wrap">
            <Filter size={12} className="search-icon" />
            <input
              className="input"
              placeholder="Filter by event…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: 180 }}
            />
          </div>
          <button className="btn btn-ghost btn-icon" onClick={load}>
            <RefreshCw size={13} />
          </button>
        </>
      }
    >
      {loading ?
        <Loading />
      : !events.length ?
        <Empty
          icon={Activity}
          title="No activity logs yet"
          body="Actions you run from this GH tool will appear here"
        />
      : <Card title={`${events.length} events`}>
          {events.map((e: any, i: number) => (
            <div key={e._id}>
              <div
                onClick={() => setExpanded(expanded === e._id ? null : e._id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 20px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(el) =>
                  ((el.currentTarget as any).style.background =
                    "var(--bg-hover)")
                }
                onMouseLeave={(el) =>
                  ((el.currentTarget as any).style.background = "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 0,
                  }}
                >
                  <span
                    className={`badge ${eventBadge[e.event] || "badge-muted"}`}
                    style={{ flexShrink: 0 }}
                  >
                    {e.event}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>
                    {e.repository || "unknown"}
                  </span>
                  {e.action && (
                    <span
                      style={{ fontSize: 12, color: "var(--text-tertiary)" }}
                    >
                      → {e.action}
                    </span>
                  )}
                  {e.sender && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Users size={10} />
                      {e.sender}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {ago(e.receivedAt)} ago
                  </span>
                  {expanded === e._id ?
                    <ChevronDown size={13} color="var(--text-tertiary)" />
                  : <ChevronRight size={13} color="var(--text-tertiary)" />}
                </div>
              </div>
              {expanded === e._id && (
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "var(--bg-elevated)",
                  }}
                >
                  <pre className="code-block">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </Card>
      }
    </PageLayout>
  );
}
