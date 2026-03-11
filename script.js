/**
 * FreshFold – Laundry Pickup & Delivery
 * Main JavaScript File
 * Features: Sticky Navbar, Mobile Menu, Scroll Reveal,
 *           WhatsApp Booking Form, Scroll-to-Top
 */

/* ══════════════════════════════════════════════
   1. DOM READY
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initBookingForm();
  initScrollToTop();
  initSmoothScroll();
  setMinPickupDate();
  initActiveNavLinks();
});

/* ══════════════════════════════════════════════
   2. STICKY NAVBAR
   Adds 'scrolled' class when user scrolls down
══════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   3. MOBILE HAMBURGER MENU
   Toggles nav open/closed on mobile screens
══════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  // Toggle menu on button click
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when any nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu(hamburger, navLinks));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMenu(hamburger, navLinks);
    }
  });
}

/** Helper: closes the mobile nav menu */
function closeMenu(hamburger, navLinks) {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
}

/* ══════════════════════════════════════════════
   4. SCROLL REVEAL ANIMATIONS
   Adds 'visible' class when elements enter viewport
══════════════════════════════════════════════ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // one-time animation
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════
   5. BOOKING FORM + WHATSAPP REDIRECT
   Validates form and generates a pre-filled
   WhatsApp message on submission
══════════════════════════════════════════════ */

// ── WhatsApp number (country code + number, no + or spaces) ──
const WHATSAPP_NUMBER = '917863056724';

function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear any previous error states
    clearErrors(form);

    // ── Collect form values ──────────────────
    const name       = form.name.value.trim();
    const phone      = form.phone.value.trim();
    const address    = form.address.value.trim();
    const service    = form.service.value;
    const pickupDate = form.pickupDate.value;
    const pickupTime = form.pickupTime.value;
    const notes      = form.notes.value.trim();

    // ── Validate fields ──────────────────────
    let isValid = true;

    if (!name) {
      showError(form.name, 'Please enter your full name');
      isValid = false;
    }

    if (!phone || !isValidPhone(phone)) {
      showError(form.phone, 'Enter a valid 10-digit phone number');
      isValid = false;
    }

    if (!address) {
      showError(form.address, 'Please enter your pickup address');
      isValid = false;
    }

    if (!service) {
      showError(form.service, 'Please select a service');
      isValid = false;
    }

    if (!pickupDate) {
      showError(form.pickupDate, 'Please select a pickup date');
      isValid = false;
    }

    if (!pickupTime) {
      showError(form.pickupTime, 'Please select a time slot');
      isValid = false;
    }

    if (!isValid) return;

    // ── Build and send WhatsApp message ──────
    const message = buildWhatsAppMessage({
      name,
      phone,
      service,
      address,
      date:  formatDate(pickupDate),
      time:  pickupTime,
      notes: notes || 'None'
    });

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');

    // Show success feedback to the user
    showSuccessToast();
  });
}

/**
 * Builds the WhatsApp booking message string
 * @param {Object} data - Booking form data
 * @returns {string} Formatted message
 */
function buildWhatsAppMessage({ name, phone, service, address, date, time, notes }) {
  return (
    `Hello *FreshFold!* I want to book a laundry pickup.\n\n` +
    `*---- Booking Details ----*\n\n` +
    `*Name:* ${name}\n` +
    `*Phone:* ${phone}\n` +
    `*Service:* ${service}\n` +
    `*Pickup Address:* ${address}\n` +
    `*Pickup Date:* ${date}\n` +
    `*Pickup Time:* ${time}\n` +
    `*Notes:* ${notes}\n\n` +
    `*------------------------*\n\n` +
    `Please confirm my booking.\n` +
    `Thank you!`
  );
}

/**
 * Validates an Indian phone number
 * Accepts 10-digit numbers with optional +91 / 91 / 0 prefix
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+91|91|0)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Formats "YYYY-MM-DD" to "12 March 2025"
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00'); // force local timezone
  return date.toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });
}

/**
 * Marks a field as invalid and shows an error message below it
 * @param {HTMLElement} field
 * @param {string} message
 */
function showError(field, message) {
  field.classList.add('error');

  // Remove any existing error message first
  field.parentElement.querySelector('.error-msg')?.remove();

  const errEl = document.createElement('span');
  errEl.className   = 'error-msg';
  errEl.textContent = message;
  errEl.style.cssText = 'color:#ef4444;font-size:.76rem;font-weight:500;margin-top:.15rem;display:block;';
  field.parentElement.appendChild(errEl);

  // Auto-clear error on user interaction
  const clearOnEvent = field.tagName === 'SELECT' ? 'change' : 'input';
  field.addEventListener(clearOnEvent, () => {
    field.classList.remove('error');
    field.parentElement.querySelector('.error-msg')?.remove();
  }, { once: true });
}

/**
 * Removes all error states and messages from a form
 * @param {HTMLFormElement} form
 */
function clearErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-msg').forEach(el => el.remove());
}

/**
 * Shows an animated success toast notification after booking
 */
function showSuccessToast() {
  // Remove any existing toast
  document.querySelector('.success-toast')?.remove();

  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.innerHTML = `
    <span style="font-size:1.4rem;">✅</span>
    <div>
      <strong>Booking sent!</strong>
      <p>Opening WhatsApp with your booking details…</p>
    </div>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: white;
    border: 1.5px solid #22c55e;
    border-radius: 14px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 12px 40px rgba(0,0,0,.15);
    z-index: 9999;
    font-family: 'Poppins', sans-serif;
    min-width: 280px;
    opacity: 0;
    transition: opacity .3s ease, transform .3s ease;
  `;
  toast.querySelector('strong').style.cssText = 'display:block;font-size:.9rem;color:#166534;';
  toast.querySelector('p').style.cssText      = 'font-size:.8rem;color:#64748b;margin:0;';

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Animate out after 4 seconds
  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

/* ══════════════════════════════════════════════
   6. SCROLL TO TOP BUTTON
   Shows when user scrolls past 400px
══════════════════════════════════════════════ */
function initScrollToTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════════
   7. SMOOTH SCROLL FOR ANCHOR LINKS
   Offsets scroll by navbar height for accuracy
══════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight   = document.getElementById('navbar')?.offsetHeight ?? 0;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════
   8. SET MINIMUM PICKUP DATE
   Prevents users from selecting past dates
══════════════════════════════════════════════ */
function setMinPickupDate() {
  const dateInput = document.getElementById('pickupDate');
  if (!dateInput) return;

  // Start from tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yyyy = tomorrow.getFullYear();
  const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd   = String(tomorrow.getDate()).padStart(2, '0');

  dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

/* ══════════════════════════════════════════════
   9. ACTIVE NAV LINK HIGHLIGHTING
   Highlights the nav link of the visible section
══════════════════════════════════════════════ */
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (!link || link.classList.contains('btn-nav')) return;

      if (entry.isIntersecting) {
        // Deactivate all links, then activate the current one
        navLinks.forEach(l => { l.removeAttribute('data-active'); l.style.color = ''; });
        link.setAttribute('data-active', 'true');
        link.style.color = 'var(--blue-600)';
      } else {
        link.removeAttribute('data-active');
        link.style.color = '';
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px'
  });

  sections.forEach(section => observer.observe(section));
}