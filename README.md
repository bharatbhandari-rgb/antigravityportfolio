# Bharat Bhandari — Digital Portfolio

A modern, high-performance interactive portfolio featuring a 240-frame 60fps/120Hz canvas scroll animation, editorial magazine layout, verified academic & professional credentials, and responsive cross-platform support.

## Overview
- **Name**: Bharat Bhandari
- **Role**: MBA Candidate — Marketing & Business Analytics (IILM University, Greater Noida)
- **Email**: bharatbhandari506@gmail.com
- **LinkedIn**: [linkedin.com/in/bharatbhandari506](https://linkedin.com/in/bharatbhandari506)
- **Analytics**: Google Analytics 4 (`G-2GLQ7SWZ43`)

## Features
- **Cinematic Canvas Frame Scrubbing**: 240 ultra-high-definition sequence frames synced to scroll with physics-based Lerp damping (`0.085`).
- **Responsive Across All Viewports**: Desktop, laptop, tablet (iPad portrait/landscape), and mobile phones.
- **Dynamic Viewport Height (`100dvh`)**: Zero jumps when mobile browser address bars expand/collapse.
- **Glassmorphic Editorial Aesthetic**: Translucent cards (`backdrop-filter: blur(24px)`) allowing the ambient studio rim glow to illuminate through.
- **Direct Resume Integration**: Includes downloadable [`ATS_Resume_bharatbhandari.pdf`](./ATS_Resume_bharatbhandari.pdf).
- **Interactive UI**:
  - Live Mumbai local time clock (IST).
  - Continuous 360° rotating circular badge seal (`• DETAIL ORIENTED • STRATEGIC VISION • DATA DRIVEN •`).
  - Mobile navigation drawer.
  - Interactive project showcases, leadership summits, certifications, and smooth Back-to-Top scroll.

## Tech Stack
- HTML5 & Canvas 2D
- Modern Vanilla CSS3 (Custom properties, clamp, glassmorphism, flexbox, CSS Grid)
- Vanilla JavaScript (rAF render loop, zero external runtime dependencies)
- Google Analytics 4 (gtag.js)

## Running Locally
Double-click `index.html` or start a local server:
```bash
# Using Ruby (built-in on macOS)
ruby -run -e httpd . -p 3000

# Using Python 3 (if installed)
python3 -m http.server 3000
```
Then visit `http://localhost:3000`.
