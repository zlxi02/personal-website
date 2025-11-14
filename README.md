# Personal Website

A minimalist static site generator built from scratch, optimized for simplicity and performance.

## Architecture Overview

This project implements a custom static site generator in ~160 lines of JavaScript, deliberately avoiding heavyweight frameworks in favor of composable Unix-philosophy tools. The architecture prioritizes build-time rendering over runtime complexity.

### Design Philosophy

**Static-First Architecture**: All content is pre-rendered at build time, eliminating server-side processing, databases, and runtime dependencies. This results in:
- Sub-100ms page loads (just HTML/CSS delivery)
- Zero compute costs at serving time
- Trivial horizontal scaling (static files on CDN)
- Elimination of entire classes of security vulnerabilities (no server-side code execution)

**Markdown as Source of Truth**: Content lives in plain-text Markdown files, providing:
- Git-friendly diffs for content changes
- No vendor lock-in (portable to any system)
- Write-focused workflow (no CMS UI overhead)
- Version control for content alongside code

**Inlined CSS Strategy**: Rather than external stylesheets, CSS is embedded directly in HTML (`<style>` tags), which:
- Eliminates render-blocking requests (critical path = 1 HTTP request)
- Removes cache invalidation complexity
- Trades minor HTML size increase for guaranteed first-paint performance
- Acceptable tradeoff for small sites (<10KB CSS)

## Technical Stack

### Core Dependencies
- **marked**: Markdown parser with GFM (GitHub Flavored Markdown) support
- **marked-gfm-heading-id**: Auto-generates heading IDs for anchor links
- **marked-footnote**: Academic-style footnote syntax
- Custom extensions: Definition lists, embedded tweets

### Build Process

```
pages/*.md → [marked parser] → HTML → [template injection] → dist/*.html
                                  ↓
                            [CSS inlining]
                                  ↓
                          [asset copying]
```

**Build Command**: `node build.js`

The build system:
1. Recursively traverses `pages/` directory
2. Converts Markdown to HTML via marked's AST transformation
3. Extracts first H1 as page title (or falls back to filename)
4. Injects rendered HTML + CSS into template
5. Writes to `dist/` with preserved directory structure
6. Copies static assets (images, favicons) to dist
7. Generates RSS feed from dated posts in `pages/writing/`

**Development Mode**: `node dev.js` runs a file watcher that rebuilds on changes (no hot-reload overhead, just rebuild + refresh).

## File Structure

```
personal-website/
├── pages/              # Markdown source files
│   ├── index.md        # Homepage content
│   └── writing/        # Blog posts (YYYY-MM-DD-slug.md naming)
├── dist/               # Build output (gitignored, deployable artifact)
├── assets/             # Static files (images, etc.)
├── public/             # Root-level files (favicon, robots.txt)
├── styles.css          # Global styles (inlined at build time)
├── build.js            # Production build script
├── dev.js              # Development file watcher
├── watcher.js          # File system watch utility
├── marked-*.js         # Custom markdown extensions
└── package.json        # Dependency manifest
```

## Styling Approach

### CSS Architecture

**Single Stylesheet Pattern**: All styles in `styles.css` (257 lines), structured as:
1. CSS variables for theme tokens (colors, spacing)
2. Base/reset styles
3. Typography hierarchy
4. Component-specific overrides
5. Media queries for responsive behavior

**Dark Mode**: Automatic via `prefers-color-scheme` media query, swapping CSS variable values rather than duplicating styles.

**Typographic Scale**: 
- Base: 18px Georgia (serif, optimized for long-form reading)
- Headings: 1.5x–2.5x base size
- Line-height: 1.6 (slightly loose for comfortable reading)
- Max-width: 650px (optimal line length: 60-75 characters)

**No Class Names**: Relies entirely on semantic HTML + descendant/sibling selectors (e.g., `h1 + p` for subtitle styling, `hr + p` for tighter spacing). This works because:
- Single-page sites have predictable structure
- Semantic HTML provides sufficient selector specificity
- Avoids class naming bikeshedding
- Forces good HTML structure

## Performance Characteristics

### Metrics (Estimated)
- **HTML size**: ~10KB (gzipped: ~3KB)
- **CSS size**: ~4KB (gzipped: ~1.5KB)
- **Total page weight**: <15KB (excluding images)
- **First Contentful Paint**: <200ms (on fast connection)
- **Time to Interactive**: Immediate (no JavaScript)

### Optimization Strategies
1. **Zero JavaScript**: Entire site functions with JS disabled
2. **Inlined critical CSS**: Eliminates render-blocking requests
3. **Semantic HTML**: Faster parsing, better accessibility
4. **Static generation**: Server only serves pre-rendered files
5. **CDN distribution**: Netlify's edge network for global low-latency

## Deployment Pipeline

**Hosting**: Netlify (free tier)
**Domain**: Porkbun (~$10/year)
**SSL**: Automatic via Netlify (Let's Encrypt)

### Deployment Flow
1. Push to GitHub (`git push`)
2. Netlify webhook triggers build
3. Netlify runs `node build.js`
4. Deploys `dist/` to global CDN
5. Atomic deployment (no partial updates)
6. Instant rollback available (previous builds cached)

**DNS Configuration**: Porkbun nameservers pointed to Netlify's authoritative nameservers, allowing Netlify to manage DNS + SSL provisioning.

## RSS Feed Generation

Automatically scans `pages/writing/` for posts with `YYYY-MM-DD-slug.md` naming convention:
- Extracts title from first H1
- Extracts date from filename
- Sorts by date (descending)
- Generates RSS 2.0 XML at `/rss.xml`

## Extensibility

### Adding New Pages
1. Create `pages/new-page.md`
2. Write Markdown content
3. Run `node build.js`
4. Page appears at `/new-page.html`

### Adding Blog Posts
1. Create `pages/writing/YYYY-MM-DD-title.md`
2. Start with H1 title
3. Build → Post appears in RSS feed

### Custom Markdown Extensions
See `marked-*.js` files for examples:
- `marked-definition-list.js`: `term\n: definition` syntax
- `marked-tweet.js`: Embed tweets via custom syntax

## Tradeoffs & Limitations

### Advantages
✅ **Simplicity**: Entire build system understandable in <1 hour  
✅ **Performance**: Minimal page weight, instant loads  
✅ **Cost**: $10/year (domain only)  
✅ **Security**: No server-side attack surface  
✅ **Portability**: Plain Markdown + HTML, no vendor lock-in  

### Limitations
❌ **No dynamic content**: Comments, search, etc. require external services  
❌ **Build required**: Can't edit content in production (by design)  
❌ **No template inheritance**: Shared layouts require duplication or more complex templating  
❌ **Limited rich media**: No image optimization pipeline (manual optimization required)  
❌ **Single-language**: No i18n support  

## Future Considerations

**If scaling to 100+ pages:**
- Incremental builds (only rebuild changed pages)
- Image optimization pipeline (responsive images, WebP conversion)
- Template partials/includes for DRYer HTML
- Client-side search (pre-built index)

**If adding interactivity:**
- Progressive enhancement with minimal JS
- Web Components for isolated interactive elements
- Avoid full SPA frameworks (defeats static site benefits)

**If collaborating:**
- CMS integration (Netlify CMS, Forestry, etc.)
- Automated image optimization on commit
- Preview deploys for branches

## Why Not Use [Framework X]?

**Hugo/Jekyll/Gatsby/Next.js comparison:**

| Framework | Complexity | Build Time | Output Size | Flexibility |
|-----------|-----------|-----------|-------------|-------------|
| This project | ~160 LOC | <100ms | ~15KB | Total control |
| Hugo | Medium | Fast | Small | Opinionated |
| Jekyll | Medium | Slow | Small | Ruby dependency |
| Gatsby | High | Very slow | Large | React overhead |
| Next.js | High | Medium | Large | Over-engineered for static |

**Decision**: For a personal site with <20 pages, a custom generator provides:
- Full understanding of build process
- No framework upgrade churn
- Minimal dependencies (3 npm packages vs 100+)
- Learning opportunity

## License

Do whatever you want with this code.

---

*Built by Zach while procrastinating on other things*

