// ===== FORM HANDLER - WEDDING INVITATION =====

// Configuración de Google Apps Script URLs
const FORM_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz1qWvbXP8eOGCQ3kJcF2dfKdfPjsKLzmn6rs7AHAceEMkNzlwLLyZCT3Z0W6dWhKWj/exec";

// Variables globales para manejo del formulario
let isSubmitting = false;
let validationRules = {};

// ===== INICIALIZACIÓN DEL MANEJADOR DE FORMULARIOS =====
function initFormHandler() {
  setupFormValidation();
  setupFormSubmission();
  setupGuestSearch();

  console.log("Form handler inicializado correctamente");
}

// ===== CONFIGURACIÓN DE VALIDACIÓN =====
function setupFormValidation() {
  validationRules = {
    guestName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      message: "Por favor ingresa un nombre válido",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Por favor ingresa un email válido",
    },
    phone: {
      required: false,
      pattern: /^[\d\s\-\+\(\)]+$/,
      message: "Por favor ingresa un teléfono válido",
    },
    attendance: {
      required: true,
      message: "Por favor confirma tu asistencia",
    },
  };

  // Agregar event listeners para validación en tiempo real
  Object.keys(validationRules).forEach((fieldName) => {
    const field = document.getElementById(fieldName);
    if (field) {
      field.addEventListener("blur", () => validateField(fieldName));
      field.addEventListener("input", () => clearFieldError(fieldName));
    }
  });
}

// ===== VALIDACIÓN DE CAMPOS =====
function validateField(fieldName) {
  const field = document.getElementById(fieldName);
  const rules = validationRules[fieldName];

  if (!field || !rules) return true;

  const value = field.value.trim();

  // Verificar si es requerido
  if (rules.required && !value) {
    showFieldError(fieldName, rules.message || "Este campo es requerido");
    return false;
  }

  // Verificar longitud mínima
  if (rules.minLength && value.length < rules.minLength) {
    showFieldError(
      fieldName,
      `Debe tener al menos ${rules.minLength} caracteres`
    );
    return false;
  }

  // Verificar patrón
  if (rules.pattern && value && !rules.pattern.test(value)) {
    showFieldError(fieldName, rules.message || "Formato inválido");
    return false;
  }

  clearFieldError(fieldName);
  return true;
}

function showFieldError(fieldName, message) {
  const field = document.getElementById(fieldName);
  if (!field) return;

  // Remover error anterior
  clearFieldError(fieldName);

  // Agregar clase de error
  field.classList.add("error");

  // Crear mensaje de error
  const errorElement = document.createElement("div");
  errorElement.className = "field-error";
  errorElement.textContent = message;
  errorElement.id = `${fieldName}-error`;

  // Insertar después del campo
  field.parentNode.insertBefore(errorElement, field.nextSibling);
}

function clearFieldError(fieldName) {
  const field = document.getElementById(fieldName);
  const errorElement = document.getElementById(`${fieldName}-error`);

  if (field) {
    field.classList.remove("error");
  }

  if (errorElement) {
    errorElement.remove();
  }
}

// ===== VALIDACIÓN DE ACOMPAÑANTES =====
function validateCompanions() {
  const companionEntries = document.querySelectorAll(".companion-entry");
  let isValid = true;

  companionEntries.forEach((entry, index) => {
    const nameInput = entry.querySelector('input[name="companionName[]"]');
    const ageSelect = entry.querySelector('select[name="companionAge[]"]');

    if (nameInput && !nameInput.value.trim()) {
      showCompanionError(nameInput, "El nombre del acompañante es requerido");
      isValid = false;
    } else if (
      nameInput &&
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nameInput.value.trim())
    ) {
      showCompanionError(nameInput, "Ingresa un nombre válido");
      isValid = false;
    }

    if (ageSelect && !ageSelect.value) {
      showCompanionError(ageSelect, "Selecciona la edad del acompañante");
      isValid = false;
    }
  });

  return isValid;
}

function showCompanionError(element, message) {
  element.classList.add("error");

  // Remover error anterior si existe
  const existingError = element.parentNode.querySelector(".companion-error");
  if (existingError) {
    existingError.remove();
  }

  const errorElement = document.createElement("div");
  errorElement.className = "companion-error field-error";
  errorElement.textContent = message;

  element.parentNode.appendChild(errorElement);
}

// ===== BÚSQUEDA DE INVITADOS =====
function setupGuestSearch() {
  const searchButton = document.querySelector(
    'button[onclick="searchGuest()"]'
  );
  const searchInput = document.getElementById("searchName");

  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchGuest();
      }
    });

    // Auto-search mientras escribe (con debounce)
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (this.value.trim().length >= 3) {
          searchGuest();
        }
      }, 500);
    });
  }
}

async function searchGuest() {
  const searchInput = document.getElementById("searchName");
  const searchResult = document.getElementById("searchResult");
  const confirmationForm = document.getElementById("confirmationForm");

  if (!searchInput || !searchResult) return;

  const searchName = searchInput.value.trim();

  if (!searchName) {
    searchResult.innerHTML = "<p>Por favor ingresa un nombre para buscar.</p>";
    searchResult.className = "search-result not-found";
    return;
  }

  if (searchName.length < 2) {
    searchResult.innerHTML =
      "<p>Ingresa al menos 2 caracteres para buscar.</p>";
    searchResult.className = "search-result not-found";
    return;
  }

  // Mostrar loading
  searchResult.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Buscando invitado...</p>
        </div>
    `;
  searchResult.className = "search-result searching";

  try {
    // const response = await fetch(`${SEARCH_SCRIPT_URL}?action=search&name=${encodeURIComponent(searchName)}`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     }
    // });
    // La URL de tu backend proxy (cuando lo corras localmente)
    const BACKEND_URL = "http://localhost:3000";

    const response = await fetch(
      `${BACKEND_URL}/api/search?name=${encodeURIComponent(searchName)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.found) {
      handleGuestFound(data.guest);
    } else {
      handleGuestNotFound(searchName);
    }
  } catch (error) {
    console.error("Error en búsqueda:", error);
    handleSearchError();
  }
}

function handleGuestFound(guestData) {
  const searchResult = document.getElementById("searchResult");
  const confirmationForm = document.getElementById("confirmationForm");

  // Guardar datos del invitado globalmente
  window.currentGuestData = guestData;
  window.maxCompanionsAllowed = guestData.maxCompanions || 0;

  searchResult.innerHTML = `
        <div class="guest-found">
            <div class="success-icon">✅</div>
            <h4>¡Invitado encontrado!</h4>
            <div class="guest-info">
                <p><strong>Nombre:</strong> ${guestData.name}</p>
                <p><strong>Acompañantes permitidos:</strong> ${
                  window.maxCompanionsAllowed
                }</p>
                ${
                  guestData.specialNotes
                    ? `<p><strong>Notas:</strong> ${guestData.specialNotes}</p>`
                    : ""
                }
            </div>
        </div>
    `;
  searchResult.className = "search-result found";

  // Llenar formulario
  fillFormWithGuestData(guestData);

  // Mostrar formulario con animación
  if (confirmationForm) {
    confirmationForm.style.display = "block";
    confirmationForm.scrollIntoView({ behavior: "smooth" });
  }

  // Actualizar información de acompañantes
  updateCompanionsInfo();
}

function handleGuestNotFound(searchName) {
  const searchResult = document.getElementById("searchResult");

  searchResult.innerHTML = `
        <div class="guest-not-found">
            <div class="error-icon">❌</div>
            <h4>Invitado no encontrado</h4>
            <p>No encontramos "<strong>${searchName}</strong>" en nuestra lista de invitados.</p>
            <div class="suggestions">
                <h5>Sugerencias:</h5>
                <ul>
                    <li>Verifica que hayas escrito tu nombre exactamente como aparece en la invitación</li>
                    <li>Intenta con variaciones (con/sin acentos, nombres completos vs. diminutivos)</li>
                    <li>Si tienes dudas, contacta directamente a los novios</li>
                </ul>
            </div>
            <button class="btn btn-secondary" onclick="clearSearch()">Intentar de nuevo</button>
        </div>
    `;
  searchResult.className = "search-result not-found";
}

function handleSearchError() {
  const searchResult = document.getElementById("searchResult");

  searchResult.innerHTML = `
        <div class="search-error">
            <div class="error-icon">⚠️</div>
            <h4>Error de conexión</h4>
            <p>No se pudo realizar la búsqueda. Por favor verifica tu conexión a internet e intenta nuevamente.</p>
            <button class="btn btn-secondary" onclick="searchGuest()">Reintentar</button>
        </div>
    `;
  searchResult.className = "search-result error";
}

function clearSearch() {
  const searchInput = document.getElementById("searchName");
  const searchResult = document.getElementById("searchResult");
  const confirmationForm = document.getElementById("confirmationForm");

  if (searchInput) searchInput.value = "";
  if (searchResult) {
    searchResult.innerHTML = "";
    searchResult.className = "search-result";
  }
  if (confirmationForm) confirmationForm.style.display = "none";

  // Limpiar datos globales
  window.currentGuestData = null;
  window.maxCompanionsAllowed = 0;
}

// ===== LLENAR FORMULARIO CON DATOS DEL INVITADO =====
function fillFormWithGuestData(guestData) {
  const fields = [
    { id: "guestName", value: guestData.name },
    { id: "email", value: guestData.email || "" },
    { id: "phone", value: guestData.phone || "" },
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element) {
      element.value = field.value;
    }
  });
}

// ===== CONFIGURACIÓN DE ENVÍO DEL FORMULARIO =====
function setupFormSubmission() {
  const form = document.getElementById("confirmationForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmission);
  }
}

async function handleFormSubmission(e) {
  e.preventDefault();

  if (isSubmitting) return;

  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');

  // Validar formulario
  if (!validateForm()) {
    showNotification("Por favor corrige los errores en el formulario", "error");
    return;
  }

  // Mostrar loading state
  isSubmitting = true;
  const originalButtonText = submitButton.innerHTML;
  submitButton.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            Enviando...
        </div>
    `;
  submitButton.disabled = true;

  try {
    const formData = collectFormData(form);
    const response = await submitFormData(formData);

    if (response.success) {
      handleSubmissionSuccess(response);
    } else {
      handleSubmissionError(
        response.message || "Error al enviar la confirmación"
      );
    }
  } catch (error) {
    console.error("Error en envío:", error);
    handleSubmissionError("Error de conexión. Por favor intenta nuevamente.");
  } finally {
    // Restaurar botón
    isSubmitting = false;
    submitButton.innerHTML = originalButtonText;
    submitButton.disabled = false;
  }
}

// ===== VALIDACIÓN COMPLETA DEL FORMULARIO =====
function validateForm() {
  let isValid = true;

  // Validar campos principales
  Object.keys(validationRules).forEach((fieldName) => {
    if (!validateField(fieldName)) {
      isValid = false;
    }
  });

  // Validar acompañantes si la asistencia es confirmada
  const attendance = document.getElementById("attendance").value;
  if (attendance === "si") {
    if (!validateCompanions()) {
      isValid = false;
    }

    // Verificar límite de acompañantes
    const companionCount = document.querySelectorAll(".companion-entry").length;
    if (companionCount > window.maxCompanionsAllowed) {
      showNotification(
        `Solo puedes traer hasta ${window.maxCompanionsAllowed} acompañantes`,
        "error"
      );
      isValid = false;
    }
  }

  return isValid;
}

// ===== RECOLECCIÓN DE DATOS DEL FORMULARIO =====
function collectFormData(form) {
  const formData = new FormData(form);
  const data = {};

  // Datos básicos
  for (let [key, value] of formData.entries()) {
    if (!key.includes("[]")) {
      data[key] = value;
    }
  }

  // Datos de acompañantes
  const companions = [];
  const companionNames = formData.getAll("companionName[]");
  const companionAges = formData.getAll("companionAge[]");

  for (let i = 0; i < companionNames.length; i++) {
    if (companionNames[i].trim()) {
      companions.push({
        name: companionNames[i].trim(),
        age: companionAges[i] || "adulto",
      });
    }
  }

  // Agregar datos adicionales
  data.companions = JSON.stringify(companions);
  data.companionCount = companions.length;
  data.timestamp = new Date().toISOString();
  data.guestId = window.currentGuestData?.id || "";

  return data;
}

// ===== ENVÍO DE DATOS =====
async function submitFormData(formData) {
  const response = await fetch(FORM_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// ===== MANEJO DE RESPUESTAS =====
function handleSubmissionSuccess(response) {
  const form = document.getElementById("confirmationForm");
  const attendance = document.getElementById("attendance").value;

  // Mostrar mensaje de éxito personalizado
  let message;
  if (attendance === "si") {
    const companionCount = document.querySelectorAll(".companion-entry").length;
    message =
      companionCount > 0
        ? `¡Gracias por confirmar tu asistencia! Te esperamos junto con ${companionCount} acompañante${
            companionCount > 1 ? "s" : ""
          } 💕`
        : "¡Gracias por confirmar tu asistencia! Te esperamos en nuestra boda 💕";
  } else {
    message =
      "Gracias por tu respuesta. Lamentamos que no puedas acompañarnos 💕";
  }

  showSuccessModal(message, response);

  // Limpiar formulario
  if (form) {
    form.reset();
    form.style.display = "none";
  }

  // Limpiar búsqueda
  clearSearch();
}

function handleSubmissionError(errorMessage) {
  showNotification(errorMessage, "error");
}

// ===== MODAL DE ÉXITO =====
function showSuccessModal(message, response) {
  const modal = document.createElement("div");
  modal.className = "success-modal";
  modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="success-animation">
                <div class="checkmark">✓</div>
            </div>
            <h3>¡Confirmación Enviada!</h3>
            <p>${message}</p>
            ${
              response.confirmationNumber
                ? `<p class="confirmation-number">Número de confirmación: <strong>${response.confirmationNumber}</strong></p>`
                : ""
            }
            <div class="modal-actions">
                <button class="btn" onclick="closeSuccessModal()">Continuar</button>
                <button class="btn btn-secondary" onclick="shareInvitation()">Compartir Invitación</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Auto-close después de 10 segundos
  setTimeout(() => {
    closeSuccessModal();
  }, 10000);
}

function closeSuccessModal() {
  const modal = document.querySelector(".success-modal");
  if (modal) {
    modal.remove();
  }
}

// ===== FUNCIONES UTILITARIAS =====
function shareInvitation() {
  if (navigator.share) {
    navigator.share({
      title: "Invitación de Boda - María & Carlos",
      text: "¡Estás invitado a nuestra boda!",
      url: window.location.href,
    });
  } else {
    // Fallback: copiar URL
    navigator.clipboard.writeText(window.location.href).then(() => {
      showNotification("URL copiada al portapapeles", "success");
    });
  }
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${
              type === "success" ? "✓" : "⚠"
            }</span>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

  document.body.appendChild(notification);

  // Auto-remove después de 5 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// ===== AGREGAR ESTILOS CSS PARA FORMULARIO =====
function addFormStyles() {
  const style = document.createElement("style");
  style.textContent = `
        /* Estilos de validación */
        .field-error, .companion-error {
            color: #e55a3c;
            font-size: 0.9rem;
            margin-top: 5px;
            font-weight: 500;
        }
        
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #e55a3c;
            box-shadow: 0 0 10px rgba(229, 90, 60, 0.2);
        }
        
        /* Loading spinner */
        .loading-spinner {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #4dd0c7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Search result styles */
        .search-result.searching {
            background: rgba(77, 208, 199, 0.05);
            border: 1px solid rgba(77, 208, 199, 0.2);
            text-align: center;
            padding: 20px;
        }
        
        .guest-found {
            text-align: center;
        }
        
        .success-icon, .error-icon {
            font-size: 2rem;
            margin-bottom: 10px;
            display: block;
        }
        
        .guest-info {
            background: rgba(255, 255, 255, 0.7);
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            border-left: 4px solid #4dd0c7;
        }
        
        .guest-not-found, .search-error {
            text-align: center;
        }
        
        .suggestions {
            text-align: left;
            margin: 15px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 8px;
        }
        
        .suggestions h5 {
            color: #5a9aa8;
            margin-bottom: 10px;
        }
        
        .suggestions ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .suggestions li {
            margin: 5px 0;
            color: #666;
        }
        
        /* Success modal */
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            width: 90%;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
            0% {
                opacity: 0;
                transform: scale(0.8) translateY(-50px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        .success-animation {
            margin: 20px 0;
        }
        
        .checkmark {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4dd0c7, #3ac5bb);
            color: white;
            font-size: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            animation: checkmarkBounce 0.6s ease-out;
        }
        
        @keyframes checkmarkBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .modal-content h3 {
            color: #4dd0c7;
            margin: 20px 0 15px;
            font-size: 1.8rem;
        }
        
        .confirmation-number {
            background: rgba(77, 208, 199, 0.1);
            padding: 10px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #4dd0c7;
        }
        
        .modal-actions {
            margin-top: 30px;
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .modal-actions .btn {
            padding: 12px 25px;
        }
        
        /* Notification styles */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 500px;
            z-index: 10001;
            animation: notificationSlideIn 0.3s ease-out;
        }
        
        .notification.success {
            background: linear-gradient(135deg, #4dd0c7, #3ac5bb);
        }
        
        .notification.error {
            background: linear-gradient(135deg, #ff6b47, #e55a3c);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            position: relative;
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
        
        /* Responsive */
        @media (max-width: 768px) {
            .modal-content {
                padding: 30px 20px;
                width: 95%;
            }
            
            .modal-actions {
                flex-direction: column;
            }
            
            .notification {
                right: 10px;
                left: 10px;
                min-width: auto;
            }
            
            .checkmark {
                width: 60px;
                height: 60px;
                font-size: 2rem;
            }
        }
    `;
  document.head.appendChild(style);
}

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", function () {
  addFormStyles();

  // Esperar a que el contenido principal sea visible
  const observer = new MutationObserver((mutations) => {
    const mainContent = document.getElementById("mainContent");
    if (mainContent && mainContent.classList.contains("show")) {
      initFormHandler();
      observer.disconnect();
    }
  });

  const mainContent = document.getElementById("mainContent");
  if (mainContent) {
    if (mainContent.classList.contains("show")) {
      initFormHandler();
    } else {
      observer.observe(mainContent, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }
});

// ===== EXPORT PARA USO EXTERNO =====
window.FormHandler = {
  searchGuest,
  validateForm,
  clearSearch,
  showNotification,
};
