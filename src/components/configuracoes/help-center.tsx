"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HELP_ARTICLES } from "@/lib/mock-data/settings";

export function HelpCenter() {
  const [query, setQuery] = useState("");

  const filteredArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return HELP_ARTICLES;
    return HELP_ARTICLES.filter(
      (article) =>
        article.title.toLowerCase().includes(normalized) ||
        article.content.toLowerCase().includes(normalized) ||
        article.category.toLowerCase().includes(normalized),
    );
  }, [query]);

  const categories = useMemo(() => {
    const map = new Map<string, typeof HELP_ARTICLES>();
    for (const article of filteredArticles) {
      const list = map.get(article.category) ?? [];
      list.push(article);
      map.set(article.category, list);
    }
    return map;
  }, [filteredArticles]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajuda e Tutoriais</CardTitle>
          <CardDescription>
            Perguntas frequentes e passo a passo das principais rotinas do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar por tema, módulo ou palavra-chave..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {categories.size === 0 && (
        <p className="text-muted-foreground text-sm">Nenhum artigo encontrado para sua busca.</p>
      )}

      {Array.from(categories.entries()).map(([category, articles]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {articles.map((article) => (
              <div key={article.id} className="flex flex-col gap-1 py-3">
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-muted-foreground text-sm">{article.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
