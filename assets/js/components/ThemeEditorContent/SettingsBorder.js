// SettingsBorder Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsBorder', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { TriStateCheckboxControl } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    return wp.element.createElement('div', { className: 'theme-designer--settings-border' },
        wp.element.createElement('h2', null,
            getSvgIcon('border_radius'),
            __('Border', 'theme-designer')
        ),
        
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set border colors', 'theme-designer'),
                    value: themeData.theme_json.settings?.border?.color,
                    onChange: (value) => updateThemeJson('settings.border.color', value),
                    defaultValue: getWordPressDefault('settings.border.color'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set border radius', 'theme-designer'),
                    value: themeData.theme_json.settings?.border?.radius,
                    onChange: (value) => updateThemeJson('settings.border.radius', value),
                    defaultValue: getWordPressDefault('settings.border.radius'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set border styles', 'theme-designer'),
                    value: themeData.theme_json.settings?.border?.style,
                    onChange: (value) => updateThemeJson('settings.border.style', value),
                    defaultValue: getWordPressDefault('settings.border.style'),
                }),
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set border widths', 'theme-designer'),
                    value: themeData.theme_json.settings?.border?.width,
                    onChange: (value) => updateThemeJson('settings.border.width', value),
                    defaultValue: getWordPressDefault('settings.border.width'),
                }),
            )
        )
    );
}); 