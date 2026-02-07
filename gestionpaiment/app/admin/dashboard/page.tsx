'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaHome, FaCreditCard, FaUniversity, FaIdCard,
  FaBell, FaCog, FaHistory, FaTasks, FaSchool, FaUserCheck,
  FaChalkboardTeacher, FaUsers
} from 'react-icons/fa';
import { useAuth } from '@/app/hooks/useAuth';
import { apiService } from '@/app/services/api';
import { User, Session } from '@/app/types';
import { ProfileMenu } from '@/app/components/features/dashboard/ProfileMenu';
import { EditProfileForm } from '@/app/components/features/dashboard/EditProfileForm';
import { SessionManager } from '@/app/components/features/sessions/SessionManager';
import { SessionFormateur } from '@/app/components/features/sessions/SessionFormateur';
import { useRouter } from "next/navigation";   

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  const [authChecking, setAuthChecking] = useState(true);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showSessionFormateur, setShowSessionFormateur] = useState(false);

  // 🔥 NOUVEAU : État pour les sessions du formateur
  const [mesSessions, setMesSessions] = useState<Session[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiService.checkAuth();

        if (!res.authenticated) {
          return router.push("/login");
        }

        setAuthChecking(false);

      } catch (e) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const [userData, setUserData] = useState<User>({
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    roles: [],
    cin: '',
    rib: '',
    bankName: '',
    fonctionnalite: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cinModified, setCinModified] = useState(false);
  const [nameModified, setNameModified] = useState(false);
  const [fonctionnalites, setFonctionnalites] = useState<{[key: string]: string}>({});

  // Déterminer les rôles
  const isFormateur = authUser?.roles?.some(
    (role: string) => role.includes("FORMATEUR")
  );

  const isCoordinateur = authUser?.roles?.some(
    (role: string) => role.includes("COORDINATEUR") || role.includes("ADMIN")
  );

  const isAdministrateur = authUser?.roles?.some(
    (role: string) => role.includes("ADMIN")
  );

  useEffect(() => {
    loadUserData();
  }, []);

  // 🔥 NOUVEAU : Charger les sessions du formateur
  useEffect(() => {
    if (authUser && isFormateur) {
      loadMesSessions();
    }
  }, [authUser, isFormateur]);

  useEffect(() => {
    if (isEditing) setShowProfileMenu(false);
  }, [isEditing]);

  const loadUserData = async () => {
    try {
      setError('');
      setLoading(true);

      const profileData = await apiService.getUserProfile();

      const userIsCoordinateur = profileData.roles?.some(
        (role: string) => role.includes("COORDINATEUR") || role.includes("ADMIN")
      );

      let fonctionnalitesData = {};
      if (userIsCoordinateur) {
        try {
          fonctionnalitesData = await apiService.getFonctionnalites();
          if (!fonctionnalitesData || typeof fonctionnalitesData !== "object") {
            fonctionnalitesData = getFonctionnalitesParDefaut();
          }
        } catch {
          fonctionnalitesData = getFonctionnalitesParDefaut();
        }
      }

      setUserData(profileData);
      setFonctionnalites(fonctionnalitesData);

      if (profileData.cin) setCinModified(true);
      if (profileData.firstName && profileData.lastName) setNameModified(true);

    } catch (error: any) {
      setError(`Erreur de chargement: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NOUVEAU : Fonction pour charger les sessions du formateur
  const loadMesSessions = async () => {
    if (authUser && isFormateur) {
      try {
        const sessionsData = await apiService.getSessionsByFormateur(authUser.id);
        setMesSessions(sessionsData);
      } catch (error) {
        console.error('Erreur chargement sessions formateur:', error);
        setMesSessions([]);
      }
    }
  };

  const getFonctionnalitesParDefaut = () => ({
    'GESTION_FORMATEURS': 'Gestion des formateurs',
    'SUIVI_FORMATIONS': 'Suivi des formations',
    'VALIDATION_DOSSIERS': 'Validation des dossiers',
    'RAPPORTS_STATISTIQUES': 'Rapports statistiques',
    'GESTION_UTILISATEURS': 'Gestion des utilisateurs',
  });

  const handleSaveProfile = async (updatedData: User) => {
    try {
      await apiService.updateUserProfile(updatedData);
      setUserData(updatedData);
      setCinModified(true);
      setNameModified(true);
      setSuccess("Profil mis à jour avec succès !");
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Obtenir le rôle affichable
  const getDisplayRole = () => {
    if (isAdministrateur) return 'Administrateur';
    if (isCoordinateur) return 'Coordinateur';
    if (isFormateur) return 'Formateur';
    return 'Utilisateur';
  };

  // Obtenir la couleur du rôle
  const getRoleColor = () => {
    if (isAdministrateur) return 'from-red-500 to-pink-500';
    if (isCoordinateur) return 'from-blue-500 to-cyan-500';
    if (isFormateur) return 'from-green-500 to-teal-500';
    return 'from-cyan-500 to-purple-500';
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-light">Vérification de sécurité...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-light">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-cyan-500/20 p-6 relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor()} rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25`}>
              {isAdministrateur && <FaUsers className="text-white text-xl" />}
              {isCoordinateur && !isAdministrateur && <FaSchool className="text-white text-xl" />}
              {isFormateur && !isCoordinateur && <FaChalkboardTeacher className="text-white text-xl" />}
              {!isFormateur && !isCoordinateur && <FaHome className="text-white text-xl" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Tableau de Bord
              </h1>
              <p className="text-cyan-100/70 text-sm">Espace {getDisplayRole()} - Gestion de votre espace personnel</p>
            </div>
          </div>

          {/* Bouton profil */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="profile-button flex items-center gap-3 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-3 rounded-2xl transition-all duration-300 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-400/50"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center shadow-lg`}>
                <FaUser className="text-white text-sm" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm text-white">{userData.firstName} {userData.lastName}</p>
                <p className="text-cyan-300 text-xs">
                  {getDisplayRole()}
                </p>
              </div>
            </button>

            <ProfileMenu
              user={userData}
              isOpen={showProfileMenu}
              onClose={() => setShowProfileMenu(false)}
              onEdit={() => setIsEditing(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto p-6 relative z-10">
        {/* Messages d'erreur/succès */}
        {error && (
          <div className="mb-6 bg-red-500/10 backdrop-blur-lg border border-red-500/30 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-300 mb-1">Erreur</h3>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-300 hover:text-red-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-1">Succès</h3>
                  <p className="text-green-200 text-sm">{success}</p>
                </div>
              </div>
              <button 
                onClick={() => setSuccess('')}
                className="text-green-300 hover:text-green-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Formulaire d'édition */}
        {isEditing && (
          <EditProfileForm
            userData={userData}
            fonctionnalites={fonctionnalites}
            isCoordinateur={!!isCoordinateur}
            cinModified={cinModified}
            nameModified={nameModified}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        )}

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte de bienvenue */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/60 to-purple-900/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-400/40 transition-all duration-500 group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 bg-gradient-to-r ${getRoleColor()} rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 group-hover:shadow-cyan-500/40 transition-all duration-500`}>
                  {isAdministrateur && <FaUsers className="text-white text-2xl" />}
                  {isCoordinateur && !isAdministrateur && <FaSchool className="text-white text-2xl" />}
                  {isFormateur && !isAdministrateur && <FaChalkboardTeacher className="text-white text-2xl" />}
                  {!isFormateur && !isCoordinateur && <FaUser className="text-white text-2xl" />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    Bonjour, {userData.firstName} !
                  </h2>
                  <p className="text-cyan-100/70 text-lg">
                    Bienvenue dans votre espace {getDisplayRole().toLowerCase()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isAdministrateur ? 'bg-red-500/20 text-red-300' :
                      isCoordinateur ? 'bg-blue-500/20 text-blue-300' :
                      isFormateur ? 'bg-green-500/20 text-green-300' :
                      'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {getDisplayRole()}
                    </span>
                    {userData.roles?.map((role, index) => (
                      <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                        {role.replace('ROLE_', '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistiques avec actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-green-500/20">
                <div className="text-green-400 text-2xl font-bold mb-1">
                  {userData.cin ? '✅' : '❌'}
                </div>
                <div className="text-cyan-100/60 text-sm">CIN</div>
                {!userData.cin && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-green-400 hover:text-green-300 text-xs mt-1"
                  >
                    Renseigner
                  </button>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-purple-500/20">
                <div className="text-purple-400 text-2xl font-bold mb-1">
                  {userData.rib ? '✅' : '❌'}
                </div>
                <div className="text-cyan-100/60 text-sm">RIB</div>
                {!userData.rib && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-purple-400 hover:text-purple-300 text-xs mt-1"
                  >
                    Renseigner
                  </button>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-cyan-500/20">
                <div className="text-cyan-400 text-2xl font-bold mb-1">
                  {userData.bankName ? '🏦' : '❌'}
                </div>
                <div className="text-cyan-100/60 text-sm">Banque</div>
                {!userData.bankName && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs mt-1"
                  >
                    Renseigner
                  </button>
                )}
              </div>
              
              {/* Actions selon le rôle */}
              {isFormateur && (
                <div 
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-teal-500/20 cursor-pointer"
                  onClick={() => setShowSessionFormateur(!showSessionFormateur)}
                >
                  <div className="text-teal-400 text-2xl font-bold mb-1">
                    <FaUserCheck />
                  </div>
                  <div className="text-cyan-100/60 text-sm">Mes Sessions</div>
                  <div className="text-teal-400 hover:text-teal-300 text-xs mt-1">
                    {showSessionFormateur ? 'Masquer' : 'Afficher'}
                  </div>
                </div>
              )}
              
              {isCoordinateur && (
                <div 
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-blue-500/20 cursor-pointer"
                  onClick={() => setShowSessionManager(!showSessionManager)}
                >
                  <div className="text-blue-400 text-2xl font-bold mb-1">
                    <FaSchool />
                  </div>
                  <div className="text-cyan-100/60 text-sm">Sessions</div>
                  <div className="text-blue-400 hover:text-blue-300 text-xs mt-1">
                    {showSessionManager ? 'Masquer' : 'Gérer'}
                  </div>
                </div>
              )}

              {isAdministrateur && (
                <div 
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-red-500/20 cursor-pointer"
                  onClick={() => {/* Naviguer vers admin */}}
                >
                  <div className="text-red-400 text-2xl font-bold mb-1">
                    <FaUsers />
                  </div>
                  <div className="text-cyan-100/60 text-sm">Administration</div>
                  <div className="text-red-400 hover:text-red-300 text-xs mt-1">
                    Gérer
                  </div>
                </div>
              )}
            </div>

            {/* Message de bienvenue personnalisé */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                {isAdministrateur && '👑 Espace Administrateur'}
                {isCoordinateur && !isAdministrateur && '🎯 Espace Coordinateur'}
                {isFormateur && !isCoordinateur && '📚 Espace Formateur'}
                {!isFormateur && !isCoordinateur && '👤 Espace Personnel'}
              </h3>
              <p className="text-cyan-100/70">
                {isAdministrateur && 'Vous avez un accès complet à toutes les fonctionnalités du système.'}
                {isCoordinateur && !isAdministrateur && 'Vous pouvez gérer les sessions de formation et les formateurs.'}
                {isFormateur && !isCoordinateur && 'Vous pouvez consulter et rejoindre les sessions de formation.'}
                {!isFormateur && !isCoordinateur && 'Consultez et mettez à jour vos informations personnelles.'}
              </p>
            </div>
          </div>

          {/* Carte COORDONNÉES avec fonctionnalité */}
          <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaCreditCard className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-semibold text-cyan-300">Coordonnées</h3>
            </div>

            {/* Coordonnées bancaires */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5">
                <FaIdCard className="text-cyan-400 text-lg" />
                <div className="flex-1">
                  <p className="text-cyan-100/60 text-sm">
                    CIN {cinModified && <span className="text-green-400 text-xs">(Verrouillé)</span>}
                  </p>
                  <p className="font-semibold text-white">{userData.cin || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5">
                <FaCreditCard className="text-cyan-400 text-lg" />
                <div className="flex-1">
                  <p className="text-cyan-100/60 text-sm">RIB</p>
                  <p className="font-semibold text-white">{userData.rib || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5">
                <FaUniversity className="text-cyan-400 text-lg" />
                <div className="flex-1">
                  <p className="text-cyan-100/60 text-sm">Banque</p>
                  <p className="font-semibold text-white">{userData.bankName || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            {/* Fonctionnalité et boutons d'action */}
            <div className="pt-4 border-t border-cyan-500/20 space-y-4">
              {/* Fonctionnalité pour coordinateur */}
              {(isCoordinateur || isAdministrateur) && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaTasks className="text-orange-400 text-lg" />
                    <h4 className="text-lg font-semibold text-orange-300">Fonctionnalité</h4>
                  </div>
                  
                  {userData.fonctionnalite ? (
                    <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-xl p-4">
                      <p className="text-orange-300 font-semibold text-center">{userData.fonctionnalite}</p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-500/30 rounded-xl p-4 text-center">
                      <p className="text-cyan-100/60 mb-2">Aucune fonctionnalité définie</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                      >
                        Définir votre fonctionnalité
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons d'action selon le rôle */}
              <div className="space-y-3">
                {/* Bouton pour formateur */}
                {isFormateur && (
                  <button
                    onClick={() => setShowSessionFormateur(!showSessionFormateur)}
                    className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 py-3 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaUserCheck className="text-sm" />
                    {showSessionFormateur ? 'Masquer Mes Sessions' : 'Voir Mes Sessions'}
                  </button>
                )}

                {/* Bouton pour coordinateur */}
                {isCoordinateur && (
                  <button
                    onClick={() => setShowSessionManager(!showSessionManager)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-3 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaSchool className="text-sm" />
                    {showSessionManager ? 'Masquer Gestion' : 'Gérer les Sessions'}
                  </button>
                )}

                {/* Bouton pour administrateur */}
                {isAdministrateur && (
                  <>
                    <button
                      onClick={() => setShowSessionManager(!showSessionManager)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-3 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaSchool className="text-sm" />
                      {showSessionManager ? 'Masquer Sessions' : 'Gérer Sessions'}
                    </button>
                    <button
                      onClick={() => {/* Navigation admin */}}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-3 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaUsers className="text-sm" />
                      Administration
                    </button>
                  </>
                )}

                {/* Bouton d'édition du profil pour tous */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 py-3 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaUser className="text-sm" />
                  Modifier le Profil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 NOUVEAU : Section Mes Sessions Affectées pour Formateur */}
        {isFormateur && mesSessions.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-green-900/40 to-slate-800/60 backdrop-blur-lg border border-green-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center gap-3">
              <FaUserCheck className="text-green-400" />
              Mes Sessions Affectées ({mesSessions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mesSessions.map(session => (
                <div key={session.idSession} className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="font-semibold text-white text-lg mb-2">{session.classe}</h4>
                  <p className="text-green-300 text-sm mb-1">{session.specialite}</p>
                  <p className="text-cyan-100/70 text-sm mb-2">
                    {session.niveau} • {session.semestre}
                  </p>
                  <p className="text-cyan-100/50 text-xs">
                    {new Date(session.dateD).toLocaleDateString()} - {new Date(session.dateF).toLocaleDateString()}
                  </p>
                  <div className="mt-3 bg-green-500/20 rounded-lg p-2 text-center">
                    <span className="text-green-300 text-xs font-medium">
                      ✅ Affectée par coordinateur
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gestionnaire de sessions pour coordinateur/administrateur */}
        {(isCoordinateur || isAdministrateur) && (
          <SessionManager isVisible={showSessionManager} />
        )}

        {/* Gestionnaire de sessions pour formateur */}
        {isFormateur && (
          <SessionFormateur isVisible={showSessionFormateur} />
        )}

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gradient-to-br from-cyan-900/40 to-slate-800/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 text-center hover:border-cyan-400/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/30 transition-all duration-300">
              <FaBell className="text-cyan-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-cyan-300 mb-2">Notifications</h3>
            <p className="text-3xl font-bold text-white mb-1">0</p>
            <p className="text-cyan-100/60 text-sm">Aucune notification</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-slate-800/60 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-6 text-center hover:border-purple-400/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-all duration-300">
              <FaCog className="text-purple-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Paramètres</h3>
            <p className="text-3xl font-bold text-white mb-1">3</p>
            <p className="text-cyan-100/60 text-sm">Options disponibles</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-slate-800/60 backdrop-blur-lg border border-green-500/20 rounded-2xl p-6 text-center hover:border-green-400/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-all duration-300">
              <FaHistory className="text-green-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-green-300 mb-2">Activité</h3>
            <p className="text-3xl font-bold text-white mb-1">
              {isAdministrateur && '∞'}
              {isCoordinateur && !isAdministrateur && '12'}
              {isFormateur && !isCoordinateur && '8'}
              {!isFormateur && !isCoordinateur && '3'}
            </p>
            <p className="text-cyan-100/60 text-sm">
              {isAdministrateur && 'Actions illimitées'}
              {isCoordinateur && !isAdministrateur && 'Actions ce mois'}
              {isFormateur && !isCoordinateur && 'Sessions suivies'}
              {!isFormateur && !isCoordinateur && 'Actions ce mois'}
            </p>
          </div>
        </div>

        {/* Section informations supplémentaires */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Informations de contact</h3>
            <div className="space-y-3">
              <div>
                <p className="text-cyan-100/60 text-sm">Email</p>
                <p className="text-white font-medium">{userData.email}</p>
              </div>
              <div>
                <p className="text-cyan-100/60 text-sm">Nom complet</p>
                <p className="text-white font-medium">{userData.firstName} {userData.lastName}</p>
              </div>
              <div>
                <p className="text-cyan-100/60 text-sm">Rôles</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userData.roles?.map((role, index) => (
                    <span key={index} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs">
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/60 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Statut du compte</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-cyan-100/60">Profil complété</span>
                <span className={`font-semibold ${
                  userData.cin && userData.rib && userData.bankName ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {userData.cin && userData.rib && userData.bankName ? '100%' : 'En cours'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyan-100/60">Statut</span>
                <span className="text-green-400 font-semibold">Actif</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyan-100/60">Dernière connexion</span>
                <span className="text-white font-medium">Aujourd'hui</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyan-100/60">Membre depuis</span>
                <span className="text-white font-medium">2024</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/80 backdrop-blur-lg border-t border-cyan-500/20 p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-cyan-100/60 text-sm">
            © 2025 Espace {getDisplayRole()} - Système de Gestion de Formation
          </p>
          <p className="text-cyan-100/40 text-xs mt-1">
            Connecté en tant que {userData.firstName} {userData.lastName} ({getDisplayRole()})
          </p>
        </div>
      </footer>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}