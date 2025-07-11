// SettingsDimensions Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsDimensions', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { useState } = wp.element;
    const { TextControl } = wp.components;
    const { TriStateCheckboxControl, ListManager } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    const [aspectRatios, setAspectRatios] = useState(themeData.theme_json.settings?.dimensions?.aspectRatios || []);

    const updateAspectRatios = (newAspectRatios) => {
        setAspectRatios(newAspectRatios);
        updateThemeJson('settings.dimensions.aspectRatios', newAspectRatios);
    };

    // Aspect Ratio Item Renderer
    const renderAspectRatioItem = (aspectRatio, index, onUpdate) => {
        const updateAspectRatio = (field, value) => {
            const updatedAspectRatio = { ...aspectRatio, [field]: value };
            
            // Auto-generate slug from name
            if (field === 'name') {
                updatedAspectRatio.slug = generateSlug(value);
            }
            
            onUpdate(updatedAspectRatio);
        };

        return [
            wp.element.createElement(TextControl, {
                label: __('Name', 'theme-designer'),
                value: aspectRatio.name,
                onChange: (value) => updateAspectRatio('name', value),
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Slug', 'theme-designer'),
                value: aspectRatio.slug,
                onChange: (value) => updateAspectRatio('slug', value),
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Ratio', 'theme-designer'),
                placeholder: __('e.g. 16/9, 4/3, 1.5', 'theme-designer'),
                value: aspectRatio.ratio,
                onChange: (value) => updateAspectRatio('ratio', value),
                __next40pxDefaultSize: true
            })
        ];
    };

    return wp.element.createElement('div', { className: 'theme-designer--settings-dimensions' },
        wp.element.createElement('h2', null,
            getSvgIcon('aspect_ratio'),
            __('Dimensions', 'theme-designer')
        ),
        
        // WordPress Defaults
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide WordPress Defaults', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Provide WordPress default aspect ratios', 'theme-designer'),
                    value: themeData.theme_json.settings?.dimensions?.defaultAspectRatios,
                    onChange: (value) => updateThemeJson('settings.dimensions.defaultAspectRatios', value),
                    defaultValue: getWordPressDefault('settings.dimensions.defaultAspectRatios')
                })
            )
        ),

        // User Controls
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom aspect ratios', 'theme-designer'),
                    value: themeData.theme_json.settings?.dimensions?.aspectRatio,
                    onChange: (value) => updateThemeJson('settings.dimensions.aspectRatio', value),
                    defaultValue: getWordPressDefault('settings.dimensions.aspectRatio')
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom minimum height', 'theme-designer'),
                    value: themeData.theme_json.settings?.dimensions?.minHeight,
                    onChange: (value) => updateThemeJson('settings.dimensions.minHeight', value),
                    defaultValue: getWordPressDefault('settings.dimensions.minHeight')
                })
            )
        ),

        // Custom Aspect Ratios using ListManager
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Aspect Ratios', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(ListManager, {
                    items: aspectRatios,
                    onItemsChange: updateAspectRatios,
                    renderItem: renderAspectRatioItem,
                    addButtonText: __('Add Aspect Ratio', 'theme-designer'),
                    createNewItem: () => ({
                        name: '',
                        slug: '',
                        ratio: ''
                    })
                })
            )
        )
    );
}); 