/**
 * Photo registry. Files live in public/images as <name>-640 / -1280 in WebP and JPEG.
 * Alt text describes what is in the picture, for people who can't see it.
 */
export const PHOTOS = {
  teamLaptops: {
    name: 'team-laptops',
    width: 1280,
    height: 853,
    alt: 'Two people at a table with laptops, one gesturing at a website on screen as they talk it through.',
  },
  teamBoard: {
    name: 'team-board',
    width: 1280,
    height: 720,
    alt: 'Four colleagues planning a project with colourful sticky notes on a glass wall.',
  },
  dashboardLaptop: {
    name: 'dashboard-laptop',
    width: 1280,
    height: 911,
    alt: 'A laptop on a desk showing an analytics dashboard with charts and user numbers.',
  },
} as const

export type PhotoKey = keyof typeof PHOTOS
