import { PreviewDevice } from '../types';

export type TemplateCategory = 'Website' | 'App' | 'Dashboard';

export interface StarterTemplate {
  id: string;
  label: string;
  category: TemplateCategory;
  description: string;
  device: PreviewDevice;
  code: string;
}

const storefront = `
<div class="min-h-screen bg-[#f5f2ec] text-stone-800">
  <div class="bg-[#3d4a3d] text-[#e8e4da] text-[10px] tracking-[0.2em] uppercase text-center py-2">Complimentary shipping on orders over €150</div>
  <header class="flex items-center justify-between px-6 md:px-12 py-5 border-b border-stone-300/60">
    <div><div class="font-serif text-2xl tracking-[0.3em]">HÅVN</div><div class="text-[9px] tracking-[0.25em] uppercase text-stone-500">Objects for home</div></div>
    <nav class="hidden md:flex gap-8 text-[11px] tracking-[0.2em] uppercase"><a>Shop all</a><a>Seating</a><a>Lighting</a><a>Our story</a></nav>
    <div class="flex gap-4 text-stone-600"><span>⌕</span><span>◍</span></div>
  </header>
  <section class="grid md:grid-cols-2">
    <div class="relative min-h-[320px] md:min-h-[520px] bg-gradient-to-br from-[#d9cbb5] via-[#c8b497] to-[#a58d6c]">
      <div class="absolute inset-x-[22%] bottom-[18%] top-[30%] rounded-t-[40%] bg-[#ece4d6] shadow-2xl"></div>
      <div class="absolute bottom-6 left-6 bg-white/80 text-[10px] tracking-[0.2em] uppercase px-3 py-2">The Solace Lounge Chair — 01</div>
    </div>
    <div class="flex flex-col justify-center px-8 md:px-16 py-12">
      <div class="text-[11px] tracking-[0.25em] uppercase text-stone-500 mb-6">— The new collection</div>
      <h1 class="font-serif text-5xl md:text-6xl leading-[1.05]">Room to<br><em class="text-stone-500">slow down.</em></h1>
      <p class="mt-6 max-w-sm text-stone-600 leading-relaxed">Thoughtful furniture for the spaces you return to. Natural materials, enduring forms, and comfort that feels like home.</p>
      <button class="mt-8 self-start bg-[#2b2b26] text-white text-[11px] tracking-[0.2em] uppercase px-6 py-4">Explore collection ↗</button>
    </div>
  </section>
  <section class="px-6 md:px-12 py-14">
    <div class="flex items-end justify-between mb-8"><h2 class="font-serif text-3xl">Featured pieces</h2><a class="text-xs tracking-[0.2em] uppercase underline">View all</a></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div><div class="aspect-[4/5] bg-[#e4dccd]"></div><p class="mt-3 text-sm">Arc Floor Lamp</p><p class="text-sm text-stone-500">€420</p></div>
      <div><div class="aspect-[4/5] bg-[#d6cbb8]"></div><p class="mt-3 text-sm">Oak Side Table</p><p class="text-sm text-stone-500">€280</p></div>
      <div><div class="aspect-[4/5] bg-[#cfc3ad]"></div><p class="mt-3 text-sm">Linen Sofa</p><p class="text-sm text-stone-500">€2,150</p></div>
      <div><div class="aspect-[4/5] bg-[#e9e1d3]"></div><p class="mt-3 text-sm">Stoneware Vase</p><p class="text-sm text-stone-500">€95</p></div>
    </div>
  </section>
</div>`;

const mobileApp = `
<div class="min-h-screen bg-[#f3f6f2] text-zinc-900 font-sans">
  <div class="px-6 pt-12 pb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 font-bold"><span class="h-7 w-7 rounded-full bg-lime-500 text-white grid place-items-center text-xs">◎</span>stride</div>
      <div class="h-9 w-9 rounded-full bg-zinc-200"></div>
    </div>
    <p class="mt-8 text-xs tracking-widest uppercase text-zinc-500">Your week so far</p>
    <h1 class="mt-2 text-4xl font-extrabold leading-tight">Every run<br>has a <span class="text-lime-600">story.</span></h1>
  </div>
  <div class="mx-6 rounded-3xl bg-zinc-900 text-white p-6">
    <p class="text-xs text-zinc-400">This week</p>
    <p class="text-5xl font-extrabold mt-1">32.4 <span class="text-lg font-medium text-zinc-400">km</span></p>
    <div class="mt-6 flex items-end gap-2 h-24">
      <div class="flex-1 bg-lime-400/30 rounded-md h-[40%]"></div><div class="flex-1 bg-lime-400/30 rounded-md h-[70%]"></div>
      <div class="flex-1 bg-lime-400 rounded-md h-[95%]"></div><div class="flex-1 bg-lime-400/30 rounded-md h-[20%]"></div>
      <div class="flex-1 bg-lime-400/30 rounded-md h-[60%]"></div><div class="flex-1 bg-lime-400/30 rounded-md h-[80%]"></div>
      <div class="flex-1 bg-zinc-700 rounded-md h-[10%]"></div>
    </div>
    <div class="mt-2 flex justify-between text-[10px] text-zinc-500"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
  </div>
  <div class="px-6 mt-6 grid grid-cols-2 gap-4">
    <div class="rounded-2xl bg-white p-4 shadow-sm"><p class="text-xs text-zinc-500">Avg pace</p><p class="text-2xl font-bold">5'12"</p></div>
    <div class="rounded-2xl bg-white p-4 shadow-sm"><p class="text-xs text-zinc-500">Streak</p><p class="text-2xl font-bold">9 days</p></div>
  </div>
  <div class="px-6 mt-6 pb-28">
    <button class="w-full rounded-2xl bg-lime-500 text-white font-semibold py-4">Start a run</button>
  </div>
  <nav class="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-zinc-200 flex justify-around py-3 pb-6 text-xs text-zinc-500">
    <span class="text-lime-600 font-semibold">Home</span><span>Runs</span><span>Plans</span><span>Profile</span>
  </nav>
</div>`;

const booking = `
<div class="min-h-screen bg-[#faf6f3] text-stone-800">
  <header class="flex items-center justify-between px-6 md:px-10 py-4 border-b border-stone-200 bg-white">
    <div class="font-serif text-xl">Maison Lumière</div>
    <button class="text-xs border border-stone-300 rounded-full px-4 py-2">My bookings</button>
  </header>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <p class="text-[11px] tracking-[0.2em] uppercase text-[#b0645a]">Hair studio · Florence</p>
    <h1 class="font-serif text-4xl mt-2">Book your appointment</h1>
    <div class="mt-8 grid md:grid-cols-2 gap-6">
      <div class="rounded-2xl bg-white border border-stone-200 p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">1 · Choose your treatment</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between rounded-xl border-2 border-[#b0645a] bg-[#fbeeec] p-3"><span>Signature Cut</span><span>45 min · €65</span></div>
          <div class="flex justify-between rounded-xl border border-stone-200 p-3"><span>Colour & Gloss</span><span>90 min · €120</span></div>
          <div class="flex justify-between rounded-xl border border-stone-200 p-3"><span>Blow-dry</span><span>30 min · €40</span></div>
        </div>
      </div>
      <div class="rounded-2xl bg-white border border-stone-200 p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">2 · Pick a date & time</p>
        <div class="grid grid-cols-7 gap-1 text-center text-xs">
          <span class="text-stone-400">M</span><span class="text-stone-400">T</span><span class="text-stone-400">W</span><span class="text-stone-400">T</span><span class="text-stone-400">F</span><span class="text-stone-400">S</span><span class="text-stone-400">S</span>
          <span class="py-2">6</span><span class="py-2">7</span><span class="py-2">8</span><span class="py-2 rounded-full bg-[#b0645a] text-white">9</span><span class="py-2">10</span><span class="py-2">11</span><span class="py-2 text-stone-300">12</span>
          <span class="py-2">13</span><span class="py-2">14</span><span class="py-2">15</span><span class="py-2">16</span><span class="py-2">17</span><span class="py-2">18</span><span class="py-2 text-stone-300">19</span>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2 text-xs">
          <span class="rounded-lg border border-stone-200 py-2 text-center">10:00</span><span class="rounded-lg border-2 border-[#b0645a] py-2 text-center">11:30</span><span class="rounded-lg border border-stone-200 py-2 text-center">14:00</span>
        </div>
      </div>
    </div>
    <button class="mt-8 w-full md:w-auto rounded-full bg-stone-900 text-white px-8 py-4 text-sm font-medium">Confirm booking · Thu 9, 11:30</button>
  </div>
</div>`;

const food = `
<div class="min-h-screen bg-[#fff8f1] text-neutral-900">
  <header class="flex items-center justify-between px-6 md:px-10 py-4">
    <div class="text-2xl font-black tracking-tight text-orange-600">mesa</div>
    <div class="flex items-center gap-3 text-sm"><span class="hidden sm:inline text-neutral-500">Deliver to Via Roma 12</span><span class="rounded-full bg-neutral-900 text-white px-4 py-2">Cart · 2</span></div>
  </header>
  <section class="mx-6 md:mx-10 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 text-white p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    <div><p class="text-xs uppercase tracking-widest opacity-80">Fresh from the kitchen</p><h1 class="text-4xl md:text-5xl font-black mt-2">Lunch in 25 minutes.</h1></div>
    <div class="h-32 w-32 md:h-40 md:w-40 rounded-full bg-[#fff1df] shadow-2xl grid place-items-center text-5xl">🥗</div>
  </section>
  <div class="px-6 md:px-10 mt-8 flex gap-2 overflow-x-auto text-sm">
    <span class="rounded-full bg-neutral-900 text-white px-4 py-2">All</span><span class="rounded-full bg-white border px-4 py-2">Bowls</span><span class="rounded-full bg-white border px-4 py-2">Pizza</span><span class="rounded-full bg-white border px-4 py-2">Desserts</span>
  </div>
  <section class="px-6 md:px-10 py-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    <div class="rounded-2xl bg-white p-4 shadow-sm flex gap-4"><div class="h-20 w-20 rounded-xl bg-orange-100 grid place-items-center text-3xl">🍜</div><div class="flex-1"><p class="font-semibold">Miso Ramen</p><p class="text-xs text-neutral-500">Broth, egg, scallion</p><div class="flex justify-between items-center mt-2"><span class="font-bold">€13</span><button class="h-8 w-8 rounded-full bg-orange-600 text-white">+</button></div></div></div>
    <div class="rounded-2xl bg-white p-4 shadow-sm flex gap-4"><div class="h-20 w-20 rounded-xl bg-red-100 grid place-items-center text-3xl">🍕</div><div class="flex-1"><p class="font-semibold">Margherita</p><p class="text-xs text-neutral-500">San Marzano, fior di latte</p><div class="flex justify-between items-center mt-2"><span class="font-bold">€9</span><button class="h-8 w-8 rounded-full bg-orange-600 text-white">+</button></div></div></div>
    <div class="rounded-2xl bg-white p-4 shadow-sm flex gap-4"><div class="h-20 w-20 rounded-xl bg-amber-100 grid place-items-center text-3xl">🍰</div><div class="flex-1"><p class="font-semibold">Tiramisù</p><p class="text-xs text-neutral-500">House recipe</p><div class="flex justify-between items-center mt-2"><span class="font-bold">€6</span><button class="h-8 w-8 rounded-full bg-orange-600 text-white">+</button></div></div></div>
  </section>
</div>`;

const portfolio = `
<div class="min-h-screen bg-white text-neutral-900">
  <header class="flex items-center justify-between px-6 md:px-12 py-6 text-sm"><span class="font-semibold">Giulia Marino</span><nav class="flex gap-6 text-neutral-500"><a>Work</a><a>About</a><a>Contact</a></nav></header>
  <section class="px-6 md:px-12 pt-10 pb-16">
    <p class="text-sm text-neutral-500">Product designer — Milan</p>
    <h1 class="mt-4 text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95]">Designing calm<br>software for<br><span class="text-neutral-400">busy people.</span></h1>
  </section>
  <section class="px-6 md:px-12 pb-16 grid md:grid-cols-2 gap-6">
    <div><div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-200 to-sky-100"></div><p class="mt-3 font-medium">Northstar — Travel app</p><p class="text-sm text-neutral-500">Product design, 2025</p></div>
    <div><div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-rose-200 to-amber-100"></div><p class="mt-3 font-medium">Mesa — Food ordering</p><p class="text-sm text-neutral-500">Brand & UI, 2024</p></div>
  </section>
  <footer class="px-6 md:px-12 py-10 border-t text-sm flex justify-between"><span>hello@giulia.design</span><span class="text-neutral-400">© 2026</span></footer>
</div>`;

const workspace = `
<div class="min-h-screen flex bg-slate-50 text-slate-800 text-sm">
  <aside class="hidden md:flex w-56 flex-col border-r bg-white p-4 gap-1">
    <div class="font-bold text-base mb-4">◆ Teamspace</div>
    <a class="rounded-lg bg-indigo-50 text-indigo-700 px-3 py-2">Overview</a><a class="px-3 py-2">Projects</a><a class="px-3 py-2">Docs</a><a class="px-3 py-2">Members</a>
  </aside>
  <main class="flex-1 p-6 md:p-8">
    <div class="flex items-center justify-between"><h1 class="text-2xl font-bold">Sprint 14</h1><button class="rounded-lg bg-indigo-600 text-white px-4 py-2">New task</button></div>
    <div class="mt-6 grid md:grid-cols-3 gap-4">
      <div class="rounded-xl bg-slate-100 p-3"><p class="font-semibold text-slate-500 mb-3">To do · 3</p><div class="space-y-2"><div class="rounded-lg bg-white p-3 shadow-sm">Onboarding emails<p class="text-xs text-slate-400 mt-1">Due Fri</p></div><div class="rounded-lg bg-white p-3 shadow-sm">Pricing page copy</div></div></div>
      <div class="rounded-xl bg-slate-100 p-3"><p class="font-semibold text-slate-500 mb-3">In progress · 2</p><div class="space-y-2"><div class="rounded-lg bg-white p-3 shadow-sm border-l-4 border-amber-400">Billing integration</div><div class="rounded-lg bg-white p-3 shadow-sm border-l-4 border-amber-400">Mobile navigation</div></div></div>
      <div class="rounded-xl bg-slate-100 p-3"><p class="font-semibold text-slate-500 mb-3">Done · 5</p><div class="space-y-2"><div class="rounded-lg bg-white p-3 shadow-sm text-slate-400 line-through">Auth flow</div></div></div>
    </div>
  </main>
</div>`;

const travel = `
<div class="min-h-screen bg-[#f6f5f0] text-stone-900">
  <header class="flex items-center justify-between px-6 md:px-12 py-5 text-sm"><span class="font-semibold tracking-[0.2em]">✦ NORTHSTAR</span><button class="bg-stone-900 text-white px-4 py-2 text-xs">Find your adventure ↗</button></header>
  <section class="mx-4 md:mx-12 rounded-sm bg-[#1f3a2d] text-white px-8 md:px-14 py-16 md:py-24 relative overflow-hidden">
    <div class="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10"></div>
    <div class="absolute -right-10 -top-10 h-60 w-60 rounded-full border border-white/10"></div>
    <p class="text-[10px] tracking-[0.3em] uppercase text-white/60">The slow, different perspective</p>
    <h1 class="font-serif text-5xl md:text-6xl mt-4 leading-tight">Find your<br>own north.</h1>
    <div class="mt-8 flex gap-3"><button class="bg-white text-stone-900 px-5 py-3 text-xs">Our journeys ↗</button><button class="underline text-xs">Our story</button></div>
  </section>
  <section class="px-4 md:px-12 py-12">
    <h2 class="font-serif text-2xl">Good places to get lost.</h2>
    <div class="mt-6 grid md:grid-cols-3 gap-4 text-sm">
      <div class="bg-white p-5 border border-stone-200"><p class="font-medium">Dolomites Traverse</p><p class="text-stone-500 text-xs mt-1">7 days · Small group hiking</p><p class="mt-4">From €1,490</p></div>
      <div class="bg-white p-5 border border-stone-200"><p class="font-medium">Alpine Lakes Escape</p><p class="text-stone-500 text-xs mt-1">4 days · Slow adventure</p><p class="mt-4">From €890</p></div>
      <div class="bg-white p-5 border border-stone-200"><p class="font-medium">Sunrise Summits</p><p class="text-stone-500 text-xs mt-1">3 days · Mountain trails</p><p class="mt-4">From €640</p></div>
    </div>
  </section>
</div>`;

const learning = `
<div class="min-h-screen bg-white text-gray-900">
  <header class="flex items-center justify-between px-6 md:px-12 py-5"><span class="font-extrabold text-xl text-violet-700">learnly</span><button class="rounded-full bg-violet-600 text-white text-sm px-5 py-2">Start free</button></header>
  <section class="px-6 md:px-12 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
    <div>
      <span class="rounded-full bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1">New: AI tutor</span>
      <h1 class="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">Learn anything,<br>one lesson a day.</h1>
      <p class="mt-4 text-gray-500 max-w-md">Bite-sized courses in design, code and languages with progress tracking and certificates.</p>
    </div>
    <div class="rounded-3xl bg-violet-50 p-6 space-y-3">
      <div class="rounded-2xl bg-white p-4 shadow-sm"><p class="font-semibold">Intro to UX Design</p><div class="mt-3 h-2 rounded-full bg-gray-100"><div class="h-2 w-3/4 rounded-full bg-violet-500"></div></div><p class="text-xs text-gray-400 mt-1">75% complete</p></div>
      <div class="rounded-2xl bg-white p-4 shadow-sm"><p class="font-semibold">JavaScript Basics</p><div class="mt-3 h-2 rounded-full bg-gray-100"><div class="h-2 w-1/3 rounded-full bg-violet-500"></div></div><p class="text-xs text-gray-400 mt-1">33% complete</p></div>
      <div class="rounded-2xl bg-white p-4 shadow-sm"><p class="font-semibold">Italian for Travelers</p><div class="mt-3 h-2 rounded-full bg-gray-100"><div class="h-2 w-1/6 rounded-full bg-violet-500"></div></div><p class="text-xs text-gray-400 mt-1">16% complete</p></div>
    </div>
  </section>
</div>`;

const analytics = `
<div class="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-8 text-sm">
  <div class="flex flex-wrap items-center justify-between gap-3"><h1 class="text-2xl font-bold">Analytics</h1><div class="flex gap-2"><span class="rounded-lg border bg-white px-3 py-2">Last 30 days</span><button class="rounded-lg bg-gray-900 text-white px-3 py-2">Export</button></div></div>
  <div class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="rounded-2xl bg-white p-5 shadow-sm"><p class="text-gray-500">Revenue</p><p class="text-2xl font-bold mt-1">€48.2k</p><p class="text-emerald-600 text-xs mt-1">▲ 12.4%</p></div>
    <div class="rounded-2xl bg-white p-5 shadow-sm"><p class="text-gray-500">Visitors</p><p class="text-2xl font-bold mt-1">21,903</p><p class="text-emerald-600 text-xs mt-1">▲ 8.1%</p></div>
    <div class="rounded-2xl bg-white p-5 shadow-sm"><p class="text-gray-500">Conversion</p><p class="text-2xl font-bold mt-1">3.6%</p><p class="text-rose-600 text-xs mt-1">▼ 0.4%</p></div>
    <div class="rounded-2xl bg-white p-5 shadow-sm"><p class="text-gray-500">Avg order</p><p class="text-2xl font-bold mt-1">€62</p><p class="text-emerald-600 text-xs mt-1">▲ 2.0%</p></div>
  </div>
  <div class="mt-4 grid lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2 rounded-2xl bg-white p-5 shadow-sm">
      <p class="font-semibold">Revenue over time</p>
      <div class="mt-6 h-48 flex items-end gap-2">
        <div class="flex-1 rounded-t-md bg-blue-200 h-[35%]"></div><div class="flex-1 rounded-t-md bg-blue-200 h-[50%]"></div><div class="flex-1 rounded-t-md bg-blue-200 h-[45%]"></div><div class="flex-1 rounded-t-md bg-blue-200 h-[62%]"></div><div class="flex-1 rounded-t-md bg-blue-200 h-[58%]"></div><div class="flex-1 rounded-t-md bg-blue-200 h-[75%]"></div><div class="flex-1 rounded-t-md bg-blue-600 h-[90%]"></div>
      </div>
    </div>
    <div class="rounded-2xl bg-white p-5 shadow-sm">
      <p class="font-semibold">Top channels</p>
      <div class="mt-4 space-y-3">
        <div><div class="flex justify-between"><span>Organic</span><span>46%</span></div><div class="mt-1 h-2 rounded-full bg-gray-100"><div class="h-2 w-[46%] rounded-full bg-blue-600"></div></div></div>
        <div><div class="flex justify-between"><span>Social</span><span>28%</span></div><div class="mt-1 h-2 rounded-full bg-gray-100"><div class="h-2 w-[28%] rounded-full bg-blue-400"></div></div></div>
        <div><div class="flex justify-between"><span>Email</span><span>17%</span></div><div class="mt-1 h-2 rounded-full bg-gray-100"><div class="h-2 w-[17%] rounded-full bg-blue-300"></div></div></div>
      </div>
    </div>
  </div>
</div>`;

export const STARTER_TEMPLATES: StarterTemplate[] = [
  { id: 'storefront', category: 'Website', label: 'Storefront', device: 'desktop', code: storefront,
    description: 'Build a modern storefront for an independent design shop. Start with the visual design and the product collection page.' },
  { id: 'mobile-app', category: 'App', label: 'Mobile app', device: 'mobile', code: mobileApp,
    description: 'A running tracker with weekly stats, streaks and a bottom tab bar, designed for the phone first.' },
  { id: 'booking', category: 'App', label: 'Booking system', device: 'desktop', code: booking,
    description: 'Let clients pick a treatment, a date and a time slot, then confirm their appointment in one flow.' },
  { id: 'food', category: 'App', label: 'Food ordering', device: 'desktop', code: food,
    description: 'A delivery menu with categories, dish cards and a cart, ready to connect to a checkout.' },
  { id: 'portfolio', category: 'Website', label: 'Portfolio', device: 'desktop', code: portfolio,
    description: 'A clean personal portfolio with a bold intro, selected case studies and contact details.' },
  { id: 'workspace', category: 'Dashboard', label: 'Team workspace', device: 'desktop', code: workspace,
    description: 'A sprint board with a sidebar, task columns and status, for small teams to plan their work.' },
  { id: 'travel', category: 'Website', label: 'Travel booking', device: 'desktop', code: travel,
    description: 'An editorial travel site with a striking hero and a list of journeys to book.' },
  { id: 'learning', category: 'Website', label: 'Learning platform', device: 'desktop', code: learning,
    description: 'Bite-sized courses with progress tracking, ready to grow into a full learning platform.' },
  { id: 'analytics', category: 'Dashboard', label: 'Analytics', device: 'desktop', code: analytics,
    description: 'A dashboard with KPI cards, a revenue chart and channel breakdown.' },
];

export const PROMPT_SUGGESTIONS = [
  'Voice notes app',
  'Typing speed game',
  'AI writing assistant',
  'Translation app',
  'Pricing page',
  'Habit tracker',
  'Recipe finder',
  'Event landing page',
  'Personal finance dashboard',
  'Restaurant website',
  'Fitness coach app',
  'Wedding RSVP site',
  'Job board',
  'Weather app',
];
