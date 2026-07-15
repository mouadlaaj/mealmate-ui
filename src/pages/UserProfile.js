import React, { useEffect, useState } from "react";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getCurrentUserProfile, updateCurrentUser } from "../services/api";

const UserProfile = () => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      setLoading(true);

      const data = await getCurrentUserProfile();

      setUser({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
      });
    } catch (error) {
      toast.error("User profile load panna mudiyala");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser({
      ...user,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrors({});

      const updatedUser = await updateCurrentUser(user);

      setUser({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        setErrors(validationErrors);
      } else {
        toast.error("Profile update panna mudiyala");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    getCurrentUser();
  };

  if (loading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center">
        <Loader2 className="animate-spin text-[#0B5FFF]" size={30} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[760px]">
      <div className="rounded-2xl border border-[#EEF2FA] bg-white p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0B1B3F]">
              User Profile
            </h2>

            <p className="mt-1 text-sm text-[#7C8AA6]">
              Manage your personal information
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl border border-[#D8E6FF] px-4 py-2.5 text-sm font-semibold text-[#0B5FFF] hover:bg-[#EAF2FF]"
            >
              <Edit size={16} />
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#5B6B8C]">
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              value={user.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                errors.firstName
                  ? "border-red-500"
                  : "border-[#EEF2FA] focus:border-[#0B5FFF]"
              } disabled:bg-[#F8FAFD]`}
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5B6B8C]">
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              value={user.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                errors.lastName
                  ? "border-red-500"
                  : "border-[#EEF2FA] focus:border-[#0B5FFF]"
              } disabled:bg-[#F8FAFD]`}
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#0B5FFF] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-[#EEF2FA] px-5 py-2.5 text-sm font-semibold text-[#7C8AA6]"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;