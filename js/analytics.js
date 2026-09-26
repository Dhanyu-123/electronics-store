/**
 * Unified Analytics Engine: Google Analytics 4 (GA4) & Microsoft Clarity
 * Electronic Components & Kits Platform
 */

const ANALYTICS_CONFIG = {
  // Google Analytics 4 Measurement ID
  gaMeasurementId: 'G-BX37BX47P3',
  
  // Microsoft Clarity Project ID
  clarityProjectId: 'ynu3c1fcwb',

  // Set to true in production
  enabled: true
};

(function initAnalytics() {
  if (!ANALYTICS_CONFIG.enabled) return;

  const gaId = (ANALYTICS_CONFIG.gaMeasurementId || '').trim();
  const clarityId = (ANALYTICS_CONFIG.clarityProjectId || '').replace(/^id-/, '').trim();

  // 1. Google Analytics 4 Integration
  if (gaId && !gaId.includes('SAMPLE') && !gaId.includes('ELECKIT')) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId, {
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
  if (clarityId && !clarityId.includes('sample')) {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", clarityId);
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
