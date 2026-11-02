/** Fichier .ics à titre neutre : aucune donnée du cycle (section 14). */
export function buildIcs(date: string, time = '090000'): string {
  const d = date.replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MIA//FR',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@mia`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${d}T${time}`,
    'SUMMARY:Rappel MIA',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel MIA',
    'TRIGGER:PT0S',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
