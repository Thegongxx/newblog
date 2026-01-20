import { useState, useCallback } from 'react';

/**
 * 简化的中文输入Hook
 * 移除复杂逻辑，专注于基本功能
 */
export function useChineseInput(initialValue: string = '') {
    const [value, setValue] = useState(initialValue);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value);
    }, []);

    const reset = useCallback(() => {
        setValue('');
    }, []);

    return {
        value,
        setValue,
        handlers: {
            onChange: handleChange,
        },
        reset
    };
}