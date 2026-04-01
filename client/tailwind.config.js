/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#09090B",
        steel: "#0F172A",
        primary: "#10B981",
        "primary-dark": "#059669",
        "primary-light": "#6EE7B7",
        accent: "#F97316",
        "accent-dark": "#EA580C",
        "accent-light": "#FDBA74",
        success: "#34D399",
        warning: "#FBBF24",
        error: "#F87171",
        "slate-700": "#334155",
        "slate-800": "#1E293B",
      },
      fontFamily: {
        display: ["Syne", "Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Space Grotesk", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glass: "0 20px 80px rgba(15, 23, 42, 0.55)",
        glow: "0 0 35px rgba(16, 185, 129, 0.45)",
        accent: "0 0 30px rgba(249, 115, 22, 0.35)",
      },
      backgroundImage: {
        "mesh": "radial-gradient(circle at 15% 10%, rgba(16, 185, 129, 0.15), transparent 45%), radial-gradient(circle at 80% 5%, rgba(6, 182, 212, 0.12), transparent 40%), radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.1), transparent 45%)",
        "shine": "linear-gradient(120deg, rgba(16, 185, 129, 0.6), rgba(6, 182, 212, 0.5), rgba(249, 115, 22, 0.55))",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glowPulse 3s ease-in-out infinite",
        gradient: "gradientShift 10s ease infinite",
        rise: "rise 0.8s ease forwards",
      },
    },
  },
  plugins: [],
};
