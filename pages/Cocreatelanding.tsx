import { useEffect, useRef, useState } from "react";

/* ---------- Placeholder data: replace with the client's real content ---------- */
type Product = { id: string; name: string; image?: string };

const products: Product[] = [
  { id: "1", name: "Product 1" },
  { id: "2", name: "Product 2" },
  { id: "3", name: "Product 3" },
  { id: "4", name: "Product 4" },
  { id: "5", name: "Product 5" },
];

const panels = [
  { title: "Panel title 1", body: "Replace with client copy." },
  { title: "Panel title 2", body: "Replace with client copy." },
  { title: "Panel title 3", body: "Replace with client copy." },
];

const INTERVAL_MS = 2000;
const LINE_COUNT = 6;

/* ---------- Scroll hooks (write CSS variables, no re-renders) ---------- */
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --p: 0 -> 1 as the page scrolls past the element from the top (hero)
function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty(
        "--p",
        clamp(window.scrollY / el.offsetHeight, 0, 1).toFixed(3)
      );
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

// --t: -1 -> 1 and --a: 0 -> 1 by distance from the viewport center (panels)
function useScrollTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = clamp((rect.top + rect.height / 2 - vh / 2) / (vh / 2), -1, 1);
      el.style.setProperty("--t", t.toFixed(3));
      el.style.setProperty("--a", Math.abs(t).toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

/* ---------- Sections ---------- */
function Hero() {
  const ref = useScrollProgress<HTMLElement>();
  return (
    <header className="hero" ref={ref} id="top">
      <div className="hero__stage">
        <div className="mark" aria-hidden="true">
          <div className="mark__sun" />
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <div
              key={i}
              className="mark__line"
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
        </div>
        <h1 className="hero__name">co·create</h1>
        <p className="hero__tag">a productivity space</p>
      </div>
    </header>
  );
}

// Shortest signed distance from the active card so the ring wraps around
function offsetOf(index: number, active: number, total: number) {
  let d = index - active;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = products.length;

  // Advance every 2 seconds; re-arms whenever the active card changes
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(
      () => setActive((a) => (a + 1) % total),
      INTERVAL_MS
    );
    return () => window.clearTimeout(id);
  }, [active, paused, total]);

  return (
    <section
      className="showcase"
      id="products"
      aria-roledescription="carousel"
      aria-label="Products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="showcase__stage">
        {products.map((p, i) => {
          const o = offsetOf(i, active, total);
          return (
            <figure
              key={p.id}
              className="card"
              data-far={Math.abs(o) > 2}
              aria-hidden={o !== 0}
              style={{ "--o": o, "--a": Math.abs(o) } as React.CSSProperties}
            >
              <div
                className="card__image"
                style={p.image ? { backgroundImage: `url(${p.image})` } : undefined}
              />
              <figcaption className="card__name">{p.name}</figcaption>
            </figure>
          );
        })}
      </div>

      <div className="showcase__controls">
        <div className="dots">
          {products.map((p, i) => (
            <button
              key={p.id}
              className="dot"
              aria-label={`Show ${p.name}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
        <div className="progress" aria-hidden="true">
          <span
            key={`${active}-${paused}`}
            className="progress__fill"
            data-paused={paused}
          />
        </div>
      </div>
    </section>
  );
}

function Panel3D({ title, body }: { title: string; body: string }) {
  const ref = useScrollTilt<HTMLElement>();
  return (
    <article className="panel" ref={ref}>
      <h2 className="panel__title">{title}</h2>
      <p className="panel__body">{body}</p>
    </article>
  );
}

/* ---------- Page ---------- */
export default function CoCreateLanding() {
  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <a href="#top" className="nav__brand">co·create</a>
        <div className="nav__links">
          <a href="#products">Products</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <Hero />
      <ProductShowcase />

      <section className="panels" id="about">
        {panels.map((p) => (
          <Panel3D key={p.title} title={p.title} body={p.body} />
        ))}
      </section>

      <footer className="footer">
        <p className="footer__name">co·create</p>
        <p className="footer__tag">a productivity space</p>
      </footer>
    </>
  );
}

/* ---------- Styles ---------- */
const css = `
@import url("https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500&display=swap");

:root {
  /* Sampled from the logo: burnt orange + white */
  --orange: #bf5205;
  --deep: #8a3a03;
  --white: #ffffff;
  --blush: #fbeee4;

  --font: "Jost", "Century Gothic", system-ui, sans-serif;
  --line: 5px;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font);
  font-weight: 300;
  background: var(--orange);
  color: var(--white);
  overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }
:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }

/* ---------- Nav ---------- */
.nav {
  position: fixed; inset: 0 0 auto 0; z-index: 10;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem clamp(1.25rem, 4vw, 3rem);
  mix-blend-mode: difference; /* stays legible over orange and white sections */
  color: #fff;
}
.nav__brand { font-size: 1.25rem; letter-spacing: 0.12em; }
.nav__links { display: flex; gap: 2rem; font-size: 0.95rem; letter-spacing: 0.06em; }
.nav a:hover { opacity: 0.7; }

/* ---------- Hero ---------- */
.hero {
  --p: 0;
  min-height: 100svh;
  display: grid; place-items: center;
  perspective: 1100px;
  padding: 6rem 1.5rem 4rem;
}
.hero__stage {
  display: flex; flex-direction: column; align-items: center;
  transform-style: preserve-3d;
  transform: translateZ(calc(var(--p) * -80px));
}
.mark {
  --w: min(520px, 78vw);
  width: var(--w);
  transform-style: preserve-3d;
  transform: rotateX(calc(var(--p) * 38deg)) rotateY(calc(var(--p) * -14deg));
}
.mark__sun {
  width: calc(var(--w) * 0.8);
  aspect-ratio: 2 / 1;
  margin: 0 auto -2px;
  border: var(--line) solid var(--white);
  border-bottom: 0;
  border-radius: 999px 999px 0 0;
  transform: translateZ(calc(var(--p) * -160px));
}
.mark__line {
  height: var(--line);
  margin-top: clamp(14px, 2.6vw, 24px);
  background: var(--white);
  /* each line drifts toward the viewer by a different amount */
  transform: translateZ(calc(var(--p) * var(--i) * 46px));
}
.mark__line:first-of-type { margin-top: 0; }

.hero__name {
  margin: clamp(2rem, 5vw, 3.5rem) 0 0;
  font-size: clamp(3rem, 11vw, 7.5rem);
  font-weight: 200;
  letter-spacing: 0.1em;
  line-height: 1;
}
.hero__tag {
  margin: 0.75rem 0 0;
  font-size: clamp(1rem, 2.2vw, 1.4rem);
  letter-spacing: 0.22em;
}

/* ---------- Product showcase ---------- */
.showcase {
  background: var(--white);
  color: var(--orange);
  padding: clamp(4rem, 10vw, 8rem) 0;
  overflow: hidden;
}
.showcase__stage {
  position: relative;
  height: clamp(380px, 58vw, 520px);
  perspective: 1400px;
  transform-style: preserve-3d;
}
.card {
  --o: 0; --a: 0;
  position: absolute; top: 0; left: 50%;
  width: min(300px, 62vw); height: 100%;
  margin: 0 0 0 calc(min(300px, 62vw) / -2);
  display: flex; flex-direction: column; gap: 1rem;
  transform:
    translateX(calc(var(--o) * 64%))
    translateZ(calc(var(--a) * -240px))
    rotateY(calc(var(--o) * -34deg));
  opacity: calc(1 - var(--a) * 0.35);
  transition: transform 0.7s cubic-bezier(.2,.7,.2,1), opacity 0.7s;
}
.card[data-far="true"] { visibility: hidden; }
.card__image {
  flex: 1;
  background: var(--orange) center / cover no-repeat;
  border-radius: 999px 999px 0 0; /* echoes the sun in the logo */
}
.card__name {
  font-size: 1.35rem; letter-spacing: 0.08em; text-align: center;
}
.showcase__controls {
  display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
  margin-top: 2rem;
}
.dots { display: flex; gap: 0.9rem; }
.dot {
  width: 14px; height: 14px; padding: 0;
  border: 2px solid var(--orange); border-radius: 50%;
  background: transparent; cursor: pointer;
}
.dot[aria-current="true"] { background: var(--orange); }
.progress { width: min(220px, 50vw); height: var(--line); background: var(--blush); }
.progress__fill {
  display: block; height: 100%; background: var(--orange);
  transform-origin: left; transform: scaleX(0);
  animation: fill 2s linear forwards;
}
.progress__fill[data-paused="true"] { animation: none; }
@keyframes fill { to { transform: scaleX(1); } }

/* ---------- 3D scroll panels ---------- */
.panels {
  background: var(--orange);
  padding: clamp(5rem, 14vw, 10rem) clamp(1.25rem, 6vw, 5rem);
  perspective: 1200px;
  display: flex; flex-direction: column; gap: clamp(3rem, 8vw, 6rem);
}
.panel {
  --t: 0; --a: 0;
  display: grid; grid-template-columns: 1fr 1.4fr; gap: 2rem;
  padding: clamp(2rem, 5vw, 3.5rem) 0;
  border-top: var(--line) solid var(--white);
  border-bottom: var(--line) solid var(--white);
  transform-origin: center bottom;
  transform:
    rotateX(calc(var(--t) * 32deg))
    translateZ(calc(var(--a) * -260px));
  opacity: calc(1 - var(--a) * 0.65);
  will-change: transform, opacity;
}
.panel__title { margin: 0; font-size: clamp(1.6rem, 4vw, 2.8rem); font-weight: 300; letter-spacing: 0.06em; }
.panel__body { margin: 0; font-size: clamp(1rem, 2vw, 1.25rem); line-height: 1.7; max-width: 60ch; }

/* ---------- Footer ---------- */
.footer { background: var(--deep); text-align: center; padding: 5rem 1.5rem; }
.footer__name { margin: 0; font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 200; letter-spacing: 0.1em; }
.footer__tag { margin: 0.5rem 0 0; letter-spacing: 0.22em; }

/* ---------- Small screens / reduced motion ---------- */
@media (max-width: 700px) {
  .panel { grid-template-columns: 1fr; gap: 1rem; }
  .nav__links { gap: 1.1rem; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .card { transition: none; }
  .progress__fill { animation: none; transform: scaleX(1); }
  .mark, .mark__sun, .mark__line, .hero__stage, .panel { transform: none; opacity: 1; }
}
`;