'use client';

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Compass,
  BarChart3,
  Briefcase,
  Search,
  Users
} from 'lucide-react';

export type ActiveTab = 'cenario' | 'ciclos' | 'analise360' | 'comparativo' | 'gestao' | 'explorador' | 'tabela';

interface TabsNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function TabsNav({ activeTab, setActiveTab }: TabsNavProps) {
  const tabs = [
    {
      id: 'cenario' as ActiveTab,
      label: 'Cenário Geral',
      sublabel: 'Visão Escola / Unidade & Matriz',
      icon: LayoutDashboard,
    },
    {
      id: 'ciclos' as ActiveTab,
      label: 'Visão por Ciclos',
      sublabel: 'EI, EFI, EFII, EM & Radar 2026',
      icon: Layers,
    },
    {
      id: 'analise360' as ActiveTab,
      label: 'Análise 360º Docente',
      sublabel: 'Radares dos Perfis Avaliadores',
      icon: Compass,
    },
    {
      id: 'comparativo' as ActiveTab,
      label: 'Comparativo entre Ciclos',
      sublabel: 'Coordenações, Psicologia & Docência',
      icon: BarChart3,
    },
    {
      id: 'gestao' as ActiveTab,
      label: 'Gestão & Especialistas',
      sublabel: 'Coordenações, Psicologia & Inglês',
      icon: Briefcase,
    },
    {
      id: 'explorador' as ActiveTab,
      label: 'Explorador de Quesitos',
      sublabel: 'Drill-down & Rankings Top/Bottom',
      icon: Search,
    },
    {
      id: 'tabela' as ActiveTab,
      label: 'Lista de Avaliados',
      sublabel: 'Registros Individuais e Devolutivas',
      icon: Users,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-everest-navy text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="leading-tight">{tab.label}</div>
                  <div className={`text-[10px] font-normal leading-tight hidden sm:block ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {tab.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
