'use client';

import { useEffect, useState } from 'react';
import { getMyTeams } from '@/lib/api';
import { getActiveTeamId, getUser, setActiveTeamId } from '@/lib/auth';

interface Props {
  onChange?: (teamId: number | null, isOwner: boolean) => void;
}

export default function TeamSwitcher({ onChange }: Props) {
  const [teams, setTeams] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { owned, memberOf } = await getMyTeams();
        const merged = [...owned, ...memberOf.filter((m) => !owned.find((o: any) => o.id === m.id))];
        setTeams(merged);
        const current = getActiveTeamId();
        const pick = merged.find((t) => t.id === current) || merged[0];
        if (pick) {
          setActiveId(pick.id);
          setActiveTeamId(pick.id);
          const user = getUser();
          onChange?.(pick.id, pick.owner?.id === user?.id);
        } else {
          onChange?.(null, false);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleChange = (id: number) => {
    setActiveId(id);
    setActiveTeamId(id);
    const team = teams.find((t) => t.id === id);
    const user = getUser();
    onChange?.(id, team?.owner?.id === user?.id);
    if (typeof window !== 'undefined') window.location.reload();
  };

  if (teams.length === 0) return null;

  return (
    <select
      value={activeId || ''}
      onChange={(e) => handleChange(Number(e.target.value))}
      className="px-3 py-2 text-sm bg-paper border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:border-ink-900"
    >
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
