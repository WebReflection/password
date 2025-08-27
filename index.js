// @ts-check

/** @typedef {string|ArrayBufferLike|ArrayBufferView} IO */

const {
  // global utils
  ArrayBuffer: { isView },
  String: { fromCharCode },
  crypto: { subtle },

  // global polyfills
  /* c8 ignore start */
  // @ts-ignore
  atob = str => globalThis.Buffer.from(str, 'base64').toString(),
  // @ts-ignore
  btoa = str => globalThis.Buffer.from(str).toString('base64'),
  /* c8 ignore stop */
} = globalThis;

// @ts-ignore
const asTyped = (_, $) => isView(_) ? new _.constructor($) : $;

/**
 * @param {string} c
 * @returns
 */
const asCharCode = c => c.charCodeAt(0);

/**
 * @param {string} chars 
 * @returns
 */
const decode = chars => Uint8Array.from(atob(chars), asCharCode);

/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
const encode = buffer => btoa(fromCharCode(...new Uint8Array(buffer)));

const encoder = new TextEncoder;
const decoder = new TextDecoder;

const name = 'PBKDF2';
const method = 'AES-CBC';

const iterations = 8192;
const SHA = 256;

/**
 * @param {IO} [password=crypto.randomUUID()]
 * @param {Uint8Array} [iv=new Uint8Array(16)]
 * @returns
 */
export default (
  password = crypto.randomUUID(),
  // for secure one-off operations pass:
  // crypto.getRandomValues(new Uint8Array(16))
  iv = new Uint8Array(16),
) => {
  const salt = typeof password === 'string' ? encoder.encode(password) : password;
  const details = { name: method, iv };

  // @ts-ignore
  const key = subtle.importKey(
    'raw',
    salt,
    { name },
    false,
    ['deriveBits', 'deriveKey']
  ).then(key => subtle.deriveKey(
    {
      name,
      // @ts-ignore
      salt,
      iterations,
      hash: `SHA-${SHA}`
    },
    key,
    { name: method, length: SHA },
    true,
    ['encrypt', 'decrypt']
  ));

  return {
    /**
     * @template {IO} T
     * @param {T} value
     * @returns {Promise<T extends string ? string : T extends ArrayBufferLike ? ArrayBufferLike : T extends ArrayBufferView ? ArrayBufferView : never>}
     */
    encrypt: async value => {
      const asString = typeof value === 'string';
      const encrypted = await subtle.encrypt(
        details,
        await key,
        // @ts-ignore
        asString ? encoder.encode(value) : value,
      );
      // @ts-ignore
      return asString ? encode(encrypted) : asTyped(value, encrypted);
    },

    /**
     * @template {IO} T
     * @param {T} value
     * @returns {Promise<T extends string ? string : T extends ArrayBufferLike ? ArrayBufferLike : T extends ArrayBufferView ? ArrayBufferView : never>}
     */
    decrypt: async value => {
      const asString = typeof value === 'string';
      const decrypted = await subtle.decrypt(
        details,
        await key,
        // @ts-ignore
        asString ? decode(value) : value
      );
      // @ts-ignore
      return asString ? decoder.decode(decrypted) : asTyped(value, decrypted);
    },
  };
};
