// SettingsPosition Component
const SettingsPosition = ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;

    return wp.element.createElement('div', { className: 'theme-designer--settings-position' },
        wp.element.createElement('h2', null,
            ThemeDesignerUtils.getSvgIcon('pin'),
            __('Position', 'theme-designer')
        ),
        
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set sticky position', 'theme-designer'),
                    value: themeData.theme_json.settings?.position?.sticky,
                    onChange: (value) => updateThemeJson('settings.position.sticky', value),
                    defaultValue: ThemeDesignerUtils.getWordPressDefault('settings.position.sticky'),
                }),
            )
        )
    );
}; 