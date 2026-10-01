// FK28 Studio — interações do site. Sem dependências.
(function () {
  'use strict';

  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Menu do celular ----------
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');

  function fecharMenu(devolverFoco) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('is-open');
    if (devolverFoco) toggle.focus();
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var aberto = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!aberto));
      toggle.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
      menu.classList.toggle('is-open', !aberto);
    });
    // Escolher um destino fecha o menu.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) fecharMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) fecharMenu(true);
    });
    // Clique fora fecha.
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !e.target.closest('.nav')) fecharMenu(false);
    });
  }

  // ---------- Entrada suave das seções ----------
  var revelaveis = document.querySelectorAll('.reveal');
  if (reduzMovimento || !('IntersectionObserver' in window)) {
    revelaveis.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          obs.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    revelaveis.forEach(function (el) { obs.observe(el); });
  }

  // ---------- Vídeo do hero ----------
  // Carrega o MP4 só quando faz sentido: tela larga, sem "reduzir movimento" e sem economia de dados.
  // Nos outros casos fica o pôster, e o botão carrega e toca sob demanda.
  var hero = document.querySelector('[data-hero-media]');
  if (hero) {
    var heroVideo = hero.querySelector('video');
    var heroBtn = hero.querySelector('[data-hero-play]');
    var heroRotulo = heroBtn ? heroBtn.querySelector('span') : null;
    var heroIcone = heroBtn ? heroBtn.querySelector('use') : null;
    var economia = navigator.connection && navigator.connection.saveData;
    var telaLarga = window.matchMedia('(min-width: 960px)').matches;

    function carregarHero() {
      if (!heroVideo.getAttribute('src')) {
        heroVideo.setAttribute('src', heroVideo.dataset.src);
        heroVideo.preload = 'auto';
      }
    }
    function tocarHero() {
      carregarHero();
      heroVideo.currentTime = 0;
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () { /* autoplay bloqueado: fica o pôster */ });
    }

    heroVideo.addEventListener('playing', function () { if (heroBtn) heroBtn.hidden = true; });
    heroVideo.addEventListener('ended', function () {
      if (!heroBtn) return;
      heroBtn.hidden = false;
      if (heroRotulo) heroRotulo.textContent = 'Ver de novo';
      if (heroIcone) heroIcone.setAttribute('href', '#i-replay');
    });
    if (heroBtn) heroBtn.addEventListener('click', tocarHero);

    if (telaLarga && !reduzMovimento && !economia) tocarHero();
  }

  // ---------- Player das animações (um vídeo carregado por vez) ----------
  var player = document.getElementById('player');
  var inicio = document.querySelector('[data-player-start]');
  var miniaturas = document.querySelectorAll('.thumb');

  if (player) {
    function tocar() {
      var p = player.play();
      if (p && p.catch) p.catch(function () {});
    }
    if (inicio) {
      inicio.addEventListener('click', function () { inicio.hidden = true; tocar(); });
      player.addEventListener('play', function () { inicio.hidden = true; });
    }
    miniaturas.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-current') === 'true') { if (inicio) inicio.hidden = true; tocar(); return; }
        miniaturas.forEach(function (b) { b.removeAttribute('aria-current'); });
        btn.setAttribute('aria-current', 'true');
        player.pause();
        player.setAttribute('poster', btn.dataset.poster);
        player.setAttribute('aria-label', btn.dataset.label);
        var fonte = player.querySelector('source');
        fonte.setAttribute('src', btn.dataset.video);
        player.load();
        if (inicio) inicio.hidden = true;
        tocar();
      });
    });
  }
})();
