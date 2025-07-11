// ThemeMetaData Component
lodash.set(window, 'ThemDesi.Components.ThemeEditorContent.ThemeMetaData', ({ themeData, updateThemeData, slugStatus, isNew = false }) => {
    const { __ } = wp.i18n;
    const { useState, useEffect, useRef } = wp.element;
    const { BaseControl, TextControl, TextareaControl, Button } = wp.components;
    const { generateSlug, getSvgIcon, showAlert } = ThemDesi.Utils;

    const [localData, setLocalData] = useState(themeData);
    const [screenshotPreview, setScreenshotPreview] = useState(themeData.screenshot || '');
    const fileInputRef = useRef(null);

    useEffect(() => {
        setLocalData(themeData);
        setScreenshotPreview(themeData.screenshot || '');
    }, [themeData]);

    const handleChange = (field, value) => {
        const newData = { ...localData, [field]: value };
        setLocalData(newData);
        updateThemeData(newData);
    };

    const handleNameChange = (value) => {
        // Prepare all changes at once
        const updates = { name: value };
        
        // Auto-generate slug and text domain only for new themes or if they are completely empty
        if (isNew || (!localData.slug || localData.slug === '') && (!localData.text_domain || localData.text_domain === '')) {
            const slug = generateSlug(value);
            updates.slug = slug;
            updates.text_domain = slug;
        }
        
        // Apply all changes in one update
        const newData = { ...localData, ...updates };
        setLocalData(newData);
        updateThemeData(newData);
    };

    const handleSlugChange = (value) => {
        const slug = generateSlug(value);
        const updates = { slug: slug };
        
        // Only auto-update text domain for new themes or if text domain is empty
        if (isNew || !localData.text_domain || localData.text_domain === '') {
            updates.text_domain = slug;
        }
        
        const newData = { ...localData, ...updates };
        setLocalData(newData);
        updateThemeData(newData);
    };

    const handleTextDomainChange = (value) => {
        const textDomain = generateSlug(value);
        handleChange('text_domain', textDomain);
    };

    const handleScreenshotUpload = () => {
        fileInputRef.current.click();
    };

    const handleScreenshotChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            showAlert(__('Please select an image file.', 'theme-designer'), 'error');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            showAlert(__('File size must be less than 2MB.', 'theme-designer'), 'error');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setScreenshotPreview(dataUrl);
            handleChange('screenshot', dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleScreenshotRemove = () => {
        setScreenshotPreview('');
        handleChange('screenshot', 'REMOVED');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return wp.element.createElement('div', { className: 'theme-designer--meta-data' },
        wp.element.createElement('h2', null,
            getSvgIcon('store'),
            __('Theme Meta Data', 'theme-designer')
        ),
        

        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Highly recommended or required fields', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content theme-designer--main__section-content--grid' },

                // Theme Name
                wp.element.createElement(TextControl, {
                    label: __('Theme Name', 'theme-designer'),
                    help: __('The name of your theme as it will appear in the admin.', 'theme-designer'),
                    value: localData.name || '',
                    onChange: handleNameChange,
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // Theme Slug
                wp.element.createElement(TextControl, {
                    label: __('Theme Slug', 'theme-designer'),
                    help: wp.element.createElement('span', null,
                        __('The unique identifier for your theme.', 'theme-designer'),
                        slugStatus.checking && wp.element.createElement('span', { className: 'theme-designer--slug-status--checking' }, ' - Checking...'),
                        localData.slug !== '' && !slugStatus.checking && slugStatus.available && wp.element.createElement('span', { className: 'theme-designer--slug-status--available' }, ' - Available'),
                        localData.slug !== '' && !slugStatus.checking && !slugStatus.available && wp.element.createElement('span', { className: 'theme-designer--slug-status--unavailable' }, ' - Not available')
                    ),
                    value: localData.slug || '',
                    onChange: handleSlugChange,
                    className: 'regular-text',
                    required: true,
                    __next40pxDefaultSize: true
                }),

                // Text Domain
                wp.element.createElement(TextControl, {
                    label: __('Text Domain', 'theme-designer'),
                    help: __('The text domain for translations.', 'theme-designer'),
                    value: localData.text_domain || '',
                    onChange: handleTextDomainChange,
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

            )
        ),
        
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Recommended fields', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content theme-designer--main__section-content--grid' },

                // Screenshot Upload
                wp.element.createElement(BaseControl, {
                    className: 'form-field theme-designer--main__section-content--grid-row-span-3',
                    label: __('Theme Screenshot', 'theme-designer'),
                    help: [
                        __('Recommended size: 1200x900 pixels', 'theme-designer'),
                        wp.element.createElement('br', null),
                        __('Recommended format: PNG', 'theme-designer'),
                        wp.element.createElement('br', null),
                        __('Maximum file size: 2MB', 'theme-designer')
                    ],
                },
                wp.element.createElement('div', { className: 'theme-designer--screenshot-upload' },
                    wp.element.createElement('div', { className: 'theme-designer--screenshot-preview' },
                        screenshotPreview && screenshotPreview !== 'REMOVED'
                            ? wp.element.createElement('img', { 
                                src: screenshotPreview, 
                                alt: __('Theme Screenshot', 'theme-designer'),
                                className: 'theme-designer--screenshot-image'
                            })
                            : wp.element.createElement('div', { className: 'theme-designer--screenshot-placeholder' },
                                getSvgIcon('image'),
                                wp.element.createElement('p', null, __('No screenshot uploaded', 'theme-designer'))
                            )
                    ),
                    wp.element.createElement('input', {
                        ref: fileInputRef,
                        type: 'file',
                        accept: 'image/*',
                        onChange: handleScreenshotChange,
                        className: 'theme-designer--hidden-file-input'
                    }),
                    wp.element.createElement('div', { className: 'theme-designer--screenshot-actions' },
                        wp.element.createElement(Button, {
                            isSecondary: true,
                            onClick: handleScreenshotUpload,
                            __next40pxDefaultSize: true
                        }, __('Upload Screenshot', 'theme-designer')),
                        screenshotPreview && screenshotPreview !== 'REMOVED' && wp.element.createElement(Button, {
                            isDestructive: true,
                            onClick: handleScreenshotRemove,
                            __next40pxDefaultSize: true
                        }, __('Remove Screenshot', 'theme-designer'))
                    )
                )),

                // Version
                wp.element.createElement(TextControl, {
                    label: __('Version', 'theme-designer'),
                    help: __('The version number of your theme.', 'theme-designer'),
                    value: localData.version || '',
                    onChange: (value) => handleChange('version', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // Theme URI
                wp.element.createElement(TextControl, {
                    label: __('Theme URI', 'theme-designer'),
                    help: __('The URI of your theme.', 'theme-designer'),
                    value: localData.theme_uri || '',
                    onChange: (value) => handleChange('theme_uri', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // Description
                wp.element.createElement(TextareaControl, {
                    label: __('Description', 'theme-designer'),
                    help: __('A brief description of your theme.', 'theme-designer'),
                    value: localData.description || '',
                    onChange: (value) => handleChange('description', value),
                    rows: 3,
                    className: 'large-text theme-designer--main__section-content--grid-column-span-2',
                    __next40pxDefaultSize: true
                }),
                
                // Author
                wp.element.createElement(TextControl, {
                    label: __('Author', 'theme-designer'),
                    help: __('The author of your theme.', 'theme-designer'),
                    value: localData.author || '',
                    onChange: (value) => handleChange('author', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // Author URI
                wp.element.createElement(TextControl, {
                    label: __('Author URI', 'theme-designer'),
                    help: __('The URI of the author of your theme.', 'theme-designer'),
                    value: localData.author_uri || '',
                    onChange: (value) => handleChange('author_uri', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // Requires at least
                wp.element.createElement(TextControl, {
                    label: __('Requires at least', 'theme-designer'),
                    help: __('The minimum version of WordPress required to run your theme.', 'theme-designer'),
                    value: localData.requires_at_least || '',
                    onChange: (value) => handleChange('requires_at_least', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // Tested up to
                wp.element.createElement(TextControl, {
                    label: __('Tested up to', 'theme-designer'),
                    help: __('The maximum version of WordPress that your theme has been tested on.', 'theme-designer'),
                    value: localData.tested_up_to || '',
                    onChange: (value) => handleChange('tested_up_to', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // Requires PHP
                wp.element.createElement(TextControl, {
                    label: __('Requires PHP', 'theme-designer'),
                    help: __('The minimum version of PHP required to run your theme.', 'theme-designer'),
                    value: localData.requires_php || '',
                    onChange: (value) => handleChange('requires_php', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

            )
        ),
        
        wp.element.createElement('section', { className: 'theme-designer--main__section' },
            wp.element.createElement('h3', null, __('Optional fields', 'theme-designer')),
            wp.element.createElement('div', { className: 'theme-designer--main__section-content theme-designer--main__section-content--grid' },

                // Tags
                wp.element.createElement(TextControl, {
                    label: __('Tags', 'theme-designer'),
                    help: __('A comma-separated list of tags for your theme.', 'theme-designer'),
                    value: localData.tags || '',
                    onChange: (value) => handleChange('tags', value),
                    className: 'regular-text theme-designer--main__section-content--grid-column-span-3',
                    __next40pxDefaultSize: true
                }),

                // License
                wp.element.createElement(TextControl, {
                    label: __('License', 'theme-designer'),
                    help: sprintf(__('The license of your theme. The most common license for WordPress themes is "%s".', 'theme-designer'), 'GNU General Public License v2 or later'),
                    value: localData.license || '',
                    onChange: (value) => handleChange('license', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

                // License URI
                wp.element.createElement(TextControl, {
                    label: __('License URI', 'theme-designer'),
                    help: sprintf(__('The URI of the license of your theme. The URI of the most common license for WordPress themes is "%s".', 'theme-designer'), 'http://www.gnu.org/licenses/gpl-2.0.html'   ),
                    value: localData.license_uri || '',
                    onChange: (value) => handleChange('license_uri', value),
                    className: 'regular-text',
                    __next40pxDefaultSize: true
                }),

            )
        ),
    );
}); 