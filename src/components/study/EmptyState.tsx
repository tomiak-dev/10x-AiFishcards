import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  onReturn: () => void;
}

/**
 * Displayed when there are no flashcards to review
 */
export const EmptyState = ({ onReturn }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Świetna robota!</h2>
          <p className="text-gray-600 mb-6">Nie masz fiszek do powtórki w tej chwili.</p>
          <Button onClick={onReturn}>Wróć do talii</Button>
        </CardContent>
      </Card>
    </div>
  );
};
