import * as LosslessJSON from 'lossless-json';

export const deepParse = (s: string): unknown => LosslessJSON.parse(s, (_, v) => {
    try {
        return typeof v === 'string' && !/^\d+$/.test(v) ? deepParse(v) : v;
    } catch {
        return v;
    }
});

export const format_json = (data: string) => LosslessJSON.stringify(LosslessJSON.parse(data), null, 4)!;

export const enhanced_format_json = (data: string) => LosslessJSON.stringify(deepParse(data), null, 4)!;

export const compress_json = (data: string) => LosslessJSON.stringify(LosslessJSON.parse(data))!;
