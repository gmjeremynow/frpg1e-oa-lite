/** OA tab on the character and NPC sheets. */
import { CLASSES } from "./classes.mjs";
import { classFeatures } from "./features.mjs";
import { HENGEYOKAI } from "./races.mjs";
import { WUJEN_INT } from "./tables.mjs";

const MID = "frpg1e-oa-lite";
const esc = s => foundry.utils.escapeHTML ? foundry.utils.escapeHTML(String(s ?? "")) : String(s ?? "");
const box = (title, body) => `<div class="box"><h3 class="box-title">${title}</h3>${body}</div>`;

/** Proficiencies from OA Table 56: [initial, levels per added slot]; 1/1 adds one each time the character advances. */
export function profPool(def, level) {
  const p = def?.oa?.prof;
  if (!p || !p[0]) return null;
  const [initial, per] = p;
  if (!per) return { initial, extra: 0, total: initial, per: null };
  const extra = per === 1 ? Math.max(0, level - 1) : Math.floor(level / per);
  return { initial, extra, total: initial + extra, per };
}

export function renderOATab(app, element) {
  const root = element instanceof HTMLElement ? element : element?.[0] ?? app.element;
  const actor = app.actor ?? app.document;
  if (!root || !actor || !["character", "npc"].includes(actor.type)) return;
  const tabs = root.querySelector(".sheet-tabs");
  const scroll = root.querySelector(".tab-scroll");
  if (!tabs || !scroll) return;
  root.querySelector(".tab-body[data-tab='oa']")?.remove();
  tabs.querySelector("[data-tab='oa']")?.remove();
  const btn = document.createElement("button");
  btn.type = "button"; btn.dataset.action = "sheetTab"; btn.dataset.tab = "oa"; btn.textContent = "OA";
  tabs.append(btn);
  const sec = document.createElement("section");
  sec.className = "tab-body oa-tab"; sec.dataset.tab = "oa";
  sec.innerHTML = tabHTML(actor);
  scroll.append(sec);
  if (app._tab === "oa") { btn.classList.add("active"); sec.classList.add("active"); }
  wire(sec, actor);
}

export function tabHTML(actor) {
  const s = actor.system, flags = actor.flags?.[MID] ?? {};
  const oaClasses = (s.classInfo ?? []).filter(c => CLASSES[c.key]);
  const out = [];
  /* ---- class abilities ---- */
  for (const c of oaClasses) {
    const lines = classFeatures(c.key, c.level, s);
    const pool = profPool(CLASSES[c.key], c.level);
    const ma = CLASSES[c.key].oa ?? {};
    const req = Object.entries(ma.min ?? {}).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(", ");
    out.push(box(`${esc(c.label)} ${c.level}`, `
      ${lines.map(l => `<p>${esc(l.text)} <span class="hint">(OA p.${l.page})</span></p>`).join("")}
      <p class="hint">Minimums: ${esc(req)}${ma.max ? `; ${Object.entries(ma.max).map(([k, v]) => `${k.toUpperCase()} at most ${v}`).join(", ")}` : ""}. Alignment: ${esc(ma.align)}.
        ${ma.bonus ? `+10% experience with ${ma.bonus.map(([k, v]) => `${k.toUpperCase()} ${v}`).join(" and ")}.` : "No experience bonus."}</p>
      ${pool ? `<p><strong>Proficiencies (OA Table 56):</strong> ${pool.total} (${pool.initial} at 1st${pool.per ? `, one more every ${pool.per === 1 ? "level" : `${pool.per} levels`}` : ""}). Weapons and peaceful skills share these slots.</p>`
        : `<p class="hint">${c.key === "monkOA" ? "Monk proficiencies: one unarmed style with two of its maneuvers, plus five slots (religion and calligraphy required); OA Table 56 has no monk row, so no rate of gain is given." : c.key === "yakuza" ? "Yakuza: three proficiency slots plus gaming; OA Table 56 has no yakuza row, so no rate of gain is given." : ""}</p>`}
      ${ma.nonProfNote ? `<p class="hint">${esc(ma.nonProfNote)}</p>` : ""}`));
  }

  /* ---- martial arts ---- */
  out.push(box("Martial arts (OA p.101-106)", `
    <div class="oa-grid">
      <label><span>Style</span><input type="text" data-oa-flag="style" value="${esc(flags.style ?? "")}" placeholder="e.g. Karate"></label>
    </div>
    <label class="oa-wide"><span>Special maneuvers known</span><textarea data-oa-flag="maneuvers" rows="3">${esc(flags.maneuvers ?? "")}</textarea></label>
    <p class="hint">Drag a style from the OA Martial Arts compendium to the Weapons list to attack with it. Maneuvers are described in the OA Martial Arts compendium and the Martial Arts journal.</p>`));

  /* ---- race extras ---- */
  if (s.details?.race === "hengeyokai") {
    const a = HENGEYOKAI[flags.animal] ?? null;
    out.push(box("Hengeyokai (OA Table 11)", `
      <label><span>Animal</span><select data-oa-flag="animal"><option value=""></option>${Object.entries(HENGEYOKAI).map(([k, v]) => `<option value="${k}" ${k === flags.animal ? "selected" : ""}>${esc(v.label)}</option>`).join("")}</select></label>
      ${a ? `<p>Alignment ${esc(a.align)}; animal form damage ${esc(a.dmg)}, AC ${a.ac}, move ${esc(a.move)}, fly ${esc(a.fly)}, swim ${esc(a.swim)}; ability changes ${esc(a.mods)}.</p>
        <p class="hint">Animal form: half hit points (now ${Math.ceil((s.attributes?.hp?.max ?? 0) / 2)} of ${s.attributes?.hp?.max ?? 0}), no weapons, armor or spells. Changes of form per day: ${Math.max(1, ...((s.classInfo ?? []).map(c => c.level)))}.</p>` : ""}`));
  }
  if (oaClasses.some(c => c.key === "wuJen")) {
    const int = s.abilities?.int?.value ?? 10;
    const w = WUJEN_INT(int);
    out.push(box("Wu jen spells and taboos (OA p.25-26)", `
      ${w ? `<p>Intelligence ${int}: ${w[0]}% to know each listed spell; ${w[1]} to ${w[2]} spells per level (OA Table 32).</p>` : `<p class="hint">OA Table 32 starts at intelligence 9.</p>`}
      <label class="oa-wide"><span>Taboos</span><textarea data-oa-flag="taboos" rows="3">${esc(flags.taboos ?? "")}</textarea></label>`));
  }
  if (oaClasses.some(c => c.key === "yakuza")) {
    out.push(box("Yakuza contacts (OA p.27)", `<label class="oa-wide"><span>Contacts (name, position)</span><textarea data-oa-flag="contacts" rows="3">${esc(flags.contacts ?? "")}</textarea></label>`));
  }
  return out.join("");
}

function wire(sec, actor) {
  sec.querySelectorAll("[data-oa-flag]").forEach(el => el.addEventListener("change", ev => {
    ev.stopPropagation();
    const v = el.type === "number" ? (el.value === "" ? null : Number(el.value)) : el.value;
    actor.setFlag(MID, el.dataset.oaFlag, v);
  }));
}
