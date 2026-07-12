import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Heart,
  LayoutGrid,
  List as ListIcon,
  ClipboardList,
  Timer,
  Leaf,
  ChefHat,
} from "lucide-react";

import {
  createRecipe,
  getRecipeById,
  getAllRecipes,
  updateRecipe,
  deleteRecipe,
} from "../services/api";

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

const unitLabel = (value) =>
  UNIT_OPTIONS.find((option) => option.value === value)?.label || value;

const initialFormData = {
  title: "",
  description: "",
  servings: "",
  category: "",
  preparationTime: "",
  preparationSteps: "",
  ingredients: [
    {
      ingredientName: "",
      amount: "",
      unit: "",
    },
  ],
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-left text-sm font-medium text-slate-700";

const Field = ({ label, required, children }) => (
  <div className="text-left">
    <label className={labelClass}>
      {label}
      {required && <span className="text-blue-600"> *</span>}
    </label>
    {children}
  </div>
);

const Modal = ({ open, onClose, maxWidth = "max-w-lg", children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-left shadow-2xl ring-1 ring-slate-200`}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ title, subtitle, onClose }) => (
  <div className="flex items-start justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-blue-50/70 px-6 py-4">
    <div className="text-left">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle}
    </div>
    <button
      onClick={onClose}
      className="rounded-full p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-700"
    >
      <X size={18} />
    </button>
  </div>
);

const Chip = ({ icon, children, tone = "soft" }) => {
  const tones = {
    soft: "bg-blue-50 text-blue-800 border border-blue-100",
    solid: "bg-blue-600 text-white",
    outline: "bg-white text-blue-700 border border-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
};

const CardMenu = ({ onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-white p-1.5 text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-blue-50"
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

const CardThumb = ({ category, onView, onEdit, onDelete }) => (
  <div className="relative flex h-36 items-center justify-center rounded-t-2xl bg-gradient-to-br from-blue-100 to-blue-200">
    <UtensilsCrossed size={40} className="text-white/90" />

    <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-blue-800 shadow">
      {category}
    </span>

    <div className="absolute right-3 top-3">
      <CardMenu onView={onView} onEdit={onEdit} onDelete={onDelete} />
    </div>
  </div>
);

const RecipeCard = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
    <CardThumb
      category={recipe.category}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />

    <div className="p-5 text-left">
      <h3 className="text-[17px] font-bold text-slate-900">{recipe.title}</h3>

      <p className="mt-1.5 line-clamp-2 min-h-[40px] text-sm text-slate-500">
        {recipe.description || "No description available"}
      </p>

      <hr className="my-4 border-slate-100" />

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Chip icon={<Clock size={13} />}>{recipe.preparationTime} min</Chip>
          <Chip icon={<Users size={13} />}>{recipe.servings} servings</Chip>
        </div>

        <button
          onClick={onToggleFavorite}
          className="rounded-full p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Heart
            size={18}
            fill={isFavorite ? "currentColor" : "none"}
            className={isFavorite ? "text-blue-600" : ""}
          />
        </button>
      </div>
    </div>
  </div>
);

const RecipeListRow = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-200 hover:shadow-md">
    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
      <UtensilsCrossed size={24} className="text-white" />
    </div>

    <div className="min-w-0 flex-1 text-left">
      <div className="flex items-center gap-2">
        <h3 className="truncate text-[15px] font-bold text-slate-900">
          {recipe.title}
        </h3>
        <span className="flex-shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
          {recipe.category}
        </span>
      </div>
      <p className="truncate text-[13px] text-slate-500">
        {recipe.description || "No description available"}
      </p>
    </div>

    <div className="hidden flex-shrink-0 gap-1.5 sm:flex">
      <Chip icon={<Clock size={13} />}>{recipe.preparationTime} min</Chip>
      <Chip icon={<Users size={13} />}>{recipe.servings}</Chip>
    </div>

    <button
      onClick={onToggleFavorite}
      className="flex-shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
    >
      <Heart
        size={17}
        fill={isFavorite ? "currentColor" : "none"}
        className={isFavorite ? "text-blue-600" : ""}
      />
    </button>

    <CardMenu onView={onView} onEdit={onEdit} onDelete={onDelete} />
  </div>
);

const EmptyState = ({ onAdd }) => (
  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-blue-50/60 text-center">
    <ChefHat size={48} className="mb-3 text-blue-600" />
    <p className="text-lg font-bold text-slate-900">No recipes yet</p>
    <p className="mt-1 text-sm text-slate-500">
      Add your first healthy recipe to get started
    </p>
    <button
      onClick={onAdd}
      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-white"
    >
      <Plus size={16} /> Add Recipe
    </button>
  </div>
);

const Recipes = () => {
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
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState(new Set());

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
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;

    const updatedIngredients = [...formData.ingredients];

    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [name]: value,
    };

    setFormData((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }));
  };

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ingredientName: "",
          amount: "",
          unit: "",
        },
      ],
    }));
  };

  const handleRemoveIngredient = (index) => {
    if (formData.ingredients.length === 1) {
      return;
    }

    const updatedIngredients = formData.ingredients.filter(
      (_, ingredientIndex) => ingredientIndex !== index,
    );

    setFormData((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }));
  };

  const handleAddOpen = () => {
    setEditId(null);
    setErrorMessage("");
    setFormData(initialFormData);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditId(null);
    setErrorMessage("");
    setFormData(initialFormData);
  };

  const handleEditOpen = async (recipeId) => {
    try {
      setActionLoading(true);
      setErrorMessage("");

      const response = await getRecipeById(recipeId);

      setEditId(recipeId);

      setFormData({
        title: response.title || "",
        description: response.description || "",
        servings: response.servings || "",
        category: response.category || "",
        preparationTime: response.preparationTime || "",
        preparationSteps: response.preparationSteps || "",
        ingredients:
          response.ingredients?.length > 0
            ? response.ingredients.map((ingredient) => ({
                ingredientName:
                  ingredient.ingredientName || ingredient.name || "",
                amount: ingredient.amount ?? ingredient.quantity ?? "",
                unit: ingredient.unit || "",
              }))
            : [
                {
                  ingredientName: "",
                  amount: "",
                  unit: "",
                },
              ],
      });

      setFormOpen(true);
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
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

      const hasInvalidIngredient = formData.ingredients.some(
        (ingredient) =>
          !ingredient.ingredientName.trim() ||
          !ingredient.amount ||
          !ingredient.unit,
      );

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
      } else {
        await createRecipe(data);
      }

      handleFormClose();
      await fetchRecipes();
    } catch (error) {
      console.error("Failed to save recipe:", error);

      if (error?.errors?.length > 0) {
        setErrorMessage(error.errors.join(", "));
      } else {
        setErrorMessage(error?.message || "Failed to save recipe");
      }
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

      setDeleteOpen(false);
      setSelectedRecipe(null);

      await fetchRecipes();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFavorite = (recipeId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title
        ?.toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || recipe.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, categoryFilter]);

  return (
    <div className="min-h-full bg-white p-4 md:p-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
            <ChefHat size={22} className="text-blue-600" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              My Recipes
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Create and manage your healthy meal recipes
            </p>
          </div>
        </div>

        <button
          onClick={handleAddOpen}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-blue-700/30"
        >
          <Plus size={18} /> Add Recipe
        </button>
      </div>

      {/* Search and filter row - always stays in one row */}
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

        <div className="flex flex-shrink-0 gap-1 rounded-xl bg-blue-50 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2 transition ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            <LayoutGrid size={17} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-2 transition ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            <ListIcon size={17} />
          </button>
        </div>
      </div>

      {/* Recipe list */}
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
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.has(recipe.id)}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              onView={() => handleView(recipe.id)}
              onEdit={() => handleEditOpen(recipe.id)}
              onDelete={() => handleDeleteOpen(recipe)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRecipes.map((recipe) => (
            <RecipeListRow
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.has(recipe.id)}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              onView={() => handleView(recipe.id)}
              onEdit={() => handleEditOpen(recipe.id)}
              onDelete={() => handleDeleteOpen(recipe)}
            />
          ))}
        </div>
      )}

      {/* footer tagline */}
      <div className="mt-8 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-800">
          <Leaf size={15} /> Eat healthy, live healthy!
        </span>
      </div>

      {/* Add / Edit Modal */}
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
                <div className="text-left">
                  <p className="text-[15px] font-bold text-slate-900">
                    Ingredients
                  </p>
                  <p className="text-xs text-slate-500">
                    At least one ingredient is required
                  </p>
                </div>

                <button
                  onClick={handleAddIngredient}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
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
                      onChange={(event) => handleIngredientChange(index, event)}
                      className={`${inputClass} bg-white`}
                    />

                    <input
                      type="number"
                      placeholder="Amount"
                      name="amount"
                      value={ingredient.amount}
                      onChange={(event) => handleIngredientChange(index, event)}
                      className={`${inputClass} bg-white`}
                    />

                    <select
                      name="unit"
                      value={ingredient.unit}
                      onChange={(event) => handleIngredientChange(index, event)}
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
                      className="justify-self-center rounded-full p-1.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
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
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={actionLoading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {actionLoading
              ? "Saving..."
              : editId
                ? "Update Recipe"
                : "Create Recipe"}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="max-w-lg"
      >
        {selectedRecipe && (
          <>
            <div className="flex items-start justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-blue-50/70 px-6 py-4">
              <div className="text-left">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {selectedRecipe.title}
                </h2>
                <span className="mt-2 inline-block rounded-full border border-blue-100 bg-white px-2.5 py-1 text-xs font-bold text-blue-800">
                  {selectedRecipe.category}
                </span>
              </div>
              <button
                onClick={() => setViewOpen(false)}
                className="rounded-full p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 text-left">
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

              {selectedRecipe.ingredients?.length > 0 && (
                <>
                  <p className="mb-2.5 text-[15px] font-bold text-slate-900">
                    Ingredients
                  </p>

                  <div className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-left"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          {ingredient.ingredientName ||
                            ingredient.name ||
                            `Ingredient ${index + 1}`}
                        </p>
                        <p className="text-[13px] text-slate-500">
                          {ingredient.amount ?? ingredient.quantity}{" "}
                          {unitLabel(ingredient.unit)}
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

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="max-w-sm"
      >
        <div className="px-6 py-5 text-left">
          <h2 className="text-lg font-extrabold text-slate-900">
            Delete Recipe?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900">{selectedRecipe?.title}</strong>?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-5">
          <button
            onClick={() => setDeleteOpen(false)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};


export default Recipes;
