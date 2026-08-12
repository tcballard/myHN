export type FeedName = 'top' | 'new' | 'best' | 'ask';

export type HNItem = {
  id: number;
  deleted?: boolean;
  type?: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
  by?: string;
  time?: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  kids?: number[];
  url?: string;
  score?: number;
  title?: string;
  descendants?: number;
};

export type CommentNode = HNItem & {
  replies: CommentNode[];
};
