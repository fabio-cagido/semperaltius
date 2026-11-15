'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import TabsNav, { ActiveTab } from '@/components/TabsNav';
import CenarioGeralView from '@/components/CenarioGeralView';
import CiclosView from '@/components/CiclosView';
import Analise360View from '@/components/Analise360View';
import ComparativoCiclosView from '@/components/ComparativoCiclosView';
import ExploradorQuesitosView from '@/components/ExploradorQuesitosView';
import TabelaAvaliadosView from '@/components/TabelaAvaliadosView';

import dashboardJson from '@/data/dashboard_data.json';
import { DashboardData, UnidadeScope } from '@/types/dashboard';

export default function Home() {
  const data = dashboardJson as unknown as DashboardData;
  const [unidade, setUnidade] = useState<UnidadeScope>('Todas');
  const [activeTab, setActiveTab] = useState<ActiveTab>('cenario');

  // Active analytics slice based on selected unit
  const activeAnalytics = data.scopes[unidade];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Header with Global Unit Selector */}
      <Header
        unidade={unidade}
        setUnidade={setUnidade}
        totalAvaliados={activeAnalytics.kpis.total_avaliados}
        mediaGeral={activeAnalytics.kpis.media_geral}
      />

      {/* Tabs Navigation Bar */}
      <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'cenario' && (
          <CenarioGeralView
            analytics={activeAnalytics}
            metadata={data.metadata}
            unidade={unidade}
          />
        )}

        {activeTab === 'ciclos' && (
          <CiclosView
            analytics={activeAnalytics}
            metadata={data.metadata}
            unidade={unidade}
          />
        )}

        {activeTab === 'analise360' && (
          <Analise360View
            analytics={activeAnalytics}
            metadata={data.metadata}
            unidade={unidade}
          />
        )}

        {activeTab === 'comparativo' && (
          <ComparativoCiclosView
            analytics={activeAnalytics}
            metadata={data.metadata}
            unidade={unidade}
          />
        )}

        {activeTab === 'explorador' && (
          <ExploradorQuesitosView
            analytics={activeAnalytics}
            metadata={data.metadata}
            unidade={unidade}
          />
        )}

        {activeTab === 'tabela' && (
          <TabelaAvaliadosView
            avaliados={data.avaliados}
            metadata={data.metadata}
            unidade={unidade}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-semibold text-slate-700">
            Rede de Colégios Semper Altius • Avaliação Institucional Docente e Pedagógica 2026
          </p>
          <p className="text-slate-400 text-[11px]">
            Dados exportados via Qulture.Rocks e consolidados em Next.js (App Router) + React + Tailwind CSS + Recharts. Pronto para deploy na Vercel.
          </p>
        </div>
      </footer>

    </div>
  );
}
