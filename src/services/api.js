import axios from "axios";

const API_URL = "http://localhost:8001/api/v1";

const clearAuthStorage = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
};


export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const loginUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, data);

    const response = res.data;

    if (response.accessToken) {
      localStorage.setItem("authToken", response.accessToken);
    }

    localStorage.setItem("userData", JSON.stringify(response));

    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logoutUser = async () => {
  const token = localStorage.getItem("authToken");

  clearAuthStorage();

  if (!token) {
    return { message: "Logged out successfully" };
  }

  try {
    const res = await axios.post(
      `${API_URL}/user/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const getCurrentUserProfile = async () => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCurrentUser = async (data) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.put(`${API_URL}/user`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem("userData", JSON.stringify(res.data));

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createRecipe = async (data) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.post(`${API_URL}/recipes`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRecipeById = async (recipeId) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_URL}/recipes/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllRecipes = async () => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_URL}/recipes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateRecipe = async (recipeId, data) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.put(`${API_URL}/recipes/${recipeId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteRecipe = async (recipeId) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.delete(`${API_URL}/recipes/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

