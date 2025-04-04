// Importación de AsyncStorage para almacenamiento persistente en el dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * URL base de la API del backend.
 * Actualmente configurada para desarrollo local (localhost).
 * En producción debería cambiarse por la URL real del servidor.
 */
export const baseURL = "http://192.168.110.108:5000/core";

/**
 * Función para realizar el inicio de sesión del usuario.
 * @param {Object} credentials - Objeto con las credenciales del usuario (usuario y contraseña)
 * @returns {Promise<Object>} - Promesa que resuelve con los datos del usuario
 * @throws {Error} - Lanza error si falla la autenticación
 */
export async function login(credentials) {
    try {
        // Realiza una petición POST al endpoint de login
        const response = await fetch(`${baseURL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // Indica que enviamos datos JSON
                "accept": "*/*"                      // Acepta cualquier tipo de respuesta
            },
            body: JSON.stringify(credentials),       // Convierte credenciales a JSON
        });

        // Si la respuesta no es exitosa (status fuera del rango 200-299)
        if (!response.ok) {
            throw new Error("Error al iniciar sesión");
        }

        // Parsea la respuesta JSON del servidor
        const data = await response.json();
        console.log("Datos recibidos del servidor:", data);
        
        // Si el servidor devuelve un token JWT
        if (data.jwt) {
            try {
                // Almacena el token JWT en AsyncStorage
                await AsyncStorage.setItem('jwt_token', data.jwt);
                console.log("Token JWT guardado exitosamente");
                
                // Almacena el ID del usuario (convertido a string)
                await AsyncStorage.setItem('user_id', data.userId.toString());
                console.log("ID de usuario guardado exitosamente");
                
                // Almacena el rol del usuario
                await AsyncStorage.setItem('user_role', data.rol);
                console.log("Rol de usuario guardado exitosamente");
                
                // Almacena el email del usuario
                await AsyncStorage.setItem('user_email', data.email);
                console.log("Email de usuario guardado exitosamente");
                
                // Verificación: Lee el token recién guardado para confirmar
                const storedToken = await AsyncStorage.getItem('jwt_token');
                console.log("Token guardado verificado:", storedToken ? "Exitoso" : "Fallido");
            } catch (storageError) {
                console.error("Error al guardar en AsyncStorage:", storageError);
            }
        }
        
        // Retorna los datos del usuario recibidos del servidor
        return data;
    } catch (error) {
        console.error("Error en la autenticación:", error);
        throw error; // Relanza el error para manejo posterior
    }
}

/**
 * Función para obtener el token JWT almacenado.
 * @returns {Promise<string|null>} - Promesa que resuelve con el token o null si no existe
 */
export async function getAuthToken() {
    try {
        // Intenta obtener el token de AsyncStorage
        const token = await AsyncStorage.getItem('jwt_token');
        console.log("Token obtenido desde AsyncStorage:", token ? "Encontrado" : "No encontrado");
        return token;
    } catch (error) {
        console.error("Error al obtener el token:", error);
        return null;
    }
}

/**
 * Función para cerrar sesión del usuario.
 * Elimina todos los datos de autenticación almacenados.
 * @returns {Promise<void>}
 * @throws {Error} - Lanza error si falla el proceso de logout
 */
export async function logout() {
    try {
        // Elimina todos los datos relacionados con la sesión
        await AsyncStorage.removeItem('jwt_token');
        await AsyncStorage.removeItem('user_id');
        await AsyncStorage.removeItem('user_role');
        await AsyncStorage.removeItem('user_email');
        console.log("Sesión cerrada, tokens eliminados exitosamente");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
}