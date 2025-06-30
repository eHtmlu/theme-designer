// ThemeEditor Component
const ThemeEditor = ({ themeData, updateThemeData, updateThemeJson, isNew = false }) => {
    const { __ } = wp.i18n;
    const { useState, useEffect, useRef } = wp.element;
    const { Button, Panel, PanelBody, Spinner } = wp.components;

    const [currentSection, setCurrentSection] = useState('theme-meta-data');
    const [slugStatus, setSlugStatus] = useState({ available: true, checking: false });

    // AbortController für Slug-Prüfungen
    const abortControllerRef = useRef(null);
    const debounceTimeoutRef = useRef(null);

    const sections = [
        { id: 'theme-meta-data', title: __('Theme Meta Data', 'theme-designer'), icon: 'store' },
        { id: 'general', title: __('General', 'theme-designer'), icon: 'cog' },
        { id: 'layout', title: __('Layout', 'theme-designer'), icon: 'mirror_rectangle' },
        { id: 'colors', title: __('Colors', 'theme-designer'), icon: 'palette' },
        { id: 'background', title: __('Background', 'theme-designer'), icon: 'image_area' },
        { id: 'border', title: __('Border', 'theme-designer'), icon: 'border_radius' },
        { id: 'position', title: __('Position', 'theme-designer'), icon: 'pin' },
        { id: 'spacing', title: __('Spacing', 'theme-designer'), icon: 'arrow_all' },
        { id: 'typography', title: __('Typography', 'theme-designer'), icon: 'format_text' },
        { id: 'shadows', title: __('Shadows', 'theme-designer'), icon: 'box_shadow' },
        { id: 'dimensions', title: __('Dimensions', 'theme-designer'), icon: 'aspect_ratio' },
    ];

    // Check slug availability when slug changes
    useEffect(() => {
        if (themeData?.slug && themeData.slug.length > 0) {
            // Clear previous timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            
            // Set new timeout for debounced check
            debounceTimeoutRef.current = setTimeout(() => {
                checkSlugAvailability(themeData.slug);
            }, 300); // 300ms delay
        } else {
            // Reset status if slug is empty
            setSlugStatus({ available: true, checking: false });
        }
        
        // Cleanup timeout on unmount
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [themeData?.slug]);

    const checkSlugAvailability = async (slug) => {
        // Abort previous request if it's still running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        // Set checking status immediately
        setSlugStatus({ available: true, checking: true });
        
        try {
            const result = await ThemeDesignerAPI.checkSlug(slug, themeData?._original_slug || '', abortControllerRef.current.signal);
            
            // Only update status if this request wasn't aborted
            if (!abortControllerRef.current.signal.aborted) {
                setSlugStatus({ available: result.available, checking: false });
            }
        } catch (error) {
            // Only update status if this request wasn't aborted
            if (!abortControllerRef.current.signal.aborted) {
                // Check if it's an abort error
                if (error.name === 'AbortError') {
                    // Don't update status for aborted requests
                    return;
                }
                setSlugStatus({ available: false, checking: false });
            }
        }
    };

    const renderSection = () => {
        switch (currentSection) {
            case 'theme-meta-data':
                return wp.element.createElement(ThemeMetaData, {
                    themeData,
                    updateThemeData,
                    slugStatus,
                    isNew
                });
            case 'general':
                return wp.element.createElement(SettingsGeneral, {
                    themeData,
                    updateThemeJson
                });
            case 'colors':
                return wp.element.createElement(SettingsColor, {
                    themeData,
                    updateThemeJson
                });
            case 'typography':
                return wp.element.createElement(SettingsTypography, {
                    themeData,
                    updateThemeJson
                });
            case 'shadows':
                return wp.element.createElement(SettingsShadow, {
                    themeData,
                    updateThemeJson
                });
            case 'dimensions':
                return wp.element.createElement(SettingsDimensions, {
                    themeData,
                    updateThemeJson
                });
            case 'layout':
                return wp.element.createElement(SettingsLayout, {
                    themeData,
                    updateThemeJson
                });
            case 'spacing':
                return wp.element.createElement(SettingsSpacing, {
                    themeData,
                    updateThemeJson
                });
            case 'background':
                return wp.element.createElement(SettingsBackground, {
                    themeData,
                    updateThemeJson
                });
            case 'border':
                return wp.element.createElement(SettingsBorder, {
                    themeData,
                    updateThemeJson
                });
            case 'position':
                return wp.element.createElement(SettingsPosition, {
                    themeData,
                    updateThemeJson
                });
            default:
                return null;
        }
    };

    return wp.element.createElement('div', { className: 'theme-designer--editor' },
        // Main content
        wp.element.createElement('div', { className: 'theme-designer--editor__content' },
            // Sidebar Navigation
            wp.element.createElement('div', { className: 'theme-designer--sidebar' },
                wp.element.createElement('div', { className: 'theme-designer--sidebar__nav' },
                    sections.map(section => 
                        wp.element.createElement('div', {
                            key: section.id,
                            className: `theme-designer--sidebar__nav-item ${currentSection === section.id ? 'theme-designer--sidebar__nav-item--active' : ''}`,
                            onClick: () => setCurrentSection(section.id)
                        },
                            ThemeDesignerUtils.getSvgIcon(section.icon),
                            wp.element.createElement('span', { className: 'theme-designer--sidebar__nav-title' }, section.title)
                        )
                    )
                )
            ),

            // Main content area
            wp.element.createElement('div', { className: 'theme-designer--main' },
                renderSection()
            )
        )
    );
}; 