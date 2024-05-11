export const decode_oct_utf8 = (content: string) => {
    const byteArray = content.split('\\').filter(Boolean).map(octal => parseInt(octal, 8));
    const uint8Array = new Uint8Array(byteArray);
    const textDecoder = new TextDecoder('utf-8');
    return textDecoder.decode(uint8Array);
};
