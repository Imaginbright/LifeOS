"use client";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { socialSnapshots, socialAccounts } from "@/lib/mock-data";
import { number } from "@/lib/utils";
import type { Platform } from "@/lib/types";
const periods = { "7D": 7, "30D": 30, "3M": 90, "6M": 180, "1Y": 365 };
const colors: Record<Platform, string> = {
  tiktok: "#245B3D",
  instagram: "#a58baf",
  youtube: "#c69b66",
};
export function AudienceChart() {
  const [period, setPeriod] = useState<keyof typeof periods>("30D");
  const [visible, setVisible] = useState<Platform[]>([
    "tiktok",
    "instagram",
    "youtube",
  ]);
  const data = useMemo(() => {
    const dates = [...new Set(socialSnapshots.map((item) => item.date))].slice(
      -periods[period],
    );
    return dates.map((date) => {
      const snapshots = socialSnapshots.filter((item) => item.date === date);
      return {
        date,
        ...Object.fromEntries(
          snapshots.map((item) => [item.platform, item.followers]),
        ),
      };
    });
  }, [period]);
  return (
    <section className="card audience-chart">
      <div className="chart-heading">
        <div>
          <h2>Audience growth</h2>
          <p className="section-subtitle">The people following your journey.</p>
        </div>
        <div
          className="tabs small-tabs"
          role="group"
          aria-label="Audience period"
        >
          {Object.keys(periods).map((value) => (
            <button
              key={value}
              aria-pressed={value === period}
              data-state={value === period ? "active" : "inactive"}
              onClick={() => setPeriod(value as keyof typeof periods)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        {socialAccounts.map((account) => (
          <button
            key={account.id}
            className={
              visible.includes(account.platform) ? "" : "muted-platform"
            }
            aria-pressed={visible.includes(account.platform)}
            onClick={() =>
              setVisible((items) =>
                items.includes(account.platform)
                  ? items.length > 1
                    ? items.filter((item) => item !== account.platform)
                    : items
                  : [...items, account.platform],
              )
            }
          >
            <i style={{ background: colors[account.platform] }} />
            {account.displayName}
          </button>
        ))}
      </div>
      <div
        className="chart-container"
        role="img"
        aria-label={`Historical follower totals over ${periods[period]} days. TikTok ends at 31,428, Instagram at 4,829 and YouTube at 2,941.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 12, left: -15, bottom: 5 }}
            accessibilityLayer
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                format(parseISO(String(value)), "MMM d")
              }
              minTickGap={45}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              dy={12}
            />
            <YAxis
              domain={visible.length === 1 ? ["auto", "auto"] : [0, "auto"]}
              tickFormatter={(value) => `${Number(value) / 1000}k`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(value) =>
                format(parseISO(String(value)), "MMMM d, yyyy")
              }
              formatter={(value, name) => [
                number(Number(value)),
                socialAccounts.find((account) => account.platform === name)
                  ?.displayName ?? String(name),
              ]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                fontSize: 12,
                color: "var(--foreground)",
              }}
            />
            {visible.map((platform) => (
              <Line
                key={platform}
                dataKey={platform}
                type="monotone"
                stroke={colors[platform]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <span>Follower totals · sample history</span>
        <span>Through September 20, 2026</span>
      </div>
    </section>
  );
}
