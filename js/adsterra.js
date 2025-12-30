     }
};

// Initialize Adsterra ads
function initAdsterra() {
    // Auto-render ads in containers with data-ad-type attribute
    // Note: We don't need to load adsterra.com/script.js as we're creating ads directly
    renderExistingAds();
}

// Track which containers have been rendered to prevent duplicates
const renderedContainers = new WeakSet();

// Render ads that are already in the HTML
function renderExistingAds() {
    const adContainers = document.querySelectorAll('[data-ad-type]');
    adContainers.forEach(container => {
        // Skip if already rendered
        if (renderedContainers.has(container)) {
            return;
        }
        
        const adType = container.getAttribute('data-ad-type');
        if (adType) {
            // Handle native ads
            if (adType === 'native' && adsterraConfig.native && adsterraConfig.native.scriptSrc) {
                renderAd(container, 'native');
                renderedContainers.add(container);
                return;
            }
            
            // Handle other ad types
            if (adsterraConfig[adType]) {
                // Use mobile ad type on mobile devices if configured
                const finalAdType = (adType === 'banner' && window.innerWidth < 768 && adsterraConfig.mobile.id) 
                    ? 'mobile' 
                    : adType;
                renderAd(container, finalAdType);
                renderedContainers.add(container);
            }
        }
    });
}

// Create ad container
function createAdContainer(adType, position = 'center') {
    const container = document.createElement('div');
    container.className = `adsterra-ad adsterra-${adType} adsterra-${position}`;
    container.setAttribute('data-ad-type', adType);
    
    // Add loading placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'adsterra-placeholder';
    placeholder.innerHTML = `
        <div class="adsterra-loading">
            <div class="adsterra-spinner"></div>
            <span>Loading ad...</span>
        </div>
    `;
    container.appendChild(placeholder);
    
    return container;
}

// Render ad in container
function renderAd(container, adType) {
    // Handle native banners differently
    if (adType === 'native') {
        const config = adsterraConfig[adType];
        if (!config || !config.scriptSrc || !config.containerId) {
            const placeholder = container.querySelector('.adsterra-placeholder');
            if (placeholder) {
                placeholder.innerHTML = '<div class="adsterra-error">Native ad not configured</div>';
            } else {
                container.innerHTML = '<div class="adsterra-error">Native ad not configured</div>';
            }
            return;
        }
        
        // Remove placeholder
        const placeholder = container.querySelector('.adsterra-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Create wrapper container
        const nativeContainer = document.createElement('div');
        nativeContainer.className = 'adsterra-ad-content adsterra-native';
        nativeContainer.style.width = '100%';
        nativeContainer.style.maxWidth = config.width + 'px';
        nativeContainer.style.margin = '0 auto';
        nativeContainer.style.minHeight = config.height + 'px';
        
        // Use the exact container ID from Adsterra
        // The script expects: container-e9059bd68684310cf9af71ac9aa55de2
        // For multiple instances, we need unique IDs, so we'll create a unique ID
        // but the script might only work with the exact ID, so we'll use the exact ID
        // and handle multiple instances by loading the script multiple times
        
        // Create the container div with the exact ID from Adsterra
        const adContainer = document.createElement('div');
        adContainer.id = config.containerId;
        nativeContainer.appendChild(adContainer);
        
        container.appendChild(nativeContainer);
        
        // Load native banner script (exact format from Adsterra email)
        // For each instance, we need to load the script separately
        // because the script looks for the exact container ID
        const nativeScript = document.createElement('script');
        nativeScript.async = true;
        nativeScript.setAttribute('data-cfasync', 'false');
        nativeScript.src = config.scriptSrc;
        document.head.appendChild(nativeScript);
        
        return;
    }
    
    // Standard Adsterra ad rendering
    const config = adsterraConfig[adType];
    if (!config || !config.id) {
        const placeholder = container.querySelector('.adsterra-placeholder');
        if (placeholder) {
            placeholder.innerHTML = '<div class="adsterra-error">Ad not configured. Please add your Adsterra ad ID in js/adsterra.js</div>';
        } else {
            container.innerHTML = '<div class="adsterra-error">Ad not configured. Please add your Adsterra ad ID in js/adsterra.js</div>';
        }
        return;
    }
    
    // Clear container completely to prevent duplicates
    container.innerHTML = '';
    
    // Create ad container div with unique ID for each ad instance
    const adDiv = document.createElement('div');
    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
    const adId = `at-${config.id}-${uniqueId}`;
    adDiv.id = adId;
    adDiv.className = 'adsterra-ad-content';
    adDiv.style.width = config.width + 'px';
    adDiv.style.height = config.height + 'px';
    adDiv.style.margin = '0 auto';
    adDiv.style.minHeight = config.height + 'px';
    adDiv.style.position = 'relative';
    adDiv.style.overflow = 'hidden';
    
    container.appendChild(adDiv);
    
    // Adsterra standard ad code format (exact format from Adsterra)
    // Use unique variable name for each ad instance
    const atOptionsVarName = `atOptions_${uniqueId}`;
    const atOptionsScript = document.createElement('script');
    atOptionsScript.type = 'text/javascript';
    atOptionsScript.innerHTML = `
        (function() {
            window['${atOptionsVarName}'] = {
                'key' : '${config.id}',
                'format' : 'iframe',
                'height' : ${config.height},
                'width' : ${config.width},
                'params' : {}
            };
            var oldAtOptions = window.atOptions;
            window.atOptions = window['${atOptionsVarName}'];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://www.highperformanceformat.com/${config.id}/invoke.js';
            script.async = true;
            script.onload = function() {
                if (oldAtOptions) window.atOptions = oldAtOptions;
            };
            document.getElementById('${adId}').appendChild(script);
        })();
    `;
    
    // Append script to the ad container
    adDiv.appendChild(atOptionsScript);
}

// Insert ad at specific position
function insertAd(position, adType = 'square') {
    const container = createAdContainer(adType, position);
    
    switch(position) {
        case 'header':
            const header = document.querySelector('header');
            if (header) {
                header.insertAdjacentElement('afterend', container);
            }
            break;
        case 'footer':
            const footer = document.querySelector('footer') || document.body;
            footer.appendChild(container);
            break;
        case 'sidebar':
            // Create sidebar if it doesn't exist
            let sidebar = document.querySelector('.adsterra-sidebar');
            if (!sidebar) {
                sidebar = document.createElement('div');
                sidebar.className = 'adsterra-sidebar';
                document.body.appendChild(sidebar);
            }
            sidebar.appendChild(container);
            break;
        case 'inline':
            // Insert after main content
            const main = document.querySelector('main');
            if (main) {
                main.insertAdjacentElement('afterend', container);
            }
            break;
        default:
            document.body.appendChild(container);
    }
    
    // Render ad after a short delay to ensure DOM is ready
    setTimeout(() => {
        renderAd(container, adType);
    }, 100);
}

// Auto-detect mobile and use appropriate ad
function getAdTypeForDevice() {
    const isMobile = window.innerWidth < 768;
    return isMobile ? 'mobile' : 'square';
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAdsterra();
        // Also check after a short delay in case ads are added dynamically
        setTimeout(renderExistingAds, 500);
    });
} else {
    initAdsterra();
    setTimeout(renderExistingAds, 500);
}

// Export functions for use in HTML
window.adsterra = {
    insertAd,
    renderAd,
    createAdContainer,
    getAdTypeForDevice,
    renderExistingAds,
    config: adsterraConfig
};

