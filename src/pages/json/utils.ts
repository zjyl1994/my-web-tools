import * as LosslessJSON from 'lossless-json';
import { toast } from 'react-toastify';

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
        const content = extractJsonString(x);
        if (content === null) {
            throw new Error('json not found');
        }
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

export function parse_json_no_error(input: string): object {
    try {
        const result = JSON.parse(input);
        return result;
    } catch (error) {
        return { error: `解析失败: ${(error as Error).message}` };
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
