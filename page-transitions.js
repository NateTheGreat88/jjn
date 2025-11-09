// Page Transition System
(function() {
    // Function to add page-loaded class
    function addPageLoaded() {
        document.body.classList.remove('page-exit');
        document.body.classList.add('page-loaded');
    }
    
    // Add transition class to body on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPageLoaded);
    } else {
        // DOM already loaded
        addPageLoaded();
    }
    
    // Handle all internal links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Skip if external link, anchor link, or special links
        if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || 
            href.startsWith('mailto:') || href.startsWith('tel:') || 
            link.hasAttribute('download') || link.hasAttribute('target')) {
            return;
        }
        
        // Skip if it's a file download (like .mp3)
        if (href.match(/\.(mp3|pdf|zip|doc|docx|xls|xlsx)$/i)) {
            return;
        }
        
        // Prevent default navigation
        e.preventDefault();
        
        // Add fade-out class
        document.body.classList.remove('page-loaded');
        document.body.classList.add('page-exit');
        
        // Navigate after transition
        setTimeout(function() {
            window.location.href = href;
        }, 300); // Match CSS transition duration
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('pageshow', function(e) {
        // If page was loaded from cache (back/forward), fade in immediately
        if (e.persisted) {
            addPageLoaded();
        }
    });
    
    // Fade in on page load (backup)
    window.addEventListener('load', addPageLoaded);
})();

