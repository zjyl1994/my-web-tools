import { useEffect, useMemo, useState } from 'react';
import * as LosslessJSON from 'lossless-json';
import { toast } from 'react-toastify';

import { Button, ButtonGroup, ButtonToolbar } from '@/components/ui';
import CodeMergeView from '@/components/ui/code-merge-view';
import { useTextareaResize } from '@/hooks/use-basic';

type CompareMode = 'text' | 'json';
const STORAGE_KEY_PREFIX = 'textarea_history_';

const ComparePage: React.FC = () => {
  const { rows, textareaRef } = useTextareaResize<HTMLDivElement>('compare.merge', 22);
  const [mode, setMode] = useStoredState<CompareMode>('compare.mode', 'text');
  const [ignoreBlankLines, setIgnoreBlankLines] = useStoredState('compare.ignore_blank_lines', false);
  const [compareAfterSort, setCompareAfterSort] = useStoredState('compare.compare_after_sort', false);
  const [ignoreArrayOrder, setIgnoreArrayOrder] = useStoredState('compare.ignore_array_order', false);
  const [leftValue, setLeftValue] = useStoredTextareaState('compare.left');
  const [rightValue, setRightValue] = useStoredTextareaState('compare.right');
  const [hasShownJsonFallbackNotice, setHasShownJsonFallbackNotice] = useState(false);

  useEffect(() => {
    if (mode !== 'json') {
      return;
    }

    if (!isValidJsonInput(leftValue) || !isValidJsonInput(rightValue)) {
      setMode('text');
      if (!hasShownJsonFallbackNotice) {
        toast.info('检测到非 JSON 内容，已自动切回文本模式', { autoClose: 2500 });
        setHasShownJsonFallbackNotice(true);
      }
    }
  }, [hasShownJsonFallbackNotice, leftValue, mode, rightValue, setMode]);

  useEffect(() => {
    if (mode === 'json' && isValidJsonInput(leftValue) && isValidJsonInput(rightValue)) {
      setHasShownJsonFallbackNotice(false);
    }
  }, [leftValue, mode, rightValue]);

  const compareState = useMemo(() => {
    if (mode === 'text') {
      return {
        leftValue: normalizeTextForCompare(leftValue, ignoreBlankLines, compareAfterSort),
        rightValue: normalizeTextForCompare(rightValue, ignoreBlankLines, compareAfterSort),
      };
    }

    try {
      return {
        leftValue: leftValue.trim() ? normalizeJsonForCompare(leftValue, ignoreArrayOrder) : leftValue,
        rightValue: rightValue.trim() ? normalizeJsonForCompare(rightValue, ignoreArrayOrder) : rightValue,
      };
    } catch {
      return {
        leftValue,
        rightValue,
      };
    }
  }, [compareAfterSort, ignoreArrayOrder, ignoreBlankLines, leftValue, mode, rightValue]);

  const differenceCount = useMemo(() => {
    const leftLines = normalizeLines(compareState.leftValue);
    const rightLines = normalizeLines(compareState.rightValue);
    const maxLength = Math.max(leftLines.length, rightLines.length);
    let count = 0;

    for (let index = 0; index < maxLength; index += 1) {
      if ((leftLines[index] ?? '') !== (rightLines[index] ?? '')) {
        count += 1;
      }
    }

    return count;
  }, [compareState.leftValue, compareState.rightValue]);

  return (
    <div className="compare-page">
      <CodeMergeView
        leftValue={compareState.leftValue}
        rightValue={compareState.rightValue}
        onLeftChange={setLeftValue}
        onRightChange={setRightValue}
        leftTitle={mode === 'json' ? '左侧 JSON' : '左侧内容'}
        rightTitle={mode === 'json' ? '右侧 JSON' : '右侧内容'}
        rows={rows}
        resizeRef={textareaRef}
      />

      <div className="compare-page__toolbar">
        <ButtonToolbar>
          <ButtonGroup>
            <Button
              variant="light"
              className={`border${mode === 'text' ? ' is-active' : ''}`}
              onClick={() => setMode('text')}
            >
              文本模式
            </Button>
            <Button
              variant="light"
              className={`border${mode === 'json' ? ' is-active' : ''}`}
              onClick={() => setMode('json')}
            >
              JSON 模式
            </Button>
          </ButtonGroup>

          {mode === 'text' ? (
            <ButtonGroup>
              <Button
                variant="light"
                className={`border${ignoreBlankLines ? ' is-active' : ''}`}
                onClick={() => setIgnoreBlankLines((current) => !current)}
              >
                忽略空白行
              </Button>
              <Button
                variant="light"
                className={`border${compareAfterSort ? ' is-active' : ''}`}
                onClick={() => setCompareAfterSort((current) => !current)}
              >
                排序后对比
              </Button>
            </ButtonGroup>
          ) : (
            <ButtonGroup>
              <Button
                variant="light"
                className={`border${ignoreArrayOrder ? ' is-active' : ''}`}
                onClick={() => setIgnoreArrayOrder((current) => !current)}
              >
                忽略数组顺序
              </Button>
            </ButtonGroup>
          )}
        </ButtonToolbar>

        <div className="compare-page__summary">
          {differenceCount === 0 ? '当前没有差异' : `共有 ${differenceCount} 行不同`}
        </div>
      </div>
    </div>
  );
};

const normalizeLines = (value: string) => value.replace(/\r\n?/g, '\n').split('\n');

const normalizeTextForCompare = (value: string, ignoreBlankLines: boolean, compareAfterSort: boolean) => {
  let lines = normalizeLines(value);

  if (ignoreBlankLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  }

  if (compareAfterSort) {
    lines = lines.slice().sort((left, right) => left.localeCompare(right));
  }

  return lines.join('\n');
};

const normalizeJsonForCompare = (value: string, ignoreArrayOrder: boolean) => (
  LosslessJSON.stringify(sortJsonValue(LosslessJSON.parse(value), ignoreArrayOrder), null, 4) ?? value
);

const sortJsonValue = (value: unknown, ignoreArrayOrder: boolean): unknown => {
  if (Array.isArray(value)) {
    const normalizedArray = value.map((entry) => sortJsonValue(entry, ignoreArrayOrder));

    if (!ignoreArrayOrder) {
      return normalizedArray;
    }

    return normalizedArray.slice().sort(compareNormalizedJsonValue);
  }

  if (LosslessJSON.isLosslessNumber(value)) {
    return value;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, childValue]) => [key, sortJsonValue(childValue, ignoreArrayOrder)]),
    );
  }

  return value;
};

const compareNormalizedJsonValue = (left: unknown, right: unknown) => {
  const leftText = LosslessJSON.stringify(left) ?? '';
  const rightText = LosslessJSON.stringify(right) ?? '';
  return leftText.localeCompare(rightText);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isValidJsonInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    LosslessJSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
};

const useStoredTextareaState = (historyType: string, defaultValue = '') => {
  const storageKey = `${STORAGE_KEY_PREFIX}${historyType}`;
  return useStoredState(storageKey, defaultValue);
};

const useStoredState = <T,>(storageKey: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => readStoredValue(storageKey, defaultValue));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // ignore storage failures
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
};

const readStoredValue = <T,>(storageKey: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) as T : defaultValue;
  } catch {
    return defaultValue;
  }
};

export default ComparePage;
