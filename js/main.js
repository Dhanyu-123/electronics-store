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

  // Universal Share Dialog Modal Generator (1-Click to WhatsApp, Email, Messages, Copy Link, or System Share)
  let shareModalBackdrop = document.getElementById('universalShareModal');
  if (!shareModalBackdrop) {
    shareModalBackdrop = document.createElement('div');
    shareModalBackdrop.id = 'universalShareModal';
    shareModalBackdrop.className = 'share-modal-backdrop';
    shareModalBackdrop.innerHTML = `
      <div class="share-modal-card" role="dialog" aria-modal="true">
        <div class="share-modal-header">
          <h3 style="margin: 0; font-size: 1.2rem; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
            <span>📤</span> <span id="shareModalHeading">Share Electronix</span>
          </h3>
          <button class="share-modal-close-btn" id="shareModalCloseBtn" aria-label="Close share dialog">&times;</button>
        </div>
        <p id="shareModalSubtitle" style="font-size: 0.92rem; color: #64748b; margin: 0.5rem 0 1.25rem;">
          Select how you want to share or copy the verified product link:
        </p>
        <div class="share-options-grid">
          <a id="shareOptWa" href="#" target="_blank" rel="noopener" class="share-opt-btn share-opt-whatsapp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.993.542 1.987.829 2.801.829h.005c3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.589-5.766-5.779-5.766zm9.969 5.828c0 5.523-4.477 10-10 10-1.745 0-3.385-.45-4.819-1.237l-5.181 1.357 1.379-5.037c-.86-1.472-1.379-3.195-1.379-5.083 0-5.523 4.477-10 10-10s10 4.477 10 10z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
          <a id="shareOptMail" href="#" class="share-opt-btn share-opt-email">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Email</span>
          </a>
          <a id="shareOptMsg" href="#" class="share-opt-btn share-opt-msg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Messages / SMS</span>
          </a>
          <button id="shareOptCopy" type="button" class="share-opt-btn share-opt-copy">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy Link</span>
          </button>
        </div>
        <div id="shareSystemWrap" style="margin-top: 1.25rem; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
          <button id="shareOptSystem" type="button" class="btn btn-secondary" style="width: 100%; justify-content: center; font-size: 0.9rem; gap: 0.45rem;">
            <span>🌐</span> More Apps (AirDrop, Telegram, Files, etc.)
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(shareModalBackdrop);

    document.getElementById('shareModalCloseBtn').addEventListener('click', () => {
      shareModalBackdrop.classList.remove('active');
    });
    shareModalBackdrop.addEventListener('click', (e) => {
      if (e.target === shareModalBackdrop) shareModalBackdrop.classList.remove('active');
    });
  }

  function openShareModal({ title, text, url }) {
    const finalUrl = url || window.location.href;
    const finalTitle = title || document.title || 'Electronix | Affordable Electronic Components';
    const finalMsg = text ? `${text}\n${finalUrl}` : finalUrl;

    const heading = document.getElementById('shareModalHeading');
    if (heading) heading.textContent = title ? `Share "${title.split('•')[0].trim().slice(0, 22)}..."` : 'Share Electronix';

    // WhatsApp: Clean URL so WhatsApp crawler generates the photo card preview instantly
    const waBtn = document.getElementById('shareOptWa');
    if (waBtn) {
      waBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(finalUrl)}`;
    }

    // Email
    const mailBtn = document.getElementById('shareOptMail');
    if (mailBtn) {
      mailBtn.href = `mailto:?subject=${encodeURIComponent(finalTitle)}&body=${encodeURIComponent(finalMsg)}`;
    }

    // SMS
    const msgBtn = document.getElementById('shareOptMsg');
    if (msgBtn) {
      msgBtn.href = `sms:?&body=${encodeURIComponent(finalMsg)}`;
    }

    // Copy Link button
    const copyBtn = document.getElementById('shareOptCopy');
    if (copyBtn) {
      copyBtn.onclick = () => {
        copyTextToClipboard(finalUrl, 'Link copied! Ready to paste into WhatsApp');
        shareModalBackdrop.classList.remove('active');
      };
    }

    // System Share (AirDrop, Telegram, Files, etc.)
    const systemWrap = document.getElementById('shareSystemWrap');
    const systemBtn = document.getElementById('shareOptSystem');
    if (navigator.share) {
      if (systemWrap) systemWrap.style.display = 'block';
      if (systemBtn) {
        systemBtn.onclick = async () => {
          try {
            await navigator.share({ title: finalTitle, text: text || finalTitle, url: finalUrl });
            shareModalBackdrop.classList.remove('active');
          } catch (err) {}
        };
      }
    } else {
      if (systemWrap) systemWrap.style.display = 'none';
    }

    shareModalBackdrop.classList.add('active');
  }

  // Dual Copy for WhatsApp: writes image blob (for WhatsApp Web paste) + clean URL (for rich preview)
  async function copyProductForWhatsApp(productPageUrl, imgSrc, title) {
    let imageCopied = false;
    if (imgSrc && navigator.clipboard && window.isSecureContext) {
      try {
        const fullImgSrc = imgSrc.startsWith('http') ? imgSrc : `${window.location.origin}/${imgSrc.replace(/^\.?\//, '')}`;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = fullImgSrc;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          setTimeout(rej, 1200);
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
              'text/plain': new Blob([productPageUrl], { type: 'text/plain' })
            })
          ]);
          imageCopied = true;
          showToast(`Copied ${title} photo! Paste directly into WhatsApp.`);
          return;
        }
      } catch (e) {
        // Fallback to text copy below
      }
    }

    // Standalone clean URL: WhatsApp ALWAYS unfurls the OpenGraph product photo when this is pasted
    copyTextToClipboard(productPageUrl, `Copied ${title} link! Paste in WhatsApp for photo preview.`);
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
            <div style="font-size: 0.84rem; color: #1e293b; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; margin-top: 0.65rem; background: #f1f5f9; padding: 0.45rem 0.85rem; border-radius: 6px; border: 1px solid #cbd5e1;">
              <span style="font-size: 1.15rem; line-height: 1;" aria-hidden="true">🔍</span>
              <span>Hover over image to inspect magnified silicon details</span>
            </div>
          </div>
          <div class="modal-details-col">
            <div style="margin-bottom: 0.5rem; padding-top: 0.5rem;">
              <span id="modalSku" style="font-family: var(--font-mono); font-weight: 700; color: #2563eb; font-size: 0.95rem;"></span>
            </div>
            <h2 id="modalTitle" style="font-size: 1.55rem; margin-bottom: 0.85rem; color: #0f172a; line-height: 1.3;"></h2>
            <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
              <span style="font-size: 0.82rem; text-transform: uppercase; font-weight: 700; color: #64748b;">Special Price:</span>
              <span id="modalPrice" style="font-size: 1.85rem; font-weight: 800; color: #0f172a;"></span>
              <span id="modalBadge" class="badge badge-green" style="font-size: 0.82rem; padding: 0.35rem 0.75rem; border-radius: 4px;">IN STOCK</span>
            </div>
            <p id="modalDesc" style="font-size: 0.98rem; line-height: 1.65; color: #334155; margin-bottom: 1.25rem;"></p>
            <div id="modalSpecs" class="spec-pills" style="margin-bottom: 1.75rem;"></div>
            
            <!-- Quick Actions -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: auto;">
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button id="modalCopyBtn" class="btn btn-secondary" style="flex: 1; padding: 0.75rem 1rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>Copy for WhatsApp</span>
                </button>
                <button id="modalShareBtn" type="button" class="btn" style="background-color: #2563eb; color: #ffffff !important; flex: 1; padding: 0.75rem 1rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  <span>Share Product</span>
                </button>
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
  const modalShareBtn = document.getElementById('modalShareBtn');
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

    const skuSlug = rawSku.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    const productPageUrl = `https://electronix-store.netlify.app/products/${skuSlug}.html`;

    modalCopyBtn.onclick = () => copyProductForWhatsApp(productPageUrl, imgSrc, title);

    modalShareBtn.onclick = () => {
      openShareModal({
        title: `${title} • ${price}`,
        text: `⚡ ${title} (SKU: ${rawSku}) • ${price}`,
        url: productPageUrl
      });
    };

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

    // Add Copy & Universal Share Buttons to Card Footer
    const cardFooter = card.querySelector('.card-footer');
    if (cardFooter && !card.querySelector('.btn-copy-card')) {
      const actionsContainer = cardFooter.querySelector('div:last-child') || cardFooter;

      const title = card.querySelector('.product-title')?.textContent?.trim() || '';
      const skuElem = card.querySelector('.product-sku span:first-child');
      const rawSku = skuElem ? skuElem.textContent.replace('SKU:', '').trim() : '';
      const price = card.querySelector('.price-value')?.textContent?.trim() || '';
      const imgElem = card.querySelector('.card-image-wrap img');
      const imgSrc = imgElem ? imgElem.getAttribute('src') : '';
      const skuSlug = rawSku.toLowerCase().replace(/[^a-z0-9\-]/g, '');
      const productPageUrl = `https://electronix-store.netlify.app/products/${skuSlug}.html`;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'btn-icon-logo btn-copy-logo btn-copy-card';
      copyBtn.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
      copyBtn.title = 'Copy product photo & link for WhatsApp';

      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyProductForWhatsApp(productPageUrl, imgSrc, title);
      });

      const shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.className = 'btn-icon-logo btn-share-logo btn-share-card';
      shareBtn.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      `;
      shareBtn.title = 'Share to WhatsApp, Messages, Email & Apps';

      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openShareModal({
          title: `${title} • ${price}`,
          text: `⚡ ${title} (SKU: ${rawSku}) • ${price}`,
          url: productPageUrl
        });
      });

      actionsContainer.prepend(shareBtn);
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

  // 9. Disclaimer Section Copy to Clipboard
  document.querySelectorAll('.copy-disclaimer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const article = document.getElementById(targetId) || btn.closest('.disclaimer-card');
      if (article) {
        const titleElem = article.querySelector('h3');
        const title = titleElem ? titleElem.innerText.replace(/\s+/g, ' ').trim() : 'Safety Disclaimer';
        const paragraphs = Array.from(article.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean).join('\n\n');
        const listItems = Array.from(article.querySelectorAll('li')).map(li => `• ${li.innerText.trim()}`).join('\n');
        
        let fullDisclaimerText = `📜 ${title}\n\n${paragraphs}`;
        if (listItems) {
          fullDisclaimerText += `\n\nKey Guidelines:\n${listItems}`;
        }
        fullDisclaimerText += `\n\n🔗 Reference: https://electronix-store.netlify.app/disclaimers.html#${targetId}`;
        
        copyTextToClipboard(fullDisclaimerText, `Copied ${title.split(' ')[0]} ${title.split(' ')[1] || ''}!`);
      }
    });
  });

  // 10. Universal Form Validation & Submit Button States (Grey -> Blue)
  function initUniversalSubmitValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (!submitBtn) return;

      function validateForm() {
        const requiredInputs = Array.from(form.querySelectorAll('[required]'));
        let allValid = true;

        requiredInputs.forEach(input => {
          if (input.type === 'checkbox' || input.type === 'radio') {
            if (!input.checked) allValid = false;
          } else if (input.type === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!input.value.trim() || !emailPattern.test(input.value.trim())) {
              allValid = false;
            }
          } else {
            if (!input.value.trim() || input.value.trim().length < 2) {
              allValid = false;
            }
          }
        });

        // Also check native HTML5 checkValidity
        if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
          allValid = false;
        }

        if (allValid) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-disabled');
        } else {
          submitBtn.disabled = true;
          submitBtn.classList.add('btn-disabled');
        }
      }

      // Initial check (disabled & grey by default)
      validateForm();

      // Listen on all user events
      form.addEventListener('input', validateForm);
      form.addEventListener('change', validateForm);
      form.addEventListener('keyup', validateForm);
      form.addEventListener('paste', () => setTimeout(validateForm, 50));
    });
  }

  initUniversalSubmitValidation();

  // 11. Wire all Top & Global Share Buttons & Direct Engineer WhatsApp Chat (Direct + Event Delegation)
  document.addEventListener('click', (e) => {
    const shareBtn = e.target.closest('.whatsapp-share-trigger, .nav-share-trigger, .whatsapp-share-btn');
    if (shareBtn) {
      const text = (shareBtn.textContent || '').toLowerCase();
      if (shareBtn.classList.contains('chat-engineer-btn') || text.includes('engineer')) {
        // Handled by direct whatsapp URL
        return;
      }
      e.preventDefault();
      openShareModal({
        title: document.title || 'Electronix | Affordable Electronic Components',
        text: '⚡ Check out Electronix - Affordable Electronic Components & Authentic Silicon in India:\n',
        url: window.location.href
      });
    }
  });
});


