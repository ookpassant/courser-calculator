/* ============================================================
   Bloodline — app shell (Phases 1–4, client-only, no accounts)
   ------------------------------------------------------------
   breeding-calculator.js stays the genetics engine & source of
   truth. This shell adds: top-nav routing + landing page,
   toasts, an offline indicator, a localStorage-backed collection
   (manager, editor, CSV import wizard + export), "From
   Collection" parent pickers, copy-to-clipboard, real-time
   genotype validation, and recent-search history.

   Exposes window.AppShell, which the engine calls into via
   small, optional hooks (so the engine never hard-depends on it).
   ============================================================ */
(function () {
  'use strict';

  // ---- storage keys --------------------------------------------------------
  const K_COLLECTION = 'bloodline.collection.v1';
  const K_QUERIES = 'bloodline.queries.v1';
  const MAX_RECENT = 8;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // =========================================================================
  // Persistence
  // =========================================================================
  const Store = {
    load(key, fallback) {
      try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
      catch (e) { return fallback; }
    },
    save(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); return true; }
      catch (e) { toast('Could not save to local storage (it may be full or disabled).', 'error'); return false; }
    }
  };

  // The working collection lives here and is mirrored into the engine.
  let collection = [];

  function persistCollection() { Store.save(K_COLLECTION, collection); }
  function pushToEngine() { if (window.applyCollection) window.applyCollection(collection); }

  function setCollection(arr, opts) {
    opts = opts || {};
    collection = Array.isArray(arr) ? arr.slice() : [];
    pushToEngine();
    if (opts.persist !== false) persistCollection();
    renderCollection();
    populateParentPickers();
  }

  // =========================================================================
  // Toasts
  // =========================================================================
  function toast(message, type, ttl) {
    const wrap = $('#toastContainer');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'success');
    el.setAttribute('role', 'status');
    el.innerHTML = `<span class="toast-msg">${esc(message)}</span><button class="toast-x" aria-label="Dismiss">&times;</button>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    const kill = () => {
      el.classList.remove('in');
      setTimeout(() => el.remove(), 200);
    };
    el.querySelector('.toast-x').addEventListener('click', kill);
    setTimeout(kill, ttl || (type === 'error' ? 6000 : 4000));
  }

  // =========================================================================
  // Routing: views (landing | app) + areas within the app
  // =========================================================================
  const AREAS = {
    calculator: { label: 'Foal Generator', crumb: 'Breeding Calculator' },
    collection: { label: 'Collection', crumb: 'Collection' },
    search: { label: 'Smart Search', crumb: 'Smart Search' },
    scroll: { label: 'Scroll Generator', crumb: 'Scroll Generator' }
  };

  function showView(view) {
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showArea(area) {
    if (!AREAS[area]) area = 'calculator';
    showView('app');
    $$('.area').forEach(a => a.classList.toggle('active', a.id === 'area-' + area));
    $$('.nav-link[data-area]').forEach(l => l.classList.toggle('active', l.dataset.area === area));
    const crumb = $('#breadcrumbCurrent');
    if (crumb) crumb.textContent = AREAS[area].crumb;
    if (area === 'collection') renderCollection();
    if (area === 'search') renderRecentQueries();
    if (area === 'calculator') populateParentPickers();
  }

  // Legacy shim the engine calls (fillParents -> 'foals', fillChimera -> 'chimera')
  function switchTab(tabName) {
    if (tabName === 'chimera') { openChimeraModal(); return; }
    const map = { foals: 'calculator', search: 'search', scroll: 'scroll' };
    showArea(map[tabName] || tabName);
  }

  // =========================================================================
  // Offline indicator
  // =========================================================================
  function refreshOnline() {
    const dot = $('#offlineIndicator');
    if (!dot) return;
    const off = !navigator.onLine;
    dot.classList.toggle('is-offline', off);
    dot.textContent = off ? '● Offline — working from cache' : '● Online';
  }

  // =========================================================================
  // Genotype validation (lenient, real-time hint — not a hard gate)
  // =========================================================================
  function validateGenotype(str) {
    const s = (str || '').trim();
    if (!s) return { ok: false, error: 'Genotype is required.' };
    const core = s.split('+')[0];
    const hasE = /\b[Ee]{1,2}\b/.test(core);
    const hasA = /\b[Aa]{1,2}\b/.test(core);
    if (!hasE || !hasA) {
      return { ok: false, error: 'Expected a base coat — an E/e and an A/a pair (e.g. "Ee Aa …").' };
    }
    return { ok: true };
  }

  function wireLiveValidation(textareaSel, hintSel) {
    const ta = $(textareaSel), hint = $(hintSel);
    if (!ta || !hint) return;
    const run = () => {
      const v = validateGenotype(ta.value);
      if (!ta.value.trim()) { hint.textContent = ''; ta.classList.remove('invalid', 'valid'); return; }
      hint.textContent = v.ok ? '✓ Looks like a valid genotype' : v.error;
      hint.className = 'geno-hint ' + (v.ok ? 'ok' : 'bad');
      ta.classList.toggle('invalid', !v.ok);
      ta.classList.toggle('valid', v.ok);
    };
    ta.addEventListener('input', run);
  }

  // =========================================================================
  // Collection Manager
  // =========================================================================
  function renderCollection() {
    const host = $('#collectionList');
    if (!host) return;
    const countEl = $('#collCount');
    if (countEl) countEl.textContent = collection.length;

    const q = ($('#collSearch') && $('#collSearch').value || '').toLowerCase().trim();
    const sort = $('#collSort') && $('#collSort').value || 'name';

    let rows = collection.slice();
    if (q) {
      rows = rows.filter(h =>
        (h.name || '').toLowerCase().includes(q) ||
        (h.genotype || '').toLowerCase().includes(q) ||
        (h.temperament || '').toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      if (sort === 'id') return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
      if (sort === 'recent') return 0; // insertion order already reflects "recent"
      return String(a.name).localeCompare(String(b.name));
    });
    if (sort === 'recent') rows.reverse();

    if (!collection.length) {
      host.innerHTML = `
        <div class="empty-state">
          <p>Your stable is empty.</p>
          <p class="subtitle">Import a CSV or add a horse to get started.
            <a href="https://docs.google.com/spreadsheets/d/1WfCvxwtGRvoDcYXX9mAd5nryJpodRJ-g96eJ3yesQ9E/edit?usp=sharing" target="_blank" rel="noopener">Grab the Google Sheets template.</a>
          </p>
        </div>`;
      return;
    }
    if (!rows.length) { host.innerHTML = `<div class="empty-state"><p>No horses match "${esc(q)}".</p></div>`; return; }

    host.innerHTML = rows.map(h => {
      const idx = collection.indexOf(h);
      const temp = (h.temperament || '').toLowerCase();
      const variant = h.variant && h.variant !== 'Standard' ? `<span class="variant-badge">${esc(h.variant)}</span>` : '';
      return `
        <div class="horse-row">
          <div class="horse-main">
            <div class="horse-name">${esc(h.name)} ${variant}</div>
            <div class="horse-meta">#${esc(h.id)} · <span class="temp-badge temp-${esc(temp)}">${esc(h.temperament)}</span></div>
            <code class="horse-geno">${esc(h.genotype)}</code>
          </div>
          <div class="horse-actions">
            <button class="icon-btn" data-edit="${idx}" title="Edit">Edit</button>
            <button class="icon-btn danger" data-del="${idx}" title="Delete">Delete</button>
          </div>
        </div>`;
    }).join('');
  }

  // =========================================================================
  // Horse Editor (slide-over)
  // =========================================================================
  let editIndex = -1;

  function openEditor(index) {
    editIndex = (typeof index === 'number') ? index : -1;
    const h = editIndex >= 0 ? collection[editIndex] : { id: '', name: '', genotype: '', temperament: '', variant: 'Standard' };
    $('#editorTitle').textContent = editIndex >= 0 ? 'Edit Horse' : 'Add Horse';
    $('#edId').value = h.id || '';
    $('#edName').value = h.name || '';
    $('#edGeno').value = h.genotype || '';
    $('#edTemp').value = h.temperament || '';
    $('#edVariant').value = h.variant || 'Standard';
    $('#edDelete').style.display = editIndex >= 0 ? 'inline-block' : 'none';
    $('#editorHint').textContent = '';
    $('#editorOverlay').classList.add('open');
    $('#edName').focus();
  }
  function closeEditor() { $('#editorOverlay').classList.remove('open'); editIndex = -1; }

  function saveEditor() {
    const name = $('#edName').value.trim();
    const geno = $('#edGeno').value.trim();
    if (!name) { $('#editorHint').textContent = 'Name is required.'; return; }
    const v = validateGenotype(geno);
    if (!v.ok) { $('#editorHint').textContent = v.error; return; }
    const horse = {
      id: $('#edId').value.trim() || name,
      name,
      genotype: geno,
      temperament: $('#edTemp').value || '',
      variant: $('#edVariant').value || 'Standard'
    };
    if (editIndex >= 0) { collection[editIndex] = horse; toast('Horse updated.', 'success'); }
    else { collection.push(horse); toast('Horse added to your stable.', 'success'); }
    setCollection(collection);
    closeEditor();
  }

  function deleteFromEditor() {
    if (editIndex < 0) return;
    const h = collection[editIndex];
    if (!confirm(`Delete "${h.name}" from your collection? This can't be undone.`)) return;
    collection.splice(editIndex, 1);
    setCollection(collection);
    toast('Horse removed.', 'success');
    closeEditor();
  }

  // =========================================================================
  // CSV import wizard + export
  // =========================================================================
  let wizardHorses = [];

  function openWizard() {
    wizardHorses = [];
    gotoStep(1);
    $('#wizFile').value = '';
    $('#wizPreview').innerHTML = '';
    $('#wizardOverlay').classList.add('open');
  }
  function closeWizard() { $('#wizardOverlay').classList.remove('open'); }
  function gotoStep(n) {
    $$('.wiz-step').forEach(s => s.classList.toggle('active', Number(s.dataset.step) === n));
    $$('.wiz-dot').forEach(d => d.classList.toggle('active', Number(d.dataset.step) <= n));
  }

  function handleWizardFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => previewCSV(e.target.result);
    reader.readAsText(file);
  }

  function previewCSV(text) {
    const parsed = window.parseHorsesCSV ? window.parseHorsesCSV(text) : { horses: [], headerDetected: false };
    const rows = parsed.horses;
    // Validate each row's genotype for a friendly error list.
    let bad = 0;
    const preview = rows.map(h => {
      const v = validateGenotype(h.genotype);
      if (!v.ok) bad++;
      return { h, v };
    });
    wizardHorses = rows; // we still import all rows; invalid ones just flagged

    $('#wizDetect').textContent = parsed.headerDetected
      ? 'Header row detected — mapping by column name.'
      : 'No header row — assuming order: ID, Name, Genotype, Temperament, Variant.';
    $('#wizCount').textContent = rows.length;
    $('#wizBad').textContent = bad;
    $('#wizBadWrap').style.display = bad ? 'block' : 'none';

    $('#wizPreview').innerHTML = preview.slice(0, 50).map(({ h, v }) => `
      <tr class="${v.ok ? '' : 'row-bad'}">
        <td>${esc(h._row)}</td><td>${esc(h.name)}</td>
        <td><code>${esc(h.genotype)}</code></td>
        <td>${esc(h.temperament)}</td>
        <td>${v.ok ? '✓' : '⚠ ' + esc(v.error)}</td>
      </tr>`).join('');

    if (!rows.length) { toast('No valid horse rows found in that CSV.', 'error'); return; }
    gotoStep(2);
  }

  function confirmImport() {
    const mode = $('input[name="wizMode"]:checked');
    const replace = !mode || mode.value === 'replace';
    if (replace) setCollection(wizardHorses);
    else setCollection(collection.concat(wizardHorses));
    $('#wizDone').textContent = `${wizardHorses.length} horse(s) ${replace ? 'imported' : 'added'}.`;
    gotoStep(3);
    toast(`${wizardHorses.length} horse(s) ${replace ? 'imported' : 'added'}.`, 'success');
  }

  function exportCSV() {
    if (!collection.length) { toast('Nothing to export — your stable is empty.', 'error'); return; }
    const head = 'ID,Name,Genotype,Temperament,Variant';
    const cell = (s) => {
      s = String(s == null ? '' : s);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const body = collection.map(h => [h.id, h.name, h.genotype, h.temperament, h.variant].map(cell).join(',')).join('\n');
    const blob = new Blob([head + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bloodline-collection.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('Collection exported as CSV.', 'success');
  }

  // =========================================================================
  // "From Collection" parent pickers (calculator area)
  // =========================================================================
  function populateParentPickers() {
    ['1', '2'].forEach(n => {
      const sel = $('#parent' + n + 'FromColl');
      if (!sel) return;
      const cur = sel.value;
      sel.innerHTML = '<option value="">— pick from collection —</option>' +
        collection.map((h, i) => `<option value="${i}">${esc(h.name)} (${esc(h.temperament)})</option>`).join('');
      if (cur && Number(cur) < collection.length) sel.value = cur;
      $$('.parent-source-row').forEach(r => { r.style.display = collection.length ? '' : 'none'; });
    });
  }

  function fillParentFromCollection(n, idx) {
    const h = collection[Number(idx)];
    if (!h) return;
    $('#parent' + n + 'Name').value = h.name || '';
    $('#parent' + n + 'Geno').value = h.genotype || '';
    $('#parent' + n + 'Temp').value = h.temperament || '';
    $('#parent' + n + 'Variant').value = h.variant || 'Standard';
    const ta = $('#parent' + n + 'Geno');
    if (ta) ta.dispatchEvent(new Event('input'));
  }

  // =========================================================================
  // Recent queries (Smart Search)
  // =========================================================================
  function recordQuery(q, count) {
    let recent = Store.load(K_QUERIES, []);
    recent = recent.filter(r => r.q !== q);
    recent.unshift({ q, count, ts: Date.now() });
    recent = recent.slice(0, MAX_RECENT);
    Store.save(K_QUERIES, recent);
    renderRecentQueries();
  }

  function renderRecentQueries() {
    const host = $('#recentQueries');
    if (!host) return;
    const recent = Store.load(K_QUERIES, []);
    if (!recent.length) { host.innerHTML = ''; return; }
    host.innerHTML = '<span class="recent-label">Recent:</span> ' + recent.map(r =>
      `<button class="chip" data-query="${esc(r.q)}">${esc(r.q)} <span class="chip-count">${r.count}</span></button>`).join('');
  }

  // =========================================================================
  // Chimera modal (Phase 3): the engine fills #chimera* fields & opens this
  // =========================================================================
  function openChimeraModal() { $('#chimeraModal').classList.add('active'); }
  function closeChimeraModal() { $('#chimeraModal').classList.remove('active'); }

  // =========================================================================
  // Wiring
  // =========================================================================
  function wire() {
    // Nav
    $$('.nav-link[data-area]').forEach(l =>
      l.addEventListener('click', (e) => { e.preventDefault(); showArea(l.dataset.area); }));
    $$('[data-nav]').forEach(b =>
      b.addEventListener('click', (e) => {
        e.preventDefault();
        const t = b.dataset.nav;
        if (t === 'landing') showView('landing'); else showArea(t);
      }));

    // Collection toolbar
    const cs = $('#collSearch'); if (cs) cs.addEventListener('input', renderCollection);
    const cso = $('#collSort'); if (cso) cso.addEventListener('change', renderCollection);
    on('#collAdd', () => openEditor());
    on('#collImport', openWizard);
    on('#collExport', exportCSV);

    // Delegated edit/delete in the list
    const list = $('#collectionList');
    if (list) list.addEventListener('click', (e) => {
      const ed = e.target.closest('[data-edit]'); const del = e.target.closest('[data-del]');
      if (ed) openEditor(Number(ed.dataset.edit));
      else if (del) {
        const i = Number(del.dataset.del); const h = collection[i];
        if (h && confirm(`Delete "${h.name}"? This can't be undone.`)) {
          collection.splice(i, 1); setCollection(collection); toast('Horse removed.', 'success');
        }
      }
    });

    // Editor
    on('#edSave', saveEditor);
    on('#edCancel', closeEditor);
    on('#edDelete', deleteFromEditor);
    on('#editorClose', closeEditor);
    $('#editorOverlay').addEventListener('click', (e) => { if (e.target.id === 'editorOverlay') closeEditor(); });
    wireLiveValidation('#edGeno', '#editorHint');

    // Wizard
    const wf = $('#wizFile'); if (wf) wf.addEventListener('change', (e) => handleWizardFile(e.target.files[0]));
    on('#wizConfirm', confirmImport);
    on('#wizClose', closeWizard);
    on('#wizDoneBtn', () => { closeWizard(); showArea('collection'); });
    on('#wizBack', () => gotoStep(1));
    const dz = $('#wizDrop');
    if (dz) {
      ['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
      dz.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) handleWizardFile(e.dataTransfer.files[0]); });
      dz.addEventListener('click', () => wf && wf.click());
    }
    $('#wizardOverlay').addEventListener('click', (e) => { if (e.target.id === 'wizardOverlay') closeWizard(); });

    // From-collection pickers
    ['1', '2'].forEach(n => {
      const sel = $('#parent' + n + 'FromColl');
      if (sel) sel.addEventListener('change', () => { if (sel.value !== '') fillParentFromCollection(n, sel.value); });
    });

    // Recent query chips
    const rq = $('#recentQueries');
    if (rq) rq.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-query]');
      if (chip) { $('#breedingQuery').value = chip.dataset.query; if (window.searchBreeding) window.searchBreeding(); }
    });

    // Chimera modal close + open-empty button
    on('#chimeraClose', closeChimeraModal);
    on('#openChimera', () => { openChimeraModal(); });
    $('#chimeraModal').addEventListener('click', (e) => { if (e.target.id === 'chimeraModal') closeChimeraModal(); });

    // Copy-to-clipboard (delegated) for any .geno-copy
    document.addEventListener('click', (e) => {
      const g = e.target.closest('.geno-copy');
      if (!g) return;
      const text = g.dataset.geno || g.textContent.replace('⧉', '').trim();
      copyText(text);
    });

    // Live validation on the foal-generator parent fields
    wireLiveValidation('#parent1Geno', '#parent1GenoHint');
    wireLiveValidation('#parent2Geno', '#parent2GenoHint');

    // Esc closes overlays
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeEditor(); closeWizard(); closeChimeraModal(); }
    });

    // Online/offline
    window.addEventListener('online', refreshOnline);
    window.addEventListener('offline', refreshOnline);
  }

  function on(sel, fn) { const el = $(sel); if (el) el.addEventListener('click', fn); }

  function copyText(text) {
    const done = () => toast('Genotype copied to clipboard.', 'success', 2500);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else { fallbackCopy(text, done); }
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed.', 'error'); }
    ta.remove();
  }

  // =========================================================================
  // Init
  // =========================================================================
  function init() {
    // Pull any saved collection into the engine + UI.
    setCollection(Store.load(K_COLLECTION, []), { persist: false });
    renderRecentQueries();
    refreshOnline();
    wire();

    // First-time visitors land on the landing page; returning users with a
    // stable go straight to the calculator.
    showView('landing');

    // Service worker for offline.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {/* offline is best-effort */});
    }
  }

  // Public surface the engine hooks into.
  window.AppShell = {
    switchTab,
    showArea,
    showView,
    toast,
    recordQuery,
    openChimeraModal,
    onCollectionChanged: function (arr, opts) {
      // Engine called us after a CSV parse — adopt its array, persist, render.
      collection = Array.isArray(arr) ? arr.slice() : [];
      if (!opts || opts.persist !== false) persistCollection();
      renderCollection();
      populateParentPickers();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
