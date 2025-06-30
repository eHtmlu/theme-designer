// ThemeList Component
const ThemeList = ({ themes, onEdit, onDuplicate, onDelete, onExport, onCreateNew }) => {
    const { __ } = wp.i18n;
    const { Button, DropdownMenu, MenuItem, Icon } = wp.components;

    const handleDelete = async (theme) => {
        if (!confirm(__('Are you sure you want to permanently delete this theme?', 'theme-designer'))) {
            return;
        }

        await onDelete(theme);
    };

    const handleExport = async (theme) => {
        try {
            await ThemeDesignerAPI.exportTheme(theme.slug);
        } catch (error) {
            ThemeDesignerUtils.showAlert(error.message, 'error');
        }
    };

    return wp.element.createElement('div', { className: 'theme-designer--list' },
        themes.length === 0 
            ? wp.element.createElement('p', { className: 'theme-designer--no-themes' }, __('No themes created yet.', 'theme-designer'))
            : wp.element.createElement('div', { className: 'theme-designer--table-container' },
                wp.element.createElement('table', { className: 'theme-designer--table' },
                    wp.element.createElement('thead', null,
                        wp.element.createElement('tr', null,
                            wp.element.createElement('th', { className: 'theme-designer--table__screenshot-header' }, __('Screenshot', 'theme-designer')),
                            wp.element.createElement('th', { className: 'theme-designer--table__name-header' }, __('Theme Name', 'theme-designer')),
                            wp.element.createElement('th', { className: 'theme-designer--table__slug-header' }, __('Slug', 'theme-designer')),
                            wp.element.createElement('th', { className: 'theme-designer--table__version-header' }, __('Version', 'theme-designer')),
                            wp.element.createElement('th', { className: 'theme-designer--table__status-header' }, __('Status', 'theme-designer')),
                            wp.element.createElement('th', { className: 'theme-designer--table__actions-header' }, __('Actions', 'theme-designer'))
                        )
                    ),
                    wp.element.createElement('tbody', null,
                        themes.map(theme => 
                            wp.element.createElement('tr', { key: theme.slug, className: 'theme-row' },
                                wp.element.createElement('td', { className: 'theme-designer--table__screenshot-cell' },
                                    theme.screenshot 
                                        ? wp.element.createElement('img', { 
                                            src: theme.screenshot, 
                                            alt: theme.name,
                                            className: 'theme-designer--table__screenshot-thumbnail',
                                            width: 80,
                                            height: 60
                                        })
                                        : wp.element.createElement('div', { className: 'theme-designer--table__no-screenshot' },
                                            ThemeDesignerUtils.getSvgIcon('image')
                                        )
                                ),
                                wp.element.createElement('td', { className: 'theme-designer--table__name-cell' },
                                    wp.element.createElement('strong', null, theme.name)
                                ),
                                wp.element.createElement('td', { className: 'theme-designer--table__slug-cell' },
                                    wp.element.createElement('code', null, theme.slug)
                                ),
                                wp.element.createElement('td', { className: 'theme-designer--table__version-cell' },
                                    theme.version
                                ),
                                wp.element.createElement('td', { className: 'theme-designer--table__status-cell' },
                                    theme.slug === themeDesignerData.currentTheme 
                                        ? wp.element.createElement('span', { className: 'theme-designer--badge theme-designer--badge--active' }, __('Active', 'theme-designer'))
                                        : wp.element.createElement('span', { className: 'theme-designer--badge theme-designer--badge--inactive' }, __('Inactive', 'theme-designer'))
                                ),
                                wp.element.createElement('td', { className: 'theme-designer--table__actions-cell' },
                                    wp.element.createElement('div', { className: 'theme-designer--table__actions' },
                                        wp.element.createElement(Button, {
                                            isTertiary: true,
                                            onClick: () => onEdit(theme.slug),
                                            label: __('Edit', 'theme-designer'),
                                            icon: ThemeDesignerUtils.getSvgIcon('pencil', { size: 24 })
                                        }),
                                        wp.element.createElement(DropdownMenu, {
                                            icon: ThemeDesignerUtils.getSvgIcon('dots_horizontal', { size: 24 }),
                                            label: __('More options', 'theme-designer'),
                                            children: ({ onClose }) => [
                                                wp.element.createElement(MenuItem, {
                                                    key: 'duplicate',
                                                    onClick: () => { onDuplicate(theme.slug); onClose(); }
                                                },
                                                    ThemeDesignerUtils.getSvgIcon('content_copy', { size: 24 }),
                                                    __('Duplicate', 'theme-designer')
                                                ),
                                                wp.element.createElement(MenuItem, {
                                                    key: 'export',
                                                    onClick: () => { handleExport(theme); onClose(); },
                                                    disabled: !themeDesignerData.exportSupported
                                                },
                                                    ThemeDesignerUtils.getSvgIcon('download', { size: 24 }),
                                                    __('Download Installable', 'theme-designer')
                                                ),
                                                theme.slug !== themeDesignerData.currentTheme && wp.element.createElement(MenuItem, {
                                                    key: 'delete',
                                                    isDestructive: true,
                                                    onClick: () => { handleDelete(theme); onClose(); }
                                                },
                                                    ThemeDesignerUtils.getSvgIcon('delete_forever', { size: 24 }),
                                                    __('Delete permanently', 'theme-designer')
                                                )
                                            ].filter(Boolean)
                                        })
                                    )
                                )
                            )
                        )
                    )
                )
            )
    );
}; 