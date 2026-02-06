"use client";

import { Button } from "@generous/ui";
import Link from "next/link";
import styles from "./TemplateCard.module.css";

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description?: string;
    category: string;
    thumbnail?: string;
    downloads: number;
    rating?: number;
    ratingCount: number;
    tags?: string[];
    authorName?: string;
    authorImage?: string;
  };
  onInstall?: () => void;
  isInstalling?: boolean;
}

function formatRating(rating: number | undefined): string {
  if (!rating) return "No ratings";
  return (rating / 100).toFixed(1);
}

function formatDownloads(downloads: number): string {
  if (downloads >= 1000) {
    return `${(downloads / 1000).toFixed(1)}k`;
  }
  return downloads.toString();
}

export function TemplateCard({ template, onInstall, isInstalling }: TemplateCardProps) {
  return (
    <div className={styles.card}>
      {template.thumbnail ? (
        // biome-ignore lint/performance/noImgElement: external URL thumbnail
        <img src={template.thumbnail} alt={template.name} className={styles.thumbnail} />
      ) : (
        <div className={styles.thumbnailPlaceholder}>
          <span className={styles.thumbnailIcon}>📊</span>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <Link href={`/templates/${template.id}`} className={styles.title}>
            {template.name}
          </Link>
          <span className={styles.category}>{template.category}</span>
        </div>

        {template.description && <p className={styles.description}>{template.description}</p>}

        {template.tags && template.tags.length > 0 && (
          <div className={styles.tags}>
            {template.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className={styles.tagMore}>+{template.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statIcon}>⬇️</span>
              {formatDownloads(template.downloads)}
            </span>
            <span className={styles.stat}>
              <span className={styles.statIcon}>⭐</span>
              {formatRating(template.rating)}
              {template.ratingCount > 0 && (
                <span className={styles.ratingCount}>({template.ratingCount})</span>
              )}
            </span>
          </div>

          {template.authorName && (
            <div className={styles.author}>
              {template.authorImage ? (
                // biome-ignore lint/performance/noImgElement: external URL avatar
                <img
                  src={template.authorImage}
                  alt={template.authorName}
                  className={styles.authorImage}
                />
              ) : (
                <span className={styles.authorInitial}>
                  {template.authorName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className={styles.authorName}>{template.authorName}</span>
            </div>
          )}
        </div>
      </div>

      {onInstall && (
        <div className={styles.actions}>
          <Button size="sm" onClick={onInstall} disabled={isInstalling}>
            {isInstalling ? "Installing..." : "Install"}
          </Button>
        </div>
      )}
    </div>
  );
}
