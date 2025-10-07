// apiHelper.js
const request = async (url, method = "GET", data = null, token = null) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.json();
      const errorMessage = errorBody.error || "Unknown error";
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
