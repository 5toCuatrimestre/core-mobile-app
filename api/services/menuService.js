// Importa la URL base y la función para obtener el token desde el módulo de autenticación
import { baseURL } from '../authApi';
import { getAuthToken } from '../authApi';

/**
 * Función para obtener los datos de un menú específico desde el servidor.
 * @param {number} [menuId=1] - ID del menú a obtener (por defecto 1)
 * @returns {Promise<Object>} - Promesa que resuelve con los datos del menú
 * @throws {Error} - Lanza error si falla la obtención del menú
 */
export async function getMenu(menuId = 1) {
  try {
    // Obtiene el token de autenticación almacenado
    const token = await getAuthToken();
    
    // Verifica si existe un token válido
    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }
    
    // Realiza la petición GET al endpoint del menú
    const response = await fetch(`${baseURL}/menu/${menuId}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',  // Acepta cualquier tipo de respuesta
        'Authorization': `Bearer ${token}`  // Incluye el token en el header de autorización
      }
    });
    
    // Si la respuesta no es exitosa (status fuera del rango 200-299)
    if (!response.ok) {
      throw new Error(`Error al obtener el menú: ${response.status}`);
    }
    
    // Parsea la respuesta JSON del servidor
    const data = await response.json();
    console.log("Menú obtenido:", data);  // Log para depuración
    
    // Retorna los datos del menú
    return data;
  } catch (error) {
    // Captura y registra cualquier error ocurrido durante el proceso
    console.error("Error en la obtención del menú:", error);
    throw error;  // Relanza el error para manejo posterior
  }
}