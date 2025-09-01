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
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const lastHeight = useRef(0);
    const stableHeightCount = useRef(0);

    // 防抖函数
    const debounce = useCallback((func: () => void, delay: number) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(func, delay);
    }, []);

    // 计算最大允许的行数（基于可视区高度）
    const getMaxRows = useCallback(() => {
        const viewportHeight = window.innerHeight;
        // 预留一些空间给其他UI元素（如按钮、导航等），假设预留200px
        const availableHeight = viewportHeight - 200;
        const maxRows = Math.floor(availableHeight / lineHeight.current);
        // 确保最大行数不少于默认行数
        return Math.max(maxRows, defaultRows);
    }, [defaultRows]);

    // 初始化时从localStorage加载保存的行数
    useEffect(() => {
        const savedRows = localStorage.getItem(storageKey);
        if (savedRows) {
            const parsedRows = parseInt(savedRows, 10);
            // 应用最大行数限制
            const maxRows = getMaxRows();
            const finalRows = Math.min(parsedRows, maxRows);
            setRows(finalRows);
            currentRows.current = finalRows;
            
            // 如果应用了限制，更新localStorage中的值
            if (finalRows !== parsedRows) {
                localStorage.setItem(storageKey, finalRows.toString());
            }
        }
    }, [storageKey, getMaxRows]);

    // 设置ResizeObserver，只在组件挂载时执行一次
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            debounce(() => {
                for (const entry of entries) {
                    const newHeight = entry.contentRect.height;
                    
                    // 防止触摸板等微小变化触发resize
                    const heightDiff = Math.abs(newHeight - lastHeight.current);
                    const minHeightChange = lineHeight.current * 0.5; // 至少半行高度的变化才认为是有效的
                    
                    if (heightDiff < minHeightChange) {
                        return; // 忽略微小的高度变化
                    }
                    
                    // 检查高度是否稳定（连续几次测量都是相同值）
                    if (Math.abs(newHeight - lastHeight.current) < 2) {
                        stableHeightCount.current++;
                    } else {
                        stableHeightCount.current = 0;
                        lastHeight.current = newHeight;
                    }
                    
                    // 只有高度稳定了至少2次测量才进行更新
                    if (stableHeightCount.current < 2) {
                        return;
                    }
                    
                    const calculatedRows = Math.round(newHeight / lineHeight.current);
                    
                    if (calculatedRows > 0 && calculatedRows !== currentRows.current) {
                        // 应用最大高度限制
                        const maxRows = getMaxRows();
                        const finalRows = Math.min(calculatedRows, maxRows);
                        
                        if (finalRows !== currentRows.current) {
                            currentRows.current = finalRows;
                            setRows(finalRows);
                            localStorage.setItem(storageKey, finalRows.toString());
                            lastHeight.current = newHeight;
                            stableHeightCount.current = 0; // 重置稳定计数
                        }
                    }
                }
            }, 200); // 增加到200ms防抖延迟，减少触摸板误触
        });

        if (textareaRef.current) {
            // 获取实际行高
            const style = window.getComputedStyle(textareaRef.current);
            lineHeight.current = parseFloat(style.lineHeight) || 19;
            
            // 初始化当前高度
            lastHeight.current = textareaRef.current.getBoundingClientRect().height;

            observer.observe(textareaRef.current);
        }

        // 监听窗口大小变化，重新计算最大行数
        const handleResize = () => {
            debounce(() => {
                const maxRows = getMaxRows();
                if (currentRows.current > maxRows) {
                    currentRows.current = maxRows;
                    setRows(maxRows);
                    localStorage.setItem(storageKey, maxRows.toString());
                }
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [storageKey, debounce, getMaxRows]); // 移除rows依赖，避免无限循环

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
