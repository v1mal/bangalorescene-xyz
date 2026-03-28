export function buildEventShareText(url: string) {
  return `Check out this event: ${url}`;
}

export async function shareEventLink(title: string, url: string) {
  const shareText = buildEventShareText(url);

  if (navigator.share) {
    await navigator.share({
      title,
      text: shareText
    });
    return 'shared';
  }

  await navigator.clipboard.writeText(shareText);
  return 'copied';
}
