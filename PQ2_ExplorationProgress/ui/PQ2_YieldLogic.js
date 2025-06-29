//---------------------------------------------
// IMPORT
//---------------------------------------------

import { PanelYieldBanner } from '/base-standard/ui/diplo-ribbon/panel-yield-banner.js';


//---------------------------------------------
// GLOBAL CONSTANTS
//---------------------------------------------

const PQ2_TOOLTIP_KEY = 'LOC_PQ2_YIELD_EXPLORATION';
const PQ2_ICON_KEY = 'PQ2_ICON_EXPLORATION';

let PQ2ExplorationInitialized = false;


//---------------------------------------------
// STYLE INJECTION
//---------------------------------------------

const PQ2_YIELD_STYLE = [`
/* Base text color for custom yield */
.text-yield-pq2exploration {
    color: #6ea64b;
}

/* Hover state */
.group:hover .group-hover\\:text-yield-pq2exploration,
.hover\\:text-yield-pq2exploration:hover {
    color: #84a842;
}

/* Focus state */
.group:focus .group-focus\\:text-yield-pq2exploration,
.focus\\:text-yield-pq2exploration:focus {
    color: #84a842;
}

/* Active state */
.group:active .group-active\\:text-yield-pq2exploration,
.active\\:text-yield-pq2exploration:active {
    color: #5b9230;
}

/* Background and style inside the yield bar panel */
.bz-yield-banner .panel-yield__top-bar-content .text-yield-pq2exploration {
    background-color: #30601b80;
    border-radius: 0.777rem / 50%;
    padding-left: 0.1111rem;
    padding-right: 0.5555rem;
    transition: color 0.25s ease, background-color 0.25s ease;
}

/* Hover background color */
.bz-yield-banner .panel-yield__top-bar-content .text-yield-pq2exploration:hover {
    background-color: #84a842aa;
}
`];

PQ2_YIELD_STYLE.forEach(style => {
    const styleElement = document.createElement('style');
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
});


//---------------------------------------------
// DATA UTILITIES
//---------------------------------------------

/**
 * Calculate revealed plot data and exploration percentage.
 */
function getExplorationDisplayValues() {
    const revealedCount = Visibility.getPlotsRevealedCount(GameContext.localObserverID);
    const totalCount = GameplayMap.getPlotCount();

    let percentage = '0%';
    if (typeof revealedCount === 'number' && typeof totalCount === 'number' && totalCount > 0) {
        const ratio = (revealedCount / totalCount) * 100;
        percentage = `${Math.round(ratio)}%`;
    }

    return { percentage, revealedCount, totalCount };
}

/**
 * Format the display percentage string.
 */
function formatPercentageLabel(percentage) {
    return `[${percentage}]`;
}

/**
 * Find the PQ2 exploration yield element in a container.
 */
function findPQ2ExplorationElement(container) {
    return container?.querySelector(`[data-tooltip-content="${PQ2_TOOLTIP_KEY}"]`);
}


//---------------------------------------------
// COMPONENT CREATION & UPDATE
//---------------------------------------------

/**
 * Create a new yield-bar-entry element for PQ2 exploration.
 */
function createPQ2ExplorationElement() {
    const { percentage, revealedCount, totalCount } = getExplorationDisplayValues();

    const element = document.createElement('yield-bar-entry');
    element.classList.add('mr-1\\.5', 'text-yield-pq2exploration', 'focus\\:bg-magenta');
    element.dataset.value = revealedCount;
    element.dataset.max = totalCount;
    element.dataset.icon = PQ2_ICON_KEY;
    element.dataset.tooltipContent = PQ2_TOOLTIP_KEY;

    // Delay insertion of custom text until shadow DOM is ready
    setTimeout(() => {
        const container = element.shadowRoot || element;
        const valueNode = container.querySelector('.valueText') || container.querySelector('span');

        if (valueNode) {
            const percentSpan = document.createElement('span');
            percentSpan.textContent = formatPercentageLabel(percentage);
            percentSpan.style.userSelect = 'none';
            percentSpan.style.marginRight = '6px';

            valueNode.parentNode.insertBefore(percentSpan, valueNode);
        } else {
            console.warn('[PQ2] Cannot find value text span inside yield-bar-entry.');
        }
    }, 0);

    return element;
}

/**
 * Update an existing yield-bar-entry element for PQ2 exploration.
 */
function updatePQ2ExplorationElement(element) {
    const { percentage, revealedCount, totalCount } = getExplorationDisplayValues();

    element.dataset.value = revealedCount;
    element.dataset.max = totalCount;

    const span = element.querySelector('span');
    if (span) {
        span.textContent = formatPercentageLabel(percentage);
    }
}


//---------------------------------------------
// PANEL OVERRIDES
//---------------------------------------------

/**
 * Add or update the PQ2 exploration element in the yield banner.
 */
PanelYieldBanner.prototype.updatePQ2Exploration = function () {
    const hSlot = this.Root.querySelector('fxs-hslot');
    console.warn('[PQ] Entered')
    if (!hSlot) return;
        console.warn('[PQ] Found')
    const existingElement = findPQ2ExplorationElement(hSlot);
    if (existingElement) {
        console.warn('[PQ] Updated')
        updatePQ2ExplorationElement(existingElement);
    }
};


// Backup original onAttach function
const PanelYieldBanner_onAttach = PanelYieldBanner.prototype.onAttach;

/**
 * Override the onAttach method to listen for PlotVisibilityChanged.
 */
PanelYieldBanner.prototype.onAttach = function () {
    PanelYieldBanner_onAttach.apply(this);

    this.Root.listenForEngineEvent('PlotVisibilityChanged', this.updatePQ2Exploration, this);
};


// Backup original render function
const PanelYieldBanner_render = PanelYieldBanner.prototype.render;

/**
 * Override the render method to inject the PQ2 element once.
 */
PanelYieldBanner.prototype.render = function () {
    PanelYieldBanner_render.apply(this);

    const hSlot = this.Root.querySelector('fxs-hslot');
    if (!hSlot) return;

    if (!findPQ2ExplorationElement(hSlot)) {
        const element = createPQ2ExplorationElement();
        hSlot.appendChild(element);
    }
};


// Backup original updateAll function
const PanelYieldBanner_updateAll = PanelYieldBanner.prototype.updateAll;

/**
 * Override the updateAll method to include PQ2 exploration update.
 */
PanelYieldBanner.prototype.updateAll = function () {
    PanelYieldBanner_updateAll.apply(this);
    this.updatePQ2Exploration();
};
