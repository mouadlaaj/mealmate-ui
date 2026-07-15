import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Check,
  ChevronDown,
  MoreVertical,
  Pencil,
  Plus,
  ShoppingBasket,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import {
  getShoppingListById,
  getAllShoppingLists,
  deleteShoppingList,
  deleteShoppingListItem,
  toggleShoppingListItem,
  updateShoppingList,
} from "../services/api";

const UNIT_LABELS = {
  GRAM: "g",
  KILOGRAM: "kg",
  MILLILITER: "ml",
  LITER: "L",
  PIECE: "pcs",
  TABLESPOON: "tbsp",
  TEASPOON: "tsp",
  CUP: "cup",
  PINCH: "pinch",
};

const UNIT_OPTIONS = [
  "GRAM",
  "KILOGRAM",
  "MILLILITER",
  "LITER",
  "PIECE",
  "TABLESPOON",
  "TEASPOON",
  "CUP",
  "PINCH",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600";
const labelClass = "mb-1.5 block text-left text-sm font-medium text-slate-700";

const MENU_WIDTH = 176;
const MENU_MARGIN = 12;

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    ""
  );
}

const ModalHeader = ({ title, onClose }) => {
  return (
    <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-blue-50 px-6 py-4">
      <h2 className="text-sm font-normal text-slate-700">{title}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-full p-1 text-slate-500 hover:bg-white"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

const Chip = ({ tone = "blue", children }) => {
  const toneClasses =
    tone === "blue"
      ? "border-blue-100 bg-blue-50 text-blue-700"
      : tone === "muted"
        ? "border-slate-200 bg-slate-50 text-slate-400"
        : "border-emerald-100 bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-normal ${toneClasses}`}
    >
      {children}
    </span>
  );
};

function ShoppingList() {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [shoppingList, setShoppingList] = useState(null);
  const [shoppingItems, setShoppingItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef(null);

  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [deleteListOpen, setDeleteListOpen] = useState(false);


  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [itemUnit, setItemUnit] = useState("GRAM");

  const loadShoppingLists = async () => {
    try {
      setLoading(true);

      const response = await getAllShoppingLists();

      const lists = Array.isArray(response) ? response : response?.content || [];

      setShoppingLists(lists);

      if (lists.length > 0) {
        await loadShoppingListById(lists[0].id);
      } else {
        setShoppingList(null);
        setShoppingItems([]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to load shopping lists");
    } finally {
      setLoading(false);
    }
  };

  const loadShoppingListById = async (id) => {
    try {
      setListLoading(true);

      const data = await getShoppingListById(id);

      setShoppingList(data);
      setShoppingItems(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to load shopping list");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadShoppingLists();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const recalcPosition = () => {
      if (!menuButtonRef.current) return;

      const rect = menuButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      let left = rect.right - MENU_WIDTH;

      left = Math.max(MENU_MARGIN, left);
      left = Math.min(left, viewportWidth - MENU_WIDTH - MENU_MARGIN);

      setMenuPosition({
        top: rect.bottom + 8,
        left,
      });
    };

    recalcPosition();

    window.addEventListener("resize", recalcPosition);
    window.addEventListener("scroll", recalcPosition, true);

    return () => {
      window.removeEventListener("resize", recalcPosition);
      window.removeEventListener("scroll", recalcPosition, true);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleListChange = async (event) => {
    const listId = Number(event.target.value);

    setMenuOpen(false);

    await loadShoppingListById(listId);
  };

  const buildItemsPayload = (itemId, overrides) => {
    return shoppingItems.map((item) => {
      const base = {
        id: item.id,
        ingredientName: item.ingredientName,
        amount: item.amount,
        unit: item.unit,
      };

      if (item.id === itemId) {
        return { ...base, ...overrides };
      }

      return base;
    });
  };


  const handleToggle = async (item) => {
    if (!shoppingList?.id || !item?.id) return;

    try {
      setActionLoading(`toggle-${item.id}`);

      await toggleShoppingListItem(shoppingList.id, item.id);

      await loadShoppingListById(shoppingList.id);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to update shopping item");
    } finally {
      setActionLoading(null);
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName("");
    setItemAmount("");
    setItemUnit("GRAM");
    setItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    setItemName(item.ingredientName);
    setItemAmount(String(item.amount));
    setItemUnit(item.unit);
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(null);
    setItemName("");
    setItemAmount("");
    setItemUnit("GRAM");
  };

  const openDeleteItemModal = (item) => {
    setSelectedItem(item);
    setDeleteItemOpen(true);
  };

  const closeDeleteItemModal = () => {
    setDeleteItemOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = async () => {
    if (!shoppingList?.id || !selectedItem?.id) return;

    try {
      setActionLoading(`delete-${selectedItem.id}`);

      await deleteShoppingListItem(shoppingList.id, selectedItem.id);

      setShoppingItems((currentItems) =>
        currentItems.filter((item) => item.id !== selectedItem.id)
      );

      toast.success("Item deleted successfully");
      closeDeleteItemModal();
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to delete item");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteList = async () => {
    if (!shoppingList?.id) return;

    try {
      setActionLoading("delete-list");

      const deletedListId = shoppingList.id;

      await deleteShoppingList(deletedListId);

      const remainingLists = shoppingLists.filter(
        (list) => list.id !== deletedListId
      );

      setShoppingLists(remainingLists);
      setDeleteListOpen(false);
      setMenuOpen(false);

      toast.success("Shopping list deleted successfully");

      if (remainingLists.length > 0) {
        await loadShoppingListById(remainingLists[0].id);
      } else {
        setShoppingList(null);
        setShoppingItems([]);
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to delete shopping list");
    } finally {
      setActionLoading(null);
    }
  };

  const handleItemModalSubmit = async () => {
    if (editingItem) {

      if (!itemName.trim()) {
        toast.error("Please enter item name");
        return;
      }

      if (!itemAmount || Number(itemAmount) <= 0) {
        toast.error("Please enter valid amount");
        return;
      }

      try {
        setActionLoading(`edit-${editingItem.id}`);

        await updateShoppingList(shoppingList.id, {
          items: buildItemsPayload(editingItem.id, {
            ingredientName: itemName.trim(),
            amount: Number(itemAmount),
            unit: itemUnit,
          }),
        });

        toast.success("Item updated successfully");
        closeItemModal();

        await loadShoppingListById(shoppingList.id);
      } catch (error) {
        toast.error(getErrorMessage(error) || "Failed to update item");
      } finally {
        setActionLoading(null);
      }

      return;
    }

    if (!itemName.trim()) {
      toast.error("Please enter item name");
      return;
    }

    if (!itemAmount || Number(itemAmount) <= 0) {
      toast.error("Please enter valid amount");
      return;
    }

    if (!shoppingList?.id) {
      toast.error("Shopping list is not available");
      return;
    }

    try {
      setActionLoading("add-item");

      const newIngredient = {
        ingredientName: itemName.trim(),
        amount: Number(itemAmount),
        unit: itemUnit,
      };

      const existingItems = shoppingItems.map((item) => ({
        id: item.id,
        ingredientName: item.ingredientName,
        amount: item.amount,
        unit: item.unit,
      }));

      const data = {
        items: [...existingItems, newIngredient],
      };

      await updateShoppingList(shoppingList.id, data);

      toast.success("Item added successfully");

      closeItemModal();

      await loadShoppingListById(shoppingList.id);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to add item");
    } finally {
      setActionLoading(null);
    }
  };

  const toBuyItems = shoppingItems.filter((item) => !item.completed);
  const boughtItems = shoppingItems.filter((item) => item.completed);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    const value = Number(amount);

    if (Number.isNaN(value)) return amount;

    return Number.isInteger(value) ? value : parseFloat(value.toFixed(2));
  };

  const getUnitLabel = (unit) => {
    return UNIT_LABELS[unit] || unit || "";
  };

  const renderItem = (item) => {
    const isUpdating = actionLoading === `toggle-${item.id}`;
    const isEditing = actionLoading === `edit-${item.id}`;

    const purchased = Number(item.purchasedAmount) || 0;
    const needed = Number(item.amount) || 0;
    const remaining = Math.max(needed - purchased, 0);

    return (
      <div
        key={item.id}
        className={`group flex items-center gap-2.5 border-b border-slate-100 px-3 py-3 transition last:border-b-0 sm:px-4 ${
          item.completed ? "bg-slate-50/60" : "bg-white hover:bg-slate-50/60"
        }`}
      >
        <button
          onClick={() => handleToggle(item)}
          disabled={isUpdating}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
            item.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 bg-white hover:border-blue-500"
          }`}
        >
          {isUpdating ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : item.completed ? (
            <Check size={14} strokeWidth={3} />
          ) : null}
        </button>

        <div className="min-w-0 flex-1 text-left">
          <p
            className={`text-left break-words text-sm font-normal ${
              item.completed ? "text-slate-400 line-through" : "text-slate-700"
            }`}
          >
            {item.ingredientName || "Unknown Item"}
          </p>

          {!item.completed && purchased > 0 && (
            <p className="mt-0.5 text-xs text-slate-500">
              Purchased {formatAmount(purchased)} / {formatAmount(needed)}{" "}
              {getUnitLabel(item.unit)} &middot; {formatAmount(remaining)}{" "}
              {getUnitLabel(item.unit)} left
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Chip tone={item.completed ? "muted" : "blue"}>
            {item.completed
              ? `${formatAmount(needed)} ${getUnitLabel(item.unit)}`
              : `${formatAmount(remaining)} ${getUnitLabel(item.unit)} left`}
          </Chip>

          <button
            onClick={() => openEditItemModal(item)}
            disabled={isEditing}
            title="Edit item"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
          >
            {isEditing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Pencil size={15} />
            )}
          </button>

          <button
            onClick={() => openDeleteItemModal(item)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="Delete item"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-full bg-white p-3 md:p-4">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Loading your shopping list...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="min-h-full bg-white p-3 md:p-4">
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-blue-50/40 p-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <ShoppingBasket size={30} className="text-blue-600" />
          </div>

          <h2 className="mt-4 text-sm font-normal text-slate-700">
            Your shopping list is empty
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create a meal plan to generate your shopping list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white p-4 pt-16 sm:pt-4 md:p-6">
      <div className="mx-auto w-full">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <ShoppingBasket size={22} />
            </div>

            <div className="min-w-0 text-left">
              <h1 className="text-2xl font-extrabold text-slate-900">
                My Shopping List
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Track and manage your grocery items
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-start">
            {shoppingLists.length > 1 && (
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <select
                  value={shoppingList.id}
                  onChange={handleListChange}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-48"
                >
                  {shoppingLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.mealPlanName || list.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            )}

            <div className="relative shrink-0">
              <button
                ref={menuButtonRef}
                onClick={toggleMenu}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />

                  <div
                    className="fixed z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteListOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete List
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <Utensils size={15} className="text-blue-600" />

            <div>
              <p className="text-xs text-slate-500">Meal Plan</p>
              <p className="text-sm font-normal text-slate-700">
                {shoppingList.mealPlanName || "Not available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-slate-500" />

            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm font-normal text-slate-700">
                {formatDate(shoppingList.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {listLoading ? (
          <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        ) : shoppingItems.length === 0 ? (
          <div className="mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-blue-50/40 p-6 text-center">
            <ShoppingBasket size={24} className="mx-auto text-slate-300" />

            <h2 className="mt-2 text-sm font-normal text-slate-700">
              No items available
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add an item to your shopping list.
            </p>

            <button
              onClick={openAddItemModal}
              className="mx-auto mt-3 flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <section>
              <div className="mb-2 flex items-center gap-2 px-1">
                <h2 className="text-sm font-normal text-slate-700">To Buy</h2>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-bold text-blue-700">
                  {toBuyItems.length}
                </span>

                <button
                  onClick={openAddItemModal}
                  className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {toBuyItems.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                  {toBuyItems.map(renderItem)}
                </div>
              ) : (
                <p className="px-1 text-sm text-slate-500">
                  Nothing left to buy on this list.
                </p>
              )}
            </section>

            {boughtItems.length > 0 && (
              <section>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <h2 className="text-sm font-normal text-slate-700">Bought</h2>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-xs font-bold text-emerald-700">
                    {boughtItems.length}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                  {boughtItems.map(renderItem)}
                </div>
              </section>
            )}

            {toBuyItems.length === 0 && boughtItems.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={18} strokeWidth={3} />
                </div>

                <h3 className="mt-2 text-sm font-normal text-slate-700">
                  Shopping complete!
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  You bought everything on your list.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Item / Add Purchase modal (shared) */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={closeItemModal}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white text-left shadow-lg">
            <ModalHeader
              title={editingItem ? `Update ${editingItem.ingredientName}` : "Add New Item"}
              onClose={closeItemModal}
            />

            <div className="px-6 py-6">
              {editingItem ? (
                <div className="space-y-2 text-left">
                  <p className="text-sm text-slate-500">
                    Already purchased {formatAmount(editingItem.purchasedAmount || 0)} /{" "}
                    {formatAmount(editingItem.amount)} {getUnitLabel(editingItem.unit)}.
                    Enter how much more you bought — it will be added to the total.
                  </p>

                  <label className={labelClass}>
                    Quantity bought now ({getUnitLabel(editingItem.unit)})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    autoFocus
                    value={itemAmount}
                    onChange={(event) => setItemAmount(event.target.value)}
                    placeholder="e.g. 2"
                    className={inputClass}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-left">
                    <label className={labelClass}>Item Name</label>

                    <input
                      type="text"
                      value={itemName}
                      onChange={(event) => setItemName(event.target.value)}
                      placeholder="Enter item name"
                      autoFocus
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="text-left">
                      <label className={labelClass}>Amount</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemAmount}
                        onChange={(event) => setItemAmount(event.target.value)}
                        placeholder="Enter amount"
                        className={inputClass}
                      />
                    </div>

                    <div className="text-left">
                      <label className={labelClass}>Unit</label>

                      <div className="relative">
                        <select
                          value={itemUnit}
                          onChange={(event) => setItemUnit(event.target.value)}
                          className={`${inputClass} appearance-none pr-10`}
                        >
                          {UNIT_OPTIONS.map((unit) => (
                            <option key={unit} value={unit}>
                              {UNIT_LABELS[unit]}
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={closeItemModal}
                disabled={actionLoading === "add-item" || actionLoading === `purchase-${editingItem?.id}`}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleItemModalSubmit}
                disabled={actionLoading === "add-item" || actionLoading === `purchase-${editingItem?.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading === "add-item" || actionLoading === `purchase-${editingItem?.id}` ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : editingItem ? (
                  "Add"
                ) : (
                  <>
                    <Plus size={17} strokeWidth={2.5} />
                    Add Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={closeDeleteItemModal}
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-left shadow-lg">
            <h2 className="mt-5 text-sm font-normal text-slate-700">
              Delete this item?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove{" "}
              <span className="font-medium text-slate-700">
                {selectedItem?.ingredientName}
              </span>{" "}
              from your shopping list?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeDeleteItemModal}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteItem}
                disabled={actionLoading === `delete-${selectedItem?.id}`}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === `delete-${selectedItem?.id}` ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setDeleteListOpen(false)}
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-left shadow-lg">

            <h2 className="mt-5 text-sm font-normal text-slate-700">
              Delete shopping list?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently delete this shopping list and all its items.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteListOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteList}
                disabled={actionLoading === "delete-list"}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === "delete-list" ? "Deleting..." : "Delete List"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingList;