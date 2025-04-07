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
