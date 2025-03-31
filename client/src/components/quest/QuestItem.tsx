import { Shield, Flag, BookOpen } from "lucide-react";
import { Quest } from "@shared/schema";

interface QuestItemProps {
  quest: Quest;
  onClick?: () => void;
}

export default function QuestItem({ quest, onClick }: QuestItemProps) {
  // Get icon based on quest type
  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'main':
        return <Shield className="h-5 w-5 text-[#7f5af0]" />;
      case 'personal':
        return <BookOpen className="h-5 w-5 text-[#7f5af0]" />;
      default:
        return <Flag className="h-5 w-5 text-[#7f5af0]" />;
    }
  };
  
  // Get quest type display text and style
  const getQuestTypeInfo = (type: string) => {
    switch (type) {
      case 'main':
        return {
          label: "Hauptquest",
          className: "bg-[#43ffaf]/20 text-[#43ffaf] border border-[#43ffaf]/40"
        };
      case 'side':
        return {
          label: "Nebenquest",
          className: "bg-[#7f5af0]/20 text-[#7f5af0] border border-[#7f5af0]/40"
        };
      case 'personal':
        return {
          label: "Persönlich",
          className: "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40"
        };
      case 'guild':
        return {
          label: "Gilde",
          className: "bg-[#7f5af0]/20 text-[#7f5af0] border border-[#7f5af0]/40"
        };
      default:
        return {
          label: "Andere",
          className: "bg-[#f5f5f5]/20 text-[#1e1e2f] dark:text-[#f5f5f5] border border-[#f5f5f5]/40"
        };
    }
  };
  
  const typeInfo = getQuestTypeInfo(quest.type);
  
  return (
    <div 
      className="bg-white/90 dark:bg-[#1e1e2f]/90 border border-[#d4af37]/30 rounded-xl p-4 cursor-pointer hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all bg-pattern-light dark:bg-pattern-dark text-[#1e1e2f] dark:text-[#f5f5f5]" 
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-[#7f5af0]/20 flex items-center justify-center">
            {getQuestIcon(quest.type)}
          </div>
        </div>
        <div className="flex-grow">
          <h4 className="font-medium text-[#d4af37]">{quest.title}</h4>
          <p className="text-sm mt-1">{quest.description}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className={`text-xs rounded-full px-2 py-0.5 ${typeInfo.className}`}>
            {typeInfo.label}
          </span>
          
          {/* Quest Status */}
          <span className={`text-xs rounded-full px-2 py-0.5 ${
            quest.completed 
              ? "bg-[#43ffaf]/20 text-[#43ffaf] border border-[#43ffaf]/40" 
              : "bg-[#f5f5f5]/20 text-[#1e1e2f] dark:text-[#f5f5f5] border border-[#f5f5f5]/40 dark:border-[#f5f5f5]/40"
          }`}>
            {quest.completed ? "Abgeschlossen" : "Offen"}
          </span>
        </div>
      </div>
    </div>
  );
}