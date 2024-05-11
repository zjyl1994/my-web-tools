import { useState, useCallback } from 'react';

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
            setInputValue(String(e));
        }
    }, [inputValue, setInputValue]);
};

export const useBasic = (defaultValue: string) => {
    const [value, setValue] = useState(defaultValue);
    const action = useActionCreater(value, setValue);
    const copy = useCopy(value);
    const paste = usePaste(setValue);
    return { value, setValue, action, copy, paste };
}
