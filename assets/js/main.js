(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const box = document.getElementById('lightbox');
  if (!box || typeof box.showModal !== 'function') return;

  const img = box.querySelector('.lightbox__img');
  const scroller = box.querySelector('.lightbox__scroll');

  document.querySelectorAll('.project__preview').forEach((btn) => {
    btn.addEventListener('click', () => {
      const thumb = btn.querySelector('img');
      img.src = btn.dataset.full;
      img.alt = thumb ? thumb.alt : '';
      scroller.scrollTop = 0;
      box.showModal();
      document.body.classList.add('is-locked');
    });
  });

  box.querySelector('.lightbox__close').addEventListener('click', () => box.close());

  // close when clicking the backdrop (outside the dialog box)
  box.addEventListener('click', (e) => {
    if (e.target === box) box.close();
  });

  box.addEventListener('close', () => document.body.classList.remove('is-locked'));
})();
