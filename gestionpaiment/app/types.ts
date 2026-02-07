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
  formateurs: User[]; // Tableau de formateurs
  
  // Propriétés calculées pour l'affichage
  formateurId?: number;
  formateurNom?: string;
  formateurEmail?: string;
  formateurAssigne?: boolean;
}
export interface Formateur {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateCIN = (cin: string): boolean => {
  return /^[0-9]{8}$/.test(cin);
};

export const validateRIB = (rib: string): boolean => {
  return /^[0-9]{20}$/.test(rib);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const bankNames = [
  'Banque Centrale de Tunisie',
  'Banque de Tunisie',
  'Société Tunisienne de Banque',
  'Banque Nationale Agricole',
  'Banque de l\'Habitat',
  'Banque Internationale Arabe de Tunisie',
  'Amen Bank',
  'Union Internationale de Banques',
  'Arab Tunisian Bank',
  'Banque de Tunisie et des Emirats',
  'Attijari Bank',
  'Banque de Financement des Petites et Moyennes Entreprises',
  'Banque Tuniso-Koweitienne',
  'Tunisian Saudi Bank',
  'Banque de Tunisie et des Emirats',
  'Banque Tuniso-Libyenne',
  'Banque Zitouna',
  'Al Baraka Bank',
  'Banque de Développement Local',
  'Banque Tuniso-Qatari'
];