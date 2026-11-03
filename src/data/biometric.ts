/**
 * Empreinte / verrouillage d'écran de l'appareil via WebAuthn (authentificateur de plateforme) et l'extension PRF.
 * Le code PIN est chiffré avec une clé que seul l'authentificateur peut redonner après une vérification biométrique :
 * sans l'empreinte (ou le verrouillage d'écran), le PIN n'est pas récupérable. Si l'appareil ne gère pas PRF,
 * l'option est refusée plutôt que simulée.
 */
export interface BiometricProvider {
  isAvailable(): Promise<boolean>;
  /** Crée un identifiant ; `prf` indique si l'appareil sait produire un secret. */
  create(): Promise<{ credentialId: Uint8Array<ArrayBuffer>; prf: boolean }>;
  /** Demande une vérification biométrique et renvoie un secret de 32 octets lié à `salt`. */
  secret(credentialId: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>>;
}

const rand = (n: number) => crypto.getRandomValues(new Uint8Array(n));

export const webAuthnProvider: BiometricProvider = {
  async isAvailable() {
    try {
      return (
        typeof PublicKeyCredential !== 'undefined' &&
        (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
      );
    } catch {
      return false;
    }
  },

  async create() {
    const cred = (await navigator.credentials.create({
      publicKey: {
        rp: { name: 'MIA' },
        user: { id: rand(16), name: 'mia', displayName: 'MIA' },
        challenge: rand(32),
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
        extensions: { prf: {} } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
    if (!cred) throw new Error('cancelled');
    const ext = cred.getClientExtensionResults() as { prf?: { enabled?: boolean } };
    return { credentialId: new Uint8Array(cred.rawId), prf: ext.prf?.enabled === true };
  },

  async secret(credentialId, salt) {
    const cred = (await navigator.credentials.get({
      publicKey: {
        challenge: rand(32),
        allowCredentials: [{ type: 'public-key', id: credentialId }],
        userVerification: 'required',
        extensions: { prf: { eval: { first: salt } } } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null;
    const first = (cred?.getClientExtensionResults() as { prf?: { results?: { first?: ArrayBuffer } } } | undefined)?.prf
      ?.results?.first;
    if (!first) throw new Error('noPrf');
    return new Uint8Array(first);
  },
};
