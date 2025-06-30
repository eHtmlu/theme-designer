// Theme Designer Admin App
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    const { __ } = wp.i18n;
    const { useState, useEffect, render } = wp.element;
    const { Button } = wp.components;

    // Main App Component
    const ThemeDesignerApp = () => {
        const [view, setView] = useState('list'); // 'list' or 'editor'
        const [themes, setThemes] = useState([]);
        const [currentTheme, setCurrentTheme] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const [isSaving, setIsSaving] = useState(false);
        const [isNew, setIsNew] = useState(false);
        const [showSuccess, setShowSuccess] = useState(false);
        const [successMessage, setSuccessMessage] = useState('');

        // Load themes on mount
        useEffect(() => {
            loadThemes();
        }, []);

        const loadThemes = async (silent = false) => {
            try {
                if (!silent) {
                    setIsLoading(true);
                }
                const themesData = await ThemeDesignerAPI.getThemes();
                setThemes(themesData);
            } catch (error) {
                if (!silent) {
                    ThemeDesignerUtils.showAlert(error.message, 'error');
                }
            } finally {
                if (!silent) {
                    setIsLoading(false);
                }
            }
        };

        const showSuccessMessage = (message) => {
            setSuccessMessage(message);
            setShowSuccess(true);
        };

        const handleCreateNew = () => {
            setCurrentTheme(ThemeDesignerUtils.getDefaultConfig());
            setIsNew(true);
            setView('editor');
        };

        const handleEdit = async (slug) => {
            try {
                setIsLoading(true);
                const themeData = await ThemeDesignerAPI.getTheme(slug);
                setCurrentTheme(themeData);
                setIsNew(false);
                setView('editor');
            } catch (error) {
                ThemeDesignerUtils.showAlert(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        const handleDuplicate = async (slug) => {
            try {
                setIsLoading(true);
                const themeData = await ThemeDesignerAPI.getTheme(slug);
                
                // Create duplicate data
                const duplicateData = {
                    ...themeData,
                    name: themeData.name + ' (Copy)',
                    slug: themeData.slug + '-copy',
                    text_domain: themeData.text_domain + '-copy',
                    _is_duplicate: true,
                };
                
                setCurrentTheme(duplicateData);
                setIsNew(true);
                setView('editor');
            } catch (error) {
                ThemeDesignerUtils.showAlert(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        const handleDelete = async (theme) => {
            try {
                await ThemeDesignerAPI.deleteTheme(theme.slug);
                showSuccessMessage(__('Theme deleted successfully.', 'theme-designer'));
                loadThemes(true);
            } catch (error) {
                ThemeDesignerUtils.showAlert(error.message, 'error');
            }
        };

        const handleSave = async () => {
            if (!currentTheme) return;
            
            setIsSaving(true);
            
            try {
                const result = await ThemeDesignerAPI.saveTheme(currentTheme);
                
                // Reload the theme data from server to get the latest version
                if (result.new_slug) {
                    try {
                        const updatedThemeData = await ThemeDesignerAPI.getTheme(result.new_slug);
                        setCurrentTheme(updatedThemeData);
                    } catch (error) {
                        // If we can't reload, just update the slug
                        setCurrentTheme(prev => ({ ...prev, slug: result.new_slug }));
                    }
                }
                
                // Show success message
                showSuccessMessage(result.message);
                loadThemes(true);
                
            } catch (error) {
                ThemeDesignerUtils.showAlert(error.message, 'error');
            } finally {
                setIsSaving(false);
            }
        };

        const handleCancel = () => {
            setView('list');
            setCurrentTheme(null);
            setIsNew(false);
        };

        const updateThemeData = (updates) => {
            setCurrentTheme(prev => ({ ...prev, ...updates }));
        };

        const updateThemeJson = (path, value) => {
            setCurrentTheme(prev => {
                const newData = ThemeDesignerUtils.deepClone(prev);
                const keys = path.split('.');
                let current = newData.theme_json;
                
                // Navigate to the parent object
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                
                const lastKey = keys[keys.length - 1];
                
                // Check if value should be removed (empty, null, undefined, empty array, empty object)
                const isEmptyValue = value === '' || 
                                   value === null || 
                                   value === undefined || 
                                   (Array.isArray(value) && value.length === 0) ||
                                   (typeof value === 'object' && value !== null && Object.keys(value).length === 0);
                
                if (isEmptyValue) {
                    // Remove the property if it exists
                    if (current.hasOwnProperty(lastKey)) {
                        delete current[lastKey];
                    }
                    
                    // Clean up empty parent objects
                    let parent = newData.theme_json;
                    for (let i = 0; i < keys.length - 1; i++) {
                        const key = keys[i];
                        if (parent[key] && Object.keys(parent[key]).length === 0) {
                            delete parent[key];
                        }
                        parent = parent[key];
                    }
                } else {
                    // Set the value normally
                    current[lastKey] = value;
                }
                
                return newData;
            });
        };

        // Render header based on current view
        const renderHeader = () => {
            if (view === 'editor') {
                return wp.element.createElement('div', { className: 'theme-designer--header' },
                    wp.element.createElement('h2', { className: 'theme-designer--header__title' }, 
                        __('Theme Designer', 'theme-designer'),
                        ' - ',
                        isNew ? __('Create New Theme', 'theme-designer') : __('Edit Theme', 'theme-designer')
                    ),
                    wp.element.createElement('div', { className: 'theme-designer--header__actions' },
                        wp.element.createElement(Button, {
                            isSecondary: true,
                            onClick: handleCancel,
                            disabled: isLoading || isSaving,
                            __next40pxDefaultSize: true,
                        }, __('Cancel', 'theme-designer')),
                        wp.element.createElement(Button, {
                            isPrimary: true,
                            onClick: handleSave,
                            disabled: isLoading || isSaving,
                            isBusy: isSaving,
                            __next40pxDefaultSize: true,
                        }, __('Save Theme', 'theme-designer'))
                    )
                );
            } else {
                return wp.element.createElement('div', { className: 'theme-designer--header' },
                    wp.element.createElement('h2', { className: 'theme-designer--header__title' }, __('Theme Designer', 'theme-designer')),
                    wp.element.createElement(Button, {
                        isPrimary: true,
                        onClick: handleCreateNew,
                        disabled: isLoading,
                        __next40pxDefaultSize: true,
                    }, __('Create New Theme', 'theme-designer'))
                );
            }
        };

        // Render main content
        const renderMainContent = () => {
            if (isLoading) {
                return wp.element.createElement('div', { className: 'theme-designer--loading' },
                    wp.element.createElement('div', { className: 'theme-designer--loading__spinner' })
                );
            }

            if (view === 'editor') {
                return wp.element.createElement(ThemeEditor, {
                    themeData: currentTheme,
                    updateThemeData,
                    updateThemeJson,
                    isNew
                });
            } else {
                return wp.element.createElement(ThemeList, {
                    themes: themes,
                    onEdit: handleEdit,
                    onDuplicate: handleDuplicate,
                    onDelete: handleDelete,
                    onCreateNew: handleCreateNew
                });
            }
        };

        // Render footer
        const renderFooter = () => {
            return wp.element.createElement('div', { className: 'theme-designer--footer' },
                wp.element.createElement('p', { className: 'theme-designer--footer__text' }, 
                    wp.element.createElement('strong', {}, __('Note:', 'theme-designer')),
                    ' ',
                    __('The Theme Designer directly adds, changes and removes the theme files, so you\'re modifying the actual theme, not just its settings.', 'theme-designer')
                ),
                !themeDesignerData.exportSupported && wp.element.createElement('p', { className: 'theme-designer--footer__text' }, 
                    wp.element.createElement('strong', {}, __('Note:', 'theme-designer')),
                    ' ',
                    __('Exporting the theme as a ZIP file is not supported on this server because it requires the PHP ZipArchive module.', 'theme-designer')
                )
            );
        };

        return wp.element.createElement('div', { className: 'theme-designer--app' },
            // Global Success Message
            showSuccess && wp.element.createElement(SuccessMessage, {
                message: successMessage,
                onClose: () => setShowSuccess(false)
            }),

            // Header (always visible)
            renderHeader(),

            // Main content (with loading state)
            renderMainContent(),

            // Footer (always visible)
            renderFooter()
        );
    };

    // Render the app
    const container = document.getElementById('theme-designer-app');
    if (container) {
        render(wp.element.createElement(ThemeDesignerApp), container);
    }
}); 