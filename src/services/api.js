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

export const createMealPlan = async (data) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.post(`${API_URL}/meal-plans`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMealPlanById = async (mealPlanId) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_URL}/meal-plans/${mealPlanId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllMealPlans = async () => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_URL}/meal-plans`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateMealPlan = async (mealPlanId, data) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.put(
      `${API_URL}/meal-plans/${mealPlanId}`,
      data,
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

export const deleteMealPlan = async (mealPlanId) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.delete(`${API_URL}/meal-plans/${mealPlanId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getShoppingListById = async (shoppingListId) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(
      `${API_URL}/shopping-lists/${shoppingListId}`,
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

export const getAllShoppingLists = async () => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(
      `${API_URL}/shopping-lists`,
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

export const updateShoppingList = async (
  shoppingListId,
  data
) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.put(
      `${API_URL}/shopping-lists/${shoppingListId}`,
      data,
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

export const deleteShoppingList = async (
  shoppingListId
) => {
  try {
    const token = localStorage.getItem("authToken");

    await axios.delete(
      `${API_URL}/shopping-lists/${shoppingListId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleShoppingListItem = async (
  shoppingListId,
  itemId
) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.patch(
      `${API_URL}/shopping-lists/${shoppingListId}/items/${itemId}/toggle-complete`,
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

export const deleteShoppingListItem = async (
  shoppingListId,
  itemId
) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.delete(
      `${API_URL}/shopping-lists/${shoppingListId}/items/${itemId}`,
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

export const searchIngredients = async (search = "") => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_URL}/ingredients`, {
      params: {
        search: search,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const importRecipe = async ({ url, file }) => {
  const token = localStorage.getItem("authToken");
  const formData = new FormData();

  if (url) formData.append("url", url);
  if (file) formData.append("file", file);

  try {
    const res = await axios.post(`${API_URL}/recipes/import`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 75000,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
