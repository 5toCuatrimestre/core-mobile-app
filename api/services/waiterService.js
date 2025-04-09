import { getAuthToken } from '../authApi';
import { baseURL } from '../authApi';

/**
 * Obtiene todos los meseros disponibles
 * @returns {Promise} Promesa con la respuesta del servidor
 */
export const getWaiters = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${baseURL}/user/waiters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener meseros:', error);
    throw error;
  }
};

/**
 * Obtiene los meseros disponibles para asignar a mesas
 * @returns {Promise} Promesa con la respuesta del servidor
 */
export const getAvailableWaiters = async () => {
  try {
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Realizando petición a: ${baseURL}/user/waiters`);
    
    const response = await fetch(`${baseURL}/user/waiters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
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
    console.error('Error al obtener meseros disponibles:', error);
    throw error;
  }
};

/**
 * Asigna un mesero a una mesa
 * @param {number} positionSiteId - ID de la mesa
 * @param {number} userId - ID del mesero
 * @returns {Promise} Promesa con la respuesta del servidor
 */
export const assignWaiterToTable = async (positionSiteId, userId) => {
  try {
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    const currentDate = new Date().toISOString();
    const requestBody = {
      routeId: 1,
      positionSiteId: positionSiteId,
      userId: userId,
      createdAt: currentDate,
      updatedAt: currentDate,
      deletedAt: null
    };
    
    console.log(`Realizando petición POST a: ${baseURL}/route-position-site-user`);
    console.log("Cuerpo de la petición:", JSON.stringify(requestBody));
    
    const response = await fetch(`${baseURL}/route-position-site-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
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
    console.error('Error al asignar mesero a la mesa:', error);
    throw error;
  }
};

/**
 * Verifica los detalles de venta pendientes
 * @returns {Promise} Promesa con la respuesta del servidor
 */
export const checkPendingSellDetails = async () => {
  try {
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Realizando petición a: ${baseURL}/sell-detail-status/pending`);
    
    const response = await fetch(`${baseURL}/sell-detail-status/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
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
    console.error('Error al verificar detalles de venta pendientes:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de un detalle de venta
 * @param {number} sellDetailStatusId - ID del estado del detalle de venta
 * @param {string} status - Nuevo estado (ACCEPTED o REJECTED)
 * @returns {Promise} Promesa con la respuesta del servidor
 */
export const updateSellDetailStatus = async (sellDetailStatusId, status) => {
  try {
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Realizando petición a: ${baseURL}/sell-detail-status/${sellDetailStatusId}`);
    console.log("Estado a actualizar:", status);
    
    const response = await fetch(`${baseURL}/sell-detail-status/${sellDetailStatusId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
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
    console.error('Error al actualizar el estado del detalle de venta:', error);
    throw error;
  }
}; 