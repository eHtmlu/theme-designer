// API functions for Theme Designer
lodash.set(window, 'ThemDesi.API', {
    // Get all themes
    getThemes: async () => {
        try {
            const response = await fetch(ThemDesiData.restUrl + 'themes', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': ThemDesiData.nonce
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch themes');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching themes:', error);
            throw error;
        }
    },

    // Get single theme
    getTheme: async (slug) => {
        try {
            const response = await fetch(ThemDesiData.restUrl + 'themes/' + slug, {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': ThemDesiData.nonce
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch theme');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching theme:', error);
            throw error;
        }
    },

    // Save theme
    saveTheme: async (themeData) => {
        try {
            const response = await fetch(ThemDesiData.restUrl + 'themes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': ThemDesiData.nonce
                },
                body: JSON.stringify(themeData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save theme');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving theme:', error);
            throw error;
        }
    },

    // Delete theme
    deleteTheme: async (slug) => {
        try {
            const response = await fetch(ThemDesiData.restUrl + 'themes/' + slug, {
                method: 'DELETE',
                headers: {
                    'X-WP-Nonce': ThemDesiData.nonce
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete theme');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting theme:', error);
            throw error;
        }
    },

    // Export theme
    exportTheme: async (slug) => {
        try {
            const response = await fetch(ThemDesiData.restUrl + 'themes/' + slug + '/export', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': ThemDesiData.nonce
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to export theme');
            }
            
            // Create download link
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = slug + '.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            return { success: true };
        } catch (error) {
            console.error('Error exporting theme:', error);
            throw error;
        }
    },

    // Check slug availability
    checkSlug: async (slug, originalSlug = '', signal = null) => {
        try {
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': ThemDesiData.nonce
                },
                body: JSON.stringify({
                    slug: slug,
                    original_slug: originalSlug
                })
            };

            // Add signal if provided
            if (signal) {
                fetchOptions.signal = signal;
            }

            const response = await fetch(ThemDesiData.restUrl + 'check-slug', fetchOptions);
            
            if (!response.ok) {
                throw new Error('Failed to check slug');
            }
            
            return await response.json();
        } catch (error) {
            // Don't log abort errors
            if (error.name !== 'AbortError') {
                console.error('Error checking slug:', error);
            }
            throw error;
        }
    }
}); 