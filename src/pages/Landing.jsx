import React from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_EMAIL } from '../utils/constants'

export default function Landing() {
  return (
    <div className="min-h-full bg-secondary text-ink">
      <header className="bg-secondary">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-bold font-serif text-ink">BookMate</Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-[#6b5744]">
            <Link to="/login" className="hover:text-ink">Login</Link>
            <Link to="/register" className="hover:text-ink">Register</Link>
            {/* <Link to="/app" className="rounded-full bg-primary px-4 py-2 text-white hover:bg-blue-700">Open App</Link> */}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-[#e8ddd0] bg-[#fdf4e7] px-4 py-2 text-sm font-medium text-primary">
              Community book sharing, simplified
            </div>
            <div className="space-y-4">
              <h2 className="max-w-2xl text-5xl font-black tracking-tight text-ink sm:text-6xl">
                One place to lend, borrow, and track every book you care about.
              </h2>
              <p className="max-w-2xl text-lg text-[#6b5744]">
                BookMate connects readers nearby so you can share books, manage requests, and discover what to read next without the clutter.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="rounded-full bg-primary px-5 py-3 font-medium text-white shadow-soft hover:bg-[#7a3010]">
                Get started
              </Link>
              <Link to="/login" className="rounded-full border border-[#d6c3b0] px-5 py-3 font-medium text-[#6b5744] hover:bg-[#fdf4e7]">
                Sign in
              </Link>
              <Link to="/app" className="rounded-full border border-[#d6c3b0] px-4 py-2 text-primary transition hover:bg-[#f3e4d5]">Dashboard</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-soft border border-[#efe0cf]">
                <p className="text-2xl font-bold text-ink">120+</p>
                <p className="text-sm text-[#6b5744]">books shared</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-soft border border-[#efe0cf]">
                <p className="text-2xl font-bold text-ink">48</p>
                <p className="text-sm text-[#6b5744]">active readers</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-soft border border-[#efe0cf]">
                <p className="text-2xl font-bold text-ink">9</p>
                <p className="text-sm text-[#6b5744]">open requests</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1008] via-[#3a2517] to-[#7a3010] p-8 text-white shadow-[0_30px_80px_rgba(26,16,8,0.25)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(26,16,8,0.72),rgba(26,16,8,0.72)),repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.12)_6px,rgba(255,255,255,0.02)_6px,rgba(255,255,255,0.02)_34px),repeating-linear-gradient(180deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_48px,transparent_48px,transparent_56px)]" />
            <div className="relative space-y-6">
              <p className="text-sm uppercase tracking-[0.2em] text-[#f3e4d5]/80">Book collections</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-[#f3e4d5]">Currently lending</p>
                  <p className="mt-2 text-2xl font-bold">24 books</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-[#f3e4d5]">Pending requests</p>
                  <p className="mt-2 text-2xl font-bold">6 requests</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-[#f3e4d5]">Next step</p>
                <p className="mt-2 text-lg font-semibold">Create your account to unlock the dashboard, marketplace, and request tracking.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-[#efe0cf]">
            <h3 className="mb-2 text-lg font-semibold text-ink">How it works</h3>
            <p className="text-sm leading-6 text-[#6b5744]">Share books you own and borrow from people nearby without the usual friction.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-[#efe0cf]">
            <h3 className="mb-2 text-lg font-semibold text-ink">Featured books</h3>
            <p className="text-sm leading-6 text-[#6b5744]">Browse curated picks from the community and jump into the marketplace.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-[#efe0cf]">
            <h3 className="mb-2 text-lg font-semibold text-ink">Track activity</h3>
            <p className="text-sm leading-6 text-[#6b5744]">See requests, lent items, and profile details once you sign in.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#efe0cf]">
        <div className="container mx-auto px-6 py-8 text-sm text-[#6b5744]">
          Contact us:{' '}
          <a href={`mailto:${ADMIN_EMAIL}`} className="font-medium text-primary hover:underline">
            {ADMIN_EMAIL}
          </a>
        </div>
      </footer>
    </div>
  )
}
