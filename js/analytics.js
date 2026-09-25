/**
 * Unified Analytics Engine: Google Analytics 4 (GA4) & Microsoft Clarity
 * Electronic Components & Kits Platform
 */

const ANALYTICS_CONFIG = {
  // Replace with your Google Analytics 4 Measurement ID (e.g., 'G-XXXXXXXXXX')
  gaMeasurementId: 'G-ELECKIT001',
  
  // Replace with your Microsoft Clarity Project ID (e.g., 'abcdef1234')
  clarityProjectId: 'clarity_project_sample_id',

  // Set to true in production
  enabled: true
};

(function initAnalytics() {
  if (!ANALYTICS_CONFIG.enabled) return;

  // 1. Google Analytics 4 Integration
  if (ANALYTICS_CONFIG.gaMeasurementId && ANALYTICS_CONFIG.gaMeasurementId !== 'G-ELECKIT001') {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.gaMeasurementId}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.gaMeasurementId, {
      anonymize_ip: true,
      send_page_view: true
    });
  } else {
    // Development / fallback stub so calls don't fail
    window.gtag = function() {
      console.log('[Analytics GA4 Debug]:', ...arguments);
    };
  }

  // 2. Microsoft Clarity Integration
  if (ANALYTICS_CONFIG.clarityProjectId && ANALYTICS_CONFIG.clarityProjectId !== 'clarity_project_sample_id') {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ANALYTICS_CONFIG.clarityProjectId);
  } else {
    // Development / fallback stub
    window.clarity = function() {
      console.log('[Analytics Clarity Debug]:', ...arguments);
    };
  }
})();

/**
 * Custom event tracking helper for e-commerce, RFQs and kit downloads
 */
function trackEvent(eventName, eventParams = {}) {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
  if (window.clarity) {
    window.clarity('event', eventName);
  }
}

window.trackEvent = trackEvent;
