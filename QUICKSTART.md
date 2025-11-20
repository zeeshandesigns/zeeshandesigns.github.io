# ZYNK WEBSITE - QUICK REFERENCE

## 🚀 Essential Commands

```powershell
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript validation

# Component Development
npm run storybook        # Browse components (localhost:6006)
npm run build-storybook  # Build Storybook static site
```

## 📂 Key Files to Edit

### Content
- `src/pages/Home.tsx` - Homepage with hero, services, projects
- `src/pages/Services.tsx` - Services listing
- `src/pages/Projects.tsx` - Projects with filtering
- `src/pages/About.tsx` - Company info and timeline
- `src/pages/Contact.tsx` - Contact form

### Design System
- `src/design/tokens.css` - Colors, spacing, typography
- `src/styles/globals.css` - Global styles and fonts

### Layout
- `src/components/layout/Header.tsx` - Navigation
- `src/components/layout/Footer.tsx` - Footer with links

### Configuration
- `vite.config.ts` - Build configuration
- `package.json` - Dependencies and scripts
- `.eslintrc.cjs` - Linting rules

## 🎨 Design Tokens Reference

### Colors
```css
--color-accent: #0B63FF;        /* Primary blue */
--color-bg: #0F1724;            /* Dark background */
--color-surface: #FFFFFF;       /* Cards/surfaces */
--color-text: #0B1220;          /* Primary text */
--color-muted: #6B7280;         /* Secondary text */
```

### Spacing
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 40px;
--space-xxl: 64px;
```

### Typography
```css
--fs-xs: 12px;
--fs-sm: 14px;
--fs-base: 16px;
--fs-md: 18px;
--fs-lg: 24px;
--fs-xl: 36px;
--fs-xxl: 48px;
```

## 🧩 Component Usage Examples

### Button
```tsx
import { Button } from '@components/ui/Button';
import { ArrowRightIcon } from '@components/ui/Icon';

<Button variant="primary" size="lg" iconAfter={<ArrowRightIcon />}>
  Get Started
</Button>
```

### Input
```tsx
import { Input } from '@components/ui/Input';

<Input
  label="Email"
  type="email"
  required
  fullWidth
  placeholder="you@company.com"
/>
```

### Card
```tsx
import { Card } from '@components/ui/Card';

<Card
  title="Web Development"
  description="Custom websites built with React"
  tags={['React', 'TypeScript']}
  image="/assets/images/service.jpg"
/>
```

## 📱 Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

## 🔧 Common Tasks

### Add a new page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add link in `src/components/layout/Header.tsx`

### Change brand colors
Edit `src/design/tokens.css`:
```css
:root {
  --color-accent: #YOUR_COLOR;
}
```

### Add new icon
Edit `src/components/ui/Icon.tsx`:
```tsx
export function YourIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      {/* SVG path */}
    </svg>
  );
}
```

### Update social links
Edit `src/components/layout/Footer.tsx`:
```tsx
const socialLinks = [
  { label: 'LinkedIn', href: 'YOUR_URL', icon: LinkedInIcon },
  // ...
];
```

## 🚢 Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Update `base` in `vite.config.ts` for GitHub Pages
- [ ] Add real images to `public/assets/images/`
- [ ] Configure contact form endpoint
- [ ] Update social media links
- [ ] Add favicon
- [ ] Test on mobile devices
- [ ] Check accessibility with keyboard navigation
- [ ] Verify all links work

## 🐛 Debug Mode

### Check for errors
```powershell
npm run lint           # ESLint errors
npm run type-check     # TypeScript errors
```

### View build output
```powershell
npm run build
# Check dist/ folder size and structure
```

### Browser console
- F12 → Console tab
- Look for React errors, network failures, or warnings

## 📊 Performance Tips

- Use lazy loading for images: `loading="lazy"`
- Optimize images before uploading
- Use WebP format when possible
- Keep bundle size under 250KB
- Test with Lighthouse (Chrome DevTools)

## ♿ Accessibility Checklist

- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Focus states visible
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] Screen reader tested

## 🔗 Important Links

- **Development:** http://localhost:3000
- **Storybook:** http://localhost:6006
- **Deployment:** https://zeeshandesigns.github.io (after deploy)

## 📞 Support

- Check `SETUP.md` for detailed instructions
- Check `README.md` for full documentation
- Review component `.stories.tsx` files for usage examples

---

**Last Updated:** November 2025
**Version:** 1.0.0
