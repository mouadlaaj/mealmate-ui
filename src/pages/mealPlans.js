import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Loader2,
  ClipboardList,
  MoreVertical,
  Apple,
  CalendarDays,
  Users,
} from "lucide-react";

import {
  createMealPlan,
  getMealPlanById,
  getAllMealPlans,
  updateMealPlan,
  deleteMealPlan,
  getAllRecipes,
} from "../services/api";

const emptyMeal = {
  recipeId: "",
  plannedDate: "",
  mealType: "",
  servings: 1,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600";

const errorInputClass =
  "w-full rounded-xl border border-red-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-500";

const labelClass = "mb-1.5 block text-left text-sm font-medium text-slate-700";

const MealPlans = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [entries, setEntries] = useState([{ ...emptyMeal }]);

  const [editId, setEditId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [deletePlan, setDeletePlan] = useState(null);

  const [errors, setErrors] = useState({});
  const [entryErrors, setEntryErrors] = useState([]);

  const menuRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchMealPlans();
    fetchRecipes();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const getErrorMessage = (error) => {
    if (Array.isArray(error?.errors)) {
      return error.errors.join(", ");
    }

    if (error?.message) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Something went wrong";
  };

  const fetchMealPlans = async () => {
    try {
      setLoading(true);

      const data = await getAllMealPlans();

      setMealPlans(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to load meal plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const data = await getAllRecipes();

      setRecipes(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to load recipes");
    }
  };

  const clearForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");

    setEntries([{ ...emptyMeal }]);

    setErrors({});
    setEntryErrors([]);

    setEditId(null);
  };

  const openCreateForm = () => {
    clearForm();

    setSelectedPlan(null);
    setShowForm(true);
  };

  const closeForm = () => {
    clearForm();

    setShowForm(false);
  };

  const clearError = (fieldName) => {
    setErrors((previousErrors) => ({
      ...previousErrors,
      [fieldName]: "",
    }));
  };

  const addMealEntry = () => {
    setEntries((previousEntries) => [...previousEntries, { ...emptyMeal }]);

    setEntryErrors((previousErrors) => [...previousErrors, {}]);
  };

  const updateMealEntry = (index, fieldName, value) => {
    const updatedEntries = [...entries];

    updatedEntries[index] = {
      ...updatedEntries[index],
      [fieldName]: value,
    };

    setEntries(updatedEntries);

    const updatedErrors = [...entryErrors];

    if (!updatedErrors[index]) {
      updatedErrors[index] = {};
    }

    updatedErrors[index] = {
      ...updatedErrors[index],
      [fieldName]: "",
    };

    setEntryErrors(updatedErrors);
  };

  const removeMealEntry = (index) => {
    if (entries.length === 1) {
      setEntries([{ ...emptyMeal }]);
      setEntryErrors([]);
      return;
    }

    const updatedEntries = entries.filter(
      (_, entryIndex) => entryIndex !== index,
    );
    const updatedErrors = entryErrors.filter(
      (_, errorIndex) => errorIndex !== index,
    );

    setEntries(updatedEntries);
    setEntryErrors(updatedErrors);
  };

  const validatePlanFields = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateMealEntries = () => {
    const newEntryErrors = entries.map((entry) => {
      const mealErrors = {};

      if (!entry.recipeId) {
        mealErrors.recipeId = "Recipe is required";
      }

      if (!entry.plannedDate) {
        mealErrors.plannedDate = "Planned date is required";
      }

      if (!entry.mealType) {
        mealErrors.mealType = "Meal type is required";
      }

      if (!entry.servings || Number(entry.servings) <= 0) {
        mealErrors.servings = "Servings must be greater than 0";
      }

      if (entry.plannedDate && startDate && entry.plannedDate < startDate) {
        mealErrors.plannedDate = "Date cannot be before start date";
      }

      if (entry.plannedDate && endDate && entry.plannedDate > endDate) {
        mealErrors.plannedDate = "Date cannot be after end date";
      }

      return mealErrors;
    });

    setEntryErrors(newEntryErrors);

    const hasErrors = newEntryErrors.some(
      (mealError) => Object.keys(mealError).length > 0,
    );

    return !hasErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isPlanValid = validatePlanFields();
    const areMealsValid = validateMealEntries();

    if (!isPlanValid || !areMealsValid) {
      return;
    }

    const data = {
      name: name.trim(),
      startDate: startDate,
      endDate: endDate,

      entries: entries.map((entry) => ({
        recipeId: Number(entry.recipeId),
        plannedDate: entry.plannedDate,
        mealType: entry.mealType,
        servings: Number(entry.servings),
      })),
    };

    try {
      setLoading(true);

      if (editId) {
        await updateMealPlan(editId, data);
        toast.success("Meal plan updated successfully");
      } else {
        await createMealPlan(data);
        toast.success("Meal plan created successfully");
      }

      closeForm();

      await fetchMealPlans();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      setLoading(true);
      setOpenMenuId(null);

      const data = await getMealPlanById(id);

      setSelectedPlan(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setOpenMenuId(null);

    setEditId(plan.id);
    setName(plan.name || "");
    setStartDate(plan.startDate || "");
    setEndDate(plan.endDate || "");

    const existingEntries = (plan.entries || []).map((entry) => ({
      recipeId: entry.recipeId || entry.recipe?.id || "",
      plannedDate: entry.plannedDate || "",
      mealType: entry.mealType || "",
      servings: entry.servings || 1,
    }));

    if (existingEntries.length > 0) {
      setEntries(existingEntries);
    } else {
      setEntries([{ ...emptyMeal }]);
    }

    setErrors({});
    setEntryErrors([]);

    setSelectedPlan(null);
    setShowForm(true);
  };

  const openDeletePopup = (plan) => {
    setOpenMenuId(null);
    setDeletePlan(plan);
  };

  const closeDeletePopup = () => {
    if (loading) return;

    setDeletePlan(null);
  };

  const handleDelete = async () => {
    if (!deletePlan) return;

    try {
      setLoading(true);

      await deleteMealPlan(deletePlan.id);

      setDeletePlan(null);
      setSelectedPlan(null);

      toast.success("Meal plan deleted successfully");

      await fetchMealPlans();
    } catch (error) {
      setDeletePlan(null);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-white p-4 md:p-6">
      <div className="w-full">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
              <ClipboardList size={22} className="text-blue-600" />
            </div>
            <div className="min-w-0 text-left">
              <h1 className="text-2xl font-extrabold text-slate-900">
                Meal Plans
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Create and manage your healthy meal plans
              </p>
            </div>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Meal Plan
          </button>
        </div>

        {selectedPlan && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-400/20 p-3 sm:p-4">
            <div className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50 px-5 py-4">
                <h2 className="text-sm font-normal text-slate-700">
                  Meal Plan
                </h2>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 text-left">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="col-span-2 min-w-0 text-left sm:col-span-1">
                    <p className="text-xs text-slate-500">Plan Name</p>
                    <p className="mt-1 truncate text-sm font-normal text-slate-700">
                      {selectedPlan.name}
                    </p>
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="text-xs text-slate-500">Start Date</p>
                    <p className="mt-1 truncate text-sm font-normal text-slate-700">
                      {selectedPlan.startDate}
                    </p>
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="text-xs text-slate-500">End Date</p>
                    <p className="mt-1 truncate text-sm font-normal text-slate-700">
                      {selectedPlan.endDate}
                    </p>
                  </div>
                </div>

                <hr className="my-4 border-slate-100" />

                <div>
                  <div className="mb-3 text-left">
                    <p className="text-sm font-normal text-slate-700">Meals</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedPlan.entries?.length || 0} meals added to this
                      plan
                    </p>
                  </div>

                  {!selectedPlan.entries ||
                  selectedPlan.entries.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-blue-50/40 px-4 py-8 text-center">
                      <ClipboardList
                        size={32}
                        className="mx-auto text-blue-600"
                      />

                      <p className="mt-3 text-sm font-normal text-slate-700">
                        No meals added
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        This meal plan does not have any meals yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPlan.entries.map((entry, index) => (
                        <div
                          key={entry.id || index}
                          className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 text-left">
                              <p className="truncate text-sm font-normal text-slate-700">
                                {entry.recipeTitle ||
                                  entry.recipeName ||
                                  entry.recipe?.name ||
                                  entry.recipe?.title ||
                                  "Recipe"}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-sm font-normal text-slate-700">
                                  {entry.mealType
                                    ? entry.mealType
                                        .toLowerCase()
                                        .replace(/\b\w/g, (letter) =>
                                          letter.toUpperCase(),
                                        )
                                    : "Meal"}
                                </span>

                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                  <CalendarDays size={14} />
                                  {entry.plannedDate}
                                </span>

                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                  <Users size={14} />
                                  {entry.servings} servings
                                </span>
                              </div>
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                              <Apple size={19} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          {loading && mealPlans.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            </div>
          ) : mealPlans.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-blue-50/40 text-center">
              <ClipboardList size={42} className="mb-3 text-blue-600" />
              <p className="text-sm font-normal text-slate-700">
                No meal plans yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Create your first meal plan to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md"
                >
                  <div className="relative flex h-24 items-center justify-center rounded-t-xl bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="relative text-white/90">
                      <ClipboardList size={31} />
                      <Apple
                        size={19}
                        className="absolute -bottom-1.5 -right-3"
                      />
                    </div>

                    <div
                      ref={openMenuId === plan.id ? menuRef : null}
                      className="absolute right-2 top-2"
                    >
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === plan.id ? null : plan.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md hover:bg-blue-50"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === plan.id && (
                        <div className="absolute right-0 top-10 z-50 w-[158px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            onClick={() => handleView(plan.id)}
                            className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            onClick={() => handleEdit(plan)}
                            className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          <button
                            onClick={() => openDeletePopup(plan)}
                            className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 text-left">
                    <h3 className="truncate text-sm font-normal text-slate-700">
                      {plan.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {plan.startDate} - {plan.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-400/20 p-2 sm:p-4">
          <div className="flex max-h-[94vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="flex shrink-0 items-start justify-between rounded-t-2xl border-b border-slate-100 bg-blue-50 px-5 py-4">
              <div className="text-left">
                <h2 className="text-sm font-normal text-slate-700">
                  {editId ? "Edit Meal Plan" : "Create Meal Plan"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add your plan details and meals
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto px-5 py-5 text-left">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <label className={labelClass}>Plan Name *</label>

                    <input
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        clearError("name");
                      }}
                      placeholder="Weekly Healthy Plan"
                      maxLength={100}
                      className={errors.name ? errorInputClass : inputClass}
                    />

                    {errors.name && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>Start Date *</label>

                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(event) => {
                        setStartDate(event.target.value);
                        clearError("startDate");
                      }}
                      className={
                        errors.startDate ? errorInputClass : inputClass
                      }
                    />

                    {errors.startDate && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>End Date *</label>

                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(event) => {
                        setEndDate(event.target.value);
                        clearError("endDate");
                      }}
                      className={errors.endDate ? errorInputClass : inputClass}
                    />

                    {errors.endDate && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                <hr className="my-5 border-slate-100" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-normal text-slate-700">Meals</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Add at least one meal to your plan
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addMealEntry}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-blue-600"
                  >
                    <Plus size={18} />
                    Add Meal
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {entries.map((entry, index) => {
                    const mealError = entryErrors[index] || {};

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
                          <div className="flex w-full items-start gap-2 sm:min-w-[180px] sm:flex-1">
                            <div className="min-w-0 flex-1">
                              <select
                                value={entry.recipeId}
                                onChange={(event) =>
                                  updateMealEntry(
                                    index,
                                    "recipeId",
                                    event.target.value,
                                  )
                                }
                                className={
                                  mealError.recipeId
                                    ? errorInputClass
                                    : inputClass
                                }
                              >
                                <option value="">Select Recipe</option>

                                {recipes.map((recipe) => (
                                  <option key={recipe.id} value={recipe.id}>
                                    {recipe.name || recipe.title}
                                  </option>
                                ))}
                              </select>

                              {mealError.recipeId && (
                                <p className="mt-1 text-xs font-medium text-red-600">
                                  {mealError.recipeId}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeMealEntry(index)}
                              title="Remove meal"
                              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 sm:hidden"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="w-full sm:min-w-[150px] sm:flex-1">
                            <input
                              type="date"
                              value={entry.plannedDate}
                              min={startDate}
                              max={endDate}
                              onChange={(event) =>
                                updateMealEntry(
                                  index,
                                  "plannedDate",
                                  event.target.value,
                                )
                              }
                              className={
                                mealError.plannedDate
                                  ? errorInputClass
                                  : inputClass
                              }
                            />

                            {mealError.plannedDate && (
                              <p className="mt-1 text-xs font-medium text-red-600">
                                {mealError.plannedDate}
                              </p>
                            )}
                          </div>

                          <div className="w-full sm:min-w-[140px] sm:flex-1">
                            <select
                              value={entry.mealType}
                              onChange={(event) =>
                                updateMealEntry(
                                  index,
                                  "mealType",
                                  event.target.value,
                                )
                              }
                              className={
                                mealError.mealType
                                  ? errorInputClass
                                  : inputClass
                              }
                            >
                              <option value="">Meal Type</option>
                              <option value="BREAKFAST">Breakfast</option>
                              <option value="LUNCH">Lunch</option>
                              <option value="DINNER">Dinner</option>
                              <option value="SNACK">Snack</option>
                            </select>

                            {mealError.mealType && (
                              <p className="mt-1 text-xs font-medium text-red-600">
                                {mealError.mealType}
                              </p>
                            )}
                          </div>

                          <div className="w-full sm:w-[100px]">
                            <input
                              type="number"
                              min="1"
                              value={entry.servings}
                              onChange={(event) =>
                                updateMealEntry(
                                  index,
                                  "servings",
                                  event.target.value,
                                )
                              }
                              placeholder="Servings"
                              className={
                                mealError.servings
                                  ? errorInputClass
                                  : inputClass
                              }
                            />

                            {mealError.servings && (
                              <p className="mt-1 text-xs font-medium text-red-600">
                                {mealError.servings}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeMealEntry(index)}
                            title="Remove meal"
                            className="hidden h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 sm:flex"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={loading}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {editId ? "Update Meal Plan" : "Create Meal Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletePlan && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-400/20 p-3">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-5 text-left shadow-lg">
            <h3 className="text-sm font-normal text-slate-700">
              Delete meal plan
            </h3>

            <p className="mt-2 text-sm font-normal text-slate-700">
              This will permanently delete "{deletePlan.name}". This action
              cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeletePopup}
                disabled={loading}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlans;