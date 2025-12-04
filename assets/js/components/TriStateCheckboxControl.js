// TriStateCheckboxControl Component - Three-state checkbox with WordPress default detection
lodash.set(window, 'ThemDesi.Components.TriStateCheckboxControl', ({ label, value, onChange, help, className, defaultValue }) => {
    const { __ } = wp.i18n;
    const { useState, useEffect, useRef } = wp.element;
    const { BaseControl } = wp.components;
    const { getSvgIcon } = ThemDesi.Utils;

    const checkboxRef = useRef(null);
    const [state, setState] = useState('undefined'); // 'true', 'false', 'undefined'

    const states = {
        true: {
            icon: 'checkbox_marked', 
            iconColor: '#46b450', 
            label: __('Yes', 'theme-designer'),
            stateClass: 'theme-designer--tri-state-checkbox--yes',
        },
        false: {
            icon: 'close_box', 
            iconColor: '#dc3232', 
            label: __('No', 'theme-designer'),
            stateClass: 'theme-designer--tri-state-checkbox--no',
        },
        undefined: {
            icon: 'help_box', 
            iconColor: '#999', 
            label: __('WordPress default ( %s )', 'theme-designer'),
            stateClass: 'theme-designer--tri-state-checkbox--default',
        }
    };

    // Initialize state based on value
    useEffect(() => {
        if (value === true) {
            setState('true');
        } else if (value === false) {
            setState('false');
        } else {
            setState('undefined');
        }
    }, [value]);

    // Update checkbox properties when state changes
    useEffect(() => {
        if (checkboxRef.current) {
            switch (state) {
                case 'true':
                    checkboxRef.current.checked = true;
                    checkboxRef.current.indeterminate = false;
                    break;
                case 'false':
                    checkboxRef.current.checked = false;
                    checkboxRef.current.indeterminate = false;
                    break;
                case 'undefined':
                default:
                    checkboxRef.current.checked = false;
                    checkboxRef.current.indeterminate = true;
                    break;
            }
        }
    }, [state]);

    const handleChange = () => {
        let newState;
        let newValue;

        switch (state) {
            case 'undefined':
                newState = 'true';
                newValue = true;
                break;
            case 'true':
                newState = 'false';
                newValue = false;
                break;
            case 'false':
                newState = 'undefined';
                newValue = undefined; // This will remove the parameter
                break;
            default:
                newState = 'undefined';
                newValue = undefined;
        }

        setState(newState);
        onChange(newValue);
    };

    // Get current state configuration
    const getCurrentState = () => {
        return state === 'undefined' ? {
            ...states['undefined'],
            ...(states[defaultValue] ? {
                icon: states[defaultValue].icon,
                label: wp.i18n.sprintf(states['undefined'].label, typeof defaultValue === 'boolean' ? states[defaultValue].label : 'unknown')
            } : {
                label: wp.i18n.sprintf(states['undefined'].label, JSON.stringify(defaultValue))
            }),
        } : states[state];
    };

    const currentState = getCurrentState();

    return wp.element.createElement(BaseControl, {
        help: help,
        className: 'theme-designer--tri-state-checkbox ' + currentState.stateClass + ' ' + className
    },
        wp.element.createElement('label', {
            className: 'theme-designer--tri-state-checkbox__control',
            onClick: handleChange,
            onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleChange();
                }
            },
        },
            wp.element.createElement('input', {
                ref: checkboxRef,
                type: 'checkbox',
                className: 'theme-designer--tri-state-checkbox__input',
                onChange: handleChange,
            }),
            getSvgIcon(
                currentState.icon,
                {
                    size: 24,
                    color: currentState.iconColor
                }
            ),
            wp.element.createElement('span', { className: 'theme-designer--tri-state-checkbox__label' },
                label, ' → ', wp.element.createElement('span', { 
                    className: 'theme-designer--tri-state-checkbox__label-state',
                }, currentState.label)
            )
        )
    );
});