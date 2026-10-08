(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // hover scroll duration proportional to page length
  document.querySelectorAll('.project__preview img').forEach((thumb) => {
    const ratio = thumb.getAttribute('height') / thumb.getAttribute('width');
    if (ratio) thumb.style.setProperty('--scroll-time', `${Math.max(3, ratio * 2.5).toFixed(1)}s`);
  });

  const box = document.getElementById('lightbox');
  if (!box || typeof box.showModal !== 'function') return;

  const img = box.querySelector('.lightbox__img');
  const frame = box.querySelector('.lightbox__frame');
  const scroller = box.querySelector('.lightbox__scroll');

  document.querySelectorAll('.project__preview').forEach((btn) => {
    btn.addEventListener('click', () => {
      const site = btn.dataset.site;
      box.classList.toggle('is-site', Boolean(site));
      img.hidden = Boolean(site);
      frame.hidden = !site;

      if (site) {
        // live site: load it inside the dialog
        frame.src = site;
      } else {
        const thumb = btn.querySelector('img');
        img.src = btn.dataset.full;
        img.alt = thumb ? thumb.alt : '';
      }

      scroller.scrollTop = 0;
      box.showModal();
      document.body.classList.add('is-locked');
    });
  });

  // keystrokes inside the iframe don't reach the dialog: forward Esc (same origin)
  frame.addEventListener('load', () => {
    try {
      frame.contentWindow.document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') box.close();
      });
    } catch (e) { /* cross-origin: Esc works once focus leaves the frame */ }
  });

  box.querySelector('.lightbox__close').addEventListener('click', () => box.close());

  // close when clicking the backdrop (outside the dialog box)
  box.addEventListener('click', (e) => {
    if (e.target === box) box.close();
  });

  box.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    // unload the site so it doesn't keep running in the background
    if (!frame.hidden) frame.removeAttribute('src');
  });
})();
