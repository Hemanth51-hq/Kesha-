/**
 * JustNatur Theme JS
 * Cart drawer, mobile nav, accordion, reveal animations, product gallery
 */
(function () {
  'use strict';

  const moneyFormat = window.themeSettings?.moneyFormat || '{{amount}}';

  function formatMoney(cents) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    const value = (parseInt(cents, 10) / 100).toFixed(2);
    return '₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Accordion ---------- */
  function initAccordion() {
    document.querySelectorAll('[data-accordion]').forEach((root) => {
      root.querySelectorAll('.accordion__trigger').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.accordion__item');
          const open = item.classList.contains('is-open');
          if (root.dataset.accordion === 'single') {
            root.querySelectorAll('.accordion__item').forEach((i) => i.classList.remove('is-open'));
          }
          item.classList.toggle('is-open', !open);
          btn.setAttribute('aria-expanded', String(!open));
        });
      });
    });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-open');
    };

    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('drawer-open', open);
    });

    nav.querySelector('[data-menu-close]')?.addEventListener('click', close);
    nav.querySelector('.mobile-nav__overlay')?.addEventListener('click', close);
  }

  /* ---------- Cart drawer ---------- */
  const Cart = {
    drawer: null,

    init() {
      this.drawer = document.querySelector('[data-cart-drawer]');
      if (!this.drawer) return;

      document.querySelectorAll('[data-cart-open]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });

      this.drawer.querySelector('[data-cart-close]')?.addEventListener('click', () => this.close());
      this.drawer.querySelector('.cart-drawer__overlay')?.addEventListener('click', () => this.close());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });

      this.bindForms();
    },

    open() {
      this.refresh().then(() => {
        this.drawer.classList.add('is-open');
        document.body.classList.add('drawer-open');
      });
    },

    close() {
      this.drawer?.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
    },

    async refresh() {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      this.render(cart);
      this.updateCount(cart.item_count);
    },

    updateCount(count) {
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = count > 0 ? String(count) : '';
        el.setAttribute('data-count', String(count));
      });
    },

    render(cart) {
      const body = this.drawer.querySelector('[data-cart-body]');
      const footer = this.drawer.querySelector('[data-cart-footer]');
      const subtotal = this.drawer.querySelector('[data-cart-subtotal]');
      if (!body) return;

      if (!cart.items.length) {
        body.innerHTML = `<div class="empty-state"><p>Your cart is empty</p><a href="/collections/all" class="btn btn--primary" style="margin-top:1rem">Shop products</a></div>`;
        if (footer) footer.hidden = true;
        return;
      }

      if (footer) footer.hidden = false;
      body.innerHTML = cart.items
        .map(
          (item) => `
        <div class="cart-item" data-key="${item.key}">
          <img class="cart-item__image" src="${item.image ? item.image.replace(/(\.[^.]*)$/, '_150x$1') : ''}" alt="${item.product_title}" width="72" height="72" loading="lazy">
          <div>
            <div class="cart-item__title">${item.product_title}</div>
            ${item.variant_title && item.variant_title !== 'Default Title' ? `<div class="cart-item__meta">${item.variant_title}</div>` : ''}
            <div class="cart-item__row">
              <div class="qty-control">
                <button type="button" data-qty-change="-1" aria-label="Decrease">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-qty-change="1" aria-label="Increase">+</button>
              </div>
              <div class="price">${formatMoney(item.final_line_price)}</div>
            </div>
            <button type="button" class="btn btn--ghost btn--sm" data-remove style="margin-top:0.35rem;padding:0">Remove</button>
          </div>
        </div>`
        )
        .join('');

      if (subtotal) subtotal.textContent = formatMoney(cart.total_price);

      const bar = this.drawer.querySelector('[data-free-shipping]');
      if (bar) {
        const threshold = parseInt(bar.dataset.threshold || '99900', 10);
        const remaining = Math.max(0, threshold - cart.total_price);
        const pct = Math.min(100, (cart.total_price / threshold) * 100);
        const msg = bar.querySelector('[data-free-shipping-msg]');
        const fill = bar.querySelector('[data-free-shipping-fill]');
        if (msg) {
          msg.textContent =
            remaining > 0
              ? `Add ${formatMoney(remaining)} more for free shipping`
              : "You've unlocked free shipping";
        }
        if (fill) fill.style.width = pct + '%';
      }

      body.querySelectorAll('.cart-item').forEach((row) => {
        const key = row.dataset.key;
        row.querySelectorAll('[data-qty-change]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const delta = parseInt(btn.dataset.qtyChange, 10);
            const qty = parseInt(row.querySelector('.qty-control span').textContent, 10) + delta;
            this.changeQty(key, Math.max(0, qty));
          });
        });
        row.querySelector('[data-remove]')?.addEventListener('click', () => this.changeQty(key, 0));
      });
    },

    async changeQty(key, quantity) {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity }),
      });
      await this.refresh();
    },

    async add(form) {
      const formData = new FormData(form);
      const res = await fetch('/cart/add.js', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.description || 'Could not add to cart');
      }
      await this.refresh();
      if (document.querySelector('[data-cart-drawer]')) this.open();
      else window.location.href = '/cart';
    },

    bindForms() {
      document.addEventListener('submit', async (e) => {
        const form = e.target.closest('[data-product-form]');
        if (!form) return;
        if (!document.querySelector('[data-cart-drawer]')) return;
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.dataset.label = btn.textContent;
          btn.textContent = 'Adding…';
        }
        try {
          await this.add(form);
        } catch (err) {
          alert(err.message);
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = btn.dataset.label || 'Add to cart';
          }
        }
      });
    },
  };

  /* ---------- Product gallery ---------- */
  function initProductGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
      const main = gallery.querySelector('[data-gallery-main]');
      gallery.querySelectorAll('[data-gallery-thumb]').forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const src = thumb.dataset.src;
          const srcset = thumb.dataset.srcset;
          if (main && src) {
            main.src = src;
            if (srcset) main.srcset = srcset;
          }
          gallery.querySelectorAll('[data-gallery-thumb]').forEach((t) => t.classList.remove('is-active'));
          thumb.classList.add('is-active');
        });
      });
    });
  }

  /* ---------- Sticky ATC ---------- */
  function initStickyAtc() {
    const sticky = document.querySelector('[data-sticky-atc]');
    const trigger = document.querySelector('[data-product-form]');
    if (!sticky || !trigger) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        sticky.classList.toggle('is-visible', !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    io.observe(trigger);

    sticky.querySelector('[data-sticky-atc-btn]')?.addEventListener('click', () => {
      trigger.requestSubmit?.() || trigger.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  }

  /* ---------- Variant picker ---------- */
  function initVariants() {
    document.querySelectorAll('[data-product-form]').forEach((form) => {
      const select = form.querySelector('[name="id"]');
      const options = form.querySelectorAll('[data-option-input]');
      if (!select || !options.length) return;

      const variantsEl = form.querySelector('[data-product-variants]');
      const variants = variantsEl ? JSON.parse(variantsEl.textContent || '[]') : [];
      const priceEl = document.querySelector('[data-product-price]');
      const compareEl = document.querySelector('[data-product-compare]');
      const btn = form.querySelector('[type="submit"]');

      function sync() {
        const chosen = [];
        form.querySelectorAll('[data-option-index]').forEach((group) => {
          const checked = group.querySelector('input:checked');
          if (checked) chosen.push(checked.value);
        });
        const match = variants.find((v) => v.options.every((o, i) => o === chosen[i]));
        if (!match) return;
        select.value = match.id;
        if (priceEl) priceEl.innerHTML = formatMoney(match.price);
        if (compareEl) {
          if (match.compare_at_price > match.price) {
            compareEl.hidden = false;
            compareEl.innerHTML = formatMoney(match.compare_at_price);
          } else {
            compareEl.hidden = true;
          }
        }
        if (btn) {
          btn.disabled = !match.available;
          btn.textContent = match.available ? (btn.dataset.addLabel || 'Add to cart') : 'Sold out';
        }
        form.querySelectorAll('.variant-option').forEach((label) => {
          label.classList.toggle('is-selected', label.querySelector('input')?.checked);
        });
      }

      options.forEach((input) => input.addEventListener('change', sync));
      sync();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initAccordion();
    initMobileNav();
    Cart.init();
    initProductGallery();
    initStickyAtc();
    initVariants();
  });

  window.JustNaturCart = Cart;
})();
