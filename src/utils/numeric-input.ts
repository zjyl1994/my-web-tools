type NumericOptions = { positive?: boolean; integer?: boolean };

export function numericInput(text: string, label: string, options: NumericOptions = {}) {
  if (text.trim() === '') return { value: null, error: `请输入${label}。` };
  const value = Number(text);
  if (!Number.isFinite(value)) return { value: null, error: `${label}需为有效数字。` };
  if (value < 0 || (options.positive && value === 0)) {
    return { value: null, error: `${label}${options.positive ? '需大于 0' : '不能为负数'}。` };
  }
  if (options.integer && !Number.isSafeInteger(value)) {
    return { value: null, error: `${label}需为有效整数。` };
  }
  return { value, error: '' };
}
