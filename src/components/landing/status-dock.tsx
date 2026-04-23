"use client";

import { useEffect, useState } from "react";
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Cpu,
  Database,
  Globe,
  Server,
  Wifi,
} from "lucide-react";

type HealthState = {
  ok: boolean;
  server?: { ok?: boolean };
  redis?: { ok?: boolean; reason?: string; reachable?: boolean };
  database?: { ok?: boolean; reason?: string; connected?: boolean };
};

type BatteryState = {
  supported: boolean;
  charging: boolean | null;
  level: number | null;
};

type BatteryLike = {
  charging: boolean;
  level: number;
  addEventListener: (
    event: "chargingchange" | "levelchange",
    cb: () => void,
  ) => void;
  removeEventListener: (
    event: "chargingchange" | "levelchange",
    cb: () => void,
  ) => void;
};

function formatPercent(level: number | null) {
  if (typeof level !== "number" || !Number.isFinite(level)) return null;
  const value = Math.max(0, Math.min(100, Math.round(level * 100)));
  return `${value}%`;
}

function BatteryIcon({
  charging,
  level,
  className,
}: {
  charging: boolean | null;
  level: number | null;
  className?: string;
}) {
  if (charging) {
    return (
      <BatteryCharging size={14} aria-hidden="true" className={className} />
    );
  }
  if (typeof level !== "number" || !Number.isFinite(level)) {
    return <BatteryMedium size={14} aria-hidden="true" className={className} />;
  }

  if (level >= 0.85) {
    return <BatteryFull size={14} aria-hidden="true" className={className} />;
  }
  if (level <= 0.2) {
    return <BatteryLow size={14} aria-hidden="true" className={className} />;
  }
  return <BatteryMedium size={14} aria-hidden="true" className={className} />;
}

export default function StatusDock() {
  const [health, setHealth] = useState<HealthState | null>(null);
  const [online, setOnline] = useState(true);
  const [battery, setBattery] = useState<BatteryState>({
    supported: false,
    charging: null,
    level: null,
  });

  useEffect(() => {
    const refreshOnline = () => setOnline(navigator.onLine);
    refreshOnline();

    window.addEventListener("online", refreshOnline);
    window.addEventListener("offline", refreshOnline);

    return () => {
      window.removeEventListener("online", refreshOnline);
      window.removeEventListener("offline", refreshOnline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let batteryManager: BatteryLike | null = null;
    let handleBatteryUpdate: (() => void) | null = null;

    async function syncBattery() {
      if (!("getBattery" in navigator)) {
        if (!cancelled) {
          setBattery({ supported: false, charging: null, level: null });
        }
        return;
      }

      try {
        batteryManager = await (
          navigator as Navigator & {
            getBattery: () => Promise<BatteryLike>;
          }
        ).getBattery();

        handleBatteryUpdate = () => {
          if (cancelled) return;
          const level =
            (
              typeof batteryManager?.level === "number" &&
              Number.isFinite(batteryManager.level)
            ) ?
              batteryManager.level
            : null;

          setBattery({
            supported: true,
            charging:
              typeof batteryManager?.charging === "boolean" ?
                batteryManager.charging
              : null,
            level,
          });
        };

        handleBatteryUpdate();
        batteryManager.addEventListener("chargingchange", handleBatteryUpdate);
        batteryManager.addEventListener("levelchange", handleBatteryUpdate);
      } catch {
        if (!cancelled) {
          setBattery({ supported: false, charging: null, level: null });
        }
      }
    }

    void syncBattery();

    return () => {
      cancelled = true;
      if (batteryManager) {
        if (handleBatteryUpdate) {
          batteryManager.removeEventListener(
            "chargingchange",
            handleBatteryUpdate,
          );
          batteryManager.removeEventListener(
            "levelchange",
            handleBatteryUpdate,
          );
        }
      }
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function refreshHealth() {
      try {
        const response = await fetch("/api/health?format=json", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`health_http_${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("health_non_json_response");
        }

        const json = (await response.json()) as HealthState;
        if (active) setHealth(json);
      } catch {
        if (active) {
          setHealth({
            ok: false,
            server: { ok: true },
            redis: { ok: false, reason: "unreachable" },
            database: { ok: false, reason: "unreachable" },
          });
        }
      }
    }

    void refreshHealth();
    const timer = window.setInterval(refreshHealth, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const redisOk = Boolean(health?.redis?.ok);
  const dbOk = Boolean(health?.database?.ok);
  const serverOk = Boolean(health?.server?.ok ?? health?.ok);
  const batteryPercent = formatPercent(battery.level);

  const onlineLabel = online ? "Online" : "Offline";
  const infraHealthy = serverOk && redisOk && dbOk;
  const batteryHealthy =
    battery.supported && (battery.level == null || battery.level > 0.15);

  return (
    <div className="status-dock" aria-label="System status">
      <div
        className={`status-pill status-pill-connection ${online ? "status-pill-positive" : "status-pill-negative"}`}
      >
        {online ?
          <Wifi size={14} aria-hidden="true" className="status-icon-ok" />
        : <Globe size={14} aria-hidden="true" className="status-icon-bad" />}
        <span
          className={`status-text-lg ${online ? "status-text-good" : "status-text-bad"}`}
        >
          {onlineLabel}
        </span>
      </div>

      <div
        className={`status-pill status-pill-battery ${batteryHealthy ? "status-pill-positive" : "status-pill-negative"}`}
      >
        <BatteryIcon
          charging={battery.charging}
          level={battery.level}
          className={batteryHealthy ? "status-icon-ok" : "status-icon-bad"}
        />
        {batteryPercent && (
          <span className="status-text-lg status-text-muted">
            {batteryPercent}
          </span>
        )}
      </div>

      <div
        className={`status-pill status-pill-infra ${infraHealthy ? "status-pill-positive" : "status-pill-negative"}`}
        aria-label="Server, RAM Redis, ROM Database status"
      >
        <Server
          size={14}
          aria-hidden="true"
          className={serverOk ? "status-icon-ok" : "status-icon-bad"}
        />
        <span className="status-text-lg">Server</span>
        <Cpu
          size={14}
          aria-hidden="true"
          className={redisOk ? "status-icon-ok" : "status-icon-bad"}
        />
        <span className="status-text-lg">RAM</span>
        <Database
          size={14}
          aria-hidden="true"
          className={dbOk ? "status-icon-ok" : "status-icon-bad"}
        />
        <span className="status-text-lg">DB</span>
      </div>
    </div>
  );
}
