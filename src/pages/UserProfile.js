import React, { useEffect, useState } from "react";
import { Edit, X, Mail, User, Save, Loader2 } from "lucide-react";
import { getCurrentUserProfile, updateCurrentUser } from "../services/api";

const UserProfile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const data = await getCurrentUserProfile();
      setProfile(data);
    } catch (error) {
      setMessage("Profile load panna mudiyala");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setEmail(profile.email || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    const data = {
      firstName: firstName,
      lastName: lastName,
      email: email,
    };

    try {
      setSaving(true);

      const updatedProfile = await updateCurrentUser(data);

      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setIsError(false);
    } catch (error) {
      setMessage(error?.message || "Profile update panna mudiyala");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User";

  const initials =
    (profile.firstName?.charAt(0) || "").toUpperCase() +
    (profile.lastName?.charAt(0) || "").toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-[250px] w-full max-w-[760px] items-center justify-center rounded-2xl border border-[#EEF2FA] bg-white">
        <Loader2 className="animate-spin text-[#0B5FFF]" size={30} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[760px] text-left">
      {message && (
        <div
          className={`mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm text-white ${
            isError ? "bg-red-500" : "bg-[#0B5FFF]"
          }`}
        >
          <span>{message}</span>

          <button onClick={() => setMessage("")} className="flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#EEF2FA] bg-white">
        <div className="flex flex-col items-start gap-5 border-b border-[#EEF2FA] bg-[#FBFCFF] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex w-full min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-lg font-bold text-[#0B5FFF] sm:h-[58px] sm:w-[58px]">
              {initials || "U"}
            </div>

            <div className="min-w-0 text-left">
              <h2 className="truncate text-lg font-bold text-[#0B1B3F]">
                {fullName}
              </h2>

              <p className="mt-0.5 text-sm text-[#7C8AA6]">Personal Profile</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#D8E6FF] px-4 py-2.5 text-sm font-semibold text-[#0B5FFF] transition hover:bg-[#EAF2FF] sm:w-auto"
            >
              <Edit size={16} className="shrink-0" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#7C8AA6] transition hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
            >
              <X size={16} />
              Close
            </button>
          )}
        </div>

        <div className="p-5 text-left sm:p-7">
          <h3 className="mb-5 text-left text-base font-bold text-[#0B1B3F]">
            Profile Details
          </h3>

          {!isEditing ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-3 text-left">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#0B5FFF]">
                  <User size={18} />
                </div>

                <div className="min-w-0 text-left">
                  <p className="text-left text-xs text-[#7C8AA6]">Full Name</p>

                  <p className="truncate text-left font-semibold text-[#0B1B3F]">
                    {fullName}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 text-left">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#0B5FFF]">
                  <Mail size={18} />
                </div>

                <div className="min-w-0 text-left">
                  <p className="text-left text-xs text-[#7C8AA6]">
                    Email Address
                  </p>

                  <p className="break-all text-left font-semibold text-[#0B1B3F]">
                    {profile.email || "Not available"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4 text-left">
              <div className="w-full text-left">
                <label className="mb-1.5 block text-left text-sm font-medium text-[#5B6B8C]">
                  First Name
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-[#EEF2FA] px-4 py-3 text-left text-sm outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/10"
                />
              </div>

              <div className="w-full text-left">
                <label className="mb-1.5 block text-left text-sm font-medium text-[#5B6B8C]">
                  Last Name
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-[#EEF2FA] px-4 py-3 text-left text-sm outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/10"
                />
              </div>

              <div className="w-full text-left">
                <label className="mb-1.5 block text-left text-sm font-medium text-[#5B6B8C]">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#EEF2FA] px-4 py-3 text-left text-sm outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/10"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B5FFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0642C4] disabled:opacity-50 sm:w-auto"
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
                  className="w-full rounded-xl border border-[#EEF2FA] px-5 py-2.5 text-sm font-semibold text-[#7C8AA6] transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
