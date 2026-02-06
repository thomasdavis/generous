"use client";

import { Button, Input } from "@generous/ui";
import { useCallback, useEffect, useState } from "react";
import { TemplateCard } from "./TemplateCard";
import styles from "./TemplateGallery.module.css";

interface Template {
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
}

interface TemplateGalleryProps {
  onInstall?: (templateId: string) => Promise<void>;
}

export function TemplateGallery({ onInstall }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"downloads" | "rating" | "newest">("downloads");
  const [installingId, setInstallingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("sort", sortBy);

      const response = await fetch(`/api/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setCategories(data.categories);
      } else {
        setError("Failed to load templates");
      }
    } catch (e) {
      setError("Failed to load templates");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, sortBy]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleInstall = async (templateId: string) => {
    if (!onInstall) return;

    setInstallingId(templateId);
    try {
      await onInstall(templateId);
    } finally {
      setInstallingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className={styles.searchInput}
          />
          <Button type="submit">Search</Button>
        </form>

        <div className={styles.filterRow}>
          <div className={styles.categories}>
            <button
              type="button"
              className={`${styles.categoryBtn} ${!selectedCategory ? styles.categoryActive : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`${styles.categoryBtn} ${selectedCategory === category ? styles.categoryActive : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="downloads">Most Downloads</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loading}>Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className={styles.empty}>
          <h3>No templates found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onInstall={onInstall ? () => handleInstall(template.id) : undefined}
              isInstalling={installingId === template.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
