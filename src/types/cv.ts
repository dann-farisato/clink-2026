export interface CVSection {
  content: string;
  aiGenerated: boolean;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  aiGenerated: boolean;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string[];
}

export interface CustomSection {
  id: string;
  heading: string;
  content: string;
}

export interface CVSections {
  summary: CVSection;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  custom: CustomSection[];
}

export interface CVSettings {
  theme: string;
  font: string;
  colorAccent: string;
}

export interface CV {
  id: string;
  title: string;
  slug: string;
  templateId: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  sections: CVSections;
  settings: CVSettings;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
}
