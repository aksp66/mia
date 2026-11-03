/** Petite vibration de confirmation (Android) ; sans effet ailleurs ou si l'utilisatrice réduit les animations. */
export function haptic(ms = 12): void {
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    navigator.vibrate?.(ms);
  } catch {
    /* non pris en charge */
  }
}
