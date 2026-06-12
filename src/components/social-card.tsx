type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
  detail?: string;
};

export function SocialCard({ eyebrow, title, subtitle, badge, detail }: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        padding: "68px 74px",
        background: "#f7f2e8",
        color: "#20170e",
        fontFamily: "Georgia, serif"
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 430,
          height: 430,
          borderRadius: 999,
          right: -100,
          top: -150,
          background: "#e05a2a"
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 999,
          right: 40,
          bottom: -380,
          background: "#234334"
        }}
      />
      <div
        style={{
          width: "100%",
          display: "flex",
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              color: "#8d2d18",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase"
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              width: 112,
              height: 112,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "#fffdf8",
              border: "3px solid rgba(32,23,14,.14)",
              fontSize: 34,
              fontWeight: 700
            }}
          >
            {badge}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
          <div style={{ display: "flex", fontSize: 68, lineHeight: 1.02, fontWeight: 700 }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#66594c" }}>
            {subtitle}
          </div>
          {detail ? (
            <div style={{ display: "flex", marginTop: 18, fontSize: 22, color: "#234334" }}>
              {detail}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#66594c" }}>
          World Cup Local Time · 2026
        </div>
      </div>
    </div>
  );
}
