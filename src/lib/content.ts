import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parsePublicCollection } from '@/lib/utils';
import type { PublicEventRecord } from '@/lib/types';

async function loadEventCollection(filename: 'upcoming.json' | 'archive.json') {
  const path = fileURLToPath(new URL(`../../public/data/events/${filename}`, import.meta.url));
  const raw = JSON.parse(await readFile(path, 'utf8'));
  return parsePublicCollection(raw);
}

export async function getUpcomingEvents() {
  const collection = await loadEventCollection('upcoming.json');
  return collection.items;
}

export async function getArchiveEvents() {
  const collection = await loadEventCollection('archive.json');
  return collection.items;
}

export async function getAllEventsBySlug() {
  const [upcoming, archive] = await Promise.all([getUpcomingEvents(), getArchiveEvents()]);
  const map = new Map<string, PublicEventRecord>();
  [...upcoming, ...archive].forEach((event) => {
    map.set(event.slug, event);
  });
  return map;
}
