"use client";

import { Badge } from "@generous/ui";
import styles from "./ToolComponents.module.css";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  marketCap: string;
  history: { time: number; price: number }[];
}

export function StockCard({ data }: { data: StockData }) {
  const isPositive = data.change >= 0;

  // Simple sparkline SVG
  const minPrice = Math.min(...data.history.map((h) => h.price));
  const maxPrice = Math.max(...data.history.map((h) => h.price));
  const range = maxPrice - minPrice || 1;
  const points = data.history
    .map((h, i) => {
      const x = (i / (data.history.length - 1)) * 100;
      const y = 100 - ((h.price - minPrice) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={styles.stockCard}>
      <div className={styles.stockHeader}>
        <div className={styles.stockSymbol}>{data.symbol}</div>
        <Badge variant={isPositive ? "success" : "error"} size="sm">
          {isPositive ? "+" : ""}
          {data.changePercent.toFixed(2)}%
        </Badge>
      </div>

      <div className={styles.stockPrice}>
        <span className={styles.priceValue}>${data.price.toFixed(2)}</span>
        <span className={isPositive ? styles.priceUp : styles.priceDown}>
          {isPositive ? "+" : ""}
          {data.change.toFixed(2)}
        </span>
      </div>

      <div className={styles.sparkline}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            fill="none"
            stroke={isPositive ? "var(--color-green-500)" : "var(--color-red-500)"}
            strokeWidth="2"
            points={points}
          />
        </svg>
      </div>

      <div className={styles.stockStats}>
        <div className={styles.stockStat}>
          <span className={styles.statLabel}>High</span>
          <span className={styles.statValue}>${data.high}</span>
        </div>
        <div className={styles.stockStat}>
          <span className={styles.statLabel}>Low</span>
          <span className={styles.statValue}>${data.low}</span>
        </div>
        <div className={styles.stockStat}>
          <span className={styles.statLabel}>Vol</span>
          <span className={styles.statValue}>{data.volume}</span>
        </div>
        <div className={styles.stockStat}>
          <span className={styles.statLabel}>Cap</span>
          <span className={styles.statValue}>${data.marketCap}</span>
        </div>
      </div>
    </div>
  );
}

interface WeatherData {
  location: string;
  temperature: number;
  unit: string;
  condition: string;
  humidity: number;
  wind: number;
  forecast: { day: string; high: number; low: number; condition: string }[];
}

const weatherIcons: Record<string, string> = {
  sunny:
    "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 100 12 6 6 0 000-12z",
  cloudy: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z",
  rainy:
    "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15zm5 5v2m4-2v2m4-2v2",
  snowy:
    "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15zm5 5l.5.5m-.5-.5l-.5.5m4.5-.5l.5.5m-.5-.5l-.5.5m4.5-.5l.5.5m-.5-.5l-.5.5",
  "partly cloudy":
    "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
};

export function WeatherCard({ data }: { data: WeatherData }) {
  const iconPath = weatherIcons[data.condition] || weatherIcons.sunny;

  return (
    <div className={styles.weatherCard}>
      <div className={styles.weatherMain}>
        <div className={styles.weatherIcon}>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        <div className={styles.weatherInfo}>
          <div className={styles.weatherLocation}>{data.location}</div>
          <div className={styles.weatherTemp}>{data.temperature}°C</div>
          <div className={styles.weatherCondition}>{data.condition}</div>
        </div>
      </div>

      <div className={styles.weatherDetails}>
        <div className={styles.weatherDetail}>
          <svg
            className={styles.detailIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
          <span>{data.humidity}%</span>
        </div>
        <div className={styles.weatherDetail}>
          <svg
            className={styles.detailIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
          <span>{data.wind} km/h</span>
        </div>
      </div>

      <div className={styles.forecast}>
        {data.forecast.map((day) => (
          <div key={day.day} className={styles.forecastDay}>
            <span className={styles.forecastLabel}>{day.day}</span>
            <span className={styles.forecastHigh}>{day.high}°</span>
            <span className={styles.forecastLow}>{day.low}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchData {
  query: string;
  totalResults: number;
  results: SearchResult[];
}

export function SearchResults({ data }: { data: SearchData }) {
  return (
    <div className={styles.searchCard}>
      <div className={styles.searchHeader}>
        <span className={styles.searchQuery}>"{data.query}"</span>
        <span className={styles.searchCount}>{data.totalResults.toLocaleString()} results</span>
      </div>
      <div className={styles.searchResults}>
        {data.results.map((result, i) => (
          <a
            key={i}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.searchResult}
          >
            <div className={styles.resultTitle}>{result.title}</div>
            <div className={styles.resultUrl}>{result.url}</div>
            <div className={styles.resultSnippet}>{result.snippet}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
