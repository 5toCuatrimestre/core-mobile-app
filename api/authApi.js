export const baseURL = "http://localhost:8080";
export async function login(credentials) {
    try {
      const response = await fetch("http://localhost:8080/core/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }
  
      const data = await response.json(); 
      return data;
    } catch (error) {
      console.error("Error en la autenticación:", error);
      throw error; 
    }
  }
