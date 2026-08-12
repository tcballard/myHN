import type { CommentNode, FeedName, HNItem } from '@/types/hn';

const API_ROOT = 'https://hacker-news.firebaseio.com/v0';
const PAGE_SIZE = 35;

const feedPaths: Record<FeedName, string> = {
  top: 'topstories',
  new: 'newstories',
  best: 'beststories',
  ask: 'askstories',
};

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_ROOT}/${path}.json`, { signal });
  if (!response.ok) {
    throw new Error(`Hacker News returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getItem(id: number, signal?: AbortSignal) {
  return fetchJson<HNItem>(`item/${id}`, signal);
}

export async function getFeed(feed: FeedName, signal?: AbortSignal) {
  const ids = await fetchJson<number[]>(feedPaths[feed], signal);
  const pageIds = ids.slice(0, PAGE_SIZE);
  const stories: HNItem[] = [];

  // Fetch in small batches to keep first paint quick without opening dozens of
  // simultaneous connections on a phone.
  for (let index = 0; index < pageIds.length; index += 10) {
    const batch = pageIds.slice(index, index + 10);
    const items = await Promise.all(batch.map((id) => getItem(id, signal)));
    stories.push(...items.filter((item) => !item.deleted && !item.dead));
  }

  return stories;
}

type CommentBudget = { remaining: number };

async function getCommentNode(
  id: number,
  signal: AbortSignal | undefined,
  budget: CommentBudget,
  depth: number,
): Promise<CommentNode | null> {
  if (budget.remaining <= 0) return null;
  budget.remaining -= 1;

  const item = await getItem(id, signal);
  if (item.dead) return null;

  const childIds = depth < 4 ? (item.kids ?? []).slice(0, 12) : [];
  const childResults = await Promise.all(
    childIds.map((childId) => getCommentNode(childId, signal, budget, depth + 1)),
  );

  return {
    ...item,
    replies: childResults.filter((child): child is CommentNode => child !== null),
  };
}

export async function getCommentTree(ids: number[], signal?: AbortSignal) {
  const budget: CommentBudget = { remaining: 80 };
  const roots: CommentNode[] = [];

  // Root comments load sequentially so the shared item budget is deterministic.
  for (const id of ids.slice(0, 30)) {
    if (budget.remaining <= 0) break;
    const node = await getCommentNode(id, signal, budget, 0);
    if (node) roots.push(node);
  }

  return roots;
}
