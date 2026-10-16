'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldAlert, Heart, User, Phone, Mail, FileText,
  AlertTriangle, Loader2, Lock, Eye, Activity, MessageSquare,
} from 'lucide-react';

interface InfoItem {
  label: string;
  value: string;
  accessLevel: string;
  category: string | null;
}

interface ProfileData {
  name: string;
  lostMode: boolean;
  lockScreenMessage: string;
  level: string;
  infos: InfoItem[];
}

const levelConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  public: { label: 'Público', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: User },
  emergency: { label: 'Emergencial', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: ShieldAlert },
  professional: { label: 'Profissional', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Eye },
};

const categoryIcons: Record<string, any> = {
  'Contato': Phone,
  'Médico': Heart,
  'Documento': FileText,
};

export default function ViewProfileClient({ userId, userName }: { userId: string; userName: string }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('public');

  const fetchData = async (level: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public-profile/${userId}?level=${level}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('public');
  }, [userId]);

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    fetchData(level);
  };

  // Group infos by category
  const grouped = (data?.infos ?? []).reduce<Record<string, InfoItem[]>>((acc, item) => {
    const cat = item.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[hsl(228,28%,5%)] text-[hsl(210,30%,98%)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/10 border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4"
          >
            <Shield className="h-3.5 w-3.5" />
            SafeID — Identidade Digital Verificada
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-white">{userName?.charAt(0)?.toUpperCase() || 'S'}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{userName}</h1>
          </motion.div>

          {data?.lostMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 justify-center"
            >
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Dispositivo em Modo Perdido — Por favor, entre em contato com o proprietário
              </span>
            </motion.div>
          )}

          {data?.lockScreenMessage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
            >
              <div className="flex items-start gap-2.5">
                <MessageSquare className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-100 leading-relaxed">{data.lockScreenMessage}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Level selector */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {Object.entries(levelConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleLevelChange(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                selectedLevel === key
                  ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <cfg.icon className="h-3.5 w-3.5" />
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLevel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-12">
                  <Lock className="h-8 w-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">Nenhuma informação disponível neste nível</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items], catIdx) => {
                  const CatIcon = categoryIcons[category] || FileText;
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.08 }}
                      className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                        <CatIcon className="h-4 w-4 text-white/40" />
                        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{category}</span>
                      </div>
                      <div className="divide-y divide-white/[0.04]">
                        {items.map((item, i) => {
                          const lvl = levelConfig[item.accessLevel];
                          return (
                            <div key={i} className="px-4 py-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-white/40">{item.label}</p>
                                <p className="text-sm font-medium mt-0.5">{item.value}</p>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${lvl?.bg} ${lvl?.color} ${lvl?.border} border`}>
                                {lvl?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-white/30">
            <Activity className="h-3.5 w-3.5" />
            <span>Todo acesso é registrado e auditado</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400">SafeID</span>
            <span className="text-[10px] text-white/20">Identidade digital protegida</span>
          </div>
        </div>
      </div>
    </div>
  );
}
