// SettingsSpacing Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsSpacing', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { useState } = wp.element;
    const { TextControl, RangeControl, SelectControl, ToggleControl } = wp.components;
    const { TriStateCheckboxControl, ListManager, ComboboxControl } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    const spacing = themeData.theme_json.settings?.spacing || {};
    const [units, setUnits] = useState(spacing.units || []);
    const [spacingSizes, setSpacingSizes] = useState(spacing.spacingSizes || []);

    const updateUnits = (newUnits) => {
        setUnits(newUnits);
        updateThemeJson('settings.spacing.units', newUnits);
    };

    const updateSpacingSizes = (newSizes) => {
        setSpacingSizes(newSizes);
        updateThemeJson('settings.spacing.spacingSizes', newSizes);
    };

    const updateUnit = (index, value) => {
        const newUnits = [...units];
        newUnits[index] = value;
        updateUnits(newUnits);
    };

    const updateSpacingSize = (index, field, value) => {
        const newSpacingSizes = [...spacingSizes];
        newSpacingSizes[index] = { ...newSpacingSizes[index], [field]: value };
        
        // Auto-generate slug from name
        if (field === 'name') {
            newSpacingSizes[index].slug = generateSlug(value);
        }
        
        updateSpacingSizes(newSpacingSizes);
    };

    // Spacing Unit Item Renderer
    const renderSpacingUnitItem = (unit, index, onUpdate) => {
        const updateUnit = (value) => {
            onUpdate(value);
        };

        // Predefined CSS units
        const unitOptions = [
            { label: 'px (pixels)', value: 'px' },
            { label: 'em (relative to font-size)', value: 'em' },
            { label: 'rem (relative to root font-size)', value: 'rem' },
            { label: '% (percentage)', value: '%' },
            { label: 'vw (viewport width)', value: 'vw' },
            { label: 'vh (viewport height)', value: 'vh' },
            { label: 'svw (small viewport width)', value: 'svw' },
            { label: 'lvw (large viewport width)', value: 'lvw' },
            { label: 'dvw (dynamic viewport width)', value: 'dvw' },
            { label: 'svh (small viewport height)', value: 'svh' },
            { label: 'lvh (large viewport height)', value: 'lvh' },
            { label: 'dvh (dynamic viewport height)', value: 'dvh' },
            { label: 'vi (viewport inline)', value: 'vi' },
            { label: 'svi (small viewport inline)', value: 'svi' },
            { label: 'lvi (large viewport inline)', value: 'lvi' },
            { label: 'dvi (dynamic viewport inline)', value: 'dvi' },
            { label: 'vb (viewport block)', value: 'vb' },
            { label: 'svb (small viewport block)', value: 'svb' },
            { label: 'lvb (large viewport block)', value: 'lvb' },
            { label: 'dvb (dynamic viewport block)', value: 'dvb' },
            { label: 'vmin (viewport minimum)', value: 'vmin' },
            { label: 'svmin (small viewport minimum)', value: 'svmin' },
            { label: 'lvmin (large viewport minimum)', value: 'lvmin' },
            { label: 'dvmin (dynamic viewport minimum)', value: 'dvmin' },
            { label: 'vmax (viewport maximum)', value: 'vmax' },
            { label: 'svmax (small viewport maximum)', value: 'svmax' },
            { label: 'lvmax (large viewport maximum)', value: 'lvmax' },
            { label: 'dvmax (dynamic viewport maximum)', value: 'dvmax' },
            { label: 'ch (character width)', value: 'ch' },
            { label: 'ex (x-height)', value: 'ex' },
            { label: 'cap (cap height)', value: 'cap' },
            { label: 'ic (inline count)', value: 'ic' },
            { label: 'lh (line height)', value: 'lh' },
            { label: 'rlh (root line height)', value: 'rlh' },
            { label: 'Q (quarter millimeters)', value: 'Q' },
            { label: 'cm (centimeters)', value: 'cm' },
            { label: 'mm (millimeters)', value: 'mm' },
            { label: 'in (inches)', value: 'in' },
            { label: 'pt (points)', value: 'pt' },
            { label: 'pc (picas)', value: 'pc' }
        ];

        return wp.element.createElement(ComboboxControl, {
            label: __('Unit', 'theme-designer'),
            placeholder: __('Unit (e.g., px, rem, custom)', 'theme-designer'),
            value: unit,
            onChange: (value) => updateUnit(value),
            options: unitOptions,
            className: 'spacing-unit'
        });
    };

    // Spacing Size Item Renderer
    const renderSpacingSizeItem = (spacingSize, index, onUpdate) => {
        const updateSpacingSize = (field, value) => {
            const updatedSpacingSize = { ...spacingSize, [field]: value };
            
            // Auto-generate slug from name
            if (field === 'name') {
                updatedSpacingSize.slug = generateSlug(value);
            }
            
            onUpdate(updatedSpacingSize);
        };

        return [
            wp.element.createElement(TextControl, {
                label: __('Name', 'theme-designer'),
                value: spacingSize.name,
                onChange: (value) => updateSpacingSize('name', value),
                className: 'spacing-size-name',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Slug', 'theme-designer'),
                value: spacingSize.slug,
                onChange: (value) => updateSpacingSize('slug', value),
                className: 'spacing-size-slug',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Value', 'theme-designer'),
                placeholder: __('e.g., 1rem', 'theme-designer'),
                value: spacingSize.size,
                onChange: (value) => updateSpacingSize('size', value),
                className: 'spacing-size-size',
                __next40pxDefaultSize: true
            })
        ];
    };

    return wp.element.createElement('div', { className: 'theme-designer--settings-spacing' },
        wp.element.createElement('h2', null,
            getSvgIcon('arrow_all'),
            __('Spacing', 'theme-designer')
        ),
        
        // WordPress Defaults
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide WordPress Defaults', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Provide WordPress default spacing scale', 'theme-designer'),
                    value: spacing.defaultSpacingSizes,
                    onChange: (value) => updateThemeJson('settings.spacing.defaultSpacingSizes', value),
                    defaultValue: getWordPressDefault('settings.spacing.defaultSpacingSizes')
                }),
            )
        ),

        // Block Gap, Margin, Padding Controls
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom block gap', 'theme-designer'),
                    value: spacing.blockGap,
                    onChange: (value) => updateThemeJson('settings.spacing.blockGap', value),
                    defaultValue: getWordPressDefault('settings.spacing.blockGap')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom spacing sizes', 'theme-designer'),
                    value: spacing.customSpacingSize,
                    onChange: (value) => updateThemeJson('settings.spacing.customSpacingSize', value),
                    defaultValue: getWordPressDefault('settings.spacing.customSpacingSize')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom margins', 'theme-designer'),
                    value: spacing.margin,
                    onChange: (value) => updateThemeJson('settings.spacing.margin', value),
                    defaultValue: getWordPressDefault('settings.spacing.margin')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom paddings', 'theme-designer'),
                    value: spacing.padding,
                    onChange: (value) => updateThemeJson('settings.spacing.padding', value),
                    defaultValue: getWordPressDefault('settings.spacing.padding')
                })
            )
        ),

        // Custom Spacing Sizes
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Spacing Sizes', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(ListManager, {
                    items: spacingSizes,
                    onItemsChange: updateSpacingSizes,
                    renderItem: renderSpacingSizeItem,
                    addButtonText: __('Add Spacing Size', 'theme-designer'),
                    createNewItem: () => ({
                        name: '',
                        slug: '',
                        size: ''
                    })
                })
            )
        ),

        // Spacing Scale
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Spacing Scale', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' + (!spacing.defaultSpacingSizes ? ' theme-designer--main__section-content--grid' : '') },
                spacing.defaultSpacingSizes && wp.element.createElement('em', {}, __('WordPress default spacing scale is enabled. You can disable it and provide your own spacing scale instead.', 'theme-designer')),
                !spacing.defaultSpacingSizes && wp.element.createElement(ToggleControl, {
                    label: __('Enable spacing scale', 'theme-designer'),
                    checked: spacing.spacingScale && typeof spacing.spacingScale === 'object',
                    onChange: (value) => {
                        if (value) {
                            // Enable with default settings if no settings exist
                            if (!spacing.spacingScale || typeof spacing.spacingScale !== 'object') {
                                updateThemeJson('settings.spacing.spacingScale', {
                                    steps: 7,
                                    operator: '*',
                                    increment: 1.5,
                                    mediumStep: 1.5,
                                    unit: 'rem'
                                });
                            }
                        } else {
                            // Disable by removing the spacingScale parameter completely
                            updateThemeJson('settings.spacing.spacingScale', '');
                        }
                    },
                }),
                !spacing.defaultSpacingSizes && spacing.spacingScale && typeof spacing.spacingScale === 'object' && [
                    wp.element.createElement(RangeControl, {
                        label: __('Steps', 'theme-designer'),
                        value: spacing.spacingScale?.steps || 7,
                        onChange: (value) => updateThemeJson('settings.spacing.spacingScale.steps', value),
                        min: 1,
                        max: 10,
                        help: __('Number of steps in the spacing scale (1-10).', 'theme-designer'),
                        className: 'regular-text',
                        __next40pxDefaultSize: true
                    }),

                    wp.element.createElement(SelectControl, {
                        label: __('Operator', 'theme-designer'),
                        value: spacing.spacingScale?.operator || '*',
                        options: [
                            { label: __('Multiply (*)', 'theme-designer'), value: '*' },
                            { label: __('Add (+)', 'theme-designer'), value: '+' }
                        ],
                        onChange: (value) => updateThemeJson('settings.spacing.spacingScale.operator', value),
                        help: __('The mathematical operator for the spacing scale.', 'theme-designer'),
                        className: 'regular-text',
                        __next40pxDefaultSize: true
                    }),

                    wp.element.createElement(TextControl, {
                        label: __('Increment', 'theme-designer'),
                        value: spacing.spacingScale?.increment || '1.5',
                        onChange: (value) => updateThemeJson('settings.spacing.spacingScale.increment', parseFloat(value)),
                        help: __('The increment value for the spacing scale.', 'theme-designer'),
                        type: 'number',
                        step: '0.1',
                        min: '0.1',
                        className: 'regular-text',
                        __next40pxDefaultSize: true
                    }),

                    wp.element.createElement(TextControl, {
                        label: __('Medium Step', 'theme-designer'),
                        value: spacing.spacingScale?.mediumStep || '1.5',
                        onChange: (value) => updateThemeJson('settings.spacing.spacingScale.mediumStep', parseFloat(value)),
                        help: __('The medium step value for the spacing scale.', 'theme-designer'),
                        type: 'number',
                        step: '0.1',
                        min: '0.1',
                        className: 'regular-text',
                        __next40pxDefaultSize: true
                    }),

                    wp.element.createElement(ComboboxControl, {
                        label: __('Unit', 'theme-designer'),
                        value: spacing.spacingScale?.unit || 'rem',
                        options: [
                            { label: 'rem (relative to root font-size)', value: 'rem' },
                            { label: 'em (relative to font-size)', value: 'em' },
                            { label: 'px (pixels)', value: 'px' },
                            { label: '% (percentage)', value: '%' },
                            { label: 'vw (viewport width)', value: 'vw' },
                            { label: 'vh (viewport height)', value: 'vh' },
                            { label: 'svw (small viewport width)', value: 'svw' },
                            { label: 'lvw (large viewport width)', value: 'lvw' },
                            { label: 'dvw (dynamic viewport width)', value: 'dvw' },
                            { label: 'svh (small viewport height)', value: 'svh' },
                            { label: 'lvh (large viewport height)', value: 'lvh' },
                            { label: 'dvh (dynamic viewport height)', value: 'dvh' },
                            { label: 'vi (viewport inline)', value: 'vi' },
                            { label: 'svi (small viewport inline)', value: 'svi' },
                            { label: 'lvi (large viewport inline)', value: 'lvi' },
                            { label: 'dvi (dynamic viewport inline)', value: 'dvi' },
                            { label: 'vb (viewport block)', value: 'vb' },
                            { label: 'svb (small viewport block)', value: 'svb' },
                            { label: 'lvb (large viewport block)', value: 'lvb' },
                            { label: 'dvb (dynamic viewport block)', value: 'dvb' },
                            { label: 'vmin (viewport minimum)', value: 'vmin' },
                            { label: 'svmin (small viewport minimum)', value: 'svmin' },
                            { label: 'lvmin (large viewport minimum)', value: 'lvmin' },
                            { label: 'dvmin (dynamic viewport minimum)', value: 'dvmin' },
                            { label: 'vmax (viewport maximum)', value: 'vmax' },
                            { label: 'svmax (small viewport maximum)', value: 'svmax' },
                            { label: 'lvmax (large viewport maximum)', value: 'lvmax' },
                            { label: 'dvmax (dynamic viewport maximum)', value: 'dvmax' }
                        ],
                        onChange: (value) => updateThemeJson('settings.spacing.spacingScale.unit', value),
                        help: __('The unit for the spacing scale.', 'theme-designer'),
                        className: 'regular-text',
                        __next40pxDefaultSize: true
                    })
                ]
            ),
        ),

        // Spacing Units
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Spacing Units', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content theme-designer--main__section-content--grid' },
                wp.element.createElement('p', { className: 'theme-designer--main__section-content--grid-column-span-3' }, __('Available units when users set custom spacing sizes.', 'theme-designer')),
                wp.element.createElement(ListManager, {
                    className: 'theme-designer--main__section-content--grid-column-span-2',
                    items: units,
                    onItemsChange: updateUnits,
                    renderItem: renderSpacingUnitItem,
                    addButtonText: __('Add Unit', 'theme-designer'),
                    createNewItem: () => ''
                })
            )
        ),
    );
}); 