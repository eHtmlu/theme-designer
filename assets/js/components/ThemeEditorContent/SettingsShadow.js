// SettingsShadow Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsShadow', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { useState } = wp.element;
    const { TextControl } = wp.components;
    const { TriStateCheckboxControl, ListManager } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    const [shadows, setShadows] = useState(themeData.theme_json.settings?.shadow?.presets || []);

    const updateShadows = (newShadows) => {
        setShadows(newShadows);
        updateThemeJson('settings.shadow.presets', newShadows);
    };

    // Shadow Item Renderer
    const renderShadowItem = (shadow, index, onUpdate) => {
        const updateShadow = (field, value) => {
            const updatedShadow = { ...shadow, [field]: value };
            
            // Auto-generate slug from name
            if (field === 'name') {
                updatedShadow.slug = generateSlug(value);
            }
            
            onUpdate(updatedShadow);
        };

        return [
            wp.element.createElement(TextControl, {
                label: __('Name', 'theme-designer'),
                value: shadow.name,
                onChange: (value) => updateShadow('name', value),
                className: 'shadow-name',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('Slug', 'theme-designer'),
                value: shadow.slug,
                onChange: (value) => updateShadow('slug', value),
                className: 'shadow-slug',
                __next40pxDefaultSize: true
            }),
            wp.element.createElement(TextControl, {
                label: __('CSS Value', 'theme-designer'),
                placeholder: __('e.g.: 0 1px 3px rgba(0, 0, 0, 0.1)', 'theme-designer'),
                value: shadow.shadow,
                onChange: (value) => updateShadow('shadow', value),
                className: 'shadow-value',
                __next40pxDefaultSize: true
            })
        ];
    };

    return wp.element.createElement('div', { className: 'theme-designer--settings-shadow' },
        wp.element.createElement('h2', null,
            getSvgIcon('box_shadow'),
            __('Shadows', 'theme-designer')
        ),
        
        // WordPress Defaults
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide WordPress Defaults', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Provide WordPress default shadow presets', 'theme-designer'),
                    value: themeData.theme_json.settings?.shadow?.defaultPresets,
                    onChange: (value) => updateThemeJson('settings.shadow.defaultPresets', value),
                    defaultValue: getWordPressDefault('settings.shadow.defaultPresets')
                })
            )
        ),

        // Custom Shadows using ListManager
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide Theme Shadow Presets', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(ListManager, {
                    items: shadows,
                    onItemsChange: updateShadows,
                    renderItem: renderShadowItem,
                    addButtonText: __('Add Shadow', 'theme-designer'),
                    createNewItem: () => ({
                        name: '',
                        slug: '',
                        shadow: ''
                    })
                })
            )
        )
    );
}); 