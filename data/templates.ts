import { PreviewDevice } from '../types';

export type TemplateCategory = 'Sites' | 'Apps' | 'Dashboards';

export interface StarterTemplate {
  id: string;
  label: string;
  category: TemplateCategory;
  description: string;
  device: PreviewDevice;
  // Accent used for the blueprint card on the landing page
  accent: string;
  code: string;
}

const bakery = `
<div class="min-h-screen bg-[#fdf6ec] text-[#3b2a1f]">
  <header class="flex items-center justify-between px-6 md:px-12 py-5">
    <div class="flex items-center gap-2"><span class="h-9 w-9 rounded-full bg-[#c2410c] text-[#fdf6ec] grid place-items-center font-serif text-lg">F</span><span class="font-serif text-2xl">Forno Lume</span></div>
    <nav class="hidden md:flex gap-8 text-sm"><a>Menu</a><a>Pre-order</a><a>Visit</a></nav>
    <button class="rounded-full bg-[#3b2a1f] text-[#fdf6ec] text-sm px-5 py-2">Order ahead</button>
  </header>
  <section class="px-6 md:px-12 py-10 md:py-16 grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
    <div>
      <p class="text-sm font-semibold text-[#c2410c]">Wood-fired since 1987 · Bologna</p>
      <h1 class="font-serif text-5xl md:text-7xl leading-[1] mt-4">Bread worth<br>waking up for.</h1>
      <p class="mt-6 text-lg text-[#6b5444] max-w-md">Sourdough, focaccia and cornetti baked every morning at 5. Reserve yours before they're gone.</p>
      <div class="mt-8 flex flex-wrap gap-3"><button class="rounded-full bg-[#c2410c] text-white px-6 py-3 font-semibold">See today's bakes</button><button class="rounded-full border-2 border-[#3b2a1f] px-6 py-3 font-semibold">Find us</button></div>
    </div>
    <div class="relative aspect-square max-w-md w-full mx-auto">
      <div class="absolute inset-0 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#c2410c]"></div>
      <div class="absolute inset-8 rounded-full bg-[#fdf6ec] grid place-items-center text-8xl">🥐</div>
      <div class="absolute -bottom-2 left-4 rotate-[-6deg] bg-white shadow-xl rounded-2xl px-4 py-3"><p class="text-xs text-[#6b5444]">Ready at</p><p class="font-bold">7:30 AM</p></div>
    </div>
  </section>
  <section class="px-6 md:px-12 pb-16 grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="rounded-3xl bg-white p-5"><div class="text-4xl">🍞</div><p class="mt-3 font-semibold">Country sourdough</p><p class="text-sm text-[#6b5444]">€6.50</p></div>
    <div class="rounded-3xl bg-white p-5"><div class="text-4xl">🫓</div><p class="mt-3 font-semibold">Rosemary focaccia</p><p class="text-sm text-[#6b5444]">€4.00</p></div>
    <div class="rounded-3xl bg-white p-5"><div class="text-4xl">🥐</div><p class="mt-3 font-semibold">Pistachio cornetto</p><p class="text-sm text-[#6b5444]">€2.20</p></div>
    <div class="rounded-3xl bg-white p-5"><div class="text-4xl">🍰</div><p class="mt-3 font-semibold">Torta della nonna</p><p class="text-sm text-[#6b5444]">€28.00</p></div>
  </section>
</div>`;

const habits = `
<div class="min-h-screen bg-[#0f0f14] text-white font-sans">
  <div class="px-5 pt-12">
    <p class="text-sm text-white/50">Thursday, 15 Oct</p>
    <div class="flex items-center justify-between mt-1"><h1 class="text-3xl font-bold">Today</h1><span class="rounded-full bg-white/10 px-3 py-1 text-sm">🔥 12</span></div>
  </div>
  <div class="mx-5 mt-6 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-orange-400 p-5">
    <p class="text-sm text-white/80">Daily progress</p>
    <div class="flex items-end justify-between"><p class="text-5xl font-extrabold">4<span class="text-2xl text-white/70">/6</span></p><p class="text-sm text-white/80">habits done</p></div>
    <div class="mt-4 h-2 rounded-full bg-white/25"><div class="h-2 w-2/3 rounded-full bg-white"></div></div>
  </div>
  <div class="px-5 mt-6 space-y-3 pb-28">
    <div class="flex items-center gap-4 rounded-2xl bg-white/5 p-4"><span class="text-2xl">💧</span><div class="flex-1"><p class="font-semibold">Drink water</p><p class="text-xs text-white/50">6 of 8 glasses</p></div><span class="h-7 w-7 rounded-full border-2 border-white/30"></span></div>
    <div class="flex items-center gap-4 rounded-2xl bg-white/5 p-4"><span class="text-2xl">📖</span><div class="flex-1"><p class="font-semibold">Read 20 pages</p><p class="text-xs text-white/50">Done at 8:10</p></div><span class="h-7 w-7 rounded-full bg-emerald-400 text-black grid place-items-center text-sm">✓</span></div>
    <div class="flex items-center gap-4 rounded-2xl bg-white/5 p-4"><span class="text-2xl">🧘</span><div class="flex-1"><p class="font-semibold">Meditate</p><p class="text-xs text-white/50">10 min</p></div><span class="h-7 w-7 rounded-full bg-emerald-400 text-black grid place-items-center text-sm">✓</span></div>
    <div class="flex items-center gap-4 rounded-2xl bg-white/5 p-4"><span class="text-2xl">🚶</span><div class="flex-1"><p class="font-semibold">Walk 8k steps</p><p class="text-xs text-white/50">5,240 so far</p></div><span class="h-7 w-7 rounded-full border-2 border-white/30"></span></div>
  </div>
  <button class="fixed bottom-8 right-6 h-14 w-14 rounded-full bg-white text-black text-3xl shadow-2xl">+</button>
</div>`;

const launch = `
<div class="min-h-screen bg-[#05060a] text-white">
  <header class="flex items-center justify-between px-6 md:px-12 py-5"><span class="font-bold text-lg">◐ Pulsar</span><nav class="hidden md:flex gap-8 text-sm text-white/60"><a>Product</a><a>Changelog</a><a>Docs</a></nav><button class="rounded-lg bg-white text-black text-sm font-semibold px-4 py-2">Get early access</button></header>
  <section class="relative px-6 md:px-12 pt-16 pb-20 text-center overflow-hidden">
    <div class="absolute left-1/2 top-0 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-cyan-500/20 blur-3xl"></div>
    <span class="relative inline-block rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">v2.0 is live — read the notes →</span>
    <h1 class="relative mt-6 text-5xl md:text-7xl font-bold tracking-tight">Ship status pages<br><span class="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">your users trust.</span></h1>
    <p class="relative mt-6 text-white/60 max-w-xl mx-auto text-lg">Real-time uptime, incident timelines and subscriber alerts. Set up in four minutes.</p>
    <div class="relative mt-8 flex justify-center gap-3"><button class="rounded-lg bg-cyan-400 text-black font-semibold px-6 py-3">Start free</button><button class="rounded-lg border border-white/20 px-6 py-3">Book a demo</button></div>
  </section>
  <section class="px-6 md:px-12 pb-20">
    <div class="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div class="flex items-center justify-between"><p class="font-semibold">All systems operational</p><span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span></div>
      <div class="mt-5 flex gap-[3px]"><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-amber-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div><div class="h-8 flex-1 rounded-sm bg-emerald-400/80"></div></div>
      <div class="mt-3 flex justify-between text-xs text-white/40"><span>90 days ago</span><span>99.98% uptime</span><span>Today</span></div>
    </div>
  </section>
</div>`;

const conference = `
<div class="min-h-screen bg-[#fef08a] text-black">
  <header class="flex items-center justify-between px-6 md:px-12 py-5 font-bold"><span>FRAMEWORK/26</span><button class="rounded-full bg-black text-[#fef08a] text-sm px-5 py-2">Get tickets</button></header>
  <section class="px-6 md:px-12 pt-6 pb-12">
    <p class="font-mono text-sm">MAY 14–16 · LISBON · 1,200 BUILDERS</p>
    <h1 class="mt-4 text-6xl md:text-[8rem] font-black leading-[0.85] tracking-tighter">MAKE<br>THINGS<br>PEOPLE<br>LOVE.</h1>
  </section>
  <section class="bg-black text-white px-6 md:px-12 py-12">
    <div class="flex items-end justify-between"><h2 class="text-2xl font-bold">Day 1 schedule</h2><span class="font-mono text-xs text-white/50">TIMES IN WEST</span></div>
    <div class="mt-6 divide-y divide-white/15">
      <div class="py-4 grid grid-cols-[80px_1fr] gap-4"><span class="font-mono text-[#fef08a]">09:30</span><div><p class="font-semibold">Opening keynote: Tools that disappear</p><p class="text-sm text-white/50">Main stage</p></div></div>
      <div class="py-4 grid grid-cols-[80px_1fr] gap-4"><span class="font-mono text-[#fef08a]">11:00</span><div><p class="font-semibold">Designing for one thumb</p><p class="text-sm text-white/50">Room B · Workshop</p></div></div>
      <div class="py-4 grid grid-cols-[80px_1fr] gap-4"><span class="font-mono text-[#fef08a]">14:15</span><div><p class="font-semibold">AI as a material, not a feature</p><p class="text-sm text-white/50">Main stage</p></div></div>
    </div>
  </section>
</div>`;

const recipes = `
<div class="min-h-screen bg-[#f6faf5] text-[#17301f] font-sans">
  <div class="px-5 pt-12 pb-4">
    <p class="text-sm text-[#5b7a64]">Good evening, Sara</p>
    <h1 class="text-3xl font-bold mt-1">What's cooking?</h1>
    <div class="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm text-[#5b7a64]"><span>⌕</span><span class="text-sm">Search 2,400 recipes</span></div>
  </div>
  <div class="px-5 flex gap-2 overflow-x-auto text-sm">
    <span class="shrink-0 rounded-full bg-[#17301f] text-white px-4 py-2">Quick</span><span class="shrink-0 rounded-full bg-white px-4 py-2">Vegetarian</span><span class="shrink-0 rounded-full bg-white px-4 py-2">Pasta</span><span class="shrink-0 rounded-full bg-white px-4 py-2">Desserts</span>
  </div>
  <div class="mx-5 mt-5 rounded-3xl overflow-hidden bg-white shadow-sm">
    <div class="h-44 bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-400 grid place-items-center text-7xl">🥗</div>
    <div class="p-4"><p class="text-xs font-semibold text-emerald-700">TONIGHT'S PICK · 20 MIN</p><p class="text-lg font-bold mt-1">Lemon orzo with peas & mint</p><p class="text-sm text-[#5b7a64] mt-1">★ 4.8 · 512 reviews</p></div>
  </div>
  <div class="px-5 mt-5 grid grid-cols-2 gap-3 pb-28">
    <div class="rounded-2xl bg-white p-3 shadow-sm"><div class="h-20 rounded-xl bg-orange-100 grid place-items-center text-4xl">🍝</div><p class="mt-2 text-sm font-semibold">Cacio e pepe</p><p class="text-xs text-[#5b7a64]">15 min</p></div>
    <div class="rounded-2xl bg-white p-3 shadow-sm"><div class="h-20 rounded-xl bg-rose-100 grid place-items-center text-4xl">🍓</div><p class="mt-2 text-sm font-semibold">Berry galette</p><p class="text-xs text-[#5b7a64]">45 min</p></div>
  </div>
  <nav class="fixed bottom-0 inset-x-0 bg-white border-t border-emerald-100 flex justify-around py-3 pb-6 text-xs text-[#5b7a64]"><span class="text-[#17301f] font-semibold">Discover</span><span>Saved</span><span>Plan</span><span>List</span></nav>
</div>`;

const crm = `
<div class="min-h-screen flex bg-[#f4f4f8] text-zinc-800 text-sm">
  <aside class="hidden md:flex w-16 flex-col items-center gap-4 bg-zinc-900 py-5 text-zinc-400"><span class="h-9 w-9 rounded-xl bg-violet-500 text-white grid place-items-center font-bold">D</span><span>▦</span><span class="text-white">◎</span><span>✉</span><span>⚙</span></aside>
  <main class="flex-1 p-5 md:p-8">
    <div class="flex flex-wrap items-center justify-between gap-3"><div><p class="text-zinc-500">Deals</p><h1 class="text-2xl font-bold">Q4 pipeline</h1></div><div class="flex gap-2"><span class="rounded-lg bg-white px-3 py-2 border">€184k open</span><button class="rounded-lg bg-violet-600 text-white px-4 py-2">Add deal</button></div></div>
    <div class="mt-6 grid md:grid-cols-4 gap-3">
      <div><p class="mb-2 font-semibold text-zinc-500">Lead · 4</p><div class="space-y-2"><div class="rounded-xl bg-white p-3 shadow-sm"><p class="font-medium">Northwind Co.</p><p class="text-xs text-zinc-500">€12,000 · Anna</p></div><div class="rounded-xl bg-white p-3 shadow-sm"><p class="font-medium">Lumen Studio</p><p class="text-xs text-zinc-500">€4,500 · Marco</p></div></div></div>
      <div><p class="mb-2 font-semibold text-zinc-500">Qualified · 3</p><div class="space-y-2"><div class="rounded-xl bg-white p-3 shadow-sm border-l-4 border-sky-400"><p class="font-medium">Atlas Freight</p><p class="text-xs text-zinc-500">€38,000 · Anna</p></div></div></div>
      <div><p class="mb-2 font-semibold text-zinc-500">Proposal · 2</p><div class="space-y-2"><div class="rounded-xl bg-white p-3 shadow-sm border-l-4 border-violet-500"><p class="font-medium">Brightside Health</p><p class="text-xs text-zinc-500">€61,000 · Luca</p></div></div></div>
      <div><p class="mb-2 font-semibold text-zinc-500">Won · 6</p><div class="space-y-2"><div class="rounded-xl bg-emerald-50 p-3 border border-emerald-200"><p class="font-medium">Verde Market</p><p class="text-xs text-emerald-700">€22,000 · closed</p></div></div></div>
    </div>
  </main>
</div>`;

const finance = `
<div class="min-h-screen bg-white text-slate-900 p-5 md:p-8">
  <div class="flex items-center justify-between"><div><p class="text-sm text-slate-500">October budget</p><h1 class="text-3xl font-bold">€1,284 <span class="text-base font-medium text-slate-400">left</span></h1></div><span class="h-10 w-10 rounded-full bg-teal-100 text-teal-700 grid place-items-center font-bold">S</span></div>
  <div class="mt-6 rounded-3xl bg-teal-600 text-white p-5">
    <div class="flex justify-between text-sm text-teal-100"><span>Spent €1,716 of €3,000</span><span>57%</span></div>
    <div class="mt-3 h-3 rounded-full bg-teal-800/50"><div class="h-3 w-[57%] rounded-full bg-white"></div></div>
    <div class="mt-5 grid grid-cols-3 gap-3 text-center text-xs"><div class="rounded-2xl bg-white/10 py-3"><p class="text-lg font-bold">€640</p>Rent</div><div class="rounded-2xl bg-white/10 py-3"><p class="text-lg font-bold">€412</p>Food</div><div class="rounded-2xl bg-white/10 py-3"><p class="text-lg font-bold">€118</p>Fun</div></div>
  </div>
  <h2 class="mt-8 font-semibold">Recent</h2>
  <div class="mt-3 divide-y divide-slate-100">
    <div class="flex items-center gap-3 py-3"><span class="h-10 w-10 rounded-xl bg-amber-100 grid place-items-center">🛒</span><div class="flex-1"><p class="font-medium">Esselunga</p><p class="text-xs text-slate-500">Groceries · Today</p></div><p class="font-semibold">−€54.20</p></div>
    <div class="flex items-center gap-3 py-3"><span class="h-10 w-10 rounded-xl bg-sky-100 grid place-items-center">🚆</span><div class="flex-1"><p class="font-medium">Trenitalia</p><p class="text-xs text-slate-500">Travel · Yesterday</p></div><p class="font-semibold">−€29.90</p></div>
    <div class="flex items-center gap-3 py-3"><span class="h-10 w-10 rounded-xl bg-emerald-100 grid place-items-center">💼</span><div class="flex-1"><p class="font-medium">Salary</p><p class="text-xs text-slate-500">Income · 1 Oct</p></div><p class="font-semibold text-emerald-600">+€2,850</p></div>
  </div>
</div>`;

const realEstate = `
<div class="min-h-screen bg-[#f7f7f5] text-neutral-900">
  <header class="flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b"><span class="font-bold text-lg">casa<span class="text-rose-500">.</span>nova</span><div class="hidden md:flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-neutral-500">Milan · 2+ rooms · under €450k</div><button class="text-sm font-medium">Saved (3)</button></header>
  <section class="px-6 md:px-12 py-8">
    <div class="flex items-end justify-between"><h1 class="text-2xl md:text-3xl font-bold">148 homes in Milan</h1><span class="text-sm text-neutral-500">Sort: newest</span></div>
    <div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div><div class="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-sky-200 to-indigo-200"><span class="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">New</span><span class="absolute top-3 right-3 h-8 w-8 rounded-full bg-white grid place-items-center">♡</span></div><p class="mt-3 font-semibold">€395,000</p><p class="text-sm text-neutral-500">3 rooms · 92 m² · Isola</p></div>
      <div><div class="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-200 to-rose-200"><span class="absolute top-3 right-3 h-8 w-8 rounded-full bg-white grid place-items-center text-rose-500">♥</span></div><p class="mt-3 font-semibold">€429,000</p><p class="text-sm text-neutral-500">2 rooms · 78 m² · Navigli · Balcony</p></div>
      <div><div class="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-200"><span class="absolute top-3 left-3 rounded-full bg-black text-white px-2.5 py-1 text-xs font-semibold">Open house Sat</span><span class="absolute top-3 right-3 h-8 w-8 rounded-full bg-white grid place-items-center">♡</span></div><p class="mt-3 font-semibold">€349,000</p><p class="text-sm text-neutral-500">2 rooms · 70 m² · Città Studi</p></div>
    </div>
  </section>
</div>`;

export const STARTER_TEMPLATES: StarterTemplate[] = [
  { id: 'bakery', category: 'Sites', label: 'Bakery & café', device: 'desktop', accent: '#c2410c', code: bakery,
    description: 'A warm local-business site with today\'s bakes, pre-orders and opening hours.' },
  { id: 'habits', category: 'Apps', label: 'Habit tracker', device: 'mobile', accent: '#d946ef', code: habits,
    description: 'A dark, thumb-friendly daily checklist with streaks and a progress ring.' },
  { id: 'launch', category: 'Sites', label: 'Product launch', device: 'desktop', accent: '#22d3ee', code: launch,
    description: 'A dark SaaS launch page with a glowing hero and a live uptime widget.' },
  { id: 'recipes', category: 'Apps', label: 'Recipe finder', device: 'mobile', accent: '#10b981', code: recipes,
    description: 'Search, filters and a tonight\'s-pick card, with a native-style tab bar.' },
  { id: 'conference', category: 'Sites', label: 'Event & tickets', device: 'desktop', accent: '#eab308', code: conference,
    description: 'A loud, typographic event page with a day-by-day schedule.' },
  { id: 'crm', category: 'Dashboards', label: 'Sales pipeline', device: 'desktop', accent: '#8b5cf6', code: crm,
    description: 'A compact CRM board with deal stages, values and owners.' },
  { id: 'finance', category: 'Apps', label: 'Budget planner', device: 'mobile', accent: '#0d9488', code: finance,
    description: 'Monthly budget, spending categories and recent transactions at a glance.' },
  { id: 'real-estate', category: 'Dashboards', label: 'Home listings', device: 'desktop', accent: '#f43f5e', code: realEstate,
    description: 'Property search results with saved homes, tags and quick facts.' },
];

export const PROMPT_SUGGESTIONS = [
  'Plant watering reminder',
  'Gym class booking',
  'Book club app',
  'Freelancer invoice tool',
  'Podcast landing page',
  'Language flashcards',
  'Dog walking app',
  'Coffee shop menu',
  'Study timer',
  'Volunteer sign-up',
  'Wine cellar tracker',
  'Hiking trail guide',
  'Kids chore chart',
  'Band tour dates page',
];
