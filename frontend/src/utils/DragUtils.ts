import { DragEvent } from 'react';

// eslint-disable-next-line import/prefer-default-export
export function getUrlFromDrag(e: DragEvent<HTMLDivElement>) {
  const chromeUrl = e.dataTransfer.getData('URL');
  let linkUrl: string | null = null;
  let title: string | null = null;

  // CHROMIUM
  if (chromeUrl && chromeUrl !== '') {
    linkUrl = chromeUrl;
  }
  // MOZ
  if (!linkUrl) {
    const moz = e.dataTransfer.getData('text/x-moz-url');
    if (moz && moz !== '') {
      const split = moz.split('\n');
      if (split.length === 2) {
        [linkUrl, title] = split;
      }
    }
  }

  return linkUrl
    ? {
        url: linkUrl,
        title,
      }
    : null;
}
