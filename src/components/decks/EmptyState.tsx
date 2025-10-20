import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const EmptyState = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Brak talii</CardTitle>
          <CardDescription>
            Nie masz jeszcze żadnych talii. Utwórz swoją pierwszą talię, aby rozpocząć naukę!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/">Utwórz nową talię</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
