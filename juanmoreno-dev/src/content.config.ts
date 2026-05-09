import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    coverImage: image(),
    year: z.string(),
    tags: z.array(z.string()),
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    category: z.string().optional(),
    client: z.string().optional(),
    industry: z.string().optional(),
  }),
});

export const collections = {
  projects: projectsCollection,
};
