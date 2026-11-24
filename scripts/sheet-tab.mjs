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

/** Martial arts styles are weapon items named "Martial arts: <style>" (OA, OA Lite and the Dragon add-on). */
export const STYLE_PREFIX = "Martial arts:";
export const isStyle = i => i?.type === "weapon" && String(i.name ?? "").startsWith(STYLE_PREFIX);

/**
 * Proficiency slots in use (OA p.51 and p.106: weapons, peaceful skills, martial arts styles and maneuvers share one pool):
 * weapon proficiencies on the Proficiencies list, plus nonweapon proficiencies and maneuvers, plus any style on the
 * sheet that is not yet on the weapon proficiency list.
 */
export function slotsUsed(actor) {
  const s = actor.system;
  const profNames = new Set((s.profs?.weapons ?? []).map(w => String(w.name ?? "").toLowerCase()));
  const weapon = (s.profs?.weapons ?? []).filter(w => w.name).reduce((t, w) => t + (!w.spec ? 1 : 2 + (w.bow ? 1 : 0) + (w.spec === "double" ? 1 : 0)), 0);
  const items = actor.items.filter(i => i.type === "proficiency").reduce((t, i) => t + (i.system.slots ?? 0) + (i.system.improvements ?? 0), 0);
  const styles = actor.items.filter(i => isStyle(i) && !profNames.has(i.name.toLowerCase())).length;
  return weapon + items + styles;
}

/**
 * Ki powers with a daily limit, by class key: (level) => [{ id, label, max, all? }].
 * "all" marks a power that needs all of the day's ki (no other ki power used that day).
 * Add-ons can add classes with registerKi(key, fn).
 */
export const KI_POWERS = {
  bushi: L => [{ id: "kiai", label: "Kiai: fight as two levels higher for a turn (OA p.16)", max: 1 }],
  kensai: L => [{ id: "maxdmg", label: "Maximum damage with one hit, declared before rolling (OA p.16)", max: L },
    ...(L >= 11 ? [{ id: "whirl", label: "Whirlwind attack (OA p.17)", max: 1, all: true }] : [])],
  monkOA: L => [{ id: "save", label: `Ki save vs. magic: no damage or effect on a save${L >= 9 ? ", half on a failure" : ""} (OA p.18)`, max: L }],
  ninja: L => [{ id: "breath", label: `Hold breath ${L} rounds (OA p.21)`, max: 1 },
    ...(L >= 5 ? [{ id: "water", label: `Walk on water, ${5 * L} ft (OA p.21)`, max: L }] : []),
    ...(L >= 12 ? [{ id: "walls", label: "Pass through walls (OA p.21)", max: 1, all: true }] : [])],
  samurai: L => [{ id: "str", label: "Strength 18/00 for one round (OA p.22)", max: L },
    ...(L >= 9 ? [{ id: "great", label: "Great kiai; no normal ki that day (OA p.22)", max: 1, all: true }] : [])],
  shukenja: L => [{ id: "save", label: "+3 on a saving throw, declared before the roll (OA p.23)", max: L }],
  sohei: L => L >= 3 ? [{ id: "berserk", label: "Ki berserk for one turn (OA p.24)", max: 1 }] : [],
  wuJen: L => [{ id: "init", label: "+3 initiative for one round (OA p.25)", max: 1 },
    ...(L >= 4 ? [{ id: "maxspell", label: `Cast a spell of level ${Math.max(1, L - 3)} or lower at maximum effect (OA p.25)`, max: 1 }] : [])],
  yakuza: L => [{ id: "halve", label: "Halve the damage of one attack, once a round (OA p.27)", max: L }]
};
export function registerKi(key, fn) { KI_POWERS[key] = fn; }

function kiBox(actor) {
  const s = actor.system, used = actor.flags?.[MID]?.kiUsed ?? {};
  const rows = [];
  for (const c of s.classInfo ?? []) {
    const fn = KI_POWERS[c.key];
    if (!fn) continue;
    const powers = fn(Math.max(1, c.level));
    if (!powers.length) continue;
    const any = powers.some(p => (used[`${c.key}-${p.id}`] ?? 0) > 0);
    for (const p of powers) {
      const id = `${c.key}-${p.id}`, n = used[id] ?? 0;
      const warn = p.all && n > 0 && powers.some(q => q !== p && (used[`${c.key}-${q.id}`] ?? 0) > 0);
      rows.push(`<tr><td class="left">${esc(c.label)}: ${esc(p.label)}${p.all ? ` <span class="hint">(needs all of the day's ki)</span>` : ""}${warn ? ` <strong>Other ki was used today.</strong>` : ""}</td>
        <td><input type="number" min="0" max="${p.max}" data-oa-ki="${id}" value="${n}" style="width:3.5em"> of ${p.max}${n > p.max ? " <strong>(over)</strong>" : ""}</td></tr>`);
    }
  }
  if (!rows.length) return "";
  return box("Ki uses today", `<table class="oa-ki"><tr><th class="left">Power</th><th>Used</th></tr>${rows.join("")}</table>
    <button type="button" class="oa-ki-reset"><i class="fa-solid fa-sun"></i> New day (clear ki uses)</button>
    <p class="hint">Ki powers recover each day. Powers marked as needing all of the day's ki can be used only if no other ki power was used that day.</p>`);
}

function styleList(actor) {
  const styles = actor.items.filter(isStyle).map(i => i.name.slice(STYLE_PREFIX.length).trim());
  const man = actor.items.filter(i => i.type === "proficiency" && i.system.group === "oaManeuver").map(i => i.name);
  return `Styles on the sheet: ${styles.length ? esc(styles.join(", ")) : "none"}. Maneuvers on the sheet: ${man.length ? esc(man.join(", ")) : "none"}.`;
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
    const used = slotsUsed(actor);
    const ma = CLASSES[c.key].oa ?? {};
    const req = Object.entries(ma.min ?? {}).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(", ");
    out.push(box(`${esc(c.label)} ${c.level}`, `
      ${lines.map(l => `<p>${esc(l.text)} <span class="hint">(OA p.${l.page})</span></p>`).join("")}
      <p class="hint">Minimums: ${esc(req)}${ma.max ? `; ${Object.entries(ma.max).map(([k, v]) => `${k.toUpperCase()} at most ${v}`).join(", ")}` : ""}. Alignment: ${esc(ma.align)}.
        ${ma.bonus ? `+10% experience with ${ma.bonus.map(([k, v]) => `${k.toUpperCase()} ${v}`).join(" and ")}.` : "No experience bonus."}</p>
      ${pool ? `<p><strong>Proficiencies (OA Table 56):</strong> ${pool.total} (${pool.initial} at 1st${pool.per ? `, one more every ${pool.per === 1 ? "level" : `${pool.per} levels`}` : ""}). Weapons, peaceful skills, martial arts styles and maneuvers share these slots.</p>
        <p>${used > pool.total ? `<strong>Slots used: ${used} of ${pool.total} (over by ${used - pool.total}).</strong>` : `Slots used: ${used} of ${pool.total}.`}</p>`
        : `<p class="hint">${c.key === "monkOA" ? "Monk proficiencies: one unarmed style with two of its maneuvers, plus five slots (religion and calligraphy required); OA Table 56 has no monk row, so no rate of gain is given." : c.key === "yakuza" ? "Yakuza: three proficiency slots plus gaming; OA Table 56 has no yakuza row, so no rate of gain is given." : ""} Slots used: ${slotsUsed(actor)}.</p>`}
      ${ma.nonProfNote ? `<p class="hint">${esc(ma.nonProfNote)}</p>` : ""}`));
  }

  /* ---- ki ---- */
  out.push(kiBox(actor));

  /* ---- martial arts ---- */
  out.push(box("Martial arts (OA p.101-106)", `
    <div class="oa-grid">
      <label><span>Style</span><input type="text" data-oa-flag="style" value="${esc(flags.style ?? "")}" placeholder="e.g. Karate"></label>
    </div>
    <label class="oa-wide"><span>Special maneuvers known</span><textarea data-oa-flag="maneuvers" rows="3">${esc(flags.maneuvers ?? "")}</textarea></label>
    <p>${styleList(actor)}</p>
    <p class="hint">Drag a style from the OA Lite Martial Arts compendium onto the sheet: it goes to the Weapons list so you can attack with it, is added to the weapon proficiency list (learning a style costs one proficiency slot, OA p.106) and fills in the Style box if it is empty. Each maneuver costs one more slot. Rules the sheet does not check: a master must teach the style; maneuvers are learned in order of difficulty (all difficulty 1 before any difficulty 2); no more than two slots go to one style per level (OA p.106). Maneuvers are described in the OA Lite Martial Arts compendium and the Martial Arts journal.</p>`));

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
  sec.querySelectorAll("[data-oa-ki]").forEach(el => el.addEventListener("change", ev => {
    ev.stopPropagation();
    actor.setFlag(MID, `kiUsed.${el.dataset.oaKi}`, Math.max(0, Number(el.value) || 0));
  }));
  sec.querySelector(".oa-ki-reset")?.addEventListener("click", ev => {
    ev.preventDefault();
    actor.update({ [`flags.${MID}.-=kiUsed`]: null });
  });
  sec.querySelectorAll("[data-oa-flag]").forEach(el => el.addEventListener("change", ev => {
    ev.stopPropagation();
    const v = el.type === "number" ? (el.value === "" ? null : Number(el.value)) : el.value;
    actor.setFlag(MID, el.dataset.oaFlag, v);
  }));
}
