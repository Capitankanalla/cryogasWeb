function parseMetricValue(valueString) {
  if (typeof valueString !== 'string') return null;

  const match = valueString.match(/\d[\d.,]*/);
  if (!match) return null;

  const numericValue = Number(match[0].replace('.', '').replace(',', ''));
  const suffix = valueString.slice(match.index + match[0].length);

  return {
    number: numericValue,
    suffix
  };
}

function animateCounter(element, targetNumber, suffix, duration = 1800) {
  const startNumber = 0;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(startNumber + (targetNumber - startNumber) * easedProgress);

    element.textContent = `${currentValue}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = `${targetNumber}${suffix}`;
    }
  };

  element.textContent = `${startNumber}${suffix}`;
  requestAnimationFrame(tick);
}

function resetModalScroll(modal) {
  if (!modal) return;

  modal.scrollTop = 0;
  if (typeof modal.scrollTo === 'function') {
    modal.scrollTo({ top: 0, left: 0 });
  }

  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.scrollTop = 0;
    if (typeof modalContent.scrollTo === 'function') {
      modalContent.scrollTo({ top: 0, left: 0 });
    }
  }
}

function focusModalTop(modal) {
  if (!modal) return;

  requestAnimationFrame(() => {
    modal.focus({ preventScroll: true });
    resetModalScroll(modal);
  });
}

function prepareModalButtons(modal) {
  const closeButton = modal.querySelector('.close-modal-btn');
  if (closeButton) {
    closeButton.setAttribute('tabindex', '-1');
    closeButton.autofocus = false;
  }
}

function bindModalCards(selector) {
  document.querySelectorAll(selector).forEach(card => {
    const modalId = card.dataset.modal;
    const modal = modalId ? document.getElementById(modalId) : null;

    if (!modal) return;

    prepareModalButtons(modal);

    modal.addEventListener('close', () => {
      resetModalScroll(modal);
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    });

    card.addEventListener('click', () => {
      resetModalScroll(modal);
      modal.showModal();
      focusModalTop(modal);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        resetModalScroll(modal);
        modal.showModal();
        focusModalTop(modal);
      }
    });
  });
}

function bindCloseButtons() {
  document.querySelectorAll('.close-modal-btn').forEach(button => {
    button.setAttribute('tabindex', '-1');
    button.autofocus = false;
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      if (dialog) {
        dialog.close();
        resetModalScroll(dialog);
        button.blur();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('js/json/es.json')
    .then(response => response.json())
    .then(data => {
      const stats = document.querySelectorAll('.stat-number');

      stats.forEach(el => {
        const keyPath = el.getAttribute('data-key').split('.');
        let val = data;
        keyPath.forEach(k => val = val ? val[k] : null);

        const metric = parseMetricValue(val || '');
        if (val && metric) {
          animateCounter(el, metric.number, metric.suffix);
        }
      });

      document.querySelectorAll('[data-key]').forEach(el => {
        if (el.classList.contains('stat-number')) return;

        const keyPath = el.getAttribute('data-key').split('.');
        let val = data;
        keyPath.forEach(k => val = val ? val[k] : null);
        if (val) el.textContent = val;
      });

      const solutionGrid = document.getElementById('solution-grid');
      const solutionModals = document.getElementById('solution-modals');

      if (solutionGrid && data.soluciones && Array.isArray(data.soluciones.items)) {
        solutionGrid.innerHTML = data.soluciones.items.map(item => `
          <article class="solution-card" data-modal="modal-solution-${item.id}" role="button" tabindex="0">
            <img src="${item.image}" alt="${item.titulo}">
            <div class="solution-card__content">
              <h3>${item.titulo}</h3>
              <p>${item.resumen}</p>
            </div>
          </article>
        `).join('');

        if (solutionModals) {
          solutionModals.innerHTML = data.soluciones.items.map(item => `
            <dialog id="modal-solution-${item.id}" class="custom-modal">
              <div class="modal-content">
                <h3>${item.titulo}</h3>
                <p class="subtitle">${item.descripcion}</p>
                <ul>
                  <li><strong>Beneficios:</strong> <span>${item.beneficios}</span></li>
                  <li><strong>Aplicaciones:</strong> <span>${item.aplicaciones}</span></li>
                  <li><strong>Valor diferencial:</strong> <span>${item.diferencial}</span></li>
                </ul>
                <p class="modal-footer-note">${item.nota}</p>
                <button class="close-modal-btn" type="button">Cerrar</button>
              </div>
            </dialog>
          `).join('');
        }
      }

      const phoneEl = document.getElementById('link-phone');
      const emailEl = document.getElementById('link-email');

      if (phoneEl && data.contacto_rapido.telefono) {
        phoneEl.href = `tel:${data.contacto_rapido.telefono.replace(/\s+/g, '')}`;
      }
      if (emailEl && data.contacto_rapido.email) {
        emailEl.href = `mailto:${data.contacto_rapido.email}`;
      }

      bindModalCards('.solution-card');
      bindCloseButtons();
    })
    .catch(err => console.error('Error carregant es.json:', err));

  bindModalCards('.service-card');
  bindCloseButtons();
});