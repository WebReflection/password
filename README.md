# @webreflection/password

[![Coverage Status](https://coveralls.io/repos/github/WebReflection/password/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/password?branch=main)

<sup>**Social Media Photo by [Jaye Haych](https://unsplash.com/@jaye_haych) on [Unsplash](https://unsplash.com/)**</sup>

A minimalistic *AES-CBC* and *PBKDF2* based encryption/decryption utility for both *Web* and *Servers*.

```js
import password from 'https://esm.run/@webreflection/password';

const { encrypt, decrypt } = password(
  // a "salt" or (hopefully) strong password
  // it defaults to one-off `crypto.randomUUID()` if not provided
  process.env.SECRET_PASSWORD,
  // the optional initialization vector (iv) to use
  // it defaults to an ampty new Uint8Array(16)
  crypto.getRandomValues(new Uint8Array(16))
);

const secret = 'nobody should read this';
const encrypted = await encrypt(secret);
const decrypted = await decrypt(encrypted);

console.assert(secret === decrypted);
```

The *input* and *output* of both `encrypt` and `decrypt` are symmetric:

  * if the passed *input* is `string`, a base 64 string is returned while encrypting, or the original string while decrypting (from that base 64 string)
  * if the passed *input* is `ArrayBuffer`, an `ArrayBuffer` is returned
  * if the passed *input* is a `Uint8Array`, a `Uint8Array` is returned
