interface EmptySceneProps {
  name: "home" | "startup" | "news" | "blog" | "government" | "province";
}

function Wave({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 40" fill="none" preserveAspectRatio="none">
      <path
        d="M0 30C30 14 50 14 80 24C110 34 135 34 165 22C180 16 192 16 200 20V40H0V30Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

export default function EmptyScene({ name }: EmptySceneProps) {
  const common = {
    viewBox: "0 0 320 200",
    fill: "none",
    className: "h-full w-full",
  } as const;

  if (name === "startup") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="s1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f4ef5" />
            <stop offset="100%" stopColor="#173be2" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="100" r="86" fill="#eef2ff" />
        <circle cx="160" cy="100" r="70" fill="white" opacity="0.9" />
        <g className="illustration-launch">
          <rect x="138" y="46" width="44" height="70" rx="10" fill="url(#s1)" />
          <circle cx="160" cy="64" r="7" fill="white" />
          <path d="M138 100L130 116L146 108H174L190 116L182 100Z" fill="#173be2" />
          <path d="M148 44l12-26 12 26z" fill="url(#s1)" />
        </g>
        <g className="illustration-float">
          <circle cx="102" cy="52" r="7" fill="#ffb020" />
          <circle cx="232" cy="60" r="5" fill="#34d399" />
          <circle cx="228" cy="140" r="6" fill="#4f46e5" opacity="0.6" />
        </g>
        <ellipse cx="160" cy="176" rx="54" ry="9" fill="#cbd5e1" opacity="0.6" />
      </svg>
    );
  }

  if (name === "news") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="n1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="92" r="86" fill="#fffbeb" />
        <g className="illustration-float">
          <rect x="104" y="54" width="112" height="82" rx="8" fill="url(#n1)" />
          <rect x="112" y="64" width="48" height="10" rx="3" fill="#f59e0b" opacity="0.7" />
          <rect x="112" y="82" width="96" height="6" rx="3" fill="#b45309" opacity="0.5" />
          <rect x="112" y="96" width="96" height="6" rx="3" fill="#b45309" opacity="0.5" />
          <rect x="112" y="110" width="60" height="6" rx="3" fill="#b45309" opacity="0.5" />
        </g>
        <g className="illustration-float-delayed">
          <circle cx="226" cy="132" r="16" fill="#ff7777" opacity="0.85" />
          <rect x="219" y="112" width="14" height="36" rx="3" fill="#ff7777" />
        </g>
        <circle cx="66" cy="70" r="12" fill="#fecaca" opacity="0.8" />
      </svg>
    );
  }

  if (name === "blog") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="b1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="96" r="86" fill="#f5f3ff" />
        <g className="illustration-float">
          <rect x="104" y="52" width="112" height="90" rx="8" fill="#fff" />
          <path d="M104 92H216V100H104Z" fill="#7c3aed" opacity="0.15" />
          <rect x="112" y="62" width="40" height="6" rx="3" fill="#a78bfa" />
          <circle cx="160" cy="72" r="13" fill="url(#b1)" />
          <rect x="112" y="106" width="88" height="5" rx="2.5" fill="#c4b5fd" opacity="0.6" />
          <rect x="112" y="118" width="70" height="5" rx="2.5" fill="#c4b5fd" opacity="0.6" />
        </g>
        <g className="illustration-float-delayed">
          <rect x="158" y="140" width="30" height="7" rx="3.5" fill="#7c3aed" />
          <rect x="158" y="108" width="7" height="34" rx="3.5" fill="#bfdbfe" />
        </g>
      </svg>
    );
  }

  if (name === "government") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="94" r="88" fill="#eff6ff" />
        <Wave className="absolute text-white" />
        <g className="illustration-float">
          <rect x="120" y="64" width="80" height="34" rx="4" fill="url(#g1)" />
          <rect x="112" y="94" width="96" height="8" rx="3" fill="#1d4ed8" />
          <path d="M160 44L172 64H148L160 44Z" fill="#1e40af" />
          <rect x="128" y="102" width="64" height="46" fill="#bfdbfe" opacity="0.7" />
        </g>
        <circle cx="230" cy="70" r="7" fill="#fbbf24" />
        <circle cx="86" cy="132" r="6" fill="#34d399" opacity="0.8" />
      </svg>
    );
  }

  if (name === "province") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="p1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="96" r="88" fill="#ecfdf5" />
        <g className="illustration-float">
          <path d="M160 44C136 44 118 62 118 86C118 112 160 152 160 152C160 152 202 112 202 86C202 62 184 44 160 44Z" fill="url(#p1)" />
          <circle cx="160" cy="88" r="18" fill="white" />
          <circle cx="160" cy="88" r="8" fill="#059669" />
        </g>
        <g className="illustration-float-delayed">
          <circle cx="70" cy="66" r="6" fill="#f59e0b" />
          <circle cx="252" cy="120" r="5" fill="#3b82f6" opacity="0.7" />
        </g>
      </svg>
    );
  }

  return (
    <svg {...common}>
      <defs>
        <linearGradient id="h1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="92" r="88" fill="#f0f9ff" />
      <g className="illustration-float">
        <circle cx="160" cy="80" r="34" fill={undefined} />
        <circle cx="160" cy="80" r="30" fill="#7dd3fc" opacity="0.55" />
        <circle cx="160" cy="80" r="18" fill="url(#h1)" />
      </g>
      <g className="illustration-float-delayed">
        <circle cx="70" cy="60" r="10" fill="#fbbf24" />
        <circle cx="236" cy="60" r="7" fill="#34d399" />
        <circle cx="66" cy="132" r="6" fill="#f472b6" opacity="0.8" />
      </g>
      <path d="M160 150C160 150 214 120 240 96C232 116 196 138 196 138L168 158Z" fill="currentColor" opacity="0.12" />
    </svg>
  );
}