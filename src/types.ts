export type TabType = 'home' | 'about' | 'works';

export type Language = 'zh' | 'en';

export type WorkCategory = 'all' | 'branding' | 'type' | 'packaging' | 'exhibition';

export interface Project {
  id: string;
  cardNumber: string; // e.g. "A♠", "2♦", "3♣", "4♥", "5♠", etc.
  suit: 'spade' | 'heart' | 'diamond' | 'club';
  title: string;
  subtitle: string;
  category: WorkCategory;
  categoryLabel: string;
  year: string;
  index: string; // e.g. "01/16"
  client: string;
  coverImage: string;
  galleryImages: string[];
  summary: string;
  description: string[];
  tags: string[];
  colorPalette: string[];
  featured?: boolean;
  likes?: number;
}

export interface FloatingItem {
  id: string;
  type: 'card' | 'sketch' | 'dice' | 'vinyl' | 'tag' | 'envelope' | 'badge' | 'photo';
  title: string;
  subtitle?: string;
  image?: string;
  x: number; // percentage offset
  y: number; // percentage offset
  rotation: number;
  scale: number;
  zIndex: number;
  projectId?: string;
  customContent?: string;
}

export interface ExperienceItem {
  year: string;
  role: string;
  company: string;
  location: string;
  description: string;
  highlights: string[];
}

export interface EducationItem {
  year: string;
  degree: string;
  school: string;
  location: string;
  description?: string;
}

export interface AwardItem {
  year: string;
  title: string;
  organization: string;
  category: string;
}
