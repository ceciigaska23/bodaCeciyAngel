// ===== MAIN JAVASCRIPT - WEDDING INVITATION =====

// Variables globales
let musicPlaying = false;
const weddingMusic = document.getElementById('weddingMusic');
const musicToggle = document.getElementById('musicToggle');
const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');

// ===== SPLASH SCREEN FUNCTIONALITY =====
function startInvitation() {
    // Reproducir música
    if (weddingMusic) {
        weddingMusic.play().catch(error => {
            console.log("No se pudo reproducir la música automáticamente:", error);
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Asignar el evento de clic a la pantalla de splash para iniciar todo
    if (splashScreen) {
        splashScreen.addEventListener('click', startInvitation);
    }
    
    // Aquí puedes dejar el resto de tu lógica de inicialización
    // como setupFormHandlers(), initAnimations(), etc.
    console.log('Invitación de boda cargada correctamente 💕');
});

// ===== MUSIC FUNCTIONALITY =====
// function playMusic() {
//     if (weddingMusic) {
//         weddingMusic.play()
//             .then(() => {
//                 musicPlaying = true;
//                 updateMusicButton();
//             })
//             .catch(error => {
//                 console.log('Error reproduciendo música:', error);
//                 // Fallback: mostrar botón para que el usuario pueda reproducir manualmente
//                 updateMusicButton();
//             });
//     }
// }

// function pauseMusic() {
//     if (weddingMusic) {
//         weddingMusic.pause();
//         musicPlaying = false;
//         updateMusicButton();
//     }
// }

// function toggleMusic() {
//     if (musicPlaying) {
//         pauseMusic();
//     } else {
//         playMusic();
//     }
// }

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
// Configuración de Google Apps Script

let currentGuestData = null;
let maxCompanionsAllowed = 0;

async function searchGuest() {
    const searchName = document.getElementById('searchName').value.trim();
    const searchResult = document.getElementById('searchResult');
    const confirmationForm = document.getElementById('confirmationForm');
    
    if (!searchName) {
        searchResult.innerHTML = '<p>Por favor ingresa un nombre para buscar.</p>';
        searchResult.className = 'search-result not-found';
        return;
    }
    
    searchResult.innerHTML = '<p>Buscando...</p>';
    searchResult.className = 'search-result';
    
    try {
        const response = await fetch(`${SEARCH_SCRIPT_URL}?action=search&name=${encodeURIComponent(searchName)}`);
        const data = await response.json();
        
        if (data.found) {
            currentGuestData = data.guest;
            maxCompanionsAllowed = data.guest.maxCompanions || 0;
            
            searchResult.innerHTML = `
                <p><strong>¡Invitado encontrado!</strong></p>
                <p><strong>Nombre:</strong> ${data.guest.name}</p>
                <p><strong>Acompañantes permitidos:</strong> ${maxCompanionsAllowed}</p>
            `;
            searchResult.className = 'search-result found';
            
            // Llenar el formulario
            document.getElementById('guestName').value = data.guest.name;
            document.getElementById('email').value = data.guest.email || '';
            document.getElementById('phone').value = data.guest.phone || '';
            
            // Mostrar formulario
            confirmationForm.style.display = 'block';
            
            // Actualizar información de acompañantes
            updateCompanionsInfo();
            
        } else {
            searchResult.innerHTML = `
                <p><strong>Invitado no encontrado</strong></p>
                <p>Por favor verifica que hayas escrito tu nombre exactamente como aparece en la invitación, o contacta a los novios.</p>
            `;
            searchResult.className = 'search-result not-found';
            confirmationForm.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        searchResult.innerHTML = `
            <p><strong>Error de conexión</strong></p>
            <p>No se pudo realizar la búsqueda. Por favor intenta nuevamente o contacta a los novios.</p>
        `;
        searchResult.className = 'search-result not-found';
    }
}

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
        <p>${message}</p>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Agregar estilos para notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4dd0c7' : '#ff6b47'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    setupFormHandlers();
    initAnimations();
    addFadeInUpAnimation();
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