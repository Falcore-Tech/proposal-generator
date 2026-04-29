import { z } from "zod";
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import matter from "gray-matter";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const SNIPPETS_DIR = resolve(process.cwd(), "docs/snippets");

interface Snippet {
  slug: string;
  category: string;
  icon_key: string;
  title_options: string[];
  desc_template: string;
  usage?: string;
  raw_body: string;
}

function loadSnippets(): Snippet[] {
  const snippets: Snippet[] = [];

  for (const category of ["problems", "solutions", "guarantees"]) {
    const dir = resolve(SNIPPETS_DIR, category);
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }

    for (const file of files) {
      const raw = readFileSync(resolve(dir, file), "utf-8");
      const { data, content } = matter(raw);
      const singularCategory = category.replace(/s$/, "");

      snippets.push(
        data.slug
          ? {
              slug: data.slug,
              category: data.category ?? singularCategory,
              icon_key: data.icon_key ?? "",
              title_options: Array.isArray(data.title_options) ? data.title_options : [],
              desc_template: data.desc_template ?? "",
              usage: data.usage,
              raw_body: content.trim(),
            }
          : {
              slug: file.replace(".md", ""),
              category: singularCategory,
              icon_key: "",
              title_options: [],
              desc_template: "",
              raw_body: raw.trim(),
            }
      );
    }
  }

  return snippets;
}

export function registerSnippetTools(server: McpServer) {
  server.tool(
    "list_snippets",
    "List available content snippets for problems, solutions, and guarantees. Use these to ground proposal copy in proven XMA language.",
    { category: z.enum(["problem", "solution", "guarantee"]).optional() },
    async ({ category }) => {
      const snippets = loadSnippets();
      const filtered = category ? snippets.filter((s) => s.category === category) : snippets;
      const index = filtered.map(({ slug, category: cat, icon_key, title_options, desc_template, usage }) => ({
        slug, category: cat, icon_key, title_options, desc_template, usage,
      }));
      return { content: [{ type: "text", text: JSON.stringify(index, null, 2) }] };
    }
  );

  server.tool(
    "get_snippet",
    "Get full content of a specific snippet by slug.",
    { slug: z.string() },
    async ({ slug }) => {
      const snippets = loadSnippets();
      const snippet = snippets.find((s) => s.slug === slug);
      if (!snippet) return { content: [{ type: "text", text: `Snippet "${slug}" not found.` }] };
      return { content: [{ type: "text", text: JSON.stringify(snippet, null, 2) }] };
    }
  );
}
