(function () {
  'use strict';

  const questionPage = document.getElementById('question-page');
  const celebrationPage = document.getElementById('celebration-page');
  const galleryPage = document.getElementById('gallery-page');
  const reasonsPage = document.getElementById('reasons-page');
  const jokesPage = document.getElementById('jokes-page');
  const letterPage = document.getElementById('letter-page');
  const hubPage = document.getElementById('hub-page');
  const openWhenPage = document.getElementById('open-when-page');
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const viewGalleryBtn = document.getElementById('view-gallery-btn');
  const backFromGalleryBtn = document.getElementById('back-from-gallery');
  const flipbookViewer = document.getElementById('flipbook-viewer');
  const currentImageSpan = document.getElementById('current-image');
  const totalImagesSpan = document.getElementById('total-images');
  const mainHeartIcon = document.getElementById('main-heart-icon');
  const heartsContainer = document.getElementById('hearts-container');
  const confettiContainer = document.getElementById('confetti-container');
  const noPopup = document.getElementById('no-popup');
  const noPopupClose = document.getElementById('no-popup-close');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const yippeAudio = document.getElementById('yippe-audio');
  
  let noClickCount = 0;
  let onReasonsPage = false;
  function setMusicButton(isPlaying) {
    if (!musicToggle) return;
    musicToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    musicToggle.textContent = isPlaying ? '⏸ Pause music' : '▶ Play music';
  }

  async function tryPlayMusic() {
    if (!bgMusic) return false;
    try {
      bgMusic.volume = onReasonsPage ? 0.08 : 0.5;
      bgMusic.muted = false;
      await bgMusic.play();
      return true;
    } catch (e) {
      return false;
    }
  }
  
  async function tryAutoplayUnmuted() {
    if (!bgMusic) return;
    try {
      bgMusic.volume = onReasonsPage ? 0.08 : 0.5;
      bgMusic.muted = false;
      
      // Try to play unmuted
      const playPromise = bgMusic.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setMusicButton(true);
      } else {
        setMusicButton(true);
      }
    } catch (e) {
      console.log('Autoplay blocked:', e);
      setMusicButton(false);
    }
  }

  function pauseMusic() {
    if (!bgMusic) return;
    try {
      bgMusic.pause();
    } catch (e) {
      // ignore
    }
  }

  function createFloatingHearts() {
    if (!heartsContainer) return;
    const imagePaths = [
      'images/shiba-no.png',
      'images/shiba-no.jpg',
      'images/icon.png',
      'images/icon.jpg'
    ];
    
    const heartCount = 20;

    for (let i = 0; i < heartCount; i++) {
      // Create a wrapper div for better control
      const wrapper = document.createElement('div');
      wrapper.className = 'heart-float-wrapper';
      
      // Set initial position
      const leftPos = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = 15 + Math.random() * 15;
      
      wrapper.style.left = leftPos + '%';
      wrapper.style.animationDelay = delay + 's';
      wrapper.style.animationDuration = duration + 's';
      const fallback = document.createElement('span');
      fallback.className = 'heart-float-emoji';
      fallback.textContent = '♥';
      const imagePath = imagePaths[i % imagePaths.length];
      const heart = document.createElement('img');
      heart.className = 'heart-float';
      heart.alt = '';
      
      // Add both to wrapper (emoji visible, image hidden initially)
      wrapper.appendChild(fallback);
      wrapper.appendChild(heart);
      heartsContainer.appendChild(wrapper);
      heart.src = imagePath;
      heart.addEventListener('load', function() {
        if (heart.naturalWidth > 0 && heart.naturalHeight > 0) {
          heart.style.display = 'block';
          heart.style.opacity = '1';
          fallback.style.display = 'none';
        }
      }, { once: true });
      heart.addEventListener('error', function() {
        heart.style.display = 'none';
        fallback.style.display = 'inline-block';
      }, { once: true });
      
      // Initially hide image (will show if it loads)
      heart.style.display = 'none';
    }
  }

  function createConfetti() {
    if (!confettiContainer) return;

    const confettiCount = 100;
    const colors = ['#ffd700', '#e84a6f', '#f8b4c4', '#ffffff', '#c41e3a'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = (8 + Math.random() * 12) + 'px';
      confetti.style.height = (8 + Math.random() * 12) + 'px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
      confettiContainer.appendChild(confetti);
    }
  }

  // Gallery images – loaded from gallery-data.js (generated from images folder by scripts/build-gallery.js)
  const galleryData = window.GALLERY_IMAGES || [];

  let currentGalleryIndex = 0;
  let typewriterTimeout = null;
  let gallerySlideshowInterval = null;
  const GALLERY_SLIDESHOW_SECONDS = 4;

  function typewriterEffect(element, text, speed = 50) {
    if (!element || !text) return;
    
    // Clear any existing timeout
    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
    }
    
    element.textContent = '';
    element.style.display = 'block';
    element.classList.remove('complete');
    
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        typewriterTimeout = setTimeout(type, speed);
      } else {
        element.classList.add('complete');
      }
    }
    
    type();
  }

  // Initialize gallery flipbook
  function initializeGallery() {
    if (!flipbookViewer) return;
    if (totalImagesSpan) {
      totalImagesSpan.textContent = galleryData.length;
    }
    galleryData.forEach(function(item, index) {
      const page = document.createElement('div');
      page.className = 'flipbook-page';
      if (index === 0) page.classList.add('active');
      
      // Image container
      const imgContainer = document.createElement('div');
      imgContainer.className = 'flipbook-image-container';
      
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = 'Our memory ' + (index + 1);
      img.onerror = function() {
        this.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback';
        fallback.textContent = '♥';
        imgContainer.appendChild(fallback);
      };
      
      imgContainer.appendChild(img);
      page.appendChild(imgContainer);
      
      // Message container
      const messageContainer = document.createElement('div');
      messageContainer.className = 'flipbook-message';
      messageContainer.setAttribute('data-message', item.message || '');
      messageContainer.style.display = item.message ? 'block' : 'none';
      page.appendChild(messageContainer);
      
      flipbookViewer.appendChild(page);
    });
    
    updateGalleryDisplay();
  }

  // Update gallery display
  function updateGalleryDisplay() {
    const pages = flipbookViewer ? flipbookViewer.querySelectorAll('.flipbook-page') : [];
    pages.forEach(function(page, index) {
      page.classList.toggle('active', index === currentGalleryIndex);
      if (index === currentGalleryIndex) {
        const img = page.querySelector('img');
        if (img && flipbookViewer) {
          function resizeContainer() {
            if (img.complete && img.naturalHeight > 0) {
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              const maxWidth = Math.min(800, window.innerWidth - 100);
              const calculatedHeight = maxWidth / aspectRatio;
              const maxHeight = Math.min(calculatedHeight, window.innerHeight * 0.7);
              if (flipbookViewer.parentElement) {
                flipbookViewer.parentElement.style.height = 'auto';
                flipbookViewer.style.height = 'auto';
                flipbookViewer.style.minHeight = maxHeight + 'px';
              }
            }
          }
          
          if (img.complete) {
            resizeContainer();
          } else {
            img.onload = resizeContainer;
          }
        }
        
        const messageContainer = page.querySelector('.flipbook-message');
        if (messageContainer) {
          const message = messageContainer.getAttribute('data-message');
          if (message) {
            // Wait a bit for the page transition, then start typewriter
            setTimeout(function() {
              typewriterEffect(messageContainer, message, 40);
            }, 300);
          } else {
            messageContainer.style.display = 'none';
          }
        }
      }
    });
    
    if (currentImageSpan) {
      currentImageSpan.textContent = currentGalleryIndex + 1;
    }
    
  }

  function advanceGallerySlide() {
    if (galleryData.length === 0) return;
    if (typewriterTimeout) clearTimeout(typewriterTimeout);
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
    updateGalleryDisplay();
  }

  function fadeMusicVolume(targetVolume, duration, callback) {
    if (!bgMusic) {
      if (callback) callback();
      return;
    }
    if (onReasonsPage && targetVolume > 0.1) targetVolume = 0.08;
    const startVolume = bgMusic.volume;
    const volumeChange = targetVolume - startVolume;
    const startTime = Date.now();
    
    function updateVolume() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      bgMusic.volume = startVolume + (volumeChange * progress);
      
      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      } else {
      if (callback) callback();
      }
    }
    
    updateVolume();
  }

  // Yes folder media files
  const yesMediaFiles = [
    'Yes/bb-baby.gif',
    'Yes/squid-game-front-man.gif',
    'Yes/6ibdwh.jpg',
    'Yes/Fu_sx6-WcAIfSaO.jpg'
  ];
  let mediaLoopTimeout = null;
  
  function displayYesMedia() {
    const yesMediaBackground = document.getElementById('yes-media-background');
    if (!yesMediaBackground) return;

    // Clear any existing loop
    if (mediaLoopTimeout) {
      clearTimeout(mediaLoopTimeout);
      mediaLoopTimeout = null;
    }

    yesMediaBackground.innerHTML = '';
    let currentIndex = 0;
    let isLooping = true;

    function showNextMedia() {
      if (!isLooping || yesMediaFiles.length === 0) return;
      
      const filePath = yesMediaFiles[currentIndex];
      const mediaElement = document.createElement('img');
      mediaElement.src = filePath;
      mediaElement.alt = 'Celebration background';
      mediaElement.className = 'yes-background-item';
      
      mediaElement.onerror = function() {
        // If this image fails, try next one
        currentIndex = (currentIndex + 1) % yesMediaFiles.length;
        if (currentIndex === 0 && yesMediaBackground.children.length === 0) {
          isLooping = false;
          return;
        }
        showNextMedia();
      };
      
      mediaElement.onload = function() {
        const img = this;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const viewportAspect = viewportWidth / viewportHeight;
        if (imgAspect > viewportAspect) {
          img.style.width = 'auto';
          img.style.height = '100vh';
        } else {
          img.style.width = '100vw';
          img.style.height = 'auto';
        }
        const previous = yesMediaBackground.querySelector('.yes-background-item.active');
        if (previous) {
          previous.classList.remove('active');
          // Remove after fade completes
          setTimeout(function() {
            if (previous.parentNode) {
              previous.remove();
            }
          }, 2000);
        }
        yesMediaBackground.appendChild(img);
        setTimeout(function() {
          img.classList.add('active');
        }, 50);
        if (yesMediaFiles.length > 1 && isLooping) {
          if (mediaLoopTimeout) {
            clearTimeout(mediaLoopTimeout);
          }
          
          // Set new timeout for next image
          mediaLoopTimeout = setTimeout(function() {
            if (isLooping) {
              currentIndex = (currentIndex + 1) % yesMediaFiles.length;
              showNextMedia();
            }
          }, 6000);
        } else {}
      };
      
      // Start loading
      if (mediaElement.complete) {
        mediaElement.onload();
      }
    }

    showNextMedia();
  }

  // Handle Yes button click
  function handleYesClick() {
    if (questionPage && celebrationPage) {
      if (heartsContainer) {
        heartsContainer.style.display = 'none';
      }
      
      questionPage.classList.remove('active');
      celebrationPage.classList.add('active');
      createConfetti();
      displayYesMedia();
      if (yippeAudio) {
        fadeMusicVolume(0.15, 300);
        
        yippeAudio.currentTime = 0;
        yippeAudio.play().catch(function(err) {
          console.log('Could not play yippe audio:', err);
          // Restore music volume if audio fails
          fadeMusicVolume(0.5, 300);
        });
        
        // When yippe audio ends, fade music back up
        yippeAudio.addEventListener('ended', function restoreMusic() {
          fadeMusicVolume(0.5, 500);
          yippeAudio.removeEventListener('ended', restoreMusic);
        }, { once: true });
      }
    }
  }

  function handleViewGallery() {
    showPage(letterPage);
  }

  function handleBackFromGallery() {
    showPage(hubPage);
  }

  function initializeReasonsPage() {
    const flowerPetals = document.getElementById('flower-petals');
    const flowerCenter = document.getElementById('flower-center');
    const reasonsMessage = document.getElementById('reasons-message');
    const reasonsBackdrop = document.getElementById('reasons-center-backdrop');
    const reasonsFlowerWrap = document.getElementById('reasons-flower-wrap');
    if (!flowerPetals || !reasonsMessage) return;

    const reasons = [
      'You understand me like no one else does.',
      'You are very genuine.',
      'You make me smile everytime we talk.',
      'Your sense of humor.',
      "You're sooooo beautiful.",
      'How thoughtful and caring you can be.',
      'How you make time for me.',
      'How comfortable I am around you.',
      'How you make every little thing memorable.',
      'You make me feel loved.'
    ];

    const numPetals = reasons.length;
    const rotStep = 360 / numPetals;

    function checkAllPetalsPicked() {
      const picked = flowerPetals.querySelectorAll('.petal-picked').length;
      if (picked === numPetals && flowerCenter) {
        flowerCenter.classList.add('flower-center-clickable');
        flowerCenter.setAttribute('aria-label', 'All petals picked – click for a surprise');
        if (reasonsBackdrop) {
          reasonsBackdrop.classList.add('reasons-center-backdrop-visible');
          reasonsBackdrop.setAttribute('aria-hidden', 'false');
        }
        if (reasonsFlowerWrap) reasonsFlowerWrap.classList.add('reasons-flower-wrap-active');
      }
    }

    const sparkleContainer = document.getElementById('reasons-sparkle-container');

    function createSparkle(x, y) {
      if (!sparkleContainer) return;
      const sparkle = document.createElement('span');
      sparkle.className = 'reasons-sparkle';
      sparkle.textContent = '✦';
      sparkle.style.left = x + 'px';
      sparkle.style.top = y + 'px';
      sparkleContainer.appendChild(sparkle);
      setTimeout(function() {
        if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
      }, 1200);
    }

    reasons.forEach(function(reason, index) {
      const petal = document.createElement('button');
      petal.type = 'button';
      petal.className = 'flower-petal';
      petal.setAttribute('aria-label', 'Pick this petal');
      petal.dataset.reason = reason;
      petal.style.setProperty('--rot', (index * rotStep) + 'deg');

      petal.addEventListener('click', function() {
        if (petal.classList.contains('petal-picked')) return;
        petal.classList.add('petal-pop');
        var rect = petal.getBoundingClientRect();
        var wrapRect = sparkleContainer && sparkleContainer.parentElement ? sparkleContainer.parentElement.getBoundingClientRect() : rect;
        var x = rect.left - wrapRect.left + rect.width / 2;
        var y = rect.top - wrapRect.top + rect.height / 2;
        createSparkle(x, y);
        setTimeout(function() {
          petal.classList.remove('petal-pop');
          petal.classList.add('petal-picked');
          reasonsMessage.textContent = reason;
          reasonsMessage.classList.add('reasons-message-visible');
          checkAllPetalsPicked();
        }, 400);
      });

      flowerPetals.appendChild(petal);
    });

    if (flowerCenter) {
      const flowerAudioModal = document.getElementById('flower-audio-modal');
      const flowerAudio = document.getElementById('flower-audio');
      const flowerAudioPlayBtn = document.getElementById('flower-audio-play-btn');

      flowerCenter.addEventListener('click', function() {
        if (!flowerCenter.classList.contains('flower-center-clickable')) return;
        if (!flowerAudioModal || !flowerAudio || !flowerAudioPlayBtn) return;
        flowerAudioModal.classList.add('active');
        flowerAudioModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        flowerAudioPlayBtn.style.display = '';
        flowerAudioPlayBtn.textContent = '▶';
      });

      if (flowerAudioPlayBtn) {
        flowerAudioPlayBtn.addEventListener('click', function() {
          if (!flowerAudio) return;
          flowerAudio.volume = 1.0;
          flowerAudio.currentTime = 0;
          flowerAudio.play().catch(function() {});
          flowerAudioPlayBtn.style.display = 'none';

          var cleanupDone = false;
          function doFlowerCleanup() {
            if (cleanupDone) return;
            cleanupDone = true;
            flowerAudio.removeEventListener('ended', onEnded);
            flowerAudio.removeEventListener('timeupdate', onTimeUpdate);
            clearTimeout(fallbackTimer);
            if (flowerAudioModal) {
              flowerAudioModal.classList.remove('active');
              flowerAudioModal.setAttribute('aria-hidden', 'true');
              document.body.style.overflow = '';
            }
            if (reasonsBackdrop) {
              reasonsBackdrop.classList.remove('reasons-center-backdrop-visible');
              reasonsBackdrop.setAttribute('aria-hidden', 'true');
            }
            if (reasonsFlowerWrap) reasonsFlowerWrap.classList.remove('reasons-flower-wrap-active');
            flowerAudioPlayBtn.style.display = '';
          }

          function onEnded() {
            if (flowerAudio.duration && flowerAudio.duration > 10 && flowerAudio.currentTime >= flowerAudio.duration - 1) {
              doFlowerCleanup();
            }
          }
          function onTimeUpdate() {
            if (flowerAudio.duration && flowerAudio.duration > 10 && flowerAudio.currentTime >= flowerAudio.duration - 0.5) {
              doFlowerCleanup();
            }
          }

          flowerAudio.addEventListener('ended', onEnded);
          flowerAudio.addEventListener('timeupdate', onTimeUpdate);
          var fallbackTimer = setTimeout(doFlowerCleanup, 70000);
        });
      }
    }
  }

  function initializeJokesPage() {
    const container = document.getElementById('jokes-container');
    const jokeModal = document.getElementById('joke-image-modal');
    const jokeModalImg = document.getElementById('joke-image-modal-img');
    const jokeModalClose = document.getElementById('joke-image-modal-close');
    if (!container) return;

    const jokes = [
      { text: 'Remember when...', image: 'images/16B847D6-0CE6-46CA-9A9F-090FEACB33C1.jpeg', caption: 'I threatened to hit the dog along with the horse if you didnt accept my money so you can go eat.' },
      { text: 'That one time you...', image: 'images/EE1FB82F-647A-448D-A5DD-D7DAF0692CCE.jpeg', caption: 'Waited really long for bread soup just for it to be mid. Then me posting it on my story and my whole family wondering who tf you were.' },
      { text: 'My favorite photo of you...', image: 'images/18E619BF-B84B-4B03-8FE1-16F722F9E7FA.jpeg', caption: 'You look so pretty and your smile was so genuine here and you seemed soooo happy :)' },
      { text: 'The only thing we understand...', videoMp4: 'images/chicken-on-tree-scream.mp4', image: 'images/horse.jfif', caption: 'How much you love horses and that one screaming chicken.' },
      { text: 'That inside joke we always laugh about...', image: 'images/libby.jpeg', image2: 'images/BB5D57CD-17B1-41E8-A915-DB8D06E13140.jpeg', caption: 'How fat our kids are (Libby & TinTin )' },
      { text: 'The way you and I...', image: 'images/4A5B03CD-44BD-45B6-91E5-49E728028A6B.jpeg', image2: 'images/FC79085D-00D9-48AE-9055-4955B97BFC4B.jpeg', image3: 'images/3F8BAD86-AB03-4A92-8CF6-A1CD690ECF45.jpeg', caption: 'Are lowkey autistic and weird...' },
      { text: 'One special moment...', image: 'images/33A3F877-F8E6-48B3-A694-BC890377EA13.jpeg', caption: 'When I bought you flowers and it turned out to be dead AF!' },
      { text: 'That funny thing that happened...', image: 'images/letter.jpeg', caption: 'When the mailman literally ripped my award that you sent me...' }
    ];

    jokes.forEach(function(joke, index) {
      const jokeCard = document.createElement('div');
      jokeCard.className = 'joke-card' + (joke.image || joke.video || joke.videoMp4 || joke.image2 || joke.image3 ? ' joke-card-has-image' : '');
      jokeCard.textContent = joke.text;
      if (joke.image || joke.video || joke.videoMp4 || joke.image2 || joke.image3) {
        jokeCard.setAttribute('role', 'button');
        jokeCard.setAttribute('tabindex', '0');
        jokeCard.setAttribute('aria-label', joke.text + ' – click to see picture');
        jokeCard.addEventListener('click', function() {
          if (!jokeModal) return;
          const captionEl = document.getElementById('joke-image-modal-caption');
          const comboEl = document.getElementById('joke-image-modal-combo');
          const iframeContainer = document.getElementById('joke-image-modal-iframe-container');
          const iframeEl = document.getElementById('joke-image-modal-iframe');
          const videoEl = document.getElementById('joke-image-modal-video');
          const comboImgEl = document.getElementById('joke-image-modal-combo-img');
          const comboImg2El = document.getElementById('joke-image-modal-combo-img2');
          const comboImg3El = document.getElementById('joke-image-modal-combo-img3');
          const videoWrap = comboEl ? comboEl.querySelector('.joke-image-modal-video-wrap') : null;
          const watchLink = document.getElementById('joke-image-modal-watch-link');
          if (joke.videoMp4 || joke.video) {
            jokeModalImg.style.display = 'none';
            if (comboImg2El) comboImg2El.style.display = 'none';
            if (comboImg3El) comboImg3El.style.display = 'none';
            if (comboEl && comboImgEl) {
              comboEl.style.display = 'flex';
              comboImgEl.src = joke.image || '';
              comboImgEl.alt = joke.text;
              if (videoWrap) videoWrap.style.display = 'flex';
              if (joke.videoMp4) {
                if (videoEl) {
                  videoEl.src = encodeURI(joke.videoMp4).replace(/#/g, '%23');
                  videoEl.style.display = 'block';
                  videoEl.load();
                }
                if (iframeContainer) iframeContainer.style.display = 'none';
                if (iframeEl) iframeEl.src = '';
                if (watchLink) watchLink.style.display = 'none';
              } else {
                if (videoEl) {
                  videoEl.pause();
                  videoEl.removeAttribute('src');
                  videoEl.style.display = 'none';
                }
                if (iframeContainer) iframeContainer.style.display = 'block';
                if (iframeEl) iframeEl.src = joke.video;
                if (watchLink && joke.videoWatchUrl) {
                  watchLink.href = joke.videoWatchUrl;
                  watchLink.style.display = 'inline-block';
                } else if (watchLink) watchLink.style.display = 'none';
              }
            }
          } else if (joke.image2 || joke.image3) {
            jokeModalImg.style.display = 'none';
            if (comboEl && comboImgEl && comboImg2El) {
              comboEl.style.display = 'flex';
              comboImgEl.src = joke.image || '';
              comboImgEl.alt = joke.text;
              comboImgEl.style.display = 'block';
              comboImg2El.src = joke.image2 || '';
              comboImg2El.alt = joke.text;
              comboImg2El.style.display = joke.image2 ? 'block' : 'none';
              if (comboImg3El) {
                comboImg3El.src = joke.image3 || '';
                comboImg3El.alt = joke.text;
                comboImg3El.style.display = joke.image3 ? 'block' : 'none';
              }
              if (videoWrap) videoWrap.style.display = 'none';
              if (iframeEl) iframeEl.src = '';
              if (videoEl) {
                videoEl.pause();
                videoEl.removeAttribute('src');
                videoEl.style.display = 'none';
              }
              if (watchLink) watchLink.style.display = 'none';
            }
          } else {
            jokeModalImg.style.display = 'block';
            jokeModalImg.src = joke.image;
            jokeModalImg.alt = joke.text;
            if (comboEl && iframeEl) {
              comboEl.style.display = 'none';
              iframeEl.src = '';
            }
            if (comboImg2El) comboImg2El.style.display = 'none';
            if (comboImg3El) comboImg3El.style.display = 'none';
            if (videoEl) {
              videoEl.pause();
              videoEl.removeAttribute('src');
              videoEl.style.display = 'none';
            }
          }
          if (captionEl) {
            captionEl.textContent = joke.caption || '';
            captionEl.style.display = joke.caption ? 'block' : 'none';
          }
          jokeModal.classList.add('active');
          jokeModal.setAttribute('aria-hidden', 'false');
        });
        jokeCard.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            jokeCard.click();
          }
        });
      }
      container.appendChild(jokeCard);
    });

    function closeJokeModal() {
      if (!jokeModal) return;
      const iframeEl = document.getElementById('joke-image-modal-iframe');
      const videoEl = document.getElementById('joke-image-modal-video');
      if (iframeEl) iframeEl.src = '';
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
      }
      jokeModal.classList.add('closing');
      setTimeout(function() {
        jokeModal.classList.remove('active', 'closing');
        jokeModal.setAttribute('aria-hidden', 'true');
      }, 260);
    }
    if (jokeModalClose) jokeModalClose.addEventListener('click', closeJokeModal);
    if (jokeModal) {
      const backdrop = jokeModal.querySelector('.joke-image-modal-backdrop');
      if (backdrop) backdrop.addEventListener('click', closeJokeModal);
      jokeModal.addEventListener('click', function(e) {
        if (e.target === jokeModal) closeJokeModal();
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && jokeModal && jokeModal.classList.contains('active')) closeJokeModal();
    });
  }

  function initializeLetterPage() {
    const letterContent = document.getElementById('letter-content');
    if (!letterContent) return;
    
    const letter = `
      <p class="letter-greeting">Tammy,</p>
      <p class="letter-hello">Happy Valentine's Day.</p>
      <p class="letter-body">I made this website for you, as you already know, but I wanted it to be something you could come back to whenever you needed it.</p>
      <p class="letter-body">Anyways, even with the distance between us and whatever we choose to call this, I'm truly grateful it's you. That has always felt certain to me.</p>
      <p class="letter-body">You're studying engineering at Waterloo, taking on something that challenges you constantly, and yet you still question whether you're good enough. If you could see yourself the way I see you, you would realize how capable, intelligent, and resilient you truly are.</p>
      <p class="letter-body">I know you can be hard on yourself. You overthink. You hold yourself to incredibly high standards. But what stands out to me isn't perfection or having everything figured out. It's your determination, your discipline, the way you think so deeply about things, and the fact that you keep pushing forward even when it feels overwhelming.</p>
      <p class="letter-body">I'm proud of you, even on the days you aren't proud of yourself. And even from a distance, I care about you more than you probably realize.</p>
      <p class="letter-body">I hope today reminds you that you are valued and appreciated exactly as you are.</p>
      <p class="letter-closing">Love,<br>Phil</p>
    `;
    
    letterContent.innerHTML = letter;
  }

  const openWhenLettersData = [
    { title: "Open When You're Sad", message: "Tammy,\n\nIf you opened this, I'm guessing today isn't great.\n\nI know how your brain works. You replay everything. You think about what you could've done better. You convince yourself you're behind or not doing enough. And somehow you always forget all the things you're actually handling.\n\nYou're doing engineering at Waterloo. That alone is insane. And even on the days you feel like you're barely keeping up, you're still doing it. That counts for something.\n\nOne bad day doesn't cancel out who you are. One mistake doesn't mean you suddenly aren't capable. You don't lose your worth because you're overwhelmed.\n\nTake a breath. Seriously. Drink water. Close your eyes for a minute.\n\nAnd just know I'm proud of you. Even when you're not proud of yourself.\n\nLove,\nPhil" },
    { title: "Open When You Miss Me", message: "Tammy,\n\nI miss you too.\n\nDistance doesn't change how much I care about you. If anything, it makes me appreciate you more.\n\nJust knowing it's you on the other side of all this makes it easier.\n\nWe'll close the distance one day. And until then, I'm still here.\n\nLove,\nPhil" },
    { title: "Open When You Need a Laugh", message: "Tammy,\n\nIf you're reading this, you're probably sad and need something to laugh about.\n\nRemember that one time I was really excited about something and, for some reason, screamed YIPPEE?\n\nAnd the time I literally lasted one day before rushing back to you after I asked if we could just be friends? Because I don't.\n\nAnyway, I hope everything is going well and everything gets better.\n\nLove,\nPhil" },
    { title: "Open When You Need a Reminder I Love You", message: "Tammy,\n\nYou don't have to achieve something.\nYou don't have to prove anything.\nYou don't have to be perfect.\n\nI love you for who you are. Your mind. Your heart. Your determination. Even your overthinking.\n\nAll of it.\n\nLove,\nPhil" },
    { title: "Open When We're Apart", message: "Tammy,\n\nI'm not going to pretend being apart is easy. It's not.\n\nBut I'd still choose this with you over something easier with someone else.\n\nYou're worth the effort. You're worth waiting for. You're worth choosing again and again.\n\nAnd even when there's distance, you're still my person.\n\nI love you with all my heart.\n\nLove,\nPhil" }
  ];

  function initializeOpenWhenPage() {
    const grid = document.getElementById('open-when-grid');
    const letterModal = document.getElementById('letter-modal');
    const letterModalClose = document.getElementById('letter-modal-close');
    const letterModalTitle = document.getElementById('letter-modal-title');
    const letterModalBody = document.getElementById('letter-modal-body');

    if (!grid) return;

    function openLetter(letter) {
      if (!letterModal || !letterModalTitle || !letterModalBody) return;
      letterModalTitle.textContent = letter.title;
      letterModalBody.textContent = letter.message;
      letterModal.setAttribute('aria-hidden', 'false');
      letterModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLetterModal() {
      if (!letterModal) return;
      letterModal.classList.remove('active');
      letterModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    openWhenLettersData.forEach(function(letter, index) {
      const envelope = document.createElement('button');
      envelope.type = 'button';
      envelope.className = 'open-when-envelope';
      envelope.style.animationDelay = (index * 0.1) + 's';
      envelope.innerHTML = '<span class="open-when-envelope-flap"></span><span class="open-when-envelope-label">' + letter.title + '</span>';
      envelope.addEventListener('click', function() { openLetter(letter); });
      grid.appendChild(envelope);
    });

    if (letterModalClose) {
      letterModalClose.addEventListener('click', closeLetterModal);
    }
    if (letterModal) {
      const backdrop = letterModal.querySelector('.letter-modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', closeLetterModal);
      }
      letterModal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLetterModal();
      });
    }
  }

  function initializeEasterEggs() {
    if (mainHeartIcon) {
      let clickCount = 0;
      mainHeartIcon.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 5) {
          showHiddenMessage('You found a secret. You\'re so special to me.');
          clickCount = 0;
        }
      });
    }
    
    // Triple click on title
    const questionTitle = document.querySelector('.question-title');
    if (questionTitle) {
      let clickCount = 0;
      questionTitle.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 3) {
          showHiddenMessage('You\'re curious, I like that.');
          clickCount = 0;
        }
      });
    }
  }

  function showHiddenMessage(message, extraClass) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'hidden-message' + (extraClass ? ' ' + extraClass : '');
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.classList.add('active'), 10);
    
    setTimeout(() => {
      messageDiv.classList.remove('active');
      setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
  }

  const mysteryBoxEl = document.getElementById('mystery-box');
  const mysteryBoxBackdrop = document.getElementById('mystery-box-backdrop');

  // Track which sections have been opened – gallery only appears when ALL three are opened
  const openedSections = { reasons: false, jokes: false, openWhen: false };
  let mysteryBoxAlreadyOpened = false; // after they open the mystery box once, show a normal button on Hub instead

  function showPage(page) {
    // Stop gallery auto-slideshow when leaving gallery
    if (gallerySlideshowInterval) {
      clearInterval(gallerySlideshowInterval);
      gallerySlideshowInterval = null;
    }
    var wasOnReasons = reasonsPage && reasonsPage.classList.contains('active');
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    if (page) {
      page.classList.add('active');
    }

    if (page === reasonsPage) {
      fadeMusicVolume(0.08, 400);
    } else if (wasOnReasons) {
      fadeMusicVolume(0.5, 500);
    }
    if (page === galleryPage && galleryData.length > 0) {
      currentGalleryIndex = 0;
      updateGalleryDisplay();
      gallerySlideshowInterval = setInterval(advanceGallerySlide, GALLERY_SLIDESHOW_SECONDS * 1000);
    }

    // Mark section as opened when user lands on it
    if (page === reasonsPage) openedSections.reasons = true;
    if (page === jokesPage) openedSections.jokes = true;
    if (page === openWhenPage) openedSections.openWhen = true;

    const allOpened = openedSections.reasons && openedSections.jokes && openedSections.openWhen;
    const onHub = page === hubPage;

    const hubGalleryBtn = document.getElementById('hub-gallery-btn');
    if (mysteryBoxEl) {
      if (page !== hubPage) {
        mysteryBoxEl.classList.remove('mystery-box-visible', 'mystery-box-pop', 'mystery-box-unlocked');
        if (mysteryBoxBackdrop) mysteryBoxBackdrop.classList.remove('mystery-box-backdrop-visible');
      }

      if (allOpened && onHub && !mysteryBoxAlreadyOpened) {
        requestAnimationFrame(function() {
          if (mysteryBoxBackdrop) mysteryBoxBackdrop.classList.add('mystery-box-backdrop-visible');
          mysteryBoxEl.classList.add('mystery-box-visible', 'mystery-box-unlocked');
          requestAnimationFrame(function() {
            mysteryBoxEl.classList.add('mystery-box-pop');
          });
        });
      }
    }

    // Show "Our memories" button when all three sections are opened (always when on Hub + all opened; mystery box shows first time, then this button)
    if (hubGalleryBtn) {
      if (allOpened && onHub) {
        hubGalleryBtn.classList.add('hub-gallery-btn-visible');
      } else {
        hubGalleryBtn.classList.remove('hub-gallery-btn-visible');
      }
    }
  }

  function handleBackFromReasons(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    showPage(hubPage);
  }

  function handleBackFromJokes() {
    showPage(hubPage);
  }

  function handleBackFromLetter() {
    showPage(celebrationPage);
  }

  function handleBackFromOpenWhen() {
    showPage(hubPage);
  }

  function handleBackFromHub() {
    showPage(letterPage);
  }

  function setupPageFlow() {
    const letterContainer = document.querySelector('.letter-container');
    if (letterContainer) {
      const letterNav = document.createElement('div');
      letterNav.className = 'reasons-nav';
      letterNav.style.marginTop = '1.5rem';
      const letterContinueBtn = document.createElement('button');
      letterContinueBtn.className = 'valentine-btn yes-btn';
      letterContinueBtn.textContent = 'Pick one';
      letterContinueBtn.addEventListener('click', () => showPage(hubPage));
      letterNav.appendChild(letterContinueBtn);
      letterContainer.appendChild(letterNav);
    }
    const hubButtons = document.querySelectorAll('.hub-btn');
    hubButtons.forEach(function(btn) {
      const pageId = btn.getAttribute('data-page');
      btn.addEventListener('click', function() {
        if (pageId === 'reasons') showPage(reasonsPage);
        else if (pageId === 'jokes') showPage(jokesPage);
        else if (pageId === 'open-when') showPage(openWhenPage);
      });
    });
  }

  function handleNoClick(e) {
      e.preventDefault();
    e.stopPropagation();
    
    if (noBtn) {
      // Add shake animation
      noBtn.classList.add('shake');
      
      // Move button to random position
      moveNoButtonRandom();
      setTimeout(() => {
        noBtn.classList.remove('shake');
      }, 500);
      
      // Increment click count and show popup
      noClickCount++;
      showNoPopup();
    }
    
    return false;
  }

  function showNoPopup() {
    if (!noPopup) return;
    
    // Try to load Shiba Inu meme image with multiple path variations
    const dogHorseImage = document.getElementById('dog-horse-image');
    if (dogHorseImage) {
      const possiblePaths = [
        'images/shiba-meme.png',
        'images/shiba-meme.jpg',
        'images/shiba-meme.jpeg',
        'images/shiba.png',
        'images/shiba.jpg',
        'images/shiba.jpeg',
        'images/hol-up.png',
        'images/hol-up.jpg',
        'images/ajr39r.jpg',
        'images/dog-horse.png',
        'images/dog-horse.jpg'
      ];
      
      let currentPathIndex = 0;
      
      function tryLoadImage() {
        if (currentPathIndex < possiblePaths.length) {
          dogHorseImage.src = possiblePaths[currentPathIndex];
        }
      }
      
      dogHorseImage.onload = function() {
        if (dogHorseImage.naturalWidth > 0) {
          dogHorseImage.style.display = 'block';
          const fallback = dogHorseImage.nextElementSibling;
          if (fallback && fallback.classList.contains('dog-horse-fallback')) {
            fallback.style.display = 'none';
          }
        }
      };
      
      dogHorseImage.onerror = function() {
        currentPathIndex++;
        if (currentPathIndex < possiblePaths.length) {
          tryLoadImage();
        } else {
          // All paths failed, show fallback
          dogHorseImage.style.display = 'none';
          const fallback = dogHorseImage.nextElementSibling;
          if (fallback && fallback.classList.contains('dog-horse-fallback')) {
            fallback.style.display = 'flex';
          }
        }
      };
      tryLoadImage();
    }
    noPopup.classList.add('active');
  }

  function closeNoPopup() {
    if (noPopup) {
      noPopup.classList.remove('active');
    }
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = 0;
  let currentY = 0;
  let animationFrameId = null;
  let initialButtonPosition = null;

  function updateMousePosition(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  // Initialize button position
  function initializeButtonPosition() {
    if (!noBtn) return;
    
    const rect = noBtn.getBoundingClientRect();
    initialButtonPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    currentX = initialButtonPosition.x;
    currentY = initialButtonPosition.y;
  }

  function fleeFromCursor() {
    if (!noBtn) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      return;
    }
    if (noBtn.classList.contains('shake')) {
      animationFrameId = requestAnimationFrame(fleeFromCursor);
      return;
    }

    // Calculate distance from cursor to button center
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 200 && distance > 0) {
      const angle = Math.atan2(dy, dx);
      
      // Calculate how fast to move (faster when closer, minimum speed to keep moving)
      const fleeSpeed = Math.max(8, (200 - distance) / 2.5);
      
      // Calculate new position (move away from cursor)
      const moveX = -Math.cos(angle) * fleeSpeed;
      const moveY = -Math.sin(angle) * fleeSpeed;
      currentX += moveX;
      currentY += moveY;
      
      // Keep button within viewport bounds
      const buttonWidth = noBtn.offsetWidth;
      const buttonHeight = noBtn.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 10;
      currentX = Math.max(buttonWidth / 2 + padding, Math.min(viewportWidth - buttonWidth / 2 - padding, currentX));
      currentY = Math.max(buttonHeight / 2 + padding, Math.min(viewportHeight - buttonHeight / 2 - padding, currentY));
      noBtn.style.transition = 'none';
      noBtn.style.position = 'fixed';
      noBtn.style.left = (currentX - buttonWidth / 2) + 'px';
      noBtn.style.top = (currentY - buttonHeight / 2) + 'px';
      noBtn.style.transform = 'none';
    }
    animationFrameId = requestAnimationFrame(fleeFromCursor);
  }

  // Move No button to random position (for shake effect)
  function moveNoButtonRandom() {
    if (!noBtn) return;
    
    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;
    currentX = padding + buttonWidth / 2 + Math.random() * (viewportWidth - buttonWidth - padding * 2);
    currentY = padding + buttonHeight / 2 + Math.random() * (viewportHeight - buttonHeight - padding * 2);
    
    // Apply with transition for smooth movement
    noBtn.style.transition = 'left 0.3s ease, top 0.3s ease';
    noBtn.style.position = 'fixed';
    noBtn.style.left = (currentX - buttonWidth / 2) + 'px';
    noBtn.style.top = (currentY - buttonHeight / 2) + 'px';
    noBtn.style.transform = 'none';
  }

  if (yesBtn) {
    yesBtn.addEventListener('click', handleYesClick);
  }

  if (noBtn) {
    initializeButtonPosition();
    
    noBtn.addEventListener('click', handleNoClick);
    noBtn.addEventListener('touchstart', handleNoClick);
    
    // Track mouse movement globally
    document.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('resize', function() {
      if (initialButtonPosition) {
        const rect = noBtn.getBoundingClientRect();
        currentX = rect.left + rect.width / 2;
        currentY = rect.top + rect.height / 2;
      }
    });
    fleeFromCursor();
  }

  if (noPopupClose) {
    noPopupClose.addEventListener('click', closeNoPopup);
  }

  if (noPopup) {
    noPopup.addEventListener('click', function(e) {
      if (e.target === noPopup) {
        closeNoPopup();
      }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && noPopup.classList.contains('active')) {
        closeNoPopup();
      }
    });
  }

  if (musicToggle && bgMusic) {
    bgMusic.volume = onReasonsPage ? 0.08 : 0.5;
    bgMusic.muted = false; // Start unmuted
    
    // If the audio file can't be loaded (wrong path / missing file), guide the user
    bgMusic.addEventListener('error', function () {
      musicToggle.disabled = true;
      musicToggle.classList.remove('hidden');
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.textContent = 'Music file not found — put an MP3 in /music';
    });
    function attemptAutoplay() {
      tryAutoplayUnmuted();
      if (bgMusic.readyState < 2) {
        bgMusic.addEventListener('canplay', function() {
          tryAutoplayUnmuted();
        }, { once: true });
        
        bgMusic.addEventListener('loadeddata', function() {
          tryAutoplayUnmuted();
        }, { once: true });
      }
    }
    setTimeout(function() {
      attemptAutoplay();
    }, 100);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(attemptAutoplay, 100);
      });
    }
    window.addEventListener('load', function() {
      setTimeout(attemptAutoplay, 100);
    });
    let autoplayAttempted = false;
    function tryAutoplayOnInteraction() {
      if (!autoplayAttempted && bgMusic.paused) {
        autoplayAttempted = true;
        tryAutoplayUnmuted();
      }
    }
    
    // Try autoplay on first user interaction (as fallback)
    document.addEventListener('click', tryAutoplayOnInteraction, { once: true });
    document.addEventListener('touchstart', tryAutoplayOnInteraction, { once: true });
    document.addEventListener('mousedown', tryAutoplayOnInteraction, { once: true });

    musicToggle.addEventListener('click', async function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (bgMusic.paused) {
        const ok = await tryPlayMusic();
        setMusicButton(ok && !bgMusic.paused);
        if (!ok) {
          musicToggle.textContent = 'Tap again to play 🎵';
        }
      } else {
        pauseMusic();
        setMusicButton(false);
      }
    });
    bgMusic.addEventListener('pause', function () {
      setMusicButton(false);
    });
    bgMusic.addEventListener('play', function () {
      setMusicButton(true);
    });
  }

  if (viewGalleryBtn) {
    viewGalleryBtn.addEventListener('click', handleViewGallery);
  }
  
  if (backFromGalleryBtn) {
    backFromGalleryBtn.addEventListener('click', handleBackFromGallery);
  }

  if (mysteryBoxEl) {
    mysteryBoxEl.addEventListener('click', function() {
      mysteryBoxAlreadyOpened = true;
      showPage(galleryPage);
    });
  }

  const hubGalleryBtn = document.getElementById('hub-gallery-btn');
  if (hubGalleryBtn) {
    hubGalleryBtn.addEventListener('click', function() { showPage(galleryPage); });
  }

  const backFromHubBtn = document.getElementById('back-from-hub');
  if (backFromHubBtn) {
    backFromHubBtn.addEventListener('click', handleBackFromHub);
  }

  // New page navigation handlers
  const backFromReasonsBtn = document.getElementById('back-from-reasons');
  const backFromJokesBtn = document.getElementById('back-from-jokes');
  const backFromLetterBtn = document.getElementById('back-from-letter');
  const backFromOpenWhenBtn = document.getElementById('back-from-open-when');
  
  if (backFromReasonsBtn) {
    backFromReasonsBtn.addEventListener('click', handleBackFromReasons);
  }
  
  if (backFromJokesBtn) {
    backFromJokesBtn.addEventListener('click', handleBackFromJokes);
  }
  
  if (backFromLetterBtn) {
    backFromLetterBtn.addEventListener('click', handleBackFromLetter);
  }
  
  if (backFromOpenWhenBtn) {
    backFromOpenWhenBtn.addEventListener('click', handleBackFromOpenWhen);
  }

  createFloatingHearts();
  initializeGallery();
  initializeReasonsPage();
  initializeJokesPage();
  initializeLetterPage();
  initializeOpenWhenPage();
  initializeEasterEggs();
  setupPageFlow();
})();
