import { baseURL } from '../authApi';
import { getAuthToken } from '../authApi';

/**
 * Obtiene las áreas asignadas a un mesero específico
 * @param {number} userId - ID del mesero
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const getWaiterAssignedAreas = async (userId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Obteniendo áreas asignadas para el usuario: ${userId}`);
    console.log(`URL de la petición: ${baseURL}/route-position-site-user/user/${userId}/positions`);
    console.log(`Token de autenticación: ${token.substring(0, 10)}...`);
    
    // Realizar la petición GET
    const response = await fetch(`${baseURL}/route-position-site-user/user/${userId}/positions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
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
        
        // Transformar la respuesta al formato esperado por el componente
        if (data.type === "SUCCESS" && data.result) {
          // Mapear los datos al formato esperado
          const mappedData = data.result.map(item => ({
            positionSiteId: item.position_siteId,
            positionId: item.positionId,
            siteId: item.siteId,
            capacity: item.capacity,
            xlocation: item.xLocation,
            ylocation: item.yLocation
          }));
          
          return {
            type: "SUCCESS",
            data: mappedData
          };
        }
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    } else {
      console.log("La respuesta está vacía");
    }
    
    // Si no se pudo procesar la respuesta, devolver un objeto vacío
    return { type: "SUCCESS", data: [] };
  } catch (error) {
    console.error("Error al obtener las áreas asignadas al mesero:", error);
    throw error;
  }
};

/**
 * Busca una cuenta de venta existente para un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const findUserSell = async (userId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Buscando cuenta de venta para el usuario: ${userId}`);
    console.log(`URL de la petición: ${baseURL}/sell/user/${userId}`);
    
    // Realizar la petición GET
    const response = await fetch(`${baseURL}/sell/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
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
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }
    
    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al buscar la cuenta de venta:", error);
    throw error;
  }
};

/**
 * Crea una nueva cuenta de venta para un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const createUserSell = async (userId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    // Obtener la fecha y hora actual
    const now = new Date();
    const sellDate = now.toISOString();
    const sellTime = now.toTimeString().split(' ')[0];
    
    console.log(`Creando cuenta de venta para el usuario: ${userId}`);
    console.log(`URL de la petición: ${baseURL}/sell`);
    console.log(`Datos a enviar: userId=${userId}, sellDate=${sellDate}, sellTime=${sellTime}`);
    
    // Realizar la petición POST
    const response = await fetch(`${baseURL}/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
      },
      body: JSON.stringify({
        userId: userId,
        sellDate: sellDate,
        sellTime: sellTime,
        status: true
      })
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
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }
    
    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al crear la cuenta de venta:", error);
    throw error;
  }
};

/**
 * Busca una cuenta de venta existente para una posición específica
 * @param {number} positionSiteId - ID de la posición
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const findPositionSell = async (positionSiteId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Buscando cuenta de venta para la posición: ${positionSiteId}`);
    console.log(`URL de la petición: ${baseURL}/sell/position-site/${positionSiteId}`);
    
    // Realizar la petición GET
    const response = await fetch(`${baseURL}/sell/position-site/${positionSiteId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
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
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }
    
    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al buscar la cuenta de venta por posición:", error);
    throw error;
  }
};

/**
 * Crea una nueva cuenta de venta para un usuario y posición específica
 * @param {number} userId - ID del usuario
 * @param {number} positionSiteId - ID de la posición
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const createPositionSell = async (userId, positionSiteId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    // Obtener la fecha y hora actual
    const now = new Date();
    const sellDate = now.toISOString();
    const sellTime = now.toTimeString().split(' ')[0];
    
    console.log(`Creando cuenta de venta para el usuario: ${userId} y posición: ${positionSiteId}`);
    console.log(`URL de la petición: ${baseURL}/sell`);
    console.log(`Datos a enviar: userId=${userId}, position_site_id=${positionSiteId}, sellDate=${sellDate}, sellTime=${sellTime}`);
    
    // Realizar la petición POST
    const response = await fetch(`${baseURL}/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
      },
      body: JSON.stringify({
        userId: userId,
        position_site_id: positionSiteId,
        sellDate: sellDate,
        sellTime: sellTime,
        status: true
      })
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
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }
    
    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al crear la cuenta de venta por posición:", error);
    throw error;
  }
};

/**
 * Obtiene los detalles de una venta específica
 * @param {number} sellId - ID de la venta
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const getSellDetails = async (sellId) => {
  try {
    // Obtener el token de autenticación
    const token = await getAuthToken();
    
    // Verificar si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    console.log(`Obteniendo detalles de la venta: ${sellId}`);
    console.log(`URL de la petición: ${baseURL}/sell-details/sell/${sellId}`);
    
    // Realizar la petición GET
    const response = await fetch(`${baseURL}/sell-details/sell/${sellId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
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
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }
    
    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al obtener los detalles de la venta:", error);
    throw error;
  }
};

/**
 * Crea un detalle de venta para un producto específico
 * @param {number} sellId - ID de la venta
 * @param {number} productId - ID del producto
 * @param {number} quantity - Cantidad del producto
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const createSellDetail = async (sellId, productId, quantity) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    console.log(`Creando detalle de venta para sellId: ${sellId}, productId: ${productId}, quantity: ${quantity}`);
    
    const response = await fetch(`${baseURL}/sell-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
      },
      body: JSON.stringify({
        sellId,
        productId,
        quantity
      })
    });

    console.log(`Estado de la respuesta: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log("Respuesta completa (texto):", responseText);
    
    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log("Respuesta analizada como JSON:", data);
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }
    
    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al crear el detalle de venta:", error);
    throw error;
  }
};

/**
 * Actualiza la cantidad de un producto en una venta
 * @param {number} sellDetailId - ID del detalle de venta
 * @param {number} sellId - ID de la venta
 * @param {number} productId - ID del producto
 * @param {number} quantity - Nueva cantidad del producto
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const updateSellDetail = async (sellDetailId, sellId, productId, quantity) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    console.log(`Actualizando detalle de venta ${sellDetailId} con cantidad ${quantity}`);
    console.log(`URL: ${baseURL}/sell-details/${sellDetailId}`);
    console.log(`Datos:`, { sellId, productId, quantity });
    
    const response = await fetch(`${baseURL}/sell-details/${sellDetailId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
      },
      body: JSON.stringify({
        sellId,
        productId,
        quantity
      })
    });

    console.log(`Estado de la respuesta: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log("Respuesta completa (texto):", responseText);
    
    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log("Respuesta analizada como JSON:", data);
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }
    
    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al actualizar el detalle de venta:", error);
    throw error;
  }
};

/**
 * Cancela una cuenta de venta
 * @param {number} sellId - ID de la venta
 * @param {number} totalPrice - Precio total de la venta
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const cancelSell = async (sellId, totalPrice) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    // Obtener la fecha y hora actual
    const now = new Date();
    const sellDate = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const sellTime = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS

    console.log(`Cancelando la venta con ID: ${sellId} y precio total: ${totalPrice}`);
    const response = await fetch(`${baseURL}/sell/${sellId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "*/*"
      },
      body: JSON.stringify({
        sellDate: sellDate,
        sellTime: sellTime,
        status: false,
        totalPrice: totalPrice
      })
    });

    console.log(`Estado de la respuesta: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log("Respuesta completa (texto):", responseText);

    let data;
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log("Respuesta analizada como JSON:", data);
        return data;
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError);
        throw new Error(`Error al analizar JSON: ${parseError.message}. Respuesta: ${responseText}`);
      }
    }

    return { type: "ERROR", text: "Respuesta vacía", result: null };
  } catch (error) {
    console.error("Error al cancelar la venta:", error);
    throw error;
  }
};

// Crear una solicitud de cancelación
export const createCancelRequest = async (sellDetailId, positionSiteId, name, nameWaiter, status, quantity) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const response = await fetch(`${baseURL}/sell-detail-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      },
      body: JSON.stringify({
        sellDetailId,
        positionSiteId,
        name,
        nameWaiter,
        status,
        quantity
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al crear solicitud de cancelación:', error);
    throw error;
  }
};

// Verificar el estado de una solicitud de cancelación
export const checkCancelRequestStatus = async (sellDetailStatusId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const response = await fetch(`${baseURL}/sell-detail-status/ById/${sellDetailStatusId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al verificar estado de cancelación:', error);
    throw error;
  }
};

// Rechazar una solicitud de cancelación
export const rejectCancelRequest = async (sellDetailStatusId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const response = await fetch(`${baseURL}/sell-detail-status/${sellDetailStatusId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'accept': '*/*'
      },
      body: JSON.stringify({
        status: 'REJECTED'
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al rechazar solicitud de cancelación:', error);
    throw error;
  }
};
