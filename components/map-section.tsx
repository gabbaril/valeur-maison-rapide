import React from "react"

/* =========================
   TYPES
========================= */

type MapVariant = "default" | "quebec" | "rimouski" | "levis"

type City = {
  cx: number
  cy: number
  label: string
  size?: "xs" | "sm" | "md" | "lg"
  labelOffsetX?: number
  labelOffsetY?: number
}

type MapProps = {
  mapVariant?: MapVariant
}

/* =========================
   SIZE CONFIG
========================= */

const sizeConfig = {
  xs: { ring: 0, dot: 4, font: 9 },
  sm: { ring: 14, dot: 5, font: 11 },
  md: { ring: 18, dot: 7, font: 12 },
  lg: { ring: 24, dot: 10, font: 13 },
}

/* =========================
   CITY MARKER
========================= */

function CityMarker({
  cx,
  cy,
  label,
  size = "md",
  labelOffsetX = 15,
  labelOffsetY = 5,
  index,
}: City & { index: number }) {
  const config = sizeConfig[size]

  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={config.ring}
        fill="none"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.4"
        className={`pulse-ring pulse-delay-${index}`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={config.dot}
        fill="#dc2626"
        className={`pulse-dot pulse-delay-${index}`}
      />
      <text
        x={cx + labelOffsetX}
        y={cy + labelOffsetY}
        fontSize={config.font}
        fill="#1a1a1a"
        fontWeight="600"
      >
        {label}
      </text>
    </>
  )
}

/* =========================
   BASE MAP
========================= */

function BaseMap({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 700 320"
      className="w-full max-w-3xl h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="700" height="320" fill="#e8f5e9" />
      {children}
    </svg>
  )
}

/* =========================
   MAP CONFIGURATIONS
========================= */

const mapConfigs: Record<MapVariant, City[]> = {
  default: [
    { cx: 200, cy: 185, label: "Montréal", size: "lg", labelOffsetX: -30, labelOffsetY: 40 },
    { cx: 220, cy: 145, label: "Laval", size: "sm" },
    { cx: 420, cy: 115, label: "Trois-Rivières", size: "md", labelOffsetX: 25},
    { cx: 400, cy: 60, label: "Shawinigan", size: "sm", labelOffsetX: 20 },
    { cx: 590, cy: 100, label: "Québec", size: "lg", labelOffsetX: 30 },
    { cx: 420, cy: 265, label: "Sherbrooke", size: "md", labelOffsetX: 25 },
    { cx: 310, cy: 185, label: "Sorel-Tracy", size: "xs", labelOffsetX: 10 },
    { cx: 380, cy: 220, label: "Drummondville", size: "xs", labelOffsetX: 10 },
    { cx: 320, cy: 245, label: "Granby", size: "xs", labelOffsetX: 10 },
    { cx: 290, cy: 220, label: "St-Hyacinthe", size: "xs", labelOffsetX: 10 },
  ],

  quebec: [
    { cx: 120, cy: 165, label: "Sainte-Foy–Sillery–Cap-Rouge", size: "lg", labelOffsetX: 30 },
    { cx: 330, cy: 215, label: "Les Rivières", size: "sm", labelOffsetX: 20 },
    { cx: 140, cy: 75, label: "La Haute-Saint-Charles", size: "md", labelOffsetX: 25 },
    { cx: 520, cy: 160, label: "Beauport", size: "sm", labelOffsetX: 20 },
    { cx: 470, cy: 270, label: "La Cité-Limoilou", size: "lg", labelOffsetX: 30 },
    { cx: 420, cy: 105, label: "Charlesbourg", size: "md", labelOffsetX: 20 },
  ],

  rimouski: [
    { cx: 350, cy: 150, label: "Rimouski", size: "lg" },
    { cx: 420, cy: 120, label: "Mont-Joli", size: "sm" },
  ],

  levis: [
    { cx: 120, cy: 110, label: "Chutes-de-la-Chaudière-Ouest", size: "lg", labelOffsetX: 30 },
    { cx: 330, cy: 215, label: "Chutes-de-la-Chaudière-Est", size: "lg", labelOffsetX: 30 },
    { cx: 520, cy: 120, label: "Desjardins", size: "lg", labelOffsetX: 30 },
  ],
}

/* =========================
   MAIN COMPONENT
========================= */

export default function MapSection({ mapVariant = "default" }: MapProps) {
  const cities = mapConfigs[mapVariant]

  return (
    <BaseMap>
      {mapVariant === "default" && (
        <>
          {/* Rivers */}
          <path
            d="M0,180 Q50,175 100,185 Q180,200 250,190 Q320,178 380,175 Q450,170 520,160 Q580,150 640,140 Q680,135 700,130"
            fill="none"
            stroke="#90caf9"
            strokeWidth="35"
            strokeLinecap="round"
          />
          <path
            d="M0,180 Q50,175 100,185 Q180,200 250,190 Q320,178 380,175 Q450,170 520,160 Q580,150 640,140 Q680,135 700,130"
            fill="none"
            stroke="#64b5f6"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M380,175 Q400,140 420,100 Q430,70 440,40"
            fill="none"
            stroke="#90caf9"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M380,175 Q400,140 420,100 Q430,70 440,40"
            fill="none"
            stroke="#64b5f6"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M280,195 Q300,230 340,270 Q360,290 380,310"
            fill="none"
            stroke="#90caf9"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Land Regions */}
          <path
            d="M0,0 L700,0 L700,130 Q680,135 640,140 Q580,150 520,160 Q450,170 380,175 Q320,178 250,190 Q180,200 100,185 Q50,175 0,180 Z"
            fill="#c8e6c9"
            fillOpacity="0.5"
            stroke="#a5d6a7"
            strokeWidth="1"
          />
          <path
            d="M0,180 Q50,175 100,185 Q180,200 250,190 Q320,178 380,175 Q450,170 520,160 Q580,150 640,140 Q680,135 700,130 L700,320 L0,320 Z"
            fill="#dcedc8"
            fillOpacity="0.5"
            stroke="#c5e1a5"
            strokeWidth="1"
          />

          {/* Regional Boundaries */}
          <path d="M180,150 L180,220" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M280,80 L320,170" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M450,60 L480,150" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M580,50 L600,140" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M350,220 L400,280" stroke="#c5e1a5" strokeWidth="1" strokeDasharray="4 4" />

          {/* Highway Routes */}
          <path
            d="M50,230 Q150,225 250,218 Q350,210 450,200 Q550,190 650,175"
            fill="none"
            stroke="#9e9e9e"
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.4"
          />
          <path
            d="M50,140 Q150,130 250,125 Q350,120 420,115 Q500,105 580,95 Q640,85 680,80"
            fill="none"
            stroke="#9e9e9e"
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.4"
          />
        </>
      )}

      {/* City Markers */}
      {cities.map((city, index) => (
        <CityMarker key={index} index={index} {...city} />
      ))}
    </BaseMap>
  )
}