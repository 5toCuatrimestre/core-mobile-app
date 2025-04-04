// Importa la URL base y la función para obtener el token desde el módulo de autenticación
import { baseURL } from '../authApi';
import { getAuthToken } from '../authApi';

/**
 * Función para obtener todas las mesas (position-sites) desde el servidor.
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de las mesas
 * @throws {Error} - Lanza error si falla la obtención de las mesas
 */
export async function getAllTables() {
  try {
    // Obtiene el token de autenticación almacenado
    const token = await getAuthToken();
    
    // Verifica si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    // Realiza la petición GET al endpoint de position-sites
    const response = await fetch(`${baseURL}/position-site/all`, {
      method: 'GET',
      headers: {
        'accept': '*/*',  // Acepta cualquier tipo de respuesta
        'Authorization': `Bearer ${token}`  // Incluye el token en el header de autorización
      }
    });
    
    // Si la respuesta no es exitosa (status fuera del rango 200-299)
    if (!response.ok) {
      throw new Error(`Error al obtener las mesas: ${response.status}`);
    }
    
    // Parsea la respuesta JSON del servidor
    const data = await response.json();
    console.log("Mesas obtenidas:", data);  // Log para depuración
    
    // Retorna los datos de las mesas
    return data;
  } catch (error) {
    // Captura y registra cualquier error ocurrido durante el proceso
    console.error("Error en la obtención de las mesas:", error);
    throw error;  // Relanza el error para manejo posterior
  }
}

/**
 * Función para crear una nueva mesa (position-site) en el servidor.
 * @param {Object} tableData - Datos de la mesa a crear
 * @param {number} tableData.capacity - Capacidad de la mesa (número de sillas)
 * @param {number} tableData.xlocation - Posición X de la mesa (en decimal, 0-1)
 * @param {number} tableData.ylocation - Posición Y de la mesa (en decimal, 0-1)
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la mesa creada
 * @throws {Error} - Lanza error si falla la creación de la mesa
 */
export async function createTable(tableData) {
  try {
    // Obtiene el token de autenticación almacenado
    const token = await getAuthToken();
    
    // Verifica si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    // Prepara los datos para enviar al servidor
    const requestData = {
      positionId: 1,  // Valor fijo según requerimiento
      siteId: 1,      // Valor fijo según requerimiento
      capacity: tableData.capacity,
      xlocation: tableData.xlocation,
      ylocation: tableData.ylocation
    };
    
    // Realiza la petición POST al endpoint de position-sites
    const response = await fetch(`${baseURL}/position-site`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  // Indica que enviamos datos JSON
        'accept': '*/*',                     // Acepta cualquier tipo de respuesta
        'Authorization': `Bearer ${token}`   // Incluye el token en el header de autorización
      },
      body: JSON.stringify(requestData)      // Convierte los datos a JSON
    });
    
    // Si la respuesta no es exitosa (status fuera del rango 200-299)
    if (!response.ok) {
      throw new Error(`Error al crear la mesa: ${response.status}`);
    }
    
    // Parsea la respuesta JSON del servidor
    const data = await response.json();
    console.log("Mesa creada:", data);  // Log para depuración
    
    // Retorna los datos de la mesa creada
    return data;
  } catch (error) {
    // Captura y registra cualquier error ocurrido durante el proceso
    console.error("Error en la creación de la mesa:", error);
    throw error;  // Relanza el error para manejo posterior
  }
}

/**
 * Función para actualizar una mesa (position-site) en el servidor.
 * @param {number} tableId - ID de la mesa a actualizar
 * @param {Object} tableData - Datos de la mesa a actualizar
 * @param {number} tableData.capacity - Capacidad de la mesa (número de sillas)
 * @param {number} tableData.xlocation - Posición X de la mesa (en decimal, 0-1)
 * @param {number} tableData.ylocation - Posición Y de la mesa (en decimal, 0-1)
 * @returns {Promise<Object>} - Promesa que resuelve con los datos de la mesa actualizada
 * @throws {Error} - Lanza error si falla la actualización de la mesa
 */
export async function updateTable(tableId, tableData) {
  try {
    // Obtiene el token de autenticación almacenado
    const token = await getAuthToken();
    
    // Verifica si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    // Prepara los datos para enviar al servidor
    const requestData = {
      positionId: 1,  // Valor fijo según requerimiento
      siteId: 1,      // Valor fijo según requerimiento
      capacity: tableData.capacity,
      xlocation: tableData.xlocation,
      ylocation: tableData.ylocation
    };
    
    // Realiza la petición PUT al endpoint de position-sites
    const response = await fetch(`${baseURL}/position-site/${tableId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',  // Indica que enviamos datos JSON
        'accept': '*/*',                     // Acepta cualquier tipo de respuesta
        'Authorization': `Bearer ${token}`   // Incluye el token en el header de autorización
      },
      body: JSON.stringify(requestData)      // Convierte los datos a JSON
    });
    
    // Si la respuesta no es exitosa (status fuera del rango 200-299)
    if (!response.ok) {
      throw new Error(`Error al actualizar la mesa: ${response.status}`);
    }
    
    // Parsea la respuesta JSON del servidor
    const data = await response.json();
    console.log("Mesa actualizada:", data);  // Log para depuración
    
    // Retorna los datos de la mesa actualizada
    return data;
  } catch (error) {
    // Captura y registra cualquier error ocurrido durante el proceso
    console.error("Error en la actualización de la mesa:", error);
    throw error;  // Relanza el error para manejo posterior
  }
}

// Función para verificar si hay un usuario asociado a una mesa
export const getTableUser = async (positionSiteId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Realizando petición a: ${baseURL}/route-position-site-user/position-site/${positionSiteId}`);
    console.log(`Token: ${token.substring(0, 10)}...`);
    
    const response = await fetch(`${baseURL}/route-position-site-user/position-site/${positionSiteId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    console.log(`Estado de la respuesta: ${response.status} ${response.statusText}`);
    
    // Obtener el texto de la respuesta
    const responseText = await response.text();
    console.log("Respuesta completa (texto):", responseText);
    
    // Intentar analizar como JSON solo si hay contenido
    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log("Respuesta analizada como JSON:", data);
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    } else {
      console.log("La respuesta está vacía");
      data = { result: [] };
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener el usuario de la mesa:", error);
    throw error;
  }
};

// Función para obtener los detalles de un usuario
export const getUserDetails = async (userId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Realizando petición a: ${baseURL}/user/${userId}`);
    
    const response = await fetch(`${baseURL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    console.log(`Estado de la respuesta: ${response.status} ${response.statusText}`);
    
    // Obtener el texto de la respuesta
    const responseText = await response.text();
    console.log("Respuesta completa (texto):", responseText);
    
    // Intentar analizar como JSON solo si hay contenido
    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log("Respuesta analizada como JSON:", data);
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    } else {
      console.log("La respuesta está vacía");
      data = { result: null };
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener los detalles del usuario:", error);
    throw error;
  }
};

// Función para asignar un usuario a una mesa
export const assignUserToTable = async (routeId, positionSiteId, userId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    const currentDate = new Date().toISOString();
    const requestBody = {
      routeId,
      positionSiteId,
      userId,
      createdAt: currentDate,
      updatedAt: currentDate,
      deletedAt: null
    };
    
    console.log(`Realizando petición POST a: ${baseURL}/route-position-site-user`);
    console.log("Cuerpo de la petición:", JSON.stringify(requestBody));
    
    const response = await fetch(`${baseURL}/route-position-site-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Estado de la respuesta: ${response.status} ${response.statusText}`);
    
    // Obtener el texto de la respuesta
    const responseText = await response.text();
    console.log("Respuesta completa (texto):", responseText);
    
    // Intentar analizar como JSON solo si hay contenido
    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log("Respuesta analizada como JSON:", data);
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    } else {
      console.log("La respuesta está vacía");
      data = { type: "SUCCESS" };
    }
    
    return data;
  } catch (error) {
    console.error("Error al asignar usuario a la mesa:", error);
    throw error;
  }
};

// Actualizar usuario asignado a una mesa
export const updateTableUser = async (assignmentId, routeId, positionSiteId, userId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error("No se pudo obtener el token de autenticación");
    }
    
    // Crear el cuerpo de la solicitud
    const requestBody = {
      routeId: routeId,
      positionSiteId: positionSiteId,
      userId: userId,
      createdAt: new Date().toISOString()
    };
    
    console.log("Actualizando asignación de usuario a mesa:", {
      assignmentId,
      requestBody
    });
    
    // Realizar la solicitud PUT
    const response = await fetch(`${baseURL}/route-position-site-user/${assignmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log("Respuesta del servidor (status):", response.status);
    
    // Obtener el texto de la respuesta
    const responseText = await response.text();
    console.log("Respuesta completa del servidor:", responseText);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Error al actualizar usuario: ${response.status} - ${responseText}`);
    }
    
    // Intentar parsear la respuesta como JSON
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log("Respuesta parseada:", data);
      
      // Verificar si la respuesta tiene el formato esperado
      if (data.type === "SUCCESS" && data.result) {
        console.log("Asignación actualizada correctamente:", data.result);
      } else {
        console.warn("Respuesta inesperada:", data);
      }
    } catch (parseError) {
      console.error("Error al parsear la respuesta como JSON:", parseError);
      throw new Error(`Error al parsear la respuesta: ${parseError.message}. Respuesta: ${responseText}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error en updateTableUser:", error);
    throw error;
  }
};
