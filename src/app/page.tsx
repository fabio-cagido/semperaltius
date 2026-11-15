'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TabsNav, { ActiveTab } from '@/components/TabsNav';
import CenarioGeralView from '@/components/CenarioGeralView';
import CiclosView from '@/components/CiclosView';
import Analise360View from '@/components/Analise360View';
import ComparativoCiclosView from '@/components/ComparativoCiclosView';
import GestaoEspecialistasView from '@/components/GestaoEspecialistasView';
import ExploradorQuesitosView from '@/components/ExploradorQuesitosView';
import TabelaAvaliadosView from '@/components/TabelaAvaliadosView';
import LoginScreen from '@/components/LoginScreen';

import dashboardJson from '@/data/dashboard_data.json';
import { DashboardData, UnidadeScope } from '@/types/dashboard';
import { User } from '@/types/auth';

const STORAGE_KEY = 'everest_auth_user_2026';

export default function Home() {
  const data = dashboardJson as unknown as DashboardData;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [unidade, setUnidade] = useState<UnidadeScope>('Todas');
  const [activeTab, setActiveTab] = useState<ActiveTab>('cenario');

  // Load user session from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setCurrentUser(parsed);
        setUnidade(parsed.defaultUnit);
      }
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Handle Login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setUnidade(user.defaultUnit);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove session', e);
    }
  };

  // Protected setUnidade ensures users cannot exceed their permissions
  const handleSetUnidade = (targetUnit: UnidadeScope) => {
    if (!currentUser) return;
    if (currentUser.allowedUnits.includes(targetUnit)) {
      setUnidade(targetUnit);
    }
  };

  // While checking initial session, display a brief loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0F294A] flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs text-blue-200 tracking-wider uppercase font-semibold">
            Carregando Sistema Everest...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, render the dedicated Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Active analytics slice based on selected unit
  const activeAnalytics = data.scopes[unidade];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Header with Global Unit Selector & User Session */}
      <Header
        unidade={unidade}
        setUnidade={handleSetUnidade}
        totalAvaliados={activeAnalytics.kpis.total_avaliados}
        mediaGeral={activeAnalytics.kpis.media_geral}
        currentUser={currentUser}
        onLogout={handleLogout}
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

        {activeTab === 'gestao' && (
          <GestaoEspecialistasView
            data={data}
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
            Conectado como <span className="font-semibold text-slate-600">{currentUser.name}</span> ({currentUser.unitLabel}) • Acesso Seguro
          </p>
        </div>
      </footer>
    </div>
  );
}
