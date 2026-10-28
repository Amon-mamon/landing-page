import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

/* ---------- Data ---------- */
interface Service { name: string; desc: string; price: string; duration: string }
interface Product { name: string; desc: string; price: string; img: string }
interface Work { title: string; client: string; service: string; tone: string; img: string }

const services: Service[] = [
  { name: "Cut & Style", desc: "Consultation, wash, precision cut and blow-dry.", price: "₱600", duration: "60 min" },
  { name: "Hair Color", desc: "Full color, highlights, balayage or root touch-up.", price: "₱1,800", duration: "2–3 hrs" },
  { name: "Rebond & Treatment", desc: "Smoothing, keratin and deep-conditioning repair.", price: "₱2,500", duration: "3 hrs" },
  { name: "Manicure & Pedicure", desc: "Shape, cuticle care, polish or gel finish.", price: "₱450", duration: "75 min" },
  { name: "Facial & Skin Care", desc: "Deep cleanse, exfoliation and hydrating mask.", price: "₱900", duration: "60 min" },
  { name: "Bridal & Event Glam", desc: "Hair and makeup for weddings and special days.", price: "₱3,500", duration: "2 hrs" },
];

const branches: string[] = ["Branch 1", "Branch 2", "Branch 3", "Branch 4"];

const products: Product[] = [
  { name: "Aloe Repair Shampoo", desc: "Gentle daily cleanse for dry hair.", price: "₱380", img: "/product1.png" },
  { name: "Matcha Hair Mask", desc: "Weekly deep-conditioning treatment.", price: "₱520", img: "/product1.png" },
  { name: "Argan Shine Serum", desc: "Smooths frizz, adds lasting gloss.", price: "₱450", img: "/product1.png" },
  { name: "Cuticle Oil Pen", desc: "Nourishes nails between visits.", price: "₱220", img: "/product1.png" },
];

const works: Work[] = [
  { title: "Soft balayage", client: "Maria S.", service: "Hair Color", tone: "from-[#e6d3a3] to-[#b8923d]", img: "/salon3.jpg" },
  { title: "Glossy bob cut", client: "Jen R.", service: "Cut & Style", tone: "from-[#f0dfb0] to-[#8a6a2a]", img: "/salon3.jpg" },
  { title: "Keratin smoothing", client: "Ana L.", service: "Rebond & Treatment", tone: "from-[#d4b062] to-[#2a2a2a]", img: "/salon3.jpg" },
  { title: "Bridal updo", client: "Camille D.", service: "Bridal & Event Glam", tone: "from-[#b8923d] to-[#0a0a0a]", img: "/salon3.jpg" },
];

/* ---------- Shared classes ---------- */
const display = "font-['Fraunces',Georgia,serif]";
const pad = "w-full px-6 sm:px-10 lg:px-20";
const btn =
  "inline-flex items-center justify-center rounded-full bg-[#c9a24b] px-7 py-3 text-[15px] font-semibold text-[#0a0a0a] transition duration-300 hover:bg-[#e3c783] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a24b]";
const field =
  "w-full rounded-xl border border-[#d9cfb4] bg-white px-4 py-3 text-[15px] transition focus:border-[#c9a24b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a24b]";

/* ---------- Small helpers ---------- */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
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
      className={`transition duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:!translate-y-0 motion-reduce:!opacity-100 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* ---------- Component ---------- */
const SalonLandingPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [activeWork, setActiveWork] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  /* Smooth (inertia) scrolling + scroll-linked effects */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (!reduce) {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenisRef.current = lenis;
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      rootRef.current?.style.setProperty("--sy", String(y));
      setScrolled(y > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const go = (e: React.MouseEvent | null, hash: string) => {
    e?.preventDefault();
    setMenu(false);
    const el = document.querySelector(hash) as HTMLElement | null;
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -64, duration: 1.5 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const goBook = (service = "") => {
    setSelected(service);
    go(null, "#book");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: send form data to your backend / email service here
    setSent(true);
  };

  const navLink = `hidden transition-colors md:inline ${
    scrolled ? "text-[#141414] hover:text-[#8a6a2a]" : "text-white/90 hover:text-[#e3c783]"
  }`;
  const links: [string, string][] = [
    ["Services", "#services"],
    ["Products", "#products"],
    ["About", "#about"],
    ["Contact", "#contact"],
  ];

  return (
    <div
      ref={rootRef}
      className="min-h-screen w-full overflow-x-hidden bg-[#f8f6f0] font-['DM_Sans',system-ui,sans-serif] leading-relaxed text-[#141414]"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html.lenis,html.lenis body{height:auto}
        .lenis.lenis-smooth{scroll-behavior:auto!important}
        @keyframes rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes grow{from{opacity:0;transform:scaleY(.55)}to{opacity:1;transform:none}}
        @keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes settle{from{opacity:0;transform:scale(1.16)}to{opacity:1;transform:scale(1.05)}}
        .settle{animation:settle 1.8s cubic-bezier(.2,.7,.2,1) both}
        .rise{animation:rise 1s cubic-bezier(.2,.7,.2,1) both}
        .grow{animation:grow 1.2s cubic-bezier(.2,.7,.2,1) both;transform-origin:bottom}
        .slide{animation:slide 38s linear infinite}
        @media (prefers-reduced-motion:reduce){.rise,.grow,.slide,.settle{animation:none}}
      `}</style>

      {/* Scroll progress */}
      <div
        ref={barRef}
        className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-[#c9a24b]"
        style={{ transform: "scaleX(0)" }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 z-40 w-full transition duration-500 ${
          scrolled ? "bg-[#f8f6f0]/85 shadow-[0_1px_0_rgba(0,0,0,.08)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className={`${pad} flex h-16 items-center justify-between`}>
          <a
            href="#top"
            onClick={(e) => go(e, "#top")}
            className={`${display} text-2xl font-semibold transition-colors ${scrolled ? "text-[#0a0a0a]" : "text-white"}`}
          >
            BLM
          </a>
          <div className="flex items-center gap-7 text-[15px]">
            {links.map(([label, hash]) => (
              <a key={hash} href={hash} onClick={(e) => go(e, hash)} className={navLink}>
                {label}
              </a>
            ))}
            <a href="#book" onClick={(e) => go(e, "#book")} className={`${btn} !px-5 !py-2 !text-sm`}>
              Book now
            </a>
            <button
              aria-label="Menu"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden ${scrolled ? "text-[#0a0a0a]" : "text-white"}`}
            >
              <span className={`h-[2px] w-5 bg-current transition ${menu ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`h-[2px] w-5 bg-current transition ${menu ? "opacity-0" : ""}`} />
              <span className={`h-[2px] w-5 bg-current transition ${menu ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
        {menu && (
          <div className="border-t border-black/10 bg-[#f8f6f0] px-6 py-4 md:hidden">
            {links.map(([label, hash]) => (
              <a key={hash} href={hash} onClick={(e) => go(e, hash)} className="block py-3 text-lg text-[#0a0a0a]">
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero: full-width model image */}
      <header id="top" className="relative w-full overflow-hidden bg-gradient-to-br from-[#1d1b17] to-[#0a0a0a] text-white">
        {/* Image (parallax wrapper + slow settle animation) */}
        <div
          className="absolute inset-0"
          style={{ transform: "translate3d(0,calc(var(--sy,0)*0.08px),0)" }}
          aria-hidden="true"
        >
          <img
            src="/gemini.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="settle h-full w-full object-cover object-[72%_center]"
          />
        </div>

        {/* Readability overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/55 lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a]/70 to-transparent" />

        {/* Content */}
        <div className={`${pad} relative flex min-h-screen items-end pb-20 pt-32 lg:items-center`}>
          <div className="max-w-2xl">
            <h1
              className={`${display} rise mb-6 text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl xl:text-8xl`}
              style={{ animationDelay: ".1s" }}
            >
              Hair taken care of slowly.
            </h1>
            <p className="rise mb-10 max-w-md text-lg text-[#e7e0d0]" style={{ animationDelay: ".3s" }}>
              A quiet, plant-filled salon where every visit starts with a real
              conversation about what you want.
            </p>
            <div className="rise flex flex-wrap gap-3.5" style={{ animationDelay: ".5s" }}>
              <a href="#book" onClick={(e) => go(e, "#book")} className="inline-flex rounded-full bg-[#c9a24b] px-8 py-3.5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[#e3c783]">
                Book an appointment
              </a>
              <a href="#contact" onClick={(e) => go(e, "#contact")} className="inline-flex rounded-full border border-white/50 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:border-[#c9a24b] hover:text-[#e3c783]">
                Contact us
              </a>
            </div>
          </div>
        </div>

        <div className="rise absolute bottom-8 right-6 hidden rounded-full bg-[#f8f6f0] px-5 py-2.5 text-sm font-medium text-[#0a0a0a] shadow-xl sm:block lg:right-20" style={{ animationDelay: ".9s" }}>
          Open today, 9 AM to 7 PM
        </div>
      </header>

      {/* Marquee */}
      <div className="w-full overflow-hidden bg-[#c9a24b] py-5" aria-hidden="true">
        <div className="slide flex w-max items-center gap-10 whitespace-nowrap">
          {[0, 1].map((n) => (
            <div key={n} className="flex items-center gap-10">
              {services.map((s) => (
                <React.Fragment key={s.name + n}>
                  <span className={`${display} text-3xl italic text-[#0a0a0a]`}>{s.name}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0a0a0a]" />
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <section id="services" className={`${pad} py-24 lg:py-32`}>
        <Reveal className="mb-14 grid gap-4 lg:grid-cols-2 lg:items-end">
          <h2 className={`${display} text-4xl font-medium tracking-tight text-[#0a0a0a] sm:text-5xl lg:text-6xl`}>
            Our services
          </h2>
          <p className="max-w-md text-[#6b665c] lg:justify-self-end">
            Pick a treatment and book it in a minute. Prices start at the amounts shown.
          </p>
        </Reveal>

        <div className="border-t border-black/15">
          {services.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <div className="group grid items-center gap-3 border-b border-black/15 py-7 transition-colors duration-300 hover:bg-[#efe9db] md:grid-cols-[1.2fr_2fr_auto_auto] md:gap-8 md:px-4">
                <h3 className={`${display} text-2xl font-medium text-[#0a0a0a] transition-transform duration-300 group-hover:translate-x-2 md:text-3xl`}>
                  {s.name}
                </h3>
                <p className="text-[#6b665c]">{s.desc}</p>
                <div className="flex items-baseline gap-4 md:flex-col md:items-end md:gap-0">
                  <span className="text-xl font-semibold text-[#8a6a2a]">{s.price}</span>
                  <span className="text-sm text-[#6b665c]">{s.duration}</span>
                </div>
                <button onClick={() => goBook(s.name)} className={`${btn} w-fit`}>
                  Book {s.name}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className={`${pad} bg-[#efe9db] py-24 lg:py-32`}>
        <div className="grid items-start gap-14 md:grid-cols-2 lg:gap-24">
          <div className="md:sticky md:top-28">
            <Reveal>
              <div className={`${display} relative flex aspect-[4/5] w-full max-w-xl items-end overflow-hidden rounded-t-[999px] rounded-b-3xl bg-gradient-to-b from-[#e6d3a3] via-[#b8923d] to-[#0a0a0a] p-8 text-2xl italic text-white`}>
                <div className="absolute left-1/2 top-[14%] h-24 w-24 -translate-x-1/2 rounded-full bg-[#f8f6f0]/90" />
                Where good hair days begin
              </div>
            </Reveal>
          </div>
          <div>
            <Reveal>
              <h2 className={`${display} mb-8 text-4xl font-medium tracking-tight text-[#0a0a0a] sm:text-5xl lg:text-6xl`}>
                About BLM Salon
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mb-5 max-w-xl text-lg text-[#6b665c]">
                We opened BLM to make salon visits feel unhurried. Our stylists
                are licensed, trained in the latest techniques, and take time to
                listen before they pick up the scissors.
              </p>
              <p className="mb-5 max-w-xl text-lg text-[#6b665c]">
                We use gentle, plant-based products wherever we can, and we sell
                the same ones we use so you can keep your results at home.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-black/15 pt-8">
                {[
                  ["8+", "years open"],
                  ["5,000+", "happy clients"],
                  ["12", "stylists"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <b className={`${display} block text-4xl font-medium text-[#8a6a2a] sm:text-5xl`}>{n}</b>
                    <span className="text-sm text-[#6b665c]">{l}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className={`${pad} bg-[#0a0a0a] py-24 text-white lg:py-32`}>
        <Reveal className="mb-16 grid gap-4 border-b border-[#c9a24b]/30 pb-10 lg:grid-cols-2 lg:items-end">
          <h2 className={`${display} text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl`}>
            Take the salon home
          </h2>
          <p className="max-w-md text-[#cfc8b8] lg:justify-self-end">
            The products our stylists use every day, available in store.
          </p>
        </Reveal>

        <div className="grid w-full gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.name} delay={i * 90} className={i % 2 === 1 ? "lg:mt-16" : ""}>
              <article className="group">
                {/* Image panel. Use object-contain + p-8 instead of object-cover if your photos are cut-out product shots. */}
                <div className="relative mb-6 aspect-[4/5] w-full overflow-hidden rounded-md bg-gradient-to-b from-[#1d1b17] to-[#0f0f0f] ring-1 ring-[#c9a24b]/25 transition duration-500 group-hover:ring-[#c9a24b]/70">
                  <img
                    src={p.img}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className={`${display} text-xl font-medium`}>{p.name}</h3>
                  <span className="font-semibold text-[#e3c783]">{p.price}</span>
                </div>
                <p className="mt-2 text-sm text-[#cfc8b8]">{p.desc}</p>
                <span className="mt-5 block h-px w-10 bg-[#c9a24b] transition-all duration-500 group-hover:w-full" />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Customers' completed services */}
      <section className={`${pad} py-24 lg:py-32`}>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-24">
          {/* Looks list */}
          <div className="order-last lg:order-first">
            <Reveal>
              <h2 className={`${display} mb-4 text-4xl font-medium tracking-tight text-[#0a0a0a] sm:text-5xl lg:text-6xl`}>
                Recent client work
              </h2>
              <p className="mb-10 max-w-md text-[#6b665c]">
                A few of the looks we created this month. Choose one to see it up close.
              </p>
            </Reveal>

            <div className="border-t border-black/15">
              {works.map((w, i) => {
                const active = i === activeWork;
                return (
                  <Reveal key={w.title} delay={i * 80}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onMouseEnter={() => setActiveWork(i)}
                      onFocus={() => setActiveWork(i)}
                      onClick={() => setActiveWork(i)}
                      className={`relative flex w-full items-baseline justify-between gap-6 border-b py-6 text-left transition-colors duration-500 ${
                        active ? "border-[#c9a24b]" : "border-black/15"
                      }`}
                    >
                      <span
                        className={`${display} text-3xl font-medium transition duration-500 sm:text-4xl ${
                          active ? "translate-x-3 text-[#0a0a0a]" : "text-[#0a0a0a]/35"
                        }`}
                      >
                        {w.title}
                      </span>
                      <span className="shrink-0 text-right text-sm leading-snug">
                        <span className={`block font-semibold transition-colors duration-500 ${active ? "text-[#8a6a2a]" : "text-[#6b665c]/60"}`}>
                          {w.client}
                        </span>
                        <span className={`block transition-colors duration-500 ${active ? "text-[#6b665c]" : "text-[#6b665c]/50"}`}>
                          {w.service}
                        </span>
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={300} className="mt-10">
              <button onClick={() => goBook(works[activeWork].service)} className={btn}>
                Book {works[activeWork].service}
              </button>
            </Reveal>
          </div>

          {/* Featured image */}
          <Reveal className="order-first w-full lg:order-last">
            <div className="relative ml-auto aspect-[4/5] w-full max-w-xl overflow-hidden rounded-md bg-[#0a0a0a] ring-1 ring-[#c9a24b]/40">
              {works.map((w, i) => (
                <div
                  key={w.title}
                  className={`absolute inset-0 bg-gradient-to-br ${w.tone} transition-opacity duration-700 ${
                    i === activeWork ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={i !== activeWork}
                >
                  <img
                    src={w.img}
                    alt={`${w.title} for ${w.client}`}
                    loading="lazy"
                    className={`h-full w-full object-cover transition duration-[1400ms] ease-out ${
                      i === activeWork ? "scale-100" : "scale-110"
                    }`}
                  />
                </div>
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white">
                <div>
                  <p className={`${display} text-2xl font-medium`}>{works[activeWork].title}</p>
                  <p className="text-sm text-white/80">{works[activeWork].client}</p>
                </div>
                <span className="rounded-full border border-[#c9a24b]/70 bg-black/40 px-4 py-1.5 text-sm text-[#e3c783] backdrop-blur-sm">
                  {works[activeWork].service}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Book + Contact */}
      <section id="book" className={`${pad} bg-[#efe9db] py-24 lg:py-32`}>
        <div id="contact" className="grid w-full gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <Reveal>
            <h2 className={`${display} mb-6 text-4xl font-medium tracking-tight text-[#0a0a0a] sm:text-5xl lg:text-6xl`}>
              Book an appointment
            </h2>
            <p className="mb-10 max-w-md text-[#6b665c]">
              Tell us what you need and we will confirm your slot by message.
            </p>
            <div className="space-y-5 text-[#6b665c]">
              <p><strong className="block text-[#0a0a0a]">Visit us</strong>123 Rizal Street, Mabalacat City, Pampanga</p>
              <p><strong className="block text-[#0a0a0a]">Call or text</strong>0917 000 0000</p>
              <p><strong className="block text-[#0a0a0a]">Email</strong>hello@BLMsalon.example</p>
              <p>
                <strong className="block text-[#0a0a0a]">Hours</strong>
                Mon–Sat 9:00 AM – 7:00 PM<br />Sunday 10:00 AM – 5:00 PM
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {sent ? (
              <div role="status" className="rounded-3xl bg-[#0a0a0a] p-10 text-xl text-[#e3c783]">
                Thank you! We received your request and will contact you shortly to confirm.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,.25)] sm:p-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-semibold text-[#0a0a0a]">
                    Full name
                    <input name="name" required placeholder="Your name" className={field} />
                  </label>
                  <label className="grid gap-1.5 text-sm font-semibold text-[#0a0a0a]">
                    Phone number
                    <input name="phone" type="tel" required placeholder="09XX XXX XXXX" className={field} />
                  </label>
                </div>
                <fieldset className="grid gap-1.5">
                  <legend className="mb-1.5 text-sm font-semibold text-[#0a0a0a]">Choose a branch</legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {branches.map((b) => (
                      <label key={b} className="cursor-pointer">
                        <input type="radio" name="branch" value={b} required className="peer sr-only" />
                        <span className="flex items-center justify-center rounded-xl border border-[#d9cfb4] bg-white px-3 py-3 text-[15px] font-semibold text-[#0a0a0a] transition duration-300 hover:border-[#c9a24b] peer-checked:border-[#c9a24b] peer-checked:bg-[#0a0a0a] peer-checked:text-[#e3c783] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#c9a24b]">
                          {b}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="grid gap-1.5 text-sm font-semibold text-[#0a0a0a]">
                  Service
                  <select name="service" required value={selected} onChange={(e) => setSelected(e.target.value)} className={field}>
                    <option value="" disabled>Choose a service</option>
                    {services.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-semibold text-[#0a0a0a]">
                    Date
                    <input name="date" type="date" required className={field} />
                  </label>
                  <label className="grid gap-1.5 text-sm font-semibold text-[#0a0a0a]">
                    Time
                    <input name="time" type="time" required className={field} />
                  </label>
                </div>
                <label className="grid gap-1.5 text-sm font-semibold text-[#0a0a0a]">
                  Message (optional)
                  <textarea name="message" rows={3} placeholder="Anything we should know?" className={field} />
                </label>
                <button type="submit" className={`${btn} mt-2 py-3.5`}>Request appointment</button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* Footer with social media */}
      <footer className="relative w-full overflow-hidden bg-[#0a0a0a] text-[#cfc8b8]">
        <div className={`${pad} flex flex-wrap items-center justify-between gap-6 pt-14`}>
          <span className={`${display} text-2xl font-semibold text-white`}>BLM Salon</span>
          <div className="flex gap-6 text-[15px]">
            <a className="transition hover:text-[#e3c783] hover:underline" href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a className="transition hover:text-[#e3c783] hover:underline" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a className="transition hover:text-[#e3c783] hover:underline" href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </div>
        <div aria-hidden="true" className={`${display} pointer-events-none select-none whitespace-nowrap pt-6 text-center text-[26vw] font-medium leading-[0.8] text-[#c9a24b]/10`}>
          BLM
        </div>
        <small className={`${pad} relative block pb-6 text-[13px]`}>
          © {new Date().getFullYear()} BLM Salon. All rights reserved.
        </small>
      </footer>
    </div>
  );
};

export default SalonLandingPage;