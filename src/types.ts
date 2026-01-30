export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  location?: string;
  bullets: string[];
};

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  details?: string;
};

export type ResumeData = {
  contact: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
};

export type TemplateId = "classic" | "modern";
