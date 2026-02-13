import type { ResumeData } from "../types";
import { t } from "../i18n";
import { useResumeStore } from "../store/useResumeStore";

export default function ModernTemplate({ data }: { data: ResumeData }) {
  const c = data.contact;

  return (
    <div className="printPage" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: 18, borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
        <div style={{ fontSize: 26, fontWeight: 950 }}>{c.name}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6, fontWeight: 800, color: "#444", fontSize: 12 }}>
          <span>{c.title}</span>
          <span>•</span>
          <span>{c.email}</span>
          <span>•</span>
          <span>{c.phone}</span>
          <span>•</span>
          <span>{c.location}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6, fontWeight: 800, color: "#444", fontSize: 12 }}>
          {(c.links || []).map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 0 }}>
        <div style={{ padding: 18 }}>
          <Section title={t(useResumeStore.getState().lang, 'professional_summary') || 'Summary'}>
            <p style={pStyle}>{data.summary}</p>
          </Section>

          <Section title={t(useResumeStore.getState().lang, 'experience') || 'Experience'}>
            {data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 950 }}>{e.role}</div>
                  <div style={{ fontWeight: 850, color: "#555", fontSize: 12 }}>{e.start} – {e.end}</div>
                </div>
                <div style={{ fontWeight: 850, color: "#444" }}>{e.company}{e.location ? ` • ${e.location}` : ""}</div>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  {e.bullets.filter(Boolean).map((b, idx) => (
                    <li key={idx} style={{ marginBottom: 6, ...pStyle }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Section title={t(useResumeStore.getState().lang, 'education') || 'Education'}>
            {data.education.map((ed) => (
              <div key={ed.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div style={{ fontWeight: 950 }}>
                    {ed.degree}{ed.school ? ` • ${ed.school}` : ''}{ed.details ? ` • ${ed.details}` : ''}
                  </div>
                  <div style={{ fontWeight: 850, color: "#555", fontSize: 12 }}>{ed.start} – {ed.end}</div>
                </div>
              </div>
            ))}
          </Section>
        </div>

        <aside style={{ padding: 18, borderLeft: "1px solid rgba(0,0,0,0.10)", background: "rgba(15, 23, 42, 0.02)" }}>
          <div style={{ fontWeight: 950, fontSize: 13, letterSpacing: 0.6, textTransform: "uppercase" }}>{t(useResumeStore.getState().lang, 'skills_label') || 'Skills'}</div>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.skills.map((s, i) => <span key={i} style={skillPill}>{s}</span>)}
          </div>

          <div style={{ height: 12 }} />
          <div style={{ fontWeight: 950, fontSize: 13, letterSpacing: 0.6, textTransform: "uppercase" }}>{t(useResumeStore.getState().lang, 'ats_hints') || 'ATS Hints'}</div>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
            <li style={{ ...pStyle }}>Use standard headings</li>
            <li style={{ ...pStyle }}>Avoid tables and images</li>
            <li style={{ ...pStyle }}>Add measurable impact</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 950, fontSize: 13, letterSpacing: 0.6, textTransform: "uppercase" }}>{title}</div>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

const pStyle: React.CSSProperties = { margin: 0, color: "#222", fontWeight: 650, fontSize: 13, lineHeight: 1.45 };
const skillPill: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 850,
  background: "#fff"
};
