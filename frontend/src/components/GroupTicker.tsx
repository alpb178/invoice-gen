import { GROUP_SITES, groupSiteUrl, siteDomain } from '@/lib/group-sites';

// Cintillo del Grupo CorpSC: franja fina en lo alto de la página con los
// sitios hermanos desplazándose en bucle. Usa la paleta de la matriz (azul
// marino de CorpSC) y no la de Invoices a propósito: es la misma franja en los
// cuatro sitios del grupo, así se lee como "barra del grupo" y no como parte
// del header de la app.
//
// La pista lleva la lista duplicada y se desplaza -50%: al terminar la primera
// copia, la segunda está exactamente donde empezó la primera, así el bucle no
// tiene salto. La copia duplicada va oculta para lectores de pantalla y fuera
// del orden de tabulación.
export default function GroupTicker() {
  return (
    <aside className="gt" aria-label="Sitios de interés">
      <div className="gt-viewport">
        <div className="gt-track">
          <TickerRow />
          <TickerRow duplicate />
        </div>
      </div>

      <style>{CSS}</style>
    </aside>
  );
}

function TickerRow({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="gt-row" aria-hidden={duplicate || undefined}>
      {GROUP_SITES.map((site) => (
        <li key={site.slug}>
          <a
            href={groupSiteUrl(site.url)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={duplicate ? -1 : undefined}
            className="gt-link"
          >
            <span
              className="gt-dot"
              style={{ backgroundColor: site.accent }}
              aria-hidden="true"
            />
            <span className="gt-name">{site.name}</span>
            <span className="gt-url">{siteDomain(site.url)}</span>
            <span className="gt-desc">{site.tagline}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

// Estilos propios en vez de utilidades de Tailwind: la animación y la máscara
// del cintillo son idénticas en los cuatro sitios del grupo, y así el bloque se
// copia entre repos sin depender de la config de Tailwind de cada uno.
const CSS = `
.gt {
  display: flex;
  flex: none;
  align-items: center;
  height: 38px;
  overflow: hidden;
  background: #06132e;
  /* El header de CorpSC es del mismo azul marino: sin esta línea la franja se
     fundiría con él. */
  border-bottom: 1px solid rgba(127, 176, 255, 0.22);
  color: #dfe7f5;
  font-size: 0.8125rem;
  line-height: 1;
}
.gt-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
}
.gt-track {
  display: flex;
  width: max-content;
  animation: gt-scroll 38s linear infinite;
}
/* Se detiene al pasar el mouse o al llegar con el teclado, para poder leer y
   hacer clic sin perseguir el enlace. */
.gt:hover .gt-track,
.gt-track:focus-within {
  animation-play-state: paused;
}
.gt-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-right: 2rem;
  margin: 0;
  list-style: none;
}
.gt-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  color: inherit;
  text-decoration: none;
}
.gt-link:hover .gt-name { text-decoration: underline; }
.gt-link:focus-visible {
  outline: 2px solid #7fb0ff;
  outline-offset: 3px;
  border-radius: 2px;
}
.gt-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
}
.gt-name { font-weight: 600; }
.gt-url { color: #93a4c4; }
.gt-desc { color: #7387aa; }
/* Separador entre el enlace y su descripción; decorativo, por eso va en CSS. */
.gt-desc::before {
  content: "·";
  margin-right: 0.5rem;
  color: #43587d;
}
@keyframes gt-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
/* Sin movimiento: la franja queda quieta y se puede arrastrar en horizontal. */
@media (prefers-reduced-motion: reduce) {
  .gt-track { animation: none; }
  .gt-viewport { overflow-x: auto; }
}
`;
