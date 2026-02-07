// CORRECTION COMPLÈTE du fichier api.ts
import { User, AuthResponse } from '@/app/types';
import { Session } from '@/app/types';

const API_BASE_URL = 'http://localhost:8082/api';

class ApiService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = responseText;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // si ce n'est pas du JSON, on garde le texte tel quel
      }
      throw new Error(errorMessage);
    }

    if (!responseText || !contentType?.includes('application/json')) {
      return responseText || null;
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  }

  // ===========================================================
  // 🔐 AUTH
  // ===========================================================
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.fetchWithAuth('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any): Promise<AuthResponse> {
    return this.fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    return this.fetchWithAuth('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resendCode(email: string): Promise<void> {
    return this.fetchWithAuth('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async checkAuth(): Promise<{ authenticated: boolean; id?: number; email?: string; roles?: string[] }> {
    try {
      return await this.fetchWithAuth('/auth/check-auth', {
        method: 'GET',
      });
    } catch (e) {
      return { authenticated: false };
    }
  }

  async logout(): Promise<void> {
    await this.fetchWithAuth('/auth/logout', { method: 'POST' });
  }

  // ===========================================================
  // 👤 USER PROFILE
  // ===========================================================
  async getUserProfile(): Promise<User> {
    return this.fetchWithAuth('/user/profile');
  }

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    return this.fetchWithAuth('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getFonctionnalites(): Promise<{ [key: string]: string }> {
    return this.fetchWithAuth('/user/fonctionnalites');
  }

  // ===========================================================
  // 🛡️ ADMIN
  // ===========================================================
  async getUsers(): Promise<User[]> {
    return this.fetchWithAuth('/admin/users');
  }

  async getFormateurs(): Promise<User[]> {
    try {
      console.log('🔄 Appel API: /admin/formateurs');
      const response = await this.fetchWithAuth('/admin/formateurs');
      
      console.log('📋 Réponse formateurs:', {
        type: typeof response,
        isArray: Array.isArray(response),
        data: response
      });
      
      const formateursArray = Array.isArray(response) ? response : [];
      console.log(`👨‍🏫 ${formateursArray.length} formateurs trouvés`);
      
      return formateursArray;
    } catch (error: any) {
      console.error('❌ Erreur récupération formateurs:', error);
      return [];
    }
  }

  async getCoordinateurs(): Promise<User[]> {
    return this.fetchWithAuth('/admin/coordinateurs');
  }

  async deleteUser(userId: number): Promise<void> {
    console.log(`🗑️ Suppression utilisateur ID: ${userId}`);
    try {
      await this.fetchWithAuth(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      console.log(`✅ Utilisateur ${userId} supprimé avec succès`);
    } catch (error) {
      console.error(`❌ Erreur suppression utilisateur ${userId}:`, error);
      throw error;
    }
  }

  // ===========================================================
  // 👨‍🏫 SESSIONS FORMATEUR
  // ===========================================================
  async getSessions(): Promise<Session[]> {
    try {
      const response = await this.fetchWithAuth('/sessions');
      console.log('📋 Sessions reçues:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      return [];
    }
  }

  async assignerFormateur(sessionId: number, formateurId: number): Promise<Session> {
    console.log(`🎯 Assigner formateur ${formateurId} à session ${sessionId}`);
    return this.fetchWithAuth(`/sessions/${sessionId}/assign-formateur/${formateurId}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async retirerFormateur(sessionId: number, formateurId: number): Promise<Session> {
    console.log(`🗑️ Retirer formateur ${formateurId} de session ${sessionId}`);
    return this.fetchWithAuth(`/sessions/${sessionId}/retirer/${formateurId}`, {
      method: 'DELETE',
    });
  }

  async isFormateurInSession(sessionId: number, formateurId: number): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`/sessions/${sessionId}/check-formateur/${formateurId}`);
      return response === true || response === 'true';
    } catch (error) {
      console.warn(`Endpoint /sessions/${sessionId}/check-formateur/${formateurId} non disponible, retour false par défaut`);
      return false;
    }
  }

  // ===========================================================
  // 📚 SESSIONS (méthodes pour coordinateur)
  // ===========================================================
  async getSessionById(id: number): Promise<Session> {
    return this.fetchWithAuth(`/sessions/${id}`);
  }

  async createSession(sessionData: any): Promise<Session> {
    return this.fetchWithAuth('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(id: number, sessionData: Partial<Session>): Promise<Session> {
    return this.fetchWithAuth(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(id: number): Promise<void> {
    return this.fetchWithAuth(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================
  // 🔥 Sessions par formateur
  // ===========================================================
  async getSessionsByFormateur(formateurId: number): Promise<Session[]> {
    try {
      const response = await this.fetchWithAuth(`/sessions/formateur/${formateurId}`);
      console.log(`📋 Sessions pour formateur ${formateurId}:`, response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Erreur récupération sessions formateur:', error);
      return [];
    }
  }

  // ===========================================================
  // 🔥 Affectation formateur (pour coordinateur)
  // ===========================================================
  async affecterFormateurSession(sessionId: number, formateurId: number): Promise<void> {
    await this.fetchWithAuth(`/sessions/${sessionId}/affecter`, {
      method: 'POST',
      body: JSON.stringify({ formateurId })
    });
  }

  async retirerFormateurSession(sessionId: number): Promise<void> {
    await this.fetchWithAuth(`/sessions/${sessionId}/retirer`, {
      method: 'POST'
    });
  }
}

// ✅ EXPORT CORRECT
export const apiService = new ApiService();