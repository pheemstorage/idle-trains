// Handcrafted animated SVG icon library — strictly zero emojis.
// Each icon returns clean inline SVG markup with CSS-animated sub-elements.

export const ICONS = {
  baht: (cls = '') => `
    <svg class="it-icon it-icon-baht ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13.5" fill="#F8C63D" stroke="#B7791F" stroke-width="2.2"/>
      <circle cx="16" cy="16" r="10.2" fill="#FFD966" stroke="#D69E2E" stroke-width="1.2" stroke-dasharray="2 2"/>
      <path d="M16 7.5V24.5M12.5 10.5H17.5C19.4 10.5 20.6 11.6 20.6 13.1C20.6 14.5 19.6 15.5 18 15.8C20 16.1 21.2 17.3 21.2 18.9C21.2 20.7 19.7 21.8 17.5 21.8H12.5V10.5Z" stroke="#7C4A03" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="it-gleam" d="M8 10L11 7M10 14L14 10" stroke="#FFFDF5" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
    </svg>`,

  train: (cls = '') => `
    <svg class="it-icon it-icon-train ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g class="it-bob">
        <rect x="4" y="8" width="24" height="14" rx="4.5" fill="#FFFFFF" stroke="#25201B" stroke-width="2"/>
        <path d="M4 16H28" stroke="#1E5AA8" stroke-width="3.2"/>
        <rect x="7.5" y="10.5" width="5.5" height="4" rx="1.2" fill="#7DD3FC" stroke="#25201B" stroke-width="1.2"/>
        <rect x="15" y="10.5" width="5.5" height="4" rx="1.2" fill="#7DD3FC" stroke="#25201B" stroke-width="1.2"/>
        <path d="M22.5 10.5H25.2C26 10.5 26.5 11.2 26.5 12V14.5H22.5V10.5Z" fill="#BAE6FD" stroke="#25201B" stroke-width="1.2"/>
        <circle cx="25.5" cy="19.2" r="1.4" fill="#FDE047"/>
      </g>
      <circle class="it-spin-slow" cx="10" cy="24" r="2.3" fill="#475569" stroke="#25201B" stroke-width="1.4"/>
      <circle class="it-spin-slow" cx="22" cy="24" r="2.3" fill="#475569" stroke="#25201B" stroke-width="1.4"/>
      <path d="M2 27.5H30" stroke="#78716C" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  speed: (cls = '') => `
    <svg class="it-icon it-icon-speed ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 23A12 12 0 1 1 26 23" stroke="#25201B" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M9 21A8.5 8.5 0 0 1 23 21" stroke="#EA580C" stroke-width="2" stroke-dasharray="3 2.5" stroke-linecap="round"/>
      <g class="it-needle">
        <path d="M16 20L22.5 12.5" stroke="#DC2626" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="16" cy="20" r="2.5" fill="#25201B"/>
      </g>
    </svg>`,

  sun: (cls = '') => `
    <svg class="it-icon it-icon-sun ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g class="it-spin-slow">
        <path d="M16 3V6.5M16 25.5V29M3 16H6.5M25.5 16H29M6.8 6.8L9.3 9.3M22.7 22.7L25.2 25.2M25.2 6.8L22.7 9.3M9.3 22.7L6.8 25.2" stroke="#F59E0B" stroke-width="2.4" stroke-linecap="round"/>
      </g>
      <circle cx="16" cy="16" r="6.5" fill="#FDE047" stroke="#D97706" stroke-width="2"/>
    </svg>`,

  cloudy: (cls = '') => `
    <svg class="it-icon it-icon-cloudy ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle class="it-pulse-soft" cx="21" cy="11.5" r="5" fill="#FDE047" stroke="#D97706" stroke-width="1.7"/>
      <path class="it-float" d="M8.5 24H22.5C25 24 27 22.1 27 19.7C27 17.5 25.3 15.7 23.1 15.5C22.3 12.3 19.4 10 16 10C12.1 10 9 13.1 9 17C6.8 17.3 5 19.1 5 21.3C5 22.8 6.5 24 8.5 24Z" fill="#FFFFFF" stroke="#475569" stroke-width="2"/>
    </svg>`,

  rain: (cls = '') => `
    <svg class="it-icon it-icon-rain ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8.5 19H23C25.2 19 27 17.3 27 15.1C27 13.1 25.5 11.4 23.5 11.2C22.7 8.2 20 6 16.8 6C13.2 6 10.3 8.8 10.1 12.4C7.7 12.6 6 14.3 6 16.4C6 17.9 7.1 19 8.5 19Z" fill="#94A3B8" stroke="#334155" stroke-width="2"/>
      <path class="it-raindrop d1" d="M11 22L9.5 27" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round"/>
      <path class="it-raindrop d2" d="M16.5 22L15 27" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round"/>
      <path class="it-raindrop d3" d="M22 22L20.5 27" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,

  flood: (cls = '') => `
    <svg class="it-icon it-icon-flood ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 16H23.5C25.4 16 27 14.5 27 12.6C27 10.8 25.7 9.4 23.9 9.2C23.2 6.6 20.8 4.8 18 4.8C14.8 4.8 12.2 7.2 12 10.3C9.8 10.5 8 12 8 14C8 15.1 7.2 16 8 16Z" fill="#64748B" stroke="#1E293B" stroke-width="1.9"/>
      <path class="it-flash" d="M17.5 11.5L14.5 17.5H17.5L15.5 22.5L21 15.8H17.8L19.5 11.5H17.5Z" fill="#FACC15" stroke="#B45309" stroke-width="1"/>
      <path class="it-wave" d="M3 25.5C5.5 23.5 8.5 23.5 11 25.5C13.5 27.5 16.5 27.5 19 25.5C21.5 23.5 24.5 23.5 27 25.5C28 26.3 29 26.6 30 26.6" stroke="#0284C7" stroke-width="2.4" stroke-linecap="round"/>
      <path class="it-wave w2" d="M3 29.2C5.5 27.4 8.5 27.4 11 29.2C13.5 31 16.5 31 19 29.2C21.5 27.4 24.5 27.4 27 29.2" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  night: (cls = '') => `
    <svg class="it-icon it-icon-night ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path class="it-float" d="M21.8 19.6A8.8 8.8 0 0 1 12.4 10.2C12.4 8.7 12.8 7.3 13.5 6.1A9.8 9.8 0 1 0 25.9 18.5C24.7 19.2 23.3 19.6 21.8 19.6Z" fill="#FDE68A" stroke="#B45309" stroke-width="1.9"/>
      <circle class="it-pulse-soft" cx="23.5" cy="9" r="1.6" fill="#FACC15"/>
      <circle class="it-pulse-soft" cx="26.8" cy="13.2" r="1.1" fill="#FEF08A"/>
    </svg>`,

  angry: (cls = '') => `
    <svg class="it-icon it-icon-angry ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g class="it-shake">
        <circle cx="16" cy="17" r="10.5" fill="#EF4444" stroke="#7F1D1D" stroke-width="2.1"/>
        <path d="M10.5 13L14.5 15.2M21.5 13L17.5 15.2" stroke="#450A0A" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="12.4" cy="16.8" r="1.3" fill="#450A0A"/>
        <circle cx="19.6" cy="16.8" r="1.3" fill="#450A0A"/>
        <path d="M11.8 22.5C13.3 20.6 18.7 20.6 20.2 22.5" stroke="#450A0A" stroke-width="2.1" stroke-linecap="round"/>
      </g>
      <path class="it-steam" d="M8 7.5C6.5 6 7 4 9 4M24 7.5C25.5 6 25 4 23 4" stroke="#F97316" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  happy: (cls = '') => `
    <svg class="it-icon it-icon-happy ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="#4ADE80" stroke="#166534" stroke-width="2.1"/>
      <circle cx="12.2" cy="14" r="1.5" fill="#14532D"/>
      <circle cx="19.8" cy="14" r="1.5" fill="#14532D"/>
      <path d="M11 18.8C12.6 21.5 19.4 21.5 21 18.8" stroke="#14532D" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,

  wrench: (cls = '') => `
    <svg class="it-icon it-icon-wrench ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g class="it-wobble">
        <path d="M23.5 6.5A5.5 5.5 0 0 0 16.3 13.7L7.5 22.5A2.5 2.5 0 0 0 11 26L19.8 17.2A5.5 5.5 0 0 0 26.8 9.8L23.5 13.1L20.4 10L23.5 6.5Z" fill="#FB923C" stroke="#7C2D12" stroke-width="2" stroke-linejoin="round"/>
      </g>
      <path class="it-flash" d="M7 9L9 6M5 13H8" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

  crane: (cls = '') => `
    <svg class="it-icon it-icon-crane ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M9 28V7H13V28" fill="#FACC15" stroke="#854D0E" stroke-width="2" stroke-linejoin="round"/>
      <path d="M5 10L27 7V10.5L5 12.5V10Z" fill="#FDE047" stroke="#854D0E" stroke-width="1.8"/>
      <g class="it-bob">
        <line x1="23" y1="10.5" x2="23" y2="19" stroke="#25201B" stroke-width="1.8"/>
        <path d="M21 19H25V23.5H21V19Z" fill="#EA580C" stroke="#7C2D12" stroke-width="1.6"/>
      </g>
      <path d="M5 28H17" stroke="#25201B" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,

  sevenEleven: (cls = '') => `
    <svg class="it-icon it-icon-711 ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="24" height="20" rx="3.5" fill="#FFFFFF" stroke="#1F2937" stroke-width="2"/>
      <rect x="5" y="7" width="22" height="3.2" fill="#008161"/>
      <rect x="5" y="10.2" width="22" height="2.4" fill="#F58220"/>
      <rect x="5" y="12.6" width="22" height="2.2" fill="#E31837"/>
      <path d="M10 17.5H16.5L13 24" stroke="#E31837" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="19" y="17.2" width="5.5" height="6.8" rx="1" fill="#BAE6FD" stroke="#1F2937" stroke-width="1.3"/>
      <circle class="it-pulse-soft" cx="25.5" cy="8.5" r="1.4" fill="#FEF08A"/>
    </svg>`,

  condo: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="8" y="4" width="16" height="24" rx="2.5" fill="#374151" stroke="#111827" stroke-width="2"/>
      <rect x="11" y="7.5" width="3.5" height="3" rx="0.6" fill="#38BDF8"/>
      <rect x="17.5" y="7.5" width="3.5" height="3" rx="0.6" fill="#FDE68A"/>
      <rect x="11" y="12.5" width="3.5" height="3" rx="0.6" fill="#FDE68A"/>
      <rect x="17.5" y="12.5" width="3.5" height="3" rx="0.6" fill="#38BDF8"/>
      <rect x="11" y="17.5" width="10" height="2.5" rx="0.8" fill="#2DD4BF"/>
      <rect x="13.5" y="23" width="5" height="5" fill="#9CA3AF"/>
    </svg>`,

  hotel: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="6" y="7" width="20" height="21" rx="2.5" fill="#FEF3C7" stroke="#92400E" stroke-width="2"/>
      <path d="M10 4H22V7H10V4Z" fill="#F59E0B" stroke="#92400E" stroke-width="1.6"/>
      <rect x="9.5" y="10.5" width="3.5" height="3.2" fill="#38BDF8"/>
      <rect x="14.2" y="10.5" width="3.5" height="3.2" fill="#38BDF8"/>
      <rect x="19" y="10.5" width="3.5" height="3.2" fill="#38BDF8"/>
      <rect x="9.5" y="16" width="3.5" height="3.2" fill="#FBBF24"/>
      <rect x="19" y="16" width="3.5" height="3.2" fill="#FBBF24"/>
      <path d="M13 28V22.5H19V28" fill="#B45309"/>
    </svg>`,

  mall: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 13L7 7H25L28 13V27H4V13Z" fill="#E0F2FE" stroke="#1E3A8A" stroke-width="2" stroke-linejoin="round"/>
      <path d="M4 13H28" stroke="#0284C7" stroke-width="2.4"/>
      <rect x="8" y="16.5" width="5" height="5" rx="1" fill="#F472B6"/>
      <rect x="19" y="16.5" width="5" height="5" rx="1" fill="#34D399"/>
      <rect x="14" y="19" width="4" height="8" rx="0.8" fill="#1E40AF"/>
    </svg>`,

  restaurant: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 13C5 9.5 8 7 16 7C24 7 27 9.5 27 13H5Z" fill="#EF4444" stroke="#7F1D1D" stroke-width="1.9"/>
      <rect x="6" y="13" width="20" height="14" rx="1.5" fill="#FFF7ED" stroke="#7C2D12" stroke-width="1.9"/>
      <rect x="9" y="16.5" width="7" height="5.5" rx="1" fill="#FDBA74" stroke="#9A3412" stroke-width="1.3"/>
      <rect x="18.5" y="18" width="4.5" height="9" fill="#9A3412"/>
    </svg>`,

  market: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 14L7 7H25L28 14" fill="#F97316" stroke="#7C2D12" stroke-width="2" stroke-linejoin="round"/>
      <path d="M4 14C4 16.2 6.5 17 8 15.5C9.5 17 12.5 17 14 15.5C15.5 17 18.5 17 20 15.5C21.5 17 24.5 17 26 15.5C27 16.5 28 15.8 28 14" stroke="#7C2D12" stroke-width="1.8" fill="#FED7AA"/>
      <rect x="6" y="16" width="20" height="11" fill="#FEF3C7" stroke="#7C2D12" stroke-width="1.9"/>
      <rect x="9.5" y="19.5" width="5" height="4.5" fill="#22C55E"/>
      <rect x="17.5" y="19.5" width="5" height="4.5" fill="#EAB308"/>
    </svg>`,

  school: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 14L16 6L28 14H4Z" fill="#827666" stroke="#25201B" stroke-width="1.9" stroke-linejoin="round"/>
      <rect x="5" y="14" width="22" height="13" fill="#E5B24C" stroke="#25201B" stroke-width="1.9"/>
      <rect x="8" y="17" width="4" height="5" rx="0.8" fill="#26533A" stroke="#FFFDF5" stroke-width="1"/>
      <rect x="20" y="17" width="4" height="5" rx="0.8" fill="#26533A" stroke="#FFFDF5" stroke-width="1"/>
      <path d="M13.5 27V20C13.5 18.6 14.6 17.5 16 17.5C17.4 17.5 18.5 18.6 18.5 20V27" fill="#1E293B" stroke="#FFFDF5" stroke-width="1.2"/>
      <circle class="it-pulse-soft" cx="16" cy="11" r="1.7" fill="#EC4899"/>
    </svg>`,

  skywalk: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 20H29" stroke="#25201B" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M5 14C10 9 22 9 27 14" stroke="#0284C7" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M7 20V27M25 20V27M11 12.2V20M16 10.6V20M21 12.2V20" stroke="#475569" stroke-width="1.8"/>
      <circle class="it-pulse-soft" cx="16" cy="7" r="2.2" fill="#22C55E"/>
    </svg>`,

  importShip: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g class="it-bob">
        <rect x="9" y="8" width="6" height="6" rx="1" fill="#EF4444" stroke="#25201B" stroke-width="1.5"/>
        <rect x="16" y="8" width="6" height="6" rx="1" fill="#3B82F6" stroke="#25201B" stroke-width="1.5"/>
        <rect x="12" y="13" width="8" height="4" fill="#FACC15" stroke="#25201B" stroke-width="1.5"/>
        <path d="M5 17H27L24 23.5H8L5 17Z" fill="#1E293B" stroke="#0F172A" stroke-width="1.8"/>
      </g>
      <path class="it-wave" d="M3 26.5C7 24.5 11 28.5 16 26.5C21 24.5 25 28.5 29 26.5" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,

  boat: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g class="it-bob">
        <path d="M7 14H23L25 18H6L7 14Z" fill="#FFF7ED" stroke="#1E3A8A" stroke-width="1.8"/>
        <path d="M4 18H28L24.5 23.5H7.5L4 18Z" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.8"/>
        <path d="M10 14V10H20V14" stroke="#EA580C" stroke-width="2" fill="#F97316"/>
      </g>
      <path class="it-wave" d="M3 27C7 25 11 29 16 27C21 25 25 29 29 27" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,

  bus: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g class="it-bob">
        <rect x="4" y="8" width="24" height="14" rx="3.5" fill="#2563EB" stroke="#1E3A8A" stroke-width="2"/>
        <rect x="7" y="10.5" width="5" height="4.5" rx="1" fill="#E0F2FE"/>
        <rect x="13.5" y="10.5" width="5" height="4.5" rx="1" fill="#E0F2FE"/>
        <rect x="20" y="10.5" width="5.5" height="4.5" rx="1" fill="#E0F2FE"/>
        <path d="M4 18H28" stroke="#FACC15" stroke-width="2.2"/>
      </g>
      <circle cx="9.5" cy="23.5" r="2.5" fill="#1F2937" stroke="#F8FAFC" stroke-width="1.2"/>
      <circle cx="22.5" cy="23.5" r="2.5" fill="#1F2937" stroke="#F8FAFC" stroke-width="1.2"/>
    </svg>`,

  thailand: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M13 4L18 6L21 10L19 15L15 17L16 23L14 28L11.5 26L12.5 20L10 16L11 10L13 4Z" fill="#4ADE80" stroke="#166534" stroke-width="2" stroke-linejoin="round"/>
      <circle class="it-pulse-soft" cx="14.5" cy="14.5" r="2.4" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.2"/>
      <circle cx="14.5" cy="7.5" r="1.4" fill="#FACC15"/>
      <circle cx="13.5" cy="25" r="1.4" fill="#FACC15"/>
    </svg>`,

  map: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 8L12 5L20 8L28 5V24L20 27L12 24L4 27V8Z" fill="#FEF3C7" stroke="#25201B" stroke-width="2" stroke-linejoin="round"/>
      <path d="M12 5V24M20 8V27" stroke="#B45309" stroke-width="1.5" stroke-dasharray="2 2"/>
      <path d="M7 18L14 14L24 16" stroke="#16A34A" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M12 10L18 20" stroke="#2563EB" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,

  soundOn: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 12H11.5L18 7V25L11.5 20H6V12Z" fill="#25201B"/>
      <path class="it-pulse-soft" d="M21.5 11.5C23.5 13.5 23.5 18.5 21.5 20.5" stroke="#16A34A" stroke-width="2.4" stroke-linecap="round"/>
      <path class="it-pulse-soft" d="M25 8.5C28.2 12 28.2 20 25 23.5" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,

  soundOff: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 12H11.5L18 7V25L11.5 20H6V12Z" fill="#94A3B8"/>
      <path d="M22 12L28 20M28 12L22 20" stroke="#DC2626" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,

  clock: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="11.5" fill="#FFFFFF" stroke="#25201B" stroke-width="2.2"/>
      <path d="M16 9V16L21 19" stroke="#EA580C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="16" r="1.7" fill="#25201B"/>
    </svg>`,

  passengers: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="12" cy="11" r="3.5" fill="#F59E0B" stroke="#25201B" stroke-width="1.6"/>
      <path d="M6.5 24C6.5 19.8 8.8 17.5 12 17.5C15.2 17.5 17.5 19.8 17.5 24" fill="#3B82F6" stroke="#25201B" stroke-width="1.6"/>
      <circle cx="21" cy="12" r="3" fill="#FBBF24" stroke="#25201B" stroke-width="1.5"/>
      <path d="M17 24C17 20.5 18.8 18.5 21.2 18.5C23.8 18.5 25.5 20.5 25.5 24" fill="#10B981" stroke="#25201B" stroke-width="1.5"/>
    </svg>`,

  star: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path class="it-pulse-soft" d="M16 4L19.6 11.4L27.8 12.6L21.9 18.3L23.3 26.5L16 22.6L8.7 26.5L10.1 18.3L4.2 12.6L12.4 11.4L16 4Z" fill="#FACC15" stroke="#B45309" stroke-width="1.9" stroke-linejoin="round"/>
    </svg>`,

  close: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,

  homeCam: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 15L16 6L27 15V26H19V19H13V26H5V15Z" fill="#FFFDF5" stroke="#25201B" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`,

  save: (cls = '') => `
    <svg class="it-icon ${cls}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 6H22L26 10V26H6V6Z" fill="#E2E8F0" stroke="#25201B" stroke-width="2" stroke-linejoin="round"/>
      <rect x="10" y="6" width="10" height="7" fill="#FFFFFF" stroke="#25201B" stroke-width="1.6"/>
      <rect x="10" y="17" width="12" height="9" fill="#3B82F6" stroke="#25201B" stroke-width="1.6"/>
    </svg>`,
};

export function iconForCategory(category) {
  switch (category) {
    case 'condo': return ICONS.condo();
    case 'hotel': return ICONS.hotel();
    case 'mall': return ICONS.mall();
    case 'restaurant': return ICONS.restaurant();
    case 'market': return ICONS.market();
    case 'school': return ICONS.school();
    case 'attraction': return ICONS.star();
    case 'seven': return ICONS.sevenEleven();
    default: return ICONS.star();
  }
}

export function iconForWeather(weatherId, isNight = false) {
  if (weatherId === 'flood') return ICONS.flood();
  if (weatherId === 'rain') return ICONS.rain();
  if (weatherId === 'cloudy') return ICONS.cloudy();
  return isNight ? ICONS.night() : ICONS.sun();
}
