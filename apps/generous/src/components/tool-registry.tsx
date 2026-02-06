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

// Input Component - text input bound to data
export function Input({ element, onAction }: ComponentRenderProps) {
  const { label, placeholder, valuePath, type, disabled } = element.props as {
    label?: string | null;
    placeholder?: string | null;
    valuePath: string;
    type?: string | null;
    disabled?: boolean | null;
  };

  // Read current value from data context
  const currentValue = useDataValue(valuePath);
  const value =
    typeof currentValue === "string" || typeof currentValue === "number" ? currentValue : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? Number(e.target.value) : e.target.value;
    onAction?.({ name: "set", params: { path: valuePath, value: newValue } });
  };

  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <input
        type={type || "text"}
        value={value}
        onChange={handleChange}
        placeholder={placeholder || undefined}
        disabled={disabled || false}
        className={styles.input}
      />
    </div>
  );
}

// Select Component - dropdown bound to data
export function Select({ element, onAction }: ComponentRenderProps) {
  const { label, valuePath, options, placeholder, disabled } = element.props as {
    label?: string | null;
    valuePath: string;
    options: Array<{ value: string; label: string }>;
    placeholder?: string | null;
    disabled?: boolean | null;
  };

  const currentValue = useDataValue(valuePath);
  const value = typeof currentValue === "string" ? currentValue : "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onAction?.({ name: "set", params: { path: valuePath, value: e.target.value } });
  };

  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled || false}
        className={styles.select}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Textarea Component - multiline text bound to data
export function Textarea({ element, onAction }: ComponentRenderProps) {
  const { label, placeholder, valuePath, rows, disabled } = element.props as {
    label?: string | null;
    placeholder?: string | null;
    valuePath: string;
    rows?: number | null;
    disabled?: boolean | null;
  };

  const currentValue = useDataValue(valuePath);
  const value = typeof currentValue === "string" ? currentValue : "";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAction?.({ name: "set", params: { path: valuePath, value: e.target.value } });
  };

  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder || undefined}
        rows={rows || 3}
        disabled={disabled || false}
        className={styles.textarea}
      />
    </div>
  );
}

// Checkbox Component - bound to boolean data
export function Checkbox({ element, onAction }: ComponentRenderProps) {
  const { label, checkedPath, disabled } = element.props as {
    label: string;
    checkedPath: string;
    disabled?: boolean | null;
  };

  const currentValue = useDataValue(checkedPath);
  const checked = typeof currentValue === "boolean" ? currentValue : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAction?.({ name: "set", params: { path: checkedPath, value: e.target.checked } });
  };

  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled || false}
        className={styles.checkbox}
      />
      <span className={styles.checkboxText}>{label}</span>
    </label>
  );
}

// RadioGroup Component - radio buttons bound to data
export function RadioGroup({ element, onAction }: ComponentRenderProps) {
  const { label, valuePath, options, disabled } = element.props as {
    label?: string | null;
    valuePath: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean | null;
  };

  const currentValue = useDataValue(valuePath);
  const value = typeof currentValue === "string" ? currentValue : "";

  const handleChange = (optionValue: string) => {
    onAction?.({ name: "set", params: { path: valuePath, value: optionValue } });
  };

  return (
    <fieldset className={styles.radioGroup}>
      {label && <legend className={styles.radioGroupLabel}>{label}</legend>}
      <div className={styles.radioOptions}>
        {options.map((opt) => (
          <label key={opt.value} className={styles.radioLabel}>
            <input
              type="radio"
              name={valuePath}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => handleChange(opt.value)}
              disabled={disabled || false}
              className={styles.radio}
            />
            <span className={styles.radioText}>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
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

// StatusMessage Component - shows loading/error/success states from API calls
export function StatusMessage() {
  const loading = useDataValue("/apiLoading");
  const error = useDataValue("/apiError");
  const success = useDataValue("/apiSuccess");

  if (loading) {
    return (
      <div className={styles.statusMessage} data-type="loading">
        <div className={styles.dataListSpinner} />
        <span>Processing...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statusMessage} data-type="error">
        <span>{String(error)}</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.statusMessage} data-type="success">
        <span>{String(success)}</span>
      </div>
    );
  }

  return null;
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

// CustomerCard Component - displays a single customer
export function CustomerCard({ element }: ComponentRenderProps) {
  const { firstName, lastName, email, phone, city, state } = element.props as {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };

  return (
    <div className={styles.customerCard}>
      <div className={styles.customerCardHeader}>
        <span className={styles.customerCardAvatar}>
          {firstName[0]}
          {lastName[0]}
        </span>
        <div className={styles.customerCardInfo}>
          <span className={styles.customerCardName}>
            {firstName} {lastName}
          </span>
          <span className={styles.customerCardEmail}>{email}</span>
        </div>
      </div>
      {(phone || city) && (
        <div className={styles.customerCardFooter}>
          {phone && <span className={styles.customerCardPhone}>{phone}</span>}
          {city && state && (
            <span className={styles.customerCardLocation}>
              {city}, {state}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// CustomerList Component - fetches and displays customers
export function CustomerList({ element }: ComponentRenderProps) {
  const { search, limit, refreshInterval, fields, layout } = element.props as {
    search?: string | null;
    limit?: number | null;
    refreshInterval?: number | null;
    fields?: string[] | null;
    layout?: "cards" | "list" | "compact" | null;
  };

  let url = "/api/customers";
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (limit) params.set("limit", String(limit));
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: refreshInterval || 5000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Loading customers...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.dataListError}>Failed to load customers</div>;
  }

  const customers = data?.customers || [];
  const displayLayout = layout || "cards";
  const displayFields = fields || ["firstName", "lastName", "email", "phone"];

  if (customers.length === 0) {
    return <div className={styles.dataListEmpty}>No customers found</div>;
  }

  if (displayLayout === "compact" || displayLayout === "list") {
    return (
      <div className={styles.petListCompact}>
        {customers.map(
          (c: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone?: string | null;
            city?: string | null;
            state?: string | null;
          }) => (
            <div key={c.id} className={styles.petListItem}>
              {displayFields.includes("firstName") && (
                <span className={styles.petListItemField} data-field="name">
                  {c.firstName} {displayFields.includes("lastName") ? c.lastName : ""}
                </span>
              )}
              {displayFields.includes("email") && (
                <span className={styles.petListItemField} data-field="species">
                  {c.email}
                </span>
              )}
              {displayFields.includes("phone") && c.phone && (
                <span className={styles.petListItemField} data-field="age">
                  {c.phone}
                </span>
              )}
              {displayFields.includes("city") && c.city && (
                <span className={styles.petListItemField} data-field="status">
                  {c.city}, {c.state}
                </span>
              )}
            </div>
          ),
        )}
      </div>
    );
  }

  return (
    <div className={styles.petList}>
      {customers.map(
        (c: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string | null;
          city?: string | null;
          state?: string | null;
        }) => (
          <CustomerCard
            key={c.id}
            element={{
              key: c.id,
              type: "CustomerCard",
              props: c,
              children: [],
            }}
          />
        ),
      )}
    </div>
  );
}

// OrderCard Component - displays a single order
export function OrderCard({ element }: ComponentRenderProps) {
  const { id, status, totalPrice, quantity, customerName, petName } = element.props as {
    id: string;
    status: string;
    totalPrice: number;
    quantity: number;
    customerName?: string | null;
    petName?: string | null;
    createdAt?: string | null;
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className={styles.orderCard} data-status={status}>
      <div className={styles.orderCardHeader}>
        <span className={styles.orderCardId}>#{id.slice(-6)}</span>
        <span className={styles.orderCardStatus} data-status={status}>
          {status}
        </span>
      </div>
      <div className={styles.orderCardBody}>
        {petName && <span className={styles.orderCardPet}>{petName}</span>}
        {customerName && <span className={styles.orderCardCustomer}>for {customerName}</span>}
      </div>
      <div className={styles.orderCardFooter}>
        <span className={styles.orderCardQty}>Qty: {quantity}</span>
        <span className={styles.orderCardPrice}>{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}

// OrderList Component - fetches and displays orders
export function OrderList({ element }: ComponentRenderProps) {
  const { status, customerId, limit, refreshInterval, layout } = element.props as {
    status?: string | null;
    customerId?: string | null;
    limit?: number | null;
    refreshInterval?: number | null;
    layout?: "cards" | "list" | "compact" | null;
  };

  let url = "/api/orders";
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (customerId) params.set("customerId", customerId);
  if (limit) params.set("limit", String(limit));
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: refreshInterval || 5000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.dataListError}>Failed to load orders</div>;
  }

  const orders = data?.orders || [];
  const displayLayout = layout || "cards";

  if (orders.length === 0) {
    return <div className={styles.dataListEmpty}>No orders found</div>;
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (displayLayout === "compact" || displayLayout === "list") {
    return (
      <div className={styles.petListCompact}>
        {orders.map(
          (o: {
            id: string;
            status: string;
            totalPrice: number;
            quantity: number;
            createdAt: string;
          }) => (
            <div key={o.id} className={styles.petListItem}>
              <span className={styles.petListItemField} data-field="name">
                #{o.id.slice(-6)}
              </span>
              <span className={styles.petListItemField} data-field="status">
                {o.status}
              </span>
              <span className={styles.petListItemField} data-field="price">
                {formatPrice(o.totalPrice)}
              </span>
            </div>
          ),
        )}
      </div>
    );
  }

  return (
    <div className={styles.petList}>
      {orders.map(
        (o: {
          id: string;
          status: string;
          totalPrice: number;
          quantity: number;
          createdAt: string;
        }) => (
          <OrderCard
            key={o.id}
            element={{
              key: o.id,
              type: "OrderCard",
              props: {
                ...o,
                customerName: null,
                petName: null,
              },
              children: [],
            }}
          />
        ),
      )}
    </div>
  );
}

// InventoryCard Component - displays a single inventory item
export function InventoryCard({ element }: ComponentRenderProps) {
  const { itemName, itemType, species, quantity, unitPrice, reorderLevel } = element.props as {
    itemName: string;
    itemType: string;
    species?: string | null;
    quantity: number;
    unitPrice: number;
    reorderLevel?: number | null;
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const isLowStock = quantity <= (reorderLevel || 10);

  const typeEmoji: Record<string, string> = {
    food: "🍖",
    toy: "🎾",
    accessory: "🎀",
    medicine: "💊",
  };

  return (
    <div className={styles.inventoryCard} data-low-stock={isLowStock}>
      <div className={styles.inventoryCardHeader}>
        <span className={styles.inventoryCardEmoji}>{typeEmoji[itemType] || "📦"}</span>
        <div className={styles.inventoryCardInfo}>
          <span className={styles.inventoryCardName}>{itemName}</span>
          <span className={styles.inventoryCardType}>
            {itemType}
            {species && ` • ${species}`}
          </span>
        </div>
      </div>
      <div className={styles.inventoryCardFooter}>
        <span className={styles.inventoryCardQty} data-low-stock={isLowStock}>
          {quantity} in stock
        </span>
        <span className={styles.inventoryCardPrice}>{formatPrice(unitPrice)}</span>
      </div>
    </div>
  );
}

// InventoryList Component - fetches and displays inventory
export function InventoryList({ element }: ComponentRenderProps) {
  const { itemType, species, lowStockOnly, refreshInterval, layout } = element.props as {
    itemType?: string | null;
    species?: string | null;
    lowStockOnly?: boolean | null;
    refreshInterval?: number | null;
    layout?: "cards" | "list" | "compact" | null;
  };

  let url = "/api/inventory";
  const params = new URLSearchParams();
  if (itemType) params.set("type", itemType);
  if (species) params.set("species", species);
  if (lowStockOnly) params.set("lowStock", "true");
  if (params.toString()) url += `?${params.toString()}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: refreshInterval || 5000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Loading inventory...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.dataListError}>Failed to load inventory</div>;
  }

  const items = data?.items || [];
  const displayLayout = layout || "cards";

  if (items.length === 0) {
    return <div className={styles.dataListEmpty}>No inventory items found</div>;
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (displayLayout === "compact" || displayLayout === "list") {
    return (
      <div className={styles.petListCompact}>
        {items.map(
          (item: {
            id: string;
            itemName: string;
            itemType: string;
            quantity: number;
            unitPrice: number;
            reorderLevel?: number | null;
          }) => (
            <div key={item.id} className={styles.petListItem}>
              <span className={styles.petListItemField} data-field="name">
                {item.itemName}
              </span>
              <span className={styles.petListItemField} data-field="species">
                {item.itemType}
              </span>
              <span
                className={styles.petListItemField}
                data-field="status"
                style={{
                  color:
                    item.quantity <= (item.reorderLevel || 10)
                      ? "var(--state-error-text)"
                      : undefined,
                }}
              >
                {item.quantity} in stock
              </span>
              <span className={styles.petListItemField} data-field="price">
                {formatPrice(item.unitPrice)}
              </span>
            </div>
          ),
        )}
      </div>
    );
  }

  return (
    <div className={styles.petList}>
      {items.map(
        (item: {
          id: string;
          itemName: string;
          itemType: string;
          species?: string | null;
          quantity: number;
          unitPrice: number;
          reorderLevel?: number | null;
        }) => (
          <InventoryCard
            key={item.id}
            element={{
              key: item.id,
              type: "InventoryCard",
              props: item,
              children: [],
            }}
          />
        ),
      )}
    </div>
  );
}

// StoreStats Component - fetches and displays store statistics
export function StoreStats({ element }: ComponentRenderProps) {
  const { refreshInterval } = element.props as {
    refreshInterval?: number | null;
  };

  const { data, error, isLoading } = useSWR("/api/store", fetcher, {
    refreshInterval: refreshInterval || 10000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Loading store stats...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.dataListError}>Failed to load store stats</div>;
  }

  const stats = data?.stats;
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className={styles.storeStats}>
      <div className={styles.storeStatsHeader}>
        <span className={styles.storeStatsName}>{data?.name || "Pet Store"}</span>
        <span className={styles.storeStatsStatus} data-open={data?.isOpen}>
          {data?.isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <div className={styles.storeStatsGrid}>
        <div className={styles.storeStatItem}>
          <span className={styles.storeStatValue}>{stats?.totalPets || 0}</span>
          <span className={styles.storeStatLabel}>Total Pets</span>
        </div>
        <div className={styles.storeStatItem}>
          <span className={styles.storeStatValue}>{stats?.availablePets || 0}</span>
          <span className={styles.storeStatLabel}>Available</span>
        </div>
        <div className={styles.storeStatItem}>
          <span className={styles.storeStatValue}>{stats?.pendingOrders || 0}</span>
          <span className={styles.storeStatLabel}>Pending Orders</span>
        </div>
        <div className={styles.storeStatItem}>
          <span className={styles.storeStatValue}>{formatPrice(stats?.totalRevenue || 0)}</span>
          <span className={styles.storeStatLabel}>Revenue</span>
        </div>
        <div className={styles.storeStatItem}>
          <span className={styles.storeStatValue}>{stats?.totalCustomers || 0}</span>
          <span className={styles.storeStatLabel}>Customers</span>
        </div>
        <div className={styles.storeStatItem}>
          <span
            className={styles.storeStatValue}
            style={{ color: stats?.lowStockItems > 0 ? "var(--state-warning-text)" : undefined }}
          >
            {stats?.lowStockItems || 0}
          </span>
          <span className={styles.storeStatLabel}>Low Stock</span>
        </div>
      </div>
    </div>
  );
}

// CategoryList Component - fetches and displays categories
export function CategoryList({ element }: ComponentRenderProps) {
  const { refreshInterval, layout } = element.props as {
    refreshInterval?: number | null;
    layout?: "cards" | "list" | "compact" | null;
  };

  const { data, error, isLoading } = useSWR("/api/categories", fetcher, {
    refreshInterval: refreshInterval || 30000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return <div className={styles.dataListError}>Failed to load categories</div>;
  }

  const categories = data?.categories || [];
  const displayLayout = layout || "list";

  if (categories.length === 0) {
    return <div className={styles.dataListEmpty}>No categories found</div>;
  }

  const categoryEmoji: Record<string, string> = {
    Dogs: "🐕",
    Cats: "🐱",
    Birds: "🐦",
    Fish: "🐠",
    "Small Animals": "🐰",
  };

  if (displayLayout === "compact") {
    return (
      <div className={styles.categoryListCompact}>
        {categories.map((cat: { id: string; name: string }) => (
          <span key={cat.id} className={styles.categoryBadge}>
            {categoryEmoji[cat.name] || "🐾"} {cat.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.categoryList}>
      {categories.map((cat: { id: string; name: string; description?: string | null }) => (
        <div key={cat.id} className={styles.categoryItem}>
          <span className={styles.categoryEmoji}>{categoryEmoji[cat.name] || "🐾"}</span>
          <div className={styles.categoryInfo}>
            <span className={styles.categoryName}>{cat.name}</span>
            {cat.description && <span className={styles.categoryDesc}>{cat.description}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to get env vars from localStorage
function getEnvVarsFromStorage(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("generous-env-vars");
    if (!stored) return {};
    const vars = JSON.parse(stored) as Array<{ key: string; value: string }>;
    return vars.reduce(
      (acc, { key, value }) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
  } catch {
    return {};
  }
}

// RegistryFetcher Component - fetches data from ANY TPMJS registry tool
export function RegistryFetcher({ element }: ComponentRenderProps) {
  const { toolId, params, dataKey, refreshInterval, title } = element.props as {
    toolId: string;
    params?: Record<string, unknown> | null;
    dataKey?: string | null;
    refreshInterval?: number | null;
    title?: string | null;
  };

  // Create stable cache key
  const cacheKey = `registry:${toolId}:${JSON.stringify(params || {})}`;

  const registryFetcher = async () => {
    const envVars = getEnvVarsFromStorage();
    const response = await fetch("/api/registry-execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-generous-env-vars": JSON.stringify(envVars),
      },
      body: JSON.stringify({ toolId, params: params || {} }),
    });
    return response.json();
  };

  const { data, error, isLoading } = useSWR(cacheKey, registryFetcher, {
    refreshInterval: refreshInterval || 10000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className={styles.dataListLoading}>
        <div className={styles.dataListSpinner} />
        <span>Fetching from {toolId}...</span>
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className={styles.dataListError}>
        Error: {data?.message || error?.message || "Failed to fetch"}
      </div>
    );
  }

  // Extract data if dataKey specified
  const displayData = dataKey && data?.data ? data.data[dataKey] : data?.data;

  if (displayData === undefined && dataKey) {
    const availableKeys = data?.data ? Object.keys(data.data).join(", ") : "none";
    return (
      <div className={styles.dataListError}>
        <div>
          dataKey &quot;{dataKey}&quot; not found in response. Available keys: {availableKeys}
        </div>
        <pre className={styles.registryFetcherJson}>{JSON.stringify(data?.data, null, 2)}</pre>
      </div>
    );
  }

  // Render as formatted JSON or auto-detect array for cards
  if (Array.isArray(displayData)) {
    return (
      <div className={styles.registryFetcherContainer}>
        {title && <div className={styles.registryFetcherTitle}>{title}</div>}
        <div className={styles.registryFetcherMeta}>
          {displayData.length} items from {toolId}
        </div>
        <div className={styles.registryFetcherItems}>
          {displayData.map((item, idx) => (
            <div key={item?.id || item?.url || idx} className={styles.registryFetcherItem}>
              {item && typeof item === "object" && (item.title || item.url || item.name) ? (
                <>
                  {(item.title || item.name) && (
                    <div className={styles.registryFetcherItemTitle}>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.title || item.name}
                        </a>
                      ) : (
                        item.title || item.name
                      )}
                    </div>
                  )}
                  {item.description && (
                    <div className={styles.registryFetcherItemDesc}>{item.description}</div>
                  )}
                  {item.url && !item.title && !item.name && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.registryFetcherItemUrl}
                    >
                      {item.url}
                    </a>
                  )}
                </>
              ) : (
                <pre className={styles.registryFetcherJson}>{JSON.stringify(item, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single object or primitive - render as JSON
  return (
    <div className={styles.registryFetcherContainer}>
      {title && <div className={styles.registryFetcherTitle}>{title}</div>}
      <div className={styles.registryFetcherMeta}>Result from {toolId}</div>
      <pre className={styles.registryFetcherJson}>{JSON.stringify(displayData, null, 2)}</pre>
    </div>
  );
}

// Export registry
export const toolRegistry = {
  Button,
  InteractiveCard,
  Input,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
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
  StatusMessage,
  DataList,
  PetCard,
  PetList,
  CustomerCard,
  CustomerList,
  OrderCard,
  OrderList,
  InventoryCard,
  InventoryList,
  StoreStats,
  CategoryList,
  RegistryFetcher,
};
