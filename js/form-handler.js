// ===== FORM HANDLER - WEDDING INVITATION =====

// Configuración de Google Apps Script URLs
const BACKEND_URL = "https://boda-cecily-angel-backend.vercel.app"; // Reemplaza con tu URL de Vercel

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
      required: false, // Ahora es opcional
      pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
      message: "Por favor ingresa un email válido",
    },
    phone: {
      required: false, // Ahora es opcional
      pattern: /^[\d\s\-\+\(\)]+$/,
      message: "Por favor ingresa un teléfono válido",
    },
    guestAttendance: {
      required: true,
      message: "Por favor selecciona tu asistencia",
    },
    dietary: {
      required: false,
    },
    'companionName[]': {
      required: true,
      message: "El nombre del acompañante es requerido",
    },
    'companionAttendance[]': {
      required: true,
      message: "Por favor, selecciona la asistencia de tu acompañante",
    },
    'companionAge[]': {
      required: true,
      message: "Por favor, selecciona la edad de tu acompañante",
    }
  };
}

// ===== MANEJO DE LA BÚSQUEDA DE INVITADOS =====
function setupGuestSearch() {
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const guestName = document.getElementById("guestNameSearch").value.trim();
      if (guestName.length < 2) {
        showNotification("Por favor, ingresa al menos 2 letras", "error");
        return;
      }

      showNotification("Buscando...", "info");
      
      const searchButton = searchForm.querySelector("button");
      searchButton.disabled = true;

      try {
        const response = await fetch(`${BACKEND_URL}/api/search?name=${encodeURIComponent(guestName)}`);
        const data = await response.json();
        
        hideAllFormsAndResults();
        
        // Manejar la doble anidación de la respuesta
        const foundGuest = data.found && data.guest;

        if (foundGuest) {
          handleGuestFound(data.guest);
        } else {
          handleGuestNotFound(data.message || "Invitado no encontrado.");
        }
      } catch (error) {
        console.error("Error en la búsqueda:", error);
        showNotification("Error de red. Inténtalo de nuevo.", "error");
      } finally {
        searchButton.disabled = false;
      }
    });
  }
}

// ===== LÓGICA DESPUÉS DE LA BÚSQUEDA =====
function handleGuestFound(guestData) {
  const searchResult = document.getElementById("searchResult");
  const confirmationForm = document.getElementById("confirmationForm");
  const companionsSection = document.getElementById("companionsSection");
  const companionsList = document.getElementById("companionsList");
  const addCompanionBtn = document.getElementById("addCompanionBtn");

  // Asegurarse de obtener el objeto guest correctamente anidado
  const actualGuestData = guestData.guest || guestData;

  // Guardar datos del invitado globalmente
  window.currentGuestData = actualGuestData;
  window.maxCompanionsAllowed = actualGuestData.maxCompanions || 0;

  // Actualizar el mensaje de "Invitado encontrado"
  searchResult.innerHTML = `
    <div class="guest-found">
        <div class="success-icon">✅</div>
        <h4>¡Invitado encontrado!</h4>
        <div class="guest-info">
            <p><strong>Nombre:</strong> ${actualGuestData.name}</p>
            ${window.maxCompanionsAllowed > 0
              ? `<p><strong>Acompañantes permitidos:</strong> ${window.maxCompanionsAllowed}</p>`
              : ""
            }
        </div>
    </div>
  `;
  searchResult.className = "search-result found";

  fillFormWithGuestData(actualGuestData);

  companionsList.innerHTML = '';
  
  // Lógica para mostrar los acompañantes
  if (window.maxCompanionsAllowed > 0) {
      companionsSection.style.display = 'block';
      
      const prefilledNames = actualGuestData.companionNames || [];
      addCompanionFields(window.maxCompanionsAllowed, prefilledNames); 

      if (addCompanionBtn) {
          addCompanionBtn.style.display = prefilledNames.length > 0 ? 'none' : 'block';
      }
  } else {
      companionsSection.style.display = 'none';
  }

  if (confirmationForm) {
      confirmationForm.style.display = 'block';
      confirmationForm.scrollIntoView({ behavior: 'smooth' });
  }
}

function fillFormWithGuestData(guest) {
  const guestNameInput = document.getElementById("guestNameInput");
  const guestIdInput = document.getElementById("guestIdInput");

  if (guestNameInput) {
    guestNameInput.value = guest.name;
  }
  if (guestIdInput) {
    guestIdInput.value = guest.id;
  }
}

function addCompanionFields(max, names = []) {
  const companionsList = document.getElementById("companionsList");
  for (let i = 0; i < max; i++) {
    const name = names[i] || '';
    const isPrefilled = !!name;
    const companionDiv = document.createElement("div");
    companionDiv.className = `form-group companion-input-group`;
    
    companionDiv.innerHTML = `
        <input 
            type="text" 
            name="companionName[]" 
            placeholder="Nombre del acompañante" 
            value="${name}"
            ${isPrefilled ? 'readonly' : ''}
            required
        >
        <div class="radio-group">
            <label>
                <input type="radio" name="companionAttendance[${i}]" value="si" required>
                Sí
            </label>
            <label>
                <input type="radio" name="companionAttendance[${i}]" value="no" required>
                No
            </label>
        </div>
        <select name="companionAge[]" required>
            <option value="">Edad</option>
            <option value="adulto">Adulto</option>
            <option value="nino">Niño</option>
        </select>
        ${!isPrefilled ? `<button type="button" class="remove-companion-btn">-</button>` : ''}
    `;
    
    companionsList.appendChild(companionDiv);

    if (!isPrefilled) {
        const removeButton = companionDiv.querySelector(".remove-companion-btn");
        if (removeButton) {
            removeButton.addEventListener("click", () => {
                companionDiv.remove();
                checkCompanionCount();
            });
        }
    }
  }
  checkCompanionCount();
}

function checkCompanionCount() {
    const companionsList = document.getElementById("companionsList");
    const currentCount = companionsList.querySelectorAll('.companion-input-group').length;
    const addCompanionBtn = document.getElementById('addCompanionBtn');
    const companionsLabel = document.querySelector('label[for="companionsLabel"]');
    
    if (addCompanionBtn) {
        if (currentCount >= window.maxCompanionsAllowed) {
            addCompanionBtn.style.display = 'none';
        } else {
            addCompanionBtn.style.display = 'block';
        }
    }
    
    if (companionsLabel) {
        companionsLabel.textContent = `Acompañantes (${currentCount} de ${window.maxCompanionsAllowed})`;
    }
}

function handleGuestNotFound(message) {
  const searchResult = document.getElementById("searchResult");
  searchResult.innerHTML = `
    <div class="guest-not-found">
      <div class="error-icon">❌</div>
      <h4>${message}</h4>
      <p>Verifica que el nombre esté escrito correctamente.</p>
    </div>
  `;
  searchResult.className = "search-result not-found";
}

function hideAllFormsAndResults() {
  const elementsToHide = ["searchResult", "confirmationForm", "companionsSection"];
  elementsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.className = "";
    }
  });
}

// ===== MANEJO DE ENVÍO DE FORMULARIO =====
function setupFormSubmission() {
  const confirmationForm = document.getElementById("confirmationForm");

  if (confirmationForm) {
    confirmationForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (isSubmitting) return;
      isSubmitting = true;

      const submitButton = confirmationForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Confirmando...";
      submitButton.disabled = true;

      const guestId = document.getElementById("guestIdInput").value;
      const guestName = document.getElementById("guestNameInput").value;
      const guestAttendance = document.querySelector('input[name="guestAttendance"]:checked')?.value || 'no';

      const companions = [];
      const companionGroups = document.querySelectorAll('.companion-input-group');
      
      companionGroups.forEach((group, index) => {
        const nameInput = group.querySelector('input[name="companionName[]"]');
        const attendanceInput = group.querySelector(`input[name="companionAttendance[${index}]"]:checked`);
        const ageSelect = group.querySelector('select[name="companionAge[]"]');
        
        if (nameInput && attendanceInput && ageSelect) {
          companions.push({
            name: nameInput.value,
            attendance: attendanceInput.value,
            age: ageSelect.value
          });
        }
      });
      
      const payload = {
        action: "submit",
        id: guestId,
        name: guestName,
        attendance: guestAttendance,
        companions: companions,
      };

      try {
        const response = await fetch(`${BACKEND_URL}/api/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
          showNotification("¡Confirmación enviada con éxito!", "success");
          setTimeout(() => {
            location.reload();
          }, 3000);
        } else {
          showNotification(
            "Error al enviar la confirmación: " + result.message,
            "error"
          );
        }
      } catch (error) {
        showNotification(
          "Error de red al enviar la confirmación. Inténtalo de nuevo.",
          "error"
        );
      } finally {
        isSubmitting = false;
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }
}

// ===== FUNCIONES AUXILIARES =====
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `<p>${message}</p>`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    notification.addEventListener("transitionend", () => notification.remove());
  }, 3000);
}

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", function () {
  initFormHandler();
});