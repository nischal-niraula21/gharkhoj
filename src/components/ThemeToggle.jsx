import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("gharkhoj-theme");

        // Light mode is the default for first-time visitors.
        const shouldUseDark = savedTheme === "dark";

        setDark(shouldUseDark);
        document.documentElement.classList.toggle(
            "dark",
            shouldUseDark,
        );
    }, []);

    const toggleTheme = () => {
        const nextDark = !dark;

        setDark(nextDark);

        document.documentElement.classList.toggle(
            "dark",
            nextDark,
        );

        localStorage.setItem(
            "gharkhoj-theme",
            nextDark ? "dark" : "light",
        );
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-secondary"
            aria-label={
                dark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            title={
                dark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
        >
            {dark ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
        </button>
    );
};

export default ThemeToggle;