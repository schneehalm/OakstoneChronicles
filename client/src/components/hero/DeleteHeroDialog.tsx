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
      <AlertDialogContent className="bg-[#1e1e2f] border-[#7f5af0]/40">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#d4af37] font-['Cinzel_Decorative']">
            Held löschen
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#f5f5f5]/80">
            Bist du sicher, dass du <span className="text-[#d4af37]">{hero.name}</span> löschen möchtest?
            <br /><br />
            <span className="text-[#f5f5f5]/60">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen NPCs, Quests und Sitzungseinträge werden ebenfalls gelöscht.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#7f5af0]/40 text-[#f5f5f5]/80 hover:bg-[#1e1e2f]/80 hover:text-[#f5f5f5]">
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600/80 text-[#f5f5f5] hover:bg-red-700"
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}