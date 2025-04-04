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
