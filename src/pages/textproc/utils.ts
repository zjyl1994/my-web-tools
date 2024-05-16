
export const split_by_comma = (data: string) => data.replaceAll(',', '\n');
export const join_with_comma = (data: string) => data.replaceAll('\n', ',');

export const trim_line_space = (data: string) => data.split('\n').map(x => x.trim()).join('\n');
export const remove_empty_line = (data: string) => data.split('\n').map(x => x.trim()).filter(x => x.length > 0).join('\n');

export const add_quote = (data: string) => data.split('\n').map(x => '"' + x + '"').join('\n');
export const remove_quote = (data: string) => data.split('\n').map(x => x.replace(/^"|"$/g, '')).join('\n');

export const add_comma_suffix = (data: string) => data.split('\n').map(x => x + ',').join('\n');
export const remove_comma_suffix = (data: string) => data.split('\n').map(x => x.replace(/(,*$)/g, '')).join('\n');
