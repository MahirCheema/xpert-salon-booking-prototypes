import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imgDir = path.resolve(__dirname, '..', 'public', 'images');

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// 1. Hair Salon Banner Illustration
const hairHeroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="hairBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#hairBg)" />
  <circle cx="700" cy="80" r="140" fill="#4338ca" opacity="0.25" />
  <circle cx="620" cy="360" r="200" fill="#6366f1" opacity="0.15" />
  
  <!-- Modern Salon Mirror & Chair Silhouette -->
  <rect x="520" y="60" width="220" height="300" rx="110" fill="#1e1b4b" stroke="url(#goldAccent)" stroke-width="6" opacity="0.85" />
  <ellipse cx="630" cy="210" rx="90" ry="130" fill="#312e81" opacity="0.6" />
  
  <!-- Barber / Stylist Elements -->
  <path d="M600 170 Q630 130 660 170 Q680 230 630 250 Q580 230 600 170 Z" fill="#f8fafc" opacity="0.9" />
  <circle cx="630" cy="140" r="28" fill="#fde68a" />
  
  <!-- Scissors Motif -->
  <g transform="translate(680, 260) rotate(-25) scale(0.9)">
    <circle cx="20" cy="20" r="14" fill="none" stroke="url(#goldAccent)" stroke-width="4" />
    <circle cx="20" cy="60" r="14" fill="none" stroke="url(#goldAccent)" stroke-width="4" />
    <path d="M30 25 L80 50 M30 55 L80 30" stroke="url(#goldAccent)" stroke-width="4" stroke-linecap="round" />
  </g>
  
  <!-- Ambient Sparkles -->
  <polygon points="460,90 464,105 479,109 464,113 460,128 456,113 441,109 456,105" fill="#fde68a" />
  <polygon points="510,340 513,350 523,353 513,356 510,366 507,356 497,353 507,350" fill="#fde68a" opacity="0.8" />
</svg>`;

// 2. Dog Grooming Salon Banner Illustration
const groomingHeroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="groomBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="warmAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#groomBg)" />
  <circle cx="680" cy="100" r="160" fill="#10b981" opacity="0.2" />
  <circle cx="580" cy="380" r="180" fill="#34d399" opacity="0.12" />
  
  <!-- Happy Groomed Dog Silhouette -->
  <g transform="translate(520, 90)">
    <!-- Dog body -->
    <ellipse cx="140" cy="220" rx="80" ry="70" fill="#fef3c7" />
    <!-- Dog chest/fluff -->
    <circle cx="100" cy="180" r="55" fill="#fef3c7" />
    <circle cx="130" cy="160" r="50" fill="#fde68a" />
    <!-- Dog head -->
    <circle cx="85" cy="115" r="45" fill="#fde68a" />
    <!-- Floppy Ears -->
    <path d="M50 100 C30 110, 25 160, 45 170 C55 175, 65 140, 60 115 Z" fill="#d97706" />
    <path d="M115 100 C135 110, 140 160, 120 170 C110 175, 100 140, 105 115 Z" fill="#d97706" />
    <!-- Happy Face -->
    <ellipse cx="72" cy="110" rx="5" ry="7" fill="#1f2937" />
    <ellipse cx="98" cy="110" rx="5" ry="7" fill="#1f2937" />
    <ellipse cx="85" cy="125" rx="9" ry="7" fill="#1f2937" />
    <path d="M80 132 Q85 140 90 132" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M85 135 C83 145, 87 148, 85 152 C83 148, 87 145, 85 135" fill="#f43f5e" />
    <!-- Grooming Bow -->
    <polygon points="85,60 70,50 70,70" fill="#ec4899" />
    <polygon points="85,60 100,50 100,70" fill="#ec4899" />
    <circle cx="85" cy="60" r="5" fill="#fbcfe8" />
    <!-- Soap Bubbles -->
    <circle cx="20" cy="70" r="16" fill="#a7f3d0" opacity="0.6" stroke="#fff" stroke-width="2" />
    <circle cx="45" cy="40" r="10" fill="#a7f3d0" opacity="0.7" stroke="#fff" stroke-width="1.5" />
    <circle cx="210" cy="150" r="22" fill="#a7f3d0" opacity="0.5" stroke="#fff" stroke-width="2" />
  </g>
</svg>`;

// 3. Beauty Salon Banner Illustration
const beautyHeroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="beautyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4c1d95" />
      <stop offset="50%" stop-color="#701a75" />
      <stop offset="100%" stop-color="#3b0764" />
    </linearGradient>
    <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f472b6" />
      <stop offset="100%" stop-color="#fb7185" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#beautyBg)" />
  <circle cx="680" cy="120" r="170" fill="#c084fc" opacity="0.18" />
  <circle cx="560" cy="350" r="160" fill="#f472b6" opacity="0.15" />
  
  <!-- Serene Profile Silhouette & Botanical Lotus -->
  <g transform="translate(550, 100)">
    <path d="M120 40 C70 40, 50 80, 50 120 C50 160, 75 190, 85 220 L160 220 C170 180, 190 140, 190 100 C190 60, 160 40, 120 40 Z" fill="#fdf4ff" opacity="0.9" />
    <path d="M70 120 Q95 110 110 125" stroke="#a21caf" stroke-width="3" fill="none" stroke-linecap="round" />
    <!-- Botanical Leaf / Kalahari Flora -->
    <path d="M40 210 Q80 160 60 110 Q10 160 40 210 Z" fill="#fbcfe8" opacity="0.75" />
    <path d="M170 210 Q210 160 190 110 Q140 160 170 210 Z" fill="#fbcfe8" opacity="0.75" />
  </g>
  <!-- Sparkles & Droplets -->
  <circle cx="480" cy="140" r="8" fill="#f472b6" opacity="0.7" />
  <polygon points="510,80 514,95 529,99 514,103 510,118 506,103 491,99 506,95" fill="#fde047" />
</svg>`;

// 4. Stylist / Staff Avatars (SVGs)
const staffIssaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bgIssa" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" /><stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bgIssa)" />
  <circle cx="100" cy="85" r="42" fill="#fed7aa" />
  <!-- Hair & Beard -->
  <path d="M58 80 C58 45, 142 45, 142 80 C135 60, 65 60, 58 80 Z" fill="#1e293b" />
  <path d="M72 105 Q100 135 128 105 Q100 125 72 105 Z" fill="#1e293b" />
  <ellipse cx="88" cy="82" rx="4" ry="5" fill="#0f172a" />
  <ellipse cx="112" cy="82" rx="4" ry="5" fill="#0f172a" />
  <path d="M92 98 Q100 104 108 98" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round" />
  <!-- Shoulders -->
  <path d="M30 185 C30 140, 70 135, 100 135 C130 135, 170 140, 170 185 Z" fill="#0f172a" />
</svg>`;

const staffSamiraSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bgSamira" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" /><stop offset="100%" stop-color="#be185d" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bgSamira)" />
  <circle cx="100" cy="90" r="40" fill="#fde68a" />
  <!-- Long dark hair -->
  <path d="M55 90 C50 145, 60 170, 70 180 C60 140, 65 80, 100 55 C135 80, 140 140, 130 180 C140 170, 150 145, 145 90 C145 50, 55 50, 55 90 Z" fill="#18181b" />
  <ellipse cx="88" cy="88" rx="4" ry="5" fill="#18181b" />
  <ellipse cx="112" cy="88" rx="4" ry="5" fill="#18181b" />
  <path d="M93 105 Q100 112 107 105" stroke="#be185d" stroke-width="2.5" fill="none" stroke-linecap="round" />
  <!-- Stylish top -->
  <path d="M40 190 C40 150, 75 145, 100 145 C125 145, 160 150, 160 190 Z" fill="#3f3f46" />
</svg>`;

const staffViolettaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bgVio" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" /><stop offset="100%" stop-color="#047857" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="100" fill="url(#bgVio)" />
  <circle cx="100" cy="90" r="40" fill="#fed7aa" />
  <!-- Blonde Groomer hair -->
  <path d="M55 85 C55 50, 145 50, 145 85 C145 130, 135 150, 140 170 C130 135, 135 90, 100 60 C65 90, 70 135, 60 170 C65 150, 55 130, 55 85 Z" fill="#fbbf24" />
  <ellipse cx="88" cy="88" rx="4" ry="5" fill="#1e293b" />
  <ellipse cx="112" cy="88" rx="4" ry="5" fill="#1e293b" />
  <path d="M93 105 Q100 112 107 105" stroke="#e11d48" stroke-width="2.5" fill="none" stroke-linecap="round" />
  <!-- Grooming Apron -->
  <path d="M35 190 C35 150, 70 145, 100 145 C130 145, 165 150, 165 190 Z" fill="#065f46" />
  <rect x="80" y="145" width="40" height="45" fill="#047857" rx="4" />
</svg>`;

// 5. Pet Profile Avatars
const petDoodleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="100" fill="#fef3c7" />
  <circle cx="100" cy="110" r="55" fill="#fde68a" />
  <circle cx="65" cy="85" r="28" fill="#f59e0b" />
  <circle cx="135" cy="85" r="28" fill="#f59e0b" />
  <circle cx="85" cy="100" r="6" fill="#1e293b" />
  <circle cx="115" cy="100" r="6" fill="#1e293b" />
  <ellipse cx="100" cy="118" rx="10" ry="8" fill="#1e293b" />
  <path d="M94 128 Q100 135 106 128" stroke="#1e293b" stroke-width="2.5" fill="none" />
  <path d="M100 130 C97 142, 103 145, 100 148 C97 145, 103 142, 100 130" fill="#f43f5e" />
</svg>`;

const petCatSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="100" fill="#ede9fe" />
  <polygon points="60,95 50,45 90,75" fill="#c084fc" />
  <polygon points="140,95 150,45 110,75" fill="#c084fc" />
  <circle cx="100" cy="115" r="50" fill="#e9d5ff" />
  <ellipse cx="82" cy="108" rx="6" ry="9" fill="#10b981" />
  <ellipse cx="118" cy="108" rx="6" ry="9" fill="#10b981" />
  <ellipse cx="82" cy="108" rx="2" ry="7" fill="#064e3b" />
  <ellipse cx="118" cy="108" rx="2" ry="7" fill="#064e3b" />
  <polygon points="100,122 95,116 105,116" fill="#f472b6" />
  <path d="M95 124 Q100 130 105 124" stroke="#6b21a8" stroke-width="2" fill="none" />
  <line x1="60" y1="120" x2="35" y2="115" stroke="#9333ea" stroke-width="2" />
  <line x1="60" y1="126" x2="35" y2="128" stroke="#9333ea" stroke-width="2" />
  <line x1="140" y1="120" x2="165" y2="115" stroke="#9333ea" stroke-width="2" />
  <line x1="140" y1="126" x2="165" y2="128" stroke="#9333ea" stroke-width="2" />
</svg>`;

// Write all assets to public/images
fs.writeFileSync(path.join(imgDir, 'salon-hair.svg'), hairHeroSvg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'salon-grooming.svg'), groomingHeroSvg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'salon-beauty.svg'), beautyHeroSvg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'staff-issa.svg'), staffIssaSvg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'staff-samira.svg'), staffSamiraSvg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'staff-violetta.svg'), staffViolettaSvg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'pet-doodle.svg'), petDoodleSvg, 'utf8');
fs.writeFileSync(path.join(imgDir, 'pet-cat.svg'), petCatSvg, 'utf8');

console.log('Successfully generated all salon assets in public/images.');

