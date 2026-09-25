/**
 * Centralized Bunny.net CDN Configuration & Image Asset Loader
 * 
 * Replace BUNNY_ZONE_BASE with your actual Bunny.net Pull Zone hostname:
 * Example: https://your-pullzone-name.b-cdn.net
 */

const BUNNY_CDN_CONFIG = {
  // Replace with your Bunny.net zone URL or custom domain
  pullZoneUrl: 'https://electronix-assets.b-cdn.net',
  
  // Local or Unsplash fallback if the Bunny CDN zone is still propagating
  useFallbackIfOffline: true,
  fallbackBaseUrl: 'https://images.unsplash.com',

  // Preset component & kit visual asset paths
  assets: {
    heroBanner: '/banners/cleanroom-pcb-assembly-1200x630.jpg',
    ogDefault: '/og/electronix-og-preview-1200x630.png',
    esp32Kit: '/products/esp32-s3-pro-devkit.jpg',
    stm32Board: '/products/stm32h7-core-board.jpg',
    raspberryPiKit: '/products/rp2040-maker-starter-kit.jpg',
    sensorKit: '/products/37-in-1-sensor-laboratory-kit.jpg',
    oscilloscopeKit: '/products/dso-digital-oscilloscope-diy-kit.jpg',
    powerSupply: '/products/adjustable-dc-buck-converter-module.jpg',
    logicAnalyzer: '/products/24mhz-8ch-logic-analyzer.jpg',
    solderStation: '/products/smart-oled-soldering-station-kit.jpg'
  },

  // Fallback high-resolution images for immediate out-of-the-box demonstration
  demoFallbacks: {
    '/banners/cleanroom-pcb-assembly-1200x630.jpg': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=630&q=85',
    '/og/electronix-og-preview-1200x630.png': 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&h=630&q=85',
    '/products/esp32-s3-pro-devkit.jpg': 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
    '/products/stm32h7-core-board.jpg': 'https://images.unsplash.com/photo-1608555855762-2b657eb1c348?auto=format&fit=crop&w=800&q=80',
    '/products/rp2040-maker-starter-kit.jpg': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    '/products/37-in-1-sensor-laboratory-kit.jpg': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    '/products/dso-digital-oscilloscope-diy-kit.jpg': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    '/products/adjustable-dc-buck-converter-module.jpg': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    '/products/24mhz-8ch-logic-analyzer.jpg': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    '/products/smart-oled-soldering-station-kit.jpg': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80'
  }
};

/**
 * Returns full CDN URL with automatic fallback detection
 * @param {string} relativePath 
 * @returns {string} Fully qualified CDN or fallback URL
 */
function getBunnyAssetUrl(relativePath) {
  // If Bunny CDN is ready and active:
  // return `${BUNNY_CDN_CONFIG.pullZoneUrl}${relativePath}`;

  // For initial immediate preview while Bunny DNS is set up:
  if (BUNNY_CDN_CONFIG.demoFallbacks[relativePath]) {
    return BUNNY_CDN_CONFIG.demoFallbacks[relativePath];
  }
  return `${BUNNY_CDN_CONFIG.pullZoneUrl}${relativePath}`;
}

/**
 * Automatically attaches Bunny CDN URLs to any element with data-bunny-src
 */
document.addEventListener('DOMContentLoaded', () => {
  const cdnImages = document.querySelectorAll('[data-bunny-src]');
  cdnImages.forEach(img => {
    const assetKey = img.getAttribute('data-bunny-src');
    const finalUrl = getBunnyAssetUrl(assetKey);
    img.src = finalUrl;

    // Graceful error handler if CDN file is missing
    img.onerror = function() {
      if (BUNNY_CDN_CONFIG.demoFallbacks[assetKey]) {
        this.src = BUNNY_CDN_CONFIG.demoFallbacks[assetKey];
      }
    };
  });
});

window.BUNNY_CDN = {
  getUrl: getBunnyAssetUrl,
  config: BUNNY_CDN_CONFIG
};
