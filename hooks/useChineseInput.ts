import { useState, useCallback } from 'react';

/**
 * 专门处理中文输入法的Hook
 * 解决中文输入时的各种兼容性问题
 */
export function useChineseInput(initialValue: string = '') {
    const [value, setValue] = useState(initialValue);
    const [isComposing, setIsComposing] = useState(false);

    const handleCompositionStart = useCallback(() => {
        setIsComposing(true);
    }, []);

    const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsComposing(false);
        // 确保在输入法结束时更新值
        setValue(e.currentTarget.value);
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        // 只有在非输入法状态下才立即更新
        if (!isComposing) {
            setValue(newValue);
        }
    }, [isComposing]);

    const handleInput = useCallback((e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // 使用input事件作为备用，确保中文输入被捕获
        const target = e.currentTarget;
        setValue(target.value);
    }, []);

    const reset = useCallback(() => {
        setValue('');
        setIsComposing(false);
    }, []);

    return {
        value,
        setValue,
        isComposing,
        handlers: {
            onChange: handleChange,
            onInput: handleInput,
            onCompositionStart: handleCompositionStart,
            onCompositionEnd: handleCompositionEnd,
        },
        reset
    };
}