import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useHistoryState } from "@uidotdev/usehooks";

export const useCopy = (text: string) => {
    return useCallback(() => {
        return navigator.clipboard.writeText(text).catch(err => console.error(err));
    }, [text]);
};

export const usePaste = (setInputValue: (value: string) => void) => {
    return useCallback(() => {
        return navigator.clipboard.readText().then(text => setInputValue(text)).catch(err => console.error(err));
    }, [setInputValue]);
};

export const useActionCreater = (
    inputValue: string,
    setInputValue: (value: string) => void,
) => {
    return useCallback((action: (origin: string) => string) => () => {
        try {
            const result = action(inputValue);
            if (result) setInputValue(result);
        } catch (e) {
            toast.error(String(e), { autoClose: 10000 });
        }
    }, [inputValue, setInputValue]);
};

export const useBasic = (defaultValue: string) => {
    const { state, set, undo, redo, clear, canUndo, canRedo } = useHistoryState(defaultValue);
    const value = state;
    const setValue = set;
    const clearHistory = clear;
    const action = useActionCreater(value, setValue);
    const copy = useCopy(value);
    const paste = usePaste(setValue);
    return { value, setValue, action, copy, paste, undo, redo, clearHistory, canUndo, canRedo };
}
