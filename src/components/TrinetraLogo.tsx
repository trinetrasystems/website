import { useId } from "react";

/**
 * TrinetraLogo — Animated brand logotype.
 *
 * Renders "TR·[eye]·NETRA" where the eye is the animated SVG from the
 * official design file (Selected currently.dc.html — V3 "The Eye IS the I").
 *
 * Props:
 *  - height:       total logotype height in px (default 40)
 *  - animated:     enable/disable CSS animations (default true)
 *  - showSystems:  show "SYSTEMS" sub-text below (default false)
 *  - className:    extra class on the root wrapper
 */
interface TrinetraLogoProps {
  height?: number;
  animated?: boolean;
  showSystems?: boolean;
  className?: string;
}

/* ── colour palette (matches the ember set from the design file) ────── */
const ember = {
  outline: "#F3ECDD",
  rayA: "#FFB84D",
  rayB: "#E8720C",
  pupil: "#0B0908",
  glow: "#F59B2D",
  hl: "#FFF3DC",
};

/* ── keyframe CSS (injected once) ───────────────────────────────────── */
const STYLE_ID = "trinetra-logo-keyframes";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes tl-eyeOpenX{0%{transform:scaleX(.05);opacity:.15}55%{opacity:1}70%{transform:scaleX(1.05)}100%{transform:scaleX(1);opacity:1}}
    @keyframes tl-raysSpin{to{transform:rotate(360deg)}}
    @keyframes tl-arcSpinRev{to{transform:rotate(-360deg)}}
    @keyframes tl-irisGlanceY{0%,20%{transform:translateY(0)}34%,46%{transform:translateY(-11px)}60%,72%{transform:translateY(11px)}86%,100%{transform:translateY(0)}}
    @keyframes tl-glowPulse{0%,100%{opacity:.38}50%{opacity:.85}}
    @keyframes tl-pupilPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.13)}}
    @keyframes tl-scanY{0%{transform:translateY(-88px);opacity:0}12%{opacity:.5}88%{opacity:.5}100%{transform:translateY(88px);opacity:0}}
    @keyframes tl-letterIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:none}}
    @keyframes tl-blinkX{0%,80%{transform:scaleX(1)}85%,88%{transform:scaleX(.12)}93%,100%{transform:scaleX(1)}}
  `;
  document.head.appendChild(style);
}

/* ── The animated eye SVG ───────────────────────────────────────────── */
function EyeI({
  height: hp,
  animated: anim,
  idPrefix,
}: {
  height: number;
  animated: boolean;
  idPrefix: string;
}) {
  const w = hp * 0.46;
  const cx = 60,
    cy = 130;
  const almond = "M 60 26 Q 106 130 60 234 Q 14 130 60 26 Z";
  const rayCount = 20;
  const pupilR = 12;
  const r1 = 16.5;

  const rays: JSX.Element[] = [];
  for (let i = 0; i < rayCount; i++) {
    const a = (i * 360) / rayCount * (Math.PI / 180);
    const long = i % 2 === 0;
    const r2 = long ? 34 : 27;
    rays.push(
      <line
        key={`r${i}`}
        x1={cx + r1 * Math.cos(a)}
        y1={cy + r1 * Math.sin(a)}
        x2={cx + r2 * Math.cos(a)}
        y2={cy + r2 * Math.sin(a)}
        stroke={long ? ember.rayA : ember.rayB}
        strokeWidth={long ? 3.4 : 2.2}
        strokeLinecap="round"
      />
    );
  }

  const when = (name: string, extra?: React.CSSProperties): React.CSSProperties =>
    anim
      ? { transformBox: "fill-box" as const, transformOrigin: "center", animation: name, ...extra }
      : {};

  return (
    <svg
      viewBox="0 0 120 260"
      width={w}
      height={hp}
      fill="none"
      style={{ display: "block", overflow: "visible" }}
      aria-label="Trinetra eye logo"
    >
      <defs>
        <clipPath id={`${idPrefix}c`}>
          <path d={almond} />
        </clipPath>
        <radialGradient id={`${idPrefix}g`}>
          <stop offset="0%" stopColor={ember.glow} stopOpacity={0.55} />
          <stop offset="100%" stopColor={ember.glow} stopOpacity={0} />
        </radialGradient>
      </defs>

      <g
        style={
          anim
            ? {
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: "tl-eyeOpenX 1.2s .4s cubic-bezier(.22,.9,.28,1) both",
              }
            : {}
        }
      >
        {/* glow */}
        <circle
          cx={cx}
          cy={cy}
          r={54}
          fill={`url(#${idPrefix}g)`}
          style={anim ? { animation: "tl-glowPulse 4.5s ease-in-out infinite" } : { opacity: 0.5 }}
        />

        {/* blink wrapper */}
        <g
          style={
            anim
              ? {
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animation: "tl-blinkX 7s 2.4s ease-in-out infinite",
                }
              : {}
          }
        >
          {/* clipped interior */}
          <g clipPath={`url(#${idPrefix}c)`}>
            {/* iris glance */}
            <g style={when("tl-irisGlanceY 8s ease-in-out infinite")}>
              {/* rays spin */}
              <g style={when("tl-raysSpin 24s linear infinite")}>{rays}</g>

              {/* gyro arc */}
              <circle
                cx={cx}
                cy={cy}
                r={42}
                stroke={ember.rayB}
                strokeWidth={1.8}
                fill="none"
                opacity={0.55}
                strokeDasharray="12 16"
                strokeLinecap="round"
                style={when("tl-arcSpinRev 18s linear infinite")}
              />

              {/* pupil */}
              <g style={when("tl-pupilPulse 3.6s ease-in-out infinite")}>
                <circle cx={cx} cy={cy} r={pupilR} fill={ember.pupil} />
                <circle
                  cx={cx}
                  cy={cy}
                  r={pupilR + 1.8}
                  stroke={ember.rayA}
                  strokeWidth={1.8}
                  fill="none"
                />
                <circle
                  cx={cx - 4.5}
                  cy={cy - 5}
                  r={2.8}
                  fill={ember.hl}
                  opacity={0.9}
                />
              </g>
            </g>

            {/* scanner */}
            <line
              x1={26}
              y1={cy}
              x2={94}
              y2={cy}
              stroke={ember.rayA}
              strokeWidth={2.6}
              strokeLinecap="round"
              style={
                anim
                  ? {
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      animation: "tl-scanY 3.4s 1.4s ease-in-out infinite",
                    }
                  : { opacity: 0 }
              }
            />
          </g>

          {/* almond outline */}
          <path
            d={almond}
            stroke={ember.outline}
            strokeWidth={7}
            fill="none"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

/* ── Main exported component ────────────────────────────────────────── */
const TrinetraLogo: React.FC<TrinetraLogoProps> = ({
  height = 40,
  animated = true,
  showSystems = false,
  className = "",
}) => {
  ensureKeyframes();
  const uid = useId().replace(/:/g, "");

  // Scale the font size proportionally to height
  const fontSize = height * 0.82;
  // The eye SVG — same height as the letters
  const eyeHeight = height * 1.0;

  const letterStyle = (delay: number): React.CSSProperties =>
    animated
      ? {
          display: "inline-block",
          animation: `tl-letterIn .6s ${delay}s cubic-bezier(.2,.8,.2,1) both`,
        }
      : { display: "inline-block" };

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
        position: "relative",
      }}
    >
      {/* Ambient glow behind the logotype */}
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "120%",
          background: "radial-gradient(ellipse, rgba(245,155,45,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />

      {/* Logotype — all inline: TR[eye]NETRA Systems */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize,
          letterSpacing: ".07em",
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
          color: "var(--trinetra-logo-color, #F3ECDD)",
          filter: "drop-shadow(0 0 6px rgba(245,155,45,0.25))",
        }}
      >
        <span style={letterStyle(0.05)}>T</span>
        <span style={letterStyle(0.1)}>R</span>
        <span style={{ display: "inline-flex", alignItems: "center", filter: "drop-shadow(0 0 10px rgba(245,155,45,0.4))" }}>
          <EyeI height={eyeHeight} animated={animated} idPrefix={`tl${uid}`} />
        </span>
        <span style={letterStyle(0.2)}>N</span>
        <span style={letterStyle(0.25)}>E</span>
        <span style={letterStyle(0.3)}>T</span>
        <span style={letterStyle(0.35)}>R</span>
        <span style={letterStyle(0.4)}>A</span>

        {/* "Systems" inline at the end */}
        {showSystems && (
          <span
            style={{
              ...letterStyle(0.5),
              marginLeft: fontSize * 0.2,
              fontWeight: 500,
              fontSize: fontSize * 0.55,
              letterSpacing: ".12em",
              color: "#A99C82",
              alignSelf: "center",
            }}
          >
            Systems
          </span>
        )}
      </span>
    </span>
  );
};

export default TrinetraLogo;
