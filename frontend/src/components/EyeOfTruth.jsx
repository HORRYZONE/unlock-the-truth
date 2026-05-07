import React from "react";

// "All-seeing eye" 3D motif inspired by the Gravity Falls Bill Cipher silhouette.
// Pure CSS 3D — no extra dependencies.
export default function EyeOfTruth({ size = 220 }) {
  return (
    <div
      className="eye-of-truth"
      style={{
        width: size, height: size,
        perspective: 800,
        margin: "0 auto",
      }}
      aria-hidden="true"
    >
      <div className="eye-stage">
        {/* Outer triangle */}
        <svg viewBox="0 0 200 200" width="100%" height="100%" className="eye-tri">
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="60%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>
          <polygon
            points="100,20 180,170 20,170"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner triangle ring */}
          <polygon
            points="100,40 165,160 35,160"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
          {/* Eye */}
          <ellipse cx="100" cy="120" rx="40" ry="22" fill="#fff7ed" stroke="url(#goldGrad)" strokeWidth="2" />
          <circle cx="100" cy="120" r="14" fill="url(#irisGrad)" />
          <circle cx="100" cy="120" r="6" fill="#1c0a01" />
          <circle cx="103" cy="116" r="2" fill="#fff" opacity="0.85" />
          {/* Top decorative eye lashes / rays */}
          {[...Array(5)].map((_, i) => (
            <line key={i}
              x1={70 + i * 15} y1={88}
              x2={72 + i * 15} y2={78}
              stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Floating ring accent */}
        <div className="eye-ring" />
      </div>
    </div>
  );
}
