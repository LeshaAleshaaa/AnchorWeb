(function () {
  (function loadPortfolio() {
    var grid = document.getElementById('portfolio-grid');
    var countEl = document.getElementById('portfolio-count');
    if (!grid) return;

    // --- Лайтбокс ---
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML =
      '<button class="lightbox__close" aria-label="Закрыть">&times;</button>' +
      '<button class="lightbox__prev" aria-label="Назад">&#8249;</button>' +
      '<img class="lightbox__img" src="" alt="">' +
      '<button class="lightbox__next" aria-label="Вперёд">&#8250;</button>' +
      '<div class="lightbox__counter"></div>';
    document.body.appendChild(lb);

    var lbImg     = lb.querySelector('.lightbox__img');
    var lbCounter = lb.querySelector('.lightbox__counter');
    var lbPhotos  = [];
    var lbIndex   = 0;

    function lbPreload(photos) {
      photos.forEach(function (src) {
        var i = new Image();
        i.src = src;
      });
    }

    function lbShow(photos, index) {
      lbPhotos = photos;
      lbIndex  = index;
      lbImg.src = lbPhotos[lbIndex];
      lbCounter.textContent = (lbIndex + 1) + ' / ' + lbPhotos.length;
      lb.classList.add('lightbox_open');
      document.body.style.overflow = 'hidden';
      lbPreload(photos);
    }

    function lbClose() {
      lb.classList.remove('lightbox_open');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    function lbStep(dir) {
      lbIndex = (lbIndex + dir + lbPhotos.length) % lbPhotos.length;
      lbImg.src = lbPhotos[lbIndex];
      lbCounter.textContent = (lbIndex + 1) + ' / ' + lbPhotos.length;
    }

    lb.querySelector('.lightbox__close').addEventListener('click', lbClose);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { lbStep(-1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { lbStep(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('lightbox_open')) return;
      if (e.key === 'Escape')      lbClose();
      if (e.key === 'ArrowLeft')   lbStep(-1);
      if (e.key === 'ArrowRight')  lbStep(1);
    });

    // --- Портфолио ---
    fetch('images/manifest.json')
      .then(function (r) { return r.json(); })
      .then(function (projects) {
        if (countEl && projects.length) {
          countEl.textContent = '(' + projects.length + ')';
        }
        projects.forEach(function (p) {
          var coverFile = p.cover || 'cover.jpg';
          var photos    = (p.photos || [coverFile]).map(function (f) {
            return 'images/' + p.folder + '/' + f;
          });

          var item = document.createElement('div');
          item.className = 'portfolio__item';

          var img = document.createElement('img');
          img.className = 'portfolio__img';
          img.src = 'images/' + p.folder + '/' + coverFile;
          img.alt = p.title || 'Объект';
          img.loading = 'lazy';

          var caption = document.createElement('span');
          caption.className = 'portfolio__caption';
          caption.textContent = p.title || 'Объект';

          item.appendChild(img);
          item.appendChild(caption);
          item.addEventListener('click', function () { lbShow(photos, 0); });
          grid.appendChild(item);
        });
      })
      .catch(function () {
        grid.innerHTML = '<p class="portfolio__empty">Фото объектов скоро появятся.</p>';
      });
  })();

  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  var headerPhone = document.querySelector('.header__phones');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.contains('nav_open');
      nav.classList.toggle('nav_open');
      if (headerPhone) headerPhone.classList.toggle('header__phone_visible', !isOpen);
      burger.setAttribute('aria-expanded', !isOpen);
    });
  }

  var form = document.getElementById('request-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var phoneRaw = (form.querySelector('[name="phone"]') || {}).value || '';
      var phone = phoneRaw.replace(/\D/g, '');
      if (phone.length === 11 && phone[0] === '8') phone = '7' + phone.slice(1);
      if (phone.length === 10) phone = '7' + phone;
      var goal = (form.querySelector('[name="goal"]:checked') || {}).value;
      var goalText = goal === 'calculation' ? 'Хочу получить расчёт.' : 'Хочу обсудить проект.';
      var text = 'Здравствуйте! ' + goalText + '\nИмя: ' + name + '\nТелефон: +' + phone;
      var url = 'https://t.me/Leopard777?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener');
    });
  }

  (function phoneMask() {
    var input = document.getElementById('request-phone');
    if (!input) return;
    input.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '');
      if (v.length > 0) {
        if (v[0] === '8') v = '7' + v.slice(1);
        if (v[0] !== '7') v = '7' + v;
      }
      v = v.slice(0, 11);
      if (v.length <= 1) {
        this.value = v ? '+7' : '';
        return;
      }
      var s = '+7';
      if (v.length > 1) s += ' (' + v.slice(1, 4);
      if (v.length >= 4) s += ') ' + v.slice(4, 7);
      if (v.length >= 7) s += '-' + v.slice(7, 9);
      if (v.length >= 9) s += '-' + v.slice(9, 11);
      this.value = s;
    });
    input.addEventListener('focus', function () {
      if (this.value.replace(/\D/g, '').length === 0) this.value = '+7 ';
    });
    input.addEventListener('blur', function () {
      if (this.value === '+7 ' || this.value === '+7') this.value = '';
    });
  })();

  (function backToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    function toggle() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();
})();
