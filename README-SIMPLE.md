# Zynk - Digital Services Agency Website

A clean, modern website built with vanilla HTML, CSS, and JavaScript. No build tools, no frameworks—just simple, fast, and effective web development.

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your browser
3. That's it! The site is ready to go.

## 📁 File Structure

```
zeeshandesigns.github.io/
├── index.html          # Home page
├── services.html       # Services page
├── projects.html       # Projects portfolio
├── about.html          # About page
├── contact.html        # Contact form
├── styles.css          # All styles and design system
├── script.js           # Interactive functionality
└── README.md           # This file
```

## ✨ Features

- **5 Pages**: Home, Services, Projects, About, Contact
- **Responsive Design**: Works on all devices (mobile, tablet, desktop)
- **Accessible**: WCAG AA compliant with skip links, ARIA labels, keyboard navigation
- **Design System**: CSS variables for consistent colors, spacing, typography
- **Interactive Elements**:
  - Mobile hamburger menu
  - Project filtering by category
  - Contact form validation
  - Smooth scrolling

## 🎨 Design System

All design tokens are defined in `styles.css` using CSS variables:

```css
--color-accent: #0b63ff;
--space-md: 16px;
--font-size-base: 1rem;
```

### Colors

- **Accent**: `#0B63FF` (primary blue)
- **Text**: `#0F1724` (dark)
- **Background**: `#FFFFFF` (white)

### Typography

- **Font**: Inter (with system font fallback)
- **8-point grid** for consistent spacing

## 📝 Editing Content

### Change Text

1. Open the HTML file you want to edit
2. Find the text you want to change
3. Edit directly in the HTML
4. Save and refresh your browser

### Update Images

1. Add your images to the project folder
2. Update image `src` attributes in HTML
3. Replace `.placeholder-image` divs with actual `<img>` tags

Example:

```html
<!-- Replace this: -->
<div class="placeholder-image"></div>

<!-- With this: -->
<img src="your-image.jpg" alt="Description" />
```

### Modify Styles

All styles are in `styles.css`. Use the CSS variables for consistency:

```css
.your-element {
  color: var(--color-accent);
  padding: var(--space-lg);
}
```

## 📤 Deployment

### GitHub Pages (Recommended)

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch (usually `main`) and `/` folder
4. Save and wait a few minutes

Your site will be live at: `https://yourusername.github.io/`

### FTP Upload (Namecheap, etc.)

1. Connect to your hosting via FTP
2. Upload all files to `public_html` or `www` folder
3. Visit your domain

### Other Hosting (Netlify, Vercel)

1. Drag and drop the entire folder to Netlify Drop
2. Or connect your Git repository
3. No build settings needed—it's static HTML!

## 🔧 Customization

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --color-accent: #YOUR_COLOR;
  --color-text-primary: #YOUR_COLOR;
}
```

### Add a New Page

1. Copy an existing HTML file (e.g., `about.html`)
2. Rename it
3. Update the content
4. Add navigation links in all page headers

### Setup Contact Form

The form currently logs to console. To enable real submissions:

**Option 1: Formspree**

1. Sign up at [formspree.io](https://formspree.io)
2. Create a form and get your endpoint
3. Update `script.js` around line 100:

```javascript
const response = await fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
```

**Option 2: EmailJS**

1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Follow their setup guide
3. Replace form submission code in `script.js`

## 🛠️ Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## 📋 Pre-Launch Checklist

- [ ] Replace placeholder content with real text
- [ ] Add real project images
- [ ] Update social media links in footer
- [ ] Setup contact form backend (Formspree/EmailJS)
- [ ] Test on mobile devices
- [ ] Test all links
- [ ] Test contact form
- [ ] Add favicon
- [ ] Update meta descriptions for SEO
- [ ] Test in different browsers

## 📞 Need Help?

This is a simple static website. If you need help:

1. **Content changes**: Edit HTML files directly
2. **Style changes**: Edit `styles.css`
3. **Functionality**: Edit `script.js`

No npm, no build process, no complex setup. Just HTML, CSS, and JavaScript.

## 📄 License

All rights reserved © 2025 Zynk
