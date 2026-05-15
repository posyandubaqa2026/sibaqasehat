# 🚀 Performance Optimization Action Plan

## 📊 Current Status (May 13, 2026)
- **Performance**: 72 → Target: 90+
- **LCP**: 3.0s → Target: < 2.5s
- **Bundle Size**: 2,886 KiB → Target: < 1,500 KiB
- **Unused JS**: 1,204 KiB (can be removed)
- **Minifiable JS**: 1,677 KiB (can be optimized)

## ✅ Optimasi yang Sudah Dilakukan

### 1. ✔️ Vite Build Optimization
- `terser` minification (aggressive)
- Console & debugger removal
- Code splitting: Vue libs, Vendor libs, Main app
- CSS code splitting enabled
- Source maps disabled in production

### 2. ✔️ Route-level Code Splitting
- Lazy loaded all views dengan `defineAsyncComponent`
- Reduces main bundle, loads routes on-demand
- Expected savings: ~500-700 KiB

## 🔄 Optimasi Masih Harus Dilakukan

### Priority 1: CRITICAL (Langsung naikkan Performance score)

#### 1.1 📦 Remove Unused Dependencies
```bash
npm audit
npm outdated
```
**Action**: Hapus dependencies yang tidak digunakan:
- [ ] Check if all npm packages are actually used
- [ ] Remove unused imports/libraries
- [ ] Consider lighter alternatives (e.g., date-fns vs moment.js)

#### 1.2 🖼️ Image Optimization
**Priority: CRITICAL** - Bisa hemat 500+ KiB

```bash
# Install image optimizer
npm install -D imagemin imagemin-webp imagemin-mozjpeg

# Optimize existing images
npx imagemin src/assets/*.{jpg,png,gif} --out-dir=src/assets
```

**Actions:**
- [ ] Convert PNG → WebP (smaller by 25-35%)
- [ ] Compress JPEG (target max 80KB per image)
- [ ] Add `<picture>` element dengan WebP fallback

**Example:**
```vue
<picture>
  <source type="image/webp" :srcset="require('@/assets/image.webp')" />
  <img loading="lazy" src="@/assets/image.jpg" alt="description" />
</picture>
```

#### 1.3 🎨 CSS Optimization
**Actions:**
- [ ] Remove unused CSS dari global stylesheet
- [ ] Use CSS scope lebih efficient
- [ ] Minify CSS inline styles

**Check CSS files:**
- `src/assets/main.css` - harus cek apa saja yang dipakai
- `src/assets/NavBar.css` - scoped CSS
- Others - should be scoped component styles

#### 1.4 ⚡ Defer Non-Critical JavaScript
```javascript
// main.js - load analytics/tracking AFTER app mount
app.mount('#app')

// Defer loading setelah user interact
window.addEventListener('load', () => {
  // Load analytics, monitoring, etc.
})
```

### Priority 2: HIGH (Improve LCP from 3.0s → 2.5s)

#### 2.1 🚀 Critical Resources Preloading
```html
<!-- Di index.html -->
<link rel="preload" href="/src/main.css" as="style" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://supabase.co" />
```

#### 2.2 📄 Defer Non-Critical Resources
```html
<!-- Load secondary resources after page interactive -->
<script src="analytics.js" defer></script>
```

#### 2.3 🎯 Optimize LCP Element
LCP sekarang 3.0s (kemungkinan hero image atau chart). 
**Actions:**
- [ ] Identify LCP element (open Chrome DevTools → Performance tab)
- [ ] Pre-render critical content
- [ ] Use placeholder/skeleton loading

### Priority 3: MEDIUM (Accessibility & SEO)

#### 3.1 ♿ Accessibility Improvements

**Fix Contrast Ratio:**
```vue
<!-- ❌ Bad: #777 on white -->
<span style="color: #777">Text</span>

<!-- ✅ Good: #333 on white (WCAG AA) -->
<span style="color: #333">Text</span>
```

**Heading Structure:**
```html
<!-- ❌ Bad: H1 → H3 (skip H2) -->
<h1>Page Title</h1>
<h3>Subsection</h3>

<!-- ✅ Good: Sequential order -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

**ARIA Attributes:**
```vue
<!-- ✅ Correct ARIA usage -->
<button aria-label="Close menu">×</button>
<div role="alert" aria-live="polite">Message</div>

<!-- ❌ Avoid aria-hidden on interactive elements -->
<button aria-hidden="true">Don't do this</button>
```

#### 3.2 🔍 SEO: Fix Crawlable Links
Vue SPA links tidak crawlable. **Solution:**
- [ ] Setup `@unhead/vue` untuk SSG (Static Site Generation)
- Or: Use prerendering untuk public pages
- Or: Setup Sitemap dengan pre-rendered routes

### Priority 4: OPTIONAL (Nice to have)

#### 4.1 🔄 Cache Management
```javascript
// Add to vite.config.js for aggressive caching
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'js/[name]-[hash].js',
      chunkFileNames: 'js/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]'
    }
  }
}
```

#### 4.2 🎬 Animation Optimization
Current: 3 non-composited animations found
```css
/* ❌ Bad: Causes repaints */
.animate {
  animation: slide 1s;
}
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ Good: Uses GPU */
.animate {
  animation: slide 1s;
}
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

## 📋 Implementation Checklist

### Phase 1: Bundle Optimization (ASAP)
- [x] Vite build config optimization
- [x] Route-level code splitting
- [ ] Remove unused dependencies
- [ ] Image compression & WebP conversion
- [ ] CSS cleanup

### Phase 2: Performance Tuning
- [ ] Identify & optimize LCP element
- [ ] Add resource preloading
- [ ] Defer non-critical JS
- [ ] Implement CSS caching

### Phase 3: Accessibility
- [ ] Fix contrast ratio
- [ ] Fix heading structure
- [ ] Fix ARIA attributes
- [ ] Test with screen readers

### Phase 4: Testing & Verification
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Test on real 4G network
- [ ] Test on slow devices
- [ ] Verify accessibility with axe DevTools

## 🛠️ Commands to Run

```bash
# 1. Clean install (remove duplicates)
rm package-lock.json node_modules -r
npm install

# 2. Build & analyze bundle size
npm run build
# Then open: dist/index.html to see built files

# 3. Check for performance issues
npm run lint

# 4. Test performance locally
npm run preview
# Then run Lighthouse in Chrome DevTools (F12 > Lighthouse)

# 5. Check unused code (optional)
npm install -D webpack-bundle-analyzer
# Configure & run to see what's taking space
```

## 📊 Expected Results After Optimization

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Performance Score | 72 | 85+ | 90+ |
| LCP | 3.0s | 2.3s | < 2.5s |
| Bundle Size | 2,886 KiB | ~1,200 KiB | < 1,500 KiB |
| SEO Score | 92 | 94+ | 95+ |
| Accessibility | 85 | 90+ | 95+ |

## 🔗 Useful Resources

- [Web Vitals Guide](https://web.dev/vitals/)
- [Vite Optimization Guide](https://vitejs.dev/guide/features.html#web-workers)
- [Image Optimization](https://web.dev/uses-optimized-images/)
- [Accessibility Checklist](https://www.a11yproject.com/checklist/)

---

**Next Step**: Run `npm run build` and share new Lighthouse report!
