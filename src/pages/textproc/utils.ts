import { uniq, shuffle } from 'lodash';

const proc_lines = (fn: (x: string[]) => string[]) => (data: string) => fn(data.split('\n')).join('\n');

export const split_by_comma = (data: string) => data.replaceAll(',', '\n');
export const join_with_comma = (data: string) => remove_empty_line(data).replaceAll('\n', ',');
export const split_by_blank = (data: string) => data.replaceAll(/\s+/g, '\n');
export const join_by_blank = (data: string) => remove_empty_line(data).replaceAll('\n', ' ');

export const trim_line_space = proc_lines(list => list.map(x => x.trim()));
export const remove_empty_line = proc_lines(list => list.map(x => x.trim()).filter(x => x.length > 0));
export const uniq_line = proc_lines(list => uniq(list));
export const shuffle_line = proc_lines(list => shuffle(list));

export const add_quote = proc_lines(list => list.map(x => '"' + x + '"'));
export const remove_quote = proc_lines(list => list.map(x => x.replace(/^"|"$/g, '')));
export const add_comma_suffix = proc_lines(list => list.map(x => x + ','));
export const remove_comma_suffix = proc_lines(list => list.map(x => x.replace(/(,*$)/g, '')));

export const nums_average = (nums: number[]) => nums.length > 0 ? nums.reduce((a, b) => a + b) / nums.length : 0;
export const nums_max = (nums: number[]) => nums.length > 0 ? Math.max(...nums) : 0;
export const nums_min = (nums: number[]) => nums.length > 0 ? Math.min(...nums) : 0;

export const sort_asc = proc_lines(list => list.map(x => x.trim()).sort());
export const sort_desc = proc_lines(list => list.map(x => x.trim()).sort().reverse());
export const sort_len_asc = proc_lines(list => list.map(x => x.trim()).sort((a, b) => a.length - b.length));
export const sort_len_desc = proc_lines(list => list.map(x => x.trim()).sort((a, b) => b.length - a.length));

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