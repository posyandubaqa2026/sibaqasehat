// Navigation items for sidebar
export const navItems = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
      <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
    </svg>`
  },
  {
    id: 'balita', label: 'Data Balita',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.4"/>
      <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'penimbangan', label: 'Hasil Penimbangan',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 15h12M9 1v13M3 8h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="9" cy="3" r="1.5" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="6" cy="10" r="1.5" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="12" cy="10" r="1.5" stroke="currentColor" stroke-width="1.4"/>
    </svg>`
  },
  {
    id: 'klasifikasi', label: 'Klasifikasi Balita',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
      <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7M9 5v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
]

// Report items for sidebar
export const reportItems = [
  {
    id: 'laporan_bulanan', label: 'Laporan Bulanan',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 14V5l6-3 6 3v9l-6 3-6-3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M9 2v12M3 5l6 3 6-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'pengaturan', label: 'Pengaturan',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.4"/>
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
]

// All navigation items combined
export const allNav = [...navItems, ...reportItems]
