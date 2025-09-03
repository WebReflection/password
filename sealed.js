// 100% sealed module 🔒 - Browsers + Bun (Node leaks internally the crypto-key)
// this grants zero leaks only if imported before anything else
// ⚠️ watch out in NodeJS this practice is almost irrelevant
//     due native leaks: https://github.com/nodejs/node/issues/59699

import {
  Uint8Array,

  // helpers
  asTyped,
  when,

  // encode/decode
  decode,
  decoder,
  encode,
  encoder,

  // trapped crypto
  randomUUID,
  importKey,
  deriveKey,
  encrypt,
  decrypt,

  // extras
  withResolvers,
  freeze,
} from './utils.js';

// encryption details
const name = 'PBKDF2';
const method = 'AES-CBC';
const iterations = 8192;
const SHA = 256;

// the sealed module
export default (
  password = randomUUID(),
  shared_iv = new Uint8Array(16),
) => {
  const salt = typeof password === 'string' ? encoder(password) : password;
  const { promise: bootstrap, reject, resolve } = withResolvers();
  let key;

  when(
    importKey(
      'raw',
      salt,
      { name },
      false,
      ['deriveBits', 'deriveKey']
    ),
    importedKey => {
      when(
        deriveKey(
          {
            name,
            salt,
            iterations,
            hash: `SHA-${SHA}`
          },
          importedKey,
          { name: method, length: SHA },
          true,
          ['encrypt', 'decrypt']
        ),
        derivedKey => {
          key = derivedKey;
          resolve();
        },
        reject,
      );
    },
    reject,
  );

  return freeze({
    encrypt: (value, iv = shared_iv) => {
      const { promise, reject, resolve } = withResolvers();
      when(
        bootstrap,
        (asString = typeof value === 'string') => {
          when(
            encrypt(
              { name: method, iv },
              key,
              asString ? encoder(value) : value,
            ),
            encrypted => {
              resolve(asString ? encode(encrypted) : asTyped(value, encrypted));
            },
            reject,
          );
        },
        reject,
      );
      return promise;
    },

    decrypt: (value, iv = shared_iv) => {
      const { promise, reject, resolve } = withResolvers();
      when(
        bootstrap,
        (asString = typeof value === 'string') => {
          when(
            decrypt(
              { name: method, iv },
              key,
              asString ? decode(value) : value,
            ),
            decrypted => {
              resolve(asString ? decoder(decrypted) : asTyped(value, decrypted));
            },
            reject,
          );
        },
        reject,
      );
      return promise;
    },
  });
};
