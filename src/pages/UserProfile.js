import React, { useEffect, useState } from "react";
import { Edit, X, Mail, User, Save, Loader2 } from "lucide-react";
import { getCurrentUserProfile, updateCurrentUser } from "../services/api";

const ProfileDetail = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#0B5FFF]">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[0.72rem] text-[#7C8AA6]">{label}</p>
      <p className="truncate text-[0.86rem] font-semibold text-[#0B1B3F]">
        {value || "Not available"}
      </p>
    </div>
  </div>
);

const inputClass =
  "w-full rounded-xl border border-[#EEF2FA] bg-white px-3.5 py-2.5 text-sm text-[#0B1B3F] outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/10";

const labelClass = "mb-1 block text-left text-sm font-medium text-[#5B6B8C]";

const ProfileSkeleton = () => (
  <div className="max-w-[760px] overflow-hidden rounded-2xl border border-[#EEF2FA]">
    <div className="flex items-center gap-4 p-6 sm:p-8">
      <div className="h-[76px] w-[76px] animate-pulse rounded-full bg-slate-200" />
      <div className="flex-1">
        <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
    <div className="p-6 sm:p-8">
      {[1, 2, 3].map((n) => (
        <div key={n} className="py-2">
          <div className="h-[54px] animate-pulse rounded-xl bg-slate-200" />
        </div>
      ))}
    </div>
  </div>
);

const Toast = ({ open, message, severity, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const tone = severity === "error" ? "bg-red-600" : "bg-[#0B5FFF]";

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${tone}`}
      >
        {message}
        <button onClick={onClose} className="rounded-full p-0.5 hover:bg-white/20">
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getCurrentUserProfile();
        if (!isMounted) return;
        setProfile(data);
      } catch (error) {
        if (!isMounted) return;
        setSnackbar({
          open: true,
          message: "Profile-a load panna mudiyala. Please try again.",
          severity: "error",
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const email = profile.email || "";

  const initials =
    (firstName.charAt(0) || "").toUpperCase() + (lastName.charAt(0) || "").toUpperCase();

  const handleStartEdit = () => {
    setFormData({ firstName, lastName, email });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleFieldChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateCurrentUser(formData);
      setProfile(updated);
      setIsEditing(false);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.message || "Update panna mudiyala. Please try again.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div>
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="max-w-[760px] overflow-hidden rounded-2xl border border-[#EEF2FA]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEF2FA] bg-[#FBFCFF] p-6 sm:p-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[1.1rem] font-bold text-[#0B5FFF]">
                {initials || "U"}
              </div>

              <div className="min-w-0 text-left">
                <p className="truncate text-[1.05rem] font-bold text-[#0B1B3F] sm:text-[1.15rem]">
                  {fullName}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8E6FF] px-4 py-2 text-sm font-semibold text-[#0B5FFF] transition hover:border-[#0B5FFF] hover:bg-[#EAF2FF]"
              >
                <Edit size={16} /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#7C8AA6] transition hover:bg-slate-50 disabled:opacity-60"
              >
                <X size={16} /> Close
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <p className="mb-1 text-left text-[0.95rem] font-bold text-[#0B1B3F]">
              Profile Details
            </p>

            {!isEditing ? (
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <ProfileDetail icon={<User size={18} />} label="Full Name" value={fullName} />
                <ProfileDetail icon={<Mail size={18} />} label="Email Address" value={email} />
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    value={formData.firstName}
                    onChange={handleFieldChange("firstName")}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    value={formData.lastName}
                    onChange={handleFieldChange("lastName")}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleFieldChange("email")}
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B5FFF] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-[#0B5FFF]/25 transition hover:bg-[#0642C4] disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-xl border border-[#EEF2FA] px-5 py-2 text-sm font-bold text-[#7C8AA6] transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default UserProfile;