"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  Shield,
  Zap,
  Database,
  X,
  Terminal,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { setToken, isAuthenticated } = useAuth();
  const [val, setVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  async function connect() {
    if (!val.trim()) return;
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${val.trim()}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!res.ok) {
        throw new Error("Invalid token or missing scopes");
      }

      setToken(val.trim());
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Failed to validate token");
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
              rel="noopener noreferrer"
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
              { icon: Database, label: "MongoDB logs" },
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

          <Link
            href="/"
            style={{
              marginTop: 14,
              display: "inline-block",
              fontSize: 12,
              color: "var(--text-tertiary)",
            }}
          >
            ← Back to home
          </Link>

          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-around",
              gap: 10,
            }}
          >
            <Link
              href="/docs"
              style={{ fontSize: 12, color: "var(--text-secondary)" }}
            >
              Docs
            </Link>
            <Link
              href="/help"
              style={{ fontSize: 12, color: "var(--text-secondary)" }}
            >
              Help
            </Link>
            <Link
              href="/privacy"
              style={{ fontSize: 12, color: "var(--text-secondary)" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{ fontSize: 12, color: "var(--text-secondary)" }}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
