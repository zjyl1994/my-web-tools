import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useHistoryState } from "@uidotdev/usehooks";
import { useHotkeys } from 'react-hotkeys-hook';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const STORAGE_KEY_PREFIX = 'textarea_history_';

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

export const useBasic = (defaultValue: string, type: string) => {
    const storageKey = `${STORAGE_KEY_PREFIX}${type}`;
    
    // 从localStorage加载初始值
    const getInitialValue = () => {
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
        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch (err) {
            toast.error('Failed to save to localStorage: ' + String(err));
        }
    }, [value, storageKey]);

    const setValue = (newValue: string) => {
        set(newValue);
    };

    const clearHistory = () => {
        clear();
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
