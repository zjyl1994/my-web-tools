import * as LosslessJSON from 'lossless-json';
import { toast } from 'react-toastify';
import { Base64 } from 'js-base64';
import pako from 'pako';

export const deepParse = (s: string): unknown => LosslessJSON.parse(s, (_, v) => {
    try {
        return typeof v === 'string' && !/^\d+$/.test(v) ? deepParse(v) : v;
    } catch {
        return v;
    }
});

export const format_json = (data: string) => LosslessJSON.stringify(LosslessJSON.parse(data), null, 4)!;

export const enhanced_format_json = (data: string) => LosslessJSON.stringify(deepParse(data), null, 4)!;

export const paste_and_format = async (_: string): Promise<string> => {
    const text = await navigator.clipboard.readText();
    try {
        return enhanced_format_json(text);
    } catch (e) {
        toast.error(String(e), { autoClose: 10000 });
        return text;
    }
}

export const compress_json = (data: string) => LosslessJSON.stringify(LosslessJSON.parse(data))!;

export const escape_json = (data: string) => LosslessJSON.stringify(data)!;

export const unescape_json = (data: string) => {
    const result = LosslessJSON.parse(data)!;
    return typeof result == 'string' ? result : data;
};

export const single_quote = (data: string) => {
    const quoted = data.replaceAll('"', '\"');
    return quoted.replaceAll("'", '"');
};
export const trim_json = (data: string) => {
    const result = extractJsonString(data);
    return result != null ? result : data;
};

export const multiline_trim_json = (data: string) => data.split('\n').map(trim_json).join('\n');
export const multiline_to_one = (data: string) => {
    const lines = data.split("\n");
    const nonempty_lines = lines.filter(x => x.length > 0);
    const data_list = nonempty_lines.map(x => LosslessJSON.parse(x));
    return LosslessJSON.stringify(data_list, null, 4)!;
}

export const smart_process = (data: string) => {
    // 处理单行函数
    const proc_one_line = (x: string) => {
        // 尝试解读base64
        const base64_content = extractBase64(x);
        if (base64_content !== null) {
            const decodedB64 = Base64.toUint8Array(base64_content);
            try { // 尝试gzip解压，如果能解开就解压，否则就直接使用文本
                const decompressed = pako.ungzip(decodedB64, { to: 'string' });
                x = decompressed;
            } catch (e) {
                x = new TextDecoder().decode(decodedB64);
            }
        }
        // 尝试提取内部json
        const content = extractJsonString(x);
        if (content === null) {
            throw new Error('json not found');
        }
        // 自动处理两侧的引号
        const json_content = auto_single_quote(content);
        return LosslessJSON.parse(json_content);
    }
    try {
        try { // 优先按照单行处理
            const parsed = proc_one_line(data);
            return LosslessJSON.stringify(parsed, null, 4)!;
        } catch (e) { // 不行再尝试按照多行解析
            const line_list = data.split('\n').map(x => x.trim()).filter(x => x.length > 0);
            const parsed_lines = line_list.map(x => proc_one_line(x));
            return LosslessJSON.stringify(parsed_lines, null, 4)!;
        }
    } catch (e) {
        throw new Error('智能处理失败，请手工处理');
    }
};

// 自动转化单引号为主的内容
function auto_single_quote(input: string): string {
    const char_ratios = getCharacterRatios(input);
    const single_quote_ratio = char_ratios["'"] ?? 0;
    const double_quote_ratio = char_ratios['"'] ?? 0;
    if (single_quote_ratio > double_quote_ratio) { // 单引号浓度过高，可能原始输出来自 python，进行特别处理
        return single_quote(input);
    } else {
        return input;
    }
}

function extractJsonString(input: string): string | null {
    let jsonStart = -1;
    let jsonEnd = -1;
    let stack: string[] = [];
    const length = input.length;

    for (let i = 0; i < length; i++) {
        if (input[i] === '{' || input[i] === '[') {
            if (jsonStart === -1) {
                jsonStart = i;
            }
            stack.push(input[i]);
        } else if (input[i] === '}' || input[i] === ']') {
            if (stack.length === 0) {
                return null; // Unbalanced JSON
            }
            const last = stack.pop();
            if ((last === '{' && input[i] !== '}') || (last === '[' && input[i] !== ']')) {
                return null; // Unbalanced JSON
            }
            if (stack.length === 0) {
                jsonEnd = i;
            }
        }
    }

    if (jsonStart !== -1 && jsonEnd !== -1) {
        return input.substring(jsonStart, jsonEnd + 1);
    }

    return null;
}

function getCharacterRatios(input: string): { [char: string]: number } {
    const charCount: { [char: string]: number } = {};
    const totalLength = input.length;

    // 统计每个字符的出现次数
    for (let i = 0; i < totalLength; i++) {
        const char = input[i];
        if (charCount[char]) {
            charCount[char]++;
        } else {
            charCount[char] = 1;
        }
    }

    // 计算每个字符的比率
    const charRatios: { [char: string]: number } = {};
    for (const char in charCount) {
        charRatios[char] = charCount[char] / totalLength;
    }

    return charRatios;
}

function trimmedInput(input: string) {
    return input.trim().replace(/^['"]|['"]$/g, '');
}

// 检查是否为 Base64 编码
function isBase64(str: string): boolean {
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*\n?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
    return base64Regex.test(str);
};

// 尝试提取base64内容
function extractBase64(str: string): string | null {
    if (isBase64(str)) {
        return str;
    }
    const trimmed = trimmedInput(str);
    if (isBase64(trimmed)) {
        return trimmed;
    }
    return null;
}

export function is_json(str: string): boolean {
    try {
        const result = LosslessJSON.parse(str);
        return typeof result === "object"
    } catch (e) {
        return false;
    }
}

export function lossless_parse(str: string): (object) {
    function reviver(_: string, value: unknown) {
        if (value instanceof LosslessJSON.LosslessNumber && value.isLosslessNumber) {
            const numberValue = Number(value.value);
            return numberValue.toString() == value.value ? numberValue : value.value;
        } else {
            return value;
        }
    }
    try {
        const result = LosslessJSON.parse(str, reviver);
        return Object(result);
    } catch (e) {
        return { "ParseError": String(e) }
    }
}

type JsonObject = { [key: string]: any };

// 深度清理空数组和空对象
function deepCleanEmpty(obj: JsonObject): JsonObject | null {
    if (Array.isArray(obj)) {
        // 如果是数组，递归清理每个元素，保留非空的部分
        const cleanedArray = obj
            .map((item) => (typeof item === "object" ? deepCleanEmpty(item) : item))
            .filter((item) => item !== null && item !== undefined);

        return cleanedArray.length > 0 ? cleanedArray : null; // 如果数组为空，返回 null
    } else if (typeof obj === "object" && obj !== null) {
        // 如果是对象，递归清理每个键值对，保留非空的部分
        const cleanedObject: JsonObject = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const cleanedValue = deepCleanEmpty(obj[key]);
                if (cleanedValue !== null) {
                    cleanedObject[key] = cleanedValue;
                }
            }
        }
        return Object.keys(cleanedObject).length > 0 ? cleanedObject : null; // 如果对象为空，返回 null
    }
    // 如果是基本值，直接返回
    return obj;
}

// 按关键词过滤对象
export function filterObjectByKeywordIgnoreCase(obj: JsonObject, keyword: string): object {
    const result: JsonObject = {};
    const lowerKeyword = keyword.toLowerCase(); // 将关键词转为小写

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const stringValue = String(value).toLowerCase(); // 将 value 转为字符串并忽略大小写

            // 如果 key 包含关键词（忽略大小写），保留
            if (key.toLowerCase().includes(lowerKeyword)) {
                result[key] = value;
            }
            // 如果 value 的字符串形式包含关键词，保留
            else if (stringValue.includes(lowerKeyword)) {
                result[key] = value;
            }
            // 如果 value 是对象，递归处理
            else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                const filteredValue = filterObjectByKeywordIgnoreCase(value, keyword);
                if (filteredValue !== null) {
                    result[key] = filteredValue;
                }
            }
            // 如果 value 是数组，递归处理数组中的每个元素
            else if (Array.isArray(value)) {
                const filteredArray = value
                    .map((item) =>
                        typeof item === "object" && item !== null
                            ? filterObjectByKeywordIgnoreCase(item, keyword)
                            : String(item).toLowerCase().includes(lowerKeyword) ? item : null
                    )
                    .filter((item) => item !== null);

                if (filteredArray.length > 0) {
                    result[key] = filteredArray;
                }
            }
        }
    }

    // 深度清理空的对象和数组
    const cleaned = deepCleanEmpty(result);
    if (cleaned) {
        return Object(cleaned);
    } else {
        return {}
    }
}
