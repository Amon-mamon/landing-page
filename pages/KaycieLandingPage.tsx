import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
// TODO: WHEN I SCROLL IN THE PRODUCTS I WANT THE CENTER TO EXPAND THEN WHEN ITS NOT HIGHLIGHTED I WANT THE SIDE TO GO BACK
/* ---------------------------------------------------------------
   Kaycie Aesthetic Center: black & white, 3D scroll landing page
   Needs in /public:
     kaycie-logo-black.png, kaycie-logo-white.png  (transparent logos)
     kaycie-product1.png ... kaycie-product6.png   (your product photos)
---------------------------------------------------------------- */

/* ---------- Data ---------- */
interface Treatment { name: string; desc: string, img:string }
interface Product { name: string; desc: string; price: string; img: string }

const treatments: Treatment[] = [
  { name: "Facial Treatments", desc: "Deep cleansing, hydrating and brightening facials chosen for your skin.", img:"/model2.png" },
  { name: "Beauty Enhancing Services", desc: "Refined, non-surgical touches that bring out your natural features.", img:"/model2.png" },
  { name: "Weight-loss Procedures", desc: "Guided programs, supervised by our clinic team, for steady progress." , img:"/model2.png"},
  { name: "Botox", desc: "Precisely placed treatment that softens lines while keeping expression natural.", img:"/model2.png" },
  { name: "Gluta", desc: "Glutathione programs for skin that looks brighter and more even.", img:"/model2.png" },
  { name: "Other Aesthetic Procedures", desc: "Ask about treatments for pigmentation, scars and other skin concerns.", img:"/model2.png" },
];

const products: Product[] = [
  { name: "Gluta Radiance Serum", desc: "A lightweight daily serum for a brighter-looking complexion.", price: "₱1,450", img: "/kaycie-product1.png" },
  { name: "Hydra Cleanse Gel", desc: "Gentle foaming cleanser that leaves skin soft, never tight.", price: "₱680", img: "/kaycie-product2.png" },
  { name: "Daily Shield SPF 50", desc: "Light, invisible sun protection for every day.", price: "₱890", img: "/kaycie-product3.png" },
  { name: "Collagen Boost Sachets", desc: "A daily drink mix to support your skin from within.", price: "₱1,200", img: "/kaycie-product4.png" },
  { name: "Slim Detox Tea", desc: "A calming herbal blend to complement your wellness program.", price: "₱520", img: "/kaycie-product5.png" },
  { name: "Renewal Night Cream", desc: "A rich overnight cream for skin that wakes up rested.", price: "₱1,750", img: "/kaycie-product6.png" },
];

/* ---------- Shared classes / helpers ---------- */
const display = "font-['Cormorant_Garamond',Georgia,serif]";
const pad = "w-full px-6 sm:px-10 lg:px-20";
const btnDark =
  "inline-flex items-center justify-center bg-[#0a0a0a] px-9 py-4 text-[12px] font-medium uppercase tracking-[0.2em] text-white ring-1 ring-[#0a0a0a] transition duration-500 hover:bg-transparent hover:text-[#0a0a0a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a0a0a]";
const btnLight =
  "inline-flex items-center justify-center bg-white px-9 py-4 text-[12px] font-medium uppercase tracking-[0.2em] text-[#0a0a0a] ring-1 ring-white transition duration-500 hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
const field =
  "w-full border-0 border-b border-black/30 bg-transparent px-0 py-3 text-base text-[#0a0a0a] placeholder:text-black/40 transition focus:border-[#0a0a0a] focus:outline-none focus-visible:border-b-2";

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const ease = (t: number) => t * t * (3 - 2 * t);

/* Progress (0..1) of a tall section while its sticky child is pinned */
function useSceneProgress(ref: React.RefObject<HTMLElement | null>, cb: (p: number) => void) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const run = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      cbRef.current(total > 0 ? clamp(-r.top / total, 0, 1) : 0);
    };
    run();
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    return () => {
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    };
  }, [ref]);
}

/* 3D tilt-in reveal */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`origin-top transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
        shown
          ? "opacity-100 [transform:perspective(1000px)_rotateX(0deg)_translateY(0)]"
          : "opacity-0 [transform:perspective(1000px)_rotateX(16deg)_translateY(48px)]"
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* Words light up as you scroll */
const ScrollWords: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    const run = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.45 + r.height * 0.7), 0, 1);
      spans.forEach((s, i) => {
        const t = clamp(p * spans.length * 1.2 - i, 0, 1);
        s.style.opacity = String(0.15 + 0.85 * t);
      });
    };
    run();
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    return () => {
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w className="mr-[0.26em] inline-block" style={{ opacity: 0.15 }}>
          {w}
        </span>
      ))}
    </p>
  );
};

/* ---------- Page ---------- */
const KaycieLandingPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(0);

  const lenisRef = useRef<Lenis | null>(null);

  /* hero refs */
  const heroRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  /* product ring refs */
  const ringSection = useRef<HTMLElement>(null);
  const ringWrap = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  /* Smooth scrolling */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (!reduce) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenisRef.current = lenis;
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* 3D hero: logo turns away, headline arrives from depth */
  useSceneProgress(heroRef, (p) => {
    const logoVis = 1 - ease(clamp((p - 0.3) / 0.3, 0, 1));
    if (logoRef.current) {
      logoRef.current.style.opacity = String(logoVis);
      logoRef.current.style.transform = `rotateY(${-16 + p * 80}deg) rotateX(${p * 10}deg) translateZ(${p * 220}px) scale(${1 + p * 0.1})`;
    }
    const copyVis = ease(clamp((p - 0.5) / 0.3, 0, 1));
    if (copyRef.current) {
      copyRef.current.style.opacity = String(copyVis);
      copyRef.current.style.transform = `translateZ(${-320 + copyVis * 320}px) translateY(${(1 - copyVis) * 40}px)`;
      copyRef.current.style.pointerEvents = copyVis > 0.6 ? "auto" : "none";
    }
    if (framesRef.current) {
      framesRef.current.style.transform = `rotateY(${p * 60 - 24}deg) rotateX(${p * 14 - 4}deg)`;
    }
    if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - p * 5, 0, 1));
  });

  /* 3D product ring driven by scroll */
  useSceneProgress(ringSection, (p) => {
    const n = products.length;
    const w = window.innerWidth;
    const R = w < 640 ? 230 : w < 1024 ? 340 : 470;
    const step = 360 / n;
    const rot = -p * (n - 1) * step;

    if (ringWrap.current) ringWrap.current.style.transform = `translateZ(${-R}px) rotateX(-4deg)`;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = i * step + rot;
      const norm = ((((a % 360) + 360) % 360) + 180) % 360 - 180;
      const f = Math.max(0, Math.cos((norm * Math.PI) / 180));
      el.style.transform = `translate(-50%,-50%) rotateY(${a}deg) translateZ(${R}px)`;
      el.style.opacity = String(0.2 + 0.8 * f);
    });
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
    setActive(Math.round(p * (n - 1)));
  });

  const go = (e: React.MouseEvent | null, hash: string) => {
    e?.preventDefault();
    setMenu(false);
    const el = document.querySelector(hash) as HTMLElement | null;
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -64, duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const goBook = (item = "") => {
    setSelected(item);
    go(null, "#book");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: send form data to your backend / email service here
    setSent(true);
  };

  const links: [string, string][] = [
    ["Treatments", "#treatments"],
    ["Products", "#products"],
    ["Contact", "#contact"],
  ];

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#faf9f7] font-['Jost',system-ui,sans-serif] font-light leading-relaxed text-[#0a0a0a]">
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html.lenis,html.lenis body{height:auto}
        .lenis.lenis-smooth{scroll-behavior:auto!important}
        @keyframes fade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .fade{animation:fade .7s cubic-bezier(.2,.7,.2,1) both}
        @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
        .drift{animation:drift 2.4s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.fade,.drift{animation:none}}
      `}</style>

      {/* Navigation */}
      <nav
        className={`fixed top-0 z-40 w-full transition duration-500 ${
          scrolled ? "bg-[#faf9f7]/85 shadow-[0_1px_0_rgba(0,0,0,.1)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className={`${pad} flex h-16 items-center justify-between`}>
          <a href="#top" onClick={(e) => go(e, "#top")} className={`${display} text-[22px] font-medium tracking-[0.35em]`}>
            KAYCIE
          </a>
          <div className="flex items-center gap-9 text-[13px] uppercase tracking-[0.18em]">
            {links.map(([label, hash]) => (
              <a key={hash} href={hash} onClick={(e) => go(e, hash)} className="hidden transition-opacity hover:opacity-50 md:inline">
                {label}
              </a>
            ))}
            <a href="#book" onClick={(e) => go(e, "#book")} className="border-b border-[#0a0a0a] pb-0.5 transition-opacity hover:opacity-50">
              Book now
            </a>
            <button
              aria-label="Menu"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
            >
              <span className={`h-px w-5 bg-current transition ${menu ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`h-px w-5 bg-current transition ${menu ? "opacity-0" : ""}`} />
              <span className={`h-px w-5 bg-current transition ${menu ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
        {menu && (
          <div className="border-t border-black/10 bg-[#faf9f7] px-6 py-4 md:hidden">
            {links.map(([label, hash]) => (
              <a key={hash} href={hash} onClick={(e) => go(e, hash)} className={`${display} block py-3 text-2xl`}>
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero: pinned 3D scene */}
      <header ref={heroRef} id="top" className="relative h-[280vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden [perspective:1400px]">
          {/* depth frames */}
          <div ref={framesRef} className="pointer-events-none absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]" aria-hidden="true">
            <div className="absolute h-[78vmin] w-[54vmin] border border-black/10 [transform:translateZ(-260px)]" />
            <div className="absolute h-[70vmin] w-[48vmin] border border-black/15 [transform:translateZ(-60px)]" />
            <div className="absolute h-[62vmin] w-[42vmin] border border-black/20 [transform:translateZ(140px)]" />
          </div>

          {/* Act 1: the logo */}
          <div ref={logoRef} className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
            <img
              src="/kaycie-logo-black.png"
              alt="Kaycie Aesthetic Center"
              fetchPriority="high"
              className="h-[min(66vh,600px)] w-auto"
            />
          </div>

          {/* Act 2: the headline */}
          <div
            ref={copyRef}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0"
          >
            <h1 className={`${display} max-w-4xl text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl`}>
              Aesthetic and Beauty Clinic
            </h1>
            <p className="mt-8 max-w-xl text-base text-[#5d5a55] sm:text-lg">
              Provider of quality and precise facial treatments, beauty enhancing
              services, weight-loss procedures, Botox, Gluta and other aesthetic
              procedures.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#book" onClick={(e) => go(e, "#book")} className={btnDark}>
                Book a consultation
              </a>
              <a href="#treatments" onClick={(e) => go(e, "#treatments")} className="inline-flex items-center px-6 py-4 text-[12px] font-medium uppercase tracking-[0.2em] underline-offset-8 hover:underline">
                View treatments
              </a>
            </div>
          </div>

          <div ref={hintRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[11px] uppercase tracking-[0.3em] text-[#5d5a55]">
            <span className="drift block">Scroll</span>
          </div>
        </div>
      </header>

      {/* Statement */}
      <section className={`${pad} bg-[#0a0a0a] py-32 text-white lg:py-52`}>
        <ScrollWords
          className={`${display} mx-auto max-w-5xl text-3xl font-light leading-[1.2] sm:text-5xl lg:text-6xl`}
          text="Beautiful results come from precision, honest advice and unhurried care. Every visit to Kaycie begins with listening, and ends with how you feel."
        />
      </section>

      {/* Treatments */}
      <section id="treatments" className={`${pad} py-24 lg:py-36`}>
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.5fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <h2 className={`${display} mb-6 text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl`}>Treatments</h2>
              <p className="mb-10 max-w-sm text-[#5d5a55]">
                Every plan starts with a consultation, so your treatment fits your skin, your goals and your pace.
              </p>
              <button onClick={() => goBook()} className={btnDark}>Book a consultation</button>
            </Reveal>
          </div>

          <div className="border-t border-black/15">
            {treatments.map((t, i) => (
              <Reveal className="flex" key={t.name} delay={i * 50}>
                <img src={t.img}/>
                <div className="group flex flex-col gap-4 border-b border-black/15 py-9 md:flex-row md:items-center md:justify-between md:gap-10">
                  <div>
                    <h3 className={`${display} text-3xl font-light transition-transform duration-500 group-hover:translate-x-3 sm:text-4xl lg:text-5xl`}>
                      {t.name}
                    </h3>
                    <p className="mt-2 max-w-md text-[#5d5a55]">{t.desc}</p>
                  </div>
                  <button
                    onClick={() => goBook(t.name)}
                    className="w-fit shrink-0 text-[12px] font-medium uppercase tracking-[0.2em] underline decoration-black/30 underline-offset-8 transition hover:decoration-black"
                  >
                    Inquire
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Products: 3D ring */}
      <section ref={ringSection} id="products" className="relative h-[520vh] w-full bg-[#0a0a0a] text-white">
        <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
          <div className={`${pad} flex shrink-0 items-end justify-between gap-6 pt-24`}>
            <h2 className={`${display} text-4xl font-light tracking-tight sm:text-6xl`}>Signature products</h2>
            <p className="hidden max-w-xs text-sm text-white/60 md:block">
              The skin care we trust in our clinic, available in store. Keep scrolling to turn the collection.
            </p>
          </div>

          {/* stage */}
          <div className="relative min-h-0 flex-1 [perspective:1600px]">
            <div ref={ringWrap} className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]">
              {products.map((p, i) => (
                <div
                  key={p.name}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="absolute left-0 top-0 w-[165px] bg-white text-[#0a0a0a] shadow-[0_30px_80px_-30px_rgba(255,255,255,.25)] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] sm:w-[220px] lg:w-[250px]"
                >
                  <div
                    className="relative aspect-[4/5] w-full bg-[#f1efeb] bg-[length:55%] bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/kaycie-logo-black.png)" }}
                  >
                    <div className="absolute inset-0 bg-[#f1efeb]/90" />
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="absolute inset-0 h-full w-full object-contain p-5"
                    />
                  </div>
                  <div className="px-4 py-3">
                    <p className={`${display} text-lg leading-tight sm:text-xl`}>{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* active product details */}
          <div className={`${pad} shrink-0`}>
            <div className="mb-5 flex items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-white/50">
              <span>{active + 1} / {products.length}</span>
              <div className="h-px w-40 bg-white/20">
                <div ref={progressRef} className="h-px origin-left bg-white" style={{ transform: "scaleX(0)" }} />
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-white/15 pb-8 pt-6">
              <div key={active} className="fade max-w-xl">
                <h3 className={`${display} text-3xl font-light sm:text-4xl`}>{products[active].name}</h3>
                <p className="mt-2 text-white/65">{products[active].desc}</p>
              </div>
              <div className="flex items-center gap-8">
                <span className={`${display} text-3xl`}>{products[active].price}</span>
                <button onClick={() => goBook(products[active].name)} className={btnLight}>Inquire</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book + Contact */}
      <section id="book" className={`${pad} bg-[#efece7] py-24 lg:py-36`}>
        <div id="contact" className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-28">
          <Reveal>
            <h2 className={`${display} mb-6 text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl`}>
              Book a consultation
            </h2>
            <p className="mb-12 max-w-md text-[#5d5a55]">
              Tell us what you are interested in and our team will confirm your appointment by message.
            </p>
            <div className="space-y-6 text-[#5d5a55]">
              <p><strong className="mb-1 block text-[12px] font-medium uppercase tracking-[0.2em] text-[#0a0a0a]">Visit</strong>123 Rizal Street, Mabalacat City, Pampanga</p>
              <p><strong className="mb-1 block text-[12px] font-medium uppercase tracking-[0.2em] text-[#0a0a0a]">Call or text</strong>0917 000 0000</p>
              <p><strong className="mb-1 block text-[12px] font-medium uppercase tracking-[0.2em] text-[#0a0a0a]">Email</strong>hello@kaycie.example</p>
              <p><strong className="mb-1 block text-[12px] font-medium uppercase tracking-[0.2em] text-[#0a0a0a]">Hours</strong>Mon–Sat 10:00 AM – 7:00 PM</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {sent ? (
              <div role="status" className={`${display} bg-[#0a0a0a] p-10 text-3xl font-light text-white`}>
                Thank you. We received your request and will contact you shortly to confirm.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-7">
                <div className="grid gap-7 sm:grid-cols-2">
                  <label className="text-[12px] font-medium uppercase tracking-[0.2em]">
                    Full name
                    <input name="name" required placeholder="Your name" className={`${field} mt-1`} />
                  </label>
                  <label className="text-[12px] font-medium uppercase tracking-[0.2em]">
                    Phone number
                    <input name="phone" type="tel" required placeholder="09XX XXX XXXX" className={`${field} mt-1`} />
                  </label>
                </div>
                <label className="text-[12px] font-medium uppercase tracking-[0.2em]">
                  Treatment or product
                  <select name="interest" required value={selected} onChange={(e) => setSelected(e.target.value)} className={`${field} mt-1`}>
                    <option value="" disabled>Choose one</option>
                    <optgroup label="Treatments">
                      {treatments.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Products">
                      {products.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                <div className="grid gap-7 sm:grid-cols-2">
                  <label className="text-[12px] font-medium uppercase tracking-[0.2em]">
                    Preferred date
                    <input name="date" type="date" required className={`${field} mt-1`} />
                  </label>
                  <label className="text-[12px] font-medium uppercase tracking-[0.2em]">
                    Preferred time
                    <input name="time" type="time" required className={`${field} mt-1`} />
                  </label>
                </div>
                <label className="text-[12px] font-medium uppercase tracking-[0.2em]">
                  Message (optional)
                  <textarea name="message" rows={3} placeholder="Tell us about your skin goals" className={`${field} mt-1 resize-none`} />
                </label>
                <button type="submit" className={`${btnDark} mt-2 w-full sm:w-fit`}>Request appointment</button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0a0a0a] text-white/70">
        <div className={`${pad} flex flex-col items-center gap-10 py-20 text-center`}>
          <img src="/kaycie-logo-white.png" alt="Kaycie Aesthetic Center" className="h-44 w-auto" />
          <div className="flex flex-wrap justify-center gap-8 text-[12px] uppercase tracking-[0.2em]">
            <a className="transition hover:text-white" href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a className="transition hover:text-white" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a className="transition hover:text-white" href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </div>
        <small className={`${pad} block border-t border-white/10 py-6 text-center text-[12px] tracking-wide`}>
          © {new Date().getFullYear()} Kaycie Aesthetic Center. All rights reserved.
        </small>
      </footer>
    </div>
  );
};

export default KaycieLandingPage;