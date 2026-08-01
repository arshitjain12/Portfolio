import { useState, useEffect, useRef } from "react";
import ADMIN_IMAGE from "../public/admin-bg.png";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { MdEmail, MdCall } from "react-icons/md";
import { FaHeart } from "react-icons/fa";


function useTypingEffect(words, speed = 100, pause = 1500) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx % words.length];
    let t;
    if (!deleting && charIdx < word.length)       t = setTimeout(() => setCharIdx(c => c + 1), speed);
    else if (!deleting && charIdx === word.length) t = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0)              t = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    else { setDeleting(false); setWordIdx(w => (w + 1) % words.length); }
    setDisplayed(word.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return displayed;
}


function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}


function SplitText({ text, inView, delay = 0, className = "" }) {
  return (
    <span className={className}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{
          display: "inline-block",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(30px)",
          transition: `opacity 0.5s ease ${delay + i * 35}ms, transform 0.5s ease ${delay + i * 35}ms`,
          whiteSpace: ch === " " ? "pre" : "normal",
        }}>{ch}</span>
      ))}
    </span>
  );
}


function AnimatedParagraph({ text, inView, delay = 0, className = "" }) {
  return (
    <p className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{
          display: "inline-block", marginRight: "0.25em",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(15px)",
          transition: `opacity 0.4s ease ${delay + i * 40}ms, transform 0.4s ease ${delay + i * 40}ms`,
        }}>{word}</span>
      ))}
    </p>
  );
}


function CountUp({ end, suffix = "", inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(t); }
      else setCount(start);
    }, 40);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span>{count}{suffix}</span>;
}


function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 18;
    const y = -((e.clientY - top) / height - 0.5) * 18;
    card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px) scale(1.02)`;
    card.style.boxShadow = `${-x}px ${-y}px 40px rgba(249,115,22,0.2)`;
  };
  const onLeave = () => {
    const card = ref.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
    card.style.boxShadow = "none";
  };
  return (
    <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: "transform 0.1s ease, box-shadow 0.1s ease" }}>
      {children}
    </div>
  );
}


function Particles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, dur: Math.random() * 8 + 6,
    delay: Math.random() * 5, opacity: Math.random() * 0.4 + 0.1,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-orange-500"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            opacity: p.opacity, animation: `floatUp ${p.dur}s ${p.delay}s infinite ease-in-out` }} />
      ))}
    </div>
  );
}


function FloatingShapes({ count = 10, color = "rgba(249,115,22,0.12)", section = "default" }) {
  const seed = section.charCodeAt(0);
  const shapes = Array.from({ length: count }, (_, i) => {
    const r = ((seed * 9301 + i * 49297) % 233280) / 233280;
    const r2 = ((seed * 49297 + i * 9301) % 233280) / 233280;
    const r3 = ((seed * 1234 + i * 5678) % 233280) / 233280;
    const r4 = ((seed * 8765 + i * 4321) % 233280) / 233280;
    const r5 = ((seed * 3141 + i * 2718) % 233280) / 233280;
    return {
      id: i,
      type: ["triangle", "diamond", "hexagon", "square", "cross", "ring", "dot-ring"][Math.floor(r * 7)],
      x: r2 * 100,
      y: r3 * 100,
      size: r4 * 28 + 12,
      dur: r5 * 14 + 10,
      delay: r * 8,
      rotate: r2 * 360,
      rotateDur: r3 * 20 + 15,
      opacity: r4 * 0.18 + 0.05,
    };
  });

  const renderShape = (s) => {
    const sz = s.size;
    switch (s.type) {
      case "triangle":
        return <polygon points={`${sz / 2},0 ${sz},${sz * 0.866} 0,${sz * 0.866}`}
          fill="none" stroke={color} strokeWidth="1.5" />;
      case "diamond":
        return <polygon points={`${sz / 2},0 ${sz},${sz / 2} ${sz / 2},${sz} 0,${sz / 2}`}
          fill="none" stroke={color} strokeWidth="1.5" />;
      case "hexagon": {
        const cx = sz / 2, cy = sz / 2, r = sz / 2 - 1;
        const pts = Array.from({ length: 6 }, (_, k) => {
          const a = (Math.PI / 3) * k - Math.PI / 6;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} fill="none" stroke={color} strokeWidth="1.5" />;
      }
      case "square":
        return <rect x="2" y="2" width={sz - 4} height={sz - 4}
          fill="none" stroke={color} strokeWidth="1.5" />;
      case "cross": {
        const t = sz / 3;
        return <path d={`M${t},0 L${t * 2},0 L${t * 2},${t} L${sz},${t} L${sz},${t * 2} L${t * 2},${t * 2} L${t * 2},${sz} L${t},${sz} L${t},${t * 2} L0,${t * 2} L0,${t} L${t},${t} Z`}
          fill="none" stroke={color} strokeWidth="1" />;
      }
      case "ring":
        return (
          <>
            <circle cx={sz / 2} cy={sz / 2} r={sz / 2 - 2} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx={sz / 2} cy={sz / 2} r={sz / 4} fill="none" stroke={color} strokeWidth="1" />
          </>
        );
      case "dot-ring":
        return (
          <>
            <circle cx={sz / 2} cy={sz / 2} r={sz / 2 - 2} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 6" />
            <circle cx={sz / 2} cy={sz / 2} r="3" fill={color} />
          </>
        );
      default:
        return <circle cx={sz / 2} cy={sz / 2} r={sz / 2 - 2} fill="none" stroke={color} strokeWidth="1.5" />;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {shapes.map((s) => (
        <div key={s.id} style={{
          position: "absolute",
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          opacity: s.opacity,
          animation: `floatShape ${s.dur}s ${s.delay}s infinite ease-in-out`,
        }}>
          <svg
            width={s.size} height={s.size}
            style={{ animation: `spinSlow ${s.rotateDur}s ${s.delay}s linear infinite`, transform: `rotate(${s.rotate}deg)` }}
          >
            {renderShape(s)}
          </svg>
        </div>
      ))}
    </div>
  );
}


function OrbitalRings({ size = 120, color = "rgba(249,115,22,0.2)", style = {} }) {
  return (
    <div style={{ position: "absolute", width: size, height: size, pointerEvents: "none", ...style }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <ellipse cx={size / 2} cy={size / 2} rx={size / 2 - 4} ry={size / 4}
          fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 4"
          style={{ animation: "spinSlow 8s linear infinite", transformOrigin: "50% 50%", transformBox: "fill-box" }} />
        <ellipse cx={size / 2} cy={size / 2} rx={size / 3} ry={size / 2 - 4}
          fill="none" stroke={color} strokeWidth="1.5"
          style={{ animation: "spinSlow 12s linear reverse infinite", transformOrigin: "50% 50%", transformBox: "fill-box" }} />
        <circle cx={size / 2} cy={size / 2} r={size / 6}
          fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3"
          style={{ animation: "spinSlow 6s linear infinite", transformOrigin: "50% 50%", transformBox: "fill-box" }} />

        <circle r="3" fill={color} style={{ animation: `orbitDot ${8}s linear infinite`, transformOrigin: "50% 50%", transformBox: "fill-box" }}>
          <animateMotion dur="8s" repeatCount="indefinite">
            <mpath href="#outerPath" />
          </animateMotion>
        </circle>
        <ellipse id="outerPath" cx={size / 2} cy={size / 2} rx={size / 2 - 4} ry={size / 4} fill="none" />
      </svg>
    </div>
  );
}


function Constellation({ width = 300, height = 200, dotCount = 8, color = "rgba(249,115,22,0.25)" }) {
  const dots = useRef(Array.from({ length: dotCount }, (_, i) => ({
    id: i, x: (i * 37 + 40) % (width - 40) + 20, y: (i * 59 + 30) % (height - 40) + 20,
    vx: (i % 3 - 1) * 0.3, vy: ((i + 1) % 3 - 1) * 0.3,
  }))).current;

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 10 || d.x > width - 10) d.vx *= -1;
        if (d.y < 10 || d.y > height - 10) d.vy *= -1;
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = 1 - dist / 100;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={canvasRef} width={width} height={height}
      style={{ position: "absolute", pointerEvents: "none", opacity: 0.8 }} />
  );
}


function MorphBlob({ size = 200, color = "rgba(249,115,22,0.06)", style = {} }) {
  return (
    <div style={{ position: "absolute", width: size, height: size, pointerEvents: "none", ...style }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        <path fill={color} style={{ animation: "morphBlob 8s ease-in-out infinite" }}>
          <animate attributeName="d" dur="8s" repeatCount="indefinite"
            values="
              M50,100 C50,50 100,20 150,50 C180,70 180,130 150,150 C100,180 50,150 50,100Z;
              M40,90 C30,40 90,10 155,45 C185,65 190,135 155,160 C90,190 40,140 40,90Z;
              M55,105 C55,45 110,15 158,52 C186,72 183,138 150,155 C95,185 55,165 55,105Z;
              M50,100 C50,50 100,20 150,50 C180,70 180,130 150,150 C100,180 50,150 50,100Z
            " />
        </path>
      </svg>
    </div>
  );
}


function SpinningSquareRing({ size = 80, color = "rgba(249,115,22,0.15)", dur = "10s", style = {} }) {
  return (
    <div style={{ position: "absolute", width: size, height: size, pointerEvents: "none", ...style }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ animation: `spinSlow ${dur} linear infinite` }}>
        <rect x="4" y="4" width={size - 8} height={size - 8}
          fill="none" stroke={color} strokeWidth="2" strokeDasharray="8 4"
          rx="4" />
        <rect x={size / 4} y={size / 4} width={size / 2} height={size / 2}
          fill="none" stroke={color} strokeWidth="1.5"
          style={{ animation: `spinSlow ${dur} linear reverse infinite`, transformOrigin: "50% 50%", transformBox: "fill-box" }}
          rx="2" />
      </svg>
    </div>
  );
}


function CornerBrackets({ size = 60, color = "rgba(249,115,22,0.2)", style = {} }) {
  const s = size;
  const len = s * 0.35;
  return (
    <div style={{ position: "absolute", width: s, height: s, pointerEvents: "none", ...style }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ animation: "pulseBracket 3s ease-in-out infinite" }}>
        {/* TL */}
        <path d={`M4,${len + 4} L4,4 L${len + 4},4`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* TR */}
        <path d={`M${s - len - 4},4 L${s - 4},4 L${s - 4},${len + 4}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* BR */}
        <path d={`M${s - 4},${s - len - 4} L${s - 4},${s - 4} L${s - len - 4},${s - 4}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* BL */}
        <path d={`M${len + 4},${s - 4} L4,${s - 4} L4,${s - len - 4}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}


function DNAHelix({ height = 200, color = "rgba(249,115,22,0.18)", style = {} }) {
  const width = 40;
  const steps = 10;
  return (
    <div style={{ position: "absolute", width, height, pointerEvents: "none", overflow: "hidden", ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {Array.from({ length: steps }, (_, i) => {
          const y = (i / steps) * height;
          const phase = (i / steps) * Math.PI * 4;
          const x1 = width / 2 + Math.sin(phase) * 14;
          const x2 = width / 2 + Math.sin(phase + Math.PI) * 14;
          return (
            <g key={i} style={{ animation: `dnaPulse 2s ${i * 0.15}s ease-in-out infinite` }}>
              <line x1={x1} y1={y} x2={x2} y2={y + (height / steps) * 0.5}
                stroke={color} strokeWidth="1" strokeLinecap="round" />
              <circle cx={x1} cy={y} r="2" fill={color} />
              <circle cx={x2} cy={y} r="2" fill={color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const skills = ["HTML5", "CSS3", "JavaScript", "React.js", "Node.js", "Express", "MongoDB", "Tailwind", "Bootstrap", "Git", "GitHub", "REST API", "MERN Stack", "SQL"];


const FOODZILA_VIDEO = "https://res.cloudinary.com/dbz0lez8l/video/upload/v1780986043/Screen_Recording_2026-06-08_164444_bfhtcj.mp4";
const VASTRIKA_VIDEO = "https://res.cloudinary.com/dbz0lez8l/video/upload/v1780990152/Screen_Recording_2026-06-09_123120_y7clgu.mp4";

const projects = [
  { 
    title: "Foodzila", subtitle: "Food Ordering App",
    desc: "A production-grade food ordering platform built on the MERN stack featuring JWT-based auth, real-time cart management, order tracking, cancellation flows, and user reviews. Includes a fully functional admin panel to manage foods, users & orders with optimized MongoDB schemas and use Mongo Atlas and Cloudinary for image ",
    tech: ["React", "Node.js", "Tailwind CSS","Stripe","MongoDB", "JWT", "Express"],
    color: "from-orange-600 to-red-600",  
    link: "#",
    
    
    videoUrl: FOODZILA_VIDEO, 
    railwayDown: true 
  },

{ 
    title: "Vastrika", subtitle: "E-Commerce Website",
    desc: "A production-level MERN e-commerce platform built for real shopping size selection, advanced filtering,Cloudinary for image and Mongo Atlus for DB  category search, and dual checkout via Stripe & Cash on Delivery. Track your order with live delivery status updates. Secure JWT auth, clean UI with Tailwind CSS, and a fully managed product & order system. Ships like a real store. Works like one too.",
    tech: ["React", "Tailwind CSS", "Stripe", "JWT", "MongoDB"],
    color: "from-violet-600 to-indigo-600",
    link: "https://arshit-vastrika-navy.vercel.app/",
    videoUrl: VASTRIKA_VIDEO, 
    railwayDown: true 
  },

  { 
    title: "Wanderlust", subtitle: "Travel Booking App",
    desc: "A production-level full-stack travel stay booking platform — search, list, and review stays with complete Passport.js authentication & role-based authorization. Built on Node.js & Express backend with MongoDB for robust data management and Bootstrap for a clean, responsive UI. Real auth, real listings, real reviews.",
    tech: ["Node.js", "MongoDB", "Bootstrap", "EJS"],
    color: "from-teal-600 to-green-600", 
    link: "https://arshitwanderlust.up.railway.app/listings",
    railwayDown: true 
  },
];
const experiences = [
  {
    title: "Frontend Developer Intern",
    company: "ZecData, Indore",
    duration: "Jan 2026 – Mar 2026",
    desc: "Contributed to 2+ live production projects, developing React.js features that directly impacted end users. Engineered reusable UI components, reducing code duplication and improving overall code maintainability. Integrated RESTful APIs and resolved real-time production bugs, enhancing application performance.",
    tech: ["React.js", "REST API", "Git", "MongoDB"],
    color: "from-orange-600 to-red-600",
  },
  {
    title: "Freelance MERN Stack Developer",
    company: "Indore (Contract-Based)",
    duration: "Apr 2026 – July 2026",
    desc: "Built and modified reusable UI components, improving code maintainability and development speed. Integrated RESTful APIs and implemented frontend-backend communication for dynamic data handling. Resolved application bugs and performance issues, improving stability and user experience. Assisted in maintaining Node.js and Express.js backend modules and API endpoints.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "REST API","GitHub"],
    color: "from-violet-600 to-indigo-600",
  },
];
export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const title = useTypingEffect(["MERN Stack Developer", "NODE Developer", "React Developer"]);

  const [heroRef, heroIn] = useInView(0.1);
  const [aboutRef, aboutIn] = useInView(0.12);
  const [skillsRef, skillsIn] = useInView(0.1);
  const [projectsRef, projectsIn] = useInView(0.1);
  const [contactRef, contactIn] = useInView(0.1);
  const [statsRef, statsIn] = useInView(0.3);
  const [experienceRef, experienceIn] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e) => { setCursorPos({ x: e.clientX, y: e.clientY }); setCursorVisible(true); };
    const onLeave = () => setCursorVisible(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
    setActiveSection(id);
  };

  const navItems = ["home", "about", "experience", "projects", "contact"];

  return (
    <div className="bg-gray-950 text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "'Segoe UI', sans-serif" }}>

 
      <div style={{ position: "fixed", pointerEvents: "none", zIndex: 9999,
        left: cursorPos.x - 16, top: cursorPos.y - 16, width: 32, height: 32, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)",
        opacity: cursorVisible ? 1 : 0, transition: "opacity 0.3s ease", mixBlendMode: "screen" }} />
      <div style={{ position: "fixed", pointerEvents: "none", zIndex: 9999,
        left: cursorPos.x - 4, top: cursorPos.y - 4, width: 8, height: 8, borderRadius: "50%",
        background: "#f97316", opacity: cursorVisible ? 0.8 : 0,
        transition: "left 0.05s linear, top 0.05s linear, opacity 0.3s ease" }} />

     
      <div style={{ position: "fixed", top: 0, left: 0, height: 3, zIndex: 60,
        background: "linear-gradient(90deg, #f97316, #ef4444)", width: `${scrollProgress}%`,
        transition: "width 0.1s linear", boxShadow: "0 0 8px rgba(249,115,22,0.6)" }} />

   
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-gray-950/95 backdrop-blur-md shadow-lg shadow-orange-500/10" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-orange-500 tracking-wider cursor-pointer"
            onClick={() => scrollTo("home")} style={{ animation: "fadeInLeft 0.8s ease both" }}>
            MERN-STACK<span className="text-white"> DEVELOPER</span>
          </span>
          <ul className="hidden md:flex gap-8">
            {navItems.map((s, i) => (
              <li key={s} style={{ animation: `fadeInDown 0.6s ease ${i * 100}ms both` }}>
                <button onClick={() => scrollTo(s)}
                  className={`capitalize text-sm font-medium tracking-wider transition-all duration-200 hover:text-orange-400 relative group ${activeSection === s ? "text-orange-500" : "text-gray-300"}`}>
                  {s}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${activeSection === s ? "w-full" : "w-0 group-hover:w-full"}`} />
                </button>
              </li>
            ))}
          </ul>
          <button className="md:hidden text-gray-300 hover:text-orange-400" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`w-6 h-0.5 bg-current mb-1 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <div className={`w-6 h-0.5 bg-current mb-1 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-gray-950/95 backdrop-blur-md px-6 pb-4">
            {navItems.map((s) => (
              <button key={s} onClick={() => scrollTo(s)}
                className="block w-full text-left capitalize py-3 text-gray-300 hover:text-orange-400 border-b border-gray-800/50 transition-colors">{s}</button>
            ))}
          </div>
        )}
      </nav>

 
      <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
       
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-orange-600/8 blur-3xl -top-32 -left-32" style={{ animation: "pulse 6s ease-in-out infinite" }} />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-red-600/8 blur-3xl bottom-0 right-0" style={{ animation: "pulse 6s ease-in-out 2s infinite" }} />
          <div className="absolute w-64 h-64 rounded-full bg-yellow-500/5 blur-2xl top-1/2 left-1/2" style={{ animation: "pulse 8s ease-in-out 1s infinite" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
          <Particles />

        
          <FloatingShapes count={14} color="rgba(249,115,22,0.14)" section="hero" />

          <CornerBrackets size={90} color="rgba(249,115,22,0.18)"
            style={{ top: "15%", right: "8%", animation: "pulseBracket 4s ease-in-out infinite" }} />
          <CornerBrackets size={55} color="rgba(249,115,22,0.12)"
            style={{ top: "60%", left: "4%", animation: "pulseBracket 5s ease-in-out 1s infinite" }} />

        
          <SpinningSquareRing size={70} color="rgba(249,115,22,0.13)" dur="14s"
            style={{ top: "20%", left: "12%", animation: "floatShape 9s 0s ease-in-out infinite" }} />
          <SpinningSquareRing size={45} color="rgba(249,115,22,0.1)" dur="9s"
            style={{ bottom: "25%", right: "15%", animation: "floatShape 11s 2s ease-in-out infinite" }} />


          <OrbitalRings size={140} color="rgba(249,115,22,0.12)"
            style={{ top: "5%", left: "2%", opacity: 0.7 }} />

      
          <MorphBlob size={260} color="rgba(249,115,22,0.05)"
            style={{ bottom: "-40px", left: "-40px" }} />

 
          <div style={{ position: "absolute", top: "10%", right: "5%", opacity: 0.6 }}>
            <Constellation width={220} height={160} dotCount={7} color="rgba(249,115,22,0.3)" />
          </div>
        </div>

        <div ref={heroRef}
          className="max-w-6xl mx-auto px-6 pt-24 w-full grid md:grid-cols-2 gap-12 items-center"
          style={{ position: "relative", zIndex: 1 }}>
          {/* Text */}
          <div>
            <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "translateX(0)" : "translateX(-40px)", transition: "all 0.7s ease 0.1s" }}>
              HELLO I AM
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-3 leading-tight"
              style={{ opacity: heroIn ? 1 : 0, transition: "opacity 0.6s ease 0.2s" }}>
              <SplitText text="Arshit" inView={heroIn} delay={200} />
              <br />
              <SplitText text="Jain" inView={heroIn} delay={500} className="text-orange-500" />
            </h1>
            <div className="flex items-center gap-2 mb-6 h-10"
              style={{ opacity: heroIn ? 1 : 0, transition: "opacity 0.6s ease 0.9s" }}>
              <span className="text-xl md:text-2xl font-light text-gray-300">{title}</span>
              <span className="inline-block w-0.5 h-7 bg-orange-500" style={{ animation: "blink 1s step-end infinite" }} />
            </div>
            <AnimatedParagraph
              text="I don't just write code I craft digital experiences. 
From database to deployment, I build full-stack products 
that are fast, scalable, and built to last."
              inView={heroIn} delay={1000}
              className="text-gray-400 leading-relaxed mb-8 max-w-md" />
            <div className="flex flex-wrap gap-4"
              style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 1.3s" }}>
              <button onClick={() => scrollTo("projects")}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 relative overflow-hidden group">
                <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                View Projects
              </button>
              <a href="/Arshit_Jain_Resume.pdf" download="Arshit_Jain_Resume.pdf"
                className="px-8 py-3 bg-white/10 hover:bg-orange-500 text-white font-semibold rounded-full border border-orange-500/50 hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 group">
                <span className="group-hover:-translate-y-1 transition-transform duration-300">📄</span> 
                Get Resume
              </a>
              <button onClick={() => scrollTo("contact")}
                className="px-8 py-3 border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-semibold rounded-full transition-all duration-200 hover:scale-105">
                Contact Me
              </button>
            </div>
            <div className="flex gap-5 mt-8"
              style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 1.6s" }}>
              {[
                 { href: "https://github.com/arshitjain12", icon: <FaGithub />, label: "GitHub" },
  { href: "mailto:arshitjain7@gmail.com", icon: <MdEmail />, label: "Email" },
  { href: "tel:+918871807465", icon: <MdCall />, label: "Call" },
  { href: "https://www.linkedin.com/in/arshit-jain-28431834b/", icon: <FaLinkedin />, label: "LinkedIn" },
  { href: "https://www.instagram.com/arshitjain_", icon: <FaInstagram />, label: "Instagram" },
              ].map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                  className="text-gray-400 hover:text-orange-400 transition-all duration-200 text-sm font-medium flex items-center gap-2 hover:gap-3 group">
                  <span>{l.icon}</span> {l.label}
                  <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-orange-400">→</span>
                </a>
              ))}
            </div>
          </div>

     
          <div className="flex justify-center md:justify-end mt-16 md:mt-0"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? "scale(1)" : "scale(0.8)", transition: "all 0.8s ease 0.4s" }}>
            <div className="relative">
              <div className="absolute -left-16 md:-left-20 top-1/4 text-orange-600/40 text-6xl md:text-8xl font-mono font-black"
                style={{ animation: "floatBracket 3s ease-in-out infinite" }}>&lt;</div>
              <div className="absolute -right-16 md:-right-20 bottom-1/4 text-orange-600/40 text-6xl md:text-8xl font-mono font-black"
                style={{ animation: "floatBracket 3s ease-in-out 0.5s infinite" }}>/&gt;</div>
              <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[20px] md:border-[32px] border-orange-500/80 shadow-[0_0_60px_rgba(249,115,22,0.4)]" />
                <div className="absolute inset-[-24px] md:inset-[-35px] rounded-full border-[3px] md:border-[4px] border-dashed border-orange-500/50"
                  style={{ animation: "spin 12s linear infinite" }} />
                <div className="absolute inset-[-50px] md:inset-[-65px] rounded-full border border-dotted border-orange-500/20"
                  style={{ animation: "spin 18s linear reverse infinite" }} />
               
                <div className="absolute inset-[-75px] md:inset-[-95px] rounded-full border border-dashed border-orange-500/10"
                  style={{ animation: "spin 25s linear infinite" }} />
               
                <div className="absolute" style={{
                  width: 8, height: 8, borderRadius: "50%", background: "#f97316",
                  boxShadow: "0 0 10px rgba(249,115,22,0.8)",
                  animation: "orbitAroundCenter 12s linear infinite",
                  transformOrigin: "0 0",
                  top: "50%", left: "50%",
                  marginTop: -4, marginLeft: -4,
                }} />
                <img src={ADMIN_IMAGE} alt="Arshit Jain"
                  className="absolute bottom-0 z-10 w-auto h-[130%] max-w-none object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)]"
                  style={{ animation: "floatImage 4s ease-in-out infinite" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <div className="bg-gray-900/80 border-y border-gray-800 py-4 overflow-hidden relative">
        {/* ★ NEW: subtle floating shapes in ticker band */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[10, 30, 55, 75, 90].map((x, i) => (
            <div key={i} style={{ position: "absolute", left: `${x}%`, top: "50%", transform: "translateY(-50%)",
              opacity: 0.08, animation: `floatShape ${8 + i * 2}s ${i}s ease-in-out infinite` }}>
              <svg width="16" height="16"><polygon points="8,0 16,13.86 0,13.86"
                fill="none" stroke="#f97316" strokeWidth="1.5" /></svg>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "3rem", animation: "marquee 25s linear infinite", whiteSpace: "nowrap" }}>
          {[...skills, ...skills].map((s, i) => (
            <span key={i} className="text-sm font-semibold text-gray-400 flex items-center gap-2 hover:text-orange-400 transition-colors cursor-default">
              <span className="text-orange-500">▸</span> {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div ref={statsRef} className="bg-gray-900/50 border-b border-gray-800 py-10 relative overflow-hidden">
       
        <SpinningSquareRing size={60} color="rgba(249,115,22,0.08)" dur="18s"
          style={{ top: "10%", left: "2%", animation: "floatShape 12s ease-in-out infinite" }} />
        <SpinningSquareRing size={50} color="rgba(249,115,22,0.08)" dur="14s"
          style={{ bottom: "10%", right: "3%", animation: "floatShape 10s 3s ease-in-out infinite" }} />
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" style={{ position: "relative", zIndex: 1 }}>
          {[
            { label: "Projects Built", end: 3, suffix: "+" },
            { label: "Tech Skills", end: 14, suffix: "+" },
            { label: "Year of Passion", end: 1, suffix: "" },
          ].map((s, i) => (
            <div key={s.label} className="group"
              style={{ opacity: statsIn ? 1 : 0, transform: statsIn ? "translateY(0)" : "translateY(30px)", transition: `all 0.6s ease ${i * 150}ms` }}>
              <div className="text-4xl font-black text-orange-500 mb-1 group-hover:scale-110 transition-transform duration-200">
                <CountUp end={s.end} suffix={s.suffix} inView={statsIn} />
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

    
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl" />

   
        <FloatingShapes count={10} color="rgba(249,115,22,0.1)" section="about" />

      
        <OrbitalRings size={160} color="rgba(249,115,22,0.1)"
          style={{ top: "-20px", right: "3%", opacity: 0.6 }} />

      
        <DNAHelix height={250} color="rgba(249,115,22,0.2)"
          style={{ top: "20%", left: "1%" }} />

  
        <SpinningSquareRing size={90} color="rgba(249,115,22,0.1)" dur="16s"
          style={{ bottom: "8%", right: "8%", animation: "floatShape 13s ease-in-out infinite" }} />

      
        <MorphBlob size={300} color="rgba(249,115,22,0.04)"
          style={{ top: "-50px", left: "-60px" }} />

        <div ref={aboutRef} className="max-w-6xl mx-auto px-6"
          style={{ opacity: aboutIn ? 1 : 0, transition: "opacity 0.5s ease", position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl font-black text-white overflow-hidden">
              <SplitText text="About" inView={aboutIn} delay={0} />
              {" "}
              <SplitText text="Me" inView={aboutIn} delay={300} className="text-orange-500" />
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent"
              style={{ transform: aboutIn ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 1s ease 0.6s" }} />
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
           <AnimatedParagraph
             text="I am a self-taught MERN Stack Developer who builds scalable, production-ready web applications using MongoDB, Express.js, React.js, and Node.js. I have worked as a Frontend Developer Intern at ZecData and as a Freelance Developer, contributing to live projects."
             inView={aboutIn} delay={200}
             className="text-gray-300 leading-relaxed mb-6 text-lg" />
            <AnimatedParagraph
             text="I enjoy taking projects from database design to deployment  building reusable components, integrating REST APIs, and implementing JWT authentication with Docker and CI/CD on Vercel and Railway. I hold a Full Stack Web Development certification from Apna College."
             inView={aboutIn} delay={600}
              className="text-gray-300 leading-relaxed mb-8" />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Location", value: "Bhopal, M.P." },
                  { label: "Email", value: "arshitjain7@gmail.com" },
                  { label: "Education", value: "B.Com · BSSS, 2023" },
                  { label: "Phone", value: "+91-8871807465" },
                ].map((item, i) => (
                  <div key={item.label}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 group"
                    style={{ opacity: aboutIn ? 1 : 0, transform: aboutIn ? "translateY(0)" : "translateY(20px)", transition: `all 0.5s ease ${900 + i * 100}ms` }}>
                    <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1 group-hover:tracking-widest transition-all duration-300">{item.label}</p>
                    <p className="text-gray-300 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

       
              <div className="mt-8"
                style={{ opacity: aboutIn ? 1 : 0, transform: aboutIn ? "translateX(0)" : "translateX(-30px)", transition: "all 0.7s ease 1.3s" }}>
                <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-4">Education Timeline</p>
                <div className="space-y-3 pl-4 border-l-2 border-orange-500/30">
                  {[
                    { year: "2023", title: "B.Com (Taxation)", sub: "Bhopal School of Social Science, M.P." },
                    { year: "2025", title: "Full Stack Web Dev Certification", sub: "Apna College" },
                    // { year: "2026", title: "Internship @ Zecdata", sub: "React.js & Node.js Developer" },
                  ].map((edu, i) => (
                    <div key={edu.year} className="relative pl-4 group"
                      style={{ opacity: aboutIn ? 1 : 0, transform: aboutIn ? "translateX(0)" : "translateX(-20px)", transition: `all 0.5s ease ${1500 + i * 150}ms` }}>
                      <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-gray-950 group-hover:scale-150 transition-transform duration-200" />
                      <div className="text-orange-400 text-xs font-bold">{edu.year}</div>
                      <div className="text-white text-sm font-semibold">{edu.title}</div>
                      <div className="text-gray-500 text-xs">{edu.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

       
            <div ref={skillsRef}>
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-6"
                style={{ opacity: skillsIn ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}>
                Technical Skills
              </p>
              <div className="space-y-5">
                {[
                  { cat: "Frontend", skills: ["HTML", "CSS", "JavaScript", "React.js", "Tailwind CSS", "Bootstrap", "Material UI"] },
                  { cat: "Backend", skills: ["Node.js", "Express.js", "REST APIs"] },
                  { cat: "Database", skills: ["MongoDB", "SQL"] },
                  { cat: "Tools", skills: ["Git", "GitHub", "Docker", "CI/CD","Redux"] },
                ].map((group, gi) => (
                  <div key={group.cat}
                    style={{ opacity: skillsIn ? 1 : 0, transform: skillsIn ? "translateX(0)" : "translateX(50px)", transition: `all 0.6s ease ${gi * 180}ms` }}>
                    <p className="text-orange-400 text-xs font-semibold mb-2 tracking-wider">{group.cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((sk, si) => (
                        <span key={sk}
                          className="px-3 py-1 bg-gray-900 border border-gray-700 hover:border-orange-500/80 hover:bg-orange-500/10 hover:text-orange-300 text-gray-300 text-xs rounded-full transition-all duration-200 cursor-default hover:scale-110"
                          style={{ opacity: skillsIn ? 1 : 0, transform: skillsIn ? "scale(1)" : "scale(0.5)", transition: `all 0.4s ease ${gi * 180 + si * 60}ms` }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl hover:border-orange-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 group"
                style={{ opacity: skillsIn ? 1 : 0, transform: skillsIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 0.9s" }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:rotate-12 transition-transform duration-300 inline-block"></span>
                  <div>
                    <p className="text-orange-400 font-semibold text-sm">Internship @ Zecdata</p>
                    <p className="text-gray-400 text-xs">React.js & Node.js Developer</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl hover:border-violet-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 group"
                style={{ opacity: skillsIn ? 1 : 0, transform: skillsIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 1.0s" }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:rotate-12 transition-transform duration-300 inline-block"></span>
                  <div>
                    <p className="text-violet-400 font-semibold text-sm">Full Stack Certification</p>
                    <p className="text-gray-400 text-xs">Apna College · 2025</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl hover:border-teal-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group"
                style={{ opacity: skillsIn ? 1 : 0, transform: skillsIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease 1.1s" }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:rotate-12 transition-transform duration-300 inline-block"></span>
                  <div>
                    <p className="text-teal-400 font-semibold text-sm">Freelance MERN Stack Developer</p>
                    <p className="text-gray-400 text-xs">Contract-Based · Indore</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE SECTION ── */}
      <section id="experience" className="py-24 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl" />

        <FloatingShapes count={10} color="rgba(249,115,22,0.1)" section="experience" />
        <OrbitalRings size={150} color="rgba(249,115,22,0.1)"
          style={{ top: "-20px", right: "4%", opacity: 0.6 }} />
        <SpinningSquareRing size={80} color="rgba(249,115,22,0.09)" dur="16s"
          style={{ bottom: "10%", left: "5%", animation: "floatShape 13s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "10%", left: "2%", opacity: 0.4 }}>
          <Constellation width={200} height={140} dotCount={6} color="rgba(249,115,22,0.35)" />
        </div>

        <div ref={experienceRef} className="max-w-6xl mx-auto px-6"
          style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-4xl font-black text-white">
              <SplitText text="Work" inView={experienceIn} delay={0} />
              {" "}
              <SplitText text="Experience" inView={experienceIn} delay={250} className="text-orange-500" />
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent"
              style={{ transform: experienceIn ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 1s ease 0.5s" }} />
          </div>
          <p className="text-gray-400 mb-12 ml-1"
            style={{ opacity: experienceIn ? 1 : 0, transition: "opacity 0.5s ease 0.7s" }}>
            Real teams, real deadlines, real code shipped to production.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {experiences.map((exp, i) => (
              <TiltCard key={exp.title}
                className={`group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-500 ${experienceIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
                style={{ transitionDelay: `${i * 180}ms` }}>
                <div className={`h-1 w-full bg-gradient-to-r ${exp.color}`}
                  style={{ transform: experienceIn ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: `transform 0.7s ease ${i * 180 + 400}ms` }} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 inline-block">{exp.icon}</span>
                    <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-3 py-1 group-hover:border-orange-500/40 transition-colors">{exp.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors duration-200">{exp.title}</h3>
                  <p className="text-orange-400/80 text-xs font-semibold uppercase tracking-wider mb-3">{exp.company}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{exp.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tech.map((t, ti) => (
                      <span key={t}
                        className="text-xs text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded hover:bg-orange-500/20 transition-colors"
                        style={{ opacity: experienceIn ? 1 : 0, transform: experienceIn ? "scale(1)" : "scale(0)", transition: `all 0.3s ease ${i * 180 + ti * 60 + 600}ms` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>


      <section id="projects" className="py-24 bg-gray-900/40 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl -translate-x-1/2" />

    
        <FloatingShapes count={12} color="rgba(249,115,22,0.1)" section="projects" />


        <SpinningSquareRing size={100} color="rgba(249,115,22,0.09)" dur="20s"
          style={{ top: "5%", left: "1%", animation: "floatShape 15s ease-in-out infinite" }} />
        <SpinningSquareRing size={70} color="rgba(249,115,22,0.08)" dur="13s"
          style={{ bottom: "5%", right: "2%", animation: "floatShape 12s 4s ease-in-out infinite" }} />

       
        <OrbitalRings size={130} color="rgba(249,115,22,0.09)"
          style={{ top: "30%", right: "0%", opacity: 0.5 }} />

        
        <div style={{ position: "absolute", bottom: "5%", left: "2%", opacity: 0.4 }}>
          <Constellation width={200} height={140} dotCount={6} color="rgba(249,115,22,0.4)" />
        </div>

      
        <CornerBrackets size={75} color="rgba(249,115,22,0.15)"
          style={{ top: "15%", right: "10%" }} />

        <div ref={projectsRef} className="max-w-6xl mx-auto px-6" style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-4xl font-black text-white">
              <SplitText text="My" inView={projectsIn} delay={0} />
              {" "}
              <SplitText text="Projects" inView={projectsIn} delay={200} className="text-orange-500" />
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent"
              style={{ transform: projectsIn ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 1s ease 0.5s" }} />
          </div>
          <p className="text-gray-400 mb-12 ml-1"
            style={{ opacity: projectsIn ? 1 : 0, transition: "opacity 0.5s ease 0.7s" }}>
            Not just projects these are products I built, broke, fixed, and shipped.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <TiltCard key={p.title}
                className={`group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-500 ${projectsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
                style={{ transitionDelay: `${i * 180}ms` }}>
                <div className={`h-1 w-full bg-gradient-to-r ${p.color}`}
                  style={{ transform: projectsIn ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: `transform 0.7s ease ${i * 180 + 400}ms` }} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 inline-block">{p.icon}</span>
                    <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-3 py-1 group-hover:border-orange-500/40 transition-colors">MERN Stack</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors duration-200">{p.title}</h3>
                  <p className="text-orange-400/80 text-xs font-semibold uppercase tracking-wider mb-3">{p.subtitle}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.tech.map((t, ti) => (
                      <span key={t}
                        className="text-xs text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded hover:bg-orange-500/20 transition-colors"
                        style={{ opacity: projectsIn ? 1 : 0, transform: projectsIn ? "scale(1)" : "scale(0)", transition: `all 0.3s ease ${i * 180 + ti * 60 + 600}ms` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                
                  {p.videoUrl && p.link === "#" && (
                    <div className="space-y-2 mt-2">
                      <button
                        onClick={() => setActiveVideo(p.videoUrl)}
                        className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                        ▶ Watch Project Video
                      </button>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500/70 inline-block" />
                        Backend offline - Railway free trial expired
                      </p>
                    </div>
                  )}
                  {p.link !== "#" && (
                    <div className="space-y-2 mt-2">
                      <a href={p.link} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors font-semibold">
                        <span className="w-2 h-2 rounded-full bg-green-500/70" />
                        View Live Project →
                      </a>
                      {p.videoUrl && (
                        <button
                          onClick={() => setActiveVideo(p.videoUrl)}
                          className="block text-xs text-orange-400/70 hover:text-orange-300 font-semibold transition-colors">
                          ▶ Watch Project Video
                        </button>
                      )}
                      {p.railwayDown && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500/70 inline-block" />
                          Backend offline - Railway free trial expired 
                        </p>
                      )}
                    </div>
                  )}
                  {!p.videoUrl && !p.railwayDown && p.link === "#" && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500/60" style={{ animation: "blink 1.5s step-end infinite" }} />
                      <span className="text-xs">Coming Soon</span>
                    </div>
                  )}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

     
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />

        
        <FloatingShapes count={10} color="rgba(249,115,22,0.1)" section="contact" />

      
        <DNAHelix height={220} color="rgba(249,115,22,0.18)"
          style={{ top: "15%", right: "1%" }} />

       
        <MorphBlob size={280} color="rgba(249,115,22,0.04)"
          style={{ top: "-60px", right: "-60px" }} />

      
        <OrbitalRings size={120} color="rgba(249,115,22,0.1)"
          style={{ bottom: "10%", left: "2%", opacity: 0.5 }} />

    
        <CornerBrackets size={80} color="rgba(249,115,22,0.14)"
          style={{ top: "10%", right: "6%" }} />
        <CornerBrackets size={55} color="rgba(249,115,22,0.1)"
          style={{ bottom: "15%", left: "5%" }} />

     
        <SpinningSquareRing size={85} color="rgba(249,115,22,0.08)" dur="17s"
          style={{ top: "40%", right: "8%", animation: "floatShape 14s 1s ease-in-out infinite" }} />

       
        <div style={{ position: "absolute", top: "8%", left: "3%", opacity: 0.45 }}>
          <Constellation width={180} height={130} dotCount={6} color="rgba(249,115,22,0.35)" />
        </div>

        <div ref={contactRef} className="max-w-4xl mx-auto px-6" style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl font-black text-white">
              <SplitText text="Get In" inView={contactIn} delay={0} />
              {" "}
              <SplitText text="Touch" inView={contactIn} delay={350} className="text-orange-500" />
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent"
              style={{ transform: contactIn ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 1s ease 0.6s" }} />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <AnimatedParagraph
                text="Let’s Build Something Together I’m a MERN Stack Developer passionate about building scalable and user-friendly web applications. If you have a project, idea, or job opportunity  feel free to reach out. I love to collaborate and create something amazing."
                inView={contactIn} delay={300}
                className="text-gray-300 text-lg leading-relaxed mb-8" />
              <div className="space-y-4">
                {[
                  { icon: <MdEmail />, label: "Email", value: "arshitjain7@gmail.com", href: "mailto:arshitjain7@gmail.com" },
                  { icon: "📱", label: "Phone", value: "+91-8871807465", href: "tel:+918871807465" },
                  { icon: <FaGithub />, label: "GitHub", value: "github.com/arshitjain12", href: "https://github.com/arshitjain12" },
                  { icon: "📍", label: "Location", value: "Bhopal, Madhya Pradesh", href: null },
                  
                ].map((item, i) => (
                  <div key={item.label}
                    className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-orange-500/60 transition-all duration-300 group hover:-translate-x-1 hover:shadow-lg hover:shadow-orange-500/10"
                    style={{ opacity: contactIn ? 1 : 0, transform: contactIn ? "translateX(0)" : "translateX(-30px)", transition: `all 0.5s ease ${600 + i * 120}ms` }}>
                    <span className="text-xl w-8 group-hover:scale-125 transition-transform duration-200">{item.icon}</span>
                    <div>
                      <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                          className="text-gray-300 text-sm hover:text-orange-400 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-gray-300 text-sm">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

           
<div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
  style={{ opacity: contactIn ? 1 : 0, transform: contactIn ? "translateX(0) scale(1)" : "translateX(40px) scale(0.95)", transition: "all 0.7s ease 0.4s" }}>
  <h3 className="text-white font-bold text-lg mb-6">Send a Message</h3>
  

  <form action="https://api.web3forms.com/submit" method="POST" className="space-y-4">
    

    <input type="hidden" name="access_key" value="051578b3-e74a-42ad-ac9b-954504895fcb" />
    
    <div className="group">
      <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block group-focus-within:text-orange-400 transition-colors">Name</label>
      <input type="text" name="name" required placeholder="Your Name"
        className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white px-4 py-3 rounded-xl outline-none text-sm transition-all duration-200 focus:shadow-sm focus:shadow-orange-500/20" />
    </div>

    <div className="group">
      <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block group-focus-within:text-orange-400 transition-colors">Email</label>
      <input type="email" name="email" required placeholder="your@email.com"
        className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white px-4 py-3 rounded-xl outline-none text-sm transition-all duration-200 focus:shadow-sm focus:shadow-orange-500/20" />
    </div>

    <div className="group">
      <label className="text-gray-400 text-xs uppercase tracking-wider mb-1 block group-focus-within:text-orange-400 transition-colors">Message</label>
      <textarea rows={4} name="message" required placeholder="Your message..."
        className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white px-4 py-3 rounded-xl outline-none text-sm transition-all duration-200 resize-none focus:shadow-sm focus:shadow-orange-500/20" />
    </div>

    
    <button type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] relative overflow-hidden group">
      <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
      Send Message ✉️
    </button>
  </form>
</div>
          </div>
        </div>
      </section>

    
      <footer className="border-t border-gray-800 py-8 bg-gray-950 relative overflow-hidden">
        {/* ★ NEW: subtle spinning ring in footer */}
        <SpinningSquareRing size={50} color="rgba(249,115,22,0.07)" dur="20s"
          style={{ bottom: "10%", left: "45%", animation: "floatShape 16s ease-in-out infinite" }} />
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4" style={{ position: "relative", zIndex: 1 }}>
         <p className="text-gray-500 text-sm flex items-center gap-1">
  Portfolio Made with <FaHeart className="text-red-500" /> By Arshit Jain   ©2026
</p>
          <div className="flex gap-6">
<a 
  href="https://github.com/arshitjain12"  
  target="_blank" 
  rel="noreferrer"
  className="flex items-center gap-2 text-gray-500 hover:text-orange-400 text-sm transition-colors"
>
  <FaGithub />
  GitHub
</a>

<a 
  href="mailto:arshitjain7@gmail.com"
  className="flex items-center gap-2 text-gray-500 hover:text-orange-400 text-sm transition-colors"
>
  <MdEmail />
  Email
</a>
          </div>
        </div>
      </footer>
  
{activeVideo && (
  <div
    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onClick={() => setActiveVideo(null)}>
    <div
      className="relative w-full max-w-4xl mx-4"
      onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setActiveVideo(null)}
        className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium transition-colors">
        ✕ Close
      </button>
      <video
        src={activeVideo}
        controls
        autoPlay
        className="w-full rounded-2xl shadow-2xl border border-gray-700"
        style={{ maxHeight: "80vh" }}
      />
      <p className="text-center text-gray-400 text-xs mt-3">
        🔴 Live site offline — Railway free trial expired. Video shows full working demo.
      </p>
    </div>
  </div>
)}

   
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.15; }
          50%       { transform: translateY(-40px) scale(1.3); opacity: 0.4; }
        }
        @keyframes floatBracket {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes floatImage {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50%       { transform: scale(1.1); opacity: 0.8; }
        }

        /* ★ NEW keyframes below ★ */

        /* Floating shapes drift up-down + slight sway */
        @keyframes floatShape {
          0%   { transform: translateY(0px) translateX(0px); }
          25%  { transform: translateY(-18px) translateX(6px); }
          50%  { transform: translateY(-28px) translateX(-4px); }
          75%  { transform: translateY(-12px) translateX(8px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        /* Corner brackets pulse */
        @keyframes pulseBracket {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.06); }
        }

        /* DNA strand beat */
        @keyframes dnaPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }

        /* Orbit a dot around the hero circle */
        @keyframes orbitAroundCenter {
          from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
        }

        /* Blob morphing (fallback for non-SVG-SMIL) */
        @keyframes morphBlob {
          0%,100% { d: path("M50,100 C50,50 100,20 150,50 C180,70 180,130 150,150 C100,180 50,150 50,100Z"); }
          50%      { d: path("M40,90 C30,40 90,10 155,45 C185,65 190,135 155,160 C90,190 40,140 40,90Z"); }
        }
      `}</style>
    </div>
  );
}
