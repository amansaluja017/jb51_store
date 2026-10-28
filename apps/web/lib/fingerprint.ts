/**
 * Browser Fingerprinting Utility for JB51 Store
 * Generates a stable, client-side browser fingerprint combining screen metrics,
 * canvas rendering characteristics, language, hardware concurrency, and timezone.
 */

const STORAGE_KEY = 'jb51_browser_fingerprint';

/**
 * Generates a canvas visual signature based on GPU/font rasterization
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    // Text with stroke and fill
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = '#FF5E36';
    ctx.fillText('JB51 Heritage Punjabi Suits ✤ 1951', 2, 2);

    // Gradient rectangle
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#FF5E36');
    gradient.addColorStop(0.5, '#E04D27');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(2, 25, 200, 15);

    // Subtle composite curve
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(50, 48, 10, 0, Math.PI * 2, true);
    ctx.stroke();

    return canvas.toDataURL();
  } catch (_) {
    return 'canvas-blocked';
  }
}

/**
 * Hashes an arbitrary string into a hex SHA-256 representation
 */
async function sha256(message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Basic fallback hash for non-crypto environments
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }

  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Returns or generates a persistent browser fingerprint
 */
export async function getBrowserFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server-rendered-guest';
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached && cached.trim().length >= 16) {
      return cached;
    }
  } catch (_) {}

  // Gather browser and hardware signals
  const userLang = 'userLanguage' in navigator ? String((navigator as unknown as { userLanguage: unknown }).userLanguage) : '';
  const signals: Record<string, unknown> = {
    ua: navigator.userAgent,
    language: navigator.language || userLang || '',
    languages: navigator.languages?.join(',') || '',
    colorDepth: screen.colorDepth || 24,
    screenRes: `${screen.width}x${screen.height}`,
    availableRes: `${screen.availWidth}x${screen.availHeight}`,
    pixelRatio: window.devicePixelRatio || 1,
    timezoneOffset: new Date().getTimezoneOffset(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    canvas: getCanvasFingerprint(),
  };

  const rawString = JSON.stringify(signals);
  const hash = await sha256(rawString);
  const finalFingerprint = `bfp_${hash.substring(0, 32)}`;

  try {
    localStorage.setItem(STORAGE_KEY, finalFingerprint);
  } catch (_) {}

  return finalFingerprint;
}
