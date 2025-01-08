import { Base64 } from 'js-base64';
import pako from 'pako';

export const decode_oct_utf8 = (content: string) => {
    const byteArray = content.split('\\').filter(Boolean).map(octal => parseInt(octal, 8));
    const uint8Array = new Uint8Array(byteArray);
    const textDecoder = new TextDecoder('utf-8');
    return textDecoder.decode(uint8Array);
};

export const encode_gzip = (content: string) => {
    const result = pako.gzip(content);
    return Base64.fromUint8Array(result);
}

export const decode_gzip = (content: string) => {
    const result = Base64.toUint8Array(content);
    return pako.ungzip(result, { to: 'string' });
}