// Adsterra Ad Integration
// Place your Adsterra ad codes here

const adsterraConfig = {
    // Replace these with your actual Adsterra ad unit IDs
    // You'll get these from Adsterra dashboard after creating ad units
    
    // Banner ads (728x90, 300x250, etc.)
    banner: {
        // Using 300x250 ad for banners too
        id: '0f4f70e6a823541e592c8701aa71f717',
        width: '300',
        height: '250'
    },
    
    // Square ads (300x250)
    square: {
        id: '0f4f70e6a823541e592c8701aa71f717',
        width: '300',
        height: '250'
    },
    
    // Skyscraper ads (160x600)
    skyscraper: {
        id: '',
        width: '160',
        height: '600'
    },
    
    // Mobile banner (320x50)
    mobile: {
        // Using 300x250 ad for mobile too (will auto-adjust)
        id: '0f4f70e6a823541e592c8701aa71f717',
        width: '300',
        height: '250'
    },
    
    // In-article ads
    inArticle: {
        id: '',
        width: '300',
        height: '250'
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
        if (adType && adsterraConfig[adType]) {
            // Use mobile ad type on mobile devices if configured
            const finalAdType = (adType === 'banner' && window.innerWidth < 768 && adsterraConfig.mobile.id) 
                ? 'mobile' 
                : adType;
            renderAd(container, finalAdType);
            renderedContainers.add(container);
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

