export function getAvatarFallbackLetter(name) {
  if (!name || typeof name !== 'string') return 'U';
  const trimmed = name.trim();
  if (!trimmed) return 'U';
  
  const match = trimmed.match(/[\p{L}\p{N}]/u);
  if (match) {
    return match[0].toUpperCase();
  }
  
  const firstChar = Array.from(trimmed)[0];
  return firstChar ? firstChar.toUpperCase() : 'U';
}

export function sanitizeAvatarUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && (parsed.hostname === 'avatars.githubusercontent.com' || parsed.hostname.endsWith('.githubusercontent.com'))) {
      if (!parsed.searchParams.has('s')) {
        parsed.searchParams.set('s', '72');
      }
      return parsed.toString();
    }
  } catch (err) {}
  return null;
}
