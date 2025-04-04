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
 * Asigna un mesero a una mesa
 * @param {number} positionSiteId - ID de la mesa
 * @param {number} userId - ID del mesero
 * @returns {Promise} Promesa con la respuesta del servidor
 */
export const assignWaiterToTable = async (positionSiteId, userId) => {
  try {
    const token = await getAuthToken();
    const currentDate = new Date().toISOString();
    
    const response = await fetch(`${baseURL}/route-position-site-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        routeId: 1,
        positionSiteId: positionSiteId,
        userId: userId,
        createdAt: currentDate,
        updatedAt: currentDate,
        deletedAt: null
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al asignar mesero a la mesa:', error);
    throw error;
  }
}; 