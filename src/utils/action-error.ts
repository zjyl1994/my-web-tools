export class ActionInputError extends Error {
  constructor(message: string, public readonly input: string) {
    super(message);
  }
}

export function describeActionError(error: unknown, input: string): string {
  if (error instanceof ActionInputError) input = error.input;
  const detail = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (error instanceof URIError) {
    return 'URL 编解码失败：请检查 % 后是否为两位十六进制数字，以及内容是否为有效的 UTF-8 编码。';
  }
  if (error instanceof Error && error.name === 'NotAllowedError') {
    return '无法读取剪贴板，请允许浏览器访问剪贴板，或手动粘贴后重试。';
  }
  const position = detail.match(/(?:position| at)\s+(\d+)/i);
  const offset = position ? Number(position[1]) : -1;
  let location = '';
  if (offset >= 0 && offset <= input.length && !/line\s+\d+/i.test(detail)) {
    const prefix = input.slice(0, offset);
    const line = prefix.split('\n').length;
    const column = offset - prefix.lastIndexOf('\n');
    location = `第 ${line} 行，第 ${column} 列。`;
  }
  return `处理失败：${location}${detail || '无法识别输入内容。'}\n请根据错误位置检查输入格式。`;
}
