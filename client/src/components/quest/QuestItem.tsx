import { Shield, Flag, BookOpen } from "lucide-react";
import { Quest } from "@/lib/types";

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
          className: "bg-[#f5f5f5]/20 text-[#f5f5f5] border border-[#f5f5f5]/40"
        };
    }
  };
  
  const typeInfo = getQuestTypeInfo(quest.type);
  
  return (
    <div 
      className="bg-[#1e1e2f]/90 border border-[#d4af37]/20 rounded-xl p-4 cursor-pointer hover:shadow-sm hover:border-[#d4af37]/40 transition-all bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2752%27%20height%3D%2726%27%20viewBox%3D%270%200%2052%2026%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23d4af37%27%20fill-opacity%3D%270.1%27%3E%3Cpath%20d%3D%27M10%2010c0-2.21-1.79-4-4-4-3.314%200-6-2.686-6-6h2c0%202.21%201.79%204%204%204%203.314%200%206%202.686%206%206%200%202.21%201.79%204%204%204%203.314%200%206%202.686%206%206%200%202.21%201.79%204%204%204v2c-3.314%200-6-2.686-6-6%200-2.21-1.79-4-4-4-3.314%200-6-2.686-6-6zm25.464-1.95l8.486%208.486-1.414%201.414-8.486-8.486%201.414-1.414z%27%20%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" 
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
        <div className="flex-shrink-0">
          <span className={`text-xs rounded-full px-2 py-0.5 ${typeInfo.className}`}>
            {typeInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
}
