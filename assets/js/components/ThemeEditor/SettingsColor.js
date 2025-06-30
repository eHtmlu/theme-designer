// SettingsColor Component
const SettingsColor = ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { useState } = wp.element;
    const { ColorPicker, Popover, TextControl } = wp.components;

    const [colors, setColors] = useState(themeData.theme_json.settings?.color?.palette || []);
    const [gradients, setGradients] = useState(themeData.theme_json.settings?.color?.gradients || []);
    const [openPicker, setOpenPicker] = useState(null); // Index des aktuell offenen Pickers

    const updateColors = (newColors) => {
        setColors(newColors);
        updateThemeJson('settings.color.palette', newColors);
    };

    const updateGradients = (newGradients) => {
        setGradients(newGradients);
        updateThemeJson('settings.color.gradients', newGradients);
    };

    // Color Item Renderer
    const renderColorItem = (color, index, onUpdate) => {
        const updateColor = (field, value) => {
            const updatedColor = { ...color, [field]: value };
            
            // Auto-generate slug from name
            if (field === 'name') {
                updatedColor.slug = ThemeDesignerUtils.generateSlug(value);
            }
            
            onUpdate(updatedColor);
        };

        return [
            wp.element.createElement(TextControl, {
                label: __('Name', 'theme-designer'),
                placeholder: __('e.g. Primary', 'theme-designer'),
                value: color.name,
                onChange: (value) => updateColor('name', value),
                className: 'color-name',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Slug', 'theme-designer'),
                placeholder: __('e.g. primary', 'theme-designer'),
                value: color.slug,
                onChange: (value) => updateColor('slug', value),
                className: 'color-slug',
                __next40pxDefaultSize: true
            }),
            // Swatch + Popover
            wp.element.createElement('div', { className: 'theme-designer--color-swatch-container' },
                wp.element.createElement('button', {
                    type: 'button',
                    className: 'theme-designer--color-swatch',
                    style: { '--swatch-color': color.color },
                    onClick: () => setOpenPicker(openPicker === index ? null : index),
                    'aria-label': __('Pick color', 'theme-designer')
                }),
                openPicker === index && wp.element.createElement(Popover, {
                    position: 'bottom left',
                    onClose: () => setOpenPicker(null),
                    focusOnMount: true
                },
                    wp.element.createElement(ColorPicker, {
                        color: color.color,
                        onChangeComplete: (c) => updateColor('color', c.hex),
                        enableAlpha: true
                    })
                )
            )
        ];
    };

    // Gradient Item Renderer
    const renderGradientItem = (gradient, index, onUpdate) => {
        const updateGradient = (field, value) => {
            const updatedGradient = { ...gradient, [field]: value };
            
            // Auto-generate slug from name
            if (field === 'name') {
                updatedGradient.slug = ThemeDesignerUtils.generateSlug(value);
            }
            
            onUpdate(updatedGradient);
        };

        return [
            wp.element.createElement(TextControl, {
                label: __('Name', 'theme-designer'),
                value: gradient.name,
                onChange: (value) => updateGradient('name', value),
                className: 'gradient-name',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Slug', 'theme-designer'),
                value: gradient.slug,
                onChange: (value) => updateGradient('slug', value),
                className: 'gradient-slug',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('CSS Value', 'theme-designer'),
                placeholder: __('e.g. linear-gradient(45deg, #000000, #ffffff)', 'theme-designer'),
                value: gradient.gradient,
                onChange: (value) => updateGradient('gradient', value),
                className: 'gradient-value',
                __next40pxDefaultSize: true
            })
        ];
    };

    return wp.element.createElement('div', { className: 'theme-designer--settings-color' },
        wp.element.createElement('h2', null,
            ThemeDesignerUtils.getSvgIcon('palette'),
            __('Colors', 'theme-designer')
        ),
        
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide WordPress Defaults', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Provide WordPress default color palette', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.defaultPalette,
                    onChange: (value) => updateThemeJson('settings.color.defaultPalette', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.defaultPalette'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Provide WordPress default gradients', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.defaultGradients,
                    onChange: (value) => updateThemeJson('settings.color.defaultGradients', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.defaultGradients'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Provide WordPress default duotone filters', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.defaultDuotone,
                    onChange: (value) => updateThemeJson('settings.color.defaultDuotone', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.defaultDuotone'),
                })
            )
        ),

        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set background colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.background,
                    onChange: (value) => updateThemeJson('settings.color.background', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.background'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set text colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.text,
                    onChange: (value) => updateThemeJson('settings.color.text', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.text'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set heading colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.heading,
                    onChange: (value) => updateThemeJson('settings.color.heading', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.heading'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set button colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.button,
                    onChange: (value) => updateThemeJson('settings.color.button', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.button'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set caption colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.caption,
                    onChange: (value) => updateThemeJson('settings.color.caption', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.caption'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set link colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.link,
                    onChange: (value) => updateThemeJson('settings.color.link', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.link'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.custom,
                    onChange: (value) => updateThemeJson('settings.color.custom', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.custom'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom duotone filters', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.customDuotone,
                    onChange: (value) => updateThemeJson('settings.color.customDuotone', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.customDuotone'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom gradients', 'theme-designer'),
                    value: themeData.theme_json.settings?.color?.customGradient,
                    onChange: (value) => updateThemeJson('settings.color.customGradient', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.color.customGradient'),
                }),
            )
        ),

        // Custom Colors using ListManager
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Color Palette', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(ListManager, {
                    items: colors,
                    onItemsChange: updateColors,
                    renderItem: renderColorItem,
                    addButtonText: __('Add Color', 'theme-designer'),
                    createNewItem: () => ({
                        name: '',
                        slug: '',
                        color: '#000000'
                    })
                })
            )
        ),

        // Custom Gradients using ListManager
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Gradients', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(ListManager, {
                    items: gradients,
                    onItemsChange: updateGradients,
                    renderItem: renderGradientItem,
                    addButtonText: __('Add Gradient', 'theme-designer'),
                    createNewItem: () => ({
                        name: '',
                        slug: '',
                        gradient: ''
                    })
                })
            )
        )
    );
}; 