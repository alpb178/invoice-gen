'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getMyTeams,
  createTeam,
  removeTeamMember,
  deleteTeam,
  inviteTeamMember,
  listTeamInvitations,
  cancelInvitation,
} from '@/lib/api';
import { getUser, setActiveTeamId, logout } from '@/lib/auth';
import { Invitation } from '@/types';

export default function TeamsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [owned, setOwned] = useState<any[]>([]);
  const [memberOf, setMemberOf] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingName, setCreatingName] = useState('');
  const [emailInputs, setEmailInputs] = useState<Record<number, string>>({});
  const [invitations, setInvitations] = useState<Record<number, Invitation[]>>({});
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const load = async () => {
    try {
      const { owned, memberOf } = await getMyTeams();
      setOwned(owned);
      setMemberOf(memberOf);
      const inv: Record<number, Invitation[]> = {};
      await Promise.all(
        owned.map(async (t: any) => {
          try {
            inv[t.id] = await listTeamInvitations(t.id);
          } catch {
            inv[t.id] = [];
          }
        }),
      );
      setInvitations(inv);
    } catch (e: any) {
      setFlash({ type: 'err', text: e.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!creatingName.trim()) return;
    try {
      const team = await createTeam({ name: creatingName.trim() });
      setActiveTeamId(team.id);
      setCreatingName('');
      await load();
    } catch (e: any) {
      setFlash({ type: 'err', text: e.message });
    }
  };

  const handleInvite = async (teamId: number) => {
    const raw = (emailInputs[teamId] || '').trim();
    if (!raw || !raw.includes('@')) {
      setFlash({ type: 'err', text: 'Ingresa un email válido' });
      return;
    }
    try {
      const inv = await inviteTeamMember(teamId, raw);
      setEmailInputs((prev) => ({ ...prev, [teamId]: '' }));
      let text = 'Invitación creada. Copia el enlace para compartir.';
      if (inv.acceptUrl) {
        try {
          await navigator.clipboard.writeText(inv.acceptUrl);
          text = 'Invitación creada. Enlace copiado al portapapeles.';
        } catch {}
      }
      setFlash({ type: 'ok', text });
      await load();
    } catch (e: any) {
      setFlash({ type: 'err', text: e.message });
    }
  };

  const handleCopy = async (url?: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setFlash({ type: 'ok', text: 'Enlace copiado al portapapeles' });
    } catch {
      setFlash({ type: 'err', text: 'No se pudo copiar' });
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('¿Cancelar esta invitación?')) return;
    try {
      await cancelInvitation(id);
      await load();
    } catch (e: any) {
      setFlash({ type: 'err', text: e.message });
    }
  };

  const handleRemove = async (teamId: number, userId: number) => {
    if (!confirm('¿Quitar a este miembro?')) return;
    try {
      await removeTeamMember(teamId, userId);
      await load();
    } catch (e: any) {
      setFlash({ type: 'err', text: e.message });
    }
  };

  const handleDelete = async (teamId: number) => {
    if (!confirm('¿Eliminar este equipo? Se perderán sus facturas.')) return;
    try {
      await deleteTeam(teamId);
      await load();
    } catch (e: any) {
      setFlash({ type: 'err', text: e.message });
    }
  };

  const selectActive = (teamId: number) => {
    setActiveTeamId(teamId);
    router.push('/');
  };

  const inputClass =
    'flex-1 px-3 py-2 bg-paper border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:border-ink-900';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <Link href="/" className="text-ink-500 hover:text-ink-900 text-sm mb-1 inline-block">
            ← Facturas
          </Link>
          <h1 className="text-2xl font-bold text-ink-900">Equipos</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-500 hidden sm:inline">{user?.email}</span>
          <Link
            href="/settings"
            className="px-3 py-2 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-xl text-ink-900 transition-colors"
          >
            Configuración
          </Link>
          <button
            onClick={logout}
            className="px-3 py-2 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-xl text-ink-900 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {flash && (
        <div
          className={`mb-4 text-sm rounded-lg px-3 py-2 border ${
            flash.type === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {flash.text}
        </div>
      )}

      <div className="bg-paper border border-ink-200 rounded-2xl p-5 mb-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Crear un nuevo equipo</h2>
        <div className="flex gap-2">
          <input
            value={creatingName}
            onChange={(e) => setCreatingName(e.target.value)}
            placeholder="Nombre del equipo"
            className="flex-1 px-3 py-2.5 bg-paper border border-ink-200 rounded-xl text-sm text-ink-900 focus:outline-none focus:border-ink-900"
          />
          <button
            onClick={handleCreate}
            className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-paper font-semibold rounded-xl text-sm transition-colors"
          >
            Crear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-ink-500">Cargando...</div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide mb-3">
            Equipos que soy dueño
          </h2>
          {owned.length === 0 ? (
            <p className="text-ink-500 text-sm mb-6">No eres dueño de ningún equipo.</p>
          ) : (
            <div className="space-y-4 mb-8">
              {owned.map((team) => {
                const pending = (invitations[team.id] || []).filter((i) => i.status === 'pending');
                return (
                  <div key={team.id} className="bg-paper border border-ink-200 rounded-2xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-ink-900">{team.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-900 text-paper uppercase tracking-wide">
                            dueño
                          </span>
                        </div>
                        {team.companyName && <p className="text-xs text-ink-500 mt-0.5">{team.companyName}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectActive(team.id)}
                          className="px-3 py-1.5 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors"
                        >
                          Usar
                        </button>
                        <button
                          onClick={() => handleDelete(team.id)}
                          className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">
                        Miembros ({team.members?.length || 0})
                      </h4>
                      {!team.members?.length ? (
                        <p className="text-xs text-ink-500">Aún no hay miembros.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {team.members.map((m: any) => (
                            <li
                              key={m.id}
                              className="flex items-center justify-between text-sm text-ink-900 bg-ink-50 border border-ink-200 rounded-lg px-3 py-2"
                            >
                              <span>
                                <span className="font-medium">{m.username}</span>
                                <span className="text-ink-500 ml-2 text-xs">{m.email}</span>
                              </span>
                              <button
                                onClick={() => handleRemove(team.id, m.id)}
                                className="text-red-600 hover:text-red-700 text-xs"
                              >
                                Quitar
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">
                        Invitar a un miembro por email
                      </h4>
                      <div className="flex gap-2">
                        <input
                          value={emailInputs[team.id] || ''}
                          onChange={(e) =>
                            setEmailInputs((prev) => ({ ...prev, [team.id]: e.target.value }))
                          }
                          placeholder="usuario@ejemplo.com"
                          className={inputClass}
                          type="email"
                        />
                        <button
                          onClick={() => handleInvite(team.id)}
                          className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-paper text-sm font-medium rounded-lg transition-colors"
                        >
                          Invitar
                        </button>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-1.5">
                        Se enviará un email con un enlace. Si tu Strapi no tiene SMTP, puedes copiar el enlace y compartirlo.
                      </p>
                    </div>

                    {pending.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">
                          Invitaciones pendientes ({pending.length})
                        </h4>
                        <ul className="space-y-1.5">
                          {pending.map((inv) => (
                            <li
                              key={inv.id}
                              className="flex items-center justify-between text-sm text-ink-900 bg-paper border border-ink-200 rounded-lg px-3 py-2"
                            >
                              <span className="truncate">
                                <span className="font-medium">{inv.email}</span>
                                <span className="text-ink-500 ml-2 text-xs">pendiente</span>
                              </span>
                              <span className="flex gap-2">
                                <button
                                  onClick={() => handleCopy(inv.acceptUrl)}
                                  className="text-ink-900 hover:underline text-xs"
                                >
                                  Copiar enlace
                                </button>
                                <button
                                  onClick={() => handleCancel(inv.id)}
                                  className="text-red-600 hover:text-red-700 text-xs"
                                >
                                  Cancelar
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="text-sm font-semibold text-ink-700 uppercase tracking-wide mb-3">
            Equipos de los que soy miembro
          </h2>
          {memberOf.length === 0 ? (
            <p className="text-ink-500 text-sm">No perteneces a ningún otro equipo.</p>
          ) : (
            <div className="space-y-3">
              {memberOf.map((team) => (
                <div
                  key={team.id}
                  className="bg-paper border border-ink-200 rounded-2xl p-4 flex items-center justify-between shadow-card"
                >
                  <div>
                    <h3 className="font-semibold text-ink-900">{team.name}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">Dueño: {team.owner?.username || '—'}</p>
                  </div>
                  <button
                    onClick={() => selectActive(team.id)}
                    className="px-3 py-1.5 text-xs bg-paper hover:bg-ink-100 border border-ink-200 rounded-lg text-ink-900 transition-colors"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
