'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { getMyTeams } from '@/lib/api';
import { getActiveTeamId, getUser, logout, setActiveTeamId } from '@/lib/auth';
import SiteFooter from './SiteFooter';

// Rutas que viven dentro del panel autenticado y por tanto llevan el app-shell
// (header fijo + drawer). El resto (landing, login, legales, invitaciones) se
// renderiza tal cual, sin navegación lateral.
const APP_PREFIXES = ['/app', '/invoices', '/reports', '/teams', '/settings'];

function isAppRoute(pathname: string) {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Facturas', icon: FileText },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/teams', label: 'Equipos', icon: Users },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showShell = isAppRoute(pathname);

  const [teams, setTeams] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false); // drawer móvil

  useEffect(() => {
    if (!showShell) return;
    setUser(getUser());
    (async () => {
      try {
        const { owned, memberOf } = await getMyTeams();
        const merged = [...owned, ...memberOf.filter((m: any) => !owned.find((o: any) => o.id === m.id))];
        setTeams(merged);
        const saved = getActiveTeamId();
        const pick = merged.find((t: any) => t.id === saved) || merged[0];
        if (pick) {
          setActiveId(pick.id);
          setActiveTeamId(pick.id);
          setIsOwner(pick.owner?.id === getUser()?.id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [showShell]);

  // Cierra el drawer móvil al navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!showShell) {
    return (
      <>
        <div className="flex-1 flex flex-col">{children}</div>
        <SiteFooter />
      </>
    );
  }

  const changeTeam = (id: number) => {
    setActiveTeamId(id);
    if (typeof window !== 'undefined') window.location.reload();
  };

  const navLinks = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-ink-900 text-paper'
                : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
            }`}
          >
            <Icon size={18} className={active ? 'text-paper' : 'text-ink-500'} />
            {item.label}
          </Link>
        );
      })}

      {isOwner && (
        <Link
          href="/invoices/new"
          className="mt-3 flex items-center gap-2 justify-center rounded-full px-3 py-2.5 text-sm font-medium text-[#f5f1e8] bg-ink-950 hover:bg-ink-800 transition-colors"
        >
          <Plus size={18} />
          Nueva Factura
        </Link>
      )}
    </nav>
  );

  const drawerBody = (
    <div className="flex flex-col h-full">
      {navLinks}
      <div className="px-3 py-4 border-t border-ink-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut size={18} className="text-ink-500" />
          Salir
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header fijo */}
      <header className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 md:px-6 bg-paper/90 backdrop-blur border-b border-ink-200">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-700 hover:bg-ink-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        <Link href="/app" className="flex items-center gap-2 group">
          <span className="font-serif-display text-xl font-semibold tracking-tight text-ink-900">
            Invoice<span style={{ color: 'var(--stamp)' }}>.</span>
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-ink-500 pl-2 border-l border-ink-300">
            Generator
          </span>
        </Link>

        <div className="flex-1 flex justify-center">
          <a
            href="https://www.corpsc.com/es"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium text-ink-700 border border-ink-200 hover:border-ink-300 hover:text-ink-900 transition-colors"
          >
            Conoce CorpSC
            <span aria-hidden>↗</span>
          </a>
        </div>

        {teams.length > 0 && (
          <select
            value={activeId || ''}
            onChange={(e) => changeTeam(Number(e.target.value))}
            className="px-3 py-2 text-sm font-medium bg-paper border border-ink-200 rounded-xl text-ink-900 shadow-card hover:border-ink-300 focus:outline-none focus:border-ink-900 transition-colors cursor-pointer max-w-[40vw] truncate"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {user?.email && (
          <span className="text-xs text-ink-500 hidden md:inline max-w-[180px] truncate">{user.email}</span>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar persistente (desktop) */}
        <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-ink-200 bg-paper sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {drawerBody}
        </aside>

        {/* Drawer overlay (móvil) */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-ink-900/40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <aside className="absolute top-0 left-0 h-full w-64 bg-paper border-r border-ink-200 shadow-xl flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-ink-200">
                <span className="font-serif-display text-lg font-semibold tracking-tight text-ink-900">
                  Invoice<span style={{ color: 'var(--stamp)' }}>.</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-ink-500 ml-1.5 font-sans">Generator</span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-700 hover:bg-ink-100 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>
              {drawerBody}
            </aside>
          </div>
        )}

        {/* Contenido — sin footer de marketing dentro del panel */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
