<?php
/**
 * Plugin Name: Theme Designer
 * Plugin URI: https://wordpress.org/plugins/theme-designer/
 * Description: Create and manage block themes (theme.json) with an intuitive interface.
 * Version: 1.0.0
 * Requires at least: 6.3
 * Requires PHP: 8.1
 * Author: eHtmlu
 * Author URI: https://ehtmlu.com/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: theme-designer
 */

namespace ThemDesi;

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}


// Define plugin constants
define(__NAMESPACE__ . '\PLUGIN_URL', plugin_dir_url(__FILE__));
define(__NAMESPACE__ . '\PLUGIN_PATH', plugin_dir_path(__FILE__));



class ThemeDesigner {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        // Check if user has required capabilities
        if (!$this->user_can_manage_themes()) {
            return;
        }
        
        add_theme_page(
            __('Theme Designer', 'theme-designer'),
            __('Theme Designer', 'theme-designer'),
            'edit_theme_options',
            'theme-designer',
            [$this, 'admin_page']
        );
    }
    
    /**
     * Enqueue admin scripts
     * @param string $hook The current admin page hook
     */
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'appearance_page_theme-designer') {
            return;
        }
        
        // Define all scripts to enqueue (slugs will be auto-generated from file paths)
        $script_files = [
            'utils.js',
            'api.js',
            'components/ListManager.js',
            'components/ComboboxControl.js',
            'components/TriStateCheckboxControl.js',
            'components/ThemeList.js',
            'components/SuccessMessage.js',
            'components/ThemeEditor.js',
            'components/ThemeEditorContent/ThemeMetaData.js',
            'components/ThemeEditorContent/SettingsGeneral.js',
            'components/ThemeEditorContent/SettingsColor.js',
            'components/ThemeEditorContent/SettingsTypography.js',
            'components/ThemeEditorContent/SettingsShadow.js',
            'components/ThemeEditorContent/SettingsDimensions.js',
            'components/ThemeEditorContent/SettingsLayout.js',
            'components/ThemeEditorContent/SettingsBackground.js',
            'components/ThemeEditorContent/SettingsBorder.js',
            'components/ThemeEditorContent/SettingsPosition.js',
            'components/ThemeEditorContent/SettingsSpacing.js',
            'admin.js',
        ];
        
        // Enqueue all scripts
        $previous_handle = null;
        foreach ($script_files as $file) {
            $handle = 'theme-designer-' . str_replace(['.js', '/'], ['', '-'], $file);
            wp_enqueue_script(
                $handle,
                PLUGIN_URL . 'assets/js/' . $file,
                $previous_handle ? [$previous_handle] : ['wp-element', 'wp-components', 'wp-i18n', 'lodash'],
                filemtime(PLUGIN_PATH . 'assets/js/' . $file),
                true
            );
            $previous_handle = $handle;
        }
        
        // Enqueue styles
        wp_enqueue_style(
            'theme-designer-admin',
            PLUGIN_URL . 'assets/css/admin.css',
            ['wp-components'],
            filemtime(PLUGIN_PATH . 'assets/css/admin.css')
        );
        
        wp_localize_script('theme-designer-admin', 'ThemDesiData', [
            'restUrl' => rest_url('theme-designer/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'currentTheme' => get_stylesheet(),
            'wpDefaults' => $this->get_wp_defaults(),
            'exportSupported' => class_exists('ZipArchive'),
            'strings' => [
                'confirmDelete' => __('Are you sure you want to delete this theme?', 'theme-designer'),
                'themeDeleted' => __('Theme deleted successfully.', 'theme-designer'),
                'themeSaved' => __('Theme saved successfully.', 'theme-designer'),
                'error' => __('An error occurred.', 'theme-designer'),
            ],
        ]);
    }
    
    /**
     * Register REST routes
     */
    public function register_rest_routes() {
        register_rest_route('theme-designer/v1', '/themes', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'rest_get_themes'],
                'permission_callback' => [$this, 'check_permissions'],
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'rest_save_theme'],
                'permission_callback' => [$this, 'check_permissions'],
            ],
        ]);
        
        register_rest_route('theme-designer/v1', '/themes/(?P<slug>[a-zA-Z0-9-]+)', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'rest_get_theme'],
                'permission_callback' => [$this, 'check_permissions'],
            ],
            [
                'methods' => 'DELETE',
                'callback' => [$this, 'rest_delete_theme'],
                'permission_callback' => [$this, 'check_permissions'],
            ],
        ]);
        
        register_rest_route('theme-designer/v1', '/themes/(?P<slug>[a-zA-Z0-9-]+)/export', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'rest_export_theme'],
                'permission_callback' => [$this, 'check_permissions'],
            ],
        ]);
        
        register_rest_route('theme-designer/v1', '/check-slug', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'rest_check_slug'],
                'permission_callback' => [$this, 'check_permissions'],
            ],
        ]);
    }
    
    /**
     * Check if user has required capabilities
     * @return bool
     */
    public function check_permissions() {
        return $this->user_can_manage_themes();
    }
    
    /**
     * REST endpoint to get all themes
     * @return WP_REST_Response
     */
    public function rest_get_themes() {
        $themes = $this->get_plugin_themes();
        return rest_ensure_response($themes);
    }
    
    /**
     * REST endpoint to get a single theme
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function rest_get_theme($request) {
        $slug = $this->sanitize_theme_slug($request['slug']);
        $theme_data = $this->get_theme_data($slug);
        
        if (!$theme_data) {
            return new \WP_Error('theme_not_found', __('Theme not found.', 'theme-designer'), ['status' => 404]);
        }
        
        return rest_ensure_response($theme_data);
    }
    
    /**
     * REST endpoint to save a theme
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function rest_save_theme($request) {
        $theme_data = $request->get_json_params();
        
        if (!$theme_data) {
            return new \WP_Error('invalid_data', __('Invalid theme data.', 'theme-designer'), ['status' => 400]);
        }
        
        // Sanitize theme data before processing
        $theme_data = $this->sanitize_theme_data($theme_data);
        
        $result = $this->save_theme($theme_data);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => __('Theme saved successfully.', 'theme-designer'),
            'new_slug' => $theme_data['slug'],
        ]);
    }
    
    /**
     * REST endpoint to delete a theme
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function rest_delete_theme($request) {
        $slug = $this->sanitize_theme_slug($request['slug']);
        
        if ($slug === get_stylesheet()) {
            return new \WP_Error('active_theme', __('Cannot delete the active theme.', 'theme-designer'), ['status' => 400]);
        }
        
        $theme_path = get_theme_root() . '/' . $slug; // already sanitized
        
        if ($this->wp_filesystem()->is_dir($theme_path)) {
            $this->wp_filesystem()->delete($theme_path, true);
            return rest_ensure_response([
                'success' => true,
                'message' => __('Theme deleted successfully.', 'theme-designer'),
            ]);
        }
        
        return new \WP_Error('theme_not_found', __('Theme not found.', 'theme-designer'), ['status' => 404]);
    }
    
    /**
     * REST endpoint to export a theme
     * @param WP_REST_Request $request
     */
    public function rest_export_theme($request) {
        $slug = $this->sanitize_theme_slug($request['slug']);
        $this->export_theme($slug);
    }
    
    /**
     * REST endpoint to check if a slug is available
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function rest_check_slug($request) {
        $slug = $this->sanitize_theme_slug($request['slug']);
        $original_slug = $this->sanitize_theme_slug($request['original_slug'] ?? '', true);
        
        // First validate the slug syntax
        $validation_result = $this->validate_theme_slug_syntax($slug);
        if (is_wp_error($validation_result)) {
            return rest_ensure_response([
                'available' => false,
                'valid' => false,
                'message' => $validation_result->get_error_message(),
                'error_code' => $validation_result->get_error_code(),
            ]);
        }
        
        // Then check availability
        $is_available = $this->is_slug_available($slug, $original_slug);
        
        return rest_ensure_response([
            'available' => $is_available,
            'valid' => true,
            'message' => $is_available ? __('Slug is available.', 'theme-designer') : __('Slug is not available.', 'theme-designer'),
        ]);
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        if (!$this->user_can_manage_themes()) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'theme-designer'));
        }
        
        // Check if themes directory is writable
        $themes_dir = get_theme_root();
        if (!$this->wp_filesystem()->is_writable($themes_dir)) {
            echo '<div class="notice notice-error"><p>' . 
                esc_html__('The themes directory is not writable. To use this plugin, write permissions are required.', 'theme-designer') . 
                 '</p></div>';
            return;
        }
        
        ?>
        <div class="wrap">
            <div id="theme-designer-app" class="theme-designer-app"></div>
        </div>
        <?php
    }
    
    /**
     * Get WordPress defaults
     * @return array
     */
    private function get_wp_defaults() {
        return \WP_Theme_JSON_Resolver::get_core_data()->get_raw_data();
    }
    
    /**
     * Check if user has required capabilities
     * @return bool
     */
    private function user_can_manage_themes() {
        return current_user_can('install_themes') && current_user_can('switch_themes') && current_user_can('edit_themes');
    }
    
    /**
     * Get plugin themes
     * @return array
     */
    private function get_plugin_themes() {
        $themes = [];
        $theme_root = get_theme_root();
        $theme_dirs = glob($theme_root . '/*', GLOB_ONLYDIR);
        foreach ($theme_dirs as $theme_dir) {
            $slug = basename($theme_dir);
            $style_css = $theme_dir . '/style.css';
            if ($this->wp_filesystem()->exists($style_css)) {
                $theme_data = get_file_data($style_css, [
                    'Name' => 'Theme Name',
                    'Version' => 'Version',
                    'Generator' => 'Generator',
                ]);
                
                // Check if this theme was created by our plugin
                if (strpos($theme_data['Generator'], 'Theme Designer') !== false) {
                    $theme_info = [
                        'name' => $theme_data['Name'] ?: '',
                        'slug' => $slug,
                        'version' => $theme_data['Version'] ?: '',
                    ];
                    
                    // Add screenshot URL if available
                    if ($screenshot_filename = $this->get_screenshot_filename($slug)) {
                        $theme_info['screenshot'] = get_theme_root_uri() . '/' . $slug . '/' . $screenshot_filename;
                    }
                    $themes[] = $theme_info;
                }
            }
        }
        return $themes;
    }
    
    /**
     * Get theme data
     * @param string $theme_slug
     * @return array|false
     */
    private function get_theme_data($theme_slug) {
        $theme_path = get_theme_root() . '/' . $theme_slug; // already sanitized
        
        // Get style.css data
        $style_css = $theme_path . '/style.css';
        $theme_json = $theme_path . '/theme.json';
        if (!$this->wp_filesystem()->exists($style_css)) {
            return false;
        }
        $theme_data = get_file_data($style_css, [
            'name' => 'Theme Name',
            'theme_uri' => 'Theme URI',
            'author' => 'Author',
            'author_uri' => 'Author URI',
            'description' => 'Description',
            'requires_at_least' => 'Requires at least',
            'tested_up_to' => 'Tested up to',
            'requires_php' => 'Requires PHP',
            'version' => 'Version',
            'license' => 'License',
            'license_uri' => 'License URI',
            'text_domain' => 'Text Domain',
            'tags' => 'Tags',
        ]);

        // Prepare theme.json data
        $json_data = [];
        if ($this->wp_filesystem()->exists($theme_json)) {
            $json_data = json_decode($this->wp_filesystem()->get_contents($theme_json), true) ?: [];
        }
        
        // Transform theme.json data into our format
        $parsed_data = [
            '_original_slug' => $theme_slug,
            ...$theme_data,
            'slug' => $theme_slug,
            'screenshot' => '',
            'theme_json' => $json_data,
        ];
        
        // Check for screenshot
        if ($screenshot_filename = $this->get_screenshot_filename($theme_slug)) {
            $parsed_data['screenshot'] = get_theme_root_uri() . '/' . $theme_slug . '/' . $screenshot_filename;
        }
        
        return $parsed_data;
    }

    /**
     * Get screenshot path
     * @param string $theme_slug
     * @return string|false
     */
    private function get_screenshot_filename($theme_slug) {
        $theme_path = get_theme_root() . '/' . $theme_slug;
        $screenshot_formats = ['png', 'jpg', 'jpeg', 'gif'];
        foreach ($screenshot_formats as $format) {
            $screenshot_path = $theme_path . '/screenshot.' . $format;
            if ($this->wp_filesystem()->exists($screenshot_path)) {
                return 'screenshot.' . $format;
            }
        }
        return false;
    }
    
    /**
     * Save theme
     * @param array $theme_data
     * @return bool|WP_Error
     */
    private function save_theme($theme_data) {
        // Validate slug syntax
        $slug_validation = $this->validate_theme_slug_syntax($theme_data['slug']);
        if (is_wp_error($slug_validation)) {
            return $slug_validation;
        }
        
        $slug = $theme_data['slug']; // already sanitized in sanitize_theme_data

        $theme_path = get_theme_root() . '/' . $slug;
        
        // Check if this is an existing theme with a changed slug
        $original_slug = $theme_data['_original_slug'] ?? '';
        $is_duplicate = $theme_data['_is_duplicate'] ?? false;
        
        // If this is not a duplicate but has an original slug, it means the slug was changed
        if (!$is_duplicate && !empty($original_slug) && $original_slug !== $slug) {
            // Prevent renaming active themes
            if ($original_slug === get_stylesheet()) {
                return new \WP_Error('active_theme_rename', __('Cannot rename the active theme.', 'theme-designer'));
            }

            $original_path = get_theme_root() . '/' . $original_slug; // already sanitized in sanitize_theme_data

            // Check if original theme exists
            if ($this->wp_filesystem()->is_dir($original_path)) {
                // Rename the directory
                if (!$this->wp_filesystem()->move($original_path, $theme_path)) {
                    return new \WP_Error('directory_rename_failed', __('Failed to rename theme directory.', 'theme-designer'));
                }
            }
        }
        
        // Create theme directory if it doesn't exist
        if (!$this->wp_filesystem()->is_dir($theme_path)) {
            if (!$this->wp_filesystem()->mkdir($theme_path, 0755)) {
                return new \WP_Error('directory_creation_failed', __('Failed to create theme directory.', 'theme-designer'));
            }
        }
        
        // Create templates directory if it doesn't exist
        $templates_path = $theme_path . '/templates';
        if (!$this->wp_filesystem()->is_dir($templates_path)) {
            if (!$this->wp_filesystem()->mkdir($templates_path, 0755)) {
                return new \WP_Error('templates_creation_failed', __('Failed to create templates directory.', 'theme-designer'));
            }
        }
        
        // Create parts directory if it doesn't exist
        $parts_path = $theme_path . '/parts';
        if (!$this->wp_filesystem()->is_dir($parts_path)) {
            if (!$this->wp_filesystem()->mkdir($parts_path, 0755)) {
                return new \WP_Error('parts_creation_failed', __('Failed to create parts directory.', 'theme-designer'));
            }
        }
        
        // Save style.css
        $style_content = $this->generate_style_css($theme_data);
        if (!$this->wp_filesystem()->put_contents($theme_path . '/style.css', $style_content)) {
            return new \WP_Error('style_save_failed', __('Failed to save style.css.', 'theme-designer'));
        }
        
        // Save theme.json
        $theme_json = $theme_data['theme_json'];
        if (!$this->wp_filesystem()->put_contents($theme_path . '/theme.json', json_encode($theme_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
            return new \WP_Error('theme_json_save_failed', __('Failed to save theme.json.', 'theme-designer'));
        }
        
        // Save index.html (only if it doesn't exist)
        $index_file_path = $templates_path . '/index.html';
        if (!$this->wp_filesystem()->exists($index_file_path)) {
            $index_content = $this->generate_index_html($theme_data);
            if (!$this->wp_filesystem()->put_contents($index_file_path, $index_content)) {
                return new \WP_Error('index_save_failed', __('Failed to save index.html.', 'theme-designer'));
            }
        }
        
        // Save header template part (only if it doesn't exist)
        $header_file_path = $parts_path . '/header.html';
        if (!$this->wp_filesystem()->exists($header_file_path)) {
            $header_content = $this->generate_header_part($theme_data);
            if (!$this->wp_filesystem()->put_contents($header_file_path, $header_content)) {
                return new \WP_Error('header_save_failed', __('Failed to save header.html.', 'theme-designer'));
            }
        }
        
        // Save footer template part (only if it doesn't exist)
        $footer_file_path = $parts_path . '/footer.html';
        if (!$this->wp_filesystem()->exists($footer_file_path)) {
            $footer_content = $this->generate_footer_part($theme_data);
            if (!$this->wp_filesystem()->put_contents($footer_file_path, $footer_content)) {
                return new \WP_Error('footer_save_failed', __('Failed to save footer.html.', 'theme-designer'));
            }
        }
        
        // Save screenshot if provided
        if (!empty($theme_data['screenshot'])) {
            if ($theme_data['screenshot'] === 'REMOVED') {
                // Remove existing screenshot
                if ($screenshot_filename = $this->get_screenshot_filename($slug)) {
                    $screenshot_path = $theme_path . '/' . $screenshot_filename;
                    if ($this->wp_filesystem()->exists($screenshot_path)) {
                        $this->wp_filesystem()->delete($screenshot_path);
                    }
                }
            } else {
                $screenshot_result = $this->save_screenshot($theme_data['screenshot'], $theme_path, $is_duplicate, $original_slug);
                if (is_wp_error($screenshot_result)) {
                    return $screenshot_result;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Validate theme slug syntax
     * @param string $slug
     * @return bool|WP_Error
     */
    private function validate_theme_slug_syntax($slug) {
        // Check if slug is empty
        if (empty($slug)) {
            return new \WP_Error('empty_slug', __('Theme slug cannot be empty.', 'theme-designer'));
        }
        
        // Check if slug is too short
        if (strlen($slug) < 3) {
            return new \WP_Error('slug_too_short', __('Theme slug must be at least 3 characters long.', 'theme-designer'));
        }
        
        // Check if slug is too long (max 50 characters for directory names)
        if (strlen($slug) > 50) {
            return new \WP_Error('slug_too_long', __('Theme slug cannot exceed 50 characters.', 'theme-designer'));
        }
        
        // Check if slug contains only valid characters (letters, numbers, hyphens, underscores)
        if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
            return new \WP_Error('invalid_slug_chars', __('Theme slug can only contain lowercase letters, numbers, and hyphens.', 'theme-designer'));
        }
        
        // Check if slug starts or ends with hyphen or underscore
        if (preg_match('/^[-]|[-]$/', $slug)) {
            return new \WP_Error('invalid_slug_format', __('Theme slug cannot start or end with a hyphen.', 'theme-designer'));
        }
        
        // Check for reserved names that could cause issues
        $reserved_names = [
            'wp-admin', 'wp-content', 'wp-includes', 'wp-config', 'wp-load',
            'index', 'admin', 'includes', 'assets', 'templates', 'parts',
            'theme', 'themes', 'plugin', 'plugins', 'mu-plugins',
            'uploads', 'cache', 'languages', 'fonts', 'images', 'js', 'css'
        ];
        
        if (in_array(strtolower($slug), $reserved_names)) {
            return new \WP_Error('reserved_slug', sprintf(
                /* translators: 1: Theme slug */
                __('Theme slug "%s" is reserved and cannot be used.', 'theme-designer'),
                $slug
            ));
        }
        
        // Check if slug contains consecutive hyphens
        if (preg_match('/--/', $slug)) {
            return new \WP_Error('consecutive_chars', __('Theme slug cannot contain consecutive hyphens.', 'theme-designer'));
        }
        
        return true;
    }
    
    /**
     * Generate style.css
     * @param array $theme_data
     * @return string
     */
    private function generate_style_css($theme_data) {

        // Get plugin data
        if (!function_exists('get_plugin_data')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $plugin_data = get_plugin_data( __FILE__ );

        // Generate style.css content
        $lines = array_filter([
            'Theme Name' => $theme_data['name'],
            'Theme URI' => $theme_data['theme_uri'],
            'Author' => $theme_data['author'],
            'Author URI' => $theme_data['author_uri'],
            'Description' => $theme_data['description'],
            'Requires at least' => $theme_data['requires_at_least'],
            'Tested up to' => $theme_data['tested_up_to'],
            'Requires PHP' => $theme_data['requires_php'],
            'Version' => $theme_data['version'],
            'License' => $theme_data['license'],
            'License URI' => $theme_data['license_uri'],
            'Text Domain' => $theme_data['text_domain'],
            'Tags' => $theme_data['tags'],
            'Generator' => 'Theme Designer ' . $plugin_data['Version'] ?? '',
            'Generator URI' => $plugin_data['PluginURI'] ?? '',
        ]);

        // Convert array to string
        $content = "/*\n";
        foreach ($lines as $key => $value) {
            $content .= $key . ': ' . preg_replace('/\*\//', '* /', $value) . "\n"; // General sanitization is done in the sanitize_theme_data function
        }
        $content .= "*/";

        return $content;
    }
    
    /**
     * Generate index.html
     * @param array $theme_data
     * @return string
     */
    private function generate_index_html($theme_data) {
        return '<!-- wp:group {"style":{"dimensions":{"minHeight":"100vh"},"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group" style="min-height:100vh"><!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"default"}} -->
<main class="wp-block-group"><!-- wp:post-content {"align":"full","layout":{"type":"constrained"}} /--></main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /--></div>
<!-- /wp:group -->';
    }
    
    /**
     * Generate header.html template part
     * @param array $theme_data
     * @return string
     */
    private function generate_header_part($theme_data) {
        return '<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
<div class="wp-block-group alignwide"><!-- wp:site-title {"level":0} /-->

<!-- wp:navigation /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->';
    }
    
    /**
     * Generate footer.html template part
     * @param array $theme_data
     * @return string
     */
    private function generate_footer_part($theme_data) {
        $year = wp_date('Y');
        return '<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
<div class="wp-block-group alignwide"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:site-title {"level":0} /-->

<!-- wp:paragraph -->
<p>© ' . gmdate('Y') . '</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:paragraph -->
<p>' . __('Powered by someone creative', 'theme-designer') . '</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->';
    }
    
    /**
     * Check if slug is available
     * @param string $slug
     * @param string $original_slug
     * @return bool
     */
    private function is_slug_available($slug, $original_slug = '') {
        
        // Check if theme already exists locally
        $theme_path = get_theme_root() . '/' . $slug;
        if ($this->wp_filesystem()->is_dir($theme_path)) {
            // If this is the current theme being edited, it's available otherwise it's not
            return $slug === $original_slug;
        }
        
        // Check WordPress.org theme directory (basic check)
        $response = wp_remote_get('https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=' . $slug);
        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $body = wp_remote_retrieve_body($response);
            if (!empty($body) && $body !== 'false') {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Export theme as ZIP file
     * @param string $theme_slug
     * @return void
     */
    private function export_theme($theme_slug) {
        $theme_path = get_theme_root() . '/' . $theme_slug; // already sanitized
        if (!$this->wp_filesystem()->is_dir($theme_path)) {
            wp_die(esc_html__('Theme not found.', 'theme-designer'));
        }
        
        // Check if ZipArchive is available
        if (!class_exists('ZipArchive')) {
            wp_die(esc_html__('ZIP functionality is not available on this server.', 'theme-designer'));
        }
        
        $zip_path = wp_tempnam('theme-export-' . $theme_slug);
        $zip = new \ZipArchive();
        $zip_result = $zip->open($zip_path, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        
        if ($zip_result !== true) {
            $error_messages = [
                \ZipArchive::ER_EXISTS => __('File already exists.', 'theme-designer'),
                \ZipArchive::ER_INCONS => __('ZIP archive inconsistent.', 'theme-designer'),
                \ZipArchive::ER_INVAL => __('Invalid argument.', 'theme-designer'),
                \ZipArchive::ER_MEMORY => __('Memory allocation failure.', 'theme-designer'),
                \ZipArchive::ER_NOENT => __('No such file.', 'theme-designer'),
                \ZipArchive::ER_NOZIP => __('Not a ZIP archive.', 'theme-designer'),
                \ZipArchive::ER_OPEN => __('Can\'t open file.', 'theme-designer'),
                \ZipArchive::ER_READ => __('Read error.', 'theme-designer'),
                \ZipArchive::ER_SEEK => __('Seek error.', 'theme-designer'),
            ];
            
            $error_message = isset($error_messages[$zip_result]) 
                ? $error_messages[$zip_result] 
                : __('Failed to create ZIP file.', 'theme-designer');
            
            wp_die(esc_html($error_message));
        }
        
        $this->add_directory_to_zip($zip, $theme_path, $theme_slug);
        $zip->close();
        
        // Verify the ZIP file was created successfully
        if (!$this->wp_filesystem()->exists($zip_path)) {
            wp_die(esc_html__('Failed to create ZIP file.', 'theme-designer'));
        }
        
        // Get file size
        $file_size = $this->wp_filesystem()->size($zip_path);
        if ($file_size === false || $file_size === 0) {
            wp_die(esc_html__('ZIP file is empty or could not be read.', 'theme-designer'));
        }

        // Filename
        $filename = $theme_slug . '.zip';
        
        // Send file to browser
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . addcslashes($filename, '\\"') . '"');
        header('Content-Length: ' . $file_size);
        header('Pragma: no-cache');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        
        // Read and output file
        $data = $this->wp_filesystem()->get_contents($zip_path);
        if ($data === false) {
            wp_die(esc_html__('Failed to read ZIP file.', 'theme-designer'));
        }
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Binary file output
        echo $data;
        
        // Clean up temporary file
        $this->wp_filesystem()->delete($zip_path);
        exit;
    }
    
    /**
     * Add directory to zip
     * @param ZipArchive $zip
     * @param string $dir
     * @param string $base_path
     */
    private function add_directory_to_zip($zip, $dir, $base_path) {
        // Validate input paths
        $dir = realpath($dir);
        if (!$dir || !$this->wp_filesystem()->is_dir($dir)) {
            return;
        }
        
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir),
            \RecursiveIteratorIterator::LEAVES_ONLY // only add files, not directories
        );
        
        foreach ($files as $file) {
            if (!$file->isDir()) {
                $file_path = $file->getRealPath();
                
                // Ensure path starts with the theme directory
                if (strpos($file_path, $dir) !== 0) {
                    continue;
                }
                
                // Calculate relative path
                $relative_path = $base_path . '/' . substr($file_path, strlen($dir) + 1);

                // Add file to zip
                $zip->addFile($file_path, $relative_path);
            }
        }
    }
    
    /**
     * Save theme screenshot
     * @param string $screenshot_url
     * @param string $theme_path
     * @param bool $is_duplicate
     * @param string $original_slug
     * @return string|false
     */
    private function save_screenshot($screenshot_url, $theme_path, $is_duplicate = false, $original_slug = '') {
        // If the screenshot is removed, return false
        if (empty($screenshot_url) || $screenshot_url === 'REMOVED') {
            return false;
        }
        
        // Handle base64 image data
        if (preg_match('/^data:image\/[a-z0-9]+;base64,/', $screenshot_url)) {
            $image_data = base64_decode(substr($screenshot_url, strpos($screenshot_url, ',') + 1));
            
            // Validate image data
            $validated_image = $this->validate_image_data($image_data);
            if (!$validated_image) {
                return false;
            }
            
            $screenshot_filename = 'screenshot.' . $validated_image['extension'];
            $screenshot_path = $theme_path . '/' . $screenshot_filename;
            
            if ($this->wp_filesystem()->put_contents($screenshot_path, $validated_image['data'])) {
                return $screenshot_filename;
            }
        }

        // If this is an existing theme screenshot and the original theme is not the same as the new theme, copy the screenshot from the original theme
        if ($is_duplicate && !empty($original_slug)) {
            // Copy from original theme
            $original_screenshot_filename = $this->get_screenshot_filename($original_slug);
            $original_screenshot_path = get_theme_root() . '/' . $original_slug . '/' . $original_screenshot_filename;
            $new_screenshot_path = $theme_path . '/' . $original_screenshot_filename;
            if ($this->wp_filesystem()->exists($original_screenshot_path) && !$this->wp_filesystem()->exists($new_screenshot_path)) {
                if (!$this->wp_filesystem()->copy($original_screenshot_path, $new_screenshot_path)) {
                    return false;
                }
                return $original_screenshot_filename;
            }
        }
        
        return false;
    }

    /**
     * Get and initialize the WP_Filesystem object
     * @return WP_Filesystem_Base
     */
    private function wp_filesystem() {
        global $wp_filesystem;
        if (empty($wp_filesystem)) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }
        return $wp_filesystem;
    }

    /**
     * Sanitize a slug
     * @param string $value
     * @return string
     */
    private function sanitize_theme_slug($slug, $allow_empty = false) {
        $sanitized_slug = sanitize_file_name(sanitize_title(sanitize_text_field($slug)));
        if (empty($sanitized_slug) && !$allow_empty) {
            wp_die(esc_html__('Invalid theme slug.', 'theme-designer'));
        }
        return $sanitized_slug;
    }

    /**
     * Sanitize theme data
     * @param array $theme_data
     * @return array
     */
    private function sanitize_theme_data($theme_data) {
        $sanitized = [];

        $allowed_fields = [
            'text' => [
                'name',
                'theme_uri',
                'author',
                'author_uri',
                'description',
                'requires_at_least',
                'tested_up_to',
                'requires_php',
                'version',
                'license',
                'license_uri',
                'text_domain',
                'tags',
            ],
            'slug' => [
                'slug',
                '_original_slug',
            ],
            'url' => [
                'theme_uri',
                'author_uri',
                'license_uri',
            ],
            'screenshot' => [
                'screenshot'
            ],
            'boolean' => [
                '_is_duplicate',
            ],
        ];

        // Sanitize theme data
        foreach ($allowed_fields as $type => $fields) {
            foreach ($fields as $field) {
                if (isset($theme_data[$field])) {
                    switch ($type) {
                        case 'text':
                            $sanitized[$field] = sanitize_text_field($theme_data[$field]);
                            break;
                        case 'slug':
                            $sanitized[$field] = $this->sanitize_theme_slug($theme_data[$field]);
                            break;
                        case 'url':
                            $sanitized[$field] = esc_url_raw($theme_data[$field]);
                            break;
                        case 'screenshot':
                            $sanitized[$field] = $theme_data[$field] === 'REMOVED' ? 'REMOVED' : esc_url_raw($theme_data[$field], ['https', 'http', 'data']);
                            break;
                        case 'boolean':
                            $sanitized[$field] = (bool) $theme_data[$field];
                            break;
                    }
                }
            }
        }
        
        // Sanitize theme.json
        if (isset($theme_data['theme_json']) && is_array($theme_data['theme_json'])) {
            $sanitized['theme_json'] = $this->sanitize_theme_json($theme_data['theme_json']);
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize theme.json data
     * @param array $theme_json
     * @return array
     */
    private function sanitize_theme_json($theme_json) {
        $sanitized = [];

        // Because the user has capabilities to edit themes anyway, we don't really need to sanitize the theme.json data. Would make it way too complicated.
        $sanitized = $theme_json;
        
        return $sanitized;
    }

    /**
     * Validate and sanitize uploaded image data
     * @param string $image_data Base64 encoded image data
     * @return array|false Array with mime_type and data, or false if invalid
     */
    private function validate_image_data($image_data) {
        // Check file size (max 2MB)
        if (strlen($image_data) > 2 * 1024 * 1024) {
            return false;
        }
        
        // Get image info
        $image_info = getimagesizefromstring($image_data);
        if (!$image_info) {
            return false;
        }
        
        // Validate MIME type
        $allowed_mimes = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg', 
            'image/png' => 'png',
            'image/gif' => 'gif'
        ];
        
        if (!isset($allowed_mimes[$image_info['mime']])) {
            return false;
        }
        
        return [
            'mime_type' => $image_info['mime'],
            'extension' => $allowed_mimes[$image_info['mime']],
            'data' => $image_data,
            'width' => $image_info[0],
            'height' => $image_info[1]
        ];
    }
}

// Initialize the plugin
new ThemeDesigner();
