import { useState } from "react";
import { sendContactMessage } from "@/server/contact";
import { InteractiveSilkWeb } from "@/components/decor/InteractiveSilkWeb";

interface ContactFormProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function ContactForm({ onClose, isModal = false }: ContactFormProps) {
  const [activeField, setActiveField] = useState<"name" | "email" | "subject" | "message" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Web Experience & Motion",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please complete all required fields (Name, Email, Message).");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    setSuccessMessage("");

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
        setSuccessMessage(response.message || "Signal transmitted successfully! We will get back to you soon.");
        setFormData({ name: "", email: "", subject: "Web Experience & Motion", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(response.message || "Failed to transmit message. Please try again.");
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

  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/25 bg-[#080a0f]/90 p-6 shadow-[0_0_80px_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:p-8">
      {/* Interactive White & Grey Silk Spider Web Canvas */}
      <InteractiveSilkWeb activeField={activeField} density={signalPercent} />

      {/* Silver Corner Anchors */}
      <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />

      {/* Header */}
      <div className="relative z-10 mb-6 flex items-start justify-between border-b border-white/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="label-mono text-[11px] tracking-[0.2em] text-neutral-300">
              STUDIO TRANSMISSION FORM
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-light tracking-tight text-white md:text-3xl">
            Weave a new thread.
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            Send your brief or inquiry directly to our inbox via Resend email delivery.
          </p>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 p-2 text-xs text-neutral-400 transition-colors hover:border-white hover:bg-white hover:text-black cursor-pointer"
            aria-label="Close form"
          >
            ✕
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 flex items-center justify-between label-mono text-[10px] text-neutral-300">
            <span>SENDER NAME <span className="text-white">*</span></span>
            {activeField === "name" && <span className="text-white text-[9px] animate-pulse">● CONNECTED</span>}
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={formData.name}
            onFocus={() => setActiveField("name")}
            onBlur={() => setActiveField(null)}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Peter Parker"
            className="w-full rounded-md border border-white/20 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/25 transition-all backdrop-blur-sm"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1.5 flex items-center justify-between label-mono text-[10px] text-neutral-300">
            <span>EMAIL ADDRESS <span className="text-white">*</span></span>
            {activeField === "email" && <span className="text-white text-[9px] animate-pulse">● CONNECTED</span>}
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={formData.email}
            onFocus={() => setActiveField("email")}
            onBlur={() => setActiveField(null)}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@domain.com"
            className="w-full rounded-md border border-white/20 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/25 transition-all backdrop-blur-sm"
          />
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block label-mono text-[10px] text-neutral-300">
            CHANNEL / SUBJECT
          </label>
          <select
            id="contact-subject"
            value={formData.subject}
            onFocus={() => setActiveField("subject")}
            onBlur={() => setActiveField(null)}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full rounded-md border border-white/20 bg-black/50 px-3.5 py-2.5 text-sm text-white focus:border-white focus:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/25 transition-all backdrop-blur-sm"
          >
            <option value="Web Experience & Motion" className="bg-neutral-900 text-white">Web Experience & 3D Interactive</option>
            <option value="Cinematic Film & Sequence" className="bg-neutral-900 text-white">Cinematic Film & Sequence</option>
            <option value="Brand Identity & Sound" className="bg-neutral-900 text-white">Brand Identity & Sound Design</option>
            <option value="General Studio Inquiry" className="bg-neutral-900 text-white">General Studio Inquiry</option>
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between label-mono text-[10px] text-neutral-300">
            <span>MESSAGE / TRANSMISSION BRIEF <span className="text-white">*</span></span>
            <span className="text-neutral-400">SILK DENSITY: {signalPercent}%</span>
          </div>
          <textarea
            id="contact-message"
            required
            rows={4}
            value={formData.message}
            onFocus={() => setActiveField("message")}
            onBlur={() => setActiveField(null)}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Describe your project, timeline, or idea..."
            className="w-full resize-none rounded-md border border-white/20 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/25 transition-all backdrop-blur-sm"
          />
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-gradient-to-r from-neutral-500 via-neutral-300 to-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              style={{ width: `${signalPercent}%` }}
            />
          </div>
        </div>

        {/* Status indicator */}
        {status === "error" && (
          <div className="rounded-md border border-red-500/50 bg-red-950/40 p-3 label-mono text-xs text-red-200">
            ⚠ {errorMessage}
          </div>
        )}

        {status === "success" && (
          <div className="rounded-md border border-white/50 bg-white/10 p-3 label-mono text-xs text-white">
            ✓ {successMessage}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-white/15">
          <span className="label-mono text-[9px] text-neutral-400">
            Protected by Studio Privacy Policy
          </span>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md border border-white/80 bg-white px-5 py-2.5 label-mono text-xs font-semibold text-black transition-all duration-300 hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.35)] disabled:opacity-50 cursor-pointer"
          >
            {status === "submitting" ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>WEAVING TRANSMISSION...</span>
              </>
            ) : (
              <>
                <span>TRANSMIT SIGNAL</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
