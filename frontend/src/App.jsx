import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import "./App.css";

const API = import.meta.env.VITE_API_URL ?? "";

/* ─── SVG Icons ───────────────────────────────────────────────── */
const IC = {
  send: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  copy: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  history: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>
    </svg>
  ),
  prompt: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  sparkle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
    </svg>
  ),
};

/* ─── Neptune Logo ────────────────────────────────────────────── */
function NeptuneLogo() {
  return (
    <svg viewBox="0 0 36 36" width="28" height="28" fill="none">
      <defs>
        <radialGradient id="nlg" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#3a90d8" stopOpacity="1"/>
          <stop offset="55%"  stopColor="#1a4a90" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#070f30" stopOpacity="1"/>
        </radialGradient>
        <radialGradient id="nlhalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#4fc8e8" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#4fc8e8" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill="url(#nlhalo)"/>
      <circle cx="18" cy="18" r="14" fill="url(#nlg)"/>
      <line x1="18" y1="8"  x2="18" y2="28" stroke="#4fc8e8" strokeWidth="2"   strokeLinecap="round"/>
      <path d="M12 14V8l3 3.5"  stroke="#4fc8e8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 14V8l-3 3.5" stroke="#4fc8e8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="11" y1="18" x2="25" y2="18" stroke="#4fc8e8" strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/>
    </svg>
  );
}

/* ─── Starfield ───────────────────────────────────────────────── */
function Starfield() {
  const stars = useMemo(() =>
    Array.from({ length: 135 }, (_, i) => ({
      id: i,
      x:       Math.random() * 100,
      y:       Math.random() * 100,
      size:    0.8 + Math.random() * 1.7,
      op:      0.2 + Math.random() * 0.65,
      dur:     (2 + Math.random() * 4).toFixed(2),
      delay:   (Math.random() * 5).toFixed(2),
      purple:  Math.random() < 0.08,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full star-twinkle"
          style={{
            left:         `${s.x}%`,
            top:          `${s.y}%`,
            width:        `${s.size}px`,
            height:       `${s.size}px`,
            background:   s.purple ? 'rgba(180,140,255,0.9)' : '#ffffff',
            opacity:      s.op,
            '--star-op':  s.op,
            '--star-dur': `${s.dur}s`,
            '--star-delay': `${s.delay}s`,
          }}
        />
      ))}

      {/* Nebula — top-right */}
      <div className="absolute pointer-events-none" style={{
        top: '-60px', right: '-60px',
        width: '300px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(80,40,140,0.18) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      {/* Nebula — bottom-left */}
      <div className="absolute pointer-events-none" style={{
        bottom: '-40px', left: '-40px',
        width: '260px', height: '180px',
        background: 'radial-gradient(ellipse, rgba(30,60,140,0.14) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
    </div>
  );
}

/* ─── Neptune Planet ──────────────────────────────────────────── */
function NeptunePlanet() {
  return (
    <div className="relative flex items-center justify-center shrink-0 z-[1]"
         style={{ width: '180px', height: '180px' }}>
      <div className="neptune-planet" />
    </div>
  );
}

/* ─── Feature Cards ───────────────────────────────────────────── */
const FEATURES = [
  {
    label:     "Smart Chat",
    labelStyle: { background: 'rgba(79,180,232,0.15)', color: '#4fc8e8' },
    desc:      "Ask anything — code, research, writing, analysis. Powered by GPT‑4o.",
    prompt:    "Help me with ",
  },
  {
    label:     "System Prompt",
    labelStyle: { background: 'rgba(120,80,200,0.18)', color: '#a78bfa' },
    desc:      "Customize AI behavior with a system-level instruction for this chat.",
    action:    "prompt",
  },
  {
    label:     "Markdown Output",
    labelStyle: { background: 'rgba(45,180,160,0.15)', color: '#2dd4bf' },
    desc:      "Replies rendered with rich markdown — code, lists, headings and more.",
    prompt:    "Write a markdown-formatted guide on ",
  },
];

function FeatureCards({ onPrompt, onOpenPromptModal }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
      {FEATURES.map(f => (
        <button
          key={f.label}
          onClick={() => f.action === "prompt" ? onOpenPromptModal() : onPrompt(f.prompt)}
          className="text-left rounded-[14px] p-4 cursor-pointer select-none
                     transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background:     'rgba(10,18,40,0.7)',
            backdropFilter: 'blur(8px)',
            border:         '1px solid rgba(79,180,232,0.1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.border     = '1px solid rgba(79,180,232,0.28)';
            e.currentTarget.style.boxShadow  = '0 6px 28px rgba(20,60,160,0.22)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.border    = '1px solid rgba(79,180,232,0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span
            className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 tracking-wide"
            style={f.labelStyle}
          >{f.label}</span>
          <p className="text-[12.5px] leading-snug" style={{ color: 'rgba(200,216,240,0.7)' }}>
            {f.desc}
          </p>
        </button>
      ))}
    </div>
  );
}

/* ─── Copy Button ─────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px]
                 transition-all duration-150 font-mono"
      style={{
        border:     copied ? '1px solid rgba(79,200,232,0.25)' : '1px solid transparent',
        background: copied ? 'rgba(79,200,232,0.06)' : 'transparent',
        color:      copied ? '#4fc8e8' : 'rgba(200,216,240,0.3)',
      }}
      onMouseEnter={e => {
        if (!copied) {
          e.currentTarget.style.color      = 'rgba(200,216,240,0.7)';
          e.currentTarget.style.background = 'rgba(79,180,232,0.06)';
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          e.currentTarget.style.color      = 'rgba(200,216,240,0.3)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
      title="Copy"
    >
      {copied ? IC.check : IC.copy}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

/* ─── Message ─────────────────────────────────────────────────── */
function Message({ role, content }) {
  const isAI = role === "assistant";
  return (
    <div
      className="flex gap-3 px-5 py-3.5 animate-[msgIn_0.2s_ease]"
      style={{
        background:   isAI ? 'rgba(10,18,40,0.45)' : 'rgba(20,40,90,0.22)',
        borderBottom: '1px solid rgba(79,180,232,0.04)',
      }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center
                   text-[11px] font-bold"
        style={{
          background: isAI
            ? 'radial-gradient(ellipse at 30% 25%, #3a90d8, #1a4a90 60%, #070f30)'
            : 'linear-gradient(135deg, #2a2a90, #6040c0)',
          color:     '#e8f2ff',
          boxShadow: isAI
            ? '0 0 14px rgba(79,200,232,0.3)'
            : '0 0 14px rgba(100,80,200,0.3)',
        }}
      >
        {isAI ? "N" : "U"}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="text-sm break-words overflow-hidden prose-neptune"
             style={{ color: 'rgba(200,216,240,0.92)' }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className="flex gap-1.5">
          <CopyButton text={content} />
        </div>
      </div>
    </div>
  );
}

/* ─── Typing Dots ─────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex flex-row gap-3 px-5 py-3.5"
         style={{ background: 'rgba(10,18,40,0.45)', borderBottom: '1px solid rgba(79,180,232,0.04)' }}>
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center
                   text-[11px] font-bold"
        style={{
          background: 'radial-gradient(ellipse at 30% 25%, #3a90d8, #1a4a90 60%, #070f30)',
          color:      '#e8f2ff',
          boxShadow:  '0 0 14px rgba(79,200,232,0.3)',
        }}
      >N</div>
      <div className="flex items-center gap-1.5 py-2">
        <span className="w-1.5 h-1.5 rounded-full animate-[dotBounce_1.2s_ease-in-out_0s_infinite]"    style={{ background: '#4fc8e8' }} />
        <span className="w-1.5 h-1.5 rounded-full animate-[dotBounce_1.2s_ease-in-out_0.15s_infinite]" style={{ background: '#4fc8e8' }} />
        <span className="w-1.5 h-1.5 rounded-full animate-[dotBounce_1.2s_ease-in-out_0.3s_infinite]"  style={{ background: '#4fc8e8' }} />
      </div>
    </div>
  );
}

/* ─── History Panel ───────────────────────────────────────────── */
function HistoryPanel({ chats, activeChatId, onSelect, onNew, onDelete, open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[55]"
          style={{ background: 'rgba(4,6,15,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 bottom-0 left-[52px] w-60 flex flex-col z-[58]
                    transition-transform duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${open ? "translate-x-0" : "-translate-x-[calc(100%+52px)]"}`}
        style={{
          background:     'rgba(7,11,26,0.96)',
          backdropFilter: 'blur(14px)',
          borderRight:    '1px solid rgba(79,180,232,0.08)',
        }}
      >
        {/* Header */}
<div className="flex items-center justify-between px-3.5 py-4"
     style={{ borderBottom: '1px solid rgba(79,180,232,0.08)' }}>
  <span className="flex items-center gap-2 text-[13.5px] font-bold font-heading"
        style={{ color: '#e8f2ff' }}>
    <NeptuneLogo /> Neptune AI
  </span>
  
  {/* Icon Links */}
  <div className="flex items-center gap-4">
    <a 
      href="https://github.com/afnanhussain2002" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-lg text-gray-400 hover:text-blue-400 transition-colors"
    >
      <FaGithub />
    </a>
    <a 
      href="https://x.com/MdAfnanHussain" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-lg text-gray-400 hover:text-blue-400 transition-colors"
    >
      <FaTwitter />
    </a>
    <a 
      href="https://linkedin.com/in/md-afnan-hussain" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-lg text-gray-400 hover:text-blue-400 transition-colors"
    >
      <FaLinkedin />
    </a>
  </div>

  <button
    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
    style={{ color: 'rgba(200,216,240,0.4)' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,180,232,0.1)'; e.currentTarget.style.color = '#4fc8e8'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent';           e.currentTarget.style.color = 'rgba(200,216,240,0.4)'; }}
    onClick={onClose}
  >
    {IC.close}
  </button>
</div>

        {/* New chat */}
        <button
          onClick={() => { onNew(); onClose(); }}
          className="flex items-center gap-2 mx-2.5 my-3 px-3 py-2.5 rounded-lg
                     text-[13px] font-semibold transition-all"
          style={{
            background: 'rgba(79,180,232,0.08)',
            border:     '1px solid rgba(79,180,232,0.2)',
            color:      '#4fc8e8',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,180,232,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,180,232,0.08)'; }}
        >
          {IC.plus} New Chat
        </button>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5 scrollbar-thin">
          {chats.length === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: 'rgba(200,216,240,0.22)' }}>
              No chats yet. Start one!
            </p>
          )}
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => { onSelect(chat.id); onClose(); }}
              className="group flex items-center gap-2 px-2.5 py-2 rounded-lg
                         cursor-pointer text-[12.5px] transition-all duration-150"
              style={chat.id === activeChatId
                ? { background: 'rgba(79,180,232,0.1)', color: '#4fc8e8', border: '1px solid rgba(79,180,232,0.15)' }
                : { color: 'rgba(200,216,240,0.48)', border: '1px solid transparent' }
              }
              onMouseEnter={e => {
                if (chat.id !== activeChatId) {
                  e.currentTarget.style.background = 'rgba(79,180,232,0.06)';
                  e.currentTarget.style.color      = 'rgba(200,216,240,0.85)';
                }
              }}
              onMouseLeave={e => {
                if (chat.id !== activeChatId) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color      = 'rgba(200,216,240,0.48)';
                }
              }}
            >
              <span className="flex-1 truncate">{chat.title}</span>
              <button
                onClick={e => { e.stopPropagation(); onDelete(chat.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all"
                style={{ color: 'rgba(200,216,240,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,216,240,0.3)'; }}
                title="Delete"
              >{IC.trash}</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── System Prompt Modal ─────────────────────────────────────── */
function PromptModal({ value, onChange, onClose }) {
  const [local, setLocal] = useState(value);
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5
                 animate-[fadeUp_0.15s_ease]"
      style={{ background: 'rgba(4,6,15,0.82)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] flex flex-col gap-3.5 rounded-[18px] p-7 shadow-2xl"
        style={{
          background:     'rgba(8,13,34,0.97)',
          border:         '1px solid rgba(79,180,232,0.14)',
          backdropFilter: 'blur(16px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold tracking-tight font-heading"
              style={{ color: '#e8f2ff' }}>System Prompt</h3>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'rgba(200,216,240,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,180,232,0.1)'; e.currentTarget.style.color = '#4fc8e8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent';           e.currentTarget.style.color = 'rgba(200,216,240,0.4)'; }}
            onClick={onClose}
          >{IC.close}</button>
        </div>

        <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(200,216,240,0.5)' }}>
          Give the AI custom instructions that guide all its replies in this chat.
        </p>

        <TextareaAutosize
          className="w-full rounded-lg px-3.5 py-3 text-[13.5px] leading-relaxed
                     outline-none font-sans resize-none scrollbar-thin"
          style={{
            background: 'rgba(10,18,44,0.8)',
            border:     '1px solid rgba(79,180,232,0.15)',
            color:      'rgba(200,216,240,0.9)',
          }}
          minRows={5}
          maxRows={12}
          value={local}
          onChange={e => setLocal(e.target.value)}
          placeholder="e.g. You are a senior software engineer. Always explain trade‑offs before suggesting code…"
          autoFocus
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(79,180,232,0.4)'; }}
          onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(79,180,232,0.15)'; }}
        />

        <div className="flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={{ color: 'rgba(200,216,240,0.5)', border: '1px solid rgba(79,180,232,0.12)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(200,216,240,0.9)'; e.currentTarget.style.background = 'rgba(79,180,232,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,216,240,0.5)'; e.currentTarget.style.background = 'transparent'; }}
          >Cancel</button>
          <button
            onClick={() => { onChange(local); onClose(); }}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #1a4090, #4fc8e8)', color: '#04060f' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >Save Prompt</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Rate Limit Badge ────────────────────────────────────────── */
function RateLimitBadge({ rateLimit }) {
  if (!rateLimit) return null;

  const remaining = parseInt(rateLimit.remainingRequests, 10);
  const limit     = parseInt(rateLimit.limitRequests, 10);
  const pct       = (!isNaN(remaining) && !isNaN(limit) && limit > 0)
    ? Math.round((remaining / limit) * 100) : null;

  const color = pct === null     ? 'rgba(200,216,240,0.4)'
    : pct > 40                   ? '#4ade80'
    : pct > 15                   ? '#facc15'
    :                              '#f87171';

  return (
    <div
      title={`${remaining ?? '?'} requests left today  (${limit ?? '?'} daily limit)`}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]
                 cursor-default select-none"
      style={{
        background:     'rgba(10,18,40,0.7)',
        border:         '1px solid rgba(79,180,232,0.1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-[pulseDot_2s_ease-in-out_infinite]"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="font-semibold tabular-nums" style={{ color }}>
        {remaining ?? '?'}
      </span>
      <span style={{ color: 'rgba(200,216,240,0.28)' }}>/ {limit ?? '?'} req/day</span>
    </div>
  );
}

/* ─── App ─────────────────────────────────────────────────────── */
export default function App() {
  const [chats,        setChats]        = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [historyOpen,  setHistoryOpen]  = useState(false);
  const [promptOpen,   setPromptOpen]   = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [rateLimit,    setRateLimit]    = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  /* ── Data loaders ── */
  const loadChats = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/chats`);
      const data = await res.json();
      setChats(data);
    } catch {}
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);

  const loadRateLimit = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/rate-limit`);
      const data = await res.json();
      if (data.available) setRateLimit(data);
    } catch {}
  }, []);

  useEffect(() => { loadRateLimit(); }, [loadRateLimit]);

  const loadChat = useCallback(async (id) => {
    try {
      const res  = await fetch(`${API}/api/chats/${id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setActiveChatId(id);
    } catch {}
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Handlers ── */
  const handleNew = () => { setActiveChatId(null); setMessages([]); setError(""); };

  const handleDelete = async (id) => {
    await fetch(`${API}/api/chats/${id}`, { method: "DELETE" });
    if (id === activeChatId) handleNew();
    loadChats();
  };

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput(""); setError("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res  = await fetch(`${API}/api/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text, chatId: activeChatId, systemPrompt: systemPrompt || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      if (data.rateLimit) setRateLimit(data.rateLimit);
      if (!activeChatId) { setActiveChatId(data.chatId); loadChats(); }
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKey    = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const quickPrompt  = (prefix) => { setInput(prefix); setTimeout(() => inputRef.current?.focus(), 0); };

  const hasChat = messages.length > 0 || loading;
  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#04060f' }}>

      {/* Starfield */}
      <Starfield />

      {/* ── Sidebar ── */}
      <nav
        className="w-[52px] shrink-0 flex flex-col items-center py-3.5 gap-1 z-50"
        style={{
          background:     'rgba(8,12,28,0.85)',
          backdropFilter: 'blur(12px)',
          borderRight:    '1px solid rgba(79,180,232,0.08)',
        }}
      >
        <div className="mb-4"><NeptuneLogo /></div>

        {[
          { icon: IC.chat,    title: "Home",         onClick: handleNew,                  active: !hasChat       },
          { icon: IC.history, title: "Chat History", onClick: () => setHistoryOpen(v=>!v), active: historyOpen   },
          { icon: IC.prompt,  title: "System Prompt",onClick: () => setPromptOpen(true),  active: !!systemPrompt },
        ].map(({ icon, title, onClick, active }) => (
          <button
            key={title}
            title={title}
            onClick={onClick}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-150"
            style={active
              ? { background: 'rgba(79,180,232,0.12)', color: '#4fc8e8' }
              : { color: 'rgba(200,216,240,0.38)' }
            }
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(79,180,232,0.08)'; e.currentTarget.style.color = '#4fc8e8'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent';           e.currentTarget.style.color = 'rgba(200,216,240,0.38)'; } }}
          >{icon}</button>
        ))}

        <div className="flex-1" />
      </nav>

      {/* ── History Panel ── */}
      <HistoryPanel
        chats={chats}
        activeChatId={activeChatId}
        onSelect={loadChat}
        onNew={handleNew}
        onDelete={handleDelete}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* Topbar */}
        <div
          className="flex items-center justify-between px-5 py-2.5 shrink-0"
          style={{
            background:     'rgba(4,6,15,0.72)',
            backdropFilter: 'blur(10px)',
            borderBottom:   '1px solid rgba(79,180,232,0.07)',
          }}
        >
          <RateLimitBadge rateLimit={rateLimit} />

          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px]"
            style={{
              background:     'rgba(10,18,40,0.7)',
              border:         '1px solid rgba(79,180,232,0.14)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            <div
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center
                         text-[11px] font-bold shrink-0"
              style={{
                background: 'radial-gradient(ellipse at 30% 25%, #3a90d8, #1a4a90 60%, #070f30)',
                color:      '#e8f2ff',
                border:     '1px solid rgba(79,180,232,0.3)',
              }}
            >N</div>
            <span style={{ color: '#e8f2ff' }}>Neptune AI</span>
          </div>
        </div>

        {/* ── Scroll Area ── */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col scrollbar-thin">

          {/* Home Screen */}
          {!hasChat && (
            <div className="flex-1 flex flex-col items-center animate-[fadeUp_0.35s_ease]">
              {/* Planet */}
              <div className="flex justify-center pt-8 pb-1">
                <NeptunePlanet />
              </div>

              {/* Greeting + Cards */}
              <div className="w-full max-w-[820px] px-8 flex flex-col gap-5 z-[1] flex-1 pb-8">
                <div className="flex flex-col gap-1.5">
                  <h1
                    className="font-heading font-bold tracking-tight leading-tight"
                    style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: '#e8f2ff' }}
                  >
                    Hey! Friend 👋
                  </h1>
                  <p style={{ fontSize: '16px', fontWeight: 300, color: 'rgba(200,216,240,0.5)' }}>
                    What can I help with?
                  </p>
                </div>
                <FeatureCards onPrompt={quickPrompt} onOpenPromptModal={() => setPromptOpen(true)} />
              </div>
            </div>
          )}

          {/* Chat View */}
          {hasChat && (
            <div className="flex-1 flex flex-col w-full max-w-[860px] mx-auto pt-4 pb-2
                            animate-[fadeUp_0.2s_ease]">
              {messages.map((m, i) => (
                <Message key={i} role={m.role} content={m.content} />
              ))}
              {loading && <TypingDots />}
              {error && (
                <div
                  className="mx-5 my-2 px-4 py-3 rounded-lg text-[13px]"
                  style={{
                    background: 'rgba(248,113,113,0.08)',
                    border:     '1px solid rgba(248,113,113,0.2)',
                    color:      '#f87171',
                  }}
                >⚠ {error}</div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="shrink-0 w-full max-w-[920px] self-center px-5 pb-5 relative">

          {/* Fade gradient */}
          <div
            className="absolute -top-14 left-0 right-0 h-14 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(4,6,15,0.98) 60%, transparent)' }}
          />

          {/* System prompt badge */}
          {systemPrompt && (
            <div className="flex items-center gap-2 text-[11.5px] mb-2 px-1"
                 style={{ color: '#4fc8e8' }}>
              ⚡ System prompt active
              <button
                onClick={() => setSystemPrompt("")}
                className="text-[11px] underline transition-colors"
                style={{ color: 'rgba(200,216,240,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,216,240,0.3)'; }}
              >clear</button>
            </div>
          )}

          {/* Input box */}
          <div
            className="flex items-end gap-2.5 rounded-[14px] px-4 py-3.5 min-h-[54px]
                       transition-all duration-200"
            style={{
              background:     'rgba(12,20,44,0.9)',
              backdropFilter: 'blur(12px)',
              border:         '1px solid rgba(79,180,232,0.18)',
            }}
            onFocusCapture={e => {
              e.currentTarget.style.borderColor = 'rgba(79,180,232,0.38)';
              e.currentTarget.style.boxShadow   = '0 0 60px rgba(20,60,160,0.25)';
            }}
            onBlurCapture={e => {
              e.currentTarget.style.borderColor = 'rgba(79,180,232,0.18)';
              e.currentTarget.style.boxShadow   = 'none';
            }}
          >
            {/* Sparkle */}
            <span className="shrink-0 mb-0.5 flex" style={{ color: '#4fc8e8', opacity: 0.55 }}>
              {IC.sparkle}
            </span>

            {/* Textarea */}
            <TextareaAutosize
              ref={inputRef}
              className="flex-1 min-w-0 bg-transparent border-0 outline-none
                         text-[14.5px] leading-snug font-sans resize-none
                         overflow-y-auto scrollbar-thin"
              style={{ color: 'rgba(200,216,240,0.9)' }}
              minRows={1}
              maxRows={8}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything......"
              disabled={loading}
            />

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              title="Send (Enter)"
              className="w-10 h-10 rounded-[9px] flex items-center justify-center
                         shrink-0 transition-all duration-150"
              style={canSend
                ? {
                    background: 'linear-gradient(135deg, #1a4090, #4fc8e8)',
                    color:      '#04060f',
                    boxShadow:  '0 4px 20px rgba(79,200,232,0.25)',
                  }
                : {
                    background: 'rgba(26,64,144,0.25)',
                    color:      'rgba(79,200,232,0.28)',
                    cursor:     'not-allowed',
                  }
              }
              onMouseEnter={e => { if (canSend) { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.06)'; } }}
              onMouseLeave={e => { if (canSend) { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'scale(1)'; } }}
            >{IC.send}</button>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-center mt-2"
             style={{ color: 'rgba(200,216,240,0.18)' }}>
            GPT‑4o · GitHub Models · Press Enter to send
          </p>
        </div>
      </div>

      {/* Prompt modal */}
      {promptOpen && (
        <PromptModal
          value={systemPrompt}
          onChange={setSystemPrompt}
          onClose={() => setPromptOpen(false)}
        />
      )}
    </div>
  );
}
