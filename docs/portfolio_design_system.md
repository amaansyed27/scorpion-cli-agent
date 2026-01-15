# Portfolio Design System Guide

**Goal:** Train small models to generate sites with this quality level.

---

## Tech Stack

```
React 19 + Vite 7
Framer Motion (animations)
Lenis (smooth scroll)
Matter.js (physics particles)
Wouter (routing)
CSS Variables (theming)
```

---

## Typography

```css
/* Fonts */
--font-sans: 'Inter', system-ui, sans-serif;
--font-display: 'Space Grotesk', sans-serif;

/* Heading styles */
font-weight: 500-600;
letter-spacing: -0.02em to -0.04em;
line-height: 0.85-1.1;
```

**Key patterns:**
- Display headings use 8-18vw for impact
- Outline text: `WebkitTextStroke: '2px var(--color-text)'`
- Gradient text with shine animation

---

## Color Palette (Light Theme)

```css
--color-bg: #FAFAFA;
--color-surface: #FFFFFF;
--color-text: #080808;
--color-text-light: #666666;
--color-accent: #2A2A2A;
--color-highlight: #FF4D00;  /* International Orange */
--color-border: #E5E5E5;
```

---

## Animation Patterns

### 1. Scroll-based Parallax
```jsx
const { scrollYProgress } = useScroll({ target: ref });
const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
```

### 2. Page Transitions
```jsx
<AnimatePresence mode="wait">
  {loading ? <Loader /> : <Content />}
</AnimatePresence>
```

### 3. Stagger Children
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1 }}
```

### 4. whileInView
```jsx
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  whileInView={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.5 }}
/>
```

---

## Component Patterns

### Sticky Card Stack
- `position: sticky; top: 0;`
- Each card offset by `paddingTop: index * 40px`
- Full viewport height sections

### Glass/Surface Cards
```jsx
background: '#ffffff';
borderRadius: '24px';
border: '1px solid #e0e0e0';
boxShadow: '0 20px 60px rgba(0,0,0,0.05)';
```

### Grid Background Pattern
```jsx
backgroundImage: 'linear-gradient(#eee 1px, transparent 1px), 
                  linear-gradient(90deg, #eee 1px, transparent 1px)';
backgroundSize: '40px 40px';
```

---

## Layout Constants

```css
--spacing-container: 92vw;
--spacing-section: 120px;
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
```

---

## Key Visual Elements

1. **Large Numbers** - 18vw italic with gradient shine
2. **Outline Text** - Hollow stroke for secondary emphasis
3. **Physics Background** - Matter.js falling shapes, interactive
4. **Progress Bars** - Animated fill on scroll
5. **Color Accents** - Orange (#FF4D00), Blue (#0055FF), Green (#00AA00)

---

## For LLM Code Generation

When generating sites like this, include:

1. **CSS Variables** for all colors/spacing
2. **Framer Motion** for animations
3. **Viewport-relative sizing** (vw, vh)
4. **Inter + Space Grotesk** fonts
5. **Light theme** with #FAFAFA background
6. **Generous whitespace** (120px+ section padding)
7. **Subtle shadows** (rgba 0.05 opacity)
8. **Micro-interactions** (hover, scroll-triggered)

---

## Example Hero Pattern

```jsx
<section style={{ height: '100vh', position: 'relative' }}>
  <motion.div style={{ y: parallaxY, opacity }}>
    <h1 style={{ fontSize: '10vw', fontWeight: 600 }}>
      Name <br/>
      <span style={{ WebkitTextStroke: '2px #080808', color: 'transparent' }}>
        Surname
      </span>
    </h1>
  </motion.div>
</section>
```
