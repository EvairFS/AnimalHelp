(function() {
  "use strict";

  /**
   * HELPERS: Funções auxiliares para facilitar a seleção de elementos e eventos
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * CONFIGURAÇÃO DE AMBIENTE: Alterna entre Localhost e Servidor Real
   */
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3000"
    : "https://animalhelp24h.com.br/"; // <-- URL real

  /**
   * NAVBAR: Ativa o link conforme a seção visível no scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * SCROLL: Rolagem suave com offset para o header fixo
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * HEADER: Adiciona classe ao rolar a página
   */
  let selectHeader = select('#header')
  let selectTopbar = select('#topbar')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
        if (selectTopbar) selectTopbar.classList.add('topbar-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
        if (selectTopbar) selectTopbar.classList.remove('topbar-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * BOTÃO VOLTAR AO TOPO
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * MENU MOBILE
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()
      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * INICIALIZAÇÃO DE PLUGINS (Lightbox, Swiper, Counter)
   */
  window.addEventListener('load', () => {
    if (window.location.hash && select(window.location.hash)) {
      scrollto(window.location.hash)
    }
    // GLightbox
    GLightbox({ selector: '.glightbox' });
    GLightbox({ selector: '.galelry-lightbox' });
    // PureCounter
    if (typeof PureCounter !== 'undefined') new PureCounter();
    
    // Preloader
    let preloader = select('#preloader');
    if (preloader) preloader.remove();
  });

  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    slidesPerView: 'auto',
    pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true },
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 20 },
      1200: { slidesPerView: 2, spaceBetween: 20 }
    }
  });

  /**
   * LINKS EXTERNOS: WhatsApp e Mapas (Segurança contra erros)
   */
  const whatsappLink = document.getElementById("whatsapp-link");
  if (whatsappLink) {
    whatsappLink.addEventListener("click", function(e) {
      e.preventDefault();
      window.open(this.href, "_blank");
    });
  }

  on('click', '#Map1, #Map2', function(e) {
    e.preventDefault();
    window.open(this.href, "_blank");
  }, true);

  /**
   * BACKEND: Carregamento de Equipe
   */
async function carregarIndex() {
  // Bloco 1: Equipe
  try {
    const resFunc = await fetch(`${API_URL}/funcionarios`);
    const gridEquipe = document.getElementById('grid-equipe');
    if (resFunc.ok && gridEquipe) {
      const funcionarios = await resFunc.json();
      gridEquipe.innerHTML = funcionarios.map(medico => `
        <div class="medico-card">
          <img src="${API_URL}/uploads/${medico.foto || medico.arquivo}" alt="${medico.nome}">
          <div class="medico-info">
            <h3>${medico.nome}</h3>
            <p>${medico.cargo}</p>
          </div>
        </div>`).join('');
    }
  } catch (err) { console.error("Erro na equipe:", err); }

  // Bloco 2: Galeria
  try {
    const resGal = await fetch(`${API_URL}/galeria`);
    const gridGaleria = document.getElementById('grid-galeria');
    if (resGal.ok && gridGaleria) {
      const galeria = await resGal.json();
      gridGaleria.innerHTML = galeria.map(foto => `
        <div class="galeria-card">
          <div class="galeria-img-container">
            <img src="${API_URL}/uploads/${foto.arquivo || foto.foto}" alt="${foto.titulo}">
          </div>
          <div class="galeria-info">
            <h4>${foto.titulo || 'Animal Help'}</h4>
          </div>
        </div>`).join('');
    }
  } catch (err) { console.error("Erro na galeria:", err); }
}

  if (document.getElementById('grid-equipe') || document.getElementById('grid-galeria')) {
    carregarIndex();
  }
  /**
   * LOGIN: Atalho Shift + E
   */
  document.addEventListener('keydown', function(event) {
    if (event.shiftKey && event.key.toLowerCase() === 'e') {
      const aviso = document.createElement('div');
      aviso.textContent = "🔐 Abrindo tela de login...";
      Object.assign(aviso.style, {
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: '#ff4d4d', color: '#fff', padding: '15px 25px',
        borderRadius: '10px', zIndex: '10000', opacity: '0', transition: 'opacity 0.3s'
      });
      document.body.appendChild(aviso);
      setTimeout(() => aviso.style.opacity = '1', 10);
      setTimeout(() => {
        aviso.style.opacity = '0';
        setTimeout(() => window.location.href = '/login.html', 300);
      }, 1200);
    }
  });

})();