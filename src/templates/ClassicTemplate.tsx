import type { ResumeData } from "../types";

export default function ClassicTemplate({ data }: { data: ResumeData }) {
  const c = data.contact;

  return (
    <div className="printPage" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{c.name}</div>
          <div style={{ fontWeight: 800, color: "#444" }}>{c.title}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: "#333" }}>
          <div>{c.email}</div>
          <div>{c.phone}</div>
          <div>{c.location}</div>
          {c.links?.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      <Hr />
      <Section title="Summary">
        <p style={pStyle}>{data.summary}</p>
      </Section>

      <Section title="Skills">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.skills.map((s, i) => (
            <span key={i} style={skillPill}>{s}</span>
          ))}
        </div>
      </Section>

      <Section title="Experience">
        {data.experience.map((e) => (
          <div key={e.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>{e.role} — {e.company}</div>
              <div style={{ fontWeight: 800, color: "#555", fontSize: 12 }}>{e.start} – {e.end}</div>
            </div>
            {e.location ? <div style={{ fontWeight: 750, color: "#666", fontSize: 12 }}>{e.location}</div> : null}
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {e.bullets.filter(Boolean).map((b, idx) => (
                <li key={idx} style={{ marginBottom: 6, ...pStyle }}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Education">
        {data.education.map((ed) => (
          <div key={ed.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: 'center' }}>
              <div style={{ fontWeight: 900, color: '#222', fontSize: 13 }}>
                {ed.degree}{ed.school ? ` • ${ed.school}` : ''}{ed.details ? ` • ${ed.details}` : ''}
              </div>
              <div style={{ fontWeight: 800, color: "#555", fontSize: 12 }}>{ed.start} – {ed.end}</div>
            </div>
          </div>
        ))}
      </Section>
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

function Hr() {
  return <div style={{ height: 1, background: "rgba(0,0,0,0.12)", margin: "12px 0" }} />;
}

const pStyle: React.CSSProperties = { margin: 0, color: "#222", fontWeight: 650, fontSize: 13, lineHeight: 1.45 };
const skillPill: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 850
};
