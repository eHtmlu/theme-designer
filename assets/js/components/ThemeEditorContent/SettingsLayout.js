// SettingsLayout Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.SettingsLayout', ({ themeData, updateThemeJson }) => {
    const { __ } = wp.i18n;
    const { TextControl, Notice } = wp.components;
    const { TriStateCheckboxControl } = ThemDesi.Components;
    const { generateSlug, getSvgIcon, getWordPressDefault } = ThemDesi.Utils;

    // Check if layout size fields are empty
    const isContentSizeEmpty = !themeData.theme_json.settings?.layout?.contentSize;
    const isWideSizeEmpty = !themeData.theme_json.settings?.layout?.wideSize;
    const showLayoutNotice = isContentSizeEmpty && isWideSizeEmpty;
    const showWideOnlyNotice = isContentSizeEmpty && !isWideSizeEmpty;

    return wp.element.createElement('div', { className: 'theme-designer--settings-layout' },
        wp.element.createElement('h2', null,
            getSvgIcon('mirror_rectangle'),
            __('Layout', 'theme-designer')
        ),
        
        // User Controls
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Provide User Controls', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content' },
                wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to edit layout settings', 'theme-designer'),
                    value: themeData.theme_json.settings?.layout?.allowEditing,
                    onChange: (value) => updateThemeJson('settings.layout.allowEditing', value),
                    defaultValue: getWordPressDefault('settings.layout.allowEditing'),
                }),
                themeData.theme_json.settings?.layout?.allowEditing !== false && wp.element.createElement(TriStateCheckboxControl, {
                    label: __('Allow users to set custom content size and wide size', 'theme-designer'),
                    value: themeData.theme_json.settings?.layout?.allowCustomContentAndWideSize,
                    onChange: (value) => updateThemeJson('settings.layout.allowCustomContentAndWideSize', value),
                    defaultValue: getWordPressDefault('settings.layout.allowCustomContentAndWideSize'),
                }),
            )
        ),

        // Layout Sizes
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Layout Sizes', 'theme-designer')),
            
            // Notice when fields are empty
            showLayoutNotice && wp.element.createElement(Notice, {
                status: 'warning',
                isDismissible: false,
                className: 'theme-designer--layout-notice'
            }, 
                wp.element.createElement('p', null,
                    wp.element.createElement('strong', null, __('Highly recommended: ', 'theme-designer')),
                    __('Provide at least a Content Width value for a good experience with the block editor.', 'theme-designer')
                )
            ),
            
            // Notice when only Wide Width is filled
            showWideOnlyNotice && wp.element.createElement(Notice, {
                status: 'info',
                isDismissible: false,
                className: 'theme-designer--wide-only-notice'
            }, 
                wp.element.createElement('p', null,
                    wp.element.createElement('strong', null, __('Note: ', 'theme-designer')),
                    __('The block editor may behave unexpectedly when only Wide Width is set without Content Width.', 'theme-designer')
                )
            ),
            
            wp.element.createElement('div', { className: 'theme-designer--main__section-content theme-designer--main__section-content--grid' },
                wp.element.createElement(TextControl, {
                    label: __('Content Width', 'theme-designer'),
                    help: __('The maximum width of the content area (e.g., 840px, 60rem).', 'theme-designer'),
                    value: themeData.theme_json.settings?.layout?.contentSize,
                    onChange: (value) => updateThemeJson('settings.layout.contentSize', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                wp.element.createElement(TextControl, {
                    label: __('Wide Width', 'theme-designer'),
                    help: __('The maximum width for wide blocks (e.g., 1100px, 80rem). Also used as the maximum viewport when calculating fluid font sizes.', 'theme-designer'),
                    value: themeData.theme_json.settings?.layout?.wideSize,
                    onChange: (value) => updateThemeJson('settings.layout.wideSize', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                })
            )
        )
    );
}); 