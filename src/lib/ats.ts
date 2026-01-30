import type { ResumeData } from "../types";

const STOP = new Set([
  "a","an","the","and","or","to","of","in","for","with","on","at","by","from","as","is","are","was","were","be",
  "this","that","it","you","your","we","our","they","their","will","can","should"
]);

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(w => w.length >= 3)
    .filter(w => !STOP.has(w));
}

export function extractKeywords(jobDescription: string): string[] {
  const words = tokenize(jobDescription);
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

  return [...freq.entries()]
    .sort((a,b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 20);
}

export function resumeText(resume: ResumeData): string {
  const parts: string[] = [];
  const c = resume.contact;
  parts.push(c.name, c.title, c.email, c.phone, c.location, ...(c.links || []));
  parts.push(resume.summary);
  parts.push(resume.skills.join(" "));
  for (const e of resume.experience) {
    parts.push(e.company, e.role, e.start, e.end, e.location || "", e.bullets.join(" "));
  }
  for (const ed of resume.education) {
    parts.push(ed.school, ed.degree, ed.start, ed.end, ed.details || "");
  }
  return parts.join(" ");
}

export function missingKeywords(resume: ResumeData, jd: string): string[] {
  const keys = extractKeywords(jd);
  const text = resumeText(resume).toLowerCase();
  return keys.filter(k => !text.includes(k.toLowerCase()));
}

export function atsScore(resume: ResumeData, jd: string) {
  let score = 100;
  const issues: string[] = [];

  if (!resume.contact.name.trim()) { score -= 15; issues.push("Add your full name."); }
  if (!resume.contact.email.trim()) { score -= 10; issues.push("Add email."); }
  if (!resume.contact.phone.trim()) { score -= 8; issues.push("Add phone."); }
  if (!resume.summary.trim()) { score -= 10; issues.push("Add a short professional summary."); }
  if (resume.skills.length < 6) { score -= 8; issues.push("Add more skills (6+ recommended)."); }
  if (resume.experience.length === 0) { score -= 20; issues.push("Add at least one Experience item."); }

  const totalBullets = resume.experience.reduce((n, e) => n + e.bullets.filter(b => b.trim()).length, 0);
  if (totalBullets < 5) { score -= 10; issues.push("Add more accomplishment bullets (5+ recommended)."); }

  if (jd.trim()) {
    const miss = missingKeywords(resume, jd);
    if (miss.length > 0) {
      score -= Math.min(25, miss.length);
      issues.push(`Missing important keywords: ${miss.slice(0, 8).join(", ")}${miss.length > 8 ? "…" : ""}`);
    }
  }

  score = Math.max(0, Math.min(100, score));
  return { score, issues };
}

export function generateResumeFromJD(jd: string, resume: ResumeData): ResumeData {
  const keys = extractKeywords(jd).slice(0, 12);

  // Build suggested skills: merge existing skills with top JD keywords
  const suggestedSkills = Array.from(new Set<string>([...keys.filter(k => k.length >= 3).map(k => k.replace(/[^a-z0-9+.#-]/gi, '')), ...resume.skills])).slice(0, 20);

  // Take up to two meaningful sentences from the existing summary to preserve user's voice
  const existingSentences = (resume.summary || '').split(/[\.\n]+/).map(s => s.trim()).filter(Boolean);
  const preserved = existingSentences.slice(0, 2).join('. ');

  // Build a short summary using top keywords and preserved user sentences
  const top = keys.slice(0, 6).filter(Boolean);
  const generatedPart = top.length
    ? `Experienced ${resume.contact.title || 'professional'} with expertise in ${suggestedSkills.slice(0, 6).join(', ')} and working knowledge of ${top.join(', ')}.`
    : `Experienced ${resume.contact.title || 'professional'} with a strong background in ${suggestedSkills.slice(0, 6).join(', ')}.`;

  const summary = preserved
    ? `${generatedPart} Previously: ${preserved}.`
    : `${generatedPart}`;

  // Enhance experience bullets by injecting relevant keywords (non-destructive: keep existing bullets and add suggestions)
  const enhancedExperience = resume.experience.map((e, idx) => {
    const addCount = Math.min(3, Math.max(1, Math.floor(keys.length / (idx + 2))));
    const suggestions: string[] = [];
    for (let i = 0; i < addCount; i++) {
      const k = keys[i % keys.length];
      suggestions.push(`Worked on ${k} related initiatives, applying ${suggestedSkills[0] || 'relevant technologies'} to achieve impactful outcomes.`);
    }
    // Keep original bullets and append suggestions (avoid duplicates)
    const existing = (e.bullets || []).filter(Boolean);
    const merged = Array.from(new Set([...suggestions, ...existing]));
    return { ...e, bullets: merged };
  });

  // Return an updated resume object
  return {
    ...resume,
    summary,
    skills: suggestedSkills,
    experience: enhancedExperience
  };
}

export function generateSuggestionsFromJD(jd: string, resume: ResumeData) {
  const keys = extractKeywords(jd).slice(0, 12);
  const miss = missingKeywords(resume, jd).slice(0, 12);

  const suggestions: { id: string; type: 'skill' | 'summary' | 'bullet'; text: string }[] = [];

  // Skill suggestions: suggest top missing keywords as skills
  for (const k of miss.slice(0, 6)) {
    suggestions.push({ id: `skill:${k}`, type: 'skill', text: k });
  }

  // Summary suggestions: craft 2 short phrased summary lines using top keys
  if (keys.length > 0) {
    const top3 = keys.slice(0, 3).join(', ');
    suggestions.push({ id: `summary:top`, type: 'summary', text: `Highlight experience with ${top3} in your summary.` });
  }

  // Bullet suggestions: for each top keyword, give a ready-to-use accomplishment bullet
  for (const k of keys.slice(0, 8)) {
    const text = `Worked on ${k} related initiatives, leveraging ${k} to deliver measurable improvements.`;
    suggestions.push({ id: `bullet:${k}`, type: 'bullet', text });
  }

  // Deduplicate by text
  const seen = new Set<string>();
  return suggestions.filter(s => {
    if (seen.has(s.text)) return false;
    seen.add(s.text);
    return true;
  });
}

export type Suggestion = { id: string; type: 'skill' | 'summary' | 'bullet'; text: string };

export function dedupeResume(resume: ResumeData): ResumeData {
  // Deduplicate skills (case-insensitive, preserve order)
  const seenSkills = new Set<string>();
  const skills = (resume.skills || []).filter(s => {
    const k = s.trim().toLowerCase();
    if (!k) return false;
    if (seenSkills.has(k)) return false;
    seenSkills.add(k);
    return true;
  });

  // Deduplicate bullets within each experience (preserve order)
  const experience = (resume.experience || []).map(e => {
    const seen = new Set<string>();
    const bullets = (e.bullets || []).filter(b => {
      const tb = b.trim();
      if (!tb) return false;
      if (seen.has(tb)) return false;
      seen.add(tb);
      return true;
    });
    return { ...e, bullets };
  });

  return { ...resume, skills, experience };
}
