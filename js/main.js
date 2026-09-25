/**
 * Main Application Logic
 * Electronic Components & Kits Platform
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isExpanded = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside
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

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
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

  // 3. Pre-fill Contact Form from URL Params (e.g. contact.html?sku=ESP32-S3-WROOM&type=sample)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedSku = urlParams.get('sku');
  const partInput = document.getElementById('partNumber');
  const messageInput = document.getElementById('inquiryMessage');

  if (requestedSku && partInput) {
    partInput.value = requestedSku;
    if (messageInput) {
      messageInput.value = `Hello, I would like to request technical documentation, sample availability, or pricing for part: ${requestedSku}.`;
    }
  }

  // 4. WhatsApp Sharing Direct Integration
  const whatsappButtons = document.querySelectorAll('.whatsapp-share-trigger');
  whatsappButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentUrl = window.location.href;
      const pageTitle = document.title;
      const shareMessage = encodeURIComponent(`Check out this electronic component/kit on Electronix:\n*${pageTitle}*\n${currentUrl}`);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${shareMessage}`;
      
      if (window.trackEvent) {
        window.trackEvent('whatsapp_share_clicked', { url: currentUrl });
      }

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  });

  // 5. Netlify Form Submission Enhancement (AJAX with fallback)
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
          alert('Submission error. Please email us directly at support@electronix-enterprise.com');
          console.error(error);
        });
      }
    });
  }

  // 6. Dynamic Copyright Year
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
