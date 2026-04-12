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
    id: 'bumil', label: 'Ibu Hamil',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
      <path d="M5 10c0 3 1.5 6 4 6s4-3 4-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'lansia', label: 'Lansia',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
      <path d="M4 17v-3a5 5 0 0110 0v3M9 11v4M7 13h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'imunisasi', label: 'Imunisasi',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 3l4 4-8 8-4-4 8-8zM9 5l4 4M2 16l2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'kegiatan', label: 'Kegiatan',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.4"/>
      <path d="M2 7h14M6 1v4M12 1v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'stok', label: 'Stok & Obat',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4" y="2" width="10" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/>
      <path d="M7 6h4M7 9h4M7 12h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
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
