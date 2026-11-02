import { db, type DayLogRow, type MiaDB, type PeriodRow } from './db';
import { attempt, type Result } from './result';

/**
 * Verrouillage par code (section 13.2). Clé dérivée du PIN (PBKDF2-SHA-256, sel aléatoire), chiffrement AES-GCM 256.
 *
 * Modèle : quand le verrou est actif, les règles et le journal sont stockés chiffrés dans `meta.vault`
 * et les magasins en clair sont vidés. Au déverrouillage, le contenu est restauré en clair le temps de la
 * session ; au verrouillage il est rechiffré puis effacé. Les réglages non sensibles restent en clair.
 * Limite connue : si l'application est tuée pendant une session ouverte, les données en clair restent
 * sur l'appareil jusqu'au prochain verrouillage.
 */
export const PBKDF2_ITERATIONS = 310_000;
export const AUTO_LOCK_MS = 2 * 60 * 1000;
export const PIN_PATTERN = /^\d{4,6}$/;

interface Blob64 {
  iv: string;
  data: string;
}
interface Snapshot {
  periods: PeriodRow[];
  dayLogs: DayLogRow[];
}

export type VaultStatus = 'loading' | 'disabled' | 'locked' | 'unlocked';

const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64(u: Uint8Array): string {
  let s = '';
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s);
}
const fromB64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export class Vault {
  private key: CryptoKey | null = null;
  private status: VaultStatus = 'loading';
  private listeners = new Set<() => void>();
  private hiddenAt: number | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly d: MiaDB = db,
    private readonly iterations = PBKDF2_ITERATIONS,
  ) {}

  getStatus = (): VaultStatus => this.status;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  private set(s: VaultStatus) {
    this.status = s;
    this.listeners.forEach((l) => l());
  }

  /** Lit l'état persistant : verrou actif => « locked » tant que le PIN n'a pas été saisi. */
  async init(): Promise<void> {
    const enabled = (await this.d.settings.get('lockEnabled'))?.value === true;
    this.key = null;
    this.set(enabled ? 'locked' : 'disabled');
  }

  private async derive(pin: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
    const base = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  private async seal(key: CryptoKey, snap: Snapshot): Promise<Blob64> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(snap)));
    return { iv: toB64(iv), data: toB64(new Uint8Array(data)) };
  }

  private async open(key: CryptoKey, blob: Blob64): Promise<Snapshot> {
    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(blob.iv) }, key, fromB64(blob.data));
    return JSON.parse(dec.decode(buf)) as Snapshot;
  }

  private async snapshot(): Promise<Snapshot> {
    const [periods, dayLogs] = await Promise.all([this.d.periods.toArray(), this.d.dayLogs.toArray()]);
    return { periods, dayLogs };
  }

  /** Active le verrou (données ouvertes dans la session courante). */
  enable(pin: string): Promise<Result<void>> {
    return attempt(async () => {
      if (!PIN_PATTERN.test(pin)) throw new Error('badPin');
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await this.derive(pin, salt, this.iterations);
      const vault = await this.seal(key, await this.snapshot());
      await this.d.transaction('rw', this.d.meta, this.d.settings, async () => {
        await this.d.meta.put({ key: 'encryption', value: { salt: toB64(salt), iterations: this.iterations } });
        await this.d.meta.put({ key: 'vault', value: vault });
        await this.d.meta.put({ key: 'session', value: 'open' });
        await this.d.settings.put({ key: 'lockEnabled', value: true });
      });
      this.key = key;
      this.set('unlocked');
    });
  }

  /** Rechiffre puis efface les données en clair. N'efface rien si le chiffrement échoue. */
  lock(): Promise<Result<void>> {
    return attempt(async () => {
      if (this.status !== 'unlocked' || !this.key) return;
      const vault = await this.seal(this.key, await this.snapshot());
      await this.d.transaction('rw', this.d.meta, this.d.periods, this.d.dayLogs, async () => {
        await this.d.meta.put({ key: 'vault', value: vault });
        await this.d.meta.put({ key: 'session', value: 'closed' });
        await this.d.periods.clear();
        await this.d.dayLogs.clear();
      });
      this.key = null;
      this.set('locked');
    });
  }

  unlock(pin: string): Promise<Result<void>> {
    return attempt(async () => {
      const meta = (await this.d.meta.get('encryption'))?.value as { salt: string; iterations: number } | undefined;
      const blob = (await this.d.meta.get('vault'))?.value as Blob64 | undefined;
      if (!meta || !blob) throw new Error('noVault');
      const key = await this.derive(pin, fromB64(meta.salt), meta.iterations);
      let snap: Snapshot;
      try {
        snap = await this.open(key, blob);
      } catch {
        throw new Error('wrongPin');
      }
      const sessionOpen = (await this.d.meta.get('session'))?.value === 'open';
      // Session précédemment interrompue : les données en clair sont plus récentes que le coffre.
      if (!sessionOpen) {
        await this.d.transaction('rw', this.d.meta, this.d.periods, this.d.dayLogs, async () => {
          await this.d.periods.clear();
          await this.d.dayLogs.clear();
          await this.d.periods.bulkPut(snap.periods);
          await this.d.dayLogs.bulkPut(snap.dayLogs);
          await this.d.meta.put({ key: 'session', value: 'open' });
        });
      }
      this.key = key;
      this.set('unlocked');
    });
  }

  /** Désactive le verrou (session déverrouillée uniquement). */
  disable(): Promise<Result<void>> {
    return attempt(async () => {
      if (this.status !== 'unlocked') throw new Error('locked');
      await this.d.transaction('rw', this.d.meta, this.d.settings, async () => {
        await this.d.meta.bulkDelete(['encryption', 'vault', 'session']);
        await this.d.settings.put({ key: 'lockEnabled', value: false });
      });
      this.key = null;
      this.set('disabled');
    });
  }

  /** À appeler après une suppression totale des données. */
  reset(): void {
    this.key = null;
    this.set('disabled');
  }

  /** Verrouille après 2 minutes en arrière-plan (vérifié aussi au retour au premier plan). */
  installAutoLock(target: Document = document): () => void {
    const onChange = () => {
      clearTimeout(this.timer);
      if (target.visibilityState === 'hidden') {
        this.hiddenAt = Date.now();
        this.timer = setTimeout(() => void this.lock(), AUTO_LOCK_MS);
      } else {
        const away = this.hiddenAt === null ? 0 : Date.now() - this.hiddenAt;
        this.hiddenAt = null;
        if (away >= AUTO_LOCK_MS) void this.lock();
      }
    };
    target.addEventListener('visibilitychange', onChange);
    return () => {
      clearTimeout(this.timer);
      target.removeEventListener('visibilitychange', onChange);
    };
  }
}

export const vault = new Vault();
