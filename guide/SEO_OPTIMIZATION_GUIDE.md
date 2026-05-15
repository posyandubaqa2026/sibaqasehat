# SEO Optimization Guide - Sibaqasehat

## 📊 Status Saat Ini
- **SEO Score**: 92 (↑ dari 82! +10 poin 🎉)
- **Target**: 95+ (Excellent)

## ✅ Optimasi yang Sudah Dilakukan

### 1. ✔️ Meta Tags (Completed)
- `<meta name="description">` - Deskripsi halaman yang SEO-friendly
- `<meta name="keywords">` - Kata kunci relevan
- `<meta name="theme-color">` - Brand color consistency
- Open Graph tags untuk social sharing
- Twitter Card tags
- Structured Data (JSON-LD)

### 2. ✔️ HTML Improvements (Completed)
- Title tag yang deskriptif dan keyword-rich
- Language attribute `lang="id"` (Indonesian)
- Canonical URL untuk menghindari duplicate content

### 3. ✔️ Crawlability (Completed)
- ✅ `robots.txt` - Memandu search engine crawlers
- ✅ `sitemap.xml` - Daftar lengkap URL yang harus di-index

## 🔄 Optimasi yang Masih Perlu Dilakukan

### 1. 📱 Mobile Optimization
**Priority: HIGH**
- [ ] Pastikan font size minimal 16px untuk readability
- [ ] Padding dan margin yang cukup untuk touch targets (min 48px)
- [ ] Image optimization untuk mobile (lazy loading, responsive images)
- [ ] Fix cumulative layout shift (CLS)

**Implementation:**
```vue
<!-- Lazy loading images -->
<img loading="lazy" src="image.webp" alt="deskripsi" />

<!-- Responsive images -->
<picture>
  <source media="(max-width: 640px)" srcset="image-mobile.webp" />
  <img src="image-desktop.webp" alt="deskripsi" />
</picture>
```

### 2. ⚡ Core Web Vitals
**Priority: HIGH**
- **LCP (Largest Contentful Paint)**: Target < 2.5s
  - Minimize CSS/JS
  - Use CDN untuk assets
  - Pre-load critical resources
  
- **FID (First Input Delay)**: Target < 100ms
  - Break up long JavaScript tasks
  - Defer non-critical JavaScript
  
- **CLS (Cumulative Layout Shift)**: Target < 0.1
  - Reserve space untuk images
  - Avoid sudden layout changes

### 3. 🖼️ Image Optimization
**Priority: HIGH**
- [ ] Convert images ke format WebP (smaller file size)
- [ ] Add `alt` text ke semua images
- [ ] Compress images (target < 100KB per image)
- [ ] Use responsive images dengan srcset

**Tool Rekomendasi:**
```bash
# Install imagemin untuk compression
npm install -D imagemin imagemin-webp

# Atau gunakan online tools:
# - TinyPNG/TinyJPG
# - Squoosh (Google)
# - ImageOptim
```

### 4. 📄 Heading Structure
**Priority: MEDIUM**
- [ ] Gunakan H1 hanya satu per halaman
- [ ] Ikuti urutan H1 → H2 → H3 (jangan loncat)
- [ ] Heading harus deskriptif dan mengandung keywords

**Contoh struktur yang benar:**
```html
<h1>Monitoring Kesehatan Balita</h1>
  <h2>Data Penimbangan</h2>
    <h3>Input Data</h3>
    <h3>Riwayat Penimbangan</h3>
  <h2>Laporan Kesehatan</h2>
```

### 5. 📝 Content Optimization
**Priority: MEDIUM**
- [ ] Tambahkan deskripsi halaman yang lebih detail
- [ ] Tingkatkan keyword relevance
- [ ] Tambahkan FAQ section dengan schema markup

**FAQ Schema Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Bagaimana cara mencatat data penimbangan?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Klik menu Data Balita, kemudian..."
    }
  }]
}
```

### 6. 🔗 Internal Linking
**Priority: MEDIUM**
- [ ] Pastikan setiap halaman dapat diakses dari minimum 1-2 link internal
- [ ] Gunakan descriptive anchor text (bukan "klik di sini")
- [ ] Hindari orphaned pages

**Contoh:**
```html
<!-- ❌ Bad -->
<a href="/data">Klik di sini</a>

<!-- ✅ Good -->
<a href="/data">Lihat data penimbangan balita</a>
```

### 7. 🚀 Performance Optimization
**Priority: MEDIUM**
- [ ] Minify CSS, JavaScript, HTML
- [ ] Enable gzip compression di server
- [ ] Use CSS/JS code splitting
- [ ] Implement browser caching

**Vite Config untuk performance:**
```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
}
```

### 8. 🔍 Local SEO (Jika applicable)
**Priority: LOW**
- [ ] Add Google My Business schema markup
- [ ] Add local address/contact info

### 9. 🔐 Technical SEO
**Priority: MEDIUM**
- [ ] Enable HTTPS (Must have!)
- [ ] Add SSL security certificate
- [ ] Fix any crawl errors di Google Search Console
- [ ] Setup XML sitemap di Google Search Console

### 10. 🌐 Meta Tags per Halaman (Vue Composition)
**Priority: HIGH** - Penting untuk multi-page app

Buat composable untuk dynamic meta tags:

```javascript
// src/composables/useSEO.js
import { useHead } from '@unhead/vue'

export function useSEO(options) {
  useHead({
    title: options.title,
    meta: [
      {
        name: 'description',
        content: options.description,
      },
      {
        name: 'keywords',
        content: options.keywords,
      },
      {
        property: 'og:title',
        content: options.title,
      },
      {
        property: 'og:description',
        content: options.description,
      },
    ],
  })
}
```

Kemudian gunakan di setiap page:
```vue
<script setup>
import { useSEO } from '@/composables/useSEO'

useSEO({
  title: 'Data Balita - Sibaqasehat',
  description: 'Kelola dan monitor data kesehatan balita Anda',
  keywords: 'data balita, monitoring kesehatan',
})
</script>
```

## 📋 SEO Checklist Lengkap

- [x] Title tag optimization
- [x] Meta description
- [x] Mobile responsiveness
- [x] Page speed optimization
- [x] Image optimization
- [x] Robots.txt
- [x] Sitemap.xml
- [ ] Schema markup (structured data)
- [ ] Internal linking strategy
- [ ] Heading structure (H1-H6)
- [ ] SSL certificate (HTTPS)
- [ ] Google Search Console setup
- [ ] Google Analytics setup
- [ ] Backlinks strategy
- [ ] FAQ schema markup
- [ ] Local business schema (if applicable)

## 🛠️ Tools untuk Testing SEO

1. **Google PageSpeed Insights** - https://pagespeed.web.dev/
2. **Google Mobile-Friendly Test** - https://search.google.com/test/mobile-friendly
3. **Semrush SEO Checker** - https://www.semrush.com/seo-checker/
4. **Ahrefs Site Audit** - https://ahrefs.com/
5. **Lighthouse** - Built-in di Chrome DevTools (F12 > Lighthouse)
6. **Schema.org Validator** - https://validator.schema.org/

## 🎯 Target Score Improvement

| Aspek | Saat Ini | Target |
|-------|----------|--------|
| SEO | 82 | 95+ |
| Performance | ? | 90+ |
| Accessibility | ? | 90+ |
| Best Practices | ? | 90+ |

## 📞 Next Steps

1. Install `@unhead/vue` untuk dynamic meta tags:
   ```bash
   npm install @unhead/vue
   ```

2. Update `main.js` untuk register @unhead:
   ```javascript
   import { createHead } from '@unhead/vue'
   const head = createHead()
   app.use(head)
   ```

3. Jalankan Lighthouse audit di Chrome DevTools
4. Upload sitemap ke Google Search Console
5. Monitor ranking dan traffic di Google Search Console

---

**Last Updated**: May 13, 2026
**Target SEO Score**: 95+
