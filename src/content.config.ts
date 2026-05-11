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
    techStack: z.array(z.object({
      name: z.string(),
      icon: z.string(),
    })).optional(),
  }),
});

const experienceCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/experience" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    coverImage: image(),
    year: z.string(),
    tags: z.array(z.string()),
    role: z.string().optional(),
    company: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    category: z.string().optional(),
    client: z.string().optional(),
    industry: z.string().optional(),
    achievements: z.array(z.string()).optional(),
    techStack: z.array(z.object({
      name: z.string(),
      icon: z.string(),
    })).optional(),
  }),
});

export const collections = {
  projects: projectsCollection,
  experience: experienceCollection,
};
