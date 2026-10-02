(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const toast = (message) => {
    const el = $('#toast'); if (!el) return;
    el.textContent = message; el.classList.add('show');
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => el.classList.remove('show'), 3600);
  };

  const menu = $('#site-nav');
  $('#menu-toggle')?.addEventListener('click', (e) => {
    const open = menu?.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(Boolean(open)));
  });

  $$('.faq-question').forEach((btn) => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item'); const open = item.dataset.open === 'true';
    item.dataset.open = String(!open); btn.setAttribute('aria-expanded', String(!open));
  }));

  $$('form[data-demo]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = form.dataset.message || 'Solicitud registrada en esta demostración.';
    toast(msg + ' Para producción se debe conectar el flujo a correo, CRM, API o base de datos.');
    form.reset();
  }));

  const search = $('#catalog-search');
  const filters = $$('[data-filter], #catalog-category');
  const filterCatalog = () => {
    if (!search && !filters.length) return;
    const q = (search?.value || '').toLowerCase().trim(); let shown = 0;
    $$('[data-search]').forEach((card) => {
      const okQ = !q || (card.dataset.search || '').includes(q);
      const okFilters = filters.every((control) => {
        const value = (control.value || 'all').toLowerCase();
        if (value === 'all') return true;
        const field = control.dataset.filter || 'category';
        const actual = (card.dataset[field] || '').toLowerCase();
        if (field === 'price') {
          const price = Number(card.dataset.priceValue || 0);
          const [min, max] = value.split('-').map(Number);
          return price >= min && (!max || price <= max);
        }
        return actual.split('|').includes(value) || actual.includes(value);
      });
      card.hidden = !(okQ && okFilters); if (!card.hidden) shown++;
    });
    const empty = $('#catalog-empty'); if (empty) empty.style.display = shown ? 'none' : 'block';
  };
  search?.addEventListener('input', filterCatalog);
  filters.forEach((el) => el.addEventListener('change', filterCatalog));
  filterCatalog();

  $$('[data-action]').forEach((btn) => btn.addEventListener('click', (e) => {
    if (btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') return;
    e.preventDefault();
    toast(btn.dataset.message || 'Acción demostrativa registrada.');
  }));

  const calc = $('#quote-calculator');
    const recalc = () => {
    if (!calc) return;
    const mode = calc.dataset.mode || 'quote';
    const result = $('#calc-result'); const detail = $('#calc-detail');
    if (!result) return;
    if (mode === 'flatfee') {
      const order = Number($('#calc-order')?.value || 0);
      const fee = Number(calc.dataset.flatFee || 2.5);
      result.textContent = '$' + fee.toFixed(2);
      if (detail) detail.textContent = order ? `Orden demo: $${order.toFixed(2)} · tarifa fija, no porcentual.` : 'Ingrese un valor de orden para visualizar el ejemplo.';
      return;
    }
    if (mode === 'triage') {
      const pages = Math.max(0, Number($('#calc-pages')?.value || 0));
      const complexity = Number($('#calc-complexity')?.value || 1);
      const sources = Number($('#calc-sources')?.value || 1);
      const hours = Math.max(1, Math.ceil((pages / 18) * complexity + sources * .65));
      result.textContent = `${hours} h aprox.`;
      if (detail) detail.textContent = 'Estimación de revisión humana; no representa una promesa, dictamen ni automatización sin supervisión.';
      return;
    }
    if (mode === 'audit') {
      const amount = Math.max(0, Number($('#calc-amount')?.value || 0));
      const factor = Number($('#calc-service')?.value || 0);
      const scenario = amount * factor;
      result.textContent = factor ? '$' + scenario.toLocaleString('es-EC', {maximumFractionDigits: 2}) : 'A definir';
      if (detail) detail.textContent = 'Escenario didáctico con factor ilustrativo; confirme normativa, fechas y situación concreta con un profesional.';
      return;
    }
    const base = Number($('#calc-service')?.value || 0);
    const size = Number($('#calc-size')?.value || 1);
    const urgency = Number($('#calc-urgency')?.value || 1);
    const total = Math.round(base * size * urgency);
    result.textContent = total ? '$' + total.toLocaleString('es-EC') : 'A definir';
  };
  $$('#quote-calculator input, #quote-calculator select').forEach((el) => {
    el.addEventListener('input', recalc); el.addEventListener('change', recalc);
  });
  recalc();

  const chat = $('#assistant-form');
  chat?.addEventListener('submit', (e) => {
    e.preventDefault(); const input = $('#assistant-input'); const value = input?.value.trim(); if (!value) return;
    const stream = $('#chat-stream'); const user = document.createElement('div'); user.className = 'bubble user'; user.textContent = value; stream?.append(user);
    const bot = document.createElement('div'); bot.className = 'bubble';
    bot.textContent = chat.dataset.response || 'Demostración: la consulta se validaría contra permisos, fuentes y políticas antes de ejecutar cualquier acción.';
    stream?.append(bot); input.value = ''; stream?.scrollTo({top: stream.scrollHeight, behavior: 'smooth'});
  });

  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await navigator.clipboard.writeText(btn.dataset.copy); toast('Copiado al portapapeles.'); }
    catch { toast('No fue posible copiar automáticamente.'); }
  }));
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  const buildSiteAssistant = () => {
    if ($('#site-assistant') || $('#assistant-form')) return;
    const root = document.createElement('div');
    root.id = 'site-assistant';
    root.className = 'site-assistant';
    root.innerHTML = '<button class="site-assistant-toggle" type="button" aria-expanded="false" aria-controls="site-assistant-panel"><span aria-hidden="true">✦</span><span>Asesoría IAM</span></button><section class="site-assistant-panel" id="site-assistant-panel" aria-label="Asesoría IAM" hidden><div class="site-assistant-head"><div><strong>Sentinel Assistant</strong><small>Orientación sobre el portal</small></div><button type="button" class="site-assistant-close" aria-label="Cerrar asesoría">×</button></div><div class="site-assistant-stream" role="log" aria-live="polite"><div class="bubble">Puedo orientarte sobre SentinelID, IAM, integraciones, accesos y auditoría.</div></div><form class="site-assistant-form"><label class="sr-only" for="site-assistant-input">Escribir una pregunta</label><input id="site-assistant-input" autocomplete="off" placeholder="Escribe tu pregunta"><button class="btn" type="submit">Enviar</button></form><p class="site-assistant-note">Respuestas basadas en el prototipo y sus datos públicos.</p></section>';
    document.body.append(root);
    const toggle = $('.site-assistant-toggle', root);
    const panel = $('.site-assistant-panel', root);
    const close = $('.site-assistant-close', root);
    const form = $('.site-assistant-form', root);
    const input = $('#site-assistant-input', root);
    const stream = $('.site-assistant-stream', root);
    const knowledgePromise = fetch('knowledge.json', {cache: 'no-store'}).then((res) => res.ok ? res.json() : {}).catch(() => ({}));
    const normalize = (value) => String(value || '').toLowerCase().split('').map((char) => 'abcdefghijklmnopqrstuvwxyzáéíóúüñ0123456789 '.includes(char) ? char : ' ').join('').replaceAll('  ', ' ').trim();
    const answer = async (question) => {
      const q = normalize(question);
      const data = await knowledgePromise;
      const words = q.split(' ').filter((word) => word.length > 2);
      const faq = (data.faq || []).find((item) => words.filter((word) => normalize(item.question + ' ' + item.answer).includes(word)).length >= 2);
      if (faq) return faq.answer;
      if (q.includes('okta') || q.includes('entra') || q.includes('integracion') || q.includes('api')) return 'La primera integración prevista es Okta mediante APIs/MCP. La arquitectura queda preparada para Microsoft Entra ID; esta versión pública todavía usa datos sintéticos.';
      if (q.includes('modulo') || q.includes('pagina') || q.includes('dashboard') || q.includes('identidad') || q.includes('usuario') || q.includes('grupo') || q.includes('aplicacion') || q.includes('acceso') || q.includes('auditoria')) return 'El portal cubre Dashboard, Identidades, Grupos, Aplicaciones, Asistente IA, Auditoría e Integraciones. Puedes explorar cada módulo desde el menú principal.';
      if (q.includes('real') || q.includes('credencial') || q.includes('tenant') || q.includes('dato') || q.includes('sintet')) return 'No. El prototipo usa identidades sintéticas y no contiene credenciales ni conexión a un tenant real.';
      if (q.includes('cambiar') || q.includes('modificar') || q.includes('ejecutar') || q.includes('permiso') || q.includes('privilegio')) return 'El MVP es principalmente consultivo. Una acción sensible debe requerir rol, aprobación, registro, controles de riesgo y supervisión humana.';
      if (q.includes('que es') || q.includes('para que sirve') || q.includes('objetivo') || q.includes('sentinelid') || q.includes('portal') || q.includes('proyecto')) return data.entity?.directAnswer || 'SentinelID convierte preguntas de lenguaje natural en consultas IAM, muestra resultados explicables y registra cada consulta.';
      return 'Puedo orientarte sobre SentinelID, sus módulos IAM, integraciones, datos sintéticos y controles de auditoría. Prueba una pregunta más específica.';
    };
    const addMessage = (text, role) => { const item = document.createElement('div'); item.className = role === 'user' ? 'bubble user' : 'bubble'; item.textContent = text; stream.append(item); stream.scrollTo({top: stream.scrollHeight, behavior: 'smooth'}); return item; };
    const ask = async (value) => { addMessage(value, 'user'); const pending = addMessage('Estoy revisando la información del portal…'); pending.textContent = await answer(value); };
    const setOpen = (open) => { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); if (open) input.focus(); };
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', (event) => { event.preventDefault(); const value = input.value.trim(); if (!value) return; input.value = ''; ask(value); });
  };
  buildSiteAssistant();})();
