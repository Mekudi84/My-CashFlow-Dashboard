export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="icon-btn" type="button" aria-label="Toggle theme" onClick={onToggle}>
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
