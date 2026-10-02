import React from "react";

export default function AuthShell({ eyebrow, title, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-parchment">
      <div className="relative hidden lg:flex flex-col justify-between bg-navy-900 text-parchment p-12 overflow-hidden">
        <div className="absolute inset-0 bg-ledger opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="h-9 w-9 rounded-md bg-gold-500 flex items-center justify-center font-display font-bold text-navy-900">S</div>
            <span className="font-display text-xl">SmartBank</span>
          </div>
          <p className="font-display italic text-2xl text-gold-300 mb-4">Passbook №1</p>
          <h2 className="font-display text-4xl leading-tight max-w-md">
            Every rupee, traced through a ledger you can actually read.
          </h2>
          <p className="mt-6 text-navy-200 max-w-sm leading-relaxed">
            Open an account, transfer funds, apply for loans, and get support — all in one secure place built for modern banking.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6 text-xs font-mono text-navy-200 tracking-wide">
          <span>SECURE</span>
          <span>·</span>
          <span>INSTANT</span>
          <span>·</span>
          <span>TRUSTED</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-9 w-9 rounded-md bg-maroon-600 flex items-center justify-center font-display font-bold text-parchment">S</div>
            <span className="font-display text-xl text-navy-900">SmartBank</span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-maroon-600 font-semibold mb-2">{eyebrow}</p>
          <h1 className="font-display text-3xl text-navy-900 mb-8">{title}</h1>
          {children}
          {footer && <div className="mt-6 text-sm text-navy-600/80">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
