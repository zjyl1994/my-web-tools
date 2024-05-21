import { uniq } from 'lodash';

const proc_lines = (fn: (x: string[]) => string[]) => (data: string) => fn(data.split('\n')).join('\n');

export const split_by_comma = (data: string) => data.replaceAll(',', '\n');
export const join_with_comma = (data: string) => data.replaceAll('\n', ',');
export const split_by_blank = (data: string) => data.replaceAll(/\s+/g, '\n');

export const trim_line_space = proc_lines(list => list.map(x => x.trim()));
export const remove_empty_line = proc_lines(list => list.map(x => x.trim()).filter(x => x.length > 0));
export const uniq_line = proc_lines(list => uniq(list));

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
    const re = new RegExp(regex);
    return proc_lines(list => list.filter(x => re.test(x) !== exclude))(data);
};

const escape_cell_value = (str: string) => {
    if (str.includes('\t') || str.includes('\n') || str.includes('"')) {
        str = str.replace(/"/g, '""');
        str = `"${str}"`;
    }
    return str;
}

export const regex_extract_lines = (regex: string) => (data: string) => {
    const re = new RegExp(regex);
    const line_proc = (line: string): string => {
        const result = re.exec(line);
        if (result == null) {
            return "";
        }
        return result.map(escape_cell_value).join('\t')
    };

    return proc_lines(list => list.map(line => line_proc(line)).filter(x => x.length > 0))(data);
};