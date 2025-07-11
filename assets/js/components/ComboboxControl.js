// ComboboxControl Component - Combines SelectControl with TextControl for custom values
lodash.set(window, 'ThemDesi.Components.ComboboxControl', ({ label, value, onChange, options, placeholder, help, className, ...props }) => {
    const { __ } = wp.i18n;
    const { useState, useRef, useEffect } = wp.element;
    const { SelectControl, TextControl, BaseControl } = wp.components;

    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const textInputRef = useRef(null);

    // Check if current value is in predefined options
    useEffect(() => {
        const isInOptions = options.some(option => option.value === value);
        setIsCustom(!isInOptions && value !== '');
        if (!isInOptions && value !== '') {
            setCustomValue(value);
        }
    }, [value, options]);

    const handleSelectChange = (newValue) => {
        if (newValue === 'custom') {
            setIsCustom(true);
            setCustomValue(value || '');
            // Focus the text input after a short delay
            setTimeout(() => {
                if (textInputRef.current) {
                    textInputRef.current.focus();
                }
            }, 100);
        } else {
            setIsCustom(false);
            onChange(newValue);
        }
    };

    const handleTextChange = (newValue) => {
        setCustomValue(newValue);
        onChange(newValue);
    };

    const handleTextBlur = () => {
        // If text is empty, switch back to select
        if (!customValue.trim()) {
            setIsCustom(false);
            onChange('');
        }
    };

    // Add "Custom" option to the options array
    const selectOptions = [
        ...options,
        { label: __('Custom...', 'theme-designer'), value: 'custom' }
    ];

    return wp.element.createElement(BaseControl, {
        label: label,
        help: help,
        className: className
    },
        isCustom 
            ? wp.element.createElement(TextControl, {
                ref: textInputRef,
                value: customValue,
                onChange: handleTextChange,
                onBlur: handleTextBlur,
                placeholder: placeholder || __('Enter custom value', 'theme-designer'),
                __next40pxDefaultSize: true,
                ...props
            })
            : wp.element.createElement(SelectControl, {
                value: value || '',
                options: selectOptions,
                onChange: handleSelectChange,
                __next40pxDefaultSize: true,
                ...props
            })
    );
}); 