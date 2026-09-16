// ==========================================
// UI SYSTEM
// ==========================================

const UI = {};


// ==========================================
// INTERNAL HELPERS
// ==========================================

function resolveElement(
    element
) {

    if (
        typeof element === "string"
    ) {

        return document.querySelector(
            element
        );
    }


    return element;
}


function createElement(
    tag,
    className
) {

    const element =
        document.createElement(
            tag
        );


    if (
        className
    ) {

        element.className =
            className;
    }


    return element;
}


// ==========================================
// DROPDOWN
// ==========================================

UI.createDropdown = function(
    options = {}
) {

    const container =
        resolveElement(
            options.element
        );


    if (
        !container
    ) {

        throw new Error(
            "UI.createDropdown: element not found."
        );
    }


    container.innerHTML = "";

    container.classList.add(
        "ui-dropdown"
    );


    const button =
        createElement(
            "button",
            "ui-dropdown-button"
        );


    button.type =
        "button";


    button.setAttribute(
        "aria-haspopup",
        "listbox"
    );


    button.setAttribute(
        "aria-expanded",
        "false"
    );


    const label =
        createElement(
            "span",
            "ui-dropdown-label"
        );


    const arrow =
        createElement(
            "span",
            "ui-dropdown-arrow"
        );


    arrow.textContent =
        "▼";


    button.appendChild(
        label
    );

    button.appendChild(
        arrow
    );


    const menu =
        createElement(
            "div",
            "ui-dropdown-menu"
        );


    menu.setAttribute(
        "role",
        "listbox"
    );


    container.appendChild(
        button
    );

    container.appendChild(
        menu
    );


    let dropdownOptions =
        [];


    let currentValue =
        options.value !== undefined
            ? options.value
            : null;


    let isOpen =
        false;


    let selectedIndex =
        -1;


    let outsidePointerHandler =
        null;


    let resizeHandler =
        null;


    const emptyLabel =
        typeof options.emptyLabel === "string"
            ? options.emptyLabel
            : "Select...";


    // ======================================
    // NORMALIZE OPTIONS
    // ======================================

    function normalizeOptions(
        values
    ) {

        if (
            !Array.isArray(values)
        ) {

            return [];
        }


        return values
            .map(
                function(option) {

                    if (
                        option === null ||
                        option === undefined
                    ) {

                        return null;
                    }


                    if (
                        typeof option === "string"
                    ) {

                        return {

                            value:
                                option,

                            label:
                                option,

                            disabled:
                                false
                        };
                    }


                    if (
                        typeof option === "object"
                    ) {

                        return {

                            value:
                                option.value,

                            label:
                                option.label !== undefined
                                    ? String(
                                        option.label
                                    )
                                    : String(
                                        option.value ?? ""
                                    ),

                            disabled:
                                option.disabled === true
                        };
                    }


                    return null;
                }
            )
            .filter(
                function(option) {

                    return (
                        option !== null &&
                        option.value !== undefined &&
                        option.value !== null
                    );
                }
            );
    }


    dropdownOptions =
        normalizeOptions(
            options.options
        );


    // ======================================
    // GET OPTIONS
    // ======================================

    function getOptions() {

        return dropdownOptions.slice();
    }


    // ======================================
    // FIND SELECTED INDEX
    // ======================================

    function findSelectedIndex() {

        return dropdownOptions.findIndex(
            function(option) {

                return (
                    option.value ===
                    currentValue
                );
            }
        );
    }


    // ======================================
    // GET ENABLED INDEXES
    // ======================================

    function getEnabledIndexes() {

        const indexes = [];


        dropdownOptions.forEach(
            function(option, index) {

                if (
                    !option.disabled
                ) {

                    indexes.push(
                        index
                    );
                }
            }
        );


        return indexes;
    }


    // ======================================
    // UPDATE LABEL
    // ======================================

    function updateLabel() {

        const selectedOption =
            dropdownOptions.find(
                function(option) {

                    return (
                        option.value ===
                        currentValue
                    );
                }
            );


        if (
            selectedOption
        ) {

            label.textContent =
                selectedOption.label;

            return;
        }


        if (
            dropdownOptions.length > 0
        ) {

            label.textContent =
                dropdownOptions[0].label;

            return;
        }


        label.textContent =
            emptyLabel;
    }


    // ======================================
    // RENDER OPTIONS
    // ======================================

    function renderOptions() {

        menu.innerHTML = "";


        if (
            dropdownOptions.length === 0
        ) {

            const empty =
                createElement(
                    "div",
                    "ui-dropdown-empty"
                );


            empty.textContent =
                emptyLabel;


            menu.appendChild(
                empty
            );


            return;
        }


        dropdownOptions.forEach(
            function(option, index) {

                const optionButton =
                    createElement(
                        "button",
                        "ui-dropdown-option"
                    );


                optionButton.type =
                    "button";


                optionButton.setAttribute(
                    "role",
                    "option"
                );


                optionButton.textContent =
                    option.label;


                optionButton.disabled =
                    option.disabled;


                optionButton.setAttribute(
                    "aria-selected",
                    String(
                        option.value ===
                        currentValue
                    )
                );


                if (
                    option.value ===
                    currentValue
                ) {

                    optionButton.classList.add(
                        "selected"
                    );
                }


                if (
                    index === selectedIndex
                ) {

                    optionButton.classList.add(
                        "highlighted"
                    );
                }


                optionButton.addEventListener(
                    "click",
                    function(event) {

                        event.stopPropagation();


                        if (
                            option.disabled
                        ) {

                            return;
                        }


                        currentValue =
                            option.value;


                        selectedIndex =
                            index;


                        updateLabel();

                        renderOptions();

                        close();


                        if (
                            typeof options.onChange ===
                            "function"
                        ) {

                            options.onChange(
                                currentValue,
                                option
                            );
                        }
                    }
                );


                menu.appendChild(
                    optionButton
                );
            }
        );
    }


    // ======================================
    // POSITION MENU
    // ======================================

    function positionMenu() {

        const rect =
            container.getBoundingClientRect();


        const viewportPadding =
            10;


        const spaceAbove =
            Math.max(
                0,
                rect.top -
                viewportPadding
            );


        const spaceBelow =
            Math.max(
                0,
                window.innerHeight -
                rect.bottom -
                viewportPadding
            );


        /*
            Prefer opening downward unless there
            is clearly more usable room above.
        */
        const shouldOpenUp =
            spaceBelow < 180 &&
            spaceAbove > spaceBelow;


        container.classList.toggle(
            "open-up",
            shouldOpenUp
        );


        /*
            Keep the menu inside the viewport
            vertically.

            220px remains the normal maximum.
        */
        const availableSpace =
            shouldOpenUp
                ? spaceAbove
                : spaceBelow;


        const maxHeight =
            Math.max(
                40,
                Math.min(
                    220,
                    availableSpace
                )
            );


        menu.style.maxHeight =
            maxHeight + "px";


        /*
            If the dropdown is close to the
            right edge, align the menu's right
            edge with the dropdown.
        */
        const rightOverflow =
            rect.right >
            window.innerWidth -
            viewportPadding;


        container.classList.toggle(
            "align-right",
            rightOverflow
        );
    }


    // ======================================
    // FOCUS OPTION
    // ======================================

    function focusOption(
        index
    ) {

        const optionElements =
            menu.querySelectorAll(
                ".ui-dropdown-option"
            );


        if (
            index < 0 ||
            index >= optionElements.length
        ) {

            return;
        }


        selectedIndex =
            index;


        optionElements.forEach(
            function(
                optionElement,
                optionIndex
            ) {

                optionElement.classList.toggle(
                    "highlighted",
                    optionIndex ===
                    selectedIndex
                );
            }
        );


        /*
            Scroll the dropdown's own menu
            instead of using scrollIntoView(),
            which can cause the page itself
            to scroll.
        */
        const optionElement =
            optionElements[
                selectedIndex
            ];


        const menuScrollTop =
            menu.scrollTop;


        const optionTop =
            optionElement.offsetTop;


        const optionBottom =
            optionTop +
            optionElement.offsetHeight;


        const visibleTop =
            menuScrollTop;


        const visibleBottom =
            menuScrollTop +
            menu.clientHeight;


        if (
            optionTop < visibleTop
        ) {

            menu.scrollTop =
                optionTop;
        }

        else if (
            optionBottom >
            visibleBottom
        ) {

            menu.scrollTop =
                optionBottom -
                menu.clientHeight;
        }
    }


    // ======================================
    // OPEN
    // ======================================

    function open() {

        if (
            isOpen
        ) {

            return;
        }


        isOpen =
            true;


        container.classList.add(
            "open"
        );


        button.setAttribute(
            "aria-expanded",
            "true"
        );


        selectedIndex =
            findSelectedIndex();


        if (
            selectedIndex < 0
        ) {

            selectedIndex =
                -1;
        }


        renderOptions();


        /*
            The menu is now visible, so we can
            safely calculate the available
            viewport space.
        */
        positionMenu();


        outsidePointerHandler =
            function(event) {

                if (
                    !container.contains(
                        event.target
                    )
                ) {

                    close();
                }
            };


        document.addEventListener(
            "pointerdown",
            outsidePointerHandler
        );


        resizeHandler =
            function() {

                if (
                    isOpen
                ) {

                    positionMenu();
                }
            };


        window.addEventListener(
            "resize",
            resizeHandler
        );


        if (
            typeof options.onOpen ===
            "function"
        ) {

            options.onOpen();
        }
    }


    // ======================================
    // CLOSE
    // ======================================

    function close() {

        if (
            !isOpen
        ) {

            return;
        }


        isOpen =
            false;


        container.classList.remove(
            "open"
        );


        container.classList.remove(
            "open-up"
        );


        container.classList.remove(
            "align-right"
        );


        button.setAttribute(
            "aria-expanded",
            "false"
        );


        if (
            outsidePointerHandler
        ) {

            document.removeEventListener(
                "pointerdown",
                outsidePointerHandler
            );


            outsidePointerHandler =
                null;
        }


        if (
            resizeHandler
        ) {

            window.removeEventListener(
                "resize",
                resizeHandler
            );


            resizeHandler =
                null;
        }


        menu.style.maxHeight =
            "";


        if (
            typeof options.onClose ===
            "function"
        ) {

            options.onClose();
        }
    }


    // ======================================
    // TOGGLE
    // ======================================

    function toggle() {

        if (
            isOpen
        ) {

            close();
        }

        else {

            open();
        }
    }


    // ======================================
    // OUTSIDE CLICK
    // ======================================

    button.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            toggle();
        }
    );


    // ======================================
    // KEYBOARD NAVIGATION
    // ======================================

    button.addEventListener(
        "keydown",
        function(event) {

            const enabledIndexes =
                getEnabledIndexes();


            if (
                enabledIndexes.length === 0
            ) {

                return;
            }


            if (
                event.key === "ArrowDown"
            ) {

                event.preventDefault();


                if (
                    !isOpen
                ) {

                    open();

                    return;
                }


                const currentPosition =
                    enabledIndexes.indexOf(
                        selectedIndex
                    );


                const nextPosition =
                    currentPosition < 0
                        ? 0
                        : (
                            currentPosition + 1
                        ) %
                        enabledIndexes.length;


                focusOption(
                    enabledIndexes[
                        nextPosition
                    ]
                );
            }


            else if (
                event.key === "ArrowUp"
            ) {

                event.preventDefault();


                if (
                    !isOpen
                ) {

                    open();

                    return;
                }


                const currentPosition =
                    enabledIndexes.indexOf(
                        selectedIndex
                    );


                const previousPosition =
                    currentPosition <= 0
                        ? enabledIndexes.length - 1
                        : currentPosition - 1;


                focusOption(
                    enabledIndexes[
                        previousPosition
                    ]
                );
            }


            else if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();


                if (
                    !isOpen
                ) {

                    open();

                    return;
                }


                if (
                    selectedIndex >= 0 &&
                    dropdownOptions[
                        selectedIndex
                    ] &&
                    !dropdownOptions[
                        selectedIndex
                    ].disabled
                ) {

                    const option =
                        dropdownOptions[
                            selectedIndex
                        ];


                    currentValue =
                        option.value;


                    updateLabel();

                    renderOptions();

                    close();


                    if (
                        typeof options.onChange ===
                        "function"
                    ) {

                        options.onChange(
                            currentValue,
                            option
                        );
                    }
                }
            }


            else if (
                event.key === "Escape"
            ) {

                if (
                    isOpen
                ) {

                    event.preventDefault();

                    close();
                }
            }
        }
    );


    // ======================================
    // SET VALUE
    // ======================================

    function setValue(
        value,
        triggerChange = false
    ) {

        const optionIndex =
            dropdownOptions.findIndex(
                function(option) {

                    return (
                        option.value ===
                        value
                    );
                }
            );


        if (
            optionIndex < 0
        ) {

            return;
        }


        const option =
            dropdownOptions[
                optionIndex
            ];


        if (
            option.disabled
        ) {

            return;
        }


        currentValue =
            value;


        selectedIndex =
            optionIndex;


        updateLabel();

        renderOptions();


        if (
            triggerChange &&
            typeof options.onChange ===
            "function"
        ) {

            options.onChange(
                currentValue,
                option
            );
        }
    }


    // ======================================
    // SET OPTIONS
    // ======================================

    function setOptions(
        newOptions
    ) {

        dropdownOptions =
            normalizeOptions(
                newOptions
            );


        const currentOptionExists =
            dropdownOptions.some(
                function(option) {

                    return (
                        option.value ===
                        currentValue
                    );
                }
            );


        if (
            !currentOptionExists
        ) {

            const firstEnabledOption =
                dropdownOptions.find(
                    function(option) {

                        return !option.disabled;
                    }
                );


            currentValue =
                firstEnabledOption
                    ? firstEnabledOption.value
                    : null;
        }


        selectedIndex =
            findSelectedIndex();


        updateLabel();

        renderOptions();


        if (
            isOpen
        ) {

            positionMenu();
        }
    }


    // ======================================
    // INITIAL RENDER
    // ======================================

    if (
        !dropdownOptions.some(
            function(option) {

                return (
                    option.value ===
                    currentValue
                );
            }
        )
    ) {

        const firstEnabledOption =
            dropdownOptions.find(
                function(option) {

                    return !option.disabled;
                }
            );


        currentValue =
            firstEnabledOption
                ? firstEnabledOption.value
                : null;
    }


    updateLabel();

    renderOptions();


    // ======================================
    // PUBLIC API
    // ======================================

    return {

        element:
            container,

        getValue:
            function() {

                return currentValue;
            },

        setValue,

        getOptions,

        setOptions,

        open,

        close,

        toggle,

        destroy:
            function() {

                close();

                container.innerHTML = "";

                container.classList.remove(
                    "ui-dropdown"
                );

                container.classList.remove(
                    "open"
                );

                container.classList.remove(
                    "open-up"
                );

                container.classList.remove(
                    "align-right"
                );
            }
    };
};


// ==========================================
// BUTTON
// ==========================================

UI.createButton = function(
    options = {}
) {

    const button =
        createElement(
            "button",
            "ui-button"
        );


    button.type =
        "button";


    if (
        options.text !== undefined
    ) {

        button.textContent =
            options.text;
    }


    if (
        options.disabled
    ) {

        button.disabled =
            true;
    }


    if (
        typeof options.onClick ===
        "function"
    ) {

        button.addEventListener(
            "click",
            options.onClick
        );
    }


    if (
        options.element
    ) {

        const container =
            resolveElement(
                options.element
            );


        if (
            container
        ) {

            container.appendChild(
                button
            );
        }
    }


    return button;
};


// ==========================================
// PANEL
// ==========================================

UI.createPanel = function(
    options = {}
) {

    const panel =
        createElement(
            "div",
            "ui-panel"
        );


    if (
        options.title
    ) {

        const title =
            createElement(
                "h2",
                "ui-panel-title"
            );


        title.textContent =
            options.title;


        panel.appendChild(
            title
        );
    }


    if (
        options.content
    ) {

        panel.insertAdjacentHTML(
            "beforeend",
            options.content
        );
    }


    if (
        options.element
    ) {

        const container =
            resolveElement(
                options.element
            );


        if (
            container
        ) {

            container.appendChild(
                panel
            );
        }
    }


    return panel;
};


// ==========================================
// MODAL
// ==========================================

UI.createModal = function(
    options = {}
) {

    const modal =
        createElement(
            "div",
            "ui-modal"
        );


    const box =
        createElement(
            "div",
            "ui-modal-box"
        );


    if (
        options.title
    ) {

        const title =
            createElement(
                "h2",
                "ui-modal-title"
            );


        title.textContent =
            options.title;


        box.appendChild(
            title
        );
    }


    if (
        options.content
    ) {

        box.insertAdjacentHTML(
            "beforeend",
            options.content
        );
    }


    modal.appendChild(
        box
    );


    if (
        options.element
    ) {

        const container =
            resolveElement(
                options.element
            );


        if (
            container
        ) {

            container.appendChild(
                modal
            );
        }
    }


    return {

        element:
            modal,

        open:
            function() {

                modal.classList.remove(
                    "hidden"
                );
            },

        close:
            function() {

                modal.classList.add(
                    "hidden"
                );
            }
    };
};


// ==========================================
// NUMBER CONTROL
// ==========================================

UI.createNumberControl = function(
    options = {}
) {

    const container =
        createElement(
            "div",
            "ui-number-control"
        );


    const subtractButton =
        createElement(
            "button",
            "ui-number-button"
        );


    subtractButton.type =
        "button";


    subtractButton.textContent =
        "−";


    const valueElement =
        createElement(
            "span",
            "ui-number-value"
        );


    const addButton =
        createElement(
            "button",
            "ui-number-button"
        );


    addButton.type =
        "button";


    addButton.textContent =
        "+";


    let value =
        typeof options.value === "number"
            ? options.value
            : 0;


    const step =
        typeof options.step === "number"
            ? options.step
            : 1;


    function update() {

        valueElement.textContent =
            value;
    }


    subtractButton.addEventListener(
        "click",
        function() {

            value -= step;

            update();


            if (
                typeof options.onChange ===
                "function"
            ) {

                options.onChange(
                    value
                );
            }
        }
    );


    addButton.addEventListener(
        "click",
        function() {

            value += step;

            update();


            if (
                typeof options.onChange ===
                "function"
            ) {

                options.onChange(
                    value
                );
            }
        }
    );


    container.appendChild(
        subtractButton
    );

    container.appendChild(
        valueElement
    );

    container.appendChild(
        addButton
    );


    update();


    if (
        options.element
    ) {

        const parent =
            resolveElement(
                options.element
            );


        if (
            parent
        ) {

            parent.appendChild(
                container
            );
        }
    }


    return {

        element:
            container,

        getValue:
            function() {

                return value;
            },

        setValue:
            function(newValue) {

                if (
                    typeof newValue !== "number"
                ) {

                    return;
                }


                value =
                    newValue;


                update();
            }
    };
};


// ==========================================
// TOOLTIP
// ==========================================

UI.createTooltip = function(
    options = {}
) {

    const element =
        resolveElement(
            options.element
        );


    if (
        !element
    ) {

        return null;
    }


    element.classList.add(
        "ui-tooltip"
    );


    element.dataset.tooltip =
        options.text || "";


    return element;
};