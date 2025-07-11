// SettingsTypography Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsTypography', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { useState } = wp.element;
    const { TextControl, ToggleControl, BaseControl } = wp.components;
    const { TriStateCheckboxControl, ListManager } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    const [fontSizes, setFontSizes] = useState(themeData.theme_json.settings?.typography?.fontSizes || []);
    const [fontFamilies, setFontFamilies] = useState(themeData.theme_json.settings?.typography?.fontFamilies || []);

    const updateFontSizes = (newFontSizes) => {
        setFontSizes(newFontSizes);
        updateThemeJson('settings.typography.fontSizes', newFontSizes);
    };

    const updateFontFamilies = (newFontFamilies) => {
        setFontFamilies(newFontFamilies);
        updateThemeJson('settings.typography.fontFamilies', newFontFamilies);
    };

    // Special function for updating fluid settings
    const updateFluidSetting = (field, value) => {
        let currentFluid = themeData.theme_json.settings?.typography?.fluid;
        
        // If fluid is currently true, convert it to an object
        if (currentFluid === true) {
            currentFluid = {};
        }
        
        // If fluid is false or doesn't exist, don't do anything
        if (!currentFluid) {
            return;
        }
        
        // Create new fluid object
        const newFluid = { ...currentFluid };
        
        if (value === '' || value === null || value === undefined) {
            // Remove the field if value is empty
            delete newFluid[field];
        } else {
            // Set the field value
            newFluid[field] = value;
        }
        
        // If the fluid object is now empty, set it to true
        if (Object.keys(newFluid).length === 0) {
            updateThemeJson('settings.typography.fluid', true);
        } else {
            updateThemeJson('settings.typography.fluid', newFluid);
        }
    };

    const updateFontSize = (index, field, value) => {
        const newFontSizes = [...fontSizes];
        newFontSizes[index] = { ...newFontSizes[index], [field]: value };
        
        // Auto-generate slug from name
        if (field === 'name') {
            newFontSizes[index].slug = generateSlug(value);
        }
        
        updateFontSizes(newFontSizes);
    };

    const updateFontFamily = (index, field, value) => {
        const newFontFamilies = [...fontFamilies];
        newFontFamilies[index] = { ...newFontFamilies[index], [field]: value };
        
        // Auto-generate slug from name
        if (field === 'name') {
            newFontFamilies[index].slug = generateSlug(value);
        }
        
        updateFontFamilies(newFontFamilies);
    };

    // Font Size Item Renderer
    const renderFontSizeItem = (fontSize, index, onUpdate) => {
        const updateFontSize = (field, value) => {
            const updatedFontSize = { ...fontSize, [field]: value };
            
            // Auto-generate slug from name
            if (field === 'name') {
                updatedFontSize.slug = generateSlug(value);
            }
            
            onUpdate(updatedFontSize);
        };

        const updateFluidSettings = (field, value) => {
            const updatedFontSize = { ...fontSize };
            
            // Initialize fluid object if it doesn't exist
            if (!updatedFontSize.fluid || typeof updatedFontSize.fluid === 'boolean') {
                updatedFontSize.fluid = {};
            }
            
            if (field === 'enabled') {
                if (value) {
                    // Enable fluid with default values
                    updatedFontSize.fluid = {
                        min: '',
                        max: ''
                    };
                } else {
                    // Disable fluid
                    updatedFontSize.fluid = false;
                }
            } else {
                // Update specific fluid field
                updatedFontSize.fluid[field] = value;
            }
            
            onUpdate(updatedFontSize);
        };

        const isFluidEnabled = fontSize.fluid && typeof fontSize.fluid === 'object';
        const isGlobalFluidEnabled = themeData.theme_json.settings?.typography?.fluid === true || 
                                   (themeData.theme_json.settings?.typography?.fluid && typeof themeData.theme_json.settings?.typography.fluid === 'object');

        return [
            // Basic font size fields
            wp.element.createElement('div', { className: 'theme-designer--font-size-basic-fields' },
                wp.element.createElement(TextControl, {
                    label: __('Name', 'theme-designer'),
                    value: fontSize.name,
                    onChange: (value) => updateFontSize('name', value),
                    className: 'font-size-name',
                    __next40pxDefaultSize: true
                }),
                wp.element.createElement(TextControl, {
                    label: __('Slug', 'theme-designer'),
                    value: fontSize.slug,
                    onChange: (value) => updateFontSize('slug', value),
                    className: 'font-size-slug',
                    __next40pxDefaultSize: true
                }),
                wp.element.createElement(TextControl, {
                    label: __('Size', 'theme-designer'),
                    placeholder: __('e.g. 1rem', 'theme-designer'),
                    value: fontSize.size,
                    onChange: (value) => updateFontSize('size', value),
                    className: 'font-size-size',
                    __next40pxDefaultSize: true
                }),
                isGlobalFluidEnabled && wp.element.createElement(BaseControl, {
                    label: __('Fluid', 'theme-designer'),
                    className: 'fluid-toggle'
                },
                    isGlobalFluidEnabled && wp.element.createElement(ToggleControl, {
                        //label: __('Fluid', 'theme-designer'),
                        checked: isFluidEnabled,
                        onChange: (value) => updateFluidSettings('enabled', value)
                    }),
                ),
            ),
            
            // Fluid typography controls (only show if global fluid is enabled)
            isGlobalFluidEnabled && isFluidEnabled && wp.element.createElement('div', { className: 'theme-designer--font-size-fluid-fields' },
                wp.element.createElement(TextControl, {
                    label: __('Min Size', 'theme-designer'),
                    placeholder: __('e.g. 0.875rem', 'theme-designer'),
                    value: fontSize.fluid.min || '',
                    onChange: (value) => updateFluidSettings('min', value),
                    __next40pxDefaultSize: true
                }),
                wp.element.createElement(TextControl, {
                    label: __('Max Size', 'theme-designer'),
                    placeholder: __('e.g. 1.125rem', 'theme-designer'),
                    value: fontSize.fluid.max || '',
                    onChange: (value) => updateFluidSettings('max', value),
                    __next40pxDefaultSize: true
                })
            )
        ];
    };

    // Font Family Item Renderer
    const renderFontFamilyItem = (fontFamily, index, onUpdate) => {
        const updateFontFamily = (field, value) => {
            const updatedFontFamily = { ...fontFamily, [field]: value };
            
            // Auto-generate slug from name
            if (field === 'name') {
                updatedFontFamily.slug = generateSlug(value);
            }
            
            onUpdate(updatedFontFamily);
        };

        return [
            wp.element.createElement(TextControl, {
                label: __('Name', 'theme-designer'),
                value: fontFamily.name,
                onChange: (value) => updateFontFamily('name', value),
                className: 'font-family-name',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Slug', 'theme-designer'),
                value: fontFamily.slug,
                onChange: (value) => updateFontFamily('slug', value),
                className: 'font-family-slug',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('CSS Value', 'theme-designer'),
                placeholder: __('e.g.: Arial, sans-serif', 'theme-designer'),
                value: fontFamily.fontFamily,
                onChange: (value) => updateFontFamily('fontFamily', value),
                className: 'font-family-value',
                __next40pxDefaultSize: true
            })
        ];
    };

    return wp.element.createElement('div', { className: 'theme-designer--settings-typography' },
        wp.element.createElement('h2', null,
            getSvgIcon('format_text'),
            __('Typography', 'theme-designer')
        ),
        
        // WordPress Defaults
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide WordPress Defaults', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Provide WordPress default font sizes', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.defaultFontSizes,
                    onChange: (value) => updateThemeJson('settings.typography.defaultFontSizes', value),
                    defaultValue: getWordPressDefault('settings.typography.defaultFontSizes')
                }),
            )
        ),

        // User Controls
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom font sizes (other than predefined)', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.customFontSize,
                    onChange: (value) => updateThemeJson('settings.typography.customFontSize', value),
                    defaultValue: getWordPressDefault('settings.typography.customFontSize')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set font styles', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.fontStyle,
                    onChange: (value) => updateThemeJson('settings.typography.fontStyle', value),
                    defaultValue: getWordPressDefault('settings.typography.fontStyle')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set font weights', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.fontWeight,
                    onChange: (value) => updateThemeJson('settings.typography.fontWeight', value),
                    defaultValue: getWordPressDefault('settings.typography.fontWeight')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set letter spacing', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.letterSpacing,
                    onChange: (value) => updateThemeJson('settings.typography.letterSpacing', value),
                    defaultValue: getWordPressDefault('settings.typography.letterSpacing')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set line height', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.lineHeight,
                    onChange: (value) => updateThemeJson('settings.typography.lineHeight', value),
                    defaultValue: getWordPressDefault('settings.typography.lineHeight')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set text alignment', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.textAlign,
                    onChange: (value) => updateThemeJson('settings.typography.textAlign', value),
                    defaultValue: getWordPressDefault('settings.typography.textAlign'),
                    help: __('No core block takes this setting into account yet, so this setting may have no effect.', 'theme-designer')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set text columns', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.textColumns,
                    onChange: (value) => updateThemeJson('settings.typography.textColumns', value),
                    defaultValue: getWordPressDefault('settings.typography.textColumns'),
                    help: __('No core block supports this feature yet, so this setting may have no effect.', 'theme-designer')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set text decorations', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.textDecoration,
                    onChange: (value) => updateThemeJson('settings.typography.textDecoration', value),
                    defaultValue: getWordPressDefault('settings.typography.textDecoration')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set writing mode (text direction)', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.writingMode,
                    onChange: (value) => updateThemeJson('settings.typography.writingMode', value),
                    defaultValue: getWordPressDefault('settings.typography.writingMode')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set text transforms', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.textTransform,
                    onChange: (value) => updateThemeJson('settings.typography.textTransform', value),
                    defaultValue: getWordPressDefault('settings.typography.textTransform')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to enable drop caps', 'theme-designer'),
                    value: themeData.theme_json.settings?.typography?.dropCap,
                    onChange: (value) => updateThemeJson('settings.typography.dropCap', value),
                    defaultValue: getWordPressDefault('settings.typography.dropCap')
                }),
            )
        ),

        // Font Sizes with ListManager
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Font Sizes', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                themeData.theme_json.settings?.typography?.defaultFontSizes !== false && wp.element.createElement('em', {}, __('To provide font sizes other than the WordPress defaults, you must first disable WordPress default font sizes above.', 'theme-designer')),

                themeData.theme_json.settings?.typography?.defaultFontSizes === false && [
                    // Global Fluid Typography Settings
                    wp.element.createElement('div', { className: 'theme-designer--fluid-typography' },
                        
                        wp.element.createElement(TriStateCheckboxControl, {
                            label: __('Enable fluid font sizes', 'theme-designer'),
                            value: typeof themeData.theme_json.settings?.typography?.fluid === 'object' ? true : themeData.theme_json.settings?.typography?.fluid,
                            onChange: (value) => updateThemeJson('settings.typography.fluid', value),
                        }),
                            
                        // Fluid settings fields
                        themeData.theme_json.settings?.typography?.fluid && 
                        wp.element.createElement('div', { 
                            className: 'theme-designer--fluid-settings-container'
                        },
                            wp.element.createElement(TextControl, {
                                label: __('Minimum Font Size', 'theme-designer'),
                                value: (themeData.theme_json.settings?.typography?.fluid && typeof themeData.theme_json.settings?.typography.fluid === 'object' ? themeData.theme_json.settings?.typography.fluid.minFontSize : '') || '',
                                onChange: (value) => updateFluidSetting('minFontSize', value),
                                help: __('Global minimum font size boundary (e.g., 14px, 0.875rem)', 'theme-designer'),
                                className: 'regular-text',
                                __next40pxDefaultSize: true
                            }),
                            wp.element.createElement(TextControl, {
                                label: __('Minimum Viewport Width', 'theme-designer'),
                                value: (themeData.theme_json.settings?.typography?.fluid && typeof themeData.theme_json.settings?.typography.fluid === 'object' ? themeData.theme_json.settings?.typography.fluid.minViewportWidth : '') || '',
                                onChange: (value) => updateFluidSetting('minViewportWidth', value),
                                help: __('Minimum viewport width for fluid calculations (e.g., 768px, 48rem)', 'theme-designer'),
                                className: 'regular-text',
                                __next40pxDefaultSize: true
                            }),
                            wp.element.createElement(TextControl, {
                                label: __('Maximum Viewport Width', 'theme-designer'),
                                value: (themeData.theme_json.settings?.typography?.fluid && typeof themeData.theme_json.settings?.typography.fluid === 'object' ? themeData.theme_json.settings?.typography.fluid.maxViewportWidth : '') || '',
                                onChange: (value) => updateFluidSetting('maxViewportWidth', value),
                                help: __('Maximum viewport width for fluid calculations (e.g., 1200px, 75rem)', 'theme-designer'),
                                className: 'regular-text',
                                __next40pxDefaultSize: true
                            })
                        )
                    ),
                    
                    wp.element.createElement(ListManager, {
                        items: fontSizes,
                        onItemsChange: updateFontSizes,
                        renderItem: renderFontSizeItem,
                        addButtonText: __('Add Font Size', 'theme-designer'),
                        createNewItem: () => ({
                            name: '',
                            slug: '',
                            size: '',
                            fluid: false
                        })
                    })
                ]
            ),
        ),

        // Font Families with ListManager
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Font Families', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(ListManager, {
                    items: fontFamilies,
                    onItemsChange: updateFontFamilies,
                    renderItem: renderFontFamilyItem,
                    addButtonText: __('Add Font Family', 'theme-designer'),
                    createNewItem: () => ({
                        name: '',
                        slug: '',
                        fontFamily: ''
                    })
                })
            )
        )
    );
}); 