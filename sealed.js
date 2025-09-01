// 100% sealed module 🔒 - Browsers + Bun (Node leaks internally the crypto-key)
// this grants zero leaks only if imported before anything else
// ⚠️ watch out in NodeJS this practice is almost irrelevant
//     due native leaks: https://github.com/nodejs/node/issues/59699

const {
  ArrayBuffer: { isView },
  Function: { prototype: { apply, call } },
  Object: { freeze },
  Promise: { prototype: { then } },
  String: { fromCharCode, prototype: { charCodeAt } },
  Uint8Array,
  crypto: { subtle },
  atob,
  btoa,
} = globalThis;

// essential
const applier = call.bind(apply);
const caller = call.bind(call);

// helpers
const asTyped = (_, $) => isView(_) ? new _.constructor($) : $;
const asCharCode = c => caller(charCodeAt, c, 0);
const bound = (_, $) => _[$].bind(_);
const when = (value, after) => caller(then, value, after);

// encode/decode
const decode = chars => ui8aFrom(atob(chars), asCharCode);
const decoder = bound(new TextDecoder, 'decode');

const encode = buffer => btoa(applier(fromCharCode, null, new Uint8Array(buffer)));
const encoder = bound(new TextEncoder, 'encode');

// trapped crypto
const randomUUID = bound(crypto, 'randomUUID');
const importKey = bound(subtle, 'importKey');
const deriveKey = bound(subtle, 'deriveKey');
const encrypt = bound(subtle, 'encrypt');
const decrypt = bound(subtle, 'decrypt');

// extras
const ui8aFrom = bound(Uint8Array, 'from');
const withResolvers = bound(Promise, 'withResolvers');

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
  const { resolve, promise } = withResolvers();
  let key;

  when(
    importKey(
      'raw',
      salt,
      { name },
      false,
      ['deriveBits', 'deriveKey']
    ),
    importedKey => when(
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
    ),
  );

  return freeze({
    encrypt: (value, iv = shared_iv) => when(
      promise,
      (asString = typeof value === 'string') => when(
        encrypt(
          { name: method, iv },
          key,
          asString ? encoder(value) : value,
        ),
        encrypted => asString ? encode(encrypted) : asTyped(value, encrypted),
      ),
    ),

    decrypt: (value, iv = shared_iv) => when(
      promise,
      (asString = typeof value === 'string') => when(
        decrypt(
          { name: method, iv },
          key,
          asString ? decode(value) : value,
        ),
        decrypted => asString ? decoder(decrypted) : asTyped(value, decrypted),
      ),
    ),
  });
};
