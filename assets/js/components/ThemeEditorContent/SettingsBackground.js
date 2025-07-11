// SettingsBackground Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsBackground', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { TriStateCheckboxControl } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    return wp.element.createElement('div', { className: 'theme-designer--settings-background' },
        wp.element.createElement('h2', null,
            getSvgIcon('image_area'),
            __('Background', 'theme-designer')
        ),
        
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set background images', 'theme-designer'),
                    value: themeData.theme_json.settings?.background?.backgroundImage,
                    onChange: (value) => updateThemeJson('settings.background.backgroundImage', value),
                    defaultValue: getWordPressDefault('settings.background.backgroundImage'),
                }),
                themeData.theme_json.settings?.background?.backgroundImage !== false && wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set background size, position, and repeat', 'theme-designer'),
                    value: themeData.theme_json.settings?.background?.backgroundSize,
                    onChange: (value) => updateThemeJson('settings.background.backgroundSize', value),
                    defaultValue: getWordPressDefault('settings.background.backgroundSize'),
                }),
            )
        )
    );
}); 