// SuccessMessage Component
const SuccessMessage = ({ message, onClose }) => {
    const { __ } = wp.i18n;
    const { useEffect } = wp.element;
    const { Button } = wp.components;

    // Auto-hide after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return wp.element.createElement('div', { 
        className: 'theme-designer--success-message'
    },
        wp.element.createElement('span', { 
            className: 'dashicons dashicons-yes-alt theme-designer--success-message__icon'
        }),
        wp.element.createElement('span', { className: 'theme-designer--success-message__text' }, message),
        wp.element.createElement(Button, {
            isSmall: true,
            onClick: onClose,
            className: 'theme-designer--success-message__dismiss'
        }, __('Dismiss', 'theme-designer'))
    );
}; 