// apiHelper.js

const request = async (url, method = "GET", data = null, token = null) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      credentials: "include", // Ensures cookies/credentials sent on cross-origin (CORS) requests
    };
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    // Handle non-OK responses and ensure CORS errors/messages can be seen
    if (!response.ok) {
      let errorMessage = "Unknown error";
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      console.error("Response Error Message:", errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Helper functions for typical HTTP methods
export const apiHelper = {
  get: (url, token) => request(url, "GET", null, token),
  post: (url, data, token) => request(url, "POST", data, token),
  put: (url, data, token) => request(url, "PUT", data, token),
  delete: (url, token) => request(url, "DELETE", null, token),
};
