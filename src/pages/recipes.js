import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Clock,
  Users,
  X,
  Trash2,
  Pencil,
  Eye,
  PlusCircle,
  UtensilsCrossed,
  Search,
  MoreVertical,
  ChefHat,
} from "lucide-react";

import {
  createRecipe,
  getRecipeById,
  getAllRecipes,
  updateRecipe,
  deleteRecipe,
  searchIngredients,
} from "../services/api";

const getErrorMessage = (error) => {
  return error?.message || "";
};

const CATEGORY_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snack"];

const UNIT_OPTIONS = [
  { value: "GRAM", label: "g" },
  { value: "KILOGRAM", label: "kg" },
  { value: "MILLILITER", label: "ml" },
  { value: "LITER", label: "L" },
  { value: "PIECE", label: "pcs" },
  { value: "TABLESPOON", label: "tbsp" },
  { value: "TEASPOON", label: "tsp" },
  { value: "CUP", label: "cup" },
  { value: "PINCH", label: "pinch" },
];

const getUnitLabel = (value) => {
  const found = UNIT_OPTIONS.find((option) => option.value === value);
  return found ? found.label : value;
};

const emptyIngredient = { ingredientName: "", amount: "", unit: "" };

const initialFormData = {
  title: "",
  description: "",
  servings: "",
  category: "",
  preparationTime: "",
  preparationSteps: "",
  ingredients: [emptyIngredient],
};

const initialFormErrors = {
  title: "",
  servings: "",
  category: "",
  preparationTime: "",
  ingredients: [],
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600";

const errorInputClass =
  "w-full rounded-xl border border-red-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-500";

const labelClass = "mb-1.5 block text-left text-sm font-medium text-slate-700";

const Field = ({ label, required, error, children }) => {
  return (
    <div className="text-left">
      <label className={labelClass}>
        {label}
        {required ? <span className="text-slate-400"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
};

const Modal = ({ open, onClose, maxWidth, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-400/20" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth || "max-w-lg"} max-h-[90vh] overflow-hidden rounded-2xl bg-white text-left shadow-lg`}
      >
        <div className="max-h-[90vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const ModalHeader = ({ title }) => {
  return (
    <div className="rounded-t-2xl border-b border-slate-100 bg-blue-50 px-6 py-4">
      <h2 className="text-sm font-normal text-slate-700">{title}</h2>
    </div>
  );
};

const Chip = ({ icon, children }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-normal text-slate-700">
      {icon}
      {children}
    </span>
  );
};

const CardMenu = ({ onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-white p-1.5 text-slate-700 shadow-md hover:bg-blue-50"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
          >
            <Eye size={15} /> View
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const RecipeCard = ({ recipe, onView, onEdit, onDelete }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md">
      <div className="relative flex h-24 items-center justify-center rounded-t-xl bg-gradient-to-br from-blue-100 to-blue-200">
        <UtensilsCrossed size={28} className="text-white/90" />

        <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-sm font-normal text-slate-700 shadow">
          {recipe.category}
        </span>

        <div className="absolute right-2 top-2">
          <CardMenu onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <div className="p-3.5 text-left">
        <h3 className="text-sm font-normal text-slate-700">{recipe.title}</h3>

        <p className="mt-1 line-clamp-2 min-h-[32px] text-xs text-slate-500">
          {recipe.description || "No description available"}
        </p>

        <hr className="my-2.5 border-slate-100" />

        <div className="flex flex-wrap gap-1.5">
          <Chip icon={<Clock size={11} />}>{recipe.preparationTime} min</Chip>
          <Chip icon={<Users size={11} />}>{recipe.servings} servings</Chip>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onAdd }) => {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-blue-50/60 text-center">
      <ChefHat size={48} className="mb-3 text-blue-600" />
      <p className="text-sm font-normal text-slate-700">No recipes yet</p>
      <p className="mt-1 text-sm text-slate-500">
        Add your first healthy recipe to get started
      </p>
      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-white"
      >
        <Plus size={16} /> Add Recipe
      </button>
    </div>
  );
};

const IngredientRow = ({
  index,
  ingredient,
  error,
  onChange,
  onRemove,
  disableRemove,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleNameChange = async (event) => {
    onChange(index, event);

    const value = event.target.value;

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearching(true);
      const result = await searchIngredients(value);
      setSuggestions(result || []);
      setShowSuggestions(true);
    } catch (error) {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestionClick = (suggestionName) => {
    const fakeEvent = {
      target: { name: "ingredientName", value: suggestionName },
    };
    onChange(index, fakeEvent);
    setShowSuggestions(false);
  };

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          disabled={disableRemove}
          onClick={() => onRemove(index)}
          className="rounded-full p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <input
            placeholder="Ingredient Name"
            name="ingredientName"
            value={ingredient.ingredientName}
            onChange={handleNameChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className={`${
              error?.ingredientName ? errorInputClass : inputClass
            } bg-white`}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {suggestions.map((suggestion, suggestionIndex) => (
                <button
                  key={suggestionIndex}
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      suggestion.name || suggestion.ingredientName
                    )
                  }
                  className="flex w-full items-center px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
                >
                  {suggestion.name || suggestion.ingredientName}
                </button>
              ))}
            </div>
          )}

          {searching && (
            <p className="mt-1 text-xs text-slate-400">Searching...</p>
          )}

          {error?.ingredientName && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {error.ingredientName}
            </p>
          )}
        </div>

        <div>
          <input
            type="number"
            placeholder="Amount"
            name="amount"
            value={ingredient.amount}
            onChange={(event) => onChange(index, event)}
            className={`${error?.amount ? errorInputClass : inputClass} bg-white`}
          />
          {error?.amount && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {error.amount}
            </p>
          )}
        </div>

        <div>
          <select
            name="unit"
            value={ingredient.unit}
            onChange={(event) => onChange(index, event)}
            className={`${error?.unit ? errorInputClass : inputClass} bg-white`}
          >
            <option value="" disabled>
              Unit
            </option>
            {UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error?.unit && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {error.unit}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editId, setEditId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await getAllRecipes();
      setRecipes(response || []);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      toast.error(getErrorMessage(error) || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [name]: value,
    };
    setFormData({ ...formData, ingredients: updatedIngredients });

    const updatedIngredientErrors = [...formErrors.ingredients];
    if (updatedIngredientErrors[index]) {
      updatedIngredientErrors[index] = {
        ...updatedIngredientErrors[index],
        [name]: "",
      };
    }
    setFormErrors({ ...formErrors, ingredients: updatedIngredientErrors });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ...emptyIngredient }],
    });
  };

  const handleRemoveIngredient = (index) => {
    if (formData.ingredients.length === 1) return;
    const updatedIngredients = formData.ingredients.filter(
      (item, i) => i !== index
    );
    const updatedIngredientErrors = formErrors.ingredients.filter(
      (item, i) => i !== index
    );
    setFormData({ ...formData, ingredients: updatedIngredients });
    setFormErrors({ ...formErrors, ingredients: updatedIngredientErrors });
  };

  const handleAddOpen = () => {
    setEditId(null);
    setFormErrors(initialFormErrors);
    setFormData(initialFormData);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditId(null);
    setFormErrors(initialFormErrors);
    setFormData(initialFormData);
  };

  const handleEditOpen = async (recipeId) => {
    try {
      setActionLoading(true);
      setFormErrors(initialFormErrors);

      const response = await getRecipeById(recipeId);

      setEditId(recipeId);

      let ingredientsList = [{ ...emptyIngredient }];
      if (response.ingredients && response.ingredients.length > 0) {
        ingredientsList = response.ingredients.map((ingredient) => ({
          ingredientName: ingredient.ingredientName || ingredient.name || "",
          amount: ingredient.amount ?? ingredient.quantity ?? "",
          unit: ingredient.unit || "",
        }));
      }

      setFormData({
        title: response.title || "",
        description: response.description || "",
        servings: response.servings || "",
        category: response.category || "",
        preparationTime: response.preparationTime || "",
        preparationSteps: response.preparationSteps || "",
        ingredients: ingredientsList,
      });

      setFormOpen(true);
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
      toast.error(getErrorMessage(error) || "Failed to load recipe");
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (recipeId) => {
    try {
      setActionLoading(true);
      const response = await getRecipeById(recipeId);
      setSelectedRecipe(response);
      setViewOpen(true);
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
      toast.error(getErrorMessage(error) || "Failed to load recipe");
    } finally {
      setActionLoading(false);
    }
  };

  const validateForm = () => {
    const errors = { ...initialFormErrors };
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = "Recipe title is required";
      isValid = false;
    }

    if (!formData.servings) {
      errors.servings = "Servings is required";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Category is required";
      isValid = false;
    }

    if (!formData.preparationTime) {
      errors.preparationTime = "Preparation time is required";
      isValid = false;
    }

    const ingredientErrors = formData.ingredients.map((ingredient) => {
      const rowError = { ingredientName: "", amount: "", unit: "" };

      if (!ingredient.ingredientName.trim()) {
        rowError.ingredientName = "Name is required";
        isValid = false;
      }

      if (!ingredient.amount) {
        rowError.amount = "Amount is required";
        isValid = false;
      }

      if (!ingredient.unit) {
        rowError.unit = "Unit is required";
        isValid = false;
      }

      return rowError;
    });

    errors.ingredients = ingredientErrors;

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      const isValid = validateForm();
      if (!isValid) return;

      setActionLoading(true);

      const data = {
        title: formData.title,
        description: formData.description,
        servings: Number(formData.servings),
        category: formData.category,
        preparationTime: Number(formData.preparationTime),
        preparationSteps: formData.preparationSteps,
        ingredients: formData.ingredients.map((ingredient) => ({
          ingredientName: ingredient.ingredientName.trim(),
          amount: Number(ingredient.amount),
          unit: ingredient.unit,
        })),
      };

      if (editId) {
        await updateRecipe(editId, data);
        toast.success("Recipe updated successfully");
      } else {
        await createRecipe(data);
        toast.success("Recipe created successfully");
      }

      handleFormClose();
      await fetchRecipes();
    } catch (error) {
      console.error("Failed to save recipe:", error);
      const message = getErrorMessage(error) || "Failed to save recipe";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOpen = (recipe) => {
    setSelectedRecipe(recipe);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteRecipe(selectedRecipe.id);
      toast.success("Recipe deleted successfully");
      setDeleteOpen(false);
      setSelectedRecipe(null);
      await fetchRecipes();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      toast.error(getErrorMessage(error) || "Failed to delete recipe");
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredRecipes = () => {
    return recipes.filter((recipe) => {
      const title = recipe.title ? recipe.title.toLowerCase() : "";
      const matchesSearch = title.includes(searchTerm.trim().toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || recipe.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="min-h-full bg-white p-4 pt-16 sm:pt-4 md:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
            <ChefHat size={22} className="text-blue-600" />
          </div>
          <div className="min-w-0 text-left">
            <h1 className="text-2xl font-extrabold text-slate-900">
              My Recipes
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Create and manage your healthy meal recipes
            </p>
          </div>
        </div>

        <button
          onClick={handleAddOpen}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          <Plus size={18} /> Add Recipe
        </button>
      </div>

      <div className="mb-6 flex flex-row flex-nowrap items-center gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className={`${inputClass} w-32 flex-shrink-0 px-2 text-xs sm:w-44 sm:px-3.5 sm:text-sm`}
        >
          <option value="All">All Categories</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState onAdd={handleAddOpen} />
      ) : filteredRecipes.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-blue-50/40 text-center">
          <Search size={36} className="mb-3 text-blue-600" />
          <p className="text-sm font-normal text-slate-700">
            No recipes match your search
          </p>
          <p className="mt-1 text-[13.5px] text-slate-500">
            Try a different keyword or category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => handleView(recipe.id)}
              onEdit={() => handleEditOpen(recipe.id)}
              onDelete={() => handleDeleteOpen(recipe)}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={handleFormClose} maxWidth="max-w-3xl">
        <ModalHeader title={editId ? "Edit Recipe" : "Add New Recipe"} />

        <div className="px-6 py-5 text-left">
          <div className="space-y-5">
            <Field label="Recipe Title" required error={formErrors.title}>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={formErrors.title ? errorInputClass : inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Category" required error={formErrors.category}>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={
                    formErrors.category ? errorInputClass : inputClass
                  }
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Servings" required error={formErrors.servings}>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  className={
                    formErrors.servings ? errorInputClass : inputClass
                  }
                />
              </Field>

              <Field
                label="Preparation Time (min)"
                required
                error={formErrors.preparationTime}
              >
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  className={
                    formErrors.preparationTime ? errorInputClass : inputClass
                  }
                />
              </Field>
            </div>

            <hr className="border-slate-100" />

            <div className="text-left">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-slate-700">
                    Ingredients
                  </p>
                  <p className="text-xs text-slate-500">
                    At least one ingredient is required
                  </p>
                </div>

                <button
                  onClick={handleAddIngredient}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600"
                >
                  <PlusCircle size={16} /> Add Ingredient
                </button>
              </div>

              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <IngredientRow
                    key={index}
                    index={index}
                    ingredient={ingredient}
                    error={formErrors.ingredients[index]}
                    onChange={handleIngredientChange}
                    onRemove={handleRemoveIngredient}
                    disableRemove={formData.ingredients.length === 1}
                  />
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            <Field label="Preparation Steps">
              <textarea
                name="preparationSteps"
                value={formData.preparationSteps}
                onChange={handleChange}
                rows={5}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={handleFormClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={actionLoading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {actionLoading
              ? "Saving..."
              : editId
                ? "Update Recipe"
                : "Create Recipe"}
          </button>
        </div>
      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="max-w-lg"
      >
        {selectedRecipe && (
          <>
            <div className="flex items-start justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-blue-50 px-4 py-3.5 sm:px-6">
              <div className="min-w-0 text-left">
                <h2 className="truncate text-sm font-normal text-slate-700">
                  {selectedRecipe.title}
                </h2>
                <span className="mt-1.5 inline-block rounded-full border border-slate-200 bg-white px-2.5 py-1 text-sm font-normal text-slate-700">
                  {selectedRecipe.category}
                </span>
              </div>
              <button
                onClick={() => setViewOpen(false)}
                className="flex-shrink-0 rounded-full p-1.5 text-slate-500 hover:bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-4 text-left sm:px-6">
              {selectedRecipe.description && (
                <p className="text-sm font-normal leading-relaxed text-slate-700">
                  {selectedRecipe.description}
                </p>
              )}

              <div className="my-3 flex flex-wrap gap-2">
                <Chip icon={<Clock size={13} />}>
                  {selectedRecipe.preparationTime} min
                </Chip>
                <Chip icon={<Users size={13} />}>
                  {selectedRecipe.servings} servings
                </Chip>
              </div>

              {selectedRecipe.ingredients &&
                selectedRecipe.ingredients.length > 0 && (
                  <>
                    <p className="mb-2 text-sm font-normal text-slate-700">
                      Ingredients
                    </p>

                    <div className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-left"
                        >
                          <p className="truncate text-sm font-normal text-slate-700">
                            {ingredient.ingredientName ||
                              ingredient.name ||
                              `Ingredient ${index + 1}`}
                          </p>
                          <p className="flex-shrink-0 pl-2 text-sm font-normal text-slate-700">
                            {ingredient.amount ?? ingredient.quantity}{" "}
                            {getUnitLabel(ingredient.unit)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <hr className="my-4 border-slate-100" />
                  </>
                )}

              <p className="mb-1 text-sm font-normal text-slate-700">
                Preparation Steps
              </p>
              <p className="whitespace-pre-line pb-1 text-left text-sm font-normal leading-relaxed text-slate-700">
                {selectedRecipe.preparationSteps}
              </p>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="max-w-sm"
      >
        <div className="px-6 py-5 text-left">
          <h2 className="text-sm font-normal text-slate-700">
            Delete Recipe?
          </h2>
          <p className="mt-2 text-sm font-normal text-slate-700">
            Are you sure you want to delete{" "}
            <span className="font-normal text-slate-700">
              {selectedRecipe ? selectedRecipe.title : ""}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-5">
          <button
            onClick={() => setDeleteOpen(false)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Recipes;