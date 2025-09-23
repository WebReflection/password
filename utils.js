const {
  ArrayBuffer: { isView },
  Function: { prototype: { apply, bind, call } },
  Object: { freeze, getOwnPropertyDescriptor, getPrototypeOf },
  Promise: { prototype: { then } },
  String: { fromCharCode, prototype: { charCodeAt } },
  Uint8Array,
  crypto: { subtle },
  atob,
  btoa,
} = globalThis;

export { isView, freeze, fromCharCode, charCodeAt, Uint8Array };

// essential
export const applier = call.bind(apply);
export const caller = call.bind(call);

// helpers
export const asTyped = (_, $) => isView(_) ? new _.constructor($) : $;
export const asCharCode = c => caller(charCodeAt, c, 0);
export const bound = (_, $) => caller(bind, _[$], _);
export const when = (value, ok, ...err) => caller(then, value, ok, ...err);

// encode/decode
export const decode = chars => ui8aFrom(atob(chars), asCharCode);
export const decoder = bound(new TextDecoder, 'decode');

export const encode = buffer => btoa(applier(fromCharCode, null, new Uint8Array(buffer)));
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

// accessors
const descriptor = (_, $) => {
  let d;
  while (!(d = getOwnPropertyDescriptor(_, $))) _ = getPrototypeOf(_);
  return d;
};
export const getter = (_, $) => caller(bind, descriptor(_, $).get, _);
export const getset = (_, $) => {
  const { get, set } = descriptor(_, $);
  return {
    get: caller(bind, get, _),
    set: caller(bind, set, _),
  };
};
export const setter = (_, $) => caller(bind, descriptor(_, $).set, _);
