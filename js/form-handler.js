// ===== FORM HANDLER - WEDDING INVITATION - VERSIÓN LIMPIA =====

// Configuración para Vercel - CAMBIA ESTA URL POR TU DOMINIO DE VERCEL
const getBackendUrl = () => {
  // Si estamos en localhost, usar el backend local (o el puerto que uses)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'; 
  }
  // Si no, usar la URL de producción de Vercel
  return "https://boda-cecily-angel-backend.vercel.app";
};

const WEDDING_BACKEND_URL = getBackendUrl();
// Variables globales únicas para evitar conflictos
let weddingFormSubmitting = false;
let weddingCurrentGuest = null;
let weddingMaxCompanions = 0;

// ===== DEFINIR FUNCIONES GLOBALES INMEDIATAMENTE =====
window.searchGuest = async function() {
  console.log('🔍 Función searchGuest ejecutada');
  
  const searchInput = document.getElementById("searchName");
  const searchButton = document.getElementById("searchButton");
  const searchResult = document.getElementById("searchResult");
  
  if (!searchInput) {
    console.error('❌ Input de búsqueda no encontrado');
    alert('Error: Campo de búsqueda no encontrado');
    return;
  }
  
  if (!searchResult) {
    console.error('❌ Contenedor de resultado no encontrado');
    alert('Error: Contenedor de resultado no encontrado');
    return;
  }

  const guestName = searchInput.value.trim();
  console.log('📝 Nombre a buscar:', guestName);
  
  if (guestName.length < 2) {
    showWeddingNotification("Por favor, ingresa al menos 2 letras", "error");
    return;
  }

  // Mostrar estado de carga
  searchResult.innerHTML = '<div class="loading">🔍 Buscando invitado...</div>';
  searchResult.className = "search-result loading";
  searchResult.style.display = "block";
  
  if (searchButton) {
    searchButton.disabled = true;
    searchButton.textContent = "Buscando...";
  }

  try {
    console.log('🔍 Iniciando búsqueda para:', guestName);
    
    // Construir URL de búsqueda
    const searchUrl = `${WEDDING_BACKEND_URL}/api/search?name=${encodeURIComponent(guestName)}`;
    console.log('📡 URL de búsqueda:', searchUrl);

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    console.log('📨 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📄 Datos recibidos:', data);

    hideWeddingForms();

    if (data.found && data.guest) {
      handleWeddingGuestFound(data.guest);
      showWeddingNotification("¡Invitado encontrado!", "success");
    } else {
      handleWeddingGuestNotFound(data.error || data.message || "Invitado no encontrado.");
      showWeddingNotification("Invitado no encontrado", "error");
    }

  } catch (error) {
    console.error("❌ Error en la búsqueda:", error);
    
    let errorMessage = "Error de conexión. Por favor, inténtalo de nuevo.";
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
    } else if (error.message.includes('HTTP')) {
      errorMessage = `Error del servidor: ${error.message}`;
    }
    
    handleWeddingGuestNotFound(errorMessage);
    showWeddingNotification(errorMessage, "error");
  } finally {
    if (searchButton) {
      searchButton.disabled = false;
      searchButton.textContent = "Buscar";
    }
  }
};

window.addCompanion = function() {
  console.log('➕ Función addCompanion ejecutada');
  addWeddingCompanionField();
};

window.removeCompanionField = function(button) {
  console.log('➖ Función removeCompanionField ejecutada');
  if (button && button.parentElement) {
    button.parentElement.remove();
    updateWeddingAddCompanionButton();
    renumberWeddingCompanions();
  }
};

// ===== FUNCIONES INTERNAS =====

function addWeddingCompanionField(name = '', readonly = false) {
  const companionsList = document.getElementById("companionsList");
  if (!companionsList) {
    console.error('❌ Lista de acompañantes no encontrada');
    return;
  }
  
  const currentCount = companionsList.querySelectorAll('.companion-input-group').length;
  
  if (currentCount >= weddingMaxCompanions) {
    showWeddingNotification(`Solo puedes agregar hasta ${weddingMaxCompanions} acompañantes.`, "error");
    return;
  }

  const companionDiv = document.createElement("div");
  companionDiv.className = "companion-input-group";
  
  companionDiv.innerHTML = `
    <input 
      type="text" 
      name="companionName[]" 
      placeholder="Nombre del acompañante" 
      value="${name}"
      ${readonly ? 'readonly' : ''}
      required
    >
    <div class="attendance-radio">
      <label><input type="radio" name="companionAttendance[${currentCount}]" value="si" required> Sí</label>
      <label><input type="radio" name="companionAttendance[${currentCount}]" value="no" required> No</label>
    </div>
    <select name="companionAge[]" required>
      <option value="">Edad</option>
      <option value="adulto">Adulto</option>
      <option value="nino">Niño</option>
    </select>
    ${!readonly ? '<button type="button" class="remove-companion-btn" onclick="window.removeCompanionField(this)">×</button>' : ''}
  `;
  
  companionsList.appendChild(companionDiv);
  updateWeddingAddCompanionButton();
}

function updateWeddingAddCompanionButton() {
  const companionsList = document.getElementById("companionsList");
  const addCompanionBtn = document.getElementById("addCompanionBtn");
  
  if (!companionsList || !addCompanionBtn) return;
  
  const currentCount = companionsList.querySelectorAll('.companion-input-group').length;
  
  if (currentCount >= weddingMaxCompanions) {
    addCompanionBtn.style.display = 'none';
  } else {
    addCompanionBtn.style.display = 'block';
  }
}

function renumberWeddingCompanions() {
  const companionGroups = document.querySelectorAll('.companion-input-group');
  companionGroups.forEach((group, index) => {
    const radios = group.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      const baseName = radio.name.split('[')[0];
      radio.name = `${baseName}[${index}]`;
    });
  });
}

function handleWeddingGuestFound(guestData) {
  const searchResult = document.getElementById("searchResult");
  const confirmationForm = document.getElementById("confirmationForm");
  
  console.log('✅ Invitado encontrado:', guestData);
  
  // Guardar datos del invitado
  weddingCurrentGuest = guestData;
  weddingMaxCompanions = guestData.maxCompanions || 0;

  // Actualizar UI
  searchResult.innerHTML = `
    <div class="guest-found">
      <div class="success-icon">✅</div>
      <h4>¡Invitado encontrado!</h4>
      <div class="guest-info">
        <p><strong>Nombre:</strong> ${guestData.name}</p>
        ${weddingMaxCompanions > 0 
          ? `<p><strong>Acompañantes permitidos:</strong> ${weddingMaxCompanions}</p>` 
          : "<p><strong>Invitación individual</strong></p>"
        }
      </div>
    </div>
  `;
  searchResult.className = "search-result found";
  searchResult.style.display = "block";

  // Llenar formulario
  fillWeddingFormData(guestData);
  setupWeddingCompanions();

  if (confirmationForm) {
    confirmationForm.style.display = 'block';
    confirmationForm.scrollIntoView({ behavior: 'smooth' });
  }
}

function fillWeddingFormData(guest) {
  const guestNameInput = document.getElementById("guestName");
  
  if (guestNameInput) {
    guestNameInput.value = guest.name;
    guestNameInput.setAttribute('data-guest-id', guest.id);
  }
}

function setupWeddingCompanions() {
  const companionsSection = document.getElementById("companionsSection");
  const companionsList = document.getElementById("companionsList");
  const maxCompanionsSpan = document.getElementById("maxCompanions");
  
  if (maxCompanionsSpan) {
    maxCompanionsSpan.textContent = weddingMaxCompanions;
  }

  if (companionsList) {
    companionsList.innerHTML = '';
  }
  
  if (weddingMaxCompanions > 0 && companionsSection) {
    companionsSection.style.display = 'block';
    
    // Agregar nombres predefinidos si existen
    if (weddingCurrentGuest.companionNames && weddingCurrentGuest.companionNames.length > 0) {
      weddingCurrentGuest.companionNames.forEach(name => {
        if (name.trim()) {
          addWeddingCompanionField(name.trim(), true);
        }
      });
    }
  } else if (companionsSection) {
    companionsSection.style.display = 'none';
  }
}

function handleWeddingGuestNotFound(message) {
  const searchResult = document.getElementById("searchResult");
  searchResult.innerHTML = `
    <div class="guest-not-found">
      <div class="error-icon">❌</div>
      <h4>Invitado no encontrado</h4>
      <p>${message}</p>
      <p><small>Verifica que el nombre esté escrito correctamente o contacta a los organizadores.</small></p>
    </div>
  `;
  searchResult.className = "search-result not-found";
  searchResult.style.display = "block";
}

function hideWeddingForms() {
  const elementsToHide = ["searchResult", "confirmationForm", "companionsSection"];
  elementsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.className = "";
    }
  });
}

// ===== CONFIGURACIÓN DE EVENTOS =====
function initWeddingFormHandler() {
  console.log("🎯 Inicializando Wedding Form Handler...");
  
  setupWeddingSearch();
  setupWeddingFormSubmission();
  setupWeddingAttendance();
  setupWeddingAddCompanionButton();
  
  console.log("✅ Wedding Form Handler inicializado");
  console.log("🌐 Backend URL:", WEDDING_BACKEND_URL);
  
  testWeddingBackend();
}

function setupWeddingSearch() {
  const searchInput = document.getElementById("searchName");
  const searchButton = document.getElementById("searchButton");
  
  if (searchInput) {
    console.log("✅ Input de búsqueda encontrado");
    
    searchInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        console.log("⌨️ Enter presionado en búsqueda");
        window.searchGuest();
      }
    });
    
    searchInput.addEventListener("input", function() {
      hideWeddingForms();
    });
  } else {
    console.error("❌ Input de búsqueda NO encontrado");
  }
  
  if (searchButton) {
    console.log("✅ Botón de búsqueda encontrado");
    
    searchButton.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🖱️ Botón de búsqueda clickeado");
      window.searchGuest();
    });
  } else {
    console.error("❌ Botón de búsqueda NO encontrado");
  }
}

function setupWeddingAttendance() {
  const attendanceSelect = document.getElementById("attendance");
  if (attendanceSelect) {
    attendanceSelect.addEventListener("change", function() {
      const companionsSection = document.getElementById("companionsSection");
      if (this.value === "si" && weddingMaxCompanions > 0) {
        companionsSection.style.display = "block";
      } else {
        companionsSection.style.display = "none";
        const companionsList = document.getElementById("companionsList");
        if (companionsList) {
          companionsList.innerHTML = "";
        }
      }
    });
  }
}

function setupWeddingAddCompanionButton() {
  const addCompanionBtn = document.getElementById("addCompanionBtn");
  if (addCompanionBtn) {
    console.log("✅ Botón agregar acompañante encontrado");
    addCompanionBtn.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("🖱️ Botón agregar acompañante clickeado");
      window.addCompanion();
    });
  } else {
    console.log("⚠️ Botón agregar acompañante NO encontrado (se agregará después)");
  }
}

function setupWeddingFormSubmission() {
  const confirmationForm = document.getElementById("confirmationForm");

  if (confirmationForm) {
    confirmationForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      
      if (weddingFormSubmitting) {
        console.log('⚠️ Envío ya en progreso');
        return;
      }
      
      weddingFormSubmitting = true;

      const submitButton = confirmationForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = "Enviando...";
      submitButton.disabled = true;

      try {
        const formData = collectWeddingFormData();
        console.log('📝 Datos a enviar:', formData);

        if (!validateWeddingFormData(formData)) {
          throw new Error('Datos del formulario inválidos');
        }

        const response = await fetch(`${WEDDING_BACKEND_URL}/api/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('📄 Resultado:', result);

        if (result.success) {
          showWeddingSuccessMessage(result.confirmationNumber || 'N/A');
        } else {
          throw new Error(result.error || 'Error desconocido');
        }

      } catch (error) {
        console.error('❌ Error enviando formulario:', error);
        showWeddingNotification(`Error: ${error.message}`, "error");
      } finally {
        weddingFormSubmitting = false;
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    });
  }
}

function collectWeddingFormData() {
  const guestNameInput = document.getElementById("guestName");
  const attendanceSelect = document.getElementById("attendance");
  const dietaryTextarea = document.getElementById("dietary");

  const companions = [];
  const companionGroups = document.querySelectorAll('.companion-input-group');
  
  companionGroups.forEach((group, index) => {
    const nameInput = group.querySelector('input[name="companionName[]"]');
    const attendanceInput = group.querySelector(`input[name="companionAttendance[${index}]"]:checked`);
    const ageSelect = group.querySelector('select[name="companionAge[]"]');
    
    if (nameInput && attendanceInput && ageSelect && nameInput.value.trim()) {
      companions.push({
        name: nameInput.value.trim(),
        attendance: attendanceInput.value,
        age: ageSelect.value
      });
    }
  });

  return {
    id: guestNameInput.getAttribute('data-guest-id') || weddingCurrentGuest?.id,
    name: guestNameInput.value.trim(),
    attendance: attendanceSelect.value,
    dietary: dietaryTextarea.value.trim() || '',
    companions: companions
  };
}

function validateWeddingFormData(data) {
  if (!data.id || !data.name || !data.attendance) {
    showWeddingNotification('Faltan datos requeridos', 'error');
    return false;
  }
  
  if (data.attendance === 'si' && data.companions.length > weddingMaxCompanions) {
    showWeddingNotification(`Máximo ${weddingMaxCompanions} acompañantes`, 'error');
    return false;
  }
  
  return true;
}

function showWeddingSuccessMessage(confirmationNumber) {
  const searchResult = document.getElementById("searchResult");
  const confirmationForm = document.getElementById("confirmationForm");
  
  searchResult.innerHTML = `
    <div class="success-message">
      <div class="success-icon">🎉</div>
      <h4>¡Confirmación enviada exitosamente!</h4>
      <p><strong>Número:</strong> ${confirmationNumber}</p>
      <p>¡Nos vemos en la boda!</p>
      <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 15px;">
        Nueva Búsqueda
      </button>
    </div>
  `;
  searchResult.className = "search-result success";
  searchResult.style.display = "block";
  
  if (confirmationForm) {
    confirmationForm.style.display = 'none';
  }
  
  showWeddingNotification("¡Confirmación enviada! 🎉", "success");
}

async function testWeddingBackend() {
  try {
    console.log('🧪 Testing backend connection...');
    const response = await fetch(`${WEDDING_BACKEND_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend conectado:', data);
    }
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
  }
}

// ===== NOTIFICACIONES =====
function showWeddingNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll('.wedding-notification');
  existingNotifications.forEach(n => n.remove());

  const notification = document.createElement("div");
  notification.className = `wedding-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${getWeddingNotificationIcon(type)}</span>
      <p>${message}</p>
      <button onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    animation: slideIn 0.3s ease-out;
  `;

  const content = notification.querySelector('.notification-content');
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 20px;
    color: white;
    border-radius: 10px;
    background: ${getWeddingNotificationColor(type)};
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function getWeddingNotificationIcon(type) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  return icons[type] || icons.info;
}

function getWeddingNotificationColor(type) {
  const colors = {
    success: 'linear-gradient(135deg, #378b85, #4dd0c7)',
    error: 'linear-gradient(135deg, #d4764f, #b85a3e)',
    info: 'linear-gradient(135deg, #7bb5a8, #5a9aa8)',
    warning: 'linear-gradient(135deg, #ff6b47, #e55a3c)'
  };
  return colors[type] || colors.info;
}

// ===== ESTILOS CSS =====
(function addWeddingStyles() {
  if (document.getElementById('wedding-form-styles-unique')) return;
  
  const style = document.createElement('style');
  style.id = 'wedding-form-styles-unique';
  style.textContent = `
    @keyframes slideIn {
      0% { opacity: 0; transform: translateX(100%); }
      100% { opacity: 1; transform: translateX(0); }
    }
    
    .search-result {
      margin-top: 20px;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .search-result.found {
      background: rgba(55, 139, 133, 0.1);
      border: 2px solid #4dd0c7;
    }
    
    .search-result.not-found {
      background: rgba(212, 118, 79, 0.1);
      border: 2px solid #d4764f;
    }
    
    .search-result.success {
      background: rgba(55, 139, 133, 0.15);
      border: 2px solid #4dd0c7;
    }
    
    .search-result.loading {
      background: rgba(123, 181, 168, 0.1);
      border: 2px solid #7bb5a8;
    }
    
    .success-icon, .error-icon {
      font-size: 2.5rem;
      margin-bottom: 15px;
    }
    
    .companion-input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      align-items: center;
      flex-wrap: wrap;
      padding: 10px;
      border-radius: 8px;
      background: rgba(55, 139, 133, 0.05);
    }
    
    .attendance-radio {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .attendance-radio label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      margin: 0;
      cursor: pointer;
    }
    
    .remove-companion-btn {
      background: #d4764f;
      color: white;
      border: none;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
    }
    
    .loading {
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", function() {
  console.log('📋 DOM loaded - Wedding Form Handler');
  
  setTimeout(() => {
    initWeddingFormHandler();
    
    // Debug info
    console.log('🔍 searchGuest:', typeof window.searchGuest);
    console.log('➕ addCompanion:', typeof window.addCompanion);
    console.log('➖ removeCompanionField:', typeof window.removeCompanionField);
    
    console.log('🎉 Wedding Form Handler Ready!');
  }, 100);
});

// ===== FUNCIÓN DE DEBUG =====
window.debugWeddingForm = function() {
  console.log('🐛 DEBUG INFO:');
  console.log('- Backend URL:', WEDDING_BACKEND_URL);
  console.log('- Current Guest:', weddingCurrentGuest);
  console.log('- Max Companions:', weddingMaxCompanions);
  console.log('- Search Input:', document.getElementById("searchName"));
  console.log('- Search Button:', document.getElementById("searchButton"));
};