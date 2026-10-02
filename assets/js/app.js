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

  const normalize = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñü\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokenize = (value) => normalize(value).split(' ').filter((token) => token.length > 2);

  const answerFromKnowledge = (knowledge, question) => {
    const normalized = normalize(question);
    const tokens = tokenize(question);
    if (!normalized) return 'Escribe una pregunta sobre SentinelID, IAM, Okta, Entra ID, identidades, accesos o auditoría.';
    if (/^(hola|buenas|buenos dias|buenas tardes|hey|que tal)/.test(normalized)) {
      return 'Hola. Puedo orientarte sobre el propósito del portal, sus módulos, integraciones, auditoría y el alcance del prototipo.';
    }

    const faq = knowledge?.faq || [];
    let best = null;
    let bestScore = 0;
    faq.forEach((item) => {
      const haystack = tokenize(`${item.question} ${item.answer}`);
      const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = item; }
    });
    if (best && bestScore >= Math.min(2, Math.max(1, tokens.length))) return best.answer;

    const entity = knowledge?.entity || {};
    const source = knowledge?.sourceRecord || {};
    if (/(que es|para que sirve|objetivo|sentinelid|portal|proyecto)/.test(normalized)) {
      return entity.directAnswer || entity.description;
    }
    if (/(okta|entra|integracion|mcp|api)/.test(normalized)) {
      return 'La primera integración prevista es Okta mediante APIs/MCP. La arquitectura queda preparada para Microsoft Entra ID e Identity Governance; esta versión pública todavía usa datos sintéticos.';
    }
    if (/(modulo|pagina|dashboard|identidad|usuario|grupo|aplicacion|acceso|auditoria)/.test(normalized)) {
      return 'El portal cubre Dashboard, Identidades, Grupos, Aplicaciones, Asistente IA, Auditoría e Integraciones. Puedes explorar cada módulo desde el menú principal.';
    }
    if (/(real|credencial|tenant|dato|sintet)/.test(normalized)) {
      return 'No. El prototipo usa identidades sintéticas y no contiene credenciales ni conexión a un tenant real.';
    }
    if (/(cambiar|modificar|ejecutar|alta|baja|permiso|privilegio)/.test(normalized)) {
      return 'El MVP es principalmente consultivo. Una acción sensible debe requerir rol, aprobación, registro, controles de riesgo y supervisión humana.';
    }
    if (/(seguridad|politica|control|trazabilidad|registro)/.test(normalized)) {
      return 'SentinelID prioriza resultados explicables, registro de consultas, control humano y separación entre consultar información y ejecutar cambios.';
    }
    if (/(noticia|actualidad|feed|fuente|rss)/.test(normalized)) {
      return 'Puedes consultar la sección Noticias IAM para ver titulares recientes de fuentes externas como Infosecurity Magazine, Microsoft Security Blog y CISA.';
    }
    if (source.businessDescription) {
      return 'Puedo ayudarte con el propósito del portal, sus módulos, Okta, Entra ID, auditoría y el alcance del MVP. Prueba una pregunta más específica.';
    }
    return 'Puedo orientarte sobre SentinelID, sus módulos IAM, integraciones, datos sintéticos y controles de auditoría.';
  };

  const loadKnowledge = (() => {
    let promise;
    return () => {
      if (!promise) promise = fetch('knowledge.json', {cache: 'no-store'}).then((res) => res.ok ? res.json() : {}).catch(() => ({}));
      return promise;
    };
  })();

  const appendMessage = (stream, text, role = 'bot') => {
    if (!stream) return;
    const message = document.createElement('div');
    message.className = role === 'user' ? 'bubble user' : 'bubble';
    message.textContent = text;
    stream.append(message);
    stream.scrollTo({top: stream.scrollHeight, behavior: 'smooth'});
  };

  const askAssistant = async (question, stream) => {
    const value = question.trim(); if (!value) return;
    appendMessage(stream, value, 'user');
    appendMessage(stream, 'Estoy revisando la información del portal…');
    const knowledge = await loadKnowledge();
    const pending = stream?.lastElementChild;
    if (pending) pending.textContent = answerFromKnowledge(knowledge, value);
    stream?.scrollTo({top: stream.scrollHeight, behavior: 'smooth'});
  };

  const loadNews = async () => {
    const grid = $('#news-grid'); const status = $('#news-status');
    if (!grid) return;
    try {
      const response = await fetch('/api/noticias', {cache: 'no-store'});
      if (!response.ok) throw new Error('news request failed');
      const data = await response.json();
      grid.replaceChildren();
      (data.items || []).forEach((item) => {
        const card = document.createElement('article'); card.className = 'card news-card';
        const meta = document.createElement('div'); meta.className = 'news-meta';
        const source = document.createElement('span'); source.textContent = item.sourceName || 'Fuente externa';
        const date = document.createElement('time'); date.dateTime = item.publishedAt || '';
        const parsed = item.publishedAt ? new Date(item.publishedAt) : null;
        date.textContent = parsed && !Number.isNaN(parsed.getTime()) ? new Intl.DateTimeFormat('es-MX', {dateStyle: 'medium'}).format(parsed) : 'Fecha no indicada';
        meta.append(source, date);
        const heading = document.createElement('h3'); heading.textContent = item.title;
        const copy = document.createElement('p'); copy.textContent = 'Consulta la publicación completa en su fuente original.';
        const link = document.createElement('a'); link.className = 'external-link'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Leer en ' + (item.sourceName || 'la fuente') + ' →';
        card.append(meta, heading, copy, link); grid.append(card);
      });
      if (!data.items?.length) throw new Error('no news items');
      if (status) status.textContent = 'Titulares actualizados desde fuentes externas. Cada enlace abre el artículo original.';
    } catch {
      if (status) status.textContent = 'No fue posible consultar las fuentes en este momento. Puedes abrirlas desde la sección de fuentes.';
      if (grid) { const error = document.createElement('div'); error.className = 'notice news-error'; error.textContent = 'Las fuentes externas pueden limitar temporalmente sus feeds. El resto del portal sigue disponible.'; grid.append(error); }
    }
  };
  loadNews();

  const chat = $('#assistant-form');
  chat?.addEventListener('submit', (e) => {
    e.preventDefault(); const input = $('#assistant-input'); const value = input?.value.trim(); if (!value) return;
    askAssistant(value, $('#chat-stream')); if (input) input.value = '';
  });

  const buildSiteAssistant = () => {
    if ($('#site-assistant') || $('#assistant-form')) return;
    const root = document.createElement('div');
    root.id = 'site-assistant'; root.className = 'site-assistant';
    root.innerHTML = `<button class="site-assistant-toggle" type="button" aria-expanded="false" aria-controls="site-assistant-panel"><span aria-hidden="true">✦</span><span>Asesoría IAM</span></button>
      <section class="site-assistant-panel" id="site-assistant-panel" aria-label="Asesoría IAM" hidden>
        <div class="site-assistant-head"><div><strong>Sentinel Assistant</strong><small>Orientación sobre el portal</small></div><button type="button" class="site-assistant-close" aria-label="Cerrar asesoría">×</button></div>
        <div class="site-assistant-stream" role="log" aria-live="polite"><div class="bubble">Puedo orientarte sobre SentinelID, IAM, integraciones, accesos y auditoría.</div></div>
        <form class="site-assistant-form"><label class="sr-only" for="site-assistant-input">Escribir una pregunta</label><input id="site-assistant-input" autocomplete="off" placeholder="Escribe tu pregunta"><button class="btn" type="submit">Enviar</button></form>
        <p class="site-assistant-note">Respuestas basadas en el prototipo y sus datos públicos.</p>
      </section>`;
    document.body.append(root);
    const toggle = $('.site-assistant-toggle', root); const panel = $('.site-assistant-panel', root);
    const close = $('.site-assistant-close', root); const form = $('.site-assistant-form', root); const input = $('#site-assistant-input', root); const stream = $('.site-assistant-stream', root);
    const setOpen = (open) => { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); if (open) input?.focus(); };
    toggle.addEventListener('click', () => setOpen(panel.hidden)); close.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', (e) => { e.preventDefault(); const value = input.value.trim(); if (!value) return; askAssistant(value, stream); input.value = ''; });
  };
  buildSiteAssistant();

  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await navigator.clipboard.writeText(btn.dataset.copy); toast('Copiado al portapapeles.'); }
    catch { toast('No fue posible copiar automáticamente.'); }
  }));
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
