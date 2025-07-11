// SettingsGeneral Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsGeneral', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { TriStateCheckboxControl } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    return wp.element.createElement('div', { className: 'theme-designer--settings-general' },
        wp.element.createElement('h2', null,
            getSvgIcon('cog'),
            __('General', 'theme-designer')
        ),
        
        // User Controls
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Enable appearance tools', 'theme-designer'),
                    help: __('Enables UI tools for background, border, color, dimensions, position, spacing, and typography controls.', 'theme-designer'),
                    value: themeData.theme_json.settings?.appearanceTools,
                    onChange: (value) => updateThemeJson('settings.appearanceTools', value),
                    defaultValue: getWordPressDefault('settings.appearanceTools')
                }),
            )
        ),

        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Style Behavior', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Use root padding aware alignments', 'theme-designer'),
                    help: __('Enables root padding (the values from `styles.spacing.padding`) to be applied to the contents of full-width blocks instead of the root block.\n\nPlease note that when using this setting, `styles.spacing.padding` should always be set as an object with `top`, `right`, `bottom`, `left` values declared separately.', 'theme-designer'),
                    value: themeData.theme_json.settings?.useRootPaddingAwareAlignments,
                    onChange: (value) => updateThemeJson('settings.useRootPaddingAwareAlignments', value),
                    defaultValue: getWordPressDefault('settings.useRootPaddingAwareAlignments')
                })
            )
        )
    );
}); 