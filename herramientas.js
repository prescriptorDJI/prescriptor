/* =====================================================================
   Prescriptor · Herramientas de valor agregado
   Botón «Herramientas» en la barra superior con:
     1. Puntos de inspección en terreno (vigor bajo + referencia), KML / GPX / CSV / Google Maps / hoja imprimible
     2. Comparar vuelos (dos GeoTIFF del índice de fechas distintas): mapa de cambio y % de área
     3. Cuaderno de campo: registro de aplicaciones, CSV para Excel y certificado de aplicación
     4. Cotizador: cotización imprimible con logo, IVA y número correlativo
     5. Clima para aplicar (Open-Meteo): condiciones actuales, 48 h hora a hora y semáforo de aplicación
   Todo funciona en el navegador, sin servidor. Lo que se guarda queda en este navegador.
   ===================================================================== */
(() => {
  if (window.__prescHerr) return;
  window.__prescHerr = true;
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };
  const num = (v, d = 2) => Number.isFinite(v) ? v.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
  const clp = v => '$ ' + Math.round(v || 0).toLocaleString('es-CL');
  const hoyISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const fechaCL = iso => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return d + '-' + m + '-' + y; };
  const S = () => window.PrescriptorSimple || {};
  const aviso = (m, ms) => (S().aviso ? S().aviso(m, ms) : alert(m));
  const proyecto = () => (($('projName') && $('projName').value.trim()) || (($('filetag') || {}).textContent || '').trim().replace(/\.[^.]+$/, '').replace(/^—$/, ''));
  const indice = () => (window.PrescriptorIndice ? window.PrescriptorIndice.get() : 'NDVI');
  const logo = () => (window.PrescriptorLogo ? window.PrescriptorLogo() : '');
  function descargar(data, nombre, tipo) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: tipo || 'application/octet-stream' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); HTMLAnchorElement.prototype.click.call(a); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  // Documento imprimible en una ventana nueva (o descarga .html si el navegador bloquea la ventana)
  function documento(titulo, cuerpo, nombre) {
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap">
<style>
 :root{--ink:#1a1b23;--muted:#5e6e82;--line:#d5dde6;--accent:#1e6fe0}
 *{box-sizing:border-box} body{margin:0;font-family:Montserrat,"Segoe UI",system-ui,sans-serif;color:var(--ink);background:#eef1f5;font-size:13px;line-height:1.45}
 .bar{position:sticky;top:0;background:#1a1b23;padding:10px;text-align:center} .bar button{border:0;border-radius:999px;padding:9px 18px;font:inherit;font-weight:700;color:#fff;background:linear-gradient(90deg,#0f5fe0,#1e88ff);cursor:pointer}
 .page{max-width:900px;margin:18px auto;background:#fff;padding:32px 36px;border-radius:10px;box-shadow:0 8px 30px rgba(31,59,87,.12)}
 header{display:flex;align-items:center;gap:16px;border-bottom:3px solid var(--accent);padding-bottom:14px;margin-bottom:18px}
 header img{max-height:56px;max-width:220px} header .t{margin-left:auto;text-align:right} header h1{margin:0;font-size:20px} header small{color:var(--muted)}
 h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:22px 0 8px}
 table{width:100%;border-collapse:collapse} th,td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top} th{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
 td.n,th.n{text-align:right} .kv td:first-child{color:var(--muted);width:38%} .tot td{font-weight:700;border-top:2px solid var(--ink)}
 .muted{color:var(--muted)} .firma{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px} .firma div{border-top:1px solid var(--ink);padding-top:6px;text-align:center;color:var(--muted)}
 img.full{width:100%;border-radius:8px;border:1px solid var(--line)} .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px} .chip{display:inline-block;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:700;color:#fff}
 .nota{min-height:38px;border-bottom:1px dotted var(--line)}
 @media print{body{background:#fff}.bar{display:none}.page{box-shadow:none;margin:0;max-width:none;padding:0}.pb{break-before:page}}
</style></head><body><div class="bar"><button onclick="window.print()">Imprimir o guardar PDF</button></div><div class="page">
<header>${logo() ? `<img src="${logo()}" alt="Logo">` : ''}<div class="t"><h1>${esc(titulo)}</h1><small>${new Date().toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })}</small></div></header>
${cuerpo}</div></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    else { descargar(html, nombre + '.html', 'text/html'); aviso('El navegador bloqueó la ventana: se descargó ' + nombre + '.html.'); }
  }

  // ---------- Cuadros de la prescripción actual ----------
  async function cuadros() {
    const btn = $('geojsonBtn');
    if (!btn || !S().capturar) return null;
    const r = await S().capturar(btn, l => l.some(x => /geojson/i.test(x.name)), 8000);
    const f = r.find(x => /geojson/i.test(x.name));
    if (!f) return null;
    try { return JSON.parse(typeof f.data === 'string' ? f.data : await f.blob.text()); } catch (e) { return null; }
  }
  function resumen(fc) {
    let ha = 0, lt = 0;
    for (const f of fc.features) { const p = f.properties || {}; if (p.clase) { const a = (p.area_m2 || 0) / 1e4; ha += a; lt += a * (p.dosis_lha || 0); } }
    return { ha, litros: lt, dosisMedia: ha ? lt / ha : 0 };
  }

  // ---------- Diseño: «cabina de misión agrícola» ----------
  // Colores de la marca (sol naranja y hoja verde) sobre azul petróleo. Chakra Petch para lecturas, IBM Plex Sans para texto.
  if (!document.getElementById('hzFuentes')) {
    const f = document.createElement('link');
    f.id = 'hzFuentes'; f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(f);
  }
  const ICO = {
    puntos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4"/></svg>',
    comparar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/><path d="M6 15l2-3 2 2M16 11l2-2 1.5 1.5M16 16h3"/></svg>',
    cuaderno: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18M3.5 7H6M3.5 12H6M3.5 17H6"/><path d="M15.5 8.5c-3 0-4.5 2-4.5 5 2.7 0 4.5-1.6 4.5-5zM11 13.5l-1.5 2"/></svg>',
    cotizador: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2.5h14v19l-2.4-1.6-2.3 1.6-2.3-1.6-2.3 1.6-2.3-1.6L5 21.5z"/><path d="M14.4 8.2c-.5-.8-1.4-1.2-2.4-1.2-1.4 0-2.4.7-2.4 1.8 0 2.5 4.9 1.4 4.9 3.9 0 1.1-1.1 1.9-2.5 1.9-1.1 0-2-.5-2.5-1.3M12 5.6V7M12 13.6V15"/></svg>',
    clima: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="16.5" cy="7" r="3"/><path d="M16.5 1.5v1.2M21.6 7h1.2M20.2 3.3l.8-.8M20.2 10.7l.8.8"/><path d="M2 10h9.5a2.5 2.5 0 1 0-2.4-3.2M2 14h14a2.5 2.5 0 1 1-2.4 3.2M2 18h6"/></svg>',
  };
  const TOOLS = [
    { t: 'puntos', n: 'Puntos de inspección', d: 'Dónde revisar en terreno' },
    { t: 'comparar', n: 'Comparar vuelos', d: 'Evolución entre fechas' },
    { t: 'clima', n: 'Clima', d: 'Ventanas para aplicar' },
    { t: 'cuaderno', n: 'Cuaderno de campo', d: 'Registro y certificados' },
    { t: 'cotizador', n: 'Cotizador', d: 'Cotización del servicio' },
  ];
  const css = document.createElement('style');
  css.textContent = `
  .hz-open{display:inline-flex;align-items:center;gap:7px}
  .hz-open svg{width:17px;height:17px}
  .hz-dlg{--b0:#0F2028;--b1:#152B35;--b2:#1B3541;--ln:#2A4B58;--tx:#EAF2EF;--mu:#93AEB3;--sol:#F6A623;--hoja:#74BF56;--alerta:#E5583F;--ambar:#E8B931;
    --fd:'Chakra Petch','IBM Plex Sans',system-ui,sans-serif;--ft:'IBM Plex Sans','Segoe UI',system-ui,sans-serif;
    position:fixed;inset:0;z-index:5000;background:rgba(4,12,16,.62);backdrop-filter:blur(3px);display:grid;place-items:center;padding:16px;font-family:var(--ft)}
  .hz-dlg[hidden]{display:none}
  .hz-box{width:min(1180px,100%);height:min(880px,calc(100vh - 32px));background:var(--b0);color:var(--tx);border-radius:20px;border:1px solid var(--ln);
    box-shadow:0 30px 80px rgba(0,0,0,.5);display:grid;grid-template-columns:236px minmax(0,1fr);grid-template-rows:minmax(0,1fr);overflow:hidden;font-size:14.5px;line-height:1.5}
  .hz-rail{background:var(--b1);border-right:1px solid var(--ln);display:flex;flex-direction:column;padding:18px 12px 14px;gap:4px;
    background-image:repeating-linear-gradient(115deg,transparent 0 22px,rgba(116,191,86,.035) 22px 23px)}
  .hz-rail h2{font-family:var(--fd);font-weight:600;font-size:20px;letter-spacing:.02em;margin:0 8px 14px;color:var(--tx)}
  .hz-nav{display:grid;gap:4px}
  .hz-nav button{display:grid;grid-template-columns:38px 1fr;align-items:center;gap:2px 10px;text-align:left;border:1px solid transparent;background:transparent;
    color:var(--mu);font:inherit;padding:9px 10px;border-radius:12px;cursor:pointer}
  .hz-nav button svg{grid-row:span 2;width:38px;height:38px;padding:8px;border-radius:10px;background:var(--b2);color:var(--mu)}
  .hz-nav button b{font-weight:600;font-size:14px;color:var(--tx)} .hz-nav button small{font-size:12px}
  .hz-nav button:hover{background:rgba(255,255,255,.03)}
  .hz-nav button[aria-selected="true"]{background:var(--b2);border-color:var(--ln)}
  .hz-nav button[aria-selected="true"] svg{background:var(--sol);color:#2a1a00}
  .hz-nav button:focus-visible,.hz-dlg .btn:focus-visible,.hz-x:focus-visible{outline:2px solid var(--sol);outline-offset:2px}
  .hz-brand{margin-top:auto;padding:12px 8px 0;border-top:1px solid var(--ln)}
  .hz-brand img{max-width:150px;max-height:34px;display:block;opacity:.92}
  .hz-main{display:flex;flex-direction:column;min-width:0;min-height:0}
  .hz-rail{min-height:0;overflow-y:auto}
  .hz-head{display:flex;align-items:center;gap:14px;padding:18px 22px 14px;border-bottom:1px solid var(--ln)}
  .hz-head .ic{width:46px;height:46px;flex:none;padding:10px;border-radius:14px;background:linear-gradient(140deg,var(--sol),#e08a0b);color:#2a1a00}
  .hz-head .ic svg{width:100%;height:100%}
  .hz-head h3{margin:0;font-family:var(--fd);font-weight:600;font-size:24px;letter-spacing:.01em;line-height:1.1}
  .hz-head p{margin:2px 0 0;color:var(--mu);font-size:13.5px}
  .hz-x{margin-left:auto;align-self:flex-start;border:1px solid var(--ln);background:transparent;color:var(--mu);font-size:22px;line-height:1;width:38px;height:38px;border-radius:11px;cursor:pointer}
  .hz-x:hover{color:var(--tx);background:var(--b2)}
  .hz-body{flex:1;overflow:auto;padding:18px 22px 26px}
  .hz-body section[hidden]{display:none}
  .hz-body section>h3:first-child{display:none}
  .hz-body section>p.hint:first-of-type{display:none}
  .hz-body h3{font-family:var(--fd);font-weight:600;font-size:17px;margin:18px 0 8px;color:var(--tx)}
  .hz-dlg .hint{color:var(--mu)!important;font-size:13px!important;margin:0 0 12px}
  .hz-dlg a{color:var(--sol)}
  .hz-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px 14px;margin-bottom:14px}
  .hz-grid label{display:grid;gap:6px;font-size:12.5px;font-weight:500;color:var(--mu)}
  .hz-dlg input,.hz-dlg select,.hz-dlg textarea{font:inherit!important;font-size:14.5px!important;padding:9px 12px!important;border:1px solid var(--ln)!important;border-radius:10px!important;
    background:var(--b1)!important;color:var(--tx)!important;width:100%;box-shadow:none!important;color-scheme:dark}
  .hz-dlg input:focus,.hz-dlg select:focus{border-color:var(--sol)!important;outline:none;box-shadow:0 0 0 3px rgba(246,166,35,.18)!important}
  .hz-dlg input[type=checkbox]{width:18px;height:18px;padding:0!important;accent-color:var(--sol)}
  .hz-dlg input[type=file]{padding:7px!important}
  .hz-grid .wide{grid-column:1/-1}
  .hz-btns{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 14px;align-items:center}
  .hz-dlg .btn{font:600 13.5px/1.1 var(--ft)!important;text-transform:none!important;letter-spacing:0!important;padding:10px 16px!important;border-radius:10px!important;
    border:1px solid var(--ln)!important;background:var(--b2)!important;background-image:none!important;color:var(--tx)!important;box-shadow:none!important;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
  .hz-dlg .btn:hover{border-color:var(--mu)!important}
  .hz-dlg .btn.primary{background:var(--sol)!important;border-color:var(--sol)!important;color:#241600!important}
  .hz-dlg .btn.primary:hover{filter:brightness(1.07)}
  .hz-dlg .btn:disabled{opacity:.55;cursor:wait}
  .hz-split{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:18px;align-items:start}
  .hz-map{width:100%;border:1px solid var(--ln);border-radius:14px;background:#e9eef0;display:block}
  .hz-tab{width:100%;border-collapse:collapse;font-size:13.5px}
  .hz-tab th,.hz-tab td{padding:8px 7px;border-bottom:1px solid var(--ln);text-align:left;vertical-align:middle}
  .hz-tab th{font-size:12px;font-weight:500;color:var(--mu)}
  .hz-tab td.n,.hz-tab th.n{text-align:right;font-variant-numeric:tabular-nums}
  .hz-tab a{color:var(--sol);font-weight:600}
  .hz-tab small,.hz-dlg .muted{color:var(--mu)}
  .hz-pin{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;color:#fff;font:700 12px var(--fd);box-shadow:0 0 0 2px var(--b0),0 0 0 3px currentColor}
  .hz-empty{padding:22px;border:1px dashed var(--ln);border-radius:14px;color:var(--mu);text-align:center}
  .hz-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1px;background:var(--ln);border:1px solid var(--ln);border-radius:14px;overflow:hidden;margin:4px 0 14px}
  .hz-read>div{background:var(--b1);padding:12px 14px}
  .hz-read strong{display:block;font:600 26px/1.15 var(--fd);font-variant-numeric:tabular-nums;color:var(--tx)}
  .hz-read span{font-size:12.5px;color:var(--mu)}
  .hz-read .sol strong{color:var(--sol)} .hz-read .hoja strong{color:var(--hoja)} .hz-read .alerta strong{color:var(--alerta)}
  .hz-bal{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:2px;margin:0 0 6px}
  .hz-bal i{display:block}
  .hz-leg{display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--mu);margin-top:8px}
  .hz-leg i{flex:1;height:10px;border-radius:5px;background:linear-gradient(90deg,#b2182b,#ef8a62,#f7f7f7,#7fbf7b,#1b7837)}
  .hz-set{border:1px solid var(--ln);border-radius:14px;padding:12px 14px 2px;margin:0 0 14px;background:rgba(255,255,255,.015)}
  .hz-set legend{display:flex;align-items:center;gap:8px;padding:0 6px;font:600 15px var(--fd);color:var(--tx)}
  .hz-set legend svg{width:20px;height:20px;color:var(--sol)}
  .hz-total{display:flex;align-items:baseline;justify-content:flex-end;gap:14px;flex-wrap:wrap;margin:6px 0 6px}
  .hz-total span{color:var(--mu)} .hz-total strong{font:700 40px/1 var(--fd);color:var(--sol);font-variant-numeric:tabular-nums}
  .hz-tot td{font-weight:700}
  .hz-dlg details summary{cursor:pointer;font-weight:600;color:var(--tx)}
  /* Clima */
  .hz-wx{display:grid;grid-template-columns:240px minmax(0,1fr);gap:22px;align-items:center;padding:16px;border:1px solid var(--ln);border-radius:18px;background:radial-gradient(120% 140% at 0% 0%,rgba(246,166,35,.08),transparent 55%),var(--b1);margin-bottom:16px}
  .hz-dial{width:240px;height:240px;display:block}
  .hz-state{font:700 32px/1.05 var(--fd);margin:0 0 6px;display:flex;align-items:center;gap:10px}
  .hz-state i{width:16px;height:16px;border-radius:50%;box-shadow:0 0 0 5px color-mix(in srgb,currentColor 22%,transparent);background:currentColor}
  .hz-why{margin:0 0 12px;color:var(--mu)}
  .hz-why b{color:var(--tx);font-weight:600}
  .hz-strip{display:grid;grid-template-columns:repeat(48,minmax(0,1fr));align-items:end;gap:2px;height:96px;padding:0 0 4px;border-bottom:1px solid var(--ln)}
  .hz-strip i{display:block;border-radius:3px 3px 0 0;min-height:6px}
  .hz-strip i.nuevo-dia{box-shadow:-3px 0 0 -1px var(--mu)}
  .hz-hours{display:grid;grid-template-columns:repeat(48,minmax(0,1fr));font-size:11px;color:var(--mu);margin-top:4px}
  .hz-hours span{white-space:nowrap}
  .hz-win{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 6px}
  .hz-win span{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:12px;border:1px solid color-mix(in srgb,var(--hoja) 55%,transparent);background:color-mix(in srgb,var(--hoja) 14%,transparent);font-weight:600}
  .hz-win span b{font:600 15px var(--fd);color:var(--hoja)}
  @media (prefers-reduced-motion:no-preference){.hz-dial .aguja{transition:transform .6s cubic-bezier(.2,.8,.2,1)}}
  @media (max-width:860px){.hz-box{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.hz-rail{flex-direction:row;padding:8px;overflow-x:auto;border-right:0;border-bottom:1px solid var(--ln)}
    .hz-rail h2,.hz-brand,.hz-nav button small{display:none}.hz-nav{display:flex}.hz-nav button{grid-template-columns:32px auto;white-space:nowrap}.hz-nav button svg{width:32px;height:32px;padding:6px}
    .hz-split,.hz-wx{grid-template-columns:1fr}.hz-dial{margin:0 auto}}
  @media (max-width:760px){.hz-box{height:100dvh;border-radius:0}.hz-dlg{padding:0}}`;
  document.head.appendChild(css);

  // ---------- Ventana ----------
  const dlg = document.createElement('div');
  dlg.className = 'hz-dlg'; dlg.hidden = true;
  dlg.innerHTML = `<div class="hz-box" role="dialog" aria-modal="true" aria-label="Herramientas">
    <aside class="hz-rail"><h2>Herramientas</h2>
      <nav class="hz-nav hz-tabs" role="tablist" aria-orientation="vertical">
        ${TOOLS.map(x => `<button role="tab" data-t="${x.t}" aria-selected="false">${ICO[x.t]}<b>${x.n}</b><small>${x.d}</small></button>`).join('')}
      </nav>
      <div class="hz-brand" id="hzBrand"></div></aside>
    <div class="hz-main">
      <div class="hz-head"><div class="ic" id="hzHIco"></div><div><h3 id="hzHTit"></h3><p id="hzHSub"></p></div>
        <button class="hz-x" type="button" aria-label="Cerrar">×</button></div>
      <div class="hz-body">
        <section data-s="puntos"></section><section data-s="comparar" hidden></section><section data-s="clima" hidden></section>
        <section data-s="cuaderno" hidden></section><section data-s="cotizador" hidden></section>
      </div></div></div>`;
  const SUB = {
    puntos: 'El centro de las manchas de vigor más bajo y algunas de vigor alto para comparar, listos para el GPS o el celular.',
    comparar: 'Carga el índice de dos fechas del mismo predio y ve dónde mejoró o empeoró el vigor.',
    clima: 'Condiciones y pronóstico hora a hora en la ubicación del vuelo, con un semáforo de cuándo conviene aplicar.',
    cuaderno: 'Registra cada aplicación: queda la trazabilidad que piden exportadoras y certificaciones.',
    cotizador: 'Arma la cotización del servicio con la superficie del proyecto.',
  };
  const sec = n => dlg.querySelector('section[data-s="' + n + '"]');
  let pestana = 'puntos';
  function abrir(t) {
    if (t) pestana = t;
    dlg.hidden = false;
    dlg.querySelectorAll('.hz-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === pestana)));
    dlg.querySelectorAll('.hz-body section').forEach(s => { s.hidden = s.dataset.s !== pestana; });
    const x = TOOLS.find(y => y.t === pestana);
    $('hzHIco').innerHTML = ICO[pestana]; $('hzHTit').textContent = x.n; $('hzHSub').textContent = SUB[pestana];
    const lg = window.PrescriptorLogoClaro ? window.PrescriptorLogoClaro() : '';
    $('hzBrand').innerHTML = lg ? `<img src="${lg}" alt="Summit Agro">` : '';
    const r = ({ puntos: initPuntos, comparar: initComparar, cuaderno: initCuaderno, cotizador: initCotizador, clima: initClima })[pestana]();
    if (pestana === 'cuaderno') Promise.resolve(r).then(aplicarClimaPendiente);
  }
  const cerrar = () => { dlg.hidden = true; };
  dlg.querySelector('.hz-x').onclick = cerrar;
  dlg.onclick = e => { if (e.target === dlg) cerrar(); };
  dlg.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
  dlg.querySelector('.hz-tabs').onclick = e => { const b = e.target.closest('button'); if (b) abrir(b.dataset.t); };

  // =================================================================
  // 1) PUNTOS DE INSPECCIÓN
  // =================================================================
  const COL = { 2: ['#c8402f', '#2f8a50'], 3: ['#c8402f', '#e6c13d', '#2f8a50'], 4: ['#c8402f', '#ec8d48', '#9dc85a', '#2f8a50'], 5: ['#c8402f', '#ec8d48', '#e6c13d', '#9dc85a', '#2f8a50'] };
  let PI = null; // { fc, puntos, nClases }
  function initPuntos() {
    const s = sec('puntos');
    if (s.dataset.ok) return; s.dataset.ok = 1;
    s.innerHTML = `<h3>Puntos de inspección en terreno</h3>
      <p class="hint">Ubica los puntos que el agrónomo debe revisar: el centro de las manchas de vigor más bajo y, como comparación, algunas de vigor alto. Se descargan para el GPS o el celular.</p>
      <div class="hz-grid">
        <label>Puntos de vigor bajo<input type="number" id="hzNBajo" min="1" max="30" value="6"></label>
        <label>Puntos de referencia (vigor alto)<input type="number" id="hzNAlto" min="0" max="10" value="2"></label>
        <label>Mancha mínima (cuadros)<input type="number" id="hzMinC" min="1" max="500" value="4"></label>
      </div>
      <div class="hz-btns"><button class="btn primary" id="hzCalc" type="button">Calcular puntos</button></div>
      <div id="hzPRes"></div>`;
    $('hzCalc').onclick = calcularPuntos;
  }
  function centroide(rings) {
    let a = 0, cx = 0, cy = 0;
    for (const r of rings) for (let i = 0, n = r.length - 1; i < n; i++) { const [x1, y1] = r[i], [x2, y2] = r[i + 1], f = x1 * y2 - x2 * y1; a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f; }
    return a ? [cx / (3 * a), cy / (3 * a)] : rings[0][0];
  }
  async function calcularPuntos() {
    const out = $('hzPRes'); out.innerHTML = '<p class="hint">Calculando…</p>';
    const fc = await cuadros();
    if (!fc || !fc.features.length) { out.innerHTML = '<div class="hz-empty">Primero carga un vuelo y define las tasas.</div>'; return; }
    const Z = window.PrescriptorZonas;
    const feats = fc.features.filter(f => f.properties && f.properties.clase);
    const nClases = Math.max(...feats.map(f => f.properties.clase));
    const minC = Math.max(1, +$('hzMinC').value || 1);
    function puntosDe(clase, n, tipo) {
      const fs = feats.filter(f => f.properties.clase === clase);
      const anillos = fs.map(f => f.geometry.coordinates[0]);
      const grupos = Z ? Z.manchasDe(anillos) : anillos.map(a => [a]);
      const idx = new Map(anillos.map((a, i) => [a, fs[i]]));
      return grupos.filter(g => g.length >= minC).map(g => {
        const cs = g.map(a => idx.get(a));
        const ndvi = cs.map(c => c.properties.ndvi).filter(Number.isFinite);
        const area = cs.reduce((t, c) => t + (c.properties.area_m2 || 0), 0) / 1e4;
        // Punto: centro del cuadro de la mancha más cercano a su centro (siempre cae dentro de la mancha)
        const cents = g.map(a => { const r = a.slice(0, -1); return [r.reduce((t, p) => t + p[0], 0) / r.length, r.reduce((t, p) => t + p[1], 0) / r.length]; });
        const c0 = centroide(g); let best = 0, bd = Infinity;
        cents.forEach((c, i) => { const d = (c[0] - c0[0]) ** 2 + (c[1] - c0[1]) ** 2; if (d < bd) { bd = d; best = i; } });
        return { tipo, clase, lon: cents[best][0], lat: cents[best][1], ha: area, cuadros: g.length, ndvi: ndvi.length ? ndvi.reduce((t, v) => t + v, 0) / ndvi.length : NaN, dosis: cs[0].properties.dosis_lha, zona: cs[0].properties.zona };
      }).sort((a, b) => b.ha - a.ha).slice(0, n);
    }
    const bajo = puntosDe(1, Math.max(0, +$('hzNBajo').value || 0), 'bajo');
    const alto = nClases > 1 ? puntosDe(nClases, Math.max(0, +$('hzNAlto').value || 0), 'alto') : [];
    const puntos = [...bajo, ...alto].map((p, i) => ({ ...p, n: i + 1 }));
    PI = { fc, puntos, nClases };
    if (!puntos.length) { out.innerHTML = '<div class="hz-empty">No hay manchas del tamaño mínimo. Baja «Mancha mínima».</div>'; return; }
    const ix = indice(), gm = p => `https://www.google.com/maps/search/?api=1&query=${p.lat.toFixed(7)},${p.lon.toFixed(7)}`;
    const ruta = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + puntos[puntos.length - 1].lat.toFixed(7) + ',' + puntos[puntos.length - 1].lon.toFixed(7) +
      (puntos.length > 1 ? '&waypoints=' + puntos.slice(0, -1).slice(0, 9).map(p => p.lat.toFixed(7) + ',' + p.lon.toFixed(7)).join('%7C') : '');
    out.innerHTML = `<div class="hz-read" style="max-width:640px">
        <div class="alerta"><strong>${bajo.length}</strong><span>Puntos de vigor bajo</span></div>
        <div class="hoja"><strong>${alto.length}</strong><span>Puntos de referencia</span></div>
        <div class="sol"><strong>${num(bajo.reduce((t, p) => t + p.ha, 0), 2)}<small style="font-size:15px"> ha</small></strong><span>Superficie en las manchas a revisar</span></div></div>
      <div class="hz-split"><div><img class="hz-map" id="hzPMap" alt="Mapa de puntos"></div><div>
      <table class="hz-tab"><thead><tr><th>#</th><th>Tipo</th><th class="n">ha</th><th class="n">${ix}</th><th>Ubicación</th></tr></thead><tbody>
      ${puntos.map(p => `<tr><td><span class="hz-pin" style="background:${p.tipo === 'bajo' ? '#1a1b23' : '#1e6fe0'}">${p.n}</span></td>
        <td>${p.tipo === 'bajo' ? 'Vigor bajo' : 'Referencia'}<br><small class="muted">tasa ${p.clase} · ${p.cuadros} cuadros</small></td>
        <td class="n">${num(p.ha, 2)}</td><td class="n">${num(p.ndvi, 2)}</td>
        <td><a href="${gm(p)}" target="_blank" rel="noopener">${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}</a></td></tr>`).join('')}
      </tbody></table>
      <div class="hz-btns" style="margin-top:12px">
        <a class="btn primary" href="${ruta}" target="_blank" rel="noopener">Ruta a pie en Google Maps</a>
        <button class="btn" type="button" id="hzKml">KML</button><button class="btn" type="button" id="hzGpx">GPX</button>
        <button class="btn" type="button" id="hzCsv">CSV</button><button class="btn" type="button" id="hzHoja">Hoja de inspección</button>
      </div><p class="hint">KML para Google Earth o el control; GPX para GPS y apps de celular; la hoja se imprime para anotar en terreno. La ruta de Google Maps admite hasta 10 puntos.</p></div></div>`;
    $('hzPMap').src = mapaPuntos(fc, puntos, nClases, 900);
    const base = (S().baseNombre ? S().baseNombre() : 'puntos') + '_inspeccion';
    $('hzKml').onclick = () => descargar(kml(puntos), base + '.kml', 'application/vnd.google-earth.kml+xml');
    $('hzGpx').onclick = () => descargar(gpx(puntos), base + '.gpx', 'application/gpx+xml');
    $('hzCsv').onclick = () => descargar('﻿' + ['Punto;Tipo;Tasa;Latitud;Longitud;ha;' + ix + ';Google Maps',
      ...puntos.map(p => [p.n, p.tipo === 'bajo' ? 'Vigor bajo' : 'Referencia', p.clase, p.lat.toFixed(7), p.lon.toFixed(7), num(p.ha, 3), num(p.ndvi, 3), gm(p)].join(';'))].join('\r\n'), base + '.csv', 'text/csv');
    $('hzHoja').onclick = () => hojaInspeccion(puntos, $('hzPMap').src);
  }
  // Mapa (PNG) con los cuadros coloreados por tasa y los puntos numerados
  function mapaPuntos(fc, puntos, nClases, W) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const f of fc.features) for (const [x, y] of f.geometry.coordinates[0]) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); }
    const kx = Math.cos(((y1 + y2) / 2) * Math.PI / 180), w = (x2 - x1) * kx, h = y2 - y1, pad = 24;
    const sc = (W - 2 * pad) / w, H = Math.round(h * sc + 2 * pad);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.fillStyle = '#f3f5f8'; g.fillRect(0, 0, W, H);
    const X = x => pad + (x - x1) * kx * sc, Y = y => pad + (y2 - y) * sc;
    const cols = COL[nClases] || COL[5];
    for (const f of fc.features) {
      const cl = (f.properties || {}).clase; g.fillStyle = cl ? cols[cl - 1] : '#c9ced6'; g.globalAlpha = cl ? .85 : .5;
      g.beginPath(); f.geometry.coordinates[0].forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.fill();
    }
    g.globalAlpha = 1;
    for (const p of puntos) {
      const px = X(p.lon), py = Y(p.lat);
      g.beginPath(); g.arc(px, py, 13, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.arc(px, py, 10, 0, Math.PI * 2); g.fillStyle = p.tipo === 'bajo' ? '#1a1b23' : '#1e6fe0'; g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 12px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(p.n), px, py + .5);
    }
    return c.toDataURL('image/png');
  }
  const xmlEsc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  function kml(ps) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${xmlEsc(proyecto() || 'Puntos de inspección')}</name>
<Style id="bajo"><IconStyle><color>ff2f40c8</color><scale>1.2</scale></IconStyle></Style><Style id="alto"><IconStyle><color>ff508a2f</color><scale>1.2</scale></IconStyle></Style>
${ps.map(p => `<Placemark><name>${p.n}</name><styleUrl>#${p.tipo}</styleUrl><description>${xmlEsc((p.tipo === 'bajo' ? 'Vigor bajo' : 'Referencia (vigor alto)') + ' · tasa ' + p.clase + ' · ' + num(p.ha, 2) + ' ha · ' + indice() + ' ' + num(p.ndvi, 2))}</description><Point><coordinates>${p.lon.toFixed(7)},${p.lat.toFixed(7)},0</coordinates></Point></Placemark>`).join('\n')}
</Document></kml>`;
  }
  function gpx(ps) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Prescriptor" xmlns="http://www.topografix.com/GPX/1/1">
${ps.map(p => `<wpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}"><name>${p.n} ${p.tipo === 'bajo' ? 'Vigor bajo' : 'Referencia'}</name><desc>${xmlEsc('tasa ' + p.clase + ' · ' + num(p.ha, 2) + ' ha · ' + indice() + ' ' + num(p.ndvi, 2))}</desc></wpt>`).join('\n')}
</gpx>`;
  }
  function hojaInspeccion(ps, img) {
    const ix = indice();
    documento('Hoja de inspección en terreno', `
      <table class="kv"><tr><td>Predio / proyecto</td><td>${esc(proyecto() || '—')}</td></tr><tr><td>Índice</td><td>${ix}</td></tr>
      <tr><td>Inspector</td><td class="nota"></td></tr><tr><td>Fecha de visita</td><td class="nota"></td></tr></table>
      <h2>Mapa</h2><img class="full" src="${img}" alt="Mapa de puntos">
      <p class="muted">Puntos negros: vigor bajo. Puntos azules: referencia de vigor alto para comparar.</p>
      <h2 class="pb">Puntos</h2><table><thead><tr><th>#</th><th>Tipo</th><th>Coordenadas</th><th class="n">ha</th><th class="n">${ix}</th><th style="width:38%">Observación en terreno</th></tr></thead><tbody>
      ${ps.map(p => `<tr><td><b>${p.n}</b></td><td>${p.tipo === 'bajo' ? 'Vigor bajo' : 'Referencia'}</td><td>${p.lat.toFixed(6)}<br>${p.lon.toFixed(6)}</td><td class="n">${num(p.ha, 2)}</td><td class="n">${num(p.ndvi, 2)}</td><td class="nota"></td></tr>`).join('')}
      </tbody></table>
      <p class="muted">Revisar en cada punto: riego (goteros, humedad), plagas y enfermedades, nutrición (color de hojas), malezas, daño mecánico, suelo.</p>`, 'hoja_inspeccion');
  }

  // =================================================================
  // 2) COMPARAR VUELOS
  // =================================================================
  function initComparar() {
    const s = sec('comparar');
    if (s.dataset.ok) return; s.dataset.ok = 1;
    s.innerHTML = `<h3>Comparar dos vuelos</h3>
      <p class="hint">Carga el GeoTIFF del índice de dos fechas del mismo predio. Se calcula el cambio en cada punto: verde mejoró, rojo empeoró.</p>
      <div class="hz-grid">
        <label>Vuelo anterior (.tif)<input type="file" id="hzA" accept=".tif,.tiff"></label>
        <label>Fecha anterior<input type="date" id="hzFA"></label>
        <label>Vuelo reciente (.tif)<input type="file" id="hzB" accept=".tif,.tiff"></label>
        <label>Fecha reciente<input type="date" id="hzFB"></label>
        <label>Cambio mínimo a considerar<input type="number" id="hzU" min="0.01" max="0.5" step="0.01" value="0.05"></label>
        <label>Ignorar suelo (índice menor a)<input type="number" id="hzSuelo" min="-1" max="1" step="0.05" value="0.2"></label>
      </div>
      <div class="hz-btns"><button class="btn primary" id="hzComp" type="button">Comparar</button></div>
      <div id="hzCRes"></div>`;
    for (const [i, f] of [['hzA', 'hzFA'], ['hzB', 'hzFB']]) $(i).onchange = e => { const d = fechaDeNombre((e.target.files[0] || {}).name || ''); if (d) $(f).value = d; };
    $('hzComp').onclick = comparar;
  }
  function fechaDeNombre(n) {
    let m = n.match(/(20\d{2})[-_.]?(\d{2})[-_.]?(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = n.match(/(\d{2})[-_.](\d{2})[-_.](20\d{2})/); if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return '';
  }
  function crsDe(img) {
    const k = img.getGeoKeys() || {}, code = k.ProjectedCSTypeGeoKey || k.GeographicTypeGeoKey;
    if (code === 4326 || (!k.ProjectedCSTypeGeoKey && k.GeographicTypeGeoKey)) return { code: 4326, def: '+proj=longlat +datum=WGS84 +no_defs' };
    if ((code >= 32601 && code <= 32660) || (code >= 32701 && code <= 32760)) {
      const sur = code > 32700, zona = code - (sur ? 32700 : 32600);
      return { code, def: `+proj=utm +zone=${zona}${sur ? ' +south' : ''} +datum=WGS84 +units=m +no_defs` };
    }
    return code ? { code, def: null } : null;
  }
  async function leerIndice(file, maxDim) {
    const tiff = await GeoTIFF.fromBlob(file), img = await tiff.getImage();
    const W = img.getWidth(), H = img.getHeight(), f = Math.max(1, Math.max(W, H) / maxDim);
    const w = Math.round(W / f), h = Math.round(H / f);
    const [band] = await img.readRasters({ samples: [0], width: w, height: h, resampleMethod: 'nearest' });
    const bb = img.getBoundingBox(), nd = img.getGDALNoData(), crs = crsDe(img);
    return { w, h, bb, nd, crs, data: band, bandas: img.getSamplesPerPixel(), nombre: file.name };
  }
  async function comparar() {
    const fa = $('hzA').files[0], fb = $('hzB').files[0], out = $('hzCRes');
    if (!fa || !fb) { out.innerHTML = '<div class="hz-empty">Elige los dos archivos.</div>'; return; }
    out.innerHTML = '<p class="hint">Leyendo y comparando…</p>';
    try {
      const A = await leerIndice(fa, 1400), B = await leerIndice(fb, 2000);
      if (A.bandas !== 1 || B.bandas !== 1) throw new Error('los dos archivos deben ser GeoTIFF del índice, de una banda');
      if (!A.crs || !B.crs || !A.crs.def || !B.crs.def) throw new Error('sistema de coordenadas no reconocido (se aceptan WGS84 y UTM)');
      const tr = A.crs.code === B.crs.code ? null : proj4(A.crs.def, B.crs.def);
      const U = Math.max(0.001, +$('hzU').value || 0.05), suelo = parseFloat($('hzSuelo').value);
      const ok = (v, nd) => Number.isFinite(v) && v !== nd && v >= -1.5 && v <= 1.5;
      const dx = (A.bb[2] - A.bb[0]) / A.w, dy = (A.bb[3] - A.bb[1]) / A.h;
      const bdx = (B.bb[2] - B.bb[0]) / B.w, bdy = (B.bb[3] - B.bb[1]) / B.h;
      const diff = new Float32Array(A.w * A.h).fill(NaN);
      let n = 0, mej = 0, emp = 0, est = 0, suma = 0, sA = 0, sB = 0, solape = 0, validosA = 0;
      for (let r = 0; r < A.h; r++) {
        const y = A.bb[3] - (r + 0.5) * dy;
        for (let c = 0; c < A.w; c++) {
          const va = A.data[r * A.w + c];
          if (!ok(va, A.nd)) continue;
          validosA++;
          let x = A.bb[0] + (c + 0.5) * dx, yy = y;
          if (tr) [x, yy] = tr.forward([x, yy]);
          const bc = Math.floor((x - B.bb[0]) / bdx), br = Math.floor((B.bb[3] - yy) / bdy);
          if (bc < 0 || br < 0 || bc >= B.w || br >= B.h) continue;
          const vb = B.data[br * B.w + bc];
          if (!ok(vb, B.nd)) continue;
          solape++;
          if (Number.isFinite(suelo) && va < suelo && vb < suelo) continue;
          const d = vb - va; diff[r * A.w + c] = d; n++; suma += d; sA += va; sB += vb;
          if (d >= U) mej++; else if (d <= -U) emp++; else est++;
        }
      }
      if (!solape) throw new Error('los vuelos no se superponen: revisa que sean del mismo predio');
      if (!n) throw new Error('no quedó vegetación para comparar: baja «Ignorar suelo»');
      // Área de cada píxel en ha (en grados se aproxima con la latitud)
      const lat = (A.bb[1] + A.bb[3]) / 2;
      const pxHa = A.crs.code === 4326 ? (dx * 111320 * Math.cos(lat * Math.PI / 180)) * (dy * 110574) / 1e4 : dx * dy / 1e4;
      const R = { A, B, n, mej, emp, est, media: suma / n, mediaA: sA / n, mediaB: sB / n, ha: n * pxHa, cobertura: solape / validosA, U };
      const png = mapaCambio(diff, A.w, A.h, U);
      const fA = $('hzFA').value, fB = $('hzFB').value, ix = indice(), pct = v => num(100 * v / n, 1) + ' %';
      out.innerHTML = `<div class="hz-read">
          <div class="hoja"><strong>${pct(mej)}</strong><span>Mejoró (sube ${num(U, 2)} o más)</span></div>
          <div class="alerta"><strong>${pct(emp)}</strong><span>Empeoró (baja ${num(U, 2)} o más)</span></div>
          <div><strong>${pct(est)}</strong><span>Sin cambio relevante</span></div>
          <div class="sol"><strong>${(R.media >= 0 ? '+' : '') + num(R.media, 3)}</strong><span>Cambio medio del ${ix}: de ${num(R.mediaA, 2)} a ${num(R.mediaB, 2)}</span></div></div>
        <div class="hz-bal" aria-hidden="true"><i style="flex:${mej};background:#74BF56"></i><i style="flex:${est};background:#5a7480"></i><i style="flex:${emp};background:#E5583F"></i></div>
        <p class="hint" style="margin-bottom:16px">Balance de la superficie comparada: verde mejoró, gris sin cambio, rojo empeoró.</p>
        <div class="hz-split"><div><img class="hz-map" id="hzCMap" src="${png}" alt="Mapa de cambio">
          <div class="hz-leg">empeoró <i></i> mejoró</div></div>
        <div><table class="hz-tab"><tbody>
          <tr><td>Vuelo anterior</td><td>${esc(A.nombre)}${fA ? '<br><small>' + fechaCL(fA) + '</small>' : ''}</td></tr>
          <tr><td>Vuelo reciente</td><td>${esc(B.nombre)}${fB ? '<br><small>' + fechaCL(fB) + '</small>' : ''}</td></tr>
          <tr><td>Superficie comparada</td><td>${num(R.ha, 2)} ha</td></tr>
          <tr><td>Superposición</td><td>${num(100 * R.cobertura, 0)} % del vuelo anterior</td></tr></tbody></table>
          <div class="hz-btns" style="margin-top:12px"><button class="btn primary" id="hzEvo" type="button">Informe de evolución</button><button class="btn" id="hzPng" type="button">Descargar mapa (.png)</button></div>
          <p class="hint">Para que la comparación sea justa, los dos vuelos deben tener la misma calibración (mismo dron y panel de reflectancia) y una hora del día parecida.</p></div></div>`;
      $('hzPng').onclick = () => fetch(png).then(r => r.blob()).then(b => descargar(b, 'cambio_' + ix + '.png'));
      $('hzEvo').onclick = () => documento('Evolución del ' + ix, `
        <table class="kv"><tr><td>Predio / proyecto</td><td>${esc(proyecto() || '—')}</td></tr>
        <tr><td>Vuelo anterior</td><td>${fA ? fechaCL(fA) + ' · ' : ''}${esc(A.nombre)}</td></tr><tr><td>Vuelo reciente</td><td>${fB ? fechaCL(fB) + ' · ' : ''}${esc(B.nombre)}</td></tr>
        <tr><td>Superficie comparada</td><td>${num(R.ha, 2)} ha</td></tr><tr><td>${ix} medio</td><td>${num(R.mediaA, 3)} → ${num(R.mediaB, 3)} (${(R.media >= 0 ? '+' : '') + num(R.media, 3)})</td></tr></table>
        <h2>Resultado</h2><table><thead><tr><th>Estado</th><th class="n">% de la superficie</th><th class="n">ha</th></tr></thead><tbody>
        <tr><td><span class="chip" style="background:#1b7837">Mejoró</span></td><td class="n">${pct(mej)}</td><td class="n">${num(mej * pxHa, 2)}</td></tr>
        <tr><td><span class="chip" style="background:#888">Sin cambio</span></td><td class="n">${pct(est)}</td><td class="n">${num(est * pxHa, 2)}</td></tr>
        <tr><td><span class="chip" style="background:#b2182b">Empeoró</span></td><td class="n">${pct(emp)}</td><td class="n">${num(emp * pxHa, 2)}</td></tr></tbody></table>
        <h2>Mapa de cambio</h2><img class="full" src="${png}" alt="Mapa de cambio">
        <p class="muted">Rojo: el ${ix} bajó al menos ${num(U, 2)}. Verde: subió al menos ${num(U, 2)}. Blanco: sin cambio relevante. Se excluyó el suelo (${ix} menor a ${num(suelo, 2)} en ambas fechas).</p>`, 'evolucion_' + ix);
    } catch (e) { console.error(e); out.innerHTML = '<div class="hz-empty">No se pudo comparar: ' + esc(e.message || e) + '</div>'; }
  }
  function mapaCambio(d, w, h, U) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), im = g.createImageData(w, h), M = Math.max(U * 4, 0.2);
    const stops = [[-1, [178, 24, 43]], [-.5, [239, 138, 98]], [0, [247, 247, 247]], [.5, [127, 191, 123]], [1, [27, 120, 55]]];
    for (let i = 0; i < d.length; i++) {
      const v = d[i]; if (!Number.isFinite(v)) continue;
      let t = Math.max(-1, Math.min(1, v / M)); if (Math.abs(v) < U) t = 0;
      let k = 0; while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
      const [t0, c0] = stops[k], [t1, c1] = stops[k + 1], f = (t - t0) / (t1 - t0);
      im.data[i * 4] = c0[0] + (c1[0] - c0[0]) * f; im.data[i * 4 + 1] = c0[1] + (c1[1] - c0[1]) * f; im.data[i * 4 + 2] = c0[2] + (c1[2] - c0[2]) * f; im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return c.toDataURL('image/png');
  }

  // =================================================================
  // 3) CUADERNO DE CAMPO
  // =================================================================
  const CK = 'presc_cuaderno';
  const CAMPOS = [
    ['fecha', 'Fecha', 'date'], ['predio', 'Predio / cuartel', 'text'], ['cultivo', 'Cultivo / variedad', 'text'], ['ha', 'Superficie aplicada (ha)', 'number'],
    ['producto', 'Producto comercial', 'text'], ['ia', 'Ingrediente activo', 'text'], ['dosis', 'Dosis de producto', 'text'], ['caldo', 'Caldo (L/ha)', 'number'],
    ['objetivo', 'Objetivo (plaga, enfermedad, nutrición)', 'text'], ['carencia', 'Carencia (días)', 'number'], ['reingreso', 'Reingreso (horas)', 'number'],
    ['dron', 'Dron', 'text'], ['operador', 'Operador / piloto', 'text'], ['temp', 'Temperatura (°C)', 'number'], ['viento', 'Viento (km/h)', 'number'],
    ['hr', 'Humedad relativa (%)', 'number'], ['obs', 'Observaciones', 'text'],
  ];
  const GRUPOS = [
    { n: 'Aplicación', ico: ICO.puntos, k: ['fecha', 'predio', 'cultivo', 'ha', 'objetivo'] },
    { n: 'Producto', ico: ICO.cuaderno, k: ['producto', 'ia', 'dosis', 'caldo', 'carencia', 'reingreso'] },
    { n: 'Equipo y condiciones', ico: ICO.clima, k: ['dron', 'operador', 'temp', 'viento', 'hr', 'obs'] },
  ];
  const registros = () => ls.get(CK, []);
  async function initCuaderno() {
    const s = sec('cuaderno');
    if (!s.dataset.ok) {
      s.dataset.ok = 1;
      s.innerHTML = `<h3>Cuaderno de campo</h3>
        <p class="hint">Registra cada aplicación: queda la trazabilidad que piden las exportadoras y certificaciones, y puedes entregar un certificado al productor.</p>
        <div id="hzCForm">${GRUPOS.map(g => `<fieldset class="hz-set"><legend>${g.ico}${g.n}</legend><div class="hz-grid">${g.k.map(k => { const [, t, ty] = CAMPOS.find(c => c[0] === k);
          return `<label${k === 'obs' ? ' class="wide"' : ''}>${t}<input id="hzC_${k}" type="${ty}"${ty === 'number' ? ' step="any" min="0"' : ''}></label>`; }).join('')}</div></fieldset>`).join('')}</div>
        <div class="hz-btns"><button class="btn primary" id="hzCSave" type="button">Guardar registro</button><button class="btn" id="hzCAuto" type="button">Completar con la prescripción actual</button></div>
        <p class="hint" id="hzCCar"></p>
        <div id="hzCList"></div>`;
      $('hzCSave').onclick = guardarRegistro;
      $('hzCAuto').onclick = () => autocompletar(true);
      $('hzC_carencia').oninput = $('hzC_fecha').oninput = carencia;
    }
    if (!$('hzC_fecha').value) $('hzC_fecha').value = hoyISO();
    await autocompletar(false);
    listaRegistros();
  }
  async function autocompletar(forzar) {
    const set = (k, v) => { const el = $('hzC_' + k); if (el && (forzar || !el.value) && v != null && v !== '') el.value = v; };
    set('predio', proyecto());
    const dr = $('droneSel'); if (dr && dr.selectedOptions[0]) set('dron', dr.selectedOptions[0].textContent.split('·')[0].trim());
    const fc = await cuadros();
    if (fc) { const r = resumen(fc); set('ha', +r.ha.toFixed(2)); set('caldo', Math.round(r.dosisMedia)); }
    carencia();
  }
  function carencia() {
    const f = $('hzC_fecha').value, c = parseInt($('hzC_carencia').value, 10);
    if (!f || !Number.isFinite(c)) { $('hzCCar').textContent = ''; return; }
    const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() + c);
    $('hzCCar').textContent = 'Cosecha permitida desde el ' + d.toLocaleDateString('es-CL', { dateStyle: 'long' }) + ' (carencia de ' + c + ' días).';
  }
  function cosechaDesde(r) { if (!r.fecha || !Number.isFinite(+r.carencia) || r.carencia === '') return ''; const d = new Date(r.fecha + 'T12:00:00'); d.setDate(d.getDate() + (+r.carencia)); return d.toISOString().slice(0, 10); }
  function guardarRegistro() {
    const r = { id: Date.now() };
    for (const [k] of CAMPOS) r[k] = $('hzC_' + k).value.trim();
    if (!r.fecha || !r.predio || !r.producto) { aviso('Completa al menos fecha, predio y producto.'); return; }
    const lista = registros(); lista.push(r);
    if (!ls.set(CK, lista)) { aviso('Este navegador no permitió guardar el registro.'); return; }
    for (const k of ['producto', 'ia', 'dosis', 'objetivo', 'carencia', 'reingreso', 'temp', 'viento', 'hr', 'obs']) $('hzC_' + k).value = '';
    carencia(); listaRegistros(); aviso('Registro guardado.');
  }
  function listaRegistros() {
    const l = registros().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || b.id - a.id), box = $('hzCList');
    if (!l.length) { box.innerHTML = '<div class="hz-empty">Aún no hay aplicaciones registradas en este navegador.</div>'; return; }
    box.innerHTML = `<div class="hz-btns"><button class="btn" id="hzCCsv" type="button">Exportar a Excel (.csv)</button><span class="hint" style="align-self:center">${l.length} registro${l.length === 1 ? '' : 's'} · quedan en este navegador; exporta para respaldar.</span></div>
      <table class="hz-tab"><thead><tr><th>Fecha</th><th>Predio</th><th>Producto</th><th class="n">ha</th><th>Cosecha desde</th><th></th></tr></thead><tbody>
      ${l.map(r => `<tr><td>${fechaCL(r.fecha)}</td><td>${esc(r.predio)}</td><td>${esc(r.producto)}${r.dosis ? '<br><small class="muted">' + esc(r.dosis) + '</small>' : ''}</td><td class="n">${r.ha ? num(+r.ha, 2) : ''}</td><td>${fechaCL(cosechaDesde(r))}</td>
        <td style="white-space:nowrap"><button class="btn" type="button" data-cert="${r.id}">Certificado</button> <button class="btn" type="button" data-del="${r.id}" title="Borrar">×</button></td></tr>`).join('')}
      </tbody></table>`;
    $('hzCCsv').onclick = () => {
      const cab = [...CAMPOS.map(c => c[1]), 'Cosecha permitida desde'];
      const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      const NUM = new Set(CAMPOS.filter(c => c[2] === 'number').map(c => c[0]));
      const val = (k, v) => k === 'fecha' ? fechaCL(v) : (NUM.has(k) ? String(v || '').replace('.', ',') : v);
      descargar('﻿' + [cab.map(q).join(';'), ...l.map(r => [...CAMPOS.map(([k]) => val(k, r[k])), fechaCL(cosechaDesde(r))].map(q).join(';'))].join('\r\n'), 'cuaderno_de_campo.csv', 'text/csv');
    };
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (!confirm('¿Borrar este registro?')) return; ls.set(CK, registros().filter(r => r.id !== +b.dataset.del)); listaRegistros(); });
    box.querySelectorAll('[data-cert]').forEach(b => b.onclick = () => certificado(registros().find(r => r.id === +b.dataset.cert)));
  }
  function certificado(r) {
    if (!r) return;
    const fila = (t, v) => v ? `<tr><td>${t}</td><td>${esc(v)}</td></tr>` : '';
    documento('Certificado de aplicación', `
      <h2>Aplicación</h2><table class="kv">${fila('Fecha', fechaCL(r.fecha))}${fila('Predio / cuartel', r.predio)}${fila('Cultivo / variedad', r.cultivo)}${fila('Superficie aplicada', r.ha && num(+r.ha, 2) + ' ha')}${fila('Objetivo', r.objetivo)}</table>
      <h2>Producto</h2><table class="kv">${fila('Producto comercial', r.producto)}${fila('Ingrediente activo', r.ia)}${fila('Dosis de producto', r.dosis)}${fila('Volumen de caldo', r.caldo && num(+r.caldo, 0) + ' L/ha')}
        ${fila('Carencia', r.carencia && r.carencia + ' días')}${fila('Cosecha permitida desde', fechaCL(cosechaDesde(r)) !== '—' ? fechaCL(cosechaDesde(r)) : '')}${fila('Reingreso', r.reingreso && r.reingreso + ' horas')}</table>
      <h2>Equipo y condiciones</h2><table class="kv">${fila('Equipo', r.dron && 'Dron ' + r.dron + ' con prescripción de dosis variable')}${fila('Operador / piloto', r.operador)}
        ${fila('Temperatura', r.temp && r.temp + ' °C')}${fila('Viento', r.viento && r.viento + ' km/h')}${fila('Humedad relativa', r.hr && r.hr + ' %')}${fila('Observaciones', r.obs)}</table>
      <div class="firma"><div>Operador / piloto</div><div>Recibe conforme (productor)</div></div>`, 'certificado_aplicacion');
  }

  // =================================================================
  // 4) COTIZADOR
  // =================================================================
  const QK = 'presc_cotizador';
  function initCotizador() {
    const s = sec('cotizador');
    if (s.dataset.ok) { refrescarHa(); return; }
    s.dataset.ok = 1;
    const cfg = ls.get(QK, { tarifa: 0, traslado: 0, minimo: 0, iva: true, validez: 15, emisor: '', n: 0 });
    s.innerHTML = `<h3>Cotizador</h3>
      <p class="hint">Arma la cotización del servicio con la superficie del proyecto. Las tarifas se recuerdan para la próxima.</p>
      <div class="hz-grid">
        <label>Cliente<input id="hzQCli" type="text" placeholder="Nombre o razón social"></label>
        <label>RUT del cliente<input id="hzQRut" type="text" placeholder="Opcional"></label>
        <label>Predio<input id="hzQPre" type="text"></label>
        <label>Emisor (tu empresa)<input id="hzQEmi" type="text" value="${esc(cfg.emisor)}" placeholder="Ej.: Summit Agro Chile"></label>
      </div>
      <table class="hz-tab" id="hzQTab"><thead><tr><th style="width:44%">Descripción</th><th class="n">Cantidad</th><th>Unidad</th><th class="n">Precio unitario ($)</th><th class="n">Subtotal</th><th></th></tr></thead><tbody></tbody></table>
      <div class="hz-btns"><button class="btn" id="hzQAdd" type="button">+ Agregar línea</button></div>
      <div class="hz-grid">
        <label>Cargo mínimo ($)<input id="hzQMin" type="number" min="0" step="1000" value="${cfg.minimo || ''}"></label>
        <label>Descuento (%)<input id="hzQDes" type="number" min="0" max="100" step="1" value="0"></label>
        <label>Validez (días)<input id="hzQVal" type="number" min="1" step="1" value="${cfg.validez || 15}"></label>
        <label style="align-self:end;display:flex;gap:8px;align-items:center"><input id="hzQIva" type="checkbox" style="width:auto" ${cfg.iva ? 'checked' : ''}> Agregar IVA (19 %)</label>
        <label class="wide">Notas<input id="hzQNot" type="text" placeholder="Ej.: incluye vuelo multiespectral previo y prescripción."></label>
      </div>
      <div class="hz-total"><span>Total de la cotización</span><strong id="hzQBig">$ 0</strong></div>
      <table class="hz-tab" style="max-width:420px;margin-left:auto"><tbody id="hzQTot"></tbody></table>
      <div class="hz-btns" style="justify-content:flex-end"><button class="btn primary" id="hzQGen" type="button">Generar cotización</button></div>`;
    const tb = $('hzQTab').querySelector('tbody');
    const fila = (d = '', c = 1, u = 'ha', p = 0) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><input class="d" type="text" value="${esc(d)}"></td><td><input class="c" type="number" min="0" step="any" value="${c}" style="text-align:right"></td>
        <td><input class="u" type="text" value="${esc(u)}" style="width:70px"></td><td><input class="p" type="number" min="0" step="any" value="${p || ''}" style="text-align:right"></td><td class="n s">—</td>
        <td><button class="btn" type="button" title="Quitar">×</button></td>`;
      tr.querySelector('button').onclick = () => { tr.remove(); totales(); };
      tr.querySelectorAll('input').forEach(i => i.oninput = totales);
      tb.appendChild(tr);
    };
    fila('Aplicación con dron · dosis variable', 0, 'ha', cfg.tarifa);
    fila('Traslado de equipo', 1, 'servicio', cfg.traslado);
    $('hzQAdd').onclick = () => { fila(); totales(); };
    ['hzQMin', 'hzQDes', 'hzQIva'].forEach(id => $(id).oninput = $(id).onchange = totales);
    $('hzQPre').value = proyecto();
    $('hzQGen').onclick = generarCotizacion;
    refrescarHa();
  }
  async function refrescarHa() {
    const fc = await cuadros(); if (!fc) { totales(); return; }
    const r = resumen(fc), c = $('hzQTab') && $('hzQTab').querySelector('tbody tr .c');
    if (c && (!+c.value)) c.value = +r.ha.toFixed(2);
    if ($('hzQPre') && !$('hzQPre').value) $('hzQPre').value = proyecto();
    totales();
  }
  function calc() {
    const lineas = [...$('hzQTab').querySelectorAll('tbody tr')].map(tr => ({
      d: tr.querySelector('.d').value.trim(), c: +tr.querySelector('.c').value || 0, u: tr.querySelector('.u').value.trim(), p: +tr.querySelector('.p').value || 0, tr,
    })).filter(l => l.d || l.c || l.p);
    lineas.forEach(l => { l.s = l.c * l.p; });
    let sub = lineas.reduce((t, l) => t + l.s, 0);
    const min = +$('hzQMin').value || 0, ajusteMin = min > sub ? min - sub : 0;
    sub += ajusteMin;
    const des = Math.round(sub * Math.min(100, Math.max(0, +$('hzQDes').value || 0)) / 100), neto = sub - des;
    const iva = $('hzQIva').checked ? Math.round(neto * 0.19) : 0;
    return { lineas, ajusteMin, sub, des, neto, iva, total: neto + iva };
  }
  function totales() {
    if (!$('hzQTot')) return;
    const r = calc();
    r.lineas.forEach(l => { l.tr.querySelector('.s').textContent = clp(l.s); });
    if ($('hzQBig')) $('hzQBig').textContent = clp(r.total);
    $('hzQTot').innerHTML = (r.ajusteMin ? `<tr><td>Ajuste a cargo mínimo</td><td class="n">${clp(r.ajusteMin)}</td></tr>` : '') +
      `<tr><td>Subtotal</td><td class="n">${clp(r.sub)}</td></tr>` + (r.des ? `<tr><td>Descuento</td><td class="n">− ${clp(r.des)}</td></tr>` : '') +
      `<tr><td>Neto</td><td class="n">${clp(r.neto)}</td></tr>` + ($('hzQIva').checked ? `<tr><td>IVA 19 %</td><td class="n">${clp(r.iva)}</td></tr>` : '') +
      `<tr class="hz-tot"><td>Total</td><td class="n">${clp(r.total)}</td></tr>`;
  }
  function generarCotizacion() {
    const r = calc();
    if (!r.lineas.length || !r.total) { aviso('Agrega al menos una línea con cantidad y precio.'); return; }
    const cfg = ls.get(QK, {}), n = (cfg.n || 0) + 1, ls0 = r.lineas;
    const aplic = ls0.find(l => /aplicaci/i.test(l.d)), tras = ls0.find(l => /traslado/i.test(l.d));
    ls.set(QK, { ...cfg, n, tarifa: aplic ? aplic.p : cfg.tarifa, traslado: tras ? tras.p : cfg.traslado, minimo: +$('hzQMin').value || 0,
      iva: $('hzQIva').checked, validez: +$('hzQVal').value || 15, emisor: $('hzQEmi').value.trim() });
    const folio = 'COT-' + String(n).padStart(4, '0'), val = new Date(); val.setDate(val.getDate() + (+$('hzQVal').value || 15));
    const fila = (t, v) => v ? `<tr><td>${t}</td><td>${esc(v)}</td></tr>` : '';
    documento('Cotización ' + folio, `
      <table class="kv">${fila('Emisor', $('hzQEmi').value.trim())}${fila('Cliente', $('hzQCli').value.trim())}${fila('RUT', $('hzQRut').value.trim())}${fila('Predio', $('hzQPre').value.trim())}
        <tr><td>Válida hasta</td><td>${val.toLocaleDateString('es-CL', { dateStyle: 'long' })}</td></tr></table>
      <h2>Detalle</h2><table><thead><tr><th>Descripción</th><th class="n">Cantidad</th><th>Unidad</th><th class="n">Precio unitario</th><th class="n">Subtotal</th></tr></thead><tbody>
      ${ls0.map(l => `<tr><td>${esc(l.d)}</td><td class="n">${num(l.c, Number.isInteger(l.c) ? 0 : 2)}</td><td>${esc(l.u)}</td><td class="n">${clp(l.p)}</td><td class="n">${clp(l.s)}</td></tr>`).join('')}
      ${r.ajusteMin ? `<tr><td colspan="4">Ajuste a cargo mínimo</td><td class="n">${clp(r.ajusteMin)}</td></tr>` : ''}</tbody></table>
      <table style="max-width:360px;margin:14px 0 0 auto"><tbody>
        <tr><td>Subtotal</td><td class="n">${clp(r.sub)}</td></tr>${r.des ? `<tr><td>Descuento</td><td class="n">− ${clp(r.des)}</td></tr>` : ''}
        <tr><td>Neto</td><td class="n">${clp(r.neto)}</td></tr>${$('hzQIva').checked ? `<tr><td>IVA 19 %</td><td class="n">${clp(r.iva)}</td></tr>` : ''}
        <tr class="tot"><td>Total</td><td class="n">${clp(r.total)}</td></tr></tbody></table>
      ${$('hzQNot').value.trim() ? `<h2>Notas</h2><p>${esc($('hzQNot').value.trim())}</p>` : ''}
      <p class="muted" style="margin-top:28px">Valores en pesos chilenos. La superficie final se ajusta según el límite de aplicación definido en la prescripción.</p>`, 'cotizacion_' + folio);
  }

  // =================================================================
  // 5) CLIMA PARA APLICAR (Open-Meteo)
  // =================================================================
  // Plan gratuito de Open-Meteo: solo uso no comercial. Con un plan pagado se pega la clave en «Configuración»
  // y se usa el servidor de clientes.
  const WK = 'presc_clima';
  const LIM0 = { vMax: 15, vPrec: 10, vMin: 2, rMax: 20, tMax: 30, tMin: 5, hrMin: 40, lluvia: 0.2, prob: 40, dtMin: 2, dtMax: 8, dtNo: 10 };
  const cfgClima = () => ({ lim: { ...LIM0, ...(ls.get(WK, {}).lim || {}) }, clave: ls.get(WK, {}).clave || '', lugar: ls.get(WK, {}).lugar || null });
  const guardarClima = c => ls.set(WK, { ...ls.get(WK, {}), ...c });
  let climaDatos = null, climaPendiente = null;

  // Delta T = temperatura seca − temperatura de bulbo húmedo (fórmula de Stull, 2011)
  function deltaT(t, hr) {
    if (!Number.isFinite(t) || !Number.isFinite(hr)) return NaN;
    const tw = t * Math.atan(0.151977 * Math.sqrt(hr + 8.313659)) + Math.atan(t + hr) - Math.atan(hr - 1.676331) +
      0.00391838 * Math.pow(hr, 1.5) * Math.atan(0.023101 * hr) - 4.686035;
    return t - tw;
  }
  const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const rumbo = g => Number.isFinite(g) ? DIRS[Math.round(((g % 360) + 360) % 360 / 22.5) % 16] : '—';

  // Evalúa una hora: devuelve { nivel: 0 apto | 1 precaución | 2 no aplicar, motivos: [...] }
  function evaluar(h, L) {
    const m = [], sube = (n, txt) => { m.push({ n, txt }); };
    if (h.viento > L.vMax) sube(2, 'viento ' + num(h.viento, 0) + ' km/h');
    else if (h.viento > L.vPrec) sube(1, 'viento ' + num(h.viento, 0) + ' km/h');
    else if (h.viento < L.vMin) sube(1, 'calma (posible inversión térmica)');
    if (h.rafaga > L.rMax) sube(2, 'ráfagas ' + num(h.rafaga, 0) + ' km/h');
    if (h.lluvia >= L.lluvia) sube(2, 'lluvia ' + num(h.lluvia, 1) + ' mm');
    else if (Number.isFinite(h.prob) && h.prob >= L.prob) sube(1, 'probabilidad de lluvia ' + num(h.prob, 0) + ' %');
    if (h.temp > L.tMax) sube(2, 'temperatura ' + num(h.temp, 0) + ' °C');
    else if (h.temp < L.tMin) sube(1, 'temperatura ' + num(h.temp, 0) + ' °C');
    if (Number.isFinite(h.dt)) {
      if (h.dt > L.dtNo) sube(2, 'Delta T ' + num(h.dt, 1) + ' (evaporación alta)');
      else if (h.dt > L.dtMax) sube(1, 'Delta T ' + num(h.dt, 1));
      else if (h.dt < L.dtMin) sube(1, 'Delta T ' + num(h.dt, 1) + ' (gotas finas a la deriva)');
    }
    if (h.hr < L.hrMin) sube(1, 'humedad ' + num(h.hr, 0) + ' %');
    return { nivel: m.reduce((t, x) => Math.max(t, x.n), 0), motivos: m.sort((a, b) => b.n - a.n).map(x => x.txt) };
  }
  const NIV = [{ t: 'Apto', c: '#1f8a4c', e: '🟢' }, { t: 'Precaución', c: '#d08a00', e: '🟡' }, { t: 'No aplicar', c: '#c62839', e: '🔴' }];

  async function ubicacionVuelo() {
    const fc = await cuadros();
    if (!fc || !fc.features.length) return null;
    let sx = 0, sy = 0, n = 0;
    for (const f of fc.features) { const r = f.geometry.coordinates[0]; sx += r[0][0]; sy += r[0][1]; n++; }
    return { lat: sy / n, lon: sx / n, nombre: proyecto() || 'Vuelo cargado' };
  }

  function initClima() {
    const s = sec('clima');
    if (!s.dataset.ok) {
      s.dataset.ok = 1;
      const c = cfgClima();
      s.innerHTML = `<h3>Clima para aplicar</h3>
        <p class="hint">Condiciones actuales y pronóstico hora a hora en la ubicación del vuelo, con un semáforo de cuándo conviene aplicar.</p>
        <div class="hz-grid">
          <label class="wide">Ubicación<input id="hzWLugar" type="text" placeholder="Comuna o localidad, por ejemplo: Requínoa"></label>
        </div>
        <div class="hz-btns">
          <button class="btn primary" id="hzWVuelo" type="button">Usar la ubicación del vuelo</button>
          <button class="btn" id="hzWBuscar" type="button">Buscar comuna</button>
          <button class="btn" id="hzWGps" type="button">Mi ubicación</button>
          <button class="btn" id="hzWAct" type="button" hidden>Actualizar</button>
        </div>
        <p class="hint" id="hzWDonde"></p>
        <div id="hzWRes"></div>
        <details style="margin-top:14px"><summary style="cursor:pointer;font-weight:700">Configuración del semáforo</summary>
          <p class="hint" style="margin-top:8px">Valores de partida. Ajústalos según tu dron, el producto y la etiqueta. Se guardan en este navegador.</p>
          <div class="hz-grid" id="hzWLim">
            ${[['vMax', 'Viento máximo (km/h)'], ['vPrec', 'Viento: precaución desde (km/h)'], ['vMin', 'Viento mínimo (km/h)'], ['rMax', 'Ráfaga máxima (km/h)'],
               ['tMax', 'Temperatura máxima (°C)'], ['tMin', 'Temperatura mínima (°C)'], ['hrMin', 'Humedad mínima (%)'], ['lluvia', 'Lluvia: no aplicar desde (mm/h)'],
               ['prob', 'Prob. de lluvia: precaución desde (%)'], ['dtMin', 'Delta T mínimo'], ['dtMax', 'Delta T ideal hasta'], ['dtNo', 'Delta T: no aplicar sobre']]
              .map(([k, t]) => `<label>${t}<input type="number" step="any" data-l="${k}" value="${c.lim[k]}"></label>`).join('')}
          </div>
          <div class="hz-btns"><button class="btn" id="hzWRest" type="button">Restablecer valores de partida</button></div>
          <div class="hz-grid"><label class="wide">Clave de API de Open-Meteo (solo si contratas el plan comercial)<input id="hzWKey" type="text" value="${esc(c.clave)}" placeholder="Déjalo vacío para usar el plan gratuito (uso no comercial)"></label></div>
        </details>
        <p class="hint" style="margin-top:12px">Datos meteorológicos: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0). Son estimaciones de modelos meteorológicos para la coordenada, no mediciones de una estación en el predio: confirma el viento en terreno antes de volar.</p>`;
      $('hzWVuelo').onclick = async () => {
        const u = await ubicacionVuelo();
        if (!u) { $('hzWDonde').textContent = 'No hay un vuelo cargado: busca la comuna o usa tu ubicación.'; return; }
        consultar(u);
      };
      $('hzWBuscar').onclick = buscarLugar;
      $('hzWLugar').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); buscarLugar(); } };
      $('hzWGps').onclick = () => {
        if (!navigator.geolocation) { $('hzWDonde').textContent = 'Este navegador no entrega la ubicación.'; return; }
        $('hzWDonde').textContent = 'Obteniendo tu ubicación…';
        navigator.geolocation.getCurrentPosition(p => consultar({ lat: p.coords.latitude, lon: p.coords.longitude, nombre: 'Mi ubicación' }),
          () => { $('hzWDonde').textContent = 'No se pudo obtener tu ubicación (revisa el permiso del navegador).'; }, { timeout: 15000 });
      };
      $('hzWAct').onclick = () => { const l = cfgClima().lugar; if (l) consultar(l); };
      $('hzWLim').oninput = e => {
        const k = e.target.dataset.l, v = parseFloat(e.target.value); if (!k || !Number.isFinite(v)) return;
        const lim = { ...cfgClima().lim, [k]: v }; guardarClima({ lim }); if (climaDatos) pintarClima();
      };
      $('hzWRest').onclick = () => { guardarClima({ lim: { ...LIM0 } }); s.querySelectorAll('[data-l]').forEach(i => { i.value = LIM0[i.dataset.l]; }); if (climaDatos) pintarClima(); };
      $('hzWKey').onchange = e => guardarClima({ clave: e.target.value.trim() });
    }
    // Al abrir: si hay vuelo, su ubicación; si no, la última usada
    if (!climaDatos) {
      ubicacionVuelo().then(u => { const l = u || cfgClima().lugar; if (l) consultar(l); else $('hzWDonde').textContent = 'Carga un vuelo, busca una comuna o usa tu ubicación.'; });
    }
  }

  async function buscarLugar() {
    const q = $('hzWLugar').value.trim(); if (!q) { $('hzWLugar').focus(); return; }
    $('hzWDonde').textContent = 'Buscando «' + q + '»…';
    try {
      const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=5&language=es&format=json&name=' + encodeURIComponent(q));
      const d = await r.json();
      const res = (d.results || []).sort((a, b) => (b.country_code === 'CL') - (a.country_code === 'CL'));
      if (!res.length) { $('hzWDonde').textContent = 'No encontré «' + q + '». Prueba con el nombre de la comuna.'; return; }
      const x = res[0];
      consultar({ lat: x.latitude, lon: x.longitude, nombre: [x.name, x.admin1, x.country].filter(Boolean).join(', ') });
    } catch (e) { $('hzWDonde').textContent = 'No se pudo buscar: revisa tu conexión a internet.'; }
  }

  async function consultar(lugar) {
    guardarClima({ lugar });
    $('hzWDonde').textContent = 'Consultando el clima en ' + lugar.nombre + '…';
    const c = cfgClima();
    const vars = 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation';
    const host = c.clave ? 'https://customer-api.open-meteo.com' : 'https://api.open-meteo.com';
    const url = host + '/v1/forecast?latitude=' + lugar.lat.toFixed(4) + '&longitude=' + lugar.lon.toFixed(4) +
      '&current=' + vars + ',weather_code&hourly=' + vars + ',precipitation_probability' +
      '&wind_speed_unit=kmh&timezone=auto&forecast_hours=48' + (c.clave ? '&apikey=' + encodeURIComponent(c.clave) : '');
    try {
      const r = await fetch(url);
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.reason || ('error ' + r.status));
      climaDatos = { lugar, d, hora: new Date() };
      pintarClima();
    } catch (e) {
      console.error(e);
      $('hzWDonde').textContent = 'No se pudo obtener el clima (' + (e.message || e) + '). Revisa tu conexión' + (c.clave ? ' o la clave de API.' : '.');
    }
  }

  function horas() {
    const H = climaDatos.d.hourly, n = (H.time || []).length, out = [];
    for (let i = 0; i < n; i++) {
      const h = { t: H.time[i], temp: H.temperature_2m[i], hr: H.relative_humidity_2m[i], viento: H.wind_speed_10m[i], rafaga: H.wind_gusts_10m[i],
        dir: H.wind_direction_10m[i], lluvia: H.precipitation[i], prob: (H.precipitation_probability || [])[i] };
      h.dt = deltaT(h.temp, h.hr);
      out.push(h);
    }
    return out;
  }

  // Ventanas: horas seguidas aptas (de día, entre 6 y 21 h)
  function ventanas(hs, L) {
    const v = []; let cur = null;
    for (const h of hs) {
      const hh = +h.t.slice(11, 13), ok = evaluar(h, L).nivel === 0 && hh >= 6 && hh <= 21;
      if (ok) { if (!cur) cur = { ini: h.t, fin: h.t, n: 0 }; cur.fin = h.t; cur.n++; }
      else if (cur) { v.push(cur); cur = null; }
    }
    if (cur) v.push(cur);
    return v.filter(x => x.n >= 2).sort((a, b) => b.n - a.n).slice(0, 4).sort((a, b) => a.ini.localeCompare(b.ini));
  }
  const diaHora = t => { const d = new Date(t); return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }) + ' ' + t.slice(11, 16); };

  function pintarClima() {
    const { lugar, d, hora } = climaDatos, L = cfgClima().lim, C = d.current || {};
    const ahora = { temp: C.temperature_2m, hr: C.relative_humidity_2m, viento: C.wind_speed_10m, rafaga: C.wind_gusts_10m, dir: C.wind_direction_10m, lluvia: C.precipitation };
    const hs = horas();
    const h0 = hs.find(h => h.t.slice(0, 13) === String(C.time || '').slice(0, 13));
    ahora.prob = h0 ? h0.prob : NaN;
    ahora.dt = deltaT(ahora.temp, ahora.hr);
    const ev = evaluar(ahora, L), nv = NIV[ev.nivel], vs = ventanas(hs, L);
    $('hzWAct').hidden = false;
    $('hzWDonde').innerHTML = esc(lugar.nombre) + ' · ' + lugar.lat.toFixed(4) + ', ' + lugar.lon.toFixed(4) + ' · consultado a las ' + hora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const NC = ['#74BF56', '#E8B931', '#E5583F'];
    const col = NC[ev.nivel], estado = ['Apto para aplicar', 'Aplicar con precaución', 'No aplicar ahora'][ev.nivel];
    const vmaxEsc = Math.max(L.vMax * 1.6, 25, ...hs.map(h => h.viento || 0));
    $('hzWRes').innerHTML = `
      <div class="hz-wx">
        ${dialViento(ahora, L, col)}
        <div>
          <p class="hz-state" style="color:${col}"><i></i>${estado}</p>
          <p class="hz-why">${ev.motivos.length ? 'Atención: <b>' + esc(ev.motivos.join(', ')) + '</b>.' : 'Todas las condiciones están dentro de tus límites.'}</p>
          <div class="hz-read">
            <div><strong>${num(ahora.temp, 1)}°</strong><span>Temperatura</span></div>
            <div><strong>${num(ahora.hr, 0)}%</strong><span>Humedad relativa</span></div>
            <div class="${ahora.dt >= L.dtMin && ahora.dt <= L.dtMax ? 'hoja' : 'sol'}"><strong>${num(ahora.dt, 1)}</strong><span>Delta T (ideal ${num(L.dtMin, 0)} a ${num(L.dtMax, 0)})</span></div>
            <div><strong>${num(ahora.lluvia, 1)}<small style="font-size:15px"> mm</small></strong><span>Lluvia${Number.isFinite(ahora.prob) ? ', probabilidad ' + num(ahora.prob, 0) + '%' : ''}</span></div>
          </div>
          <button class="btn primary" id="hzWCuad" type="button">Usar en el cuaderno de campo</button>
        </div>
      </div>
      <h3>Mejores ventanas para aplicar</h3>
      ${vs.length ? '<div class="hz-win">' + vs.map(v => `<span><b>${diaHora(v.ini)}–${v.fin.slice(11, 13)}:59</b>${v.n} horas seguidas</span>`).join('') + '</div>'
        : '<p class="hint">No hay dos horas seguidas aptas entre las 6 y las 21 h en las próximas 48 horas con tus límites.</p>'}
      <h3>Próximas 48 horas</h3>
      <p class="hint">La altura de cada barra es la velocidad del viento; el color, el semáforo de esa hora. Pasa el cursor sobre una barra para ver el detalle.</p>
      <div class="hz-strip">${hs.map((h, k) => { const e = evaluar(h, L);
        return `<i class="${k && h.t.slice(11, 13) === '00' ? 'nuevo-dia' : ''}" style="height:${Math.max(6, Math.min(100, 100 * (h.viento || 0) / vmaxEsc))}%;background:${NC[e.nivel]}" title="${esc(diaHora(h.t) + ' · ' + ['Apto', 'Precaución', 'No aplicar'][e.nivel] + ' · viento ' + num(h.viento, 0) + ' km/h, ráfagas ' + num(h.rafaga, 0) + ' · ' + num(h.temp, 0) + '° · Delta T ' + num(h.dt, 1) + (e.motivos.length ? ' · ' + e.motivos.join(', ') : ''))}"></i>`; }).join('')}</div>
      <div class="hz-hours">${hs.map((h, k) => `<span>${k % 6 === 0 ? (h.t.slice(11, 13) === '00' || k === 0 ? diaHora(h.t).replace(/ \d\d:00$/, '') + ' ' : '') + h.t.slice(11, 13) + 'h' : ''}</span>`).join('')}</div>
      <details style="margin-top:14px"><summary>Ver tabla hora a hora</summary>
      <div style="overflow-x:auto;margin-top:8px"><table class="hz-tab" style="min-width:760px"><thead><tr><th>Hora</th><th>Estado</th><th class="n">°C</th><th class="n">Viento</th><th class="n">Ráfagas</th><th>Dirección</th><th class="n">HR %</th><th class="n">Delta T</th><th class="n">Lluvia</th><th>Motivo</th></tr></thead><tbody>
      ${hs.map(h => { const e = evaluar(h, L); return `<tr>
        <td style="white-space:nowrap">${diaHora(h.t)}</td><td><span style="color:${NC[e.nivel]};font-weight:600">● ${['Apto', 'Precaución', 'No aplicar'][e.nivel]}</span></td><td class="n">${num(h.temp, 0)}</td><td class="n">${num(h.viento, 0)}</td><td class="n">${num(h.rafaga, 0)}</td>
        <td>${rumbo(h.dir)}</td><td class="n">${num(h.hr, 0)}</td><td class="n">${num(h.dt, 1)}</td>
        <td class="n">${h.lluvia > 0 ? num(h.lluvia, 1) + ' mm' : (Number.isFinite(h.prob) && h.prob ? num(h.prob, 0) + '%' : '—')}</td>
        <td><small>${esc(e.motivos.join(', '))}</small></td></tr>`; }).join('')}
      </tbody></table></div></details>`;
    $('hzWCuad').onclick = () => { climaPendiente = { temp: ahora.temp, viento: ahora.viento, hr: ahora.hr, lugar: lugar.nombre, nivel: nv.t }; abrir('cuaderno'); };
  }
  function dialViento(a, L, col) {
    const R = 100, cx = 120, cy = 120, ang = Number.isFinite(a.dir) ? a.dir : 0;
    const marcas = Array.from({ length: 72 }, (_, i) => { const t = i * 5 * Math.PI / 180, l = i % 6 === 0 ? 10 : 4;
      return `<line x1="${cx + Math.sin(t) * R}" y1="${cy - Math.cos(t) * R}" x2="${cx + Math.sin(t) * (R - l)}" y2="${cy - Math.cos(t) * (R - l)}" stroke="#4d6f7b" stroke-width="${i % 6 === 0 ? 1.6 : 1}"/>`; }).join('');
    const pts = [['N', 0], ['E', 90], ['S', 180], ['O', 270]].map(([n, g]) => { const t = g * Math.PI / 180;
      return `<text x="${cx + Math.sin(t) * (R - 22)}" y="${cy - Math.cos(t) * (R - 22) + 5}" text-anchor="middle" font-family="Chakra Petch,sans-serif" font-size="14" font-weight="600" fill="${n === 'N' ? '#F6A623' : '#93AEB3'}">${n}</text>`; }).join('');
    // Arco de velocidad: hasta el viento máximo configurado = 3/4 de vuelta
    const frac = Math.max(0, Math.min(1, (a.viento || 0) / (L.vMax || 15))), largo = 2 * Math.PI * (R + 9);
    return `<svg class="hz-dial" viewBox="0 0 240 240" role="img" aria-label="Viento ${num(a.viento, 0)} km/h desde el ${rumbo(a.dir)}, ráfagas ${num(a.rafaga, 0)} km/h">
      <circle cx="${cx}" cy="${cy}" r="${R + 9}" fill="none" stroke="#24414c" stroke-width="7"/>
      <circle cx="${cx}" cy="${cy}" r="${R + 9}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${largo * .75 * frac} ${largo}" transform="rotate(135 ${cx} ${cy})"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="#10232b"/>${marcas}${pts}
      <g class="aguja" style="transform-origin:${cx}px ${cy}px;transform:rotate(${ang + 180}deg)">
        <path d="M${cx} ${cy - 78} l9 22 h-6 v34 h-6 v-34 h-6z" fill="${col}"/><path d="M${cx - 3} ${cy + 46} h6 v24 h-6z" fill="#4d6f7b"/></g>
      <circle cx="${cx}" cy="${cy}" r="34" fill="#152B35" stroke="#2A4B58"/>
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="Chakra Petch,sans-serif" font-size="30" font-weight="700" fill="#EAF2EF">${num(a.viento, 0)}</text>
      <text x="${cx}" y="${cy + 21}" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-size="11" fill="#93AEB3">km/h</text>
      <text x="${cx}" y="236" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-size="12" fill="#93AEB3">desde el ${rumbo(a.dir)} · ráfagas ${num(a.rafaga, 0)} km/h</text>
    </svg>`;
  }
  // Pasa las condiciones al formulario del cuaderno de campo
  function aplicarClimaPendiente() {
    if (!climaPendiente) return;
    const c = climaPendiente; climaPendiente = null;
    const set = (k, v) => { const el = $('hzC_' + k); if (el && Number.isFinite(v)) el.value = Math.round(v * 10) / 10; };
    set('temp', c.temp); set('viento', c.viento); set('hr', c.hr);
    const obs = $('hzC_obs');
    if (obs) obs.value = ((obs.value ? obs.value + ' · ' : '') + 'Clima Open-Meteo ' + new Date().toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) + ': ' + c.nivel).slice(0, 300);
    aviso('Temperatura, viento y humedad copiados al cuaderno de campo.');
  }

  // ---------- Botón en la barra superior ----------
  function iniciar() {
    document.body.appendChild(dlg);
    const tools = document.querySelector('header.top .hdr-tools') || document.querySelector('header.top');
    if (!tools || $('hzOpen')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'hzOpen'; b.className = 'theme-btn hz-open';
    b.title = 'Puntos de inspección, comparar vuelos, cuaderno de campo, cotizador y clima';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4Z"/></svg>Herramientas';
    b.onclick = () => abrir();
    const modo = tools.querySelector('.ps-modo');
    modo ? modo.after(b) : tools.insertBefore(b, tools.firstChild);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', iniciar) : iniciar();
  window.PrescriptorHerramientas = { abrir };
})();
