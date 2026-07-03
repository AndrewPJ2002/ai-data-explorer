interface ThemeToggleProps {
  theme: "dark" | "light";
  setTheme: React.Dispatch<
    React.SetStateAction<"dark" | "light">
  >;
}

export default function ThemeToggle({
  theme,
  setTheme,
}: ThemeToggleProps) {
  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className={`rounded-2xl px-5 py-3 font-medium transition-all duration-300 ${
        theme === "dark"
          ? "bg-white/5 border border-white/10 hover:bg-white/10"
          : "bg-white border border-slate-200 shadow hover:shadow-lg"
      }`}
    >
      {theme === "dark"
        ? "🌙 Dark Mode"
        : "☀️ Light Mode"}
    </button>
  );
}