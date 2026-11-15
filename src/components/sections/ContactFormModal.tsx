import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { sendContactMessage } from "@/server/contact";
import { InteractiveSilkWeb } from "@/components/decor/InteractiveSilkWeb";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANNELS = [
  { id: "3D Web & Interactive", label: "01 / 3D Web & Interactive" },
  { id: "Cinematic Film & Motion", label: "02 / Film & Motion" },
  { id: "Brand & Sound Architecture", label: "03 / Brand & Sound" },
  { id: "Custom Studio Signal", label: "04 / Custom Signal" },
];

/** Full-screen web-pulling "SENT" success animation overlay — pure elegant monochrome white & grey */
function SentAnimation({ onDone }: { onDone: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let rafId: number;
    let start: number | null = null;
    const DURATION = 2800; // ms total
    const svg = svgRef.current;
    if (!svg) return;

    // Animate all strands: draw in, then pull/converge toward center
    const strands = svg.querySelectorAll<SVGPathElement>(".sent-strand");
    const letters = svg.querySelectorAll<SVGTextElement>(".sent-letter");

    strands.forEach((s) => {
      const len = s.getTotalLength?.() ?? 400;
      s.style.strokeDasharray = `${len}`;
      s.style.strokeDashoffset = `${len}`;
    });
    letters.forEach((l) => {
      l.style.opacity = "0";
      l.style.transform = "scale(0.5)";
    });

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / DURATION, 1);

      strands.forEach((s) => {
        const len = parseFloat(s.style.strokeDasharray ?? "400");
        // Phase 1 (0-0.5): draw in the strands
        if (t < 0.5) {
          const phase = t / 0.5;
          s.style.strokeDashoffset = `${len * (1 - phase)}`;
          s.style.opacity = `${phase * 0.85}`;
        } else {
          // Phase 2 (0.5-1): pull/converge and fade
          const phase = (t - 0.5) / 0.5;
          s.style.strokeDashoffset = `0`;
          s.style.opacity = `${0.85 * (1 - phase)}`;
        }
      });

      // Letters appear at t=0.45
      if (t > 0.45) {
        letters.forEach((l, i) => {
          const delay = i * 0.08;
          const lt = Math.max(0, Math.min((t - 0.45 - delay) / 0.25, 1));
          const le = 1 - Math.pow(1 - lt, 2);
          l.style.opacity = `${le}`;
          l.style.transform = `translateY(${(1 - le) * 12}px) scale(${0.6 + le * 0.4})`;
        });
      }

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 400);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [onDone]);

  // White and grey silk strands radiating toward center "SENT"
  const cx = 100;
  const cy = 100;
  const strandDefs = [
    { d: `M -60,0 Q ${cx * 0.3},${cy * 0.2} ${cx},${cy}`, color: "rgba(255,255,255,0.9)" },
    { d: `M 1060,0 Q ${cx + cx * 0.4},${cy * 0.15} ${cx},${cy}`, color: "rgba(220,230,240,0.8)" },
    { d: `M -60,800 Q ${cx * 0.25},${cy + cy * 0.5} ${cx},${cy}`, color: "rgba(180,195,210,0.7)" },
    { d: `M 1060,800 Q ${cx + cx * 0.5},${cy + cy * 0.45} ${cx},${cy}`, color: "rgba(255,255,255,0.85)" },
    { d: `M 500,0 Q ${cx},${cy * 0.2} ${cx},${cy}`, color: "#ffffff" },
    { d: `M 500,800 Q ${cx},${cy + cy * 0.55} ${cx},${cy}`, color: "rgba(200,215,230,0.75)" },
    { d: `M 0,400 Q ${cx * 0.18},${cy} ${cx},${cy}`, color: "rgba(240,245,255,0.85)" },
    { d: `M 1000,400 Q ${cx + cx * 0.6},${cy} ${cx},${cy}`, color: "rgba(180,195,210,0.7)" },
    { d: `M 120,-40 Q 360,240 ${cx},${cy}`, color: "#ffffff" },
    { d: `M 880,-40 Q 640,240 ${cx},${cy}`, color: "rgba(220,230,240,0.75)" },
    { d: `M 120,840 Q 360,560 ${cx},${cy}`, color: "rgba(200,215,230,0.7)" },
    { d: `M 880,840 Q 640,560 ${cx},${cy}`, color: "#ffffff" },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden animate-in fade-in duration-300"
      style={{ background: "rgba(6, 7, 10, 0.98)" }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="sentGlowWhite" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Silk strands converging on center */}
        {strandDefs.map((s, i) => (
          <path
            key={i}
            className="sent-strand"
            d={s.d}
            fill="none"
            stroke={s.color}
            strokeWidth={i % 2 === 0 ? "1.6" : "1"}
            filter="url(#sentGlowWhite)"
            style={{ transition: "opacity 0.2s" }}
          />
        ))}

        {/* Center web hub knot */}
        <circle cx={cx} cy={cy} r="6" fill="#ffffff" filter="url(#sentGlowWhite)" opacity="0.95" />
        <circle cx={cx} cy={cy} r="18" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 5" />
      </svg>

      {/* SENT text */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <svg
          viewBox="0 0 400 120"
          className="w-[min(80vw,420px)]"
          style={{ overflow: "visible" }}
        >
          {["S", "E", "N", "T"].map((char, i) => (
            <text
              key={char}
              className="sent-letter"
              x={50 + i * 90}
              y="90"
              fontFamily="var(--font-display, sans-serif)"
              fontSize="88"
              fontWeight="200"
              fill="#ffffff"
              filter="url(#sentGlowWhite)"
              textAnchor="middle"
              style={{
                transformOrigin: `${50 + i * 90}px 90px`,
                transition: "opacity 0.1s, transform 0.1s",
              }}
            >
              {char}
            </text>
          ))}
        </svg>
        <p
          className="sent-letter label-mono text-xs tracking-[0.35em] text-neutral-300"
          style={{ transformOrigin: "center", transition: "opacity 0.1s, transform 0.1s" }}
        >
          MESSAGE SENT SUCCESSFULLY
        </p>
      </div>
    </div>,
    document.body
  );
}

export function ContactFormModal({ isOpen, onClose }: ContactFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeField, setActiveField] = useState<"name" | "email" | "subject" | "message" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "3D Web & Interactive",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSentAnim, setShowSentAnim] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please complete all required fields (Name, Email, Message).");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await sendContactMessage({
        data: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      });

      if (response.success) {
        setStatus("success");
        setShowSentAnim(true);
        setFormData({ name: "", email: "", subject: "3D Web & Interactive", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(response.message || "Transmission failed. Please check connection and try again.");
      }
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      const msg = err instanceof Error ? err.message : "An unexpected transmission error occurred.";
      setErrorMessage(msg);
    }
  };

  const messageLength = formData.message.trim().length;
  const signalPercent = Math.min(100, Math.round((messageLength / 120) * 100));

  const handleSentDone = () => {
    setShowSentAnim(false);
    setStatus("success");
  };

  return (
    <>
      {/* Web-pulling SENT animation */}
      {showSentAnim && <SentAnimation onDone={handleSentDone} />}

      {createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Darkened Silk Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-300 animate-in fade-in"
            aria-hidden="true"
          />

          <InteractiveSilkWeb
            activeField={activeField}
            density={signalPercent}
            composition="backdrop"
            className="z-[1] opacity-90"
          />

          {/* Main Form Card with White & Grey Theme */}
          <div
            ref={modalRef}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/25 bg-[#080a0f]/90 p-6 sm:p-8 md:p-10 shadow-[0_0_90px_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all animate-in zoom-in-95 duration-300"
          >
            {/* Silver & White Corner Tension Anchors */}
            <span className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
            <span className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
            <span className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />

            {/* Modal Header Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-white/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </span>
                <span className="label-mono text-xs font-medium tracking-[0.25em] text-neutral-300">
                  ARACHNÉ // Contact Form
                </span>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="group flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-neutral-400 transition-all duration-300 hover:border-white hover:bg-white hover:text-black cursor-pointer"
                aria-label="Close form overlay"
              >
                <span className="text-sm transition-transform duration-300 group-hover:rotate-90">✕</span>
              </button>
            </div>

            {/* Title & Frequency Indicator */}
            <div className="relative z-10 mt-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-3xl sm:text-4xl font-extralight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    Create a New Message.
                  </h2>
                  <p className="mt-1 text-xs text-neutral-400 font-medium">
                    Direct message to <code className="text-neutral-200 font-semibold">bharathserman@gmail.com</code>
                  </p>
                </div>
                <div className="rounded-full border border-white/30 bg-white/5 px-3 py-1 label-mono text-[10px] text-neutral-200 backdrop-blur-sm shadow-[0_0_12px_rgba(255,255,255,0.12)]">
                  SPIDEY BHARATH
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="relative z-10 mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Sender Name */}
                <div>
                  <label htmlFor="modal-name" className="mb-1.5 flex items-center justify-between label-mono text-[10px] text-neutral-300 font-medium drop-shadow-sm">
                    <span>01 // SENDER NAME <span className="text-white">*</span></span>
                    {activeField === "name" && <span className="text-white text-[9px] animate-pulse">● THREAD CONNECTED</span>}
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    value={formData.name}
                    onFocus={() => setActiveField("name")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="eg. Peter Parker"
                    className="w-full rounded-lg border border-white/45 bg-[#030407] px-4 py-3 text-sm font-medium text-white placeholder:text-neutral-400 caret-ember shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 focus:border-ember focus:bg-[#030407] focus:outline-none focus:ring-2 focus:ring-ember/50 backdrop-blur-sm"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="modal-email" className="mb-1.5 flex items-center justify-between label-mono text-[10px] text-neutral-300 font-medium drop-shadow-sm">
                    <span>02 // SENDER EMAIL <span className="text-white">*</span></span>
                    {activeField === "email" && <span className="text-white text-[9px] animate-pulse">● THREAD CONNECTED</span>}
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    value={formData.email}
                    onFocus={() => setActiveField("email")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="eg. xxx@yyy.com"
                    className="w-full rounded-lg border border-white/45 bg-[#030407] px-4 py-3 text-sm font-medium text-white placeholder:text-neutral-400 caret-ember shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 focus:border-ember focus:bg-[#030407] focus:outline-none focus:ring-2 focus:ring-ember/50 backdrop-blur-sm"
                  />
                </div>
              </div>
              {/* Message Textarea */}
              <div>
                <div className="mb-1.5 flex items-center justify-between label-mono text-[10px] text-neutral-300 font-medium drop-shadow-sm">
                  <span>04 // TRANSMISSION BRIEF & MESSAGE <span className="text-white">*</span></span>
                  <span className="text-neutral-400">SILK DENSITY: {signalPercent}%</span>
                </div>
                <textarea
                  id="modal-message"
                  required
                  rows={4}
                  value={formData.message}
                  onFocus={() => setActiveField("message")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Outline your project scope, vision, timeline, or rough idea..."
                  className="w-full resize-none rounded-lg border border-white/45 bg-[#030407] px-4 py-3 text-sm font-medium text-white placeholder:text-neutral-400 caret-ember shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 focus:border-ember focus:bg-[#030407] focus:outline-none focus:ring-2 focus:ring-ember/50 backdrop-blur-sm"
                />
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full bg-gradient-to-r from-neutral-500 via-neutral-300 to-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    style={{ width: `${signalPercent}%` }}
                  />
                </div>
              </div>

              {/* Error Banner */}
              {status === "error" && (
                <div className="rounded-lg border border-red-500/50 bg-red-950/40 p-3.5 label-mono text-xs text-red-200 animate-in fade-in backdrop-blur-md">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>SIGNAL TRANSMISSION FAILURE</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-red-300">{errorMessage}</p>
                </div>
              )}

              {status === "success" && (
                <div
                  role="status"
                  className="rounded-lg border border-emerald-400/45 bg-emerald-950/45 p-3.5 text-emerald-100 animate-in fade-in backdrop-blur-md"
                >
                  <p className="label-mono text-xs font-semibold">SIGNAL TRANSMITTED</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-200">
                    Your message is on its way. Use the X to close this form when you’re ready.
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-lg border border-white/80 bg-white px-6 py-2.5 label-mono text-xs font-bold tracking-widest text-black shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all duration-300 hover:bg-neutral-200 hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {status === "submitting" ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      <span>WEAVING MESSAGE...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">[ SEND MESSAGE ]</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
