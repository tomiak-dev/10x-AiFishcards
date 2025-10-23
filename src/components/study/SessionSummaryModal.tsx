import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SessionStats } from "../../types";

interface SessionSummaryModalProps {
  isOpen: boolean;
  stats: SessionStats;
  onClose: () => void;
  onRestart: () => void;
}

/**
 * Modal displayed after completing all flashcards in a study session
 */
export const SessionSummaryModal = ({ isOpen, stats, onClose, onRestart }: SessionSummaryModalProps) => {
  const successRate = stats.total > 0 ? Math.round(((stats.good + stats.easy) / stats.total) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sesja zakończona!</DialogTitle>
          <DialogDescription>Gratulacje! Ukończyłeś sesję nauki. Oto Twoje statystyki:</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Przejrzane fiszki</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Wskaźnik sukcesu</p>
              <p className="text-2xl font-bold text-green-600">{successRate}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Nie wiem</span>
              <span className="text-lg font-bold text-red-600">{stats.again}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Wiem</span>
              <span className="text-lg font-bold text-blue-600">{stats.good}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Bardzo łatwe</span>
              <span className="text-lg font-bold text-green-600">{stats.easy}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
          <Button onClick={onRestart}>Rozpocznij ponownie</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
