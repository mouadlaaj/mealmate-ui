import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  UtensilsCrossed,
  BarChart3,
  Droplet,
  Heart,
  Loader2,
} from "lucide-react";
import LoginPageImage from "../../asset/Login_page_Image.png";
import { loginUser } from "../../services/api";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Meal Planning",
    desc: "Plan balanced meals with ease",
  },
  {
    icon: BarChart3,
    title: "Nutrition Tracking",
    desc: "Track nutrients and achieve your goals",
  },
  {
    icon: Droplet,
    title: "Stay Hydrated",
    desc: "Monitor your water intake daily",
  },
  {
    icon: Heart,
    title: "Live Healthy",
    desc: "Build better habits for a better you",
  },
];

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) =>
    `w-full rounded-lg border bg-white py-2 text-sm text-left outline-none transition-colors sm:py-2.5 ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500"
        : "border-[#C7D7EE] hover:border-[#0B5FFF] focus:border-[#0B5FFF]"
    }`;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F4F8FF] md:h-screen md:flex-row md:overflow-hidden">
      <div className="relative hidden flex-1 flex-col items-center overflow-hidden bg-gradient-to-br from-[#0B5FFF] to-[#003EBB] p-4 text-white md:flex lg:flex-[1.1] lg:p-6 xl:p-8">
        <div className="z-10 flex w-full items-center gap-2">
          <UtensilsCrossed size={22} className="lg:size-6" />
          <span className="text-base font-bold tracking-wide lg:text-lg xl:text-xl">
            Meal Mate
          </span>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-20 z-0 h-[340px] w-[340px] rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 z-0 h-[220px] w-[220px] rounded-full bg-white/5" />

        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="z-10 flex w-full max-w-[440px] flex-col items-center"
          >
            <h1 className="mb-1 text-center text-[1.5rem] font-extrabold leading-tight lg:text-[1.8rem] xl:text-[2.1rem]">
              Welcome Back!
            </h1>

            <p className="mb-2 max-w-[360px] text-center text-[0.7rem] font-normal leading-relaxed opacity-90 lg:text-[0.8rem] xl:text-[0.9rem]">
              Plan your meals, track your nutrition, and stay healthy with Meal
              Mate.
            </p>

            <img
              src={LoginPageImage}
              alt="Meal Mate Illustration"
              className="h-auto w-full max-w-[220px] object-contain md:max-h-[22vh] lg:max-h-[26vh] lg:max-w-[290px] xl:max-h-[30vh] xl:max-w-[340px]"
            />

            <div className="mt-3 grid w-full grid-cols-4 gap-2 lg:mt-4 lg:gap-3">
              {features.map((item, idx) => {
                const Icon = item.icon;

                return (
                  <div
                    key={idx}
                    className="flex min-w-0 flex-col items-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.08] p-2 text-center backdrop-blur-sm lg:p-3"
                  >
                    <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 lg:h-9 lg:w-9">
                      <Icon size={16} className="lg:size-[18px]" />
                    </div>

                    <span className="break-words text-[0.55rem] font-bold leading-tight lg:text-[0.62rem]">
                      {item.title}
                    </span>

                    <span className="mt-0.5 hidden break-words text-[0.55rem] leading-tight opacity-80 line-clamp-2 lg:block">
                      {item.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:h-full md:max-h-screen md:p-8 lg:p-10">
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto w-full max-w-[360px] sm:max-w-[380px]"
        >
          <div className="w-full rounded-2xl bg-transparent p-0 sm:bg-white sm:p-6 sm:shadow-[0_8px_30px_rgba(11,95,255,0.08)]">
            <div className="mb-5 flex items-center justify-center gap-2 md:hidden">
              <UtensilsCrossed className="text-[#0B5FFF]" size={24} />
              <span className="text-lg font-bold text-[#003EBB]">
                Meal Mate
              </span>
            </div>

            <div className="mb-6 text-center sm:mb-7">
              <h2 className="text-lg font-bold text-[#0A2E6B] sm:text-xl">
                Sign In
              </h2>

              <p className="mt-1 text-xs text-[#5C7299] sm:text-sm">
                Enter your credentials to access your account
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-3.5 sm:gap-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <label
                  htmlFor="email"
                  className="mb-1 block text-left text-xs font-medium text-[#5C7299] sm:text-[0.8rem]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                      errors.email ? "text-red-500" : "text-[#0B5FFF]"
                    }`}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    maxLength={100}
                    value={form.email}
                    onChange={handleChange}
                    className={`${getInputClass(
                      "email"
                    )} pl-9 pr-3 sm:pl-10`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-left text-[0.7rem] text-red-500">
                    {errors.email}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label
                  htmlFor="password"
                  className="mb-1 block text-left text-xs font-medium text-[#5C7299] sm:text-[0.8rem]"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                      errors.password ? "text-red-500" : "text-[#0B5FFF]"
                    }`}
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className={`${getInputClass(
                      "password"
                    )} pl-9 pr-9 sm:pl-10 sm:pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#5C7299] hover:bg-black/5"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-left text-[0.7rem] text-red-500">
                    {errors.password}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B5FFF] py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(11,95,255,0.3)] transition-colors hover:bg-[#0846C4] disabled:cursor-not-allowed disabled:opacity-70 sm:py-3 sm:text-base"
                >
                  {loading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </motion.div>
            </form>

            <hr className="my-5 border-[#DCE6FA] sm:my-6" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="text-center text-xs text-[#5C7299] sm:text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#0B5FFF] no-underline hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}