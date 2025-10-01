=== Theme Designer ===
Contributors: eHtmlu
Donate link: https://www.paypal.com/donate/?hosted_button_id=2G6L8NWVXZ4T4
Tags: block-theme, colors, typography, spacing, theme-builder
Requires at least: 5.8
Tested up to: 6.8
Stable tag: 1.0.0
Requires PHP: 7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create and manage block themes with an intuitive interface. No coding required - design your theme's settings through a user-friendly admin panel.

== Description ==

**Theme Designer** is a powerful WordPress plugin that allows you to create and manage block themes (FSE themes) without writing a single line of code. It provides an intuitive interface to configure all theme settings that are typically defined in the `theme.json` file.

= Key Features =

* **Visual Theme Builder**: Create new themes with a simple form interface
* **Complete Settings Management**: Configure all theme.json settings through an intuitive admin panel
* **Theme Metadata**: Set theme name, description, author, version, and other metadata
* **Screenshot Management**: Upload and manage theme screenshots
* **Color Palettes**: Define custom color palettes and gradients
* **Typography Settings**: Configure font families, sizes, and fluid typography
* **Spacing & Layout**: Set up spacing scales, layout sizes, and user controls
* **Border & Shadow**: Define border styles, radius, and shadow presets
* **Background Controls**: Configure background image and positioning options
* **Theme Export**: Download your themes as installable ZIP files
* **Theme Duplication**: Easily duplicate existing themes as starting points
* **WordPress Defaults**: Choose to include or exclude WordPress default settings

= What Gets Created =

When you create a theme with Theme Designer, it automatically generates:

* **Theme Directory Structure**: Complete theme folder with all necessary files
* **style.css**: Theme header with all metadata
* **theme.json**: Complete configuration file with all your settings
* **Templates**: Basic `index.html` template for the main content area
* **Template Parts**: `header.html` and `footer.html` parts for site structure
* **Screenshot**: Theme preview image (if uploaded)

= How It Works =

1. **Open Theme Designer**: In the admin panel go to "Design" → "Theme Designer"
2. **Create Theme**: Fill out the theme metadata form
3. **Configure Settings**: Use the visual interface to set up colors, typography, spacing, etc.
4. **Preview & Test**: Your theme is immediately available in the WordPress admin

= Perfect For =

* **Developers** who want to quickly prototype themes
* **Designers** who prefer visual tools over code
* **Agencies** creating custom themes for clients
* **WordPress users** who want to create their own themes
* **Theme shops** looking to streamline theme creation

= Integration with Site Editor =

Themes created with Theme Designer work seamlessly with the WordPress Site Editor. You can:

* Customize templates and template parts visually
* Add custom styles through the Site Editor interface
* Override theme settings on a per-page basis
* Create additional templates and parts as needed

**Note**: Settings defined in the Site Editor take precedence over theme settings, even after saving new values in the theme.

= Requirements =

* Block theme support enabled
* Write permissions for the themes directory

== Frequently Asked Questions ==

= Can I use this plugin to create themes for distribution? =

Yes! Themes created with Theme Designer are fully compatible with WordPress and can be distributed, sold, or shared. The plugin creates standard WordPress themes that work exactly like any other block theme.

= What happens to my themes if I deactivate the plugin? =

Your themes remain completely intact. The plugin only helps you create and manage themes - once created, they are independent WordPress themes that will continue to work even if the plugin is deactivated.

= Can I edit existing themes with this plugin? =

Yes, you can edit any theme that was created with Theme Designer. The plugin tracks themes it has created and allows you to modify their settings through the same interface. To avoid data loss, it is currently not possible to edit themes that were not created with Theme Designer.

= Does this plugin support all theme.json features? =

The plugin supports all the major settings sections of theme.json including colors, typography, spacing, layout, borders, shadows, and more. It focuses on the settings that are most commonly used and provides a user-friendly interface for them. However, the sections "styles", "customTemplates" and "templateParts" of theme.json are not currently supported.

= Can I use custom CSS with themes created by this plugin? =

Yes, you can add custom CSS through the WordPress Site Editor.

Since the plugin creates standard WordPress block themes, it's also possible to edit the theme files directly. However, it's strongly recommended not to use the style.css file but rather a separate CSS file for styles, as the Theme Designer currently completely overwrites the styles.css file each time changes are made.

= Is there a limit to how many themes I can create? =

No, there's no limit. You can create as many themes as you want, limited only by your server's storage capacity.

= Can I import existing themes? =

Yes! You can simply install a theme the usual way. If it was created with the Theme Designer, it will be automatically recognized and you can edit it with the Theme Designer again.

= What file formats are supported for theme screenshots? =

The plugin supports PNG, JPG, and GIF formats for theme screenshots. Although all three formats are supported by WordPress, WordPress officially recommends the PNG format. The recommended size is 1200x900 pixels.

= Can I export themes to share with others? =

Yes! The plugin includes an export feature that creates a standard WordPress theme ZIP file that can be installed on any WordPress site. And if you have the Theme Designer installed there as well, you can continue editing the theme there.

== Screenshots ==

1. How to open Theme Designer
2. Theme Designer main interface showing theme list
3. Theme creation form with metadata fields
4. Settings configuration panel with color palette editor

== Changelog ==

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.0 =
Initial release of Theme Designer. Create your first block theme today!

== Credits ==

Developed by [eHtmlu](https://ehtmlu.com/)

Built with WordPress best practices and modern web standards.

== Support ==

For support, feature requests, or bug reports, please visit:
* [WordPress.org Plugin Page](https://wordpress.org/plugins/theme-designer/)
* [GitHub Repository](https://github.com/eHtmlu/theme-designer)

== License ==

This plugin is licensed under the GPL v2 or later.

== Donate ==

If you find this plugin helpful, please consider making a donation to support continued development:

[Donate via PayPal](https://www.paypal.com/donate/?hosted_button_id=2G6L8NWVXZ4T4)