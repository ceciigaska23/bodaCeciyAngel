// ===== COUNTDOWN FUNCTIONALITY =====

// Fecha de la boda (30 de octubre 2026, 4:00 PM)
const WEDDING_DATE = new Date('2026-10-30T16:00:00').getTime();

// Elementos del DOM
let daysElement, hoursElement, minutesElement, secondsElement;

// ===== INICIALIZACIÓN DEL COUNTDOWN =====
function initCountdown() {
    // Obtener elementos del DOM
    daysElement = document.getElementById('days');
    hoursElement = document.getElementById('hours');
    minutesElement = document.getElementById('minutes');
    secondsElement = document.getElementById('seconds');
    
    // Verificar que los elementos existen
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
        console.error('No se encontraron todos los elementos del countdown');
        return;
    }
    
    // Actualizar countdown inmediatamente
    updateCountdown();
    
    // Iniciar el intervalo para actualizar cada segundo
    setInterval(updateCountdown, 1000);
    
    console.log('Countdown inicializado correctamente');
}

// ===== FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN =====
function updateCountdown() {
    const now = new Date().getTime();
    const timeDistance = WEDDING_DATE - now;
    
    // Si la fecha ya pasó
    if (timeDistance < 0) {
        showWeddingDay();
        return;
    }
    
    // Calcular tiempo restante
    const days = Math.floor(timeDistance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDistance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDistance % (1000 * 60)) / 1000);
    
    // Actualizar elementos del DOM
    daysElement.textContent = String(days).padStart(2, '0');
    hoursElement.textContent = String(hours).padStart(2, '0');
    minutesElement.textContent = String(minutes).padStart(2, '0');
    secondsElement.textContent = String(seconds).padStart(2, '0');
}

// ===== MOSTRAR MENSAJE DEL DÍA DE LA BODA =====
function showWeddingDay() {
    const countdownContainer = document.getElementById('countdown');
    if (countdownContainer) {
        countdownContainer.innerHTML = `
            <div class="wedding-day-message">
                <h3>🎉 ¡Hoy es nuestro gran día! 🎉</h3>
                <div class="celebration-animation">
                    <span class="celebration-icon">💒</span>
                    <span class="celebration-icon">💍</span>
                    <span class="celebration-icon">🎊</span>
                    <span class="celebration-icon">💐</span>
                </div>
                <p>¡Nos vemos en la ceremonia!</p>
            </div>
        `;
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('invitationContainer');
    if (mainContent && mainContent.style.display !== 'none') {
        initCountdown();
    } else {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.style.display !== 'none') {
                    initCountdown();
                    observer.disconnect();
                }
            });
        });
        
        if (mainContent) {
            observer.observe(mainContent, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
        }
    }
});