# General Sans Font - Complete Usage Guide

## ✅ Font Successfully Integrated!

General Sans font ab aapke project mein fully integrated hai with all variants.

## 📦 Available Font Weights

Aapko ye sab font weights mil rahi hain:
- **Extralight** (200)
- **Light** (300)
- **Regular** (400)
- **Medium** (500)
- **Semibold** (600)
- **Bold** (700)

Plus **Italic** variants bhi available hain sab weights ke liye!

---

## 🎯 Font Kaise Use Karein

### Method 1: Tailwind CSS Classes (Recommended)

```tsx
// Basic Usage - Regular weight
<h1 className="font-general-sans">Hello World</h1>

// Different Weights
<p className="font-general-sans font-extralight">Extralight Text (200)</p>
<p className="font-general-sans font-light">Light Text (300)</p>
<p className="font-general-sans">Regular Text (400) - Default</p>
<p className="font-general-sans font-medium">Medium Text (500)</p>
<p className="font-general-sans font-semibold">Semibold Text (600)</p>
<p className="font-general-sans font-bold">Bold Text (700)</p>

// Italic Text
<p className="font-general-sans italic">Regular Italic</p>
<p className="font-general-sans font-bold italic">Bold Italic</p>

// Combined with other classes
<h1 className="font-general-sans font-bold text-4xl">Bold Heading</h1>
```

### Method 2: Direct CSS

```css
/* Regular */
.your-class {
  font-family: 'General Sans', sans-serif;
  font-weight: 400;
}

/* Medium */
.your-class {
  font-family: 'General Sans', sans-serif;
  font-weight: 500;
}

/* Bold */
.your-class {
  font-family: 'General Sans', sans-serif;
  font-weight: 700;
  font-style: italic; /* For italic */
}
```

### Method 3: Variable Font (Advanced)

Variable font use karke aap koi bhi weight 200 se 700 tak use kar sakte hain:

```css
.variable-font {
  font-family: 'General Sans Variable', sans-serif;
  font-variation-settings: 'wght' 450; /* Custom weight between 200-700 */
}
```

Or Tailwind se:
```tsx
<h1 className="font-general-sans-variable" style={{ fontVariationSettings: "'wght' 550" }}>
  Variable Font Text
</h1>
```

---

## 📝 Real-World Examples

### Example 1: Heading with General Sans
```tsx
<h1 className="font-general-sans font-bold text-5xl">
  Welcome to Gopi Misthan Bhandar
</h1>
```

### Example 2: Body Text
```tsx
<p className="font-general-sans text-lg leading-relaxed">
  Serving Tradition & Sweetness Since 1968
</p>
```

### Example 3: Button Text
```tsx
<button className="font-general-sans font-semibold px-6 py-3 bg-primary-red text-white rounded">
  Order Now
</button>
```

### Example 4: Card Title
```tsx
<div className="font-general-sans">
  <h3 className="font-bold text-xl">Product Name</h3>
  <p className="font-medium text-gray-600">Product Description</p>
</div>
```

### Example 5: Navigation Menu
```tsx
<nav className="font-general-sans">
  <a href="/" className="font-medium">Home</a>
  <a href="/products" className="font-semibold">Products</a>
</nav>
```

---

## 🎨 Font Weight Reference

| Tailwind Class | Font Weight | Use Case |
|---------------|-------------|----------|
| `font-extralight` | 200 | Very light text, decorative |
| `font-light` | 300 | Light body text |
| `font-normal` or none | 400 | Regular body text (default) |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Headings, important text |
| `font-bold` | 700 | Strong emphasis, titles |

---

## 💡 Best Practices

1. **Headings**: Use `font-bold` ya `font-semibold`
2. **Body Text**: Use `font-normal` (default) ya `font-medium`
3. **Important Elements**: Use `font-semibold` for better readability
4. **Italic**: Use sparingly for emphasis only

---

## 🔧 Global Font Setting (Optional)

Agar aap chahte hain ki poore website mein General Sans default font ho:

`app/globals.css` mein ye add karein:

```css
@layer base {
  body {
    font-family: 'General Sans', sans-serif;
  }
}
```

Ya `app/layout.tsx` mein:

```tsx
<body className="antialiased font-general-sans">
  {children}
</body>
```

---

## ✨ Tips

- Font already optimized hai with `.woff2` format (best compression)
- Fallback formats (.woff, .ttf) bhi available hain
- `font-display: swap` set hai for better performance
- Variable font use karke custom weights bhi use kar sakte hain!

---

**Happy Coding! 🚀**

Font ab ready hai use karne ke liye. Kisi bhi component mein `font-general-sans` class add karke start karein!

