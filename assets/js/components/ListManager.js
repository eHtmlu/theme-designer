// ListManager Component - Generic list management for theme settings
lodash.set(window, 'ThemDesi.Components.ListManager', ({ items, onItemsChange, renderItem, addButtonText, createNewItem, className }) => {
    const { __ } = wp.i18n;
    const { useState, useRef } = wp.element;
    const { Button } = wp.components;
    const { getSvgIcon } = ThemDesi.Utils;

    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dropIndex, setDropIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragItemRef = useRef(null);
    const containerRef = useRef(null);

    const addItem = () => {
        const newItem = createNewItem();
        const newItems = [...items, newItem];
        onItemsChange(newItems);
    };

    const updateItem = (index, updatedItem) => {
        const newItems = [...items];
        newItems[index] = updatedItem;
        onItemsChange(newItems);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onItemsChange(newItems);
    };

    // Check if mouse position is within drag handle
    const isDragHandle = (event, itemElement) => {
        const dragHandle = itemElement.querySelector('.theme-designer--list-manager__drag-handle');
        if (!dragHandle) return false;
        
        const handleRect = dragHandle.getBoundingClientRect();
        
        return event.clientX >= handleRect.left && 
               event.clientX <= handleRect.right && 
               event.clientY >= handleRect.top && 
               event.clientY <= handleRect.bottom;
    };

    // Calculate drop index based on mouse position within container
    const calculateDropIndex = (event) => {
        if (!containerRef.current || items.length === 0) return 0;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseY = event.clientY;
        const containerTop = containerRect.top;
        
        // Get all item elements
        const itemElements = containerRef.current.querySelectorAll('.theme-designer--list-manager__item:not(.theme-designer--list-manager__item--dragging)');
        
        for (let i = 0; i < itemElements.length; i++) {
            const itemRect = itemElements[i].getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            
            if (mouseY < itemCenter) {
                return i;
            }
        }
        
        // If mouse is below all items, drop at the end
        return items.length;
    };

    // Drag & Drop handlers
    const handleDragStart = (e, index) => {
        const itemElement = e.target.closest('.theme-designer--list-manager__item');
        
        // Only allow drag if started on drag handle
        if (!isDragHandle(e, itemElement)) {
            e.preventDefault();
            return;
        }

        setDraggedIndex(index);
        setIsDragging(true);
        setDropIndex(null);
        
        // Set drag image
        if (dragItemRef.current) {
            e.dataTransfer.setDragImage(dragItemRef.current, 0, 0);
        }
        
        // Add transparency to dragged element
        itemElement.classList.add('theme-designer--list-manager__item--dragging');
        
        // Set data transfer
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', index);
    };

    const handleDragEnd = (e) => {
        setIsDragging(false);
        setDraggedIndex(null);
        setDropIndex(null);
        
        // Remove transparency
        const itemElement = e.target.closest('.theme-designer--list-manager__item');
        if (itemElement) {
            itemElement.classList.remove('theme-designer--list-manager__item--dragging');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedIndex !== null) {
            const newDropIndex = calculateDropIndex(e);
            if (newDropIndex !== draggedIndex) {
                setDropIndex(newDropIndex);
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        
        if (draggedIndex !== null && dropIndex !== null && draggedIndex !== dropIndex) {
            const newItems = [...items];
            const draggedItem = newItems[draggedIndex];
            
            // Remove item from original position
            newItems.splice(draggedIndex, 1);
            
            // Calculate actual drop index (adjust for removed item)
            let actualDropIndex = dropIndex;
            if (draggedIndex < dropIndex) {
                actualDropIndex--;
            }
            
            // Insert item at calculated position
            newItems.splice(actualDropIndex, 0, draggedItem);
            
            onItemsChange(newItems);
        }
        
        setIsDragging(false);
        setDraggedIndex(null);
        setDropIndex(null);
    };

    // Create Drag Handle component
    const createDragHandle = (className) => wp.element.createElement('div', {
        className: className || ''
    },
        getSvgIcon('dots_grid', { size: 24 })
    );

    // Create placeholder element with same height as dragged item
    const createPlaceholder = () => {
        let placeholderHeight = '60px'; // Default height
        
        // Try to get the height of the dragged item
        if (dragItemRef.current) {
            const draggedItemRect = dragItemRef.current.getBoundingClientRect();
            placeholderHeight = `${draggedItemRect.height}px`;
        }
        
        return wp.element.createElement('div', {
            className: 'theme-designer--list-manager__placeholder',
            style: {
                height: placeholderHeight,
            }
        },
            // Placeholder drag handle
            createDragHandle('theme-designer--list-manager__placeholder-drag-handle'),
            
            // Placeholder content
            wp.element.createElement('div', {
                className: 'theme-designer--list-manager__placeholder-text'
            }, __('Drop here', 'theme-designer'))
        );
    };

    return wp.element.createElement('div', { 
        className: 'theme-designer--list-manager ' + className,
        ref: containerRef,
        onDragOver: handleDragOver,
        onDrop: handleDrop
    },
        // Render all items with placeholder
        items.map((item, index) => {
            const isDragged = draggedIndex === index;
            const showPlaceholder = dropIndex === index && !isDragged;
            
            return wp.element.createElement('div', { key: index },
                // Placeholder before item
                showPlaceholder && createPlaceholder(),
                
                // Actual item
                wp.element.createElement('div', { 
                    className: `theme-designer--list-manager__item ${isDragged ? 'theme-designer--list-manager__item--dragging' : ''} ${isDragging && !isDragged ? 'theme-designer--list-manager__item--dimmed' : ''}`,
                    ref: isDragged ? dragItemRef : null,
                    draggable: true,
                    onDragStart: (e) => handleDragStart(e, index),
                    onDragEnd: handleDragEnd
                },
                    // Drag handle
                    createDragHandle('theme-designer--list-manager__drag-handle'),
                    
                    // Item content from outside
                    wp.element.createElement('div', {
                        className: 'theme-designer--list-manager__item-content'
                    },
                        renderItem(item, index, (updatedItem) => updateItem(index, updatedItem)),
                    ),
                    
                    // Remove button (always the same)
                    wp.element.createElement(Button, {
                        isDestructive: true,
                        onClick: () => removeItem(index),
                        className: 'theme-designer--list-manager__remove-button'
                    }, __('Remove', 'theme-designer'))
                )
            );
        }),
        
        // Placeholder at the end if drop index is at the end
        dropIndex === items.length && createPlaceholder(),
        
        // Add button
        wp.element.createElement(Button, {
            isSecondary: true,
            onClick: addItem,
            className: 'theme-designer--list-manager__add-button'
        }, addButtonText)
    );
});