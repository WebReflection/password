async function test(module, pollute) {
  const { default: password } = await import(module);
  if (pollute) {
    // TEST ENVIRONMENT POLLUTION
    const { then } = Promise.prototype;
    Promise.prototype.then = function (after, ...rest) {
      return then.call(this, value => {
        if (this instanceof CryptoKey || value instanceof CryptoKey) console.log('BUSTED', this);
        return after(value);
      }, ...rest);
    };
  }

  console.time(module);
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
  console.timeEnd(module);
}

await test('./index.js', false);
await test('./sealed.js', true);

const { getter, getset, setter } = await import('./utils.js');
const m = new Map([['a', 1]]);
console.assert(getter(m, 'size')() === 1, 'getter');

class Accessors {
  #size;
  constructor(value = 0) {
    this.#size = value;
  }
  get size() {
    return this.#size;
  }
  set size(value) {
    this.#size = value;
  }
}

const a = new Accessors;
console.assert(getter(a, 'size')() === 0);
setter(a, 'size')(1);
console.assert(getter(a, 'size')() === 1);
const ags = getset(a, 'size');
console.assert(ags.get() === 1);
ags.set(2);
console.assert(ags.get() === 2);
