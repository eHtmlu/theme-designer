// SettingsPosition Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsPosition', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { TriStateCheckboxControl } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    return wp.element.createElement('div', { className: 'theme-designer--settings-position' },
        wp.element.createElement('h2', null,
            getSvgIcon('pin'),
            __('Position', 'theme-designer')
        ),
        
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set sticky position', 'theme-designer'),
                    value: themeData.theme_json.settings?.position?.sticky,
                    onChange: (value) => updateThemeJson('settings.position.sticky', value),
                    defaultValue: getWordPressDefault('settings.position.sticky'),
                }),
            )
        )
    );
}); 