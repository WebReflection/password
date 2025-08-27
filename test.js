import password from './index.js';

const { encrypt, decrypt } = password(
  '1234567890',
  new Uint8Array(16),
);

const source = 'Hello, world!';
const encrypted = await encrypt('Hello, world!');
const decrypted = await decrypt(encrypted);

console.log({ source, encrypted, decrypted });
console.assert(decrypted === source);

const view = new TextEncoder().encode('Hello, world!');
const buffer = view.buffer;

console.assert(await encrypt(view) instanceof Uint8Array);
console.assert(await encrypt(buffer) instanceof ArrayBuffer);

console.assert(await decrypt(await encrypt(view)) instanceof Uint8Array);
console.assert(await decrypt(await encrypt(buffer)) instanceof ArrayBuffer);
console.assert(new TextDecoder().decode(await decrypt(await encrypt(view))) === source);
console.assert(new TextDecoder().decode(await decrypt(await encrypt(buffer))) === source);

const ui8 = password(new TextEncoder().encode('1234567890'));
console.assert(await ui8.encrypt(source) === encrypted);
