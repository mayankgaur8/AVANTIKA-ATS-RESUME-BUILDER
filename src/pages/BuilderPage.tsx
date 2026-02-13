import { templates } from "../templates";
import { useResumeStore } from "../store/useResumeStore";
import { atsScore, missingKeywords, generateResumeFromJD, generateSuggestionsFromJD, Suggestion, dedupeResume } from "../lib/ats";
import { t, availableLangs } from "../i18n";
import { useState, useEffect, useRef } from "react";

export default function BuilderPage() {
  const {
    templateId,
    setTemplateId,
    resume,
    jobDescription,
    setJobDescription,
    updateContact,
    setSummary,
    setSkills,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
    reset
  } = useResumeStore();

  // Local input state for skills to avoid cursor reset when editing
  const [skillInput, setSkillInput] = useState(() => resume.skills.join(", "));
  const skillInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSkillInput(resume.skills.join(", "));
  }, [resume.skills]);

  const commitSkillsFromInput = (input: string) => {
    const parts = input.split(",").map(s => s.trim()).filter(Boolean);
    parts.forEach(p => addSkill(p));
  };

  const { score, issues } = atsScore(resume, jobDescription);
  const miss = jobDescription.trim() ? missingKeywords(resume, jobDescription) : [];
  const suggestions = jobDescription.trim() ? generateSuggestionsFromJD(jobDescription, resume) : [];
  const Template = templates[templateId].Component;

  const onExportPdf = () => {
    window.print();
  };

  return (
    <>
      <div className="topbar noPrint">
        <div className="container nav">
          <div className="brand">
            <div className="logo">
              <img src="/Avantika-CV-Builder.png" alt="Avantika CV Builder" />
            </div>
            <div>
              <div>CV Builder</div>
              <div className="badge">ATS-Friendly • No Sign-up</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Styled language picker */}
            <LangPicker />
          </div>

          <div className="actions">
            <button className="btn" onClick={reset} title="Reset all data">{t(useResumeStore.getState().lang, 'reset')}</button>
            <button className="btn btnPrimary" onClick={onExportPdf}>{t(useResumeStore.getState().lang, 'export_pdf')}</button>
          </div>
        </div>
      </div>

      <div className="page printRoot">
        <div className="container grid">
          <div className="panel noPrint">
            <div className="panelHeader">
              <div>
                <div className="h1">{t(useResumeStore.getState().lang, 'build_title')}</div>
                <div className="muted">{t(useResumeStore.getState().lang, 'build_subtitle')}</div>
              </div>

              <div className="row" style={{ minWidth: 200 }}>
                <select
                  className="select"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value as any)}
                  aria-label={t(useResumeStore.getState().lang, 'template_label')}
                >
                  {Object.entries(templates).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="panelBody">
              <div className="chips">
                <div className="chip">ATS Score: {score}/100</div>
                <div className="chip">Text Selectable PDF</div>
                <div className="chip">Local Save</div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => {
                    const s = useResumeStore.getState();
                    const newResume = generateResumeFromJD(s.jobDescription || '', s.resume);
                    s.setResume(newResume);
                  }}
                >{t(useResumeStore.getState().lang, 'generate_from_jd')}</button>

                <button className="btn btnPrimary" onClick={() => window.print()}>{t(useResumeStore.getState().lang, 'download_pdf')}</button>
              </div>

              <div className="label">ATS Fix Suggestions</div>
              <div className="panel" style={{ padding: 12, borderRadius: 14 }}>
                {suggestions.length === 0 ? (
                  <div className="muted">No suggestions — paste a job description to get tailored suggestions.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => {
                        const st = useResumeStore.getState();
                        const deduped = dedupeResume(st.resume);
                        st.setResume(deduped);
                      }}>Remove duplicates</button>
                    </div>
                    {suggestions.map((s: Suggestion) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700 }}>{s.type.toUpperCase()}</div>
                        <div style={{ flex: 1, marginLeft: 12 }}>{s.text}</div>
                        <div style={{ marginLeft: 12 }}>
                          <button className="btn" onClick={() => {
                            const st = useResumeStore.getState();
                            if (s.type === 'skill') st.addSkill(s.text);
                            else if (s.type === 'summary') st.setSummary(`${s.text} ${st.resume.summary}`);
                            else if (s.type === 'bullet') {
                              // add bullet to first experience item or create one
                              if (st.resume.experience.length === 0) st.addExperience();
                              const firstId = st.resume.experience[0].id;
                              st.updateExperience(firstId, { bullets: [...(st.resume.experience[0].bullets || []), s.text] });
                            }
                          }}>Add</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="hr" />

              <div className="label">Contact</div>
              <div className="row">
                <Field label="Name" value={resume.contact.name} onChange={(v) => updateContact({ name: v })} />
                <Field label="Title" value={resume.contact.title} onChange={(v) => updateContact({ title: v })} />
              </div>
              <div className="row">
                <Field label="Email" value={resume.contact.email} onChange={(v) => updateContact({ email: v })} />
                <Field label="Phone" value={resume.contact.phone} onChange={(v) => updateContact({ phone: v })} />
              </div>
              <div className="row">
                <Field label="Location" value={resume.contact.location} onChange={(v) => updateContact({ location: v })} />
              </div>

              <div className="label">Links (comma separated)</div>
              <input
                className="input"
                value={(resume.contact.links || []).join(", ")}
                onChange={(e) => updateContact({ links: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="linkedin.com/in/.., github.com/.."
              />

              <div className="hr" />

              <div className="label">Professional Summary</div>
              <textarea
                className="textarea"
                value={resume.summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="2–4 lines summary..."
              />

              <div className="hr" />

              <div className="label">Skills (comma separated)</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input
                  ref={el => skillInputRef.current = el}
                  className="input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      commitSkillsFromInput(skillInput);
                      setSkillInput('');
                    }
                  }}
                  onBlur={(e) => {
                    commitSkillsFromInput(e.currentTarget.value);
                    setSkillInput('');
                  }}
                  placeholder="Type a skill and press comma or Enter to add (e.g. Java, J2EE)"
                />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {resume.skills.map((s) => (
                  <div key={s} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span>{s}</span>
                    <button
                      aria-label={`Remove ${s}`}
                      title={`Remove ${s}`}
                      onClick={() => removeSkill(s)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontWeight: 900,
                        lineHeight: 1
                      }}
                    >×</button>
                  </div>
                ))}
              </div>

              <div className="hr" />

              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="h1">Experience</div>
                  <div className="muted">Use action verbs + impact numbers.</div>
                </div>
                <button className="btn btnPrimary" onClick={addExperience}>+ Add</button>
              </div>

              {resume.experience.map((e) => (
                <div key={e.id} className="panel" style={{ marginTop: 12 }}>
                  <div className="panelBody">
                    <div className="row">
                      <Field label="Company" value={e.company} onChange={(v) => updateExperience(e.id, { company: v })} />
                      <Field label="Role" value={e.role} onChange={(v) => updateExperience(e.id, { role: v })} />
                    </div>
                    <div className="row">
                      <Field label="Start" value={e.start} onChange={(v) => updateExperience(e.id, { start: v })} />
                      <Field label="End" value={e.end} onChange={(v) => updateExperience(e.id, { end: v })} />
                      <Field label="Location" value={e.location || ""} onChange={(v) => updateExperience(e.id, { location: v })} />
                    </div>

                    <div className="label">Bullets (one per line)</div>
                    <textarea
                      className="textarea"
                      value={(e.bullets || []).join("\n")}
                      onChange={(ev) => updateExperience(e.id, { bullets: ev.target.value.split("\n") })}
                      placeholder="• Built X to improve Y by Z%..."
                    />

                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      <button className="btn" onClick={() => removeExperience(e.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="hr" />

              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="h1">Education</div>
                  <div className="muted">Keep it simple and standard.</div>
                </div>
                <button className="btn btnPrimary" onClick={addEducation}>+ Add</button>
              </div>

              {resume.education.map((ed) => (
                <div key={ed.id} className="panel" style={{ marginTop: 12 }}>
                  <div className="panelBody">
                    <div className="row">
                      <Field label="School" value={ed.school} onChange={(v) => updateEducation(ed.id, { school: v })} />
                      <Field label="Degree" value={ed.degree} onChange={(v) => updateEducation(ed.id, { degree: v })} />
                    </div>
                    <div className="row">
                      <Field label="Start" value={ed.start} onChange={(v) => updateEducation(ed.id, { start: v })} />
                      <Field label="End" value={ed.end} onChange={(v) => updateEducation(ed.id, { end: v })} />
                    </div>

                    <div className="label">Details</div>
                    <input
                      className="input"
                      value={ed.details || ""}
                      onChange={(e) => updateEducation(ed.id, { details: e.target.value })}
                      placeholder="Computer Science / GPA / Achievements (optional)"
                    />

                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      <button className="btn" onClick={() => removeEducation(ed.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="hr" />

              <div className="h1">Market Match (Job Description)</div>
              <div className="muted">Paste a job description to see missing keywords.</div>
              <textarea
                className="textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste JD here…"
              />

              {jobDescription.trim() && (
                <>
                  <div className="label">Missing Keywords (add where relevant)</div>
                  <div className="chips">
                    {miss.slice(0, 16).map((k) => (
                      <span key={k} className="chip">{k}</span>
                    ))}
                    {miss.length === 0 && <span className="chip">✅ Great! Your resume matches well.</span>}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="panel previewWrap">
            <div className="previewTop noPrint">
              <div>
                <div className="h1">Live Preview</div>
                <div className="muted">This is what will be exported.</div>
              </div>

              <div className="scoreBox">
                <div className="score">{score}/100</div>
                <div className="kpi">ATS Score</div>
              </div>
            </div>

            <Template data={resume} />
          </div>
        </div>
      </div>

      <div className="footer noPrint" style={{ marginTop: 18 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '12px 0' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 820 }}>
            <div style={{ width: 56, height: 56, flex: '0 0 56px' }}>
              <img src="/Avantika-CV-Builder.png" alt="Avantika" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Resume Tips & Export</div>
              <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: 13 }}>
                • Use standard headings (Summary, Experience, Education, Skills).<br />
                • Prefer short action bullets with measurable impact (numbers, percentages).<br />
                • Remove images and tables before exporting — use 'Download PDF' to save a text-selectable ATS-friendly PDF.<br />
                • Turn off browser "Headers and footers" in print dialog to remove date/URL from PDF.
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800 }}>About</div>
            <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: 13 }}>
              Avantika CV Builder — locally edits, no signup. Your data stays in your browser. <br />
              <a href="https://github.com/your-repo" target="_blank" rel="noreferrer">Source & Feedback</a>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <div className="label">{label}</div>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function LangPicker() {
  const [open, setOpen] = useState(false);
  const lang = useResumeStore((s) => s.lang);
  const setLanguage = useResumeStore((s) => s.setLanguage);

  return (
    <div className="langPicker" style={{ position: 'relative' }}>
      <button
        className="langPickerButton"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span className="globe" aria-hidden>🌐</span>
        <span className="langLabel">{availableLangs.find(l => l.code === lang)?.label}</span>
        <span className="caret" aria-hidden>▾</span>
      </button>

      {open && (
        <div className="langMenu" role="listbox">
          {availableLangs.map(l => (
            <div
              key={l.code}
              role="option"
              className="langItem"
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setLanguage(l.code); setOpen(false); } }}
              tabIndex={0}
            >
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
