// ===== MAIN JAVASCRIPT - WEDDING INVITATION =====

// Variables globales
let musicPlaying = false;
const weddingMusic = document.getElementById('weddingMusic');
const musicToggle = document.getElementById('musicToggle');
const splashScreen = document.getElementById('splashScreen');
const mainContent = document.getElementById('mainContent');
const themeToggleBtn = document.getElementById('themeToggle');

// ===== SPLASH SCREEN FUNCTIONALITY =====
function startInvitation() {
    // Reproducir música
    if (weddingMusic) {
        weddingMusic.play().then(() => {
            musicPlaying = true;
            updateMusicButton();
        }).catch(error => {
            console.log("No se pudo reproducir la música automáticamente:", error);
            // Si la reproducción automática falla, al menos actualizamos el botón
            updateMusicButton();
        });
    }

    // Fade out splash screen
    splashScreen.classList.add('fade-out');

    // Show main content after transition
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.style.display = 'block';

        // Fade in main content
        setTimeout(() => {
            mainContent.classList.add('show');
        }, 100);
    }, 1000);
}

// ===== THEME TOGGLE FUNCTIONALITY =====
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Guardar la preferencia
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Cargar la preferencia del tema al cargar la página
(function loadThemePreference() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        document.body.setAttribute('data-theme', storedTheme);
        updateThemeToggleIcon(storedTheme);
    }
})();

// ===== MUSIC FUNCTIONALITY =====
function toggleMusic() {
    if (weddingMusic.paused) {
        weddingMusic.play();
        musicPlaying = true;
    } else {
        weddingMusic.pause();
        musicPlaying = false;
    }
    updateMusicButton();
}

function updateMusicButton() {
    if (musicToggle) {
        if (musicPlaying) {
            musicToggle.innerHTML = '🎵';
            musicToggle.classList.remove('paused');
            musicToggle.title = 'Pausar música';
        } else {
            musicToggle.innerHTML = '🔇';
            musicToggle.classList.add('paused');
            musicToggle.title = 'Reproducir música';
        }
    }
}

// ===== GUEST SEARCH FUNCTIONALITY =====
let currentGuestData = null;
let maxCompanionsAllowed = 0;

// ===== COMPANIONS FUNCTIONALITY =====
function updateCompanionsInfo() {
    const maxCompanionsSpan = document.getElementById('maxCompanions');
    const addCompanionBtn = document.getElementById('addCompanionBtn');
    
    if (maxCompanionsSpan) {
        maxCompanionsSpan.textContent = maxCompanionsAllowed;
    }
    
    // Mostrar/ocultar botón de agregar según el límite
    if (addCompanionBtn) {
        updateAddCompanionButton();
    }
}

function addCompanion() {
    const companionsList = document.getElementById('companionsList');
    const currentCompanions = companionsList.querySelectorAll('.companion-entry').length;
    
    if (currentCompanions >= maxCompanionsAllowed) {
        alert(`Solo puedes agregar hasta ${maxCompanionsAllowed} acompañantes.`);
        return;
    }
    
    const newCompanion = document.createElement('div');
    newCompanion.className = 'companion-entry';
    newCompanion.style.cssText = `
        border: 1px solid var(--border-color-light);
        border-radius: 10px;
        padding: 15px;
        margin: 10px 0;
        background: var(--cream);
    `;
    newCompanion.innerHTML = `
        <div class="form-group">
            <label>Nombre del acompañante</label>
            <input type="text" name="companionName[]" placeholder="Nombre completo" required>
        </div>
        <div class="form-group">
            <label>Edad</label>
            <select name="companionAge[]" required>
                <option value="">Seleccionar</option>
                <option value="adulto">Adulto</option>
                <option value="niño">Niño (3-12 años)</option>
                <option value="bebe">Bebé (0-2 años)</option>
            </select>
        </div>
        <button type="button" class="btn btn-secondary" onclick="removeCompanion(this)">
            Eliminar
        </button>
    `;
    
    companionsList.appendChild(newCompanion);
    updateAddCompanionButton();
}

function removeCompanion(button) {
    button.parentElement.remove();
    updateAddCompanionButton();
}

function updateAddCompanionButton() {
    const companionsList = document.getElementById('companionsList');
    const addCompanionBtn = document.getElementById('addCompanionBtn');
    const currentCompanions = companionsList.querySelectorAll('.companion-entry').length;
    
    if (currentCompanions >= maxCompanionsAllowed) {
        addCompanionBtn.style.display = 'none';
    } else {
        addCompanionBtn.style.display = 'inline-block';
    }
}

// ===== FORM HANDLING =====
function setupFormHandlers() {
    // Mostrar/ocultar sección de acompañantes
    const attendanceSelect = document.getElementById('attendance');
    if (attendanceSelect) {
        attendanceSelect.addEventListener('change', function() {
            const companionsSection = document.getElementById('companionsSection');
            if (this.value === 'si') {
                companionsSection.style.display = 'block';
            } else {
                companionsSection.style.display = 'none';
                // Limpiar acompañantes cuando no asiste
                document.getElementById('companionsList').innerHTML = '';
                updateAddCompanionButton();
            }
        });
    }
    
    // Manejar envío del formulario de búsqueda
    const searchName = document.getElementById('searchName');
    if (searchName) {
        searchName.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchGuest();
            }
        });
    }
}

// ===== ANIMATIONS AND EFFECTS =====
function initAnimations() {
    // Intersection Observer para animaciones de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observar todas las tarjetas de invitación
    const cards = document.querySelectorAll('.invitation-card');
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Agregar CSS para animación fadeInUp
function addFadeInUpAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Agregar estilos para notificación con colores de la paleta
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        z-index: 10001;
        animation: notificationSlideIn 0.3s ease-out;
    `;

    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        padding: 15px 20px;
        color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        position: relative;
        background: ${type === 'success' ? 
            'linear-gradient(135deg, #378b85, #4dd0c7)' : 
            'linear-gradient(135deg, #d4764f, #b85a3e)'};
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ===== ERROR HANDLING =====
function handleError(error, userMessage = 'Ha ocurrido un error inesperado') {
    console.error('Error:', error);
    showNotification(userMessage, 'error');
}

// Funciones para la sección de ubicación
function openMaps() {
    const address = "Av Centenario 1100, Colinas de Tarango, Álvaro Obregón, 01620 Ciudad de México, CDMX";
    const encodedAddress = encodeURIComponent(address);
    
    // Detectar si es dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // En móvil, intentar abrir la app de Maps
        const mapsUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
        window.open(mapsUrl, '_blank');
    } else {
        // En desktop, abrir Google Maps en nueva pestaña
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        window.open(mapsUrl, '_blank');
    }
}

function copyAddress() {
    const address = "Av Centenario 1100, Colinas de Tarango, Álvaro Obregón, 01620 Ciudad de México, CDMX";
    
    // Intentar usar la API moderna del portapapeles
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(address).then(() => {
            showLocationNotification('✅ Dirección copiada al portapapeles', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(address);
        });
    } else {
        fallbackCopyTextToClipboard(address);
    }
}

function shareTransportInfo() {
    const transportInfo = `🚌 Opciones de Transporte - Boda Ceci & Ángel

📍 Lugar: Lienzo Charro "La Tapatía"
📅 Ceremonia: 6:00 PM | Recepción: 7:00 PM
🗺️ Dirección: Av Centenario 1100, Colinas de Tarango, Álvaro Obregón, 01620 CDMX

🚗 EN AUTO:
• Estacionamiento gratuito disponible
• Vía Periférico Sur o Av. Centenario

🚌 RTP Y MICROBÚS:
• Rutas: 57, Z2B, Z2C, 124

🚖 UBER/DIDI/TAXI:
• Opción más cómoda (25-45 min desde el centro)

⏰ Llega 15-20 min antes de la ceremonia`;

    if (navigator.share) {
        navigator.share({
            title: 'Información de Transporte - Boda Ceci & Ángel',
            text: transportInfo
        }).then(() => {
            showLocationNotification('✅ Información compartida exitosamente', 'success');
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                copyTransportInfo(transportInfo);
            }
        });
    } else {
        copyTransportInfo(transportInfo);
    }
}

function copyTransportInfo(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showLocationNotification('✅ Info de transporte copiada al portapapeles', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showLocationNotification('✅ Texto copiado al portapapeles', 'success');
    } catch (err) {
        showLocationNotification('❌ No se pudo copiar el texto', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showLocationNotification(message, type = 'success') {
    // Reutilizar la función de notificación si ya existe, o crear una nueva
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        // Crear notificación simple si no existe la función
        const notification = document.createElement('div');
        notification.innerHTML = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#378b85' : '#d4764f'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: 'Nunito', sans-serif;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Asignar el evento de clic a la pantalla de splash para iniciar todo
    if (splashScreen) {
        splashScreen.addEventListener('click', startInvitation);
    }

    // Configurar theme toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Configurar form handlers
    setupFormHandlers();
    
    // Inicializar animaciones
    initAnimations();
    addFadeInUpAnimation();
    
    // Actualizar botón de música
    updateMusicButton();
    
    console.log('Invitación de boda cargada correctamente 💕');
});

// Manejar errores globales
window.addEventListener('error', function(e) {
    handleError(e.error, 'Error en la aplicación. Por favor recarga la página.');
});

// Prevenir zoom en dispositivos móviles (opcional)
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Agregar estilos CSS para notificaciones
(function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notificationSlideIn {
            0% {
                opacity: 0;
                transform: translateX(100%);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .notification-content {
            display: flex;
            align-items: center;
        }

        .notification-icon {
            font-size: 1.2rem;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .notification-content p {
            margin: 0;
            flex: 1;
        }

        .notification-content button {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            margin-left: 10px;
            font-size: 1.1rem;
            line-height: 1;
        }

        .notification-content button:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 768px) {
            .notification {
                right: 10px;
                left: 10px;
                min-width: auto;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);
})();