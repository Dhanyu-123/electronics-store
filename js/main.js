/**
 * Main Application Logic & Interactive Experience
 * Electronic Components & Kits Platform
 */

// Netlify Image CDN Helper (converts to small for thumbnail and large for modal)
function getOptimizedImageUrl(src, width = 600, quality = 80) {
  if (!src) return '';
  if (window.location.hostname.includes('netlify.app')) {
    const cleanPath = src.startsWith('/') ? src : '/' + src;
    if (cleanPath.startsWith('/assets/')) {
      return `/.netlify/images?url=${encodeURIComponent(cleanPath)}&w=${width}&q=${quality}`;
    }
  }
  return src;
}

// Absolute Product Image URL for WhatsApp Sharing
function getAbsoluteProductImageUrl(src) {
  if (!src) return 'https://electronix-store.netlify.app/assets/images/whatsapp-og-banner.jpg';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  const cleanPath = src.replace(/^\.?\//, '');
  return `https://electronix-store.netlify.app/${cleanPath}`;
}

// Global Toast Notification Helper
function showToast(message = 'Copied to clipboard!') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-alert';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Universal Copy to Clipboard Helper
function copyTextToClipboard(text, customToastMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customToastMsg);
    }).catch(() => {
      fallbackCopyText(text, customToastMsg);
    });
  } else {
    fallbackCopyText(text, customToastMsg);
  }
}

function fallbackCopyText(text, customToastMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(customToastMsg);
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
      const isExpanded = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // 2. Component Catalog Live Filter & Search
  const searchInput = document.getElementById('catalogSearch');
  const categoryChips = document.querySelectorAll('.chip[data-category]');
  const productCards = document.querySelectorAll('.product-card');

  let currentCategory = 'all';
  let searchQuery = '';

  function filterProducts() {
    productCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const title = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
      const sku = (card.querySelector('.product-sku')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();

      const matchesCategory = (currentCategory === 'all' || category === currentCategory);
      const matchesSearch = !searchQuery || title.includes(searchQuery) || sku.includes(searchQuery) || desc.includes(searchQuery);

      card.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
    });
  }

  if (categoryChips.length > 0) {
    categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategory = chip.getAttribute('data-category');
        filterProducts();
        
        if (window.trackEvent) {
          window.trackEvent('filter_category', { category: currentCategory });
        }
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterProducts();
    });
  }

  // 3. Interactive Magnified Product Modal & Details Viewer
  let modalBackdrop = document.getElementById('productDetailModal');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'productDetailModal';
    modalBackdrop.className = 'product-modal-backdrop';
    modalBackdrop.innerHTML = `
      <div class="product-modal-card" role="dialog" aria-modal="true">
        <button class="modal-close-btn" id="modalCloseBtn" aria-label="Close modal">&times;</button>
        <div class="modal-grid">
          <div class="modal-image-col">
            <div class="modal-magnified-wrap">
              <img id="modalProductImg" src="" alt="Product view" loading="lazy">
            </div>
            <div style="font-size: 0.8rem; color: #64748b; text-align: center;">🔍 Hover over image to inspect magnified silicon details</div>
          </div>
          <div class="modal-details-col">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span id="modalSku" style="font-family: var(--font-mono); font-weight: 700; color: #2563eb; font-size: 0.88rem;"></span>
              <span id="modalBadge" class="badge badge-green">IN STOCK</span>
            </div>
            <h2 id="modalTitle" style="font-size: 1.5rem; margin-bottom: 0.75rem; color: #0f172a;"></h2>
            <div style="display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.25rem;">
              <span style="font-size: 0.82rem; text-transform: uppercase; font-weight: 700; color: #64748b;">Special Price:</span>
              <span id="modalPrice" style="font-size: 1.75rem; font-weight: 800; color: #0f172a;"></span>
            </div>
            <p id="modalDesc" style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 1.25rem;"></p>
            <div id="modalSpecs" class="spec-pills" style="margin-bottom: 1.75rem;"></div>
            
            <!-- Quick Actions -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: auto;">
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button id="modalCopyBtn" class="btn btn-secondary" style="flex: 1; padding: 0.75rem 1rem;">
                  📋 Copy Product Details
                </button>
                <a id="modalWhatsAppBtn" href="#" target="_blank" rel="noopener" class="btn" style="background-color: #25d366; color: #ffffff !important; flex: 1; padding: 0.75rem 1rem;">
                  📲 Share on WhatsApp
                </a>
              </div>
              <a id="modalRfqBtn" href="#" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center;">
                Request Official Quote / Inquire &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);
  }

  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalProductImg = document.getElementById('modalProductImg');
  const modalSku = document.getElementById('modalSku');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalCopyBtn = document.getElementById('modalCopyBtn');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');
  const modalRfqBtn = document.getElementById('modalRfqBtn');

  function closeModal() {
    modalBackdrop.classList.remove('active');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) closeModal();
  });

  function openProductModal(card) {
    const title = card.querySelector('.product-title')?.textContent?.trim() || '';
    const skuElem = card.querySelector('.product-sku span:first-child');
    const rawSku = skuElem ? skuElem.textContent.replace('SKU:', '').trim() : '';
    const price = card.querySelector('.price-value')?.textContent?.trim() || '';
    const desc = card.querySelector('.product-desc')?.textContent?.trim() || '';
    const imgElem = card.querySelector('.card-image-wrap img');
    const imgSrc = imgElem ? imgElem.getAttribute('src') : '';
    const badgeText = card.querySelector('.card-badge-pos')?.textContent?.trim() || 'IN STOCK';
    const specPills = Array.from(card.querySelectorAll('.spec-pill')).map(p => p.textContent.trim());

    modalTitle.textContent = title;
    modalSku.textContent = `SKU: ${rawSku}`;
    modalPrice.textContent = price;
    modalDesc.textContent = desc;
    modalProductImg.src = getOptimizedImageUrl(imgSrc, 1200, 90);
    modalProductImg.alt = title;

    modalSpecs.innerHTML = '';
    specPills.forEach(spec => {
      const span = document.createElement('span');
      span.className = 'spec-pill';
      span.textContent = spec;
      modalSpecs.appendChild(span);
    });

    const fullImgUrl = getAbsoluteProductImageUrl(imgSrc);
    const shareUrl = `${window.location.origin}/catalog.html?sku=${encodeURIComponent(rawSku)}`;
    const copyContent = `⚡ ${title}\n💰 Price: ${price} (SKU: ${rawSku})\n📋 Specs: ${specPills.join(', ')}\n🖼️ Product Photo: ${fullImgUrl}\n🔗 Order / View: ${shareUrl}`;

    modalCopyBtn.onclick = () => copyTextToClipboard(copyContent, `Copied "${title}" specs!`);

    const waMsg = encodeURIComponent(`⚡ *${title}*\n💰 Price: *${price}* (SKU: ${rawSku})\n📋 Specs: ${specPills.slice(0, 3).join(', ')}\n🖼️ Product Photo: ${fullImgUrl}\n🔗 Order / View on Electronix: ${shareUrl}`);
    modalWhatsAppBtn.href = `https://api.whatsapp.com/send?text=${waMsg}`;

    modalRfqBtn.href = `contact.html?sku=${encodeURIComponent(rawSku)}`;

    modalBackdrop.classList.add('active');
  }

  // Bind clicks on product cards to open modal & add actions
  productCards.forEach(card => {
    const cardImg = card.querySelector('.card-image-wrap');
    const cardTitle = card.querySelector('.product-title');

    if (cardImg) {
      cardImg.addEventListener('click', () => openProductModal(card));
    }
    if (cardTitle) {
      cardTitle.addEventListener('click', () => openProductModal(card));
    }

    // Add Copy & WhatsApp Buttons to Card Footer
    const cardFooter = card.querySelector('.card-footer');
    if (cardFooter && !card.querySelector('.btn-copy-card')) {
      const actionsContainer = cardFooter.querySelector('div:last-child') || cardFooter;

      const title = card.querySelector('.product-title')?.textContent?.trim() || '';
      const skuElem = card.querySelector('.product-sku span:first-child');
      const rawSku = skuElem ? skuElem.textContent.replace('SKU:', '').trim() : '';
      const price = card.querySelector('.price-value')?.textContent?.trim() || '';
      const imgElem = card.querySelector('.card-image-wrap img');
      const imgSrc = imgElem ? imgElem.getAttribute('src') : '';
      const fullImgUrl = getAbsoluteProductImageUrl(imgSrc);
      const specPills = Array.from(card.querySelectorAll('.spec-pill')).map(p => p.textContent.trim());
      const shareUrl = `${window.location.origin}/catalog.html?sku=${encodeURIComponent(rawSku)}`;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn-icon-logo btn-copy-logo btn-copy-card';
      copyBtn.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
      copyBtn.title = 'Copy product details and specs';

      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyTextToClipboard(`⚡ ${title} - ${price} (SKU: ${rawSku})\nSpecs: ${specPills.slice(0, 3).join(', ')}\nPhoto: ${fullImgUrl}\nDetails: ${shareUrl}`, `Copied ${title}!`);
      });

      const waBtn = document.createElement('a');
      waBtn.className = 'btn-icon-logo btn-wa-logo btn-wa-card';
      waBtn.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.993.542 1.987.829 2.801.829h.005c3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.589-5.766-5.779-5.766zm9.969 5.828c0 5.523-4.477 10-10 10-1.745 0-3.385-.45-4.819-1.237l-5.181 1.357 1.379-5.037c-.86-1.472-1.379-3.195-1.379-5.083 0-5.523 4.477-10 10-10s10 4.477 10 10z"/>
        </svg>
      `;
      waBtn.title = 'Share product on WhatsApp';
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';

      const cardWaMsg = encodeURIComponent(`⚡ *${title}*\n💰 Price: *${price}* (SKU: ${rawSku})\n📋 Specs: ${specPills.slice(0, 3).join(', ')}\n🖼️ Product Photo: ${fullImgUrl}\n🔗 Order / View: ${shareUrl}`);
      waBtn.href = `https://api.whatsapp.com/send?text=${cardWaMsg}`;
      waBtn.addEventListener('click', (e) => e.stopPropagation());

      actionsContainer.prepend(waBtn);
      actionsContainer.prepend(copyBtn);
    }
  });

  // 4. URL Param Auto-Open (e.g. catalog.html?sku=PWR-TP4056-TYPEC)
  const urlParams = new URLSearchParams(window.location.search);
  const targetSku = urlParams.get('sku') || urlParams.get('product');

  if (targetSku && productCards.length > 0) {
    productCards.forEach(card => {
      const skuText = card.querySelector('.product-sku')?.textContent || '';
      if (skuText.includes(targetSku)) {
        setTimeout(() => openProductModal(card), 200);
      }
    });
  }

  // 5. Pre-fill Contact Form from URL Params
  const requestedSku = urlParams.get('sku');
  const partInput = document.getElementById('partNumber');
  const messageInput = document.getElementById('inquiryMessage');

  if (requestedSku && partInput) {
    partInput.value = requestedSku;
    if (messageInput) {
      messageInput.value = `Hello, I would like to request technical documentation, sample availability, or pricing for part: ${requestedSku}.`;
    }
  }

  // 6. Global Copy Buttons on Facts / Metrics / Disclaimers
  document.querySelectorAll('[data-copy-text]').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy-text');
      copyTextToClipboard(textToCopy, 'Copied to clipboard!');
    });
  });

  // 7. Netlify Form Submission Enhancement
  const contactForm = document.getElementById('netlifyContactForm');
  const formSuccessAlert = document.getElementById('formSuccessAlert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const isAjaxEnabled = contactForm.getAttribute('data-ajax') === 'true';

      if (isAjaxEnabled) {
        e.preventDefault();
        const formData = new FormData(contactForm);

        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        })
        .then(() => {
          if (formSuccessAlert) {
            formSuccessAlert.style.display = 'block';
            formSuccessAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          contactForm.reset();

          if (window.trackEvent) {
            window.trackEvent('contact_form_submitted', {
              inquiry_type: formData.get('inquiry_type') || 'general'
            });
          }
        })
        .catch((error) => {
          alert('Submission error. Please email us directly at support@electronix-store.com');
          console.error(error);
        });
      }
    });
  }

  // 8. Dynamic Copyright Year
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
