'use client';

import React, { useState, useEffect } from 'react';
import { FaUserCheck, FaSchool, FaInfoCircle, FaCalendar } from 'react-icons/fa';
import { apiService } from '@/app/services/api';
import { useAuth } from '@/app/hooks/useAuth';

// Interface temporaire si conflit
interface SessionFormateur {
  idSession: number;
  classe: string;
  specialite: string;
  promotion: string;
  niveau: string;
  semestre: string;
  dateD: string;
  dateF: string;
  formateurs?: any[];
}

interface SessionFormateurProps {
  isVisible: boolean;
}

export const SessionFormateur: React.FC<SessionFormateurProps> = ({ isVisible }) => {
  const { user: authUser } = useAuth();
  const [mesSessions, setMesSessions] = useState<SessionFormateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 🔥 SUPPRESSION : Plus besoin de l'état pour les sessions disponibles
  // 🔥 SUPPRESSION : Plus besoin de l'état activeTab

  useEffect(() => {
    if (isVisible && authUser) {
      console.log('👤 Formateur connecté:', {
        id: authUser.id,
        name: `${authUser.firstName} ${authUser.lastName}`
      });
      
      loadMesSessions();
    } else {
      // Réinitialiser quand caché
      setMesSessions([]);
    }
  }, [isVisible, authUser]);

  // 🔥 CORRECTION : Charger uniquement les sessions du formateur
  const loadMesSessions = async () => {
    if (!authUser) {
      console.log('❌ Aucun utilisateur connecté');
      setMesSessions([]);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log(`📥 Chargement des sessions du formateur ${authUser.id}...`);
      const mesSessionsData = await apiService.getSessionsByFormateur(authUser.id);
      
      console.log('📋 Mes sessions affectées:', mesSessionsData);
      
      const mesSessionsArray = Array.isArray(mesSessionsData) ? mesSessionsData : [];
      setMesSessions(mesSessionsArray);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement mes sessions:', error);
      setError(`Erreur de chargement: ${error.message}`);
      setMesSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SUPPRESSION : Plus besoin des fonctions handleAssignerSession et handleRetirerSession

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 mt-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <FaUserCheck className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-cyan-300">Mes Sessions de Formation</h3>
            <p className="text-cyan-100/70 text-sm">
              Sessions affectées par le coordinateur
            </p>
          </div>
        </div>
        
        {/* 🔥 SUPPRESSION : Plus de boutons d'action pour le formateur */}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {/* 🔥 SUPPRESSION : Plus de tabs */}

      {/* Contenu - UNIQUEMENT les sessions affectées */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-100/70">Chargement de vos sessions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!Array.isArray(mesSessions) || mesSessions.length === 0 ? (
            <div className="col-span-full p-8 text-center">
              <FaUserCheck className="text-cyan-500/50 text-4xl mx-auto mb-4" />
              <p className="text-cyan-100/70">Aucune session affectée pour le moment</p>
              <p className="text-cyan-100/50 text-sm mt-2">
                Les coordinateurs vous affecteront des sessions prochainement
              </p>
            </div>
          ) : (
            mesSessions.map((session) => (
              <div
                key={session.idSession}
                className="bg-green-500/10 backdrop-blur-lg border border-green-500/30 rounded-2xl p-4 hover:border-green-400/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-white text-lg">{session.classe}</h4>
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <FaUserCheck className="text-xs" />
                    Affectée
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-cyan-100/70 text-sm">
                    <FaInfoCircle className="text-green-400" />
                    <span>{session.specialite}</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-100/70 text-sm">
                    <FaSchool className="text-green-400" />
                    <span>Promo {session.promotion} - {session.niveau}</span>
                  </div>
                  <div className="text-cyan-100/70 text-sm">
                    {session.semestre} • {new Date(session.dateD).toLocaleDateString()} - {new Date(session.dateF).toLocaleDateString()}
                  </div>
                </div>

                {/* 🔥 AJOUT : Informations sur l'affectation */}
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-center">
                  <p className="text-green-300 text-sm font-medium">
                    ✅ Session affectée par coordinateur
                  </p>
                  <p className="text-green-200 text-xs mt-1">
                    Vous êtes le formateur principal
                  </p>
                </div>

                {/* 🔥 AJOUT : Statistiques ou informations supplémentaires */}
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-green-300 font-semibold">Durée</div>
                      <div className="text-cyan-100/70">
                        {Math.ceil((new Date(session.dateF).getTime() - new Date(session.dateD).getTime()) / (1000 * 60 * 60 * 24))} jours
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300 font-semibold">Statut</div>
                      <div className="text-cyan-100/70">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 🔥 AJOUT : Résumé des sessions */}
      {mesSessions.length > 0 && (
        <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-cyan-300 font-semibold">Résumé de vos sessions</h4>
              <p className="text-cyan-100/70 text-sm">
                {mesSessions.length} session(s) affectée(s)
              </p>
            </div>
            <div className="text-right">
              <p className="text-green-300 font-semibold">
                Total: {mesSessions.length}
              </p>
              <p className="text-cyan-100/70 text-sm">
                Dernière mise à jour: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};