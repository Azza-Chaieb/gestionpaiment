'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendar, FaSchool, FaGraduationCap, FaUser, FaTimes } from 'react-icons/fa';
import { Session, User } from '@/app/types';
import { apiService } from '@/app/services/api';

interface SessionManagerProps {
  isVisible: boolean;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ isVisible }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [formateurs, setFormateurs] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFormateurs, setLoadingFormateurs] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formateursLoaded, setFormateursLoaded] = useState(false); 

  const [formData, setFormData] = useState({
    classe: '',
    specialite: '',
    promotion: '',
    niveau: '',
    semestre: '',
    dateD: '',
    dateF: '',
    formateurId: '' as string | number
  });

  // 🔥 CORRECTION : Charger seulement quand visible
  useEffect(() => {
    if (isVisible) {
      console.log('🔄 SessionManager visible - chargement des données');
      loadSessions();
      if (!formateursLoaded) {
        loadFormateurs();
      }
    }
  }, [isVisible]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const sessionsData = await apiService.getSessions();
      
      console.log('📋 Sessions chargées:', {
        count: sessionsData.length,
        sessions: sessionsData.map(s => ({
          id: s.idSession,
          classe: s.classe,
          formateursCount: s.formateurs?.length || 0
        }))
      });
      
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (error: any) {
      setError(`Erreur de chargement: ${error.message}`);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CORRECTION : Améliorer loadFormateurs
  const loadFormateurs = async () => {
  try {
    setLoadingFormateurs(true);
    console.log('🔄 DEBUT Chargement des formateurs...');
    
    const formateursData = await apiService.getFormateurs();
    
    console.log('🔍 DONNEES BRUTES formateurs:', {
      type: typeof formateursData,
      isArray: Array.isArray(formateursData),
      data: formateursData
    });
    
    // 🔥 ANALYSE DETAILLEE
    if (formateursData && Array.isArray(formateursData)) {
      console.log(`📊 ${formateursData.length} formateurs trouvés:`);
      formateursData.forEach((formateur, index) => {
        console.log(`  ${index + 1}. ID: ${formateur.id}`);
        console.log(`     Nom: ${formateur.firstName} ${formateur.lastName}`);
        console.log(`     Email: ${formateur.email}`);
        console.log(`     Rôles:`, formateur.roles);
      });
    } else {
      console.log('❌ formateursData invalide:', formateursData);
    }
    
    const formateursArray = Array.isArray(formateursData) ? formateursData : [];
    setFormateurs(formateursArray);
    setFormateursLoaded(true);
    
    console.log('✅ FIN Chargement formateurs - État mis à jour');
    
  } catch (error: any) {
    console.error('❌ Erreur chargement formateurs:', error);
    setFormateurs([]);
    setFormateursLoaded(true);
  } finally {
    setLoadingFormateurs(false);
  }
};
  // 🔥 CORRECTION : handleAffecterFormateur amélioré
  const handleAffecterFormateur = async (sessionId: number, formateurId: number) => {
    try {
      setError('');
      console.log(`🎯 Affectation session ${sessionId} -> formateur ${formateurId}`);
      
      await apiService.affecterFormateurSession(sessionId, formateurId);
      setSuccess('Formateur affecté avec succès !');
      
      // Recharger les sessions pour voir la mise à jour
      await loadSessions();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('❌ Erreur affectation:', error);
      setError(`Erreur: ${error.message}`);
    }
  };

  // 🔥 CORRECTION : handleRetirerFormateur amélioré
  const handleRetirerFormateur = async (sessionId: number, formateurId: number) => {
    try {
      setError('');
      console.log(`🗑️ Retrait formateur ${formateurId} de session ${sessionId}`);
      
      await apiService.retirerFormateur(sessionId, formateurId);
      setSuccess('Formateur retiré avec succès !');
      
      await loadSessions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('❌ Erreur retrait:', error);
      setError(`Erreur: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      classe: '',
      specialite: '',
      promotion: '',
      niveau: '',
      semestre: '',
      dateD: '',
      dateF: '',
      formateurId: ''
    });
    setEditingSession(null);
    setShowForm(false);
  };

  // 🔥 CORRECTION : handleSubmit avec meilleur rechargement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');

      // Validation des dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dateDebut = new Date(formData.dateD);
      const dateFin = new Date(formData.dateF);

      if (dateDebut < today) {
        setError('La date de début doit être supérieure ou égale à aujourd\'hui');
        return;
      }

      if (dateFin <= dateDebut) {
        setError('La date de fin doit être supérieure à la date de début');
        return;
      }

      const sessionData = {
        classe: formData.classe,
        specialite: formData.specialite,
        promotion: formData.promotion,
        niveau: formData.niveau,
        semestre: formData.semestre,
        dateD: formData.dateD,
        dateF: formData.dateF,
        formateurId: formData.formateurId ? parseInt(formData.formateurId as string) : undefined
      };
      
      console.log('📤 Création/Modification session:', sessionData);
      
      if (editingSession) {
        await apiService.updateSession(editingSession.idSession, sessionData);
        setSuccess('Session modifiée avec succès !');
      } else {
        await apiService.createSession(sessionData);
        setSuccess('Session créée avec succès !');
      }
      
      resetForm();
      await loadSessions(); // Recharger les sessions
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(`Erreur: ${error.message}`);
    }
  };

  // 🔥 CORRECTION : handleEdit amélioré pour les formateurs
  const handleEdit = (session: Session) => {
    console.log('✏️ Modification session:', {
      id: session.idSession,
      classe: session.classe,
      formateurs: session.formateurs
    });

    setEditingSession(session);
    
    // 🔥 CORRECTION : Récupérer le premier formateur s'il existe
    const premierFormateurId = session.formateurs && session.formateurs.length > 0 
      ? session.formateurs[0].id 
      : '';

    setFormData({
      classe: session.classe,
      specialite: session.specialite,
      promotion: session.promotion,
      niveau: session.niveau,
      semestre: session.semestre,
      dateD: session.dateD,
      dateF: session.dateF,
      formateurId: premierFormateurId
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      try {
        await apiService.deleteSession(id);
        setSuccess('Session supprimée avec succès !');
        await loadSessions();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        setError(`Erreur de suppression: ${error.message}`);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 mt-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <FaSchool className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-cyan-300">Gestion des Sessions</h3>
            <p className="text-cyan-100/70 text-sm">Créez et gérez les sessions de formation</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 px-4 py-2 rounded-xl transition-all duration-300 text-white font-semibold"
        >
          <FaPlus className="text-sm" />
          Nouvelle Session
        </button>
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

      {/* Formulaire */}
      {showForm && (
        <div className="mb-6 bg-white/5 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6 animate-fadeIn">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4">
            {editingSession ? 'Modifier la Session' : 'Nouvelle Session'}
          </h4>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Classe</label>
              <input
                type="text"
                value={formData.classe}
                onChange={(e) => setFormData({...formData, classe: e.target.value})}
                className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-cyan-100/50 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Nom de la classe"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Spécialité</label>
              <input
                type="text"
                value={formData.specialite}
                onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-cyan-100/50 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Spécialité"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Promotion</label>
              <input
                type="text"
                value={formData.promotion}
                onChange={(e) => setFormData({...formData, promotion: e.target.value})}
                className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-cyan-100/50 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Année de promotion"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Niveau</label>
              <select
                value={formData.niveau}
                onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                required
              >
                <option value="">Sélectionner un niveau</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Semestre</label>
              <select
                value={formData.semestre}
                onChange={(e) => setFormData({...formData, semestre: e.target.value})}
                className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                required
              >
                <option value="">Sélectionner un semestre</option>
                <option value="S1">Semestre 1</option>
                <option value="S2">Semestre 2</option>
                <option value="S3">Semestre 3</option>
                <option value="S4">Semestre 4</option>
                <option value="S5">Semestre 5</option>
                <option value="S6">Semestre 6</option>
              </select>
            </div>

            {/* 🔥 CORRECTION : Sélecteur de formateur avec état de chargement */}
            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Formateur assigné</label>
              {loadingFormateurs ? (
                <div className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100/50 text-center">
                  Chargement des formateurs...
                </div>
              ) : (
                <select
                  value={formData.formateurId}
                  onChange={(e) => setFormData({...formData, formateurId: e.target.value})}
                  className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="">Sélectionner un formateur</option>
                  {formateurs.length > 0 ? (
                    formateurs.map((formateur) => (
                      <option key={formateur.id} value={formateur.id}>
                        {formateur.firstName} {formateur.lastName} - {formateur.email}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Aucun formateur disponible</option>
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Date de début</label>
              <input
                type="date"
                value={formData.dateD}
                onChange={(e) => setFormData({...formData, dateD: e.target.value})}
                className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-100/70 text-sm mb-2">Date de fin</label>
              <input
                type="date"
                value={formData.dateF}
                onChange={(e) => setFormData({...formData, dateF: e.target.value})}
                className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-600/50 hover:bg-slate-500/50 border border-slate-500/30 rounded-xl text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300"
              >
                {editingSession ? 'Modifier' : 'Créer'} la Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des sessions avec affectation des formateurs */}
      <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-100/70">Chargement des sessions...</p>
          </div>
        ) : (
          (!Array.isArray(sessions) || sessions.length === 0) ? (
            <div className="p-8 text-center">
              <FaGraduationCap className="text-cyan-500/50 text-4xl mx-auto mb-4" />
              <p className="text-cyan-100/70">Aucune session créée pour le moment</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Créer la première session
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cyan-500/10 border-b border-cyan-500/20">
                    <th className="text-left p-4 text-cyan-300 font-semibold">Classe</th>
                    <th className="text-left p-4 text-cyan-300 font-semibold">Spécialité</th>
                    <th className="text-left p-4 text-cyan-300 font-semibold">Promotion</th>
                    <th className="text-left p-4 text-cyan-300 font-semibold">Niveau</th>
                    <th className="text-left p-4 text-cyan-300 font-semibold">Période</th>
                    <th className="text-left p-4 text-cyan-300 font-semibold">Formateur Assigné</th>
                    <th className="text-left p-4 text-cyan-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.idSession} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{session.classe}</div>
                        <div className="text-cyan-100/70 text-sm">{session.semestre}</div>
                      </td>
                      <td className="p-4 text-white">{session.specialite}</td>
                      <td className="p-4 text-white">{session.promotion}</td>
                      <td className="p-4">
                        <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                          {session.niveau}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-cyan-100/70">
                          <FaCalendar className="text-sm" />
                          <span className="text-sm">
                            {new Date(session.dateD).toLocaleDateString()} - {new Date(session.dateF).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {/* 🔥 CORRECTION : Affichage fiable des formateurs */}
                        {session.formateurs && session.formateurs.length > 0 ? (
                          <div className="space-y-2">
                            {session.formateurs.map((formateur) => (
                              <div key={formateur.id} className="flex items-center gap-2 bg-green-500/10 p-2 rounded-lg">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <FaUser className="text-green-400 text-xs" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-green-300 font-medium text-sm">
                                    {formateur.firstName} {formateur.lastName}
                                  </div>
                                  <div className="text-cyan-100/50 text-xs">{formateur.email}</div>
                                </div>
                                <button
                                  onClick={() => handleRetirerFormateur(session.idSession, formateur.id!)}
                                  className="p-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-300 hover:text-red-200 transition-colors text-xs"
                                  title="Retirer le formateur"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <select
                            onChange={(e) => {
                              const formateurId = parseInt(e.target.value);
                              if (formateurId) {
                                handleAffecterFormateur(session.idSession, formateurId);
                                // Réinitialiser la sélection
                                e.target.value = '';
                              }
                            }}
                            className="w-full bg-slate-700/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                            value=""
                          >
                            <option value="">Affecter un formateur</option>
                            {formateurs.map((formateur) => (
                              <option key={formateur.id} value={formateur.id}>
                                {formateur.firstName} {formateur.lastName}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(session)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors"
                            title="Modifier"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.idSession)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors"
                            title="Supprimer"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};