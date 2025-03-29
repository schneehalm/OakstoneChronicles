import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Hero } from "@/lib/types";
import { deleteHero } from "@/lib/storage";

interface DeleteHeroDialogProps {
  hero: Hero;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export default function DeleteHeroDialog({
  hero,
  isOpen,
  onOpenChange,
  onDeleted,
}: DeleteHeroDialogProps) {
  const handleDelete = () => {
    deleteHero(hero.id);
    onDeleted();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1e1e2f] border-2 border-[#7f5af0]/60 shadow-lg shadow-[#7f5af0]/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#d4af37] font-['Cinzel_Decorative'] text-xl">
            Held löschen
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#f5f5f5] mt-2">
            Bist du sicher, dass du <span className="text-[#d4af37] font-semibold">{hero.name}</span> löschen möchtest?
            <br /><br />
            <div className="bg-[#1e1e2f]/90 border border-[#7f5af0]/30 p-3 rounded-md text-[#f5f5f5]/90">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen NPCs, Quests und Sitzungseinträge werden ebenfalls gelöscht.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="bg-[#1e1e2f] border-2 border-[#7f5af0]/60 text-[#f5f5f5] hover:bg-[#1e1e2f]/80 hover:text-[#f5f5f5] hover:border-[#7f5af0]">
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-700 text-[#f5f5f5] hover:bg-red-800 border-2 border-red-700 hover:border-red-800"
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}