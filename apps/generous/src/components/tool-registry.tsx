"use client";

import type { ComponentRenderProps } from "@json-render/react";

// Card Component
export function Card({ element, children }: ComponentRenderProps) {
  const { title, variant, padding } = element.props as {
    title?: string | null;
    variant?: string | null;
    padding?: string | null;
  };

  const paddingMap = { sm: 8, md: 12, lg: 16 };
  const p = paddingMap[(padding as keyof typeof paddingMap) || "md"];

  const baseStyle: React.CSSProperties = {
    borderRadius: 12,
    padding: p,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: { background: "#f5f5f5", border: "1px solid #e0e0e0" },
    gradient: { background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white" },
    outline: { background: "transparent", border: "1px solid #e0e0e0" },
  };

  return (
    <div style={{ ...baseStyle, ...variantStyles[variant || "default"] }}>
      {title && <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>}
      {children}
    </div>
  );
}

// Grid Component
export function Grid({ element, children }: ComponentRenderProps) {
  const { columns, gap } = element.props as {
    columns?: number | null;
    gap?: string | null;
  };

  const gapMap = { sm: 8, md: 12, lg: 16 };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns || 2}, 1fr)`,
        gap: gapMap[(gap as keyof typeof gapMap) || "md"],
      }}
    >
      {children}
    </div>
  );
}

// Stack Component
export function Stack({ element, children }: ComponentRenderProps) {
  const { direction, gap, align } = element.props as {
    direction?: string | null;
    gap?: string | null;
    align?: string | null;
  };

  const gapMap = { sm: 4, md: 8, lg: 12 };
  const alignMap: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "row" : "column",
        gap: gapMap[(gap as keyof typeof gapMap) || "md"],
        alignItems: alignMap[align || "stretch"],
      }}
    >
      {children}
    </div>
  );
}

// Metric Component
export function Metric({ element }: ComponentRenderProps) {
  const { label, value, unit, trend, trendValue, size } = element.props as {
    label: string;
    value: string;
    unit?: string | null;
    trend?: string | null;
    trendValue?: string | null;
    size?: string | null;
  };

  const sizeMap = { sm: 20, md: 28, lg: 36, xl: 48 };
  const fontSize = sizeMap[(size as keyof typeof sizeMap) || "lg"];

  const trendColors: Record<string, string> = {
    up: "#22c55e",
    down: "#ef4444",
    neutral: "#888",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#888", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize, fontWeight: 600 }}>
        {value}
        {unit && (
          <span style={{ fontSize: fontSize * 0.5, marginLeft: 4, opacity: 0.7 }}>{unit}</span>
        )}
      </span>
      {(trend || trendValue) && (
        <span style={{ fontSize: 12, color: trendColors[trend || "neutral"] }}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : ""}
          {trendValue}
        </span>
      )}
    </div>
  );
}

// Sparkline Component
export function Sparkline({ element }: ComponentRenderProps) {
  const { data, color, height } = element.props as {
    data: number[];
    color?: string | null;
    height?: number | null;
  };

  const h = height || 40;
  const colorMap: Record<string, string> = {
    green: "#22c55e",
    red: "#ef4444",
    blue: "#3b82f6",
    gray: "#888",
  };
  const strokeColor = colorMap[color || "blue"];

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height={h} style={{ display: "block" }} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ProgressBar Component
export function ProgressBar({ element }: ComponentRenderProps) {
  const { value, max, label, color } = element.props as {
    value: number;
    max?: number | null;
    label?: string | null;
    color?: string | null;
  };

  const colorMap: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
  };

  const percent = Math.min(100, (value / (max || 100)) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <span style={{ fontSize: 12, color: "#888" }}>{label}</span>}
      <div style={{ height: 8, background: "#e0e0e0", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: colorMap[color || "blue"],
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

// WeatherIcon Component
export function WeatherIcon({ element }: ComponentRenderProps) {
  const { condition, size } = element.props as {
    condition: string;
    size?: string | null;
  };

  const sizeMap = { sm: 24, md: 40, lg: 56 };
  const s = sizeMap[(size as keyof typeof sizeMap) || "md"];

  const icons: Record<string, string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    "partly cloudy": "⛅",
    stormy: "⛈️",
  };

  return <span style={{ fontSize: s }}>{icons[condition] || "🌡️"}</span>;
}

// ForecastDay Component
export function ForecastDay({ element }: ComponentRenderProps) {
  const { day, high, low, condition } = element.props as {
    day: string;
    high: number;
    low: number;
    condition: string;
  };

  const icons: Record<string, string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    "partly cloudy": "⛅",
  };

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{day}</span>
      <span style={{ fontSize: 20 }}>{icons[condition] || "🌡️"}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{high}°</span>
      <span style={{ fontSize: 12, opacity: 0.6 }}>{low}°</span>
    </div>
  );
}

// PriceChange Component
export function PriceChange({ element }: ComponentRenderProps) {
  const { change, changePercent } = element.props as {
    change: number;
    changePercent: number;
  };

  const isPositive = change >= 0;
  const color = isPositive ? "#22c55e" : "#ef4444";
  const arrow = isPositive ? "↑" : "↓";

  return (
    <span style={{ color, fontSize: 14, fontWeight: 500 }}>
      {arrow} {isPositive ? "+" : ""}
      {change.toFixed(2)} ({changePercent.toFixed(2)}%)
    </span>
  );
}

// StockStat Component
export function StockStat({ element }: ComponentRenderProps) {
  const { label, value } = element.props as {
    label: string;
    value: string;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// SearchResult Component
export function SearchResult({ element }: ComponentRenderProps) {
  const { title, url, snippet } = element.props as {
    title: string;
    url: string;
    snippet: string;
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 8,
        borderRadius: 8,
        textDecoration: "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: "#3b82f6" }}>{title}</span>
      <span
        style={{
          fontSize: 11,
          color: "#888",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {url}
      </span>
      <span
        style={{
          fontSize: 12,
          color: "#666",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {snippet}
      </span>
    </a>
  );
}

// Heading Component
export function Heading({ element }: ComponentRenderProps) {
  const { text, level } = element.props as {
    text: string;
    level?: string | null;
  };

  const sizes: Record<string, number> = { h1: 24, h2: 20, h3: 16, h4: 14 };
  const fontSize = sizes[level || "h3"];

  return <div style={{ fontSize, fontWeight: 600 }}>{text}</div>;
}

// Text Component
export function Text({ element }: ComponentRenderProps) {
  const { content, variant, color } = element.props as {
    content: string;
    variant?: string | null;
    color?: string | null;
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    body: { fontSize: 14 },
    caption: { fontSize: 12, opacity: 0.7 },
    label: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" },
  };

  const colorMap: Record<string, string> = {
    default: "inherit",
    muted: "#888",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
  };

  return (
    <span style={{ ...variantStyles[variant || "body"], color: colorMap[color || "default"] }}>
      {content}
    </span>
  );
}

// Badge Component
export function Badge({ element }: ComponentRenderProps) {
  const { text, variant } = element.props as {
    text: string;
    variant?: string | null;
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: { background: "#e0e0e0", color: "#333" },
    success: { background: "#dcfce7", color: "#166534" },
    warning: { background: "#fef9c3", color: "#854d0e" },
    danger: { background: "#fee2e2", color: "#991b1b" },
    info: { background: "#dbeafe", color: "#1e40af" },
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        ...variantStyles[variant || "default"],
      }}
    >
      {text}
    </span>
  );
}

// Divider Component
export function Divider({ element }: ComponentRenderProps) {
  const { label } = element.props as { label?: string | null };

  if (label) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.2)" }} />
        <span style={{ fontSize: 11, opacity: 0.6 }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.2)" }} />
      </div>
    );
  }

  return <div style={{ height: 1, background: "rgba(255,255,255,0.2)" }} />;
}

// Timer Component
export function Timer({ element }: ComponentRenderProps) {
  const { duration, label } = element.props as {
    duration: number;
    label?: string | null;
    endsAt: number;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {label && <span style={{ fontSize: 14 }}>{label}</span>}
      <span style={{ fontSize: 32, fontWeight: 600, fontFamily: "monospace" }}>
        {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
      </span>
    </div>
  );
}

// Calculation Component
export function Calculation({ element }: ComponentRenderProps) {
  const { expression, result } = element.props as {
    expression: string;
    result: string;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "monospace" }}>
      <span style={{ fontSize: 14, color: "#888" }}>{expression}</span>
      <span style={{ fontSize: 28, fontWeight: 600 }}>= {result}</span>
    </div>
  );
}

// Export registry
export const toolRegistry = {
  Card,
  Grid,
  Stack,
  Metric,
  Sparkline,
  ProgressBar,
  WeatherIcon,
  ForecastDay,
  PriceChange,
  StockStat,
  SearchResult,
  Heading,
  Text,
  Badge,
  Divider,
  Timer,
  Calculation,
};
