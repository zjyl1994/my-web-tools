import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useHistoryState } from "@uidotdev/usehooks";
import { useHotkeys } from 'react-hotkeys-hook';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const STORAGE_KEY_PREFIX = 'textarea_history_';
const TEXTAREA_ROWS_KEY_PREFIX = 'textarea_rows_';

export const useCopy = (text: string) => {
    return useCallback(() => {
        return navigator.clipboard.writeText(text).catch(err => toast.error(String(err), { autoClose: 10000 }));
    }, [text]);
};

export const usePaste = (setInputValue: (value: string) => void) => {
    return useCallback(() => {
        return navigator.clipboard.readText().then(text => setInputValue(text)).catch(err => toast.error(String(err), { autoClose: 10000 }));
    }, [setInputValue]);
};

export const useActionCreater = (
    inputValue: string,
    setInputValue: (value: string) => void,
) => {
    return useCallback((action: (origin: string) => (string | Promise<string>)) => () => {
        const setResult = function (value: string) {
            if (value)
                setInputValue(value);
        };
        try {
            const result = action(inputValue);
            if (typeof result === "string") {
                setResult(result);
            } else {
                result.then(text => setResult(text));
            }
        } catch (e) {
            toast.error(String(e), { autoClose: 10000 });
        }
    }, [inputValue, setInputValue]);
};

export const useBasic = (defaultValue: string, historyType: string) => {
    const storageKey = `${STORAGE_KEY_PREFIX}${historyType}`;

    // 从localStorage加载初始值
    const getInitialValue = (): string => {
        if (!historyType) return defaultValue;
        try {
            const storedValue = localStorage.getItem(storageKey);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch {
            return defaultValue;
        }
    };

    const { state, set, undo, redo, clear, canUndo, canRedo } = useHistoryState(getInitialValue());
    const value = state;

    // 保存到localStorage的effect
    useEffect(() => {
        if (!historyType) return;  // 新增：type为空时不保存
        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch (err) {
            toast.error('Failed to save to localStorage: ' + String(err));
        }
    }, [value, storageKey, historyType]);  // 新增：添加type到依赖项

    const setValue = (newValue: string) => {
        set(newValue);
    };

    const clearHistory = () => {
        clear();
        if (!historyType) return;  // 新增：type为空时不清理
        try {
            localStorage.removeItem(storageKey);
        } catch (err) {
            toast.error('Failed to clear localStorage: ' + String(err));
        }
    };

    const action = useActionCreater(value, setValue);
    const copy = useCopy(value);
    const paste = usePaste(setValue);

    const functionButtonGroup = <ButtonGroup className="me-2 mt-2">
        <Button variant="light" className="border" onClick={copy}>复制</Button>
        <Button variant="light" className="border" onClick={paste}>粘贴</Button>
        <Button variant="light" className="border" onClick={() => { setValue(''); clearHistory; }}>清空</Button>
        <Button variant="light" className="border" onClick={undo} disabled={!canUndo}>撤销</Button>
        <Button variant="light" className="border" onClick={redo} disabled={!canRedo}>重做</Button>
    </ButtonGroup>

    useHotkeys('ctrl+z', undo);
    useHotkeys('ctrl+y', redo);

    return { value, setValue, action, copy, paste, undo, redo, clearHistory, canUndo, canRedo, functionButtonGroup };
}


export const useTextareaResize = (textareaType: string, defaultRows: number) => {
    const storageKey = `${TEXTAREA_ROWS_KEY_PREFIX}${textareaType}`;
    const [rows, setRows] = useState(defaultRows);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineHeight = useRef(0);
    const currentRows = useRef(defaultRows);

    // 初始化时从localStorage加载保存的行数
    useEffect(() => {
        const savedRows = localStorage.getItem(storageKey);
        if (savedRows) {
            const parsedRows = parseInt(savedRows, 10);
            setRows(parsedRows);
            currentRows.current = parsedRows;
        }
    }, [storageKey]);

    // 设置ResizeObserver，只在组件挂载时执行一次
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newHeight = entry.contentRect.height;
                const calculatedRows = Math.round(newHeight / lineHeight.current);
                if (calculatedRows > 0 && calculatedRows !== currentRows.current) {
                    currentRows.current = calculatedRows;
                    setRows(calculatedRows);
                    localStorage.setItem(storageKey, calculatedRows.toString());
                }
            }
        });

        if (textareaRef.current) {
            // 获取实际行高
            const style = window.getComputedStyle(textareaRef.current);
            lineHeight.current = parseFloat(style.lineHeight) || 19;

            observer.observe(textareaRef.current);
        }

        return () => observer.disconnect();
    }, [storageKey]); // 移除rows依赖，避免无限循环

    // 同步currentRows.current与rows状态
    useEffect(() => {
        currentRows.current = rows;
    }, [rows]);

    const resetRows = () => {
        setRows(defaultRows);
        currentRows.current = defaultRows;
        localStorage.removeItem(storageKey);
    };

    return { rows, textareaRef, resetRows };
};
