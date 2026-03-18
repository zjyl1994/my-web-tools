import { uniq, shuffle } from 'lodash';
import { toCamelCase, toSnakeCase, toKebabCase, toLowerCase, toUpperCase } from 'js-convert-case';

const proc_lines = (fn: (x: string[]) => string[]) => (data: string) => fn(data.split('\n')).join('\n');

export const split_by_comma = (data: string) => data.replaceAll(',', '\n');
export const join_with_comma = (data: string) => remove_empty_line(data).replaceAll('\n', ',');
export const split_by_blank = (data: string) => data.replaceAll(/\s+/g, '\n');
export const join_by_blank = (data: string) => remove_empty_line(data).replaceAll('\n', ' ');
export const sperate_with_blank_row = (data: string) => data.replaceAll('\n', '\n\n');

export const trim_line_space = proc_lines(list => list.map(x => x.trim()));
export const remove_empty_line = proc_lines(list => list.map(x => x.trim()).filter(x => x.length > 0));
export const uniq_line = proc_lines(list => uniq(list));
export const shuffle_line = proc_lines(list => shuffle(list));

export const add_quote = proc_lines(list => list.map(x => '"' + x + '"'));
export const remove_quote = proc_lines(list => list.map(x => x.replace(/^"|"$/g, '')));
export const add_single_quote = proc_lines(list => list.map(x => '\'' + x + '\''));
export const remove_single_quote = proc_lines(list => list.map(x => x.replace(/^'|'$/g, '')));
export const add_comma_suffix = proc_lines(list => list.map(x => x + ','));
export const remove_comma_suffix = proc_lines(list => list.map(x => x.replace(/(,*$)/g, '')));

export const nums_average = (nums: number[]) => nums.length > 0 ? nums.reduce((a, b) => a + b) / nums.length : 0;
export const nums_max = (nums: number[]) => nums.length > 0 ? Math.max(...nums) : 0;
export const nums_min = (nums: number[]) => nums.length > 0 ? Math.min(...nums) : 0;

export const sort_asc = proc_lines(list => list.map(x => x.trim()).sort());
export const sort_desc = proc_lines(list => list.map(x => x.trim()).sort().reverse());
export const sort_len_asc = proc_lines(list => list.map(x => x.trim()).sort((a, b) => a.length - b.length));
export const sort_len_desc = proc_lines(list => list.map(x => x.trim()).sort((a, b) => b.length - a.length));

export const to_upper_case = proc_lines(list => list.map(x => toUpperCase(x)));
export const to_lower_case = proc_lines(list => list.map(x => toLowerCase(x)));
export const to_camel_case = proc_lines(list => list.map(x => toCamelCase(x)));
export const to_snake_case = proc_lines(list => list.map(x => toSnakeCase(x)));
export const to_kebab_case = proc_lines(list => list.map(x => toKebabCase(x)));
export const to_const_case = proc_lines(list => list.map(x => toUpperCase(toSnakeCase(x))));

export const space_to_tab = proc_lines(list => list.map(x => x.replace(/\s+/g, '\t')));
const csv_quote_state = (line: string, initialState = false) => {
    let inQuotes = initialState;
    for (let i = 0; i < line.length; i++) {
        if (line[i] !== '"') {
            continue;
        }
        if (inQuotes && line[i + 1] === '"') {
            i += 1;
            continue;
        }
        inQuotes = !inQuotes;
    }
    return inQuotes;
};

const csv_line_to_tab = (line: string) => {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cell += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (!inQuotes && ch === ',') {
            cells.push(cell);
            cell = '';
            continue;
        }
        cell += ch;
    }
    cells.push(cell);
    return cells.join('\t');
};

export const csv_comma_to_tab = proc_lines(lines => {
    let merged = '';
    let inQuotes = false;

    const rows = lines.map(rawLine => {
        const line = rawLine.replace(/\r$/, '');
        merged = merged.length > 0 ? `${merged}\n${line}` : line;
        inQuotes = csv_quote_state(line, inQuotes);
        if (!inQuotes) {
            const result = csv_line_to_tab(merged);
            merged = '';
            return result;
        }
        return null;
    }).filter((x): x is string => x !== null);

    if (merged.length > 0) {
        rows.push(csv_line_to_tab(merged));
    }

    return rows;
});

export const regex_filter_lines = (regex: string, exclude: boolean) => (data: string) => {
    const re = new_regex_from_str(regex);
    return proc_lines(list => list.filter(x => re.test(x) !== exclude))(data);
};

const new_regex_from_str = (regex: string) => new RegExp(regex, "g");

const escape_cell_value = (str: string) => {
    if (str.includes('\t') || str.includes('\n') || str.includes('"')) {
        str = str.replace(/"/g, '""');
        str = `"${str}"`;
    }
    return str;
}

export const regex_extract_lines = (regex: string) => (data: string) => {
    const re = new_regex_from_str(regex);
    const line_proc = (line: string): string => {
        const result = line.match(re);
        if (result == null) {
            return "";
        }
        return result.map(escape_cell_value).join('\t')
    };

    return proc_lines(list => list.map(line => line_proc(line)).filter(x => x.length > 0))(data);
};

export const text_replace = (from: string, to: string) => proc_lines(list => list.map(x => x.replaceAll(from, to)));

export const predefined_regex_list = [
    { key: "纯数字", value: "\\d+" },
    { key: "中国手机号", value: "1\\d{10}" },
    { key: "纯字母", value: "[a-zA-Z]+" },
    { key: "字母数字下划线", value: "\\w+" },
];
