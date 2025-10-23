import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorDisplayProps {
  message?: string;
  onRetry: () => void;
}

/**
 * Error state display with retry option
 */
export const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Wystąpił błąd</AlertTitle>
            <AlertDescription>{message || "Nie udało się pobrać fiszek. Spróbuj ponownie."}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={onRetry}>Spróbuj ponownie</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
