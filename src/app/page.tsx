'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  GitBranch, GitCommit, GitPullRequest, Star, Bell, Search, Settings,
  Play, Trash2, Plus, RefreshCw, ExternalLink, ChevronDown, ChevronRight,
  AlertCircle, Check, X, Webhook, Zap, Package, Code, Activity, Database,
  Terminal, LogOut, Eye, Lock, Unlock, Archive, Copy, Filter, Download,
  BookOpen, Tag, Users, Clock, TrendingUp, Shield, Globe, Key
} from 'lucide-react'

// ── Local Storage helpers ──────────────────────────────────────────────────
const LS = {
  get: (k: string, def?: any) => {
    if (typeof window === 'undefined') return def
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def }
  },
  set: (k: string, v: any) => {
    try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
  },
  del: (k: string) => { try { localStorage.removeItem(k) } catch {} }
}

// ── API client ─────────────────────────────────────────────────────────────
function useApi(token: string) {
  const call = useCallback(async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(`/api/github${path}`, {
      ...opts,
      headers: { 'x-github-token': token, 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined,
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'API error')
    return json.data
  }, [token])
  return call
}

// ── Toast ──────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const timerRef = useRef<any>(null)
  const show = (msg: string, type = 'success') => {
    setToast({ msg, type })
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 3500)
  }
  return { toast, show }
}

// ── Util ───────────────────────────────────────────────────────────────────
function timeSince(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  return `${Math.floor(s / 2592000)}mo ago`
}

function copy(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

// ── Components ─────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'default', size = 'sm', disabled, className = '' }: any) {
  const base = 'inline-flex items-center gap-1.5 border rounded font-mono transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
  const sizes: any = {
    xs: 'px-2 py-0.5 text-[0.65rem]',
    sm: 'px-3 py-1.5 text-[0.72rem]',
    md: 'px-4 py-2 text-[0.8rem]',
  }
  const variants: any = {
    default: 'bg-[var(--glass2)] border-[var(--border2)] text-[var(--text2)] hover:border-[var(--green)] hover:text-[var(--green)]',
    primary: 'bg-[rgba(0,255,135,0.12)] border-[var(--green)] text-[var(--green)] hover:bg-[rgba(0,255,135,0.2)]',
    danger:  'bg-[rgba(248,113,113,0.08)] border-[rgba(248,113,113,0.3)] text-[var(--red)] hover:bg-[rgba(248,113,113,0.15)]',
    ghost:   'bg-transparent border-transparent text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--glass)]',
    blue:    'bg-[rgba(56,189,248,0.1)] border-[rgba(56,189,248,0.3)] text-[var(--blue)] hover:bg-[rgba(56,189,248,0.2)]',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function Panel({ title, actions, children, className = '' }: any) {
  return (
    <div className={`bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--glass)]">
          <span className="text-[0.68rem] font-semibold text-[var(--text2)] tracking-widest uppercase">{title}</span>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

function Input({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[0.65rem] text-[var(--text2)] tracking-widest uppercase">{label}</label>}
      <input
        className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)] transition-colors placeholder-[var(--text3)]"
        {...props}
      />
    </div>
  )
}

function Select({ label, children, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[0.65rem] text-[var(--text2)] tracking-widest uppercase">{label}</label>}
      <select
        className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)] transition-colors cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

function Textarea({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[0.65rem] text-[var(--text2)] tracking-widest uppercase">{label}</label>}
      <textarea
        className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)] transition-colors placeholder-[var(--text3)] resize-y min-h-[80px]"
        {...props}
      />
    </div>
  )
}

function Spinner() {
  return <div className="spinner" />
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-10 text-center text-[var(--text3)] text-[0.75rem]">{msg}</div>
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'green' }: any) {
  const colors: any = {
    green: 'text-[var(--green)]',
    blue:  'text-[var(--blue)]',
    purple:'text-[var(--purple)]',
    orange:'text-[var(--orange)]',
  }
  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-4 hover:border-[var(--border2)] transition-colors">
      <div className="text-[0.62rem] text-[var(--text3)] tracking-widest uppercase mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]} font-['Syne']`}>{value}</div>
      {sub && <div className="text-[0.68rem] text-[var(--text2)] mt-0.5">{sub}</div>}
    </div>
  )
}

// ── TABS ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',      label: 'Overview',     icon: Activity },
  { id: 'repos',         label: 'Repos',        icon: BookOpen },
  { id: 'commits',       label: 'Commits',      icon: GitCommit },
  { id: 'branches',      label: 'Branches',     icon: GitBranch },
  { id: 'issues',        label: 'Issues',       icon: AlertCircle },
  { id: 'pulls',         label: 'Pull Requests',icon: GitPullRequest },
  { id: 'releases',      label: 'Releases',     icon: Package },
  { id: 'actions',       label: 'Actions',      icon: Zap },
  { id: 'webhooks',      label: 'Webhooks',     icon: Webhook },
  { id: 'search',        label: 'Search',       icon: Search },
  { id: 'stars',         label: 'Stars',        icon: Star },
  { id: 'gists',         label: 'Gists',        icon: Code },
  { id: 'notifications', label: 'Notifications',icon: Bell },
  { id: 'jobs',          label: 'Job Queue',    icon: Database },
  { id: 'events',        label: 'Webhook Events',icon: Globe },
]

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function Home() {
  const [token, setToken] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [user, setUser] = useState<any>(null)
  const [connecting, setConnecting] = useState(false)
  const [tab, setTab] = useState('overview')
  const { toast, show: showToast } = useToast()

  useEffect(() => {
    const saved = LS.get('gh_token')
    const savedUser = LS.get('gh_user')
    if (saved) { setToken(saved); setTokenInput(saved) }
    if (savedUser) setUser(savedUser)
  }, [])

  const api = useApi(token)

  async function connect() {
    if (!tokenInput.trim()) return showToast('Enter your GitHub token', 'error')
    setConnecting(true)
    try {
      const res = await fetch('/api/github/user', {
        headers: { 'x-github-token': tokenInput.trim() }
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setToken(tokenInput.trim())
      setUser(json.data)
      LS.set('gh_token', tokenInput.trim())
      LS.set('gh_user', json.data)
      showToast(`Connected as @${json.data.login}`, 'success')
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setConnecting(false)
    }
  }

  function disconnect() {
    setToken(''); setTokenInput(''); setUser(null)
    LS.del('gh_token'); LS.del('gh_user')
  }

  if (!token || !user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6 fade-in">
          <div className="w-full max-w-[460px]">
            {/* Logo */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded bg-[rgba(0,255,135,0.1)] border border-[rgba(0,255,135,0.2)] flex items-center justify-center">
                  <Terminal size={18} className="text-[var(--green)]" />
                </div>
                <div>
                  <h1 className="font-['Syne'] text-xl font-bold text-[var(--green)] tracking-tight">GH CONTROL</h1>
                  <p className="text-[0.68rem] text-[var(--text3)] tracking-widest">GITHUB COMMAND CENTER</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-xl p-8 shadow-[0_0_60px_rgba(0,255,135,0.04)]">
              <div className="mb-6">
                <label className="text-[0.65rem] text-[var(--text2)] tracking-widest uppercase block mb-2">
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && connect()}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--green)] transition-colors placeholder-[var(--text3)] tracking-wider"
                  autoComplete="off"
                />
                <p className="text-[0.65rem] text-[var(--text3)] mt-2">
                  Scopes needed:{' '}
                  <code className="text-[var(--blue)]">repo</code>{', '}
                  <code className="text-[var(--blue)]">read:user</code>{', '}
                  <code className="text-[var(--blue)]">admin:repo_hook</code>{', '}
                  <code className="text-[var(--blue)]">notifications</code>{', '}
                  <code className="text-[var(--blue)]">gist</code>
                  {' — '}
                  <a href="https://github.com/settings/tokens/new" target="_blank" className="text-[var(--green)] hover:underline">Generate →</a>
                </p>
              </div>

              <button
                onClick={connect}
                disabled={connecting}
                className="w-full bg-[var(--green)] text-black font-bold text-[0.78rem] tracking-widest uppercase py-3 rounded-[var(--radius)] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                {connecting ? '⟳ Connecting...' : '→ Connect to GitHub'}
              </button>

              <div className="mt-6 pt-6 border-t border-[var(--border)] grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Shield, label: 'Token stays local' },
                  { icon: Activity, label: 'Redis caching' },
                  { icon: Database, label: 'MongoDB logs' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-[var(--text3)]">
                    <Icon size={14} />
                    <span className="text-[0.6rem] leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
      </>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-[var(--bg2)] border-r border-[var(--border)] flex flex-col overflow-hidden">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[rgba(0,255,135,0.12)] border border-[rgba(0,255,135,0.2)] flex items-center justify-center flex-shrink-0">
              <Terminal size={13} className="text-[var(--green)]" />
            </div>
            <span className="font-['Syne'] font-bold text-[0.85rem] text-[var(--green)] tracking-tight">GH CONTROL</span>
          </div>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5 p-2 rounded bg-[var(--glass)] border border-[var(--border)]">
            {user.avatar_url && (
              <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-[0.72rem] font-semibold text-[var(--text)] truncate">@{user.login}</div>
              <div className="text-[0.6rem] text-[var(--text3)]">{user.public_repos} repos</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[0.72rem] font-mono transition-all duration-150 mb-0.5
                ${tab === id
                  ? 'bg-[rgba(0,255,135,0.1)] text-[var(--green)] border border-[rgba(0,255,135,0.2)]'
                  : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--glass)]'}`}
            >
              <Icon size={13} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>

        {/* Disconnect */}
        <div className="px-3 py-3 border-t border-[var(--border)]">
          <button
            onClick={disconnect}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-[0.68rem] text-[var(--text3)] hover:text-[var(--red)] hover:bg-[rgba(248,113,113,0.06)] transition-all font-mono"
          >
            <LogOut size={12} />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[var(--bg)]">
        <TabContent tab={tab} token={token} user={user} api={api} showToast={showToast} />
      </main>

      {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}

// ── TabContent dispatcher ──────────────────────────────────────────────────
function TabContent({ tab, token, user, api, showToast }: any) {
  const props = { token, user, api, showToast }
  switch (tab) {
    case 'overview':      return <OverviewTab {...props} />
    case 'repos':         return <ReposTab {...props} />
    case 'commits':       return <CommitsTab {...props} />
    case 'branches':      return <BranchesTab {...props} />
    case 'issues':        return <IssuesTab {...props} />
    case 'pulls':         return <PullsTab {...props} />
    case 'releases':      return <ReleasesTab {...props} />
    case 'actions':       return <ActionsTab {...props} />
    case 'webhooks':      return <WebhooksTab {...props} />
    case 'search':        return <SearchTab {...props} />
    case 'stars':         return <StarsTab {...props} />
    case 'gists':         return <GistsTab {...props} />
    case 'notifications': return <NotificationsTab {...props} />
    case 'jobs':          return <JobsTab {...props} />
    case 'events':        return <EventsTab {...props} />
    default:              return <OverviewTab {...props} />
  }
}

// ── Page header ────────────────────────────────────────────────────────────
function PageHeader({ title, sub, actions }: any) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border)] bg-[var(--bg2)] sticky top-0 z-10">
      <div>
        <h2 className="font-['Syne'] text-lg font-bold text-[var(--text)] tracking-tight">{title}</h2>
        {sub && <p className="text-[0.68rem] text-[var(--text2)] mt-0.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── RepoSelector ───────────────────────────────────────────────────────────
function RepoSelector({ repos, value, onChange, loading }: any) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={loading}
      className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)] transition-colors cursor-pointer min-w-[240px] text-[0.78rem]"
    >
      <option value="">Select repository...</option>
      {(repos || []).map((r: any) => (
        <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
      ))}
    </select>
  )
}

// ── OVERVIEW TAB ───────────────────────────────────────────────────────────
function OverviewTab({ api, user, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [rateLimit, setRateLimit] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api('/repos?sort=updated&per_page=5'),
      api('/rate-limit')
    ]).then(([r, rl]) => {
      setRepos(r || [])
      setRateLimit(rl)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [api])

  const totalStars = repos.reduce((a: number, r: any) => a + r.stargazers_count, 0)

  return (
    <div className="fade-in">
      <PageHeader
        title={`Welcome back, @${user.login}`}
        sub="GitHub Command Center"
        actions={<Btn variant="primary" onClick={() => window.open(`https://github.com/${user.login}`, '_blank')}><ExternalLink size={12} />GitHub Profile</Btn>}
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Repositories" value={user.public_repos + (user.total_private_repos || 0)} sub={`${user.public_repos} public`} color="green" />
          <StatCard label="Followers" value={user.followers} sub={`following ${user.following}`} color="blue" />
          <StatCard label="Stars Received" value={loading ? '...' : totalStars} sub="across all repos" color="purple" />
          <StatCard label="API Rate Limit" value={rateLimit ? `${rateLimit.rate?.remaining}/${rateLimit.rate?.limit}` : '...'} sub="requests remaining" color="orange" />
        </div>

        {user.bio && (
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-4 text-[0.78rem] text-[var(--text2)]">
            {user.bio}
          </div>
        )}

        <Panel title="Recent Repos">
          {loading ? <div className="p-4"><Spinner /></div> : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">Repo</th>
                  <th className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">Lang</th>
                  <th className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">Stars</th>
                  <th className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {repos.map((r: any) => (
                  <tr key={r.id} className="border-b border-[var(--border)] hover:bg-[var(--glass)] transition-colors">
                    <td className="px-4 py-2.5">
                      <a href={r.html_url} target="_blank" className="text-[var(--blue)] hover:underline text-[0.78rem]">{r.full_name}</a>
                      {r.private && <span className="badge badge-gray ml-2 text-[0.6rem]">private</span>}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text2)] text-[0.72rem]">{r.language || '—'}</td>
                    <td className="px-4 py-2.5 text-[var(--yellow)] text-[0.72rem]">★ {r.stargazers_count}</td>
                    <td className="px-4 py-2.5 text-[var(--text3)] text-[0.68rem]">{timeSince(r.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </div>
  )
}

// ── REPOS TAB ──────────────────────────────────────────────────────────────
function ReposTab({ api, user, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('updated')
  const [type, setType] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', private: false, auto_init: true })

  const load = useCallback(() => {
    setLoading(true)
    api(`/repos?sort=${sort}&type=${type}`).then(setRepos).catch(() => showToast('Failed to load repos', 'error')).finally(() => setLoading(false))
  }, [api, sort, type])

  useEffect(() => { load() }, [load])

  async function createRepo() {
    try {
      await api('/repos', { method: 'POST', body: form })
      showToast('Repo created!', 'success')
      setShowCreate(false)
      setForm({ name: '', description: '', private: false, auto_init: true })
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function deleteRepo(owner: string, repo: string) {
    if (!confirm(`Delete ${owner}/${repo}? This is irreversible.`)) return
    try {
      await api(`/repos/${owner}/${repo}`, { method: 'DELETE' })
      showToast('Repo deleted', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function forkRepo(owner: string, repo: string) {
    try {
      await api(`/repos/${owner}/${repo}`, { method: 'POST', body: { action: 'fork' } })
      showToast('Fork created!', 'success')
    } catch (e: any) {
      // fallback: use jobs API
      await api('/jobs', { method: 'POST', body: { type: 'fork_repo', owner, repo } })
      showToast('Fork queued!', 'success')
    }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Repositories"
        sub={`${repos.length} repositories`}
        actions={
          <>
            <select value={sort} onChange={e => setSort(e.target.value)} className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-2 py-1.5 text-[0.72rem] text-[var(--text2)] outline-none focus:border-[var(--green)]">
              <option value="updated">Updated</option>
              <option value="created">Created</option>
              <option value="pushed">Pushed</option>
              <option value="full_name">Name</option>
            </select>
            <select value={type} onChange={e => setType(e.target.value)} className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-2 py-1.5 text-[0.72rem] text-[var(--text2)] outline-none focus:border-[var(--green)]">
              <option value="all">All</option>
              <option value="owner">Owner</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={12} />New Repo</Btn>
            <Btn onClick={load}><RefreshCw size={12} /></Btn>
          </>
        }
      />

      {showCreate && (
        <div className="mx-6 mt-6">
          <Panel title="Create Repository" actions={<Btn variant="ghost" size="xs" onClick={() => setShowCreate(false)}><X size={10} /></Btn>}>
            <div className="p-4 grid grid-cols-2 gap-4">
              <Input label="Name *" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="my-new-repo" />
              <Input label="Description" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-[0.72rem] text-[var(--text2)]">
                  <input type="checkbox" checked={form.private} onChange={e => setForm({ ...form, private: e.target.checked })} className="accent-[var(--green)]" />
                  Private
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[0.72rem] text-[var(--text2)]">
                  <input type="checkbox" checked={form.auto_init} onChange={e => setForm({ ...form, auto_init: e.target.checked })} className="accent-[var(--green)]" />
                  Initialize with README
                </label>
              </div>
              <div className="flex items-end gap-2">
                <Btn variant="primary" onClick={createRepo} size="md">Create Repository</Btn>
              </div>
            </div>
          </Panel>
        </div>
      )}

      <div className="p-6">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <Panel>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Repository', 'Visibility', 'Language', 'Stars', 'Forks', 'Updated', ''].map(h => (
                    <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repos.map((r: any) => (
                  <tr key={r.id} className="border-b border-[var(--border)] hover:bg-[var(--glass)] transition-colors group">
                    <td className="px-4 py-3">
                      <div>
                        <a href={r.html_url} target="_blank" className="text-[var(--blue)] hover:underline text-[0.78rem] font-medium">{r.full_name}</a>
                        {r.description && <p className="text-[0.65rem] text-[var(--text3)] truncate max-w-[280px] mt-0.5">{r.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${r.private ? 'badge-gray' : 'badge-blue'}`}>
                        {r.private ? <><Lock size={8} /> Private</> : <><Globe size={8} /> Public</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text2)] text-[0.72rem]">{r.language || '—'}</td>
                    <td className="px-4 py-3 text-[var(--yellow)] text-[0.72rem]">★ {r.stargazers_count}</td>
                    <td className="px-4 py-3 text-[var(--text2)] text-[0.72rem]">⑂ {r.forks_count}</td>
                    <td className="px-4 py-3 text-[var(--text3)] text-[0.68rem]">{timeSince(r.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Btn size="xs" onClick={() => copy(r.clone_url)}><Copy size={10} /></Btn>
                        <Btn size="xs" variant="blue" onClick={() => forkRepo(r.owner.login, r.name)}><GitBranch size={10} />Fork</Btn>
                        <Btn size="xs" variant="danger" onClick={() => deleteRepo(r.owner.login, r.name)}><Trash2 size={10} /></Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── COMMITS TAB ────────────────────────────────────────────────────────────
function CommitsTab({ api, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState(LS.get('commits_repo', ''))
  const [commits, setCommits] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sha, setSha] = useState('')

  useEffect(() => {
    api('/repos?per_page=100').then(setRepos).catch(() => {})
  }, [api])

  useEffect(() => {
    if (!selectedRepo) return
    LS.set('commits_repo', selectedRepo)
    setLoading(true)
    const q = sha ? `?sha=${sha}` : ''
    api(`/repos/${selectedRepo}/commits${q}`).then(setCommits).catch(() => showToast('Failed to load commits', 'error')).finally(() => setLoading(false))
  }, [selectedRepo, sha, api])

  return (
    <div className="fade-in">
      <PageHeader title="Commits" sub="Browse commit history" />
      <div className="p-6 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <RepoSelector repos={repos} value={selectedRepo} onChange={setSelectedRepo} />
          <Input placeholder="Branch/SHA (optional)" value={sha} onChange={(e: any) => setSha(e.target.value)} />
        </div>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !selectedRepo ? <Empty msg="Select a repository" /> : (
          <Panel>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['SHA', 'Message', 'Author', 'Date', ''].map(h => (
                    <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commits.map((c: any) => (
                  <tr key={c.sha} className="border-b border-[var(--border)] hover:bg-[var(--glass)] transition-colors">
                    <td className="px-4 py-2.5">
                      <a href={c.html_url} target="_blank" className="text-[var(--blue)] font-mono text-[0.72rem] hover:underline">{c.sha.slice(0, 7)}</a>
                    </td>
                    <td className="px-4 py-2.5 max-w-[340px]">
                      <p className="text-[0.75rem] text-[var(--text)] truncate">{c.commit.message.split('\n')[0]}</p>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text2)] text-[0.72rem]">{c.commit.author.name}</td>
                    <td className="px-4 py-2.5 text-[var(--text3)] text-[0.68rem]">{timeSince(c.commit.author.date)}</td>
                    <td className="px-4 py-2.5">
                      <Btn size="xs" onClick={() => copy(c.sha)}><Copy size={10} /></Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── BRANCHES TAB ───────────────────────────────────────────────────────────
function BranchesTab({ api, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState(LS.get('branches_repo', ''))
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ branch: '', from: 'main' })

  useEffect(() => { api('/repos?per_page=100').then(setRepos).catch(() => {}) }, [api])

  const load = useCallback(() => {
    if (!selectedRepo) return
    LS.set('branches_repo', selectedRepo)
    setLoading(true)
    api(`/repos/${selectedRepo}/branches`).then(setBranches).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [selectedRepo, api])

  useEffect(() => { load() }, [load])

  async function createBranch() {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/branches`, { method: 'POST', body: form })
      showToast(`Branch ${form.branch} created!`, 'success')
      setShowCreate(false)
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function deleteBranch(branch: string) {
    const [owner, repo] = selectedRepo.split('/')
    if (!confirm(`Delete branch ${branch}?`)) return
    try {
      await api(`/repos/${owner}/${repo}/branches`, { method: 'DELETE', body: { branch } })
      showToast('Branch deleted', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Branches" sub="Manage repository branches"
        actions={
          <>
            <RepoSelector repos={repos} value={selectedRepo} onChange={setSelectedRepo} />
            {selectedRepo && <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={12} />New Branch</Btn>}
          </>
        }
      />
      <div className="p-6 space-y-4">
        {showCreate && (
          <Panel title="Create Branch">
            <div className="p-4 flex gap-4 flex-wrap">
              <Input label="Branch Name" value={form.branch} onChange={(e: any) => setForm({ ...form, branch: e.target.value })} placeholder="feature/my-feature" />
              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] text-[var(--text2)] tracking-widest uppercase">From Branch</label>
                <select value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)]">
                  {branches.map((b: any) => <option key={b.name} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Btn variant="primary" onClick={createBranch}>Create</Btn>
                <Btn onClick={() => setShowCreate(false)}>Cancel</Btn>
              </div>
            </div>
          </Panel>
        )}
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !selectedRepo ? <Empty msg="Select a repository" /> : (
          <Panel>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Branch', 'SHA', 'Protected', ''].map(h => (
                    <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branches.map((b: any) => (
                  <tr key={b.name} className="border-b border-[var(--border)] hover:bg-[var(--glass)] group">
                    <td className="px-4 py-2.5">
                      <span className="text-[0.78rem] text-[var(--text)] flex items-center gap-1.5">
                        <GitBranch size={12} className="text-[var(--green)]" />
                        {b.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[0.68rem] text-[var(--blue)] font-mono">{b.commit.sha.slice(0, 7)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {b.protected
                        ? <span className="badge badge-orange"><Shield size={8} /> Protected</span>
                        : <span className="badge badge-gray">Open</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100">
                        <Btn size="xs" onClick={() => copy(b.name)}><Copy size={10} /></Btn>
                        {!b.protected && <Btn size="xs" variant="danger" onClick={() => deleteBranch(b.name)}><Trash2 size={10} /></Btn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── ISSUES TAB ─────────────────────────────────────────────────────────────
function IssuesTab({ api, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState(LS.get('issues_repo', ''))
  const [issues, setIssues] = useState<any[]>([])
  const [state, setState] = useState('open')
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', labels: '', assignees: '' })

  useEffect(() => { api('/repos?per_page=100').then(setRepos).catch(() => {}) }, [api])

  const load = useCallback(() => {
    if (!selectedRepo) return
    LS.set('issues_repo', selectedRepo)
    setLoading(true)
    api(`/repos/${selectedRepo}/issues?state=${state}`).then(setIssues).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [selectedRepo, state, api])

  useEffect(() => { load() }, [load])

  async function createIssue() {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        body: {
          title: form.title, body: form.body,
          labels: form.labels.split(',').map(s => s.trim()).filter(Boolean),
          assignees: form.assignees.split(',').map(s => s.trim()).filter(Boolean),
        }
      })
      showToast('Issue created!', 'success')
      setShowCreate(false)
      setForm({ title: '', body: '', labels: '', assignees: '' })
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function closeIssue(number: number) {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/issues/${number}`, { method: 'PATCH', body: { state: 'closed' } })
      showToast(`#${number} closed`, 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Issues" sub={`${issues.length} issues`}
        actions={
          <>
            <RepoSelector repos={repos} value={selectedRepo} onChange={setSelectedRepo} />
            <select value={state} onChange={e => setState(e.target.value)} className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-2 py-1.5 text-[0.72rem] text-[var(--text2)] outline-none focus:border-[var(--green)]">
              <option value="open">Open</option><option value="closed">Closed</option><option value="all">All</option>
            </select>
            {selectedRepo && <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={12} />New Issue</Btn>}
          </>
        }
      />
      <div className="p-6 space-y-4">
        {showCreate && (
          <Panel title="Create Issue">
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2"><Input label="Title *" value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} placeholder="Issue title" /></div>
              <div className="col-span-2"><Textarea label="Body" value={form.body} onChange={(e: any) => setForm({ ...form, body: e.target.value })} placeholder="Describe the issue..." /></div>
              <Input label="Labels (comma separated)" value={form.labels} onChange={(e: any) => setForm({ ...form, labels: e.target.value })} placeholder="bug, enhancement" />
              <Input label="Assignees (comma separated)" value={form.assignees} onChange={(e: any) => setForm({ ...form, assignees: e.target.value })} placeholder="username" />
              <div className="col-span-2 flex gap-2">
                <Btn variant="primary" onClick={createIssue}>Create Issue</Btn>
                <Btn onClick={() => setShowCreate(false)}>Cancel</Btn>
              </div>
            </div>
          </Panel>
        )}
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !selectedRepo ? <Empty msg="Select a repository" /> : !issues.length ? <Empty msg="No issues found" /> : (
          <Panel>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['#', 'Title', 'Status', 'Labels', 'Author', 'Created', ''].map(h => (
                    <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map((i: any) => (
                  <tr key={i.id} className="border-b border-[var(--border)] hover:bg-[var(--glass)] group">
                    <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text3)]">#{i.number}</td>
                    <td className="px-4 py-2.5 max-w-[280px]">
                      <a href={i.html_url} target="_blank" className="text-[0.75rem] text-[var(--text)] hover:text-[var(--blue)] truncate block">{i.title}</a>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`badge ${i.state === 'open' ? 'badge-green' : 'badge-gray'}`}>
                        {i.state === 'open' ? <Check size={8} /> : <X size={8} />} {i.state}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {i.labels?.slice(0, 3).map((l: any) => (
                          <span key={l.id} className="badge" style={{ background: `#${l.color}22`, color: `#${l.color}`, borderColor: `#${l.color}44` }}>{l.name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text2)] text-[0.72rem]">{i.user.login}</td>
                    <td className="px-4 py-2.5 text-[var(--text3)] text-[0.68rem]">{timeSince(i.created_at)}</td>
                    <td className="px-4 py-2.5">
                      {i.state === 'open' && (
                        <Btn size="xs" variant="danger" className="opacity-0 group-hover:opacity-100" onClick={() => closeIssue(i.number)}>Close</Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── PULLS TAB ──────────────────────────────────────────────────────────────
function PullsTab({ api, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState(LS.get('pulls_repo', ''))
  const [pulls, setPulls] = useState<any[]>([])
  const [state, setState] = useState('open')
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', head: '', base: 'main', body: '', draft: false })
  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => { api('/repos?per_page=100').then(setRepos).catch(() => {}) }, [api])

  useEffect(() => {
    if (!selectedRepo) return
    api(`/repos/${selectedRepo}/branches`).then(setBranches).catch(() => {})
  }, [selectedRepo, api])

  const load = useCallback(() => {
    if (!selectedRepo) return
    LS.set('pulls_repo', selectedRepo)
    setLoading(true)
    api(`/repos/${selectedRepo}/pulls?state=${state}`).then(setPulls).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [selectedRepo, state, api])

  useEffect(() => { load() }, [load])

  async function mergePR(number: number, method = 'merge') {
    const [owner, repo] = selectedRepo.split('/')
    if (!confirm(`Merge PR #${number}?`)) return
    try {
      await api(`/repos/${owner}/${repo}/pulls/${number}`, { method: 'PUT', body: { merge_method: method } })
      showToast(`PR #${number} merged!`, 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function createPR() {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/pulls`, { method: 'POST', body: form })
      showToast('PR created!', 'success')
      setShowCreate(false)
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Pull Requests" sub={`${pulls.length} PRs`}
        actions={
          <>
            <RepoSelector repos={repos} value={selectedRepo} onChange={setSelectedRepo} />
            <select value={state} onChange={e => setState(e.target.value)} className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-2 py-1.5 text-[0.72rem] text-[var(--text2)] outline-none focus:border-[var(--green)]">
              <option value="open">Open</option><option value="closed">Closed</option><option value="all">All</option>
            </select>
            {selectedRepo && <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={12} />New PR</Btn>}
          </>
        }
      />
      <div className="p-6 space-y-4">
        {showCreate && (
          <Panel title="Create Pull Request">
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2"><Input label="Title *" value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} placeholder="PR title" /></div>
              <div>
                <label className="text-[0.65rem] text-[var(--text2)] tracking-widest uppercase block mb-1">Head Branch *</label>
                <select value={form.head} onChange={e => setForm({ ...form, head: e.target.value })} className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)]">
                  <option value="">Select branch...</option>
                  {branches.map((b: any) => <option key={b.name} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.65rem] text-[var(--text2)] tracking-widest uppercase block mb-1">Base Branch *</label>
                <select value={form.base} onChange={e => setForm({ ...form, base: e.target.value })} className="w-full bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)]">
                  {branches.map((b: any) => <option key={b.name} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div className="col-span-2"><Textarea label="Description" value={form.body} onChange={(e: any) => setForm({ ...form, body: e.target.value })} placeholder="Describe your changes..." /></div>
              <div className="col-span-2 flex gap-2 items-center">
                <Btn variant="primary" onClick={createPR}>Create PR</Btn>
                <Btn onClick={() => setShowCreate(false)}>Cancel</Btn>
                <label className="flex items-center gap-2 cursor-pointer text-[0.72rem] text-[var(--text2)] ml-2">
                  <input type="checkbox" checked={form.draft} onChange={e => setForm({ ...form, draft: e.target.checked })} className="accent-[var(--green)]" />
                  Draft PR
                </label>
              </div>
            </div>
          </Panel>
        )}
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !selectedRepo ? <Empty msg="Select a repository" /> : !pulls.length ? <Empty msg="No pull requests" /> : (
          <Panel>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['#', 'Title', 'Status', 'Branch', 'Author', 'Created', ''].map(h => (
                    <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pulls.map((p: any) => (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--glass)] group">
                    <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text3)]">#{p.number}</td>
                    <td className="px-4 py-2.5 max-w-[240px]">
                      <a href={p.html_url} target="_blank" className="text-[0.75rem] text-[var(--text)] hover:text-[var(--blue)] truncate block">{p.title}</a>
                      {p.draft && <span className="badge badge-gray mt-0.5">Draft</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`badge ${p.state === 'open' ? 'badge-purple' : p.merged_at ? 'badge-blue' : 'badge-gray'}`}>
                        {p.state}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text2)]">{p.head.ref} → {p.base.ref}</td>
                    <td className="px-4 py-2.5 text-[var(--text2)] text-[0.72rem]">{p.user.login}</td>
                    <td className="px-4 py-2.5 text-[var(--text3)] text-[0.68rem]">{timeSince(p.created_at)}</td>
                    <td className="px-4 py-2.5">
                      {p.state === 'open' && (
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100">
                          <Btn size="xs" variant="primary" onClick={() => mergePR(p.number, 'merge')}>Merge</Btn>
                          <Btn size="xs" variant="blue" onClick={() => mergePR(p.number, 'squash')}>Squash</Btn>
                          <Btn size="xs" onClick={() => mergePR(p.number, 'rebase')}>Rebase</Btn>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── RELEASES TAB ───────────────────────────────────────────────────────────
function ReleasesTab({ api, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState(LS.get('releases_repo', ''))
  const [releases, setReleases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ tag_name: '', name: '', body: '', draft: false, prerelease: false, target_commitish: 'main' })

  useEffect(() => { api('/repos?per_page=100').then(setRepos).catch(() => {}) }, [api])

  const load = useCallback(() => {
    if (!selectedRepo) return
    LS.set('releases_repo', selectedRepo)
    setLoading(true)
    api(`/repos/${selectedRepo}/releases`).then(setReleases).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [selectedRepo, api])

  useEffect(() => { load() }, [load])

  async function createRelease() {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/releases`, { method: 'POST', body: form })
      showToast('Release created!', 'success')
      setShowCreate(false)
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Releases" sub="Manage releases and tags"
        actions={
          <>
            <RepoSelector repos={repos} value={selectedRepo} onChange={setSelectedRepo} />
            {selectedRepo && <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={12} />New Release</Btn>}
          </>
        }
      />
      <div className="p-6 space-y-4">
        {showCreate && (
          <Panel title="Create Release">
            <div className="p-4 grid grid-cols-2 gap-4">
              <Input label="Tag Name *" value={form.tag_name} onChange={(e: any) => setForm({ ...form, tag_name: e.target.value })} placeholder="v1.0.0" />
              <Input label="Release Name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Release v1.0.0" />
              <Input label="Target Branch/SHA" value={form.target_commitish} onChange={(e: any) => setForm({ ...form, target_commitish: e.target.value })} placeholder="main" />
              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-[0.72rem] text-[var(--text2)]">
                  <input type="checkbox" checked={form.draft} onChange={e => setForm({ ...form, draft: e.target.checked })} className="accent-[var(--green)]" /> Draft
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[0.72rem] text-[var(--text2)]">
                  <input type="checkbox" checked={form.prerelease} onChange={e => setForm({ ...form, prerelease: e.target.checked })} className="accent-[var(--green)]" /> Pre-release
                </label>
              </div>
              <div className="col-span-2"><Textarea label="Release Notes" value={form.body} onChange={(e: any) => setForm({ ...form, body: e.target.value })} placeholder="What's new in this release..." /></div>
              <div className="col-span-2 flex gap-2">
                <Btn variant="primary" onClick={createRelease}>Create Release</Btn>
                <Btn onClick={() => setShowCreate(false)}>Cancel</Btn>
              </div>
            </div>
          </Panel>
        )}
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !selectedRepo ? <Empty msg="Select a repository" /> : !releases.length ? <Empty msg="No releases yet" /> : (
          <div className="space-y-3">
            {releases.map((r: any) => (
              <Panel key={r.id}>
                <div className="p-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <a href={r.html_url} target="_blank" className="text-[0.85rem] font-semibold text-[var(--text)] hover:text-[var(--blue)]">{r.name || r.tag_name}</a>
                      <span className="badge badge-green text-[0.6rem]">{r.tag_name}</span>
                      {r.draft && <span className="badge badge-yellow">Draft</span>}
                      {r.prerelease && <span className="badge badge-orange">Pre-release</span>}
                    </div>
                    <p className="text-[0.68rem] text-[var(--text3)]">by {r.author.login} · {timeSince(r.created_at)}</p>
                    {r.body && <p className="text-[0.72rem] text-[var(--text2)] mt-2 max-w-xl line-clamp-2">{r.body}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Btn size="xs" onClick={() => window.open(r.html_url, '_blank')}><ExternalLink size={10} /></Btn>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ACTIONS TAB ────────────────────────────────────────────────────────────
function ActionsTab({ api, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState(LS.get('actions_repo', ''))
  const [workflows, setWorkflows] = useState<any[]>([])
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null)

  useEffect(() => { api('/repos?per_page=100').then(setRepos).catch(() => {}) }, [api])

  useEffect(() => {
    if (!selectedRepo) return
    LS.set('actions_repo', selectedRepo)
    setLoading(true)
    const [o, r] = selectedRepo.split('/')
    Promise.all([
      api(`/repos/${o}/${r}/actions`),
      api(`/repos/${o}/${r}/actions?runs=1`)
    ]).then(([wf, r]) => {
      setWorkflows(wf.workflows || [])
      setRuns(r.workflow_runs || [])
    }).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [selectedRepo, api])

  const statusColor: any = { completed: 'badge-gray', success: 'badge-green', failure: 'badge-red', in_progress: 'badge-blue', queued: 'badge-yellow', cancelled: 'badge-gray' }

  async function triggerWorkflow(workflowId: string) {
    const [owner, repo] = selectedRepo.split('/')
    const ref = prompt('Branch to trigger on:', 'main')
    if (!ref) return
    try {
      await api(`/repos/${owner}/${repo}/actions`, { method: 'POST', body: { workflow_id: workflowId, ref } })
      showToast('Workflow triggered!', 'success')
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function cancelRun(runId: number) {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/actions`, { method: 'POST', body: { action: 'cancel', run_id: runId } })
      showToast('Run cancelled', 'success')
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function rerunRun(runId: number) {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/actions`, { method: 'POST', body: { action: 'rerun', run_id: runId } })
      showToast('Re-running...', 'success')
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="GitHub Actions" sub="Manage workflows and runs"
        actions={<RepoSelector repos={repos} value={selectedRepo} onChange={setSelectedRepo} />}
      />
      <div className="p-6 space-y-5">
        {!selectedRepo ? <Empty msg="Select a repository" /> : loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <>
            {workflows.length > 0 && (
              <Panel title="Workflows">
                <table className="w-full">
                  <thead><tr className="border-b border-[var(--border)]">
                    {['Workflow', 'State', ''].map(h => <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {workflows.map((w: any) => (
                      <tr key={w.id} className="border-b border-[var(--border)] hover:bg-[var(--glass)] group">
                        <td className="px-4 py-2.5">
                          <div className="text-[0.75rem] text-[var(--text)]">{w.name}</div>
                          <div className="text-[0.65rem] text-[var(--text3)]">{w.path}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`badge ${w.state === 'active' ? 'badge-green' : 'badge-gray'}`}>{w.state}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Btn size="xs" variant="primary" className="opacity-0 group-hover:opacity-100" onClick={() => triggerWorkflow(String(w.id))}>
                            <Play size={10} /> Trigger
                          </Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            )}

            <Panel title="Recent Runs">
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border)]">
                  {['#', 'Workflow', 'Branch', 'Status', 'Conclusion', 'Duration', ''].map(h => (
                    <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {runs.map((r: any) => (
                    <tr key={r.id} className="border-b border-[var(--border)] hover:bg-[var(--glass)] group">
                      <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text3)]">#{r.run_number}</td>
                      <td className="px-4 py-2.5 text-[0.75rem] text-[var(--text)]">{r.name}</td>
                      <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text2)]">{r.head_branch}</td>
                      <td className="px-4 py-2.5">
                        <span className={`badge ${statusColor[r.status] || 'badge-gray'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {r.conclusion && <span className={`badge ${statusColor[r.conclusion] || 'badge-gray'}`}>{r.conclusion}</span>}
                      </td>
                      <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text3)]">{timeSince(r.created_at)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100">
                          {r.status === 'in_progress' && <Btn size="xs" variant="danger" onClick={() => cancelRun(r.id)}>Cancel</Btn>}
                          {r.status === 'completed' && <Btn size="xs" onClick={() => rerunRun(r.id)}>Re-run</Btn>}
                          <Btn size="xs" onClick={() => window.open(r.html_url, '_blank')}><ExternalLink size={10} /></Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </>
        )}
      </div>
    </div>
  )
}

// ── WEBHOOKS TAB ───────────────────────────────────────────────────────────
function WebhooksTab({ api, showToast }: any) {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState(LS.get('webhooks_repo', ''))
  const [hooks, setHooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ url: '', events: 'push, pull_request, issues', secret: '' })

  useEffect(() => { api('/repos?per_page=100').then(setRepos).catch(() => {}) }, [api])

  const load = useCallback(() => {
    if (!selectedRepo) return
    LS.set('webhooks_repo', selectedRepo)
    setLoading(true)
    const [o, r] = selectedRepo.split('/')
    api(`/repos/${o}/${r}/webhooks`).then(setHooks).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [selectedRepo, api])

  useEffect(() => { load() }, [load])

  async function createWebhook() {
    const [owner, repo] = selectedRepo.split('/')
    const events = form.events.split(',').map(s => s.trim()).filter(Boolean)
    try {
      await api(`/repos/${owner}/${repo}/webhooks`, { method: 'POST', body: { url: form.url, events, secret: form.secret || undefined } })
      showToast('Webhook created!', 'success')
      setShowCreate(false)
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function deleteWebhook(hookId: number) {
    const [owner, repo] = selectedRepo.split('/')
    if (!confirm('Delete this webhook?')) return
    try {
      await api(`/repos/${owner}/${repo}/webhooks`, { method: 'POST', body: { action: 'delete', hook_id: hookId } })
      showToast('Deleted', 'success')
      load()
    } catch (e: any) { showToast(e.message, 'error') }
  }

  async function pingWebhook(hookId: number) {
    const [owner, repo] = selectedRepo.split('/')
    try {
      await api(`/repos/${owner}/${repo}/webhooks`, { method: 'POST', body: { action: 'ping', hook_id: hookId } })
      showToast('Ping sent!', 'success')
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Webhooks" sub="Manage repo webhooks"
        actions={
          <>
            <RepoSelector repos={repos} value={selectedRepo} onChange={setSelectedRepo} />
            {selectedRepo && <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={12} />Add Webhook</Btn>}
          </>
        }
      />
      <div className="p-6 space-y-4">
        <div className="bg-[var(--bg2)] border border-[rgba(56,189,248,0.2)] rounded-[var(--radius)] p-3 text-[0.72rem] text-[var(--blue)]">
          <span className="font-semibold">Receiver URL: </span>
          <code>{process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/receive</code>
          <Btn size="xs" className="ml-2" onClick={() => copy(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/receive`)}><Copy size={10} /></Btn>
        </div>

        {showCreate && (
          <Panel title="Add Webhook">
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2"><Input label="Payload URL *" value={form.url} onChange={(e: any) => setForm({ ...form, url: e.target.value })} placeholder="https://your-server.com/webhook" /></div>
              <Input label="Events (comma separated)" value={form.events} onChange={(e: any) => setForm({ ...form, events: e.target.value })} placeholder="push, pull_request, issues" />
              <Input label="Secret (optional)" type="password" value={form.secret} onChange={(e: any) => setForm({ ...form, secret: e.target.value })} placeholder="webhook secret" />
              <div className="col-span-2 flex gap-2">
                <Btn variant="primary" onClick={createWebhook}>Add Webhook</Btn>
                <Btn onClick={() => setShowCreate(false)}>Cancel</Btn>
              </div>
            </div>
          </Panel>
        )}

        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !selectedRepo ? <Empty msg="Select a repository" /> : !hooks.length ? <Empty msg="No webhooks configured" /> : (
          <Panel>
            {hooks.map((h: any, i: number) => (
              <div key={h.id} className={`flex items-start justify-between p-4 ${i < hooks.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.78rem] text-[var(--blue)] break-all">{h.config.url}</span>
                    <span className={`badge ${h.active ? 'badge-green' : 'badge-red'}`}>{h.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="text-[0.65rem] text-[var(--text3)]">Events: {h.events.join(', ')}</div>
                  <div className="text-[0.62rem] text-[var(--text3)] mt-0.5">ID: {h.id} · {h.config.content_type}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <Btn size="xs" variant="blue" onClick={() => pingWebhook(h.id)}>Ping</Btn>
                  <Btn size="xs" variant="danger" onClick={() => deleteWebhook(h.id)}><Trash2 size={10} /></Btn>
                </div>
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── SEARCH TAB ─────────────────────────────────────────────────────────────
function SearchTab({ api, showToast }: any) {
  const [q, setQ] = useState('')
  const [type, setType] = useState('repos')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function doSearch() {
    if (!q.trim()) return
    setLoading(true)
    try {
      const data = await api(`/search?q=${encodeURIComponent(q)}&type=${type}`)
      setResults(data)
    } catch (e: any) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const items = results?.items || []

  return (
    <div className="fade-in">
      <PageHeader title="Search GitHub" sub="Search repos, code, issues, users" />
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <select value={type} onChange={e => setType(e.target.value)} className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--green)] text-[0.78rem]">
            <option value="repos">Repositories</option>
            <option value="issues">Issues & PRs</option>
            <option value="code">Code</option>
            <option value="users">Users</option>
          </select>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder={`Search ${type}...`}
            className="flex-1 bg-[var(--bg3)] border border-[var(--border2)] rounded px-4 py-2 text-[var(--text)] outline-none focus:border-[var(--green)] placeholder-[var(--text3)]"
          />
          <Btn variant="primary" onClick={doSearch} size="md"><Search size={13} />Search</Btn>
        </div>

        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : results && (
          <Panel title={`${results.total_count?.toLocaleString()} results`}>
            <table className="w-full">
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id || item.sha} className="border-b border-[var(--border)] hover:bg-[var(--glass)] last:border-0">
                    <td className="px-4 py-3">
                      {type === 'repos' && (
                        <div>
                          <a href={item.html_url} target="_blank" className="text-[var(--blue)] hover:underline font-medium text-[0.78rem]">{item.full_name}</a>
                          <p className="text-[0.65rem] text-[var(--text2)] mt-0.5 truncate max-w-xl">{item.description}</p>
                          <div className="flex gap-3 mt-1 text-[0.62rem] text-[var(--text3)]">
                            <span>★ {item.stargazers_count}</span>
                            {item.language && <span>◉ {item.language}</span>}
                          </div>
                        </div>
                      )}
                      {type === 'issues' && (
                        <div>
                          <a href={item.html_url} target="_blank" className="text-[var(--text)] hover:text-[var(--blue)] text-[0.75rem]">{item.title}</a>
                          <p className="text-[0.62rem] text-[var(--text3)] mt-0.5">{item.repository_url?.split('/').slice(-2).join('/')} · {item.user.login}</p>
                        </div>
                      )}
                      {type === 'code' && (
                        <div>
                          <a href={item.html_url} target="_blank" className="text-[var(--blue)] hover:underline text-[0.75rem]">{item.path}</a>
                          <p className="text-[0.62rem] text-[var(--text3)] mt-0.5">{item.repository.full_name}</p>
                        </div>
                      )}
                      {type === 'users' && (
                        <div className="flex items-center gap-3">
                          <img src={item.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                          <a href={item.html_url} target="_blank" className="text-[var(--blue)] hover:underline text-[0.75rem]">{item.login}</a>
                          <span className="badge badge-gray">{item.type}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Btn size="xs" onClick={() => window.open(item.html_url, '_blank')}><ExternalLink size={10} /></Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── STARS TAB ──────────────────────────────────────────────────────────────
function StarsTab({ api, showToast }: any) {
  const [stars, setStars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/stars').then(setStars).catch(() => showToast('Failed to load stars', 'error')).finally(() => setLoading(false))
  }, [api])

  async function unstar(owner: string, repo: string) {
    try {
      await api('/stars', { method: 'POST', body: { owner, repo, action: 'unstar' } })
      showToast('Unstarred', 'success')
      setStars(prev => prev.filter(r => r.full_name !== `${owner}/${repo}`))
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Starred Repos" sub={`${stars.length} starred`} actions={<Btn onClick={() => api('/stars').then(setStars)}><RefreshCw size={12} /></Btn>} />
      <div className="p-6">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <Panel>
            <table className="w-full">
              <thead><tr className="border-b border-[var(--border)]">
                {['Repository', 'Language', 'Stars', 'Updated', ''].map(h => (
                  <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(stars as any[]).map((r: any) => (
                  <tr key={r.id} className="border-b border-[var(--border)] hover:bg-[var(--glass)] group">
                    <td className="px-4 py-2.5">
                      <a href={r.html_url} target="_blank" className="text-[var(--blue)] hover:underline text-[0.78rem]">{r.full_name}</a>
                      {r.description && <p className="text-[0.62rem] text-[var(--text3)] truncate max-w-[300px]">{r.description}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-[0.72rem] text-[var(--text2)]">{r.language || '—'}</td>
                    <td className="px-4 py-2.5 text-[0.72rem] text-[var(--yellow)]">★ {r.stargazers_count}</td>
                    <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text3)]">{timeSince(r.updated_at)}</td>
                    <td className="px-4 py-2.5">
                      <Btn size="xs" variant="danger" className="opacity-0 group-hover:opacity-100" onClick={() => unstar(r.owner.login, r.name)}>
                        <Star size={10} />Unstar
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── GISTS TAB ──────────────────────────────────────────────────────────────
function GistsTab({ api, showToast }: any) {
  const [gists, setGists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ description: '', filename: 'file.txt', content: '', public: false })

  useEffect(() => { api('/gists').then(setGists).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false)) }, [api])

  async function createGist() {
    try {
      await api('/gists', { method: 'POST', body: { description: form.description, files: { [form.filename]: { content: form.content } }, public: form.public } })
      showToast('Gist created!', 'success')
      setShowCreate(false)
      api('/gists').then(setGists)
    } catch (e: any) { showToast(e.message, 'error') }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Gists" sub={`${gists.length} gists`} actions={<Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={12} />New Gist</Btn>} />
      <div className="p-6 space-y-4">
        {showCreate && (
          <Panel title="Create Gist">
            <div className="p-4 grid grid-cols-2 gap-4">
              <Input label="Description" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder="What does this gist do?" />
              <Input label="Filename" value={form.filename} onChange={(e: any) => setForm({ ...form, filename: e.target.value })} placeholder="file.js" />
              <div className="col-span-2"><Textarea label="Content *" value={form.content} onChange={(e: any) => setForm({ ...form, content: e.target.value })} placeholder="Your code here..." /></div>
              <div className="col-span-2 flex items-center gap-4">
                <Btn variant="primary" onClick={createGist}>Create Gist</Btn>
                <Btn onClick={() => setShowCreate(false)}>Cancel</Btn>
                <label className="flex items-center gap-2 cursor-pointer text-[0.72rem] text-[var(--text2)]">
                  <input type="checkbox" checked={form.public} onChange={e => setForm({ ...form, public: e.target.checked })} className="accent-[var(--green)]" /> Public
                </label>
              </div>
            </div>
          </Panel>
        )}
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <Panel>
            <table className="w-full">
              <tbody>
                {gists.map((g: any) => (
                  <tr key={g.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--glass)]">
                    <td className="px-4 py-3">
                      <a href={g.html_url} target="_blank" className="text-[var(--blue)] hover:underline text-[0.75rem]">
                        {Object.keys(g.files)[0]}
                      </a>
                      <p className="text-[0.65rem] text-[var(--text3)] mt-0.5">{g.description || 'No description'}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`badge ${g.public ? 'badge-green' : 'badge-gray'}`}>{g.public ? 'Public' : 'Secret'}</span>
                        <span className="text-[0.65rem] text-[var(--text3)]">{timeSince(g.updated_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── NOTIFICATIONS TAB ──────────────────────────────────────────────────────
function NotificationsTab({ api, showToast }: any) {
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => { setLoading(true); api('/notifications').then(setNotifs).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false)) }

  useEffect(() => { load() }, [api])

  async function markAllRead() {
    try {
      await api('/notifications', { method: 'POST', body: { action: 'mark_read' } })
      showToast('All notifications marked as read', 'success')
      setNotifs([])
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const typeColor: any = { Issue: 'badge-orange', PullRequest: 'badge-purple', Release: 'badge-blue', Discussion: 'badge-green' }

  return (
    <div className="fade-in">
      <PageHeader title="Notifications" sub={`${notifs.length} unread`}
        actions={
          <>
            <Btn onClick={load}><RefreshCw size={12} /></Btn>
            {notifs.length > 0 && <Btn variant="primary" onClick={markAllRead}><Check size={12} />Mark All Read</Btn>}
          </>
        }
      />
      <div className="p-6">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !notifs.length ? <Empty msg="All caught up! No unread notifications." /> : (
          <Panel>
            <table className="w-full">
              <tbody>
                {notifs.map((n: any) => (
                  <tr key={n.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--glass)]">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className={`badge ${typeColor[n.subject.type] || 'badge-gray'} mt-0.5 flex-shrink-0`}>{n.subject.type}</span>
                        <div>
                          <p className="text-[0.75rem] text-[var(--text)]">{n.subject.title}</p>
                          <p className="text-[0.62rem] text-[var(--text3)] mt-0.5">{n.repository.full_name} · {timeSince(n.updated_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[0.65rem] text-[var(--text3)]">{n.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── JOBS TAB ───────────────────────────────────────────────────────────────
function JobsTab({ api, showToast }: any) {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [showEnqueue, setShowEnqueue] = useState(false)
  const [form, setForm] = useState({ type: 'sync_repos', owner: '', repo: '', branch: '', from: '', title: '', tag: '' })

  const load = useCallback(() => {
    setLoading(true)
    const q = status ? `?status=${status}` : ''
    fetch(`/api/github/jobs${q}`).then(r => r.json()).then(d => setJobs(d.data || [])).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [status])

  useEffect(() => { load() }, [load])

  async function enqueue() {
    try {
      const { type, ...rest } = form
      const body: any = { type }
      if (form.owner) body.owner = form.owner
      if (form.repo) body.repo = form.repo
      if (form.branch) body.branch = form.branch
      if (form.from) body.from = form.from
      if (form.title) body.title = form.title
      if (form.tag) body.tag = form.tag
      await api('/jobs', { method: 'POST', body })
      showToast('Job enqueued!', 'success')
      setShowEnqueue(false)
      setTimeout(load, 1000)
    } catch (e: any) { showToast(e.message, 'error') }
  }

  const statusColor: any = { pending: 'badge-yellow', active: 'badge-blue', completed: 'badge-green', failed: 'badge-red' }

  return (
    <div className="fade-in">
      <PageHeader title="Job Queue" sub="BullMQ background jobs"
        actions={
          <>
            <select value={status} onChange={e => setStatus(e.target.value)} className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-2 py-1.5 text-[0.72rem] text-[var(--text2)] outline-none">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <Btn onClick={load}><RefreshCw size={12} /></Btn>
            <Btn variant="primary" onClick={() => setShowEnqueue(true)}><Plus size={12} />Enqueue Job</Btn>
          </>
        }
      />
      <div className="p-6 space-y-4">
        {showEnqueue && (
          <Panel title="Enqueue Job">
            <div className="p-4 grid grid-cols-3 gap-4">
              <Select label="Job Type" value={form.type} onChange={(e: any) => setForm({ ...form, type: e.target.value })}>
                <option value="sync_repos">Sync Repos</option>
                <option value="create_branch">Create Branch</option>
                <option value="delete_branch">Delete Branch</option>
                <option value="close_issue">Close Issue</option>
                <option value="merge_pr">Merge PR</option>
                <option value="create_release">Create Release</option>
                <option value="fork_repo">Fork Repo</option>
                <option value="star_repo">Star Repo</option>
                <option value="unstar_repo">Unstar Repo</option>
              </Select>
              {['create_branch','delete_branch','close_issue','merge_pr','create_release','fork_repo','star_repo','unstar_repo'].includes(form.type) && (
                <>
                  <Input label="Owner" value={form.owner} onChange={(e: any) => setForm({ ...form, owner: e.target.value })} placeholder="owner" />
                  <Input label="Repo" value={form.repo} onChange={(e: any) => setForm({ ...form, repo: e.target.value })} placeholder="repo-name" />
                </>
              )}
              {form.type === 'create_branch' && (
                <>
                  <Input label="New Branch" value={form.branch} onChange={(e: any) => setForm({ ...form, branch: e.target.value })} placeholder="feature/x" />
                  <Input label="From Branch" value={form.from} onChange={(e: any) => setForm({ ...form, from: e.target.value })} placeholder="main" />
                </>
              )}
              {form.type === 'create_release' && (
                <Input label="Tag" value={form.tag} onChange={(e: any) => setForm({ ...form, tag: e.target.value })} placeholder="v1.0.0" />
              )}
              <div className="flex items-end gap-2">
                <Btn variant="primary" onClick={enqueue}>Enqueue</Btn>
                <Btn onClick={() => setShowEnqueue(false)}>Cancel</Btn>
              </div>
            </div>
          </Panel>
        )}

        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !jobs.length ? <Empty msg="No jobs found" /> : (
          <Panel>
            <table className="w-full">
              <thead><tr className="border-b border-[var(--border)]">
                {['Job ID', 'Type', 'Queue', 'Status', 'Created', 'Duration'].map(h => (
                  <th key={h} className="text-left text-[0.62rem] text-[var(--text3)] tracking-widest uppercase px-4 py-2">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {jobs.map((j: any) => (
                  <tr key={j._id} className="border-b border-[var(--border)] hover:bg-[var(--glass)]">
                    <td className="px-4 py-2.5 font-mono text-[0.65rem] text-[var(--text3)]">{j.jobId?.slice(0, 8)}</td>
                    <td className="px-4 py-2.5 text-[0.72rem] text-[var(--text)]">{j.type}</td>
                    <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text2)]">{j.queue}</td>
                    <td className="px-4 py-2.5"><span className={`badge ${statusColor[j.status] || 'badge-gray'}`}>{j.status}</span></td>
                    <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text3)]">{timeSince(j.createdAt)}</td>
                    <td className="px-4 py-2.5 text-[0.68rem] text-[var(--text3)]">
                      {j.finishedAt && j.startedAt ? `${((new Date(j.finishedAt).getTime() - new Date(j.startedAt).getTime()) / 1000).toFixed(1)}s` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  )
}

// ── EVENTS TAB ─────────────────────────────────────────────────────────────
function EventsTab({ api, showToast }: any) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const q = filter ? `?event=${filter}` : ''
    fetch(`/api/webhooks/events${q}`).then(r => r.json()).then(d => setEvents(d.data || [])).catch(() => showToast('Failed', 'error')).finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  const [expanded, setExpanded] = useState<string | null>(null)

  const eventColor: any = { push: 'badge-green', pull_request: 'badge-purple', issues: 'badge-orange', release: 'badge-blue', create: 'badge-cyan', delete: 'badge-red', star: 'badge-yellow' }

  return (
    <div className="fade-in">
      <PageHeader title="Webhook Events" sub="Incoming events stored in MongoDB"
        actions={
          <>
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by event type..." className="bg-[var(--bg3)] border border-[var(--border2)] rounded px-3 py-1.5 text-[0.72rem] text-[var(--text)] outline-none focus:border-[var(--green)] placeholder-[var(--text3)]" />
            <Btn onClick={load}><RefreshCw size={12} /></Btn>
          </>
        }
      />
      <div className="p-6">
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : !events.length ? <Empty msg="No webhook events yet. Set up a webhook and trigger some events." /> : (
          <Panel>
            {events.map((e: any, i: number) => (
              <div key={e._id} className={`${i < events.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--glass)]"
                  onClick={() => setExpanded(expanded === e._id ? null : e._id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`badge ${eventColor[e.event] || 'badge-gray'}`}>{e.event}</span>
                    <span className="text-[0.72rem] text-[var(--text)]">{e.repository || 'unknown'}</span>
                    {e.action && <span className="text-[0.65rem] text-[var(--text3)]">action: {e.action}</span>}
                    {e.sender && <span className="text-[0.65rem] text-[var(--text3)]">by {e.sender}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[0.65rem] text-[var(--text3)]">{timeSince(e.receivedAt)}</span>
                    {expanded === e._id ? <ChevronDown size={12} className="text-[var(--text3)]" /> : <ChevronRight size={12} className="text-[var(--text3)]" />}
                  </div>
                </div>
                {expanded === e._id && (
                  <div className="px-4 pb-4">
                    <pre className="bg-[var(--bg3)] border border-[var(--border)] rounded p-3 text-[0.65rem] text-[var(--text2)] overflow-auto max-h-80">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  )
}
