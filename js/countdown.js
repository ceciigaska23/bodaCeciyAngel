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
    const timeUnits = calculateTimeUnits(timeDistance);
    
    // Actualizar elementos del DOM con animación
    updateTimeElement(daysElement, timeUnits.days);
    updateTimeElement(hoursElement, timeUnits.hours);
    updateTimeElement(minutesElement, timeUnits.minutes);
    updateTimeElement(secondsElement, timeUnits.seconds);
    
    // Agregar efectos especiales en momentos importantes
    addSpecialEffects(timeUnits);
}

// ===== CALCULAR UNIDADES DE TIEMPO =====
function calculateTimeUnits(timeDistance) {
    const days = Math.floor(timeDistance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDistance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDistance % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
}

// ===== ACTUALIZAR ELEMENTO CON ANIMACIÓN =====
function updateTimeElement(element, newValue) {
    if (!element) return;
    
    const currentValue = element.textContent;
    const formattedNewValue = String(newValue).padStart(2, '0');
    
    // Solo actualizar si el valor cambió
    if (currentValue !== formattedNewValue) {
        // Agregar clase de animación
        element.classList.add('updating');
        
        // Cambiar el valor después de un pequeño delay
        setTimeout(() => {
            element.textContent = formattedNewValue;
            element.classList.remove('updating');
        }, 150);
    }
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
        
        // Agregar estilos para el mensaje del día de la boda
        addWeddingDayStyles();
    }
}

// ===== EFECTOS ESPECIALES SEGÚN EL TIEMPO RESTANTE =====
function addSpecialEffects(timeUnits) {
    const { days, hours, minutes, seconds } = timeUnits;
    
    // Efectos para momentos especiales
    if (days === 0 && hours === 0 && minutes === 0) {
        // Últimos 60 segundos
        addUrgencyEffect();
    } else if (days === 0 && hours === 0) {
        // Última hora
        addFinalHourEffect();
    } else if (days === 0) {
        // Último día
        addFinalDayEffect();
    } else if (days === 7) {
        // Última semana
        addWeeklyEffect();
    } else if (days === 30) {
        // Último mes
        addMonthlyEffect();
    }
    
    // Efecto de parpadeo cada 10 segundos
    if (seconds % 10 === 0) {
        addPeriodicPulse();
    }
}

// ===== EFECTOS VISUALES =====
function addUrgencyEffect() {
    const countdown = document.querySelector('.countdown');
    if (countdown && !countdown.classList.contains('urgent')) {
        countdown.classList.add('urgent');
    }
}

function addFinalHourEffect() {
    const countdown = document.querySelector('.countdown');
    if (countdown && !countdown.classList.contains('final-hour')) {
        countdown.classList.add('final-hour');
    }
}

function addFinalDayEffect() {
    const countdown = document.querySelector('.countdown');
    if (countdown && !countdown.classList.contains('final-day')) {
        countdown.classList.add('final-day');
    }
}

function addWeeklyEffect() {
    const countdown = document.querySelector('.countdown');
    if (countdown && !countdown.classList.contains('weekly')) {
        countdown.classList.add('weekly');
        // Mostrar notificación especial
        showSpecialNotification('¡Solo queda una semana! 💕');
    }
}

function addMonthlyEffect() {
    const countdown = document.querySelector('.countdown');
    if (countdown && !countdown.classList.contains('monthly')) {
        countdown.classList.add('monthly');
        showSpecialNotification('¡Solo queda un mes para nuestra boda! 🎉');
    }
}

function addPeriodicPulse() {
    const timeUnits = document.querySelectorAll('.time-unit');
    timeUnits.forEach((unit, index) => {
        setTimeout(() => {
            unit.classList.add('pulse');
            setTimeout(() => {
                unit.classList.remove('pulse');
            }, 500);
        }, index * 100);
    });
}

// ===== NOTIFICACIONES ESPECIALES =====
function showSpecialNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'special-countdown-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">💕</span>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove después de 8 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

// ===== FUNCIONES UTILITARIAS =====
function getTimeUntilWedding() {
    const now = new Date().getTime();
    const timeDistance = WEDDING_DATE - now;
    return timeDistance > 0 ? calculateTimeUnits(timeDistance) : null;
}

function formatTimeUnit(value, singular, plural) {
    return value === 1 ? `${value} ${singular}` : `${value} ${plural}`;
}

function getWeddingCountdownText() {
    const timeUnits = getTimeUntilWedding();
    if (!timeUnits) return '¡Ya es el gran día!';
    
    const { days, hours, minutes, seconds } = timeUnits;
    
    if (days > 0) {
        return `Faltan ${formatTimeUnit(days, 'día', 'días')}`;
    } else if (hours > 0) {
        return `Faltan ${formatTimeUnit(hours, 'hora', 'horas')}`;
    } else if (minutes > 0) {
        return `Faltan ${formatTimeUnit(minutes, 'minuto', 'minutos')}`;
    } else {
        return `Faltan ${formatTimeUnit(seconds, 'segundo', 'segundos')}`;
    }
}

// ===== AGREGAR ESTILOS CSS DINÁMICOS =====
function addCountdownStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animaciones para actualización de números */
        .time-number.updating {
            animation: numberFlip 0.3s ease-in-out;
        }
        
        @keyframes numberFlip {
            0% { transform: rotateX(0deg); }
            50% { transform: rotateX(90deg); }
            100% { transform: rotateX(0deg); }
        }
        
        /* Efectos especiales */
        .countdown.urgent {
            animation: urgentPulse 1s ease-in-out infinite;
            background: linear-gradient(135deg, #ff6b47, #e55a3c);
        }
        
        @keyframes urgentPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        .countdown.final-hour {
            animation: finalHourGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes finalHourGlow {
            0% { box-shadow: 0 0 20px rgba(255, 107, 71, 0.5); }
            100% { box-shadow: 0 0 40px rgba(255, 107, 71, 0.8); }
        }
        
        .countdown.final-day {
            background: linear-gradient(135deg, #ff6b47, #4dd0c7);
            animation: finalDayShimmer 3s linear infinite;
        }
        
        @keyframes finalDayShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .time-unit.pulse {
            animation: unitPulse 0.5s ease-out;
        }
        
        @keyframes unitPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* Mensaje del día de la boda */
        .wedding-day-message {
            text-align: center;
            padding: 30px;
        }
        
        .wedding-day-message h3 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            animation: celebrationBounce 1s ease-in-out infinite;
        }
        
        @keyframes celebrationBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .celebration-animation {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
        }
        
        .celebration-icon {
            font-size: 2rem;
            animation: celebrationFloat 2s ease-in-out infinite;
        }
        
        .celebration-icon:nth-child(2) {
            animation-delay: 0.5s;
        }
        
        .celebration-icon:nth-child(3) {
            animation-delay: 1s;
        }
        
        .celebration-icon:nth-child(4) {
            animation-delay: 1.5s;
        }
        
        @keyframes celebrationFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(5deg); }
            50% { transform: translateY(-10px) rotate(-5deg); }
            75% { transform: translateY(-20px) rotate(3deg); }
        }
        
        /* Notificaciones especiales */
        .special-countdown-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4dd0c7, #7bb5a8);
            color: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(77, 208, 199, 0.4);
            z-index: 10000;
            animation: specialNotificationSlide 0.5s ease-out;
            max-width: 400px;
            text-align: center;
        }
        
        @keyframes specialNotificationSlide {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        .notification-content {
            position: relative;
        }
        
        .notification-icon {
            font-size: 2rem;
            display: block;
            margin-bottom: 15px;
            animation: notificationIconSpin 2s linear infinite;
        }
        
        @keyframes notificationIconSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .notification-content button {
            position: absolute;
            top: -10px;
            right: -10px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            transition: background 0.3s ease;
        }
        
        .notification-content button:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .wedding-day-message h3 {
                font-size: 2rem;
            }
            
            .celebration-icon {
                font-size: 1.5rem;
            }
            
            .special-countdown-notification {
                max-width: 300px;
                padding: 20px;
            }
        }
    `;
    document.head.appendChild(style);
}

function addWeddingDayStyles() {
    if (!document.getElementById('wedding-day-styles')) {
        const style = document.createElement('style');
        style.id = 'wedding-day-styles';
        style.textContent = `
            .wedding-day-message {
                background: linear-gradient(135deg, #4dd0c7, #ff6b47);
                color: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                animation: weddingDayGlow 2s ease-in-out infinite alternate;
            }
            
            @keyframes weddingDayGlow {
                0% { box-shadow: 0 0 30px rgba(255, 107, 71, 0.6); }
                100% { box-shadow: 0 0 50px rgba(77, 208, 199, 0.8); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Agregar estilos CSS
    addCountdownStyles();
    
    // Esperar a que el contenido principal sea visible
    const mainContent = document.getElementById('mainContent');
    if (mainContent && mainContent.style.display !== 'none') {
        initCountdown();
    } else {
        // Esperar a que se muestre el contenido principal
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

// ===== EXPORT PARA USO EXTERNO =====
window.CountdownModule = {
    getTimeUntilWedding,
    getWeddingCountdownText,
    updateCountdown
};