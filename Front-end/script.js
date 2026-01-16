    // ============================
    // LOADING SCREEN
    // ============================
    
    // Empêche la restauration automatique du scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.addEventListener('load', () => {
      // Force le scroll en haut au chargement
      window.scrollTo(0, 0);

      setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
      }, 500);
    });

    // ============================
    // NAVIGATION SCROLL EFFECT
    // ============================
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });

    // ============================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
          const offsetTop = target.offsetTop - 80; // Offset pour la nav fixe
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });

    // ============================
    // SCROLL REVEAL ANIMATION
    // ============================
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const revealPoint = 150;

      scrollRevealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - revealPoint) {
          element.classList.add('revealed');
        }
      });
    };

    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('load', revealOnScroll);

    // ============================
    // YOUTUBE SUBSCRIBER COUNT
    // ============================
    async function updateSubCount() {
      const subCountElement = document.getElementById('subCount');
      
      try {
        // Utilisation de l'API avec URL complète
        const response = await fetch('/api/subscribers');
        const data = await response.json();
        
        if (data.subscriberCount) {
          animateNumber(subCountElement, 0, data.subscriberCount, 2000);
        } else {
          subCountElement.textContent = '60K+';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des abonnés:', error);
        // Fallback: afficher une valeur statique
        subCountElement.textContent = '60K+';
      }
    }

    // ============================
    // ANIMATE NUMBER (pour les stats)
    // ============================
    function animateNumber(element, start, end, duration) {
      const startTime = performance.now();
      
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      
      requestAnimationFrame(update);
    }

    // ============================
    // FORMAT NUMBER (pour affichage)
    // ============================
    function formatNumber(num) {
      if (num >= 1_000_000) {
        return Math.floor(num / 1_000_000) + 'M';
      }

      if (num >= 1_000) {
        return Math.floor(num / 1_000) + 'k';
      }

      return num.toString();
    }

    // ============================
    // MOBILE MENU (pour version mobile)
    // ============================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
      });

      // Fermer le menu au clic sur un lien
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          mobileMenuBtn.textContent = '☰';
        });
      });
    }

    // ============================
    // PARALLAX EFFECT ON HERO
    // ============================
    const hero = document.querySelector('.hero');
    const profileWrapper = document.querySelector('.profile-image-wrapper');

    if (hero && profileWrapper) {
      window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        
        profileWrapper.style.transform = `translateY(-20px) translateX(${moveX}px) translateY(${moveY}px)`;
      });
    }

    // ============================
    // TYPING EFFECT FOR HERO SUBTITLE
    // ============================
    function typeWriter(element, text, speed = 100) {
      let i = 0;
      element.textContent = '';
      
      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        }
      }
      
      type();
    }

    // Optionnel: activer l'effet typing au chargement
    // const heroSubtitle = document.querySelector('.hero-subtitle');
    // if (heroSubtitle) {
    //   const originalText = heroSubtitle.textContent;
    //   typeWriter(heroSubtitle, originalText, 80);
    // }

    // ============================
    // CARD TILT EFFECT (3D hover)
    // ============================
    const cards = document.querySelectorAll('.game-card, .social-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });

    // ============================
    // INTERSECTION OBSERVER FOR STATS ANIMATION
    // ============================
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          
          statNumbers.forEach(stat => {
            const text = stat.textContent;
            if (text === '...' || !stat.dataset.animated) {
              stat.dataset.animated = 'true';
              
              // Pour le compteur d'abonnés
              if (stat.id === 'subCount') {
                updateSubCount();
              }
            }
          });
          
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
      statsObserver.observe(statsContainer);
    }

    // ============================
    // LAZY LOADING IMAGES
    // ============================
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // ============================
    // PREVENT RIGHT CLICK ON IMAGES (protection)
    // ============================
    document.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    });

    // ============================
    // EASTER EGG - Console Message
    // ============================
    console.log(
      '%c🎮 BAUDO Portfolio - Game Developer',
      'color: #6366f1; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
    );

    console.log(
      '%c👋 Salut, développeur curieux ! Tu cherches des secrets ?',
      'color: #ec4899; font-size: 14px;'
    );

    console.log(
      '%c💻 Développé avec ❤️ par csc.pacman',
      'color: #f59e0b; font-size: 12px;'
    );

    // ============================
    // PERFORMANCE MONITORING (optionnel)
    // ============================
    if ('PerformanceObserver' in window) {
      const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.renderTime || entry.loadTime);
          }
        }
      });
      
      perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // ============================
    // THEME TOGGLE (optionnel - mode clair/sombre)
    // ============================
    function initThemeToggle() {
      const themeToggle = document.getElementById('theme-toggle');
      if (!themeToggle) return;

      const currentTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', currentTheme);

      themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }

    // Appeler au chargement si vous ajoutez un bouton de thème
    // initThemeToggle();

    // ============================
    // INITIALIZE ALL ON DOM READY
    // ============================
    document.addEventListener('DOMContentLoaded', () => {
      console.log('✅ Portfolio chargé avec succès!');
      
      // Lancer les animations initiales
      revealOnScroll();
      
      // Précharger les images importantes
      const criticalImages = document.querySelectorAll('.profile-image, .game-image');
      criticalImages.forEach(img => {
        if (img.complete) {
          img.classList.add('loaded');
        } else {
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
        }
      });
    });

    // ============================
    // SERVICE WORKER (PWA - optionnel)
    // ============================
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Décommenter si vous voulez créer une PWA
        // navigator.serviceWorker.register('/sw.js')
        //   .then(registration => console.log('SW registered:', registration))
        //   .catch(error => console.log('SW registration failed:', error));
      });
    }

    // ============================
    // ANALYTICS (Google Analytics - optionnel)
    // ============================
    function trackEvent(category, action, label) {
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          'event_category': category,
          'event_label': label
        });
      }
    }

    // Exemples d'utilisation:
    // trackEvent('Navigation', 'click', 'YouTube Button');
    // trackEvent('Games', 'view', 'Lethal Room');

    // ============================
    // EXPORT FUNCTIONS (si module)
    // ============================
    // export { updateSubCount, animateNumber, formatNumber, trackEvent };

    // ============================
    // FONCTIONS UTILITAIRES POUR GAME JAMS
    // ============================

    // ============================
    // FONCTIONS UTILITAIRES POUR GAME JAMS
    // ============================

        const gameJams = [
      // Exemple de structure d'une game jam
    //     {
    //       id: 1,
    //       name: "Ludum Dare 56",
    //       theme: "Tiny Creatures",
    //       description: "Créez un jeu complet en 72h autour du thème des créatures minuscules. Votez, jouez et partagez !",
    //       startDate: "2026-01-10T18:00:00",
    //       endDate: "2026-01-13T18:00:00",
    //       url: "",
    //       icon: "🕹️"
    //     },
    // ============================
    ];
    
    function getJamStatus(startDate, endDate) {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (now < start) return 'upcoming';
      if (now > end) return 'ended';
      return 'live';
    }

    function getStatusText(status) {
      const statusTexts = {
        live: '🔴 En cours',
        upcoming: '⏰ À venir',
        ended: '✓ Terminée'
      };
      return statusTexts[status] || status;
    }

    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function calculateTimeRemaining(targetDate) {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) return null;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    }

    // ============================
    // CRÉATION DES CARTES
    // ============================
    function createJamCard(jam) {
      const status = getJamStatus(jam.startDate, jam.endDate);
      const isActive = status === 'live' || status === 'upcoming';

      const card = document.createElement('div');
      card.className = 'gamejam-card';
      card.dataset.jamId = jam.id;

      const targetDate = status === 'live' ? jam.endDate : jam.startDate;
      const countdownLabel = status === 'live' ? 'Temps restant' : 'Commence dans';

      card.innerHTML = `
        <div class="jam-status ${status}">
          ${getStatusText(status)}
        </div>
        
        <div class="jam-header">
          <div class="jam-icon">${jam.icon}</div>
        </div>
        
        <div class="jam-content">
          <h3 class="jam-title">${jam.name}</h3>
          <p class="jam-theme">Thème : "${jam.theme}"</p>
          <p class="jam-description">${jam.description}</p>
          
          <div class="jam-dates">
            <div class="date-item">
              <span class="date-icon">🚀</span>
              <span>Début : ${formatDate(jam.startDate)}</span>
            </div>
            <div class="date-item">
              <span class="date-icon">🏁</span>
              <span>Fin : ${formatDate(jam.endDate)}</span>
            </div>
          </div>
          
          ${isActive ? `
            <div class="jam-countdown" data-target="${targetDate}">
              <div class="countdown-label">${countdownLabel}</div>
              <div class="countdown-timer">
                <div class="countdown-unit">
                  <span class="countdown-value days">00</span>
                  <span class="countdown-unit-label">Jours</span>
                </div>
                <div class="countdown-unit">
                  <span class="countdown-value hours">00</span>
                  <span class="countdown-unit-label">Heures</span>
                </div>
                <div class="countdown-unit">
                  <span class="countdown-value minutes">00</span>
                  <span class="countdown-unit-label">Min</span>
                </div>
                <div class="countdown-unit">
                  <span class="countdown-value seconds">00</span>
                  <span class="countdown-unit-label">Sec</span>
                </div>
              </div>
            </div>
          ` : ''}
          
          <div class="jam-actions">
            <a href="${jam.url}" target="_blank" class="jam-btn jam-btn-primary">
              ${status === 'live' ? '🎮 Participer' : status === 'upcoming' ? '📅 S\'inscrire' : '👀 Voir les jeux'}
            </a>
            <a href="${jam.url}" target="_blank" class="jam-btn jam-btn-secondary">
              ℹ️ Infos
            </a>
          </div>
        </div>
      `;

      return card;
    }

    // ============================
    // MISE À JOUR DES COUNTDOWNS
    // ============================
    function updateCountdowns() {
      document.querySelectorAll('.jam-countdown').forEach(countdown => {
        const targetDate = countdown.dataset.target;
        const timeRemaining = calculateTimeRemaining(targetDate);

        if (!timeRemaining) {
          countdown.innerHTML = '<div class="countdown-label">Terminé !</div>';
          return;
        }

        const daysEl = countdown.querySelector('.days');
        const hoursEl = countdown.querySelector('.hours');
        const minutesEl = countdown.querySelector('.minutes');
        const secondsEl = countdown.querySelector('.seconds');

        if (daysEl) daysEl.textContent = String(timeRemaining.days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(timeRemaining.hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(timeRemaining.minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(timeRemaining.seconds).padStart(2, '0');
      });
    }

    // ============================
    // INITIALISATION
    // ============================
    function initGameJams() {
      const grid = document.getElementById('gamejamGrid');
      
      // Trier par statut (live > upcoming > ended) puis par date
      const sortedJams = gameJams.sort((a, b) => {
        const statusOrder = { live: 0, upcoming: 1, ended: 2 };
        const statusA = getJamStatus(a.startDate, a.endDate);
        const statusB = getJamStatus(b.startDate, b.endDate);
        
        if (statusA !== statusB) {
          return statusOrder[statusA] - statusOrder[statusB];
        }
        
        return new Date(a.startDate) - new Date(b.startDate);
      });

      if (sortedJams.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🎮</div>
            <p>Aucune game jam en cours pour le moment</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">Revenez bientôt pour découvrir les prochains événements !</p>
          </div>
        `;
        return;
      }

      // Créer les cartes
      sortedJams.forEach(jam => {
        grid.appendChild(createJamCard(jam));
      });

      // Lancer le countdown
      updateCountdowns();
      setInterval(updateCountdowns, 1000);
    }

    // ============================
    // DÉMARRAGE
    // ============================
    document.addEventListener('DOMContentLoaded', initGameJams);