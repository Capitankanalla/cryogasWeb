document.addEventListener('DOMContentLoaded', () => {
  fetch('js/json/es.json')
    .then(response => response.json())
    .then(data => {
      // Carrega el text als elements amb data-key
      document.querySelectorAll('[data-key]').forEach(el => {
        const keyPath = el.getAttribute('data-key').split('.');
        let val = data;
        keyPath.forEach(k => val = val ? val[k] : null);
        if (val) el.textContent = val;
      });

      // Configura els enllaços directes de telèfon i email
      const phoneEl = document.getElementById('link-phone');
      const emailEl = document.getElementById('link-email');
      
      if (phoneEl && data.contacto_rapido.telefono) {
        phoneEl.href = `tel:${data.contacto_rapido.telefono.replace(/\s+/g, '')}`;
      }
      if (emailEl && data.contacto_rapido.email) {
        emailEl.href = `mailto:${data.contacto_rapido.email}`;
      }
    })
    .catch(err => console.error('Error carregant es.json:', err));
});