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
  ChevronDown,
} from 'lucide-react';
import { getMyTeams } from '@/lib/api';
import { getActiveTeamId, getUser, logout, setActiveTeamId } from '@/lib/auth';
import SiteFooter from './SiteFooter';
import { useToast } from './Toast';

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

const NEW_INVOICE_HREF = '/invoices/new';

function matches(pathname: string, href: string) {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Gana el href más específico: estando en /invoices/new se marca "Nueva
// Factura" y no también "Facturas".
function activeHref(pathname: string) {
  return [...NAV_ITEMS.map((i) => i.href), NEW_INVOICE_HREF]
    .filter((href) => matches(pathname, href))
    .sort((a, b) => b.length - a.length)[0];
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showShell = isAppRoute(pathname);

  const [teams, setTeams] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState<any>(null);
  const toast = useToast();
  // El menú vive colapsado como riel de iconos: se expande con hover/focus en
  // escritorio (solo CSS) y con el botón ☰ en táctil ("pinned").
  const [pinned, setPinned] = useState(false);
  // Al elegir una opción el riel se cierra al instante aunque el cursor siga
  // encima: se apaga la expansión por hover hasta que el mouse salga.
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
        toast.error(e);
      }
    })();
  }, [showShell]);

  // Al navegar, el riel vuelve a colapsarse.
  useEffect(() => {
    setPinned(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Escape también lo colapsa (y suelta el foco del ☰, que de otro modo
  // mantendría el riel expandido vía focus-within).
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPinned(false);
      (document.activeElement as HTMLElement | null)?.blur?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

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

  const expanded = pinned;
  const current = activeHref(pathname);
  const displayName = user?.email || 'Cuenta';
  const initials = displayName.slice(0, 2).toUpperCase();

  // La etiqueta entra con retardo (cuando el ancho ya avanzó) y se desvanece
  // sin retardo al colapsar.
  const labelCls = `whitespace-nowrap transition-opacity duration-200 ease-out group-hover:opacity-100 group-hover:delay-100 group-focus-within:opacity-100 group-focus-within:delay-100 ${
    expanded ? 'opacity-100' : 'opacity-0'
  }`;

  // Cierra el riel al elegir una opción (también si se navega a la página
  // actual, donde pathname no cambia).
  const collapseOnPick = (e: React.MouseEvent<HTMLElement>) => {
    setPinned(false);
    setHoverEnabled(false);
    e.currentTarget.blur();
  };

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Hueco del riel en el layout: el aside real es fijo y al expandirse se
          superpone al contenido sin empujarlo. */}
      <div className="w-16 shrink-0" aria-hidden />

      {/* Fondo oscurecido solo en modo fijado (táctil). */}
      <div
        aria-hidden
        onClick={() => setPinned(false)}
        className={`fixed inset-0 z-40 bg-ink-900/40 transition-opacity duration-300 ${
          expanded ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Expansión con curva "emphasized"; anima también la sombra para que no
          aparezca de golpe al final. */}
      <aside
        onMouseLeave={() => setHoverEnabled(true)}
        className={`group fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-ink-200 bg-paper transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          hoverEnabled ? 'hover:w-64 hover:shadow-xl focus-within:w-64' : ''
        } ${expanded ? 'w-64 shadow-xl' : 'w-16'}`}
      >
        {/* Cabecera del riel: ☰ fija el menú en táctil. */}
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-ink-200 px-3">
          <button
            type="button"
            onClick={() => setPinned((v) => !v)}
            aria-label={expanded ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={expanded}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            {expanded ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className={`${labelCls} text-[10px] uppercase tracking-[0.2em] text-ink-500`}>Menú</span>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const active = current === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={collapseOnPick}
                className={`flex h-10 items-center gap-3 rounded-xl px-2 transition-colors ${
                  active ? 'bg-ink-900 text-paper' : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  <Icon size={18} className={active ? 'text-paper' : 'text-ink-500'} />
                </span>
                <span className={`${labelCls} text-sm font-medium`}>{item.label}</span>
              </Link>
            );
          })}

          {isOwner && (
            <Link
              href={NEW_INVOICE_HREF}
              title="Nueva Factura"
              onClick={collapseOnPick}
              className={`mt-3 flex h-10 items-center gap-3 rounded-xl px-2 transition-colors ${
                current === NEW_INVOICE_HREF
                  ? 'bg-ink-900 text-paper'
                  : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                <Plus
                  size={18}
                  style={current === NEW_INVOICE_HREF ? undefined : { color: 'var(--stamp)' }}
                />
              </span>
              <span className={`${labelCls} text-sm font-medium`}>Nueva Factura</span>
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header fijo */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 md:px-6 bg-paper/90 backdrop-blur border-b border-ink-200">
          <Link href="/app" className="flex items-center gap-2 shrink-0">
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

          {/* Avatar: al hacer click se abre el menú de sesión. */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-paper">
                {initials}
              </span>
              <ChevronDown size={16} className="text-ink-500" />
            </button>

            {userMenuOpen && (
              <>
                {/* Click fuera cierra el menú. */}
                <div aria-hidden className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-paper shadow-xl"
                >
                  <div className="border-b border-ink-200 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink-500">Sesión</p>
                    <p className="truncate text-sm font-medium text-ink-900">{displayName}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-rose-700 transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Contenido — sin footer de marketing dentro del panel */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
