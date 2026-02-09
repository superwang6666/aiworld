"use client";

import { AlertTriangle, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import type { ExpertCardData } from "./utils/dataAdapters";

interface ExpertCardProps {
  expert: ExpertCardData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ExpertCard({
  expert,
  index,
  isExpanded,
  onToggle,
}: ExpertCardProps) {
  const t = useTranslations("Validation");
  const IconComponent = expert.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
      }}
      className="group bg-gradient-to-br from-[rgba(35,35,45,0.95)] to-[rgba(45,45,55,0.95)] rounded-2xl border border-[rgba(100,100,115,0.4)] backdrop-blur-sm hover:border-[rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.1)] transition-all duration-500 overflow-hidden"
    >
     {/* 专家信息头部 */}
     <div className="p-6 border-b border-[rgba(100,100,115,0.25)]">
       <div className="flex items-start gap-5">
         <div className="relative flex items-center justify-center">
           <IconComponent
             className="w-12 h-12 group-hover:scale-110 transition-transform duration-500"
             style={{ color: expert.iconColor }}
             strokeWidth={1.5}
           />
           <div
             className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#39ff14] rounded-full flex items-center justify-center"
             style={{
               boxShadow: "0 0 8px rgba(57, 255, 20, 0.6)",
             }}
           >
             <svg
               className="w-2.5 h-2.5 text-[#0f0f14]"
               fill="none"
               viewBox="0 0 12 12"
             >
               <path
                 d="M10 3L4.5 8.5L2 6"
                 stroke="currentColor"
                 strokeWidth="2"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               />
             </svg>
           </div>
         </div>
         <div className="flex-1">
           <h3 className="text-[#ebebf0] text-xl font-bold mb-2 group-hover:text-[#39ff14] transition-colors duration-300">
             {expert.name}
           </h3>
           <div className="flex items-center gap-2">
             <p className="text-[#7a7a88] text-sm font-medium px-3 py-1 bg-[rgba(25,25,35,0.6)] rounded-lg border border-[rgba(80,80,95,0.3)]">
               {expert.field}
             </p>
           </div>
         </div>
       </div>
     </div>

     {/* 意见内容 */}
     <div className="p-6 space-y-4">
       {/* 专业意见 */}
       <div className="relative">
         <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#39ff14] via-[rgba(57,255,20,0.5)] to-transparent rounded-full" />
         <div className="pl-6 pr-4 py-4 bg-[rgba(25,25,35,0.5)] rounded-xl border border-[rgba(80,80,95,0.25)]">
           <div className="flex items-center gap-2 mb-3">
             <svg
               className="w-4 h-4 text-[#39ff14]"
               fill="none"
               viewBox="0 0 16 16"
             >
               <path
                 d="M8 1L10.5 6L16 7L12 11L13 16.5L8 13.5L3 16.5L4 11L0 7L5.5 6L8 1Z"
                 stroke="currentColor"
                 strokeWidth="1.5"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               />
             </svg>
             <span className="text-[#39ff14] text-xs font-bold tracking-wider uppercase">
               {t("expertProfessionalOpinion")}
             </span>
           </div>
           <p
             className="text-[#c1c5cc] text-sm leading-loose"
             style={
               !isExpanded
                 ? {
                     display: "-webkit-box",
                     WebkitLineClamp: 3,
                     WebkitBoxOrient: "vertical",
                     overflow: "hidden",
                   }
                 : undefined
             }
           >
             {expert.opinion}
           </p>
           <button
             onClick={onToggle}
             className="mt-4 flex items-center gap-2 text-[#39ff14] text-xs font-medium hover:text-[#50ff30] transition-all duration-300 group/btn"
           >
             <span>
               {isExpanded ? t("collapseContent") : t("expandFullText")}
             </span>
             <svg
               className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} group-hover/btn:translate-y-0.5`}
               fill="none"
               viewBox="0 0 16 16"
             >
               <path
                 d="M4 6L8 10L12 6"
                 stroke="currentColor"
                 strokeWidth="2"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               />
             </svg>
           </button>
         </div>
       </div>

       {/* 警告与建议 - 两栏布局 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* 警告 */}
         <div className="relative group/warning bg-gradient-to-br from-[rgba(180,80,60,0.12)] to-[rgba(150,60,40,0.08)] rounded-xl p-5 border border-[rgba(180,80,60,0.35)] hover:border-[rgba(180,80,60,0.5)] transition-all duration-300">
           <div className="flex items-start gap-3">
             <AlertTriangle
               className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 group-hover/warning:scale-110 transition-transform duration-300"
               strokeWidth={2}
             />
             <div className="flex-1">
               <p className="text-red-300 text-xs font-bold tracking-widest uppercase mb-2">
                 {t("riskWarning")}
               </p>
               <p className="text-[#c1c5cc] text-sm leading-relaxed">
                 {expert.warning}
               </p>
             </div>
           </div>
         </div>

         {/* 建议 */}
         <div className="relative group/suggestion bg-gradient-to-br from-[rgba(57,255,20,0.12)] to-[rgba(57,255,20,0.06)] rounded-xl p-5 border border-[rgba(57,255,20,0.35)] hover:border-[rgba(57,255,20,0.5)] transition-all duration-300">
           <div className="flex items-start gap-3">
             <Lightbulb
               className="w-5 h-5 text-[#39ff14] flex-shrink-0 mt-0.5 group-hover/suggestion:scale-110 transition-transform duration-300"
               strokeWidth={2}
             />
             <div className="flex-1">
               <p className="text-[#39ff14] text-xs font-bold tracking-widest uppercase mb-2">
                 {t("actionSuggestion")}
               </p>
               <p className="text-[#c1c5cc] text-sm leading-relaxed">
                 {expert.suggestion}
               </p>
             </div>
           </div>
         </div>
       </div>
     </div>
   </motion.div>
 );
}
