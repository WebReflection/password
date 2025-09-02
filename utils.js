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

export { isView, fromCharCode, charCodeAt, Uint8Array };

// essential
export const applier = call.bind(apply);
export const caller = call.bind(call);

// helpers
export const asTyped = (_, $) => isView(_) ? new _.constructor($) : $;
export const asCharCode = c => caller(charCodeAt, c, 0);
export const bound = (_, $) => _[$].bind(_);
export const when = (value, after) => caller(then, value, after);

// encode/decode
export const decode = chars => ui8aFrom(atob(chars), asCharCode);
export const decoder = bound(new TextDecoder, 'decode');

export const encode = buffer => btoa(applier(fromCharCode, null, isView(buffer) ? buffer : new Uint8Array(buffer)));
export const encoder = bound(new TextEncoder, 'encode');

// trapped crypto
export const randomUUID = bound(crypto, 'randomUUID');
export const importKey = bound(subtle, 'importKey');
export const deriveKey = bound(subtle, 'deriveKey');
export const encrypt = bound(subtle, 'encrypt');
export const decrypt = bound(subtle, 'decrypt');

// extras
export const ui8aFrom = bound(Uint8Array, 'from');
export const withResolvers = bound(Promise, 'withResolvers');
