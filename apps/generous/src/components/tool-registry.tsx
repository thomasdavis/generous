"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { useDataValue } from "@json-render/react";
import useSWR from "swr";
import styles from "./tool-registry.module.css";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Button Component - triggers actions
export function Button({ element, onAction }: ComponentRenderProps) {
  const { label, action, variant, size } = element.props as {
    label: string;
    action?: { name: string; params?: Record<string, unknown> };
    variant?: string | null;
    size?: string | null;
  };

  return (
    <button
      type="button"
      onClick={() => action && onAction?.(action)}
      className={styles.button}
      data-variant={variant || "primary"}
      data-size={size || "md"}
    >
      {label}
    </button>
  );
}

// InteractiveCard - reads color from data path and triggers toggle action
export function InteractiveCard({ element, children, onAction }: ComponentRenderProps) {
  const { title, colorPath, action, padding } = element.props as {
    title?: string | null;
    colorPath?: string | null;
    action?: { name: string; params?: Record<string, unknown> };
    padding?: string | null;
  };

  // Read color from data context if colorPath provided
  const dataColor = useDataValue(colorPath || "");
  const color = typeof dataColor === "string" ? dataColor : null;

  // Debug logging
  console.log(
    "[InteractiveCard] colorPath:",
    colorPath,
    "dataColor:",
    dataColor,
    "color:",
    color,
    "onAction:",
    !!onAction,
    "action:",
    action,
  );

  const handleClick = () => {
    console.log("[InteractiveCard] clicked! action:", action, "onAction:", !!onAction);
    if (action && onAction) {
      console.log("[InteractiveCard] calling onAction with:", action);
      onAction(action);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      role={action ? "button" : undefined}
      tabIndex={action ? 0 : undefined}
      className={styles.interactiveCard}
      data-color={color || "default"}
      data-padding={padding || "md"}
      data-clickable={action ? "true" : "false"}
    >
      {title && <div className={styles.interactiveCardTitle}>{title}</div>}
      {children}
    </div>
  );
}

// Card Component
export function Card({ element, children }: ComponentRenderProps) {
  const { title, variant, padding } = element.props as {
    title?: string | null;
    variant?: string | null;
    padding?: string | null;
  };

  return (
    <div className={styles.card} data-variant={variant || "default"} data-padding={padding || "md"}>
      {title && <div className={styles.cardTitle}>{title}</div>}
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

  return (
    <div className={styles.grid} data-columns={columns || 2} data-gap={gap || "md"}>
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

  return (
    <div
      className={styles.stack}
      data-direction={direction === "horizontal" ? "horizontal" : "vertical"}
      data-gap={gap || "md"}
      data-align={align || "stretch"}
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

  // Map size prop to data attribute
  const sizeMap: Record<string, string> = { sm: "sm", md: "md", lg: "lg", xl: "xl" };
  const sizeAttr = sizeMap[size || "lg"] || "lg";

  // Calculate unit font size based on value size
  const unitSizeMap: Record<string, string> = { sm: "10px", md: "12px", lg: "18px", xl: "24px" };
  const unitFontSize = unitSizeMap[sizeAttr];

  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue} data-size={sizeAttr}>
        {value}
        {unit && (
          <span className={styles.metricUnit} style={{ fontSize: unitFontSize }}>
            {unit}
          </span>
        )}
      </span>
      {(trend || trendValue) && (
        <span className={styles.metricTrend} data-trend={trend || "neutral"}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : ""}
          {trendValue}
        </span>
      )}
    </div>
  );
}

// Sparkline Component - keep inline styles for SVG
export function Sparkline({ element }: ComponentRenderProps) {
  const { data, color, height } = element.props as {
    data: number[];
    color?: string | null;
    height?: number | null;
  };

  const h = height || 40;
  const colorMap: Record<string, string> = {
    green: "oklch(0.68 0.2 145)",
    red: "oklch(0.62 0.22 25)",
    blue: "oklch(0.64 0.18 240)",
    gray: "var(--text-tertiary)",
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

  const percent = Math.min(100, (value / (max || 100)) * 100);

  return (
    <div className={styles.progressBar}>
      {label && <span className={styles.progressBarLabel}>{label}</span>}
      <div className={styles.progressBarTrack}>
        <div
          className={styles.progressBarFill}
          data-color={color || "blue"}
          style={{ width: `${percent}%` }}
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

  const icons: Record<string, string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    "partly cloudy": "⛅",
    stormy: "⛈️",
  };

  return (
    <span className={styles.weatherIcon} data-size={size || "md"}>
      {icons[condition] || "🌡️"}
    </span>
  );
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
    <div className={styles.forecastDay}>
      <span className={styles.forecastDayName}>{day}</span>
      <span className={styles.forecastDayIcon}>{icons[condition] || "🌡️"}</span>
      <span className={styles.forecastDayHigh}>{high}°</span>
      <span className={styles.forecastDayLow}>{low}°</span>
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
  const arrow = isPositive ? "↑" : "↓";

  return (
    <span className={styles.priceChange} data-positive={isPositive}>
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
    <div className={styles.stockStat}>
      <span className={styles.stockStatLabel}>{label}</span>
      <span className={styles.stockStatValue}>{value}</span>
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
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.searchResult}>
      <span className={styles.searchResultTitle}>{title}</span>
      <span className={styles.searchResultUrl}>{url}</span>
      <span className={styles.searchResultSnippet}>{snippet}</span>
    </a>
  );
}

// Heading Component
export function Heading({ element }: ComponentRenderProps) {
  const { text, level } = element.props as {
    text: string;
    level?: string | null;
  };

  return (
    <div className={styles.heading} data-level={level || "h3"}>
      {text}
    </div>
  );
}

// Text Component
export function Text({ element }: ComponentRenderProps) {
  const { content, variant, color } = element.props as {
    content: string;
    variant?: string | null;
    color?: string | null;
  };

  return (
    <span className={styles.text} data-variant={variant || "body"} data-color={color || "default"}>
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

  return (
    <span className={styles.badge} data-variant={variant || "default"}>
      {text}
    </span>
  );
}

// Divider Component
export function Divider({ element }: ComponentRenderProps) {
  const { label } = element.props as { label?: string | null };

  if (label) {
    return (
      <div className={styles.dividerWithLabel}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerLabel}>{label}</span>
        <div className={styles.dividerLine} />
      </div>
    );
  }

  return <div className={styles.divider} />;
}

// Timer Component
export function Timer({ element }: ComponentRenderProps) {
  const { duration, label } = element.props as {
    duration: number;
    label?: string | null;
    endsAt: number;
  };

  return (
    <div className={styles.timer}>
      {label && <span className={styles.timerLabel}>{label}</span>}
      <span className={styles.timerDisplay}>
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
    <div className={styles.calculation}>
      <span className={styles.calculationExpr}>{expression}</span>
      <span className={styles.calculationResult}>= {result}</span>
    </div>
  );
}

// DataList Component - fetches data from an API and renders items
export function DataList({ element, children }: ComponentRenderProps) {
  const { endpoint, dataKey, emptyMessage, refreshInterval } = element.props as {
    endpoint: string;
    dataKey?: string | null;
    emptyMessage?: string | null;
    refreshInterval?: number | null;
  };

  const { data, error, isLoading } = useSWR(endpoint, fetcher, {
    refreshInterval: refreshInterval || 0,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.dataListError}>Failed to load data</div>;
  }

  // Extract the array from the response using dataKey (e.g., "pets" from { pets: [...] })
  const items = dataKey && data ? data[dataKey] : data;

  if (!items || (Array.isArray(items) && items.length === 0)) {
    return <div className={styles.dataListEmpty}>{emptyMessage || "No items found"}</div>;
  }

  // Children will be rendered for each item via the DataListItem component
  return <div className={styles.dataList}>{children}</div>;
}

// PetCard Component - displays a single pet
export function PetCard({ element }: ComponentRenderProps) {
  const { name, species, breed, age, price, status, description } = element.props as {
    name: string;
    species: string;
    breed?: string | null;
    age?: number | null;
    price: number;
    status: string;
    description?: string | null;
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const speciesEmoji: Record<string, string> = {
    dog: "🐕",
    cat: "🐱",
    bird: "🐦",
    fish: "🐠",
    rabbit: "🐰",
  };

  return (
    <div className={styles.petCard} data-status={status}>
      <div className={styles.petCardHeader}>
        <span className={styles.petCardEmoji}>{speciesEmoji[species] || "🐾"}</span>
        <div className={styles.petCardInfo}>
          <span className={styles.petCardName}>{name}</span>
          <span className={styles.petCardBreed}>{breed || species}</span>
        </div>
        <span className={styles.petCardStatus} data-status={status}>
          {status}
        </span>
      </div>
      {description && <p className={styles.petCardDescription}>{description}</p>}
      <div className={styles.petCardFooter}>
        {age !== null && age !== undefined && (
          <span className={styles.petCardAge}>
            {age} {age === 1 ? "year" : "years"} old
          </span>
        )}
        <span className={styles.petCardPrice}>{formatPrice(price)}</span>
      </div>
    </div>
  );
}

// PetList Component - fetches and displays a list of pets from the API
export function PetList({ element }: ComponentRenderProps) {
  const { status, species, refreshInterval, fields, layout } = element.props as {
    status?: string | null;
    species?: string | null;
    refreshInterval?: number | null;
    fields?: string[] | null; // Which fields to display: name, species, breed, age, price, status, description
    layout?: "cards" | "list" | "compact" | null;
  };

  // Build the API URL with query params
  let url = "/api/pets";
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (species) params.set("species", species);
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: refreshInterval || 5000, // Refresh every 5 seconds by default
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Loading pets...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.dataListError}>Failed to load pets</div>;
  }

  const pets = data?.pets || [];

  if (pets.length === 0) {
    return <div className={styles.dataListEmpty}>No pets found</div>;
  }

  // Default to all fields if not specified
  const displayFields = fields || [
    "name",
    "species",
    "breed",
    "age",
    "price",
    "status",
    "description",
  ];
  const displayLayout = layout || "cards";

  // Format price from cents to dollars
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Compact/list layout - just show specified fields inline
  if (displayLayout === "compact" || displayLayout === "list") {
    return (
      <div className={styles.petListCompact}>
        {pets.map(
          (pet: {
            id: string;
            name: string;
            species: string;
            breed?: string | null;
            age?: number | null;
            price: number;
            status: string;
            description?: string | null;
          }) => (
            <div key={pet.id} className={styles.petListItem}>
              {displayFields.map((field) => {
                let value: string | null = null;
                switch (field) {
                  case "name":
                    value = pet.name;
                    break;
                  case "species":
                    value = pet.species;
                    break;
                  case "breed":
                    value = pet.breed || null;
                    break;
                  case "age":
                    value = pet.age ? `${pet.age} years` : null;
                    break;
                  case "price":
                    value = formatPrice(pet.price);
                    break;
                  case "status":
                    value = pet.status;
                    break;
                  case "description":
                    value = pet.description || null;
                    break;
                }
                if (!value) return null;
                return (
                  <span key={field} className={styles.petListItemField} data-field={field}>
                    {value}
                  </span>
                );
              })}
            </div>
          ),
        )}
      </div>
    );
  }

  // Cards layout - use PetCard but only show specified fields
  return (
    <div className={styles.petList}>
      {pets.map(
        (pet: {
          id: string;
          name: string;
          species: string;
          breed?: string | null;
          age?: number | null;
          price: number;
          status: string;
          description?: string | null;
        }) => (
          <PetCard
            key={pet.id}
            element={{
              key: pet.id,
              type: "PetCard",
              props: {
                ...pet,
                // Only include fields that are in displayFields
                breed: displayFields.includes("breed") ? pet.breed : undefined,
                age: displayFields.includes("age") ? pet.age : undefined,
                description: displayFields.includes("description") ? pet.description : undefined,
                // Always need these for PetCard to work
                name: pet.name,
                species: displayFields.includes("species") ? pet.species : "",
                price: displayFields.includes("price") ? pet.price : 0,
                status: displayFields.includes("status") ? pet.status : "",
              },
              children: [],
            }}
          />
        ),
      )}
    </div>
  );
}

// Export registry
export const toolRegistry = {
  Button,
  InteractiveCard,
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
  DataList,
  PetCard,
  PetList,
};
