import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  className,
  children,
  onSuccess,
  showIcon = true,
}: LogoutButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Call server-side logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Wystąpił błąd podczas wylogowania");
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to login page with full page reload to clear session
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas wylogowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleLogout}
        disabled={isLoading}
        aria-label="Wyloguj się"
      >
        {showIcon && <LogOut className="size-4" />}
        {children || (isLoading ? "Wylogowywanie..." : "Wyloguj się")}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
