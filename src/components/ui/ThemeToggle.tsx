import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useApp } from "../../contexts/AppContext";

export function ThemeToggle() {
  const { state, dispatch } = useApp();

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 hover:bg-accent"
      aria-label={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {state.theme === 'light' ? (
        <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      ) : (
        <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      )}
    </Button>
  );
}