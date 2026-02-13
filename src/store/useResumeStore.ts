import { create } from "zustand";
import { nanoid } from "nanoid";
import type { ResumeData, TemplateId } from "../types";

type State = {
  templateId: TemplateId;
  resume: ResumeData;
  jobDescription: string;
  lang: import('../i18n').Lang;
  setLanguage: (l: import('../i18n').Lang) => void;

  setTemplateId: (id: TemplateId) => void;
  setJobDescription: (s: string) => void;
  setResume: (r: ResumeData) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;

  updateContact: (patch: Partial<ResumeData["contact"]>) => void;
  setSummary: (s: string) => void;
  setSkills: (skills: string[]) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<any>) => void;
  removeExperience: (id: string) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<any>) => void;
  removeEducation: (id: string) => void;

  reset: () => void;
};

const LS_KEY = "ATS_RESUME_BUILDER_V1";

const defaultData: ResumeData = {
  contact: {
    name: "Mayank Gaur",
    title: "Senior Java Full-Stack Developer",
    email: "mayank@example.com",
    phone: "+91-XXXXXXXXXX",
    location: "Bengaluru, India",
    links: ["linkedin.com/in/yourprofile", "github.com/yourprofile"]
  },
  summary:
    "Full-Stack Developer with 15+ years of experience in Java, Spring Boot, Microservices, Kafka, React, SQL, and cloud (Azure/AWS). Strong in scalable APIs, modernization, CI/CD, and production support.",
  skills: ["Java", "Spring Boot", "Microservices", "Kafka", "React", "REST", "SQL", "Azure", "Docker", "Kubernetes"],
  experience: [
    {
      id: nanoid(),
      company: "Wipro",
      role: "Project Lead / Senior Full-Stack Developer",
      start: "2020",
      end: "Present",
      location: "Bengaluru",
      bullets: [
        "Built and modernized microservices using Spring Boot and REST APIs.",
        "Integrated Kafka for event-driven workflows and improved reliability.",
        "Deployed services on Kubernetes and improved performance through tuning."
      ]
    }
  ],
  education: [
    {
      id: nanoid(),
      school: "Your University",
      degree: "B.Tech / MCA / BE",
      start: "2005",
      end: "2009",
      details: "Computer Science / IT"
    }
  ]
};

function loadInitial(): { templateId: TemplateId; resume: ResumeData; jobDescription: string; lang: import('../i18n').Lang } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { templateId: "classic", resume: defaultData, jobDescription: "", lang: 'en' };
    const parsed = JSON.parse(raw);
    return {
      templateId: parsed.templateId ?? "classic",
      resume: parsed.resume ?? defaultData,
      jobDescription: parsed.jobDescription ?? "",
      lang: parsed.lang ?? 'en'
    };
  } catch {
    return { templateId: "classic", resume: defaultData, jobDescription: "", lang: 'en' };
  }
}

export const useResumeStore = create<State>((set, get) => {
  const init = loadInitial();

  const persist = () => {
    const s = get();
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ templateId: s.templateId, resume: s.resume, jobDescription: s.jobDescription, lang: s.lang })
    );
  };

  return {
    templateId: init.templateId,
    resume: init.resume,
    jobDescription: init.jobDescription,
    lang: init.lang,

    setTemplateId: (id) => {
      set({ templateId: id });
      persist();
    },

    setLanguage: (l) => {
      set({ lang: l });
      persist();
    },

    setJobDescription: (s) => {
      set({ jobDescription: s });
      persist();
    },

    setResume: (r) => {
      set({ resume: r });
      persist();
    },

    addSkill: (skill) => {
      set((st) => ({ resume: { ...st.resume, skills: Array.from(new Set([...(st.resume.skills || []), skill])) } }));
      persist();
    },

    removeSkill: (skill) => {
      set((st) => ({ resume: { ...st.resume, skills: (st.resume.skills || []).filter(s => s !== skill) } }));
      persist();
    },

    updateContact: (patch) => {
      set((st) => ({ resume: { ...st.resume, contact: { ...st.resume.contact, ...patch } } }));
      persist();
    },

    setSummary: (s) => {
      set((st) => ({ resume: { ...st.resume, summary: s } }));
      persist();
    },

    setSkills: (skills) => {
      set((st) => ({ resume: { ...st.resume, skills } }));
      persist();
    },

    addExperience: () => {
      set((st) => ({
        resume: {
          ...st.resume,
          experience: [
            ...st.resume.experience,
            { id: nanoid(), company: "", role: "", start: "", end: "", location: "", bullets: [""] }
          ]
        }
      }));
      persist();
    },

    updateExperience: (id, patch) => {
      set((st) => ({
        resume: {
          ...st.resume,
          experience: st.resume.experience.map((e) => (e.id === id ? { ...e, ...patch } : e))
        }
      }));
      persist();
    },

    removeExperience: (id) => {
      set((st) => ({ resume: { ...st.resume, experience: st.resume.experience.filter((e) => e.id !== id) } }));
      persist();
    },

    addEducation: () => {
      set((st) => ({
        resume: {
          ...st.resume,
          education: [...st.resume.education, { id: nanoid(), school: "", degree: "", start: "", end: "", details: "" }]
        }
      }));
      persist();
    },

    updateEducation: (id, patch) => {
      set((st) => ({
        resume: { ...st.resume, education: st.resume.education.map((ed) => (ed.id === id ? { ...ed, ...patch } : ed)) }
      }));
      persist();
    },

    removeEducation: (id) => {
      set((st) => ({ resume: { ...st.resume, education: st.resume.education.filter((e) => e.id !== id) } }));
      persist();
    },

    reset: () => {
      const emptyResume: ResumeData = {
        contact: { name: "", title: "", email: "", phone: "", location: "", links: [] },
        summary: "",
        skills: [],
        experience: [],
        education: []
      };
      set({ resume: emptyResume, jobDescription: "" });
      localStorage.removeItem(LS_KEY);
    }
  };
});
