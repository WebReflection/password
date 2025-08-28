declare function _default(password?: IO, shared_iv?: Uint8Array): {
    /**
     * @template {IO} T
     * @param {T} value
     * @param {Uint8Array} [iv=shared_iv]
     * @returns {Promise<T extends string ? string : T extends ArrayBufferLike ? ArrayBufferLike : T extends ArrayBufferView ? ArrayBufferView : never>}
     */
    encrypt: <T extends IO>(value: T, iv?: Uint8Array) => Promise<T extends string ? string : T extends ArrayBufferLike ? ArrayBufferLike : T extends ArrayBufferView ? ArrayBufferView : never>;
    /**
     * @template {IO} T
     * @param {T} value
     * @param {Uint8Array} [iv=shared_iv]
     * @returns {Promise<T extends string ? string : T extends ArrayBufferLike ? ArrayBufferLike : T extends ArrayBufferView ? ArrayBufferView : never>}
     */
    decrypt: <T extends IO>(value: T, iv?: Uint8Array) => Promise<T extends string ? string : T extends ArrayBufferLike ? ArrayBufferLike : T extends ArrayBufferView ? ArrayBufferView : never>;
};
export default _default;
export type IO = string | ArrayBufferLike | ArrayBufferView;
