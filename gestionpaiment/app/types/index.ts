export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  cin?: string;
  rib?: string;
  bankName?: string;
  fonctionnalite?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  firstLogin?: boolean;
}

export interface ApiError {
  message: string;
  code?: number;
}

export interface FloatingEmoji {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: string;
}
export interface Session {
  idSession: number;
  classe: string;
  specialite: string;
  promotion: string;
  niveau: string;
  semestre: string;
  dateD: string;
  dateF: string;
  formateurs?: Formateur[];
  formateurAssigne?: boolean; // Pour le formateur connecté
}

export interface Formateur {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
