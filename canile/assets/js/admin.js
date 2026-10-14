(() => {
  const { db, save, reset, esc, dog, totale, MESI } = CANILE;
  const content = document.getElementById('content');
  const menu = document.getElementById('menu');
  const euro = (n) => `${n.toLocaleString('it-IT')} €`;
  const date = (s) => new Date(s).toLocaleDateString('it-IT');
  const pending = () => db.iscritti.filter((x) => x.pagamento === 'attesa');

  const LABELS = {
    'Homepage': { hero_kicker: 'Occhiello', hero_title: 'Titolo', hero_text: 'Testo introduttivo' },
    'Cani in adozione': { adozione_intro: 'Introduzione', adozione_info: 'Info e appuntamenti' },
    'Chi siamo': { chi_1: 'Paragrafo 1', chi_2: 'Paragrafo 2', chi_3: 'Paragrafo 3' },
    'Dove siamo e volontari': { dove: 'Indirizzo', orari: 'Orari', volontario: 'Diventa volontario', volontario_contatto: 'Contatto volontari' },
    'Donazioni': { dona: 'Introduzione', iban: 'IBAN', paypal: 'PayPal', codice_fiscale: 'Codice fiscale (5x1000)', box_regalo: 'Box regalo' },
    'Adozione a distanza': { distanza: 'Introduzione', distanza_note: 'Nota pagamento', distanza_paypal: 'PayPal adozioni', distanza_email: 'Email adozioni' },
    'Eventi e contatti': { eventi: 'Eventi', telefono: 'Telefono', email: 'Email' },
  };

  const notice = (msg) => `<div class="notice" role="status"><p>${msg}</p></div>`;
  const head = (title, action = '') => `<h1 class="wp-title">${title} ${action}</h1>`;
  const dogOptions = (sel) => db.dogs.map((d) => `<option value="${esc(d.id)}" ${d.id === sel ? 'selected' : ''}>${esc(d.name)}</option>`).join('');

  // ---------- views ----------
  const views = {
    bacheca(_, msg = '') {
      const year = new Date().getFullYear();
      const thisYear = db.iscritti.filter((x) => x.anno === year);
      const paid = db.iscritti.filter((x) => x.pagamento === 'ricevuto');
      const users = new Set(db.iscritti.map((x) => x.email));
      const receipts = db.iscritti.filter((x) => x.ricevuta);
      // rows: dogs open to distance adoption plus any dog that still has sign-ups
      const rows = db.dogs.filter((d) => d.distanza || thisYear.some((x) => x.cane === d.id));
      const cell = (d, i) => thisYear.filter((x) => x.cane === d.id && x.mesi.includes(i));
      const nowM = new Date().getMonth();
      return `${head('Bacheca')}${msg}
        <div class="welcome">
          <h2>Benvenuta nella dashboard del rifugio</h2>
          <p>Le iscrizioni dal modulo del sito arrivano qui in automatico: niente più fogli Google da incrociare.</p>
          <div class="welcome__links"><a class="button button-primary" href="#iscrizioni">Gestisci iscrizioni</a><a href="#cani-nuovo">Aggiungi un cane</a><a href="#testi">Modifica i testi del sito</a></div>
        </div>
        <div class="stats">
          <div class="stat"><span>Sostenitori iscritti</span><strong>${users.size}</strong></div>
          <div class="stat"><span>Iscrizioni ${year}</span><strong>${thisYear.length}</strong></div>
          <div class="stat"><span>Quote ricevute</span><strong>${euro(paid.reduce((n, x) => n + totale(x), 0))}</strong></div>
          <div class="stat stat--warn"><span>In attesa di pagamento</span><strong>${euro(pending().reduce((n, x) => n + totale(x), 0))}</strong><a href="#iscrizioni?pagamento=attesa">${pending().length} da verificare →</a></div>
        </div>
        <div class="postbox">
          <h2>Sinottico adozioni a distanza ${year}</h2>
          <p class="description">Quanti sostenitori coprono ogni cane, mese per mese. Le celle vuote del mese corrente o successivi sono i cani da promuovere.</p>
          <div class="table-scroll"><table class="grid">
            <thead><tr><th>Cane</th>${MESI.map((m, i) => `<th class="${i === nowM ? 'now' : ''}">${m.slice(0, 3)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map((d) => `<tr><th>${esc(d.name)}</th>${MESI.map((m, i) => {
              const c = cell(d, i); const p = c.some((x) => x.pagamento === 'attesa');
              return `<td class="${c.length ? (p ? 'wait' : 'ok') : (i >= nowM ? 'empty' : '')} ${i === nowM ? 'now' : ''}" title="${esc(d.name)} · ${m}: ${c.map((x) => `${x.nome} ${x.cognome}`).join(', ') || 'nessun sostenitore'}">${c.length || ''}</td>`;
            }).join('')}</tr>`).join('')}</tbody>
          </table></div>
          <p class="legend"><span class="ok"></span> coperto e pagato <span class="wait"></span> pagamento in attesa <span class="empty"></span> scoperto</p>
        </div>
        <div class="cols">
          <div class="postbox"><h2>Ultime iscrizioni</h2><ul class="activity">${[...db.iscritti].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5)
            .map((x) => `<li><span>${date(x.data)}</span> <strong>${esc(x.nome)} ${esc(x.cognome)}</strong> adotta ${esc(dog(x.cane).name)} per ${x.mesi.length} mesi</li>`).join('')}</ul></div>
          <div class="postbox"><h2>Ricevute da inviare</h2><ul class="activity">${receipts.map((x) => `<li><strong>${esc(x.nome)} ${esc(x.cognome)}</strong> · ${esc(x.email)} · ${euro(totale(x))}</li>`).join('') || '<li>Nessuna richiesta.</li>'}</ul></div>
        </div>`;
    },

    iscrizioni(params, msg = '') {
      const q = (params.get('q') || '').toLowerCase();
      const cane = params.get('cane') || '';
      const pay = params.get('pagamento') || '';
      const rows = db.iscritti.filter((x) => (!q || `${x.nome} ${x.cognome} ${x.email}`.toLowerCase().includes(q))
        && (!cane || x.cane === cane) && (!pay || x.pagamento === pay)).sort((a, b) => b.data.localeCompare(a.data));
      return `${head('Adozioni a distanza', '<button class="page-title-action" type="button" data-act="csv">Esporta CSV</button>')}${msg}
        <p class="description">Ogni riga è un modulo compilato sul sito. Segna il pagamento quando arriva il bonifico o il PayPal.</p>
        <form class="tablenav" data-filter="iscrizioni">
          <select name="cane"><option value="">Tutti i cani</option>${dogOptions(cane)}</select>
          <select name="pagamento"><option value="">Tutti i pagamenti</option><option value="attesa" ${pay === 'attesa' ? 'selected' : ''}>In attesa</option><option value="ricevuto" ${pay === 'ricevuto' ? 'selected' : ''}>Ricevuto</option></select>
          <input type="search" name="q" value="${esc(q)}" placeholder="Cerca nome o email" aria-label="Cerca">
          <button class="button" type="submit">Filtra</button>
          <span class="count">${rows.length} elementi</span>
        </form>
        <div class="table-scroll"><table class="wp-list">
          <thead><tr><th>Sostenitore</th><th>Cane</th><th>Mesi</th><th>Totale</th><th>Pagamento</th><th>Ricevuta</th><th>Data</th></tr></thead>
          <tbody>${rows.map((x) => `<tr>
            <td><strong>${esc(x.nome)} ${esc(x.cognome)}</strong><br><a href="mailto:${esc(x.email)}">${esc(x.email)}</a>${x.regalo ? `<br><small>🎁 regalo per ${esc(x.regalo)}</small>` : ''}
              <div class="row-actions"><button type="button" data-act="del-entry" data-id="${esc(x.id)}" class="danger">Elimina</button></div></td>
            <td>${esc(dog(x.cane).name)}</td>
            <td><span class="months">${x.mesi.map((i) => MESI[i].slice(0, 3)).join(' ')}</span> <small>${x.anno}</small></td>
            <td>${euro(totale(x))}</td>
            <td><button type="button" class="pill ${x.pagamento === 'ricevuto' ? 'pill--ok' : 'pill--wait'}" data-act="pay" data-id="${esc(x.id)}" title="Clicca per cambiare stato">${x.pagamento === 'ricevuto' ? 'Ricevuto' : 'In attesa'}</button></td>
            <td>${x.ricevuta ? 'Richiesta' : '—'}</td>
            <td>${date(x.data)}</td>
          </tr>`).join('') || '<tr><td colspan="7">Nessuna iscrizione trovata.</td></tr>'}</tbody>
        </table></div>`;
    },

    utenti(_, msg = '') {
      const byEmail = {};
      db.iscritti.forEach((x) => { (byEmail[x.email] ||= []).push(x); });
      const users = Object.entries(byEmail).sort((a, b) => a[1][0].cognome.localeCompare(b[1][0].cognome));
      return `${head('Utenti iscritti')}${msg}
        <p class="description">Chi compila il modulo diventa un utente con accesso all'area riservata, dove vede mesi coperti e stato dei pagamenti.</p>
        <div class="table-scroll"><table class="wp-list">
          <thead><tr><th>Nome</th><th>Cani sostenuti</th><th>Iscrizioni</th><th>Versato</th><th>Da versare</th><th>Situazione</th></tr></thead>
          <tbody>${users.map(([email, list]) => {
            const ok = list.filter((x) => x.pagamento === 'ricevuto').reduce((n, x) => n + totale(x), 0);
            const due = list.filter((x) => x.pagamento === 'attesa').reduce((n, x) => n + totale(x), 0);
            return `<tr>
              <td><strong>${esc(list[0].nome)} ${esc(list[0].cognome)}</strong><br><a href="mailto:${esc(email)}">${esc(email)}</a>
                <div class="row-actions"><a href="#iscrizioni?q=${encodeURIComponent(email)}">Vedi iscrizioni</a></div></td>
              <td>${[...new Set(list.map((x) => dog(x.cane).name))].map(esc).join(', ')}</td>
              <td>${list.length}</td>
              <td>${euro(ok)}</td>
              <td>${due ? `<strong class="warn">${euro(due)}</strong>` : '—'}</td>
              <td>${due ? '<span class="pill pill--wait">Pagamento da verificare</span>' : '<span class="pill pill--ok">In regola</span>'}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>`;
    },

    cani(_, msg = '') {
      return `${head('Cani', '<a class="page-title-action" href="#cani-nuovo">Aggiungi nuovo</a>')}${msg}
        <p class="description">Solo i cani «Disponibile» compaiono sul sito. «Adozione a distanza» li aggiunge alla scelta del modulo.</p>
        <div class="table-scroll"><table class="wp-list wp-list--dogs">
          <thead><tr><th></th><th>Nome</th><th>Dettagli</th><th>Stato</th><th>Adozione a distanza</th></tr></thead>
          <tbody>${db.dogs.map((d) => `<tr>
            <td><img src="${esc(d.image)}" alt="" width="56" height="56"></td>
            <td><strong><a href="#cani-modifica?id=${encodeURIComponent(d.id)}">${esc(d.name)}</a></strong>
              <div class="row-actions"><a href="#cani-modifica?id=${encodeURIComponent(d.id)}">Modifica</a> | <button type="button" class="danger" data-act="del-dog" data-id="${esc(d.id)}">Elimina</button></div></td>
            <td>${esc(d.age)}, ${d.gender === 'M' ? 'maschio' : 'femmina'}, taglia ${esc(d.size)}</td>
            <td><select data-act="stato" data-id="${esc(d.id)}" aria-label="Stato di ${esc(d.name)}">${['disponibile', 'adottato', 'non visibile'].map((s) => `<option ${d.stato === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
            <td><input type="checkbox" data-act="distanza" data-id="${esc(d.id)}" ${d.distanza ? 'checked' : ''} aria-label="Adozione a distanza per ${esc(d.name)}"></td>
          </tr>`).join('')}</tbody>
        </table></div>`;
    },

    'cani-nuovo': () => views['cani-modifica'](new URLSearchParams()),

    'cani-modifica'(params) {
      const d = db.dogs.find((x) => x.id === params.get('id')) || { id: '', name: '', age: 'adulto', gender: 'F', neutered: true, size: 'media', description: '', image: '', stato: 'disponibile', distanza: false, quote: '' };
      const sel = (name, opts, val) => `<select name="${name}">${opts.map(([v, l]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
      return `${head(d.id ? `Modifica ${esc(d.name)}` : 'Aggiungi nuovo cane')}
        <form class="editor" id="dogForm" data-id="${esc(d.id)}">
          <div class="editor__main">
            <input class="editor__title" name="name" value="${esc(d.name)}" placeholder="Nome del cane" required aria-label="Nome del cane">
            <label>La sua storia<textarea name="description" rows="10" required>${esc(d.description)}</textarea></label>
            <label>Frase per l'adozione a distanza<input name="quote" value="${esc(d.quote)}" placeholder="Es. “Corro, salto, ti porto la pallina…”"></label>
          </div>
          <aside class="editor__side">
            <div class="postbox"><h2>Pubblica</h2>
              <label>Stato ${sel('stato', [['disponibile', 'Disponibile'], ['adottato', 'Adottato'], ['non visibile', 'Non visibile']], d.stato)}</label>
              <label class="inline"><input type="checkbox" name="distanza" ${d.distanza ? 'checked' : ''}> Adozione a distanza</label>
              <button class="button button-primary" type="submit">${d.id ? 'Aggiorna' : 'Pubblica'}</button>
            </div>
            <div class="postbox"><h2>Scheda</h2>
              <label>Età ${sel('age', [['cucciolo', 'Cucciolo'], ['adulto', 'Adulto'], ['anziano', 'Anziano']], d.age)}</label>
              <label>Sesso ${sel('gender', [['F', 'Femmina'], ['M', 'Maschio']], d.gender)}</label>
              <label>Taglia ${sel('size', [['piccola', 'Piccola'], ['media contenuta', 'Media contenuta'], ['media', 'Media'], ['grande', 'Grande']], d.size)}</label>
              <label class="inline"><input type="checkbox" name="neutered" ${d.neutered ? 'checked' : ''}> Castrato / sterilizzata</label>
            </div>
            <div class="postbox"><h2>Immagine in evidenza</h2>
              <img class="editor__img" id="dogImg" src="${esc(d.image)}" alt="" ${d.image ? '' : 'hidden'}>
              <input type="hidden" name="image" value="${esc(d.image)}">
              <label class="button">Scegli foto<input type="file" accept="image/*" id="dogFile" class="sr"></label>
            </div>
          </aside>
        </form>`;
    },

    testi(_, msg = '') {
      return `${head('Testi del sito')}${msg}
        <p class="description">Modifica i testi delle sezioni: le modifiche sono subito online.</p>
        <form class="texts" id="textsForm">
          ${Object.entries(LABELS).map(([group, keys]) => `<div class="postbox"><h2>${group}</h2>${Object.entries(keys).map(([k, label]) => {
            const v = db.texts[k] || '';
            return `<label>${label}${v.length > 70 ? `<textarea name="${k}" rows="3">${esc(v)}</textarea>` : `<input name="${k}" value="${esc(v)}">`}</label>`;
          }).join('')}</div>`).join('')}
          <p><button class="button button-primary" type="submit">Salva modifiche</button> <a href="index.html" target="_blank">Visualizza il sito</a></p>
        </form>`;
    },
  };

  // ---------- router ----------
  const route = (msg = '') => {
    const [name, query] = (location.hash.slice(1) || 'bacheca').split('?');
    const view = views[name] ? name : 'bacheca';
    content.innerHTML = views[view](new URLSearchParams(query), msg);
    const section = view.split('-')[0];
    menu.querySelectorAll('a').forEach((a) => a.classList.toggle('current', a.getAttribute('href') === `#${section}`));
    const badge = menu.querySelector('.awaiting');
    badge.textContent = pending().length;
    badge.hidden = !pending().length;
    document.body.classList.remove('menu-open');
  };
  const go = (hash, msg) => { if (location.hash === hash) route(msg); else { history.pushState(null, '', hash); route(msg); } };
  window.addEventListener('hashchange', () => route());
  route();

  // ---------- actions ----------
  content.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-act]');
    if (!b || b.tagName === 'SELECT' || b.type === 'checkbox') return;
    const { act, id } = b.dataset;
    if (act === 'pay') {
      const x = db.iscritti.find((i) => i.id === id);
      x.pagamento = x.pagamento === 'ricevuto' ? 'attesa' : 'ricevuto';
      save(); route(notice(`Pagamento di ${esc(x.nome)} ${esc(x.cognome)} segnato come «${x.pagamento === 'ricevuto' ? 'ricevuto' : 'in attesa'}».`));
    }
    if (act === 'del-entry' && confirm('Eliminare definitivamente questa iscrizione?')) {
      db.iscritti = db.iscritti.filter((i) => i.id !== id); save(); route(notice('Iscrizione eliminata.'));
    }
    if (act === 'del-dog') {
      const d = dog(id);
      const linked = db.iscritti.filter((i) => i.cane === id).length;
      if (confirm(linked ? `${d.name} ha ${linked} iscrizioni collegate, che resteranno nello storico. Eliminare comunque la scheda?` : `Eliminare la scheda di ${d.name}?`)) {
        db.dogs = db.dogs.filter((x) => x.id !== id); save(); route(notice(`${esc(d.name)} eliminato.`));
      }
    }
    if (act === 'csv') {
      const cols = ['data', 'nome', 'cognome', 'email', 'regalo', 'cane', 'mesi', 'anno', 'totale', 'pagamento', 'ricevuta'];
      const val = (x, c) => (c === 'cane' ? dog(x.cane).name : c === 'mesi' ? x.mesi.map((i) => MESI[i]).join(' ') : c === 'totale' ? totale(x) : x[c]);
      const csv = [cols.join(';'), ...db.iscritti.map((x) => cols.map((c) => `"${String(val(x, c)).replace(/"/g, '""')}"`).join(';'))].join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
      a.download = 'adozioni-a-distanza.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    }
  });

  content.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.dataset.act === 'stato') { dog(t.dataset.id).stato = t.value; save(); route(notice('Stato aggiornato.')); }
    if (t.dataset.act === 'distanza') { dog(t.dataset.id).distanza = t.checked; save(); route(notice('Adozione a distanza aggiornata.')); }
    if (t.id === 'dogFile' && t.files[0]) {
      // downscale so the photo fits in browser storage
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 720 / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const url = c.toDataURL('image/jpeg', 0.8);
        t.form.image.value = url;
        const prev = document.getElementById('dogImg');
        prev.src = url; prev.hidden = false;
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => alert('File immagine non valido.');
      img.src = URL.createObjectURL(t.files[0]);
    }
  });

  content.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (f.dataset.filter) {
      const p = new URLSearchParams([...new FormData(f)].filter(([, v]) => v));
      return go(`#${f.dataset.filter}${p.toString() ? `?${p}` : ''}`);
    }
    if (f.id === 'textsForm') {
      new FormData(f).forEach((v, k) => { db.texts[k] = String(v).trim(); });
      save(); return route(notice('Testi salvati. <a href="index.html" target="_blank">Visualizza il sito</a>'));
    }
    if (f.id === 'dogForm') {
      if (!f.reportValidity()) return;
      const v = Object.fromEntries(new FormData(f));
      const data = { name: v.name.trim(), description: v.description.trim(), quote: v.quote.trim(), stato: v.stato, age: v.age, gender: v.gender, size: v.size, image: v.image || 'assets/img/logo.png', distanza: !!v.distanza, neutered: !!v.neutered };
      let d = db.dogs.find((x) => x.id === f.dataset.id);
      if (d) Object.assign(d, data);
      else { d = { id: `cane-${Date.now()}`, ...data }; db.dogs.unshift(d); }
      save();
      go('#cani', notice(`${esc(d.name)} ${f.dataset.id ? 'aggiornato' : 'pubblicato'}. <a href="index.html#adozione-cani" target="_blank">Visualizza</a>`));
    }
  });

  document.getElementById('reset').addEventListener('click', () => { if (confirm('Ripristinare i dati dimostrativi? Le modifiche fatte andranno perse.')) reset(); });
  document.getElementById('menuToggle').addEventListener('click', () => document.body.classList.toggle('menu-open'));
})();
