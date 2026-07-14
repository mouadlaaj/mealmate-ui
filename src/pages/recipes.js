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
  MinusCircle,
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
} from "../services/api";

function getErrorMessage(error) {
  return error?.message || "";
}

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

function getUnitLabel(value) {
  const found = UNIT_OPTIONS.find((option) => option.value === value);
  return found ? found.label : value;
}

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600";

const labelClass = "mb-1.5 block text-left text-sm font-medium text-slate-700";

function Field({ label, required, children }) {
  return (
    <div className="text-left">
      <label className={labelClass}>
        {label}
        {required ? <span className="text-blue-600"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function Modal({ open, onClose, maxWidth, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth || "max-w-lg"} max-h-[90vh] overflow-hidden rounded-2xl bg-white text-left shadow-2xl`}
      >
        <div className="max-h-[90vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-blue-50 px-6 py-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <button
        onClick={onClose}
        className="rounded-full p-1.5 text-slate-500 hover:bg-white"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function Chip({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
      {icon}
      {children}
    </span>
  );
}

function CardMenu({ onView, onEdit, onDelete }) {
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
}

function RecipeCard({ recipe, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md">
      <div className="relative flex h-24 items-center justify-center rounded-t-xl bg-gradient-to-br from-blue-100 to-blue-200">
        <UtensilsCrossed size={28} className="text-white/90" />

        <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-blue-800 shadow">
          {recipe.category}
        </span>

        <div className="absolute right-2 top-2">
          <CardMenu onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <div className="p-3.5 text-left">
        <h3 className="text-sm font-bold text-slate-900">
          {recipe.title}
        </h3>

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
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-blue-50/60 text-center">
      <ChefHat size={48} className="mb-3 text-blue-600" />
      <p className="text-lg font-bold text-slate-900">No recipes yet</p>
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
}

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
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
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleIngredientChange(index, event) {
    const { name, value } = event.target;
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [name]: value,
    };
    setFormData({ ...formData, ingredients: updatedIngredients });
  }

  function handleAddIngredient() {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ...emptyIngredient }],
    });
  }

  function handleRemoveIngredient(index) {
    if (formData.ingredients.length === 1) return;
    const updatedIngredients = formData.ingredients.filter(
      (item, i) => i !== index
    );
    setFormData({ ...formData, ingredients: updatedIngredients });
  }

  function handleAddOpen() {
    setEditId(null);
    setErrorMessage("");
    setFormData(initialFormData);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditId(null);
    setErrorMessage("");
    setFormData(initialFormData);
  }

  async function handleEditOpen(recipeId) {
    try {
      setActionLoading(true);
      setErrorMessage("");

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
  }

  async function handleView(recipeId) {
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
  }

  async function handleSubmit() {
    try {
      setErrorMessage("");

      if (!formData.title.trim()) {
        setErrorMessage("Recipe title is required");
        return;
      }
      if (!formData.servings) {
        setErrorMessage("Servings is required");
        return;
      }
      if (!formData.category) {
        setErrorMessage("Category is required");
        return;
      }
      if (!formData.preparationTime) {
        setErrorMessage("Preparation time is required");
        return;
      }

      let hasInvalidIngredient = false;
      for (const ingredient of formData.ingredients) {
        if (
          !ingredient.ingredientName.trim() ||
          !ingredient.amount ||
          !ingredient.unit
        ) {
          hasInvalidIngredient = true;
        }
      }
      if (hasInvalidIngredient) {
        setErrorMessage("Please complete all ingredient fields");
        return;
      }

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

      if (error?.errors?.length > 0) {
        setErrorMessage(error.errors.join(", "));
      } else {
        setErrorMessage(message);
      }
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  }

  function handleDeleteOpen(recipe) {
    setSelectedRecipe(recipe);
    setDeleteOpen(true);
  }

  async function handleDelete() {
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
  }

  function getFilteredRecipes() {
    return recipes.filter((recipe) => {
      const title = recipe.title ? recipe.title.toLowerCase() : "";
      const matchesSearch = title.includes(searchTerm.trim().toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || recipe.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="min-h-full bg-white p-4 md:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
            <ChefHat size={22} className="text-blue-600" />
          </div>
          <div className="text-left">
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
      <div className="mb-6 flex flex-nowrap items-center gap-2 sm:gap-3">
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
          className={`${inputClass} w-28 flex-shrink-0 sm:w-44`}
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
          <p className="font-bold text-slate-900">
            No recipes match your search
          </p>
          <p className="mt-1 text-[13.5px] text-slate-500">
            Try a different keyword or category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
        <ModalHeader
          title={editId ? "Edit Recipe" : "Add New Recipe"}
          onClose={handleFormClose}
        />

        <div className="px-6 py-5 text-left">
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            <Field label="Recipe Title" required>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={inputClass}
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
              <Field label="Category" required>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
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

              <Field label="Servings" required>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Preparation Time (min)" required>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>
            </div>

            <hr className="border-slate-100" />

            <div className="text-left">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold text-slate-900">
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
                  <div
                    key={index}
                    className="grid grid-cols-1 items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:grid-cols-[2fr_1fr_1fr_auto]"
                  >
                    <input
                      placeholder="Ingredient Name"
                      name="ingredientName"
                      value={ingredient.ingredientName}
                      onChange={(event) =>
                        handleIngredientChange(index, event)
                      }
                      className={`${inputClass} bg-white`}
                    />

                    <input
                      type="number"
                      placeholder="Amount"
                      name="amount"
                      value={ingredient.amount}
                      onChange={(event) =>
                        handleIngredientChange(index, event)
                      }
                      className={`${inputClass} bg-white`}
                    />

                    <select
                      name="unit"
                      value={ingredient.unit}
                      onChange={(event) =>
                        handleIngredientChange(index, event)
                      }
                      className={`${inputClass} bg-white`}
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

                    <button
                      type="button"
                      disabled={formData.ingredients.length === 1}
                      onClick={() => handleRemoveIngredient(index)}
                      className="justify-self-center rounded-full p-1.5 text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <MinusCircle size={20} />
                    </button>
                  </div>
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
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="max-w-lg">
        {selectedRecipe && (
          <>
            <div className="flex items-start justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-blue-50 px-4 py-4 sm:px-6">
              <div className="min-w-0 text-left">
                <h2 className="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                  {selectedRecipe.title}
                </h2>
                <span className="mt-2 inline-block rounded-full border border-blue-100 bg-white px-2.5 py-1 text-xs font-bold text-blue-800">
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

            <div className="px-4 py-5 text-left sm:px-6">
              <p className="text-sm leading-relaxed text-slate-500">
                {selectedRecipe.description}
              </p>

              <div className="my-5 flex flex-wrap gap-2">
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
                    <p className="mb-2.5 text-[15px] font-bold text-slate-900">
                      Ingredients
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-left"
                        >
                          <p className="truncate text-sm font-bold text-slate-900">
                            {ingredient.ingredientName ||
                              ingredient.name ||
                              `Ingredient ${index + 1}`}
                          </p>
                          <p className="text-[13px] text-slate-500">
                            {ingredient.amount ?? ingredient.quantity}{" "}
                            {getUnitLabel(ingredient.unit)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <hr className="my-5 border-slate-100" />
                  </>
                )}

              <p className="mb-1.5 text-[15px] font-bold text-slate-900">
                Preparation Steps
              </p>
              <p className="whitespace-pre-line pb-2 text-left text-sm leading-loose text-slate-600">
                {selectedRecipe.preparationSteps}
              </p>
            </div>
          </>
        )}
      </Modal>
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="max-w-sm">
        <div className="px-6 py-5 text-left">
          <h2 className="text-lg font-extrabold text-slate-900">
            Delete Recipe?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900">
              {selectedRecipe ? selectedRecipe.title : ""}
            </strong>
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
}

export default Recipes;