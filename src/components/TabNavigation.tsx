import React from 'react';
import { PenTool, Trophy, GraduationCap } from 'lucide-react';
import { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onChangeTab }: TabNavigationProps) {
  const tabs = [
    {
      id: 'student' as TabType,
      label: '독서기록 쓰기',
      icon: <PenTool size={18} />,
      activeClass: 'bg-white text-teal-700 border-2 border-pastel-mint-dark shadow-sm',
      inactiveClass: 'text-slate-600 hover:bg-white/50 hover:text-teal-600'
    },
    {
      id: 'ranking' as TabType,
      label: '독서 랭킹 보드',
      icon: <Trophy size={18} />,
      activeClass: 'bg-white text-pastel-orange-deep border-2 border-pastel-orange-dark shadow-sm',
      inactiveClass: 'text-slate-600 hover:bg-white/50 hover:text-pastel-orange-deep'
    },
    {
      id: 'teacher' as TabType,
      label: '선생님 관리판',
      icon: <GraduationCap size={18} />,
      activeClass: 'bg-white text-pastel-purple-deep border-2 border-pastel-purple-dark shadow-sm',
      inactiveClass: 'text-slate-600 hover:bg-white/50 hover:text-pastel-purple-deep'
    }
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex w-full max-w-lg p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm md:text-base font-bold rounded-xl transition-all duration-200 ${
                isActive ? tab.activeClass : tab.inactiveClass
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
