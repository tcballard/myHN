export const palette = {
  light: {
    background: '#F5F1E8',
    surface: '#FFFDF8',
    surfacePressed: '#F0EADF',
    text: '#191919',
    muted: '#69645C',
    subtle: '#DDD6C9',
    accent: '#E85D1A',
    accentSoft: '#FCE1D3',
    error: '#A32D21',
  },
  dark: {
    background: '#151515',
    surface: '#202020',
    surfacePressed: '#292929',
    text: '#F5F1E8',
    muted: '#AAA59C',
    subtle: '#393939',
    accent: '#FF7A35',
    accentSoft: '#482719',
    error: '#FF8A7E',
  },
} as const;

export type AppColors = (typeof palette)[keyof typeof palette];
