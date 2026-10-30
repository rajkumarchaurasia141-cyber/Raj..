/**
 * Resilient YouTube URL Parser, Playlist Extractor, Embed Builder & No-API Search Shortcut Helper
 * Supports:
 * - Standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short URLs: https://youtu.be/VIDEO_ID
 * - Live URLs: https://www.youtube.com/live/VIDEO_ID
 * - Shorts URLs: https://www.youtube.com/shorts/VIDEO_ID
 * - Mobile URLs: https://m.youtube.com/watch?v=VIDEO_ID
 * - Public Playlist URLs: https://www.youtube.com/playlist?list=PLAYLIST_ID
 * - Watch URL with Playlist: https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
 * - Embed URLs & raw <iframe> snippets
 * - Direct 11-character video IDs
 *
 * IMPORTANT PERFORMANCE NOTE:
 * Does NOT force non-standard `vq=small` or `vq=medium` query parameters on the iframe URL,
 * allowing YouTube's native Adaptive Bitrate (ABR) streaming engine to select optimal quality
 * without buffering or re-initializing the player.
 */

export function extractYouTubeVideoId(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  let clean = input.trim();

  if (clean === 'ai_studio_lecture' || clean.includes('ai_studio')) {
    return null;
  }

  // Extract src if user pasted full <iframe ... src="...">
  const iframeSrcMatch = clean.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    clean = iframeSrcMatch[1].trim();
  }

  // If user pasted YouTube mobile share text like "Class 10 Math https://youtu.be/abc123?si=xyz", extract the URL
  const embeddedUrlMatch = clean.match(/https?:\/\/[^\s"'<>]+/i);
  if (embeddedUrlMatch && embeddedUrlMatch[0]) {
    clean = embeddedUrlMatch[0].trim();
  }

  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Try URL parsing
  try {
    const urlObj = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
    const host = urlObj.hostname.replace(/^www\./, '').replace(/^m\./, '');

    if (host === 'youtu.be') {
      const id = urlObj.pathname.split('/').filter(Boolean)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const vParam = urlObj.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;

      // Paths like /live/ID, /embed/ID, /shorts/ID, /v/ID
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const markerIdx = parts.findIndex((p) => ['live', 'embed', 'shorts', 'v'].includes(p));
      if (markerIdx !== -1 && parts[markerIdx + 1]) {
        const candidate = parts[markerIdx + 1].split('?')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) return candidate;
      }
    }
  } catch {
    // Fallback regex
  }

  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = clean.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Extracts a valid YouTube Playlist ID (`PL...`, `OL...`, `UU...`, `RD...`, `FL...`)
 * from any YouTube playlist URL, watch URL with `list=`, embed `videoseries?list=`, or raw playlist ID.
 */
export function extractYouTubePlaylistId(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  let clean = input.trim();

  if (clean === 'ai_studio_lecture' || clean.includes('ai_studio')) {
    return null;
  }

  // Extract src if user pasted full <iframe ... src="...">
  const iframeSrcMatch = clean.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    clean = iframeSrcMatch[1].trim();
  }

  // Direct Playlist ID (typically starts with PL, OLAK5uy, UU, FL, RD and is 13-42 chars)
  if (/^(PL|OLAK5uy_|UU|FL|RD)[a-zA-Z0-9_-]{10,48}$/.test(clean)) {
    return clean;
  }

  try {
    const urlObj = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
    const listParam = urlObj.searchParams.get('list');
    if (listParam && /^[a-zA-Z0-9_-]{10,64}$/.test(listParam)) {
      return listParam;
    }
  } catch {
    // Fallback regex
  }

  const listMatch = clean.match(/[?&]list=([a-zA-Z0-9_-]{10,64})/i);
  if (listMatch && listMatch[1]) {
    return listMatch[1];
  }

  return null;
}

/**
 * Validates whether an input string contains a valid YouTube Video ID or Playlist ID.
 */
export function isValidYouTubeUrlOrId(input?: string | null): {
  valid: boolean;
  videoId: string | null;
  playlistId: string | null;
  isPlaylistOnly: boolean;
} {
  const videoId = extractYouTubeVideoId(input);
  const playlistId = extractYouTubePlaylistId(input);
  return {
    valid: Boolean(videoId || playlistId),
    videoId,
    playlistId,
    isPlaylistOnly: Boolean(!videoId && playlistId)
  };
}

export interface YouTubeEmbedOptions {
  useNoCookie?: boolean;
  autoplay?: boolean;
  startSeconds?: number;
  playlistId?: string | null;
}

/**
 * Builds a clean, stable YouTube Official Embed URL for single videos or playlists.
 * Does NOT append `vq=small` or dynamic timestamps that cause iframe reloads.
 */
export function getYouTubeEmbedUrl(
  input?: string | null,
  options?: YouTubeEmbedOptions
): string {
  const safeInput = typeof input === 'string' ? input : '';
  const videoId = extractYouTubeVideoId(safeInput);
  const extractedPlaylistId = options?.playlistId || extractYouTubePlaylistId(safeInput);
  const domain = options?.useNoCookie
    ? 'https://www.youtube-nocookie.com'
    : 'https://www.youtube.com';

  const params = new URLSearchParams({
    autoplay: options?.autoplay === false ? '0' : '1',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    iv_load_policy: '3'
  });

  if (options?.startSeconds && options.startSeconds > 10) {
    params.set('start', String(Math.floor(options.startSeconds)));
  }

  // Case 1: Video + optional Playlist
  if (videoId) {
    if (extractedPlaylistId) {
      params.set('list', extractedPlaylistId);
    }
    return `${domain}/embed/${videoId}?${params.toString()}`;
  }

  // Case 2: Public Playlist Only (videoseries embed)
  if (extractedPlaylistId) {
    params.set('listType', 'playlist');
    params.set('list', extractedPlaylistId);
    return `${domain}/embed/videoseries?${params.toString()}`;
  }

  return safeInput ? safeInput.trim() : '';
}

export function getYouTubeDirectWatchUrl(input?: string | null, playlistId?: string): string {
  const safeInput = typeof input === 'string' ? input : '';
  const videoId = extractYouTubeVideoId(safeInput);
  const plId = playlistId || extractYouTubePlaylistId(safeInput);
  if (videoId && plId) {
    return `https://www.youtube.com/watch?v=${videoId}&list=${plId}`;
  }
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  if (plId) {
    return `https://www.youtube.com/playlist?list=${plId}`;
  }
  return safeInput ? safeInput.trim() : 'https://www.youtube.com';
}

export function getYouTubeThumbnailUrl(input?: string | null): string | null {
  const videoId = extractYouTubeVideoId(input);
  if (!videoId || videoId === 'dQw4w9WgXcQ') return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Generates a No-API YouTube Search Shortcut URL tailored for Bihar Board Class 10 Hindi Medium
 * across subjects, chapters, and exam categories.
 */
export function getYouTubeSearchShortcutUrl(
  subjectName?: string | null,
  chapterName?: string | null,
  libraryCategory?: string | null
): string {
  const parts: string[] = ['Bihar Board Class 10'];

  if (subjectName && subjectName !== 'all' && subjectName !== 'सभी विषय') {
    parts.push(subjectName);
  }
  if (chapterName && chapterName !== 'all') {
    parts.push(chapterName);
  }
  if (libraryCategory && libraryCategory !== 'All') {
    const categoryHindiMap: Record<string, string> = {
      'Complete Courses': 'Full Course One Shot',
      'Chapter-wise Lectures': 'Chapter Lecture in Hindi',
      'Objective & Subjective': 'VVI Objective Subjective Questions',
      'Previous-Year Questions': 'Question Bank PYQ Solution',
      'Model Paper Solutions': 'Official Model Paper Solution',
      'Revision Classes': 'Maha Marathon Revision',
      'Exam Preparation': 'Board Exam VVI Guess Questions'
    };
    parts.push(categoryHindiMap[libraryCategory] || libraryCategory);
  } else {
    parts.push('Hindi Medium');
  }

  const query = parts.join(' ').trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
