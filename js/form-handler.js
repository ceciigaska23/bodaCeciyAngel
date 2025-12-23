// ===== GOOGLE APPS SCRIPT - WEDDING INVITATION - VALIDACIÓN CORREGIDA =====

// CONFIGURACIÓN
const SPREADSHEET_ID = '164X4N-LNHnWZ7Wo1rW3G4yLUKuVFyyQ-RBoWwatezGE';
const GUESTS_SHEET_NAME = 'Invitados';
const CONFIRMATIONS_SHEET_NAME = 'Confirmaciones';

function normalizeHeader(header) {
  return header.trim().toLowerCase();
}

// ===== FUNCIÓN PRINCIPAL - MANEJA TODAS LAS SOLICITUDES GET =====
function doGet(e) {
  try {
    const action = e.parameter.action;
    let responseData = {};

    switch (action) {
      case 'search':
        responseData = handleGuestSearch(e.parameter.name);
        break;
      case 'test':
        responseData = {
          message: 'Google Apps Script funcionando correctamente'
        };
        break;
      case 'validate':
        responseData = validateConfirmation(e.parameter.code);
        break;
      case 'checkConfirmation':
        responseData = checkGuestConfirmation(e.parameter.guestId);
        break;
      default:
        responseData = {
          error: 'Acción no válida'
        };
        break;
    }
    return createJsonResponse(responseData);
  } catch (error) {
    console.error('Error en doGet:', error);
    return createJsonResponse({
      error: error.message,
      success: false
    });
  }
}

// ===== FUNCIÓN PRINCIPAL - MANEJA TODAS LAS SOLICITUDES POST =====
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      console.error('❌ Error: No se recibieron datos en el POST.');
      return createJsonResponse({
        success: false,
        error: 'No se encontraron datos en la solicitud.'
      });
    }

    const payload = JSON.parse(e.postData.contents);
    let responseData = {};

    if (payload.id && payload.name && payload.attendance) {
      responseData = handleFormSubmission(payload);
    } else if (payload.action === 'validateCode' && payload.code) {
      responseData = validateConfirmation(payload.code);
    } else {
      responseData = {
        success: false,
        error: 'Acción de POST no válida o datos incompletos.'
      };
    }

    if (responseData.success && responseData.confirmationNumber) {
      console.log(`✅ Confirmación guardada para ${payload.name}. Número: ${responseData.confirmationNumber}`);
    }

    return createJsonResponse(responseData);
  } catch (error) {
    console.error('❌ Error en doPost:', error);
    return createJsonResponse({
      success: false,
      error: `Error interno del servidor: ${error.message}`
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== NUEVA FUNCIÓN: VERIFICAR SI UN INVITADO YA CONFIRMÓ =====
function checkGuestConfirmation(guestId) {
  try {
    if (!guestId) {
      return {
        hasConfirmed: false,
        error: 'ID de invitado no proporcionado'
      };
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let confirmationsSheet = spreadsheet.getSheetByName(CONFIRMATIONS_SHEET_NAME);

    if (!confirmationsSheet) {
      return {
        hasConfirmed: false,
        message: 'No hay confirmaciones registradas'
      };
    }

    const dataRange = confirmationsSheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length < 2) {
      return {
        hasConfirmed: false,
        message: 'No hay confirmaciones registradas'
      };
    }

    const headers = values[0].map(normalizeHeader);
    const idColIndex = headers.indexOf('id de invitado');
    const confirmationNumCol = headers.indexOf('número de confirmación');

    if (idColIndex === -1) {
      return {
        hasConfirmed: false,
        error: 'Columna de ID no encontrada'
      };
    }

    // Buscar si existe una confirmación para este invitado
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowGuestId = row[idColIndex]?.toString().trim();
      
      if (rowGuestId === guestId.toString().trim()) {
        return {
          hasConfirmed: true,
          message: 'Este invitado ya confirmó su asistencia',
          confirmationNumber: confirmationNumCol !== -1 ? row[confirmationNumCol] : null,
          confirmedAt: row[0] // Fecha de confirmación
        };
      }
    }

    return {
      hasConfirmed: false,
      message: 'Este invitado aún no ha confirmado'
    };

  } catch (error) {
    console.error('Error en checkGuestConfirmation:', error);
    return {
      hasConfirmed: false,
      error: `Error al verificar confirmación: ${error.message}`
    };
  }
}

// ===== BÚSQUEDA DE INVITADOS =====
function handleGuestSearch(searchName) {
  if (!searchName || searchName.trim().length < 2) {
    return {
      found: false,
      message: 'Nombre muy corto'
    };
  }

  const guest = searchGuest(searchName.trim());

  if (guest) {
    return {
      found: true,
      guest: guest
    };
  } else {
    return {
      found: false,
      message: 'Invitado no encontrado'
    };
  }
}

function searchGuest(searchName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const guestsSheet = spreadsheet.getSheetByName(GUESTS_SHEET_NAME);
    if (!guestsSheet) {
      throw new Error(`No se encontró la hoja "${GUESTS_SHEET_NAME}".`);
    }

    const data = guestsSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return null;
    }

    const headers = data[0].map(normalizeHeader);
    const nameColIndex = headers.indexOf('nombre completo');
    const companionsAllowedColIndex = headers.indexOf('acompañantes permitidos');
    const companionNamesColIndex = headers.indexOf('nombres de acompañantes');

    if (nameColIndex === -1 || companionsAllowedColIndex === -1) {
      throw new Error("Faltan columnas requeridas en la hoja de invitados.");
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const guestName = row[nameColIndex] ? row[nameColIndex].toString().trim() : '';

      if (guestName && normalizeString(guestName).includes(normalizeString(searchName))) {
        const maxCompanions = row[companionsAllowedColIndex] ? parseInt(row[companionsAllowedColIndex]) : 0;

        let companions = [];
        if (maxCompanions > 0 && companionNamesColIndex !== -1) {
          const rawCompanionNames = row[companionNamesColIndex] || '';
          const namesArray = rawCompanionNames.split(',').map(name => name.trim()).filter(name => name !== '');

          companions = namesArray.map(name => ({
            name: name,
            attendance: 'si',
            age: 'adulto'
          }));
        }

        return {
          id: i,
          name: guestName,
          maxCompanions: maxCompanions,
          companions: companions
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error en searchGuest:', error);
    throw new Error(`Error en la búsqueda: ${error.message}`);
  }
}

function normalizeString(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ===== MANEJO DE ENVÍO DE FORMULARIO =====
function handleFormSubmission(formData) {
  try {
    if (!formData.id || !formData.name || !formData.attendance) {
      return {
        success: false,
        message: 'Faltan datos requeridos (id, name, attendance)'
      };
    }

    // ✅ VERIFICAR SI YA CONFIRMÓ ANTES DE GUARDAR
    const checkResult = checkGuestConfirmation(formData.id);
    if (checkResult.hasConfirmed) {
      return {
        success: false,
        alreadyConfirmed: true,
        message: 'Ya has confirmado tu asistencia previamente',
        confirmationNumber: checkResult.confirmationNumber
      };
    }

    const confirmationNumber = saveConfirmation(formData);

    return {
      success: true,
      message: 'Confirmación guardada exitosamente',
      confirmationNumber: confirmationNumber
    };

  } catch (error) {
    console.error('Error en handleFormSubmission:', error);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
}

const UNIFIED_CONFIRMATIONS_HEADERS = [
  'Fecha',
  'ID de Invitado',
  'Nombre',
  'Teléfono',
  'Asistencia',
  'Número de Acompañantes',
  'Nombres de Acompañantes',
  'Asistencia de Acompañantes',
  'Edades de Acompañantes',
  'Restricciones Alimentarias',
  'Número de Confirmación',
  'Asistencia Confirmada',
  'Mesa Asignada',
  'Grupo/Familia'
];

function saveConfirmation(formData) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let confirmationsSheet = spreadsheet.getSheetByName(CONFIRMATIONS_SHEET_NAME);

  if (!confirmationsSheet) {
    confirmationsSheet = spreadsheet.insertSheet(CONFIRMATIONS_SHEET_NAME);
    confirmationsSheet.getRange(1, 1, 1, UNIFIED_CONFIRMATIONS_HEADERS.length).setValues([UNIFIED_CONFIRMATIONS_HEADERS]);
  }

  const confirmationNumber = generateConfirmationNumber();

  const companions = formData.companions || [];
  const companionNames = companions.map(c => c.name).join(', ');
  const companionAttendances = companions.map(c => c.attendance).join(', ');
  const companionAges = companions.map(c => c.age).join(', ');

  const row = [
    new Date(),
    formData.id,
    formData.name,
    formData.phone || '',
    formData.attendance,
    companions.length,
    companionNames,
    companionAttendances,
    companionAges,
    formData.dietary || '',
    confirmationNumber,
    '', // Asistencia Confirmada
    '', // Mesa Asignada
    ''  // Grupo/Familia
  ];

  confirmationsSheet.appendRow(row);
  return confirmationNumber;
}

function generateConfirmationNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `WED${timestamp}${random}`;
}

function validateConfirmation(confirmationCode) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let confirmationsSheet = spreadsheet.getSheetByName(CONFIRMATIONS_SHEET_NAME);

    if (!confirmationsSheet) {
      return {
        success: false,
        message: 'No hay confirmaciones registradas.'
      };
    }

    const dataRange = confirmationsSheet.getDataRange();
    const values = dataRange.getValues();
    if (values.length < 2) {
      return {
        success: false,
        message: 'No hay confirmaciones registradas.'
      };
    }

    const headers = values[0].map(normalizeHeader);
    const confirmationCol = headers.indexOf('número de confirmación');
    let attendanceCol = headers.indexOf('asistencia confirmada');

    if (attendanceCol === -1) {
      attendanceCol = headers.length;
      confirmationsSheet.getRange(1, attendanceCol + 1).setValue('Asistencia Confirmada');
    }

    if (confirmationCol === -1) {
      throw new Error('La columna "Número de Confirmación" no fue encontrada.');
    }

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[confirmationCol] === confirmationCode) {
        if (attendanceCol !== -1 && row[attendanceCol] === 'Sí') {
          return {
            success: false,
            message: 'Código ya utilizado.',
            guestName: row[2]
          };
        }

        const attendanceCell = confirmationsSheet.getRange(i + 1, attendanceCol + 1);
        attendanceCell.setValue('Sí');

        return {
          success: true,
          message: 'Asistencia confirmada',
          guestName: row[2]
        };
      }
    }

    return {
      success: false,
      message: 'Código de confirmación inválido.'
    };
  } catch (error) {
    console.error('Error en validateConfirmation:', error);
    return {
      success: false,
      message: `Error interno: ${error.message}`
    };
  }
}
