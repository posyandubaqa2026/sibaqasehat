# ♿ Accessibility Improvements Guide

## 📊 Current Score: 85/100

### Issues Found:
1. ⚠️ **Contrast Ratio** - Text tidak cukup kontras
2. ⚠️ **ARIA Attributes** - Element menggunakan ARIA yang prohibited
3. ⚠️ **Heading Structure** - Heading tidak terurut sequential

---

## 🔴 Issue 1: Contrast Ratio

### Problem
Background dan foreground colors tidak memiliki contrast ratio yang cukup untuk WCAG compliance.

### WCAG Standards:
- **AA**: 4.5:1 (normal text), 3:1 (large text)
- **AAA**: 7:1 (normal text), 4.5:1 (large text)

### Solusi

#### Cek Warna Saat Ini:
```bash
# Install color contrast checker
npm install -D color-contrast-checker
```

#### Perbaiki CSS di: `src/assets/main.css` dan component styles

**Example Perbaikan:**
```css
/* ❌ BAD: #666 on white (1.3:1 - FAIL) */
.subtitle {
  color: #666;
  background: white;
}

/* ✅ GOOD: #333 on white (7.5:1 - WCAG AAA) */
.subtitle {
  color: #333;
  background: white;
}

/* ✅ GOOD: #0066cc on white (5.3:1 - WCAG AA) */
.link {
  color: #0066cc;
  background: white;
}
```

#### Tools untuk cek contrast:
- Chrome DevTools: Inspect element → Accessibility tab
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Stark](https://www.getstark.co/) - Figma plugin

**Action Items:**
- [ ] Review `src/assets/main.css` - cari warna terang (#aaa, #bbb, #999)
- [ ] Review `src/assets/NavBar.css` - cek link colors
- [ ] Review `src/assets/SideNavBar.css` - cek active states
- [ ] Review component inline styles

---

## 🔴 Issue 2: ARIA Attributes

### Problem
Elements menggunakan ARIA attributes yang tidak sesuai atau prohibited.

### Solusi

#### ❌ Incorrect ARIA Usage:
```vue
<!-- WRONG: aria-hidden on interactive element -->
<button aria-hidden="true">Click me</button>

<!-- WRONG: Invalid aria-label syntax -->
<div aria-label="">Content</div>

<!-- WRONG: Redundant ARIA -->
<img alt="Photo" aria-label="Photo" />
```

#### ✅ Correct ARIA Usage:
```vue
<!-- For buttons -->
<button aria-label="Close dialog">×</button>

<!-- For icons -->
<svg aria-label="Home icon" role="img">...</svg>

<!-- For live regions -->
<div role="status" aria-live="polite">
  Status message
</div>

<!-- For form validation -->
<input aria-invalid="true" aria-describedby="error-msg" />
<span id="error-msg">This field is required</span>

<!-- For expanded/collapsed -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu">...</ul>
```

**Action Items:**
- [ ] Search semua file `.vue` untuk `aria-` attributes
- [ ] Remove prohibited ARIA attributes
- [ ] Validate ARIA values
- [ ] Add descriptive aria-labels untuk icons

**Files to check:**
- `src/components/NavBar.vue`
- `src/components/SideNavBar.vue`
- `src/views/*.vue` - semua views

---

## 🔴 Issue 3: Heading Structure

### Problem
Heading elements tidak dalam urutan sequential (H1 → H2 → H3).

### Correct Structure:
```html
<h1>Main Page Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
    <h3>Subsection 2.1</h3>
```

### ❌ Incorrect Structure:
```html
<!-- WRONG: Skip H2 -->
<h1>Title</h1>
<h3>Content</h3>

<!-- WRONG: Multiple H1 -->
<h1>Title 1</h1>
<h1>Title 2</h1>

<!-- WRONG: H2 before H1 -->
<h2>Not main title</h2>
<h1>Main title</h1>
```

### ✅ Recommended Vue Structure:
```vue
<template>
  <main>
    <h1>{{ pageTitle }}</h1>
    
    <section>
      <h2>Section Title</h2>
      <p>Content...</p>
      
      <h3>Subsection</h3>
      <p>More content...</p>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'

const pageTitle = computed(() => 'Sibaqasehat Dashboard')
</script>
```

**Files to check:**
- `src/views/PageHome.vue` - harus punya H1
- `src/views/DataBalita.vue` - check heading order
- `src/views/HasilPenimbangan.vue` - check heading order
- `src/views/KlasifikasiBalita.vue` - check heading order
- `src/views/LaporanBulanan.vue` - check heading order

**Action Items:**
- [ ] Add H1 ke setiap main view
- [ ] Structure headings H1 → H2 → H3
- [ ] One H1 per page maximum
- [ ] Use semantic HTML (`<main>`, `<section>`, `<article>`)

---

## 🔧 Implementation Steps

### Step 1: Identify Issues (15 min)
```bash
# Use axe DevTools Chrome Extension
# OR use automated auditing
```

### Step 2: Fix Contrast Ratio (30 min)
```bash
# Update CSS colors in:
# 1. src/assets/main.css
# 2. src/assets/NavBar.css
# 3. src/assets/SideNavBar.css
# 4. Component inline styles
```

**Common updates:**
```css
/* Global text color */
body { color: #1a1a1a; } /* instead of #666 */

/* Links */
a { color: #0066cc; } /* instead of #0099ff */

/* Disabled state */
button:disabled { color: #666; opacity: 0.6; }

/* Form elements */
input { color: #1a1a1a; }
```

### Step 3: Fix ARIA Attributes (20 min)
Find & replace dalam Vue files:
```bash
# Search for all aria- usage
grep -r "aria-" src/
```

### Step 4: Fix Heading Structure (25 min)
Update each view to have proper heading hierarchy.

### Step 5: Test Accessibility (10 min)
```bash
# Use Chrome DevTools
# 1. F12 → Lighthouse → Accessibility
# 2. Run axe DevTools
# 3. Run WAVE Extension
# 4. Keyboard navigation test
```

---

## 🧪 Testing Checklist

- [ ] **Lighthouse Audit** - Run in Chrome DevTools (F12 > Lighthouse)
- [ ] **axe DevTools** - Chrome/Firefox extension
- [ ] **WAVE** - WebAIM Web Accessibility Evaluation Tool
- [ ] **Keyboard Navigation** - Tab through all elements
- [ ] **Screen Reader** - Test with NVDA (Windows) or JAWS
- [ ] **Color Blind** - Use Stark or similar tool
- [ ] **Mobile** - Test on phone with screen reader

---

## 📊 Expected Improvements

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Accessibility Score | 85 | 92+ | 95+ |
| Contrast Issues | Multiple | 0 | 0 |
| ARIA Issues | Multiple | 0 | 0 |
| Heading Issues | Yes | No | No |

---

## 📚 Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/fundamentals/)
- [Chrome DevTools Accessibility](https://developer.chrome.com/docs/devtools/accessibility/reference/)
- [MDN: Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

**Last Updated**: May 13, 2026
**Target Accessibility Score**: 95+
