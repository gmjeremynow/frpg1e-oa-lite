/** OA tab on the character and NPC sheets. */
import { CLASSES } from "./classes.mjs";
import { MANEUVER_ATTACKS, ALWAYS_ON, attackWeapons, maneuverAttack } from "./maneuvers.mjs";
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



/* ---------- martial arts, ki and slots: the top of the OA tab ---------- */
const STAT_RE = /Attacks per round ([^;]+); damage ([^;]+); armor class (\d+)[^;]*; principal attack: ([^.<]+)/;
const METHOD_KEY = { "kick": "kick", "lock": "lock", "movement": "movement", "push": "push", "strike": "strike", "throw": "throw",
  "vital area": "vital area", "weapon": "weapon", "mental and physical training": "mental", "mental": "mental" };

/** A style's printed numbers, read from its description: { attacks, damage, ac, principal, taught: {method: Set}, taughtText, weapons }. */
export function styleStats(item) {
  const d = String(item?.system?.description ?? "");
  const m = d.match(STAT_RE);
  const t = d.match(/Special maneuvers taught: ([^(<]+?)\s*(\(|<\/p>)/);
  const w = d.match(/Weapons: ([^<]+)<\/p>/);
  const taught = {};
  if (t) for (const part of t[1].split(";")) {
    const mm = part.trim().match(/^([A-Za-z ]+?)\s+([\d,\s]+)$/);
    if (!mm) continue;
    const key = METHOD_KEY[mm[1].toLowerCase()];
    if (key) taught[key] = new Set(mm[2].split(",").map(n => Number(n.trim())).filter(Boolean));
  }
  return m ? { attacks: m[1].trim(), damage: m[2].trim(), ac: Number(m[3]), principal: m[4].trim(), taught, taughtText: t ? t[1].trim() : "", weapons: w ? w[1].trim() : "" }
    : { taught, taughtText: t ? t[1].trim() : "", weapons: w ? w[1].trim() : "" };
}

/** A maneuver's method and difficulty from its description ("Kick 1 (hard)."). */
export function maneuverInfo(item) {
  const d = String(item?.system?.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const m = d.match(/^([A-Za-z ]+?)\s(\d+)(?:\s\(([^)]+)\))?\./);
  if (!m) return { method: item?.system?.specialty ?? "", diff: null, form: "" };
  return { method: m[1].trim(), diff: Number(m[2]), form: m[3] ?? "" };
}

function topHTML(actor, flags, compName) {
  const s = actor.system;
  const weapons = attackWeapons(actor, isStyle);
  const sel = weapons.find(w => w.id === flags.attackWith) ?? weapons[0] ?? null;
  const st = sel && isStyle(sel) ? styleStats(sel) : null;
  const short = n => String(n).replace(/^Martial arts:\s*/, "");
  const line = (label, value) => `<div class="ac-line"><span>${label}</span><strong>${value}</strong></div>`;

  /* style box */
  const opts = weapons.map(w => `<option value="${w.id}" ${w === sel ? "selected" : ""}>${esc(short(w.name))}${isStyle(w) ? "" : " (weapon)"}</option>`).join("");
  const styleBody = sel ? `
      <div class="ac-line"><span>Fighting with</span><select data-oa-flag="attackWith" class="oa-pick">${opts}</select></div>
      ${st?.attacks ? line("Attacks per round", esc(st.attacks)) : ""}
      ${line("Damage S-M / L", esc(`${sel.system.damage?.smRange || sel.system.damage?.sm || "—"} / ${sel.system.damage?.lRange || sel.system.damage?.l || "—"}`))}
      ${st?.ac ? line("Armor class in this style", st.ac) : ""}
      ${st?.principal ? line("Principal attack", esc(st.principal)) : ""}
      ${st?.taughtText ? `<div class="ac-line oa-taught"><span>Maneuvers taught</span><span>${esc(st.taughtText)}</span></div>` : ""}
      ${st?.weapons && st.weapons !== "None." ? `<div class="ac-line oa-taught"><span>Style weapons</span><span>${esc(st.weapons)}</span></div>` : ""}
      <p class="hint">The style's attacks and armor class apply only while fighting in it (OA p.102); armor class is not applied to the sheet.</p>`
    : `<p class="hint">No style on the sheet. Drag one from the ${compName} compendium onto the sheet; it costs one proficiency slot (OA p.106).</p>`;
  const styleBox = `<div class="box oa-style"><h3 class="box-title">Martial Arts
      ${sel ? `<button type="button" class="mini mini-text brawl-btn oa-style-attack" title="Attack with ${esc(short(sel.name))}"><i class="fa-solid fa-hand-fist"></i> Attack</button>` : ""}</h3>${styleBody}</div>`;

  /* ki box */
  const used = flags.kiUsed ?? {};
  const kiRows = [];
  for (const c of s.classInfo ?? []) {
    const fn = KI_POWERS[c.key];
    if (!fn) continue;
    const powers = fn(Math.max(1, c.level));
    for (const p of powers) {
      const id = `${c.key}-${p.id}`, n = used[id] ?? 0;
      const clash = p.all && n > 0 && powers.some(q => q !== p && (used[`${c.key}-${q.id}`] ?? 0) > 0);
      kiRows.push(`<div class="ac-line oa-ki-line ${n >= p.max ? "spent" : ""}"><span>${esc(p.label)}${p.all ? ` <em class="hint">needs all the day's ki</em>` : ""}${clash ? ` <strong class="oa-warn">other ki used today</strong>` : ""}</span>
        <span class="oa-ki-count"><button type="button" class="icon-btn" data-oa-ki-step="${id}" data-step="-1" title="One fewer">−</button><input type="number" min="0" max="${p.max}" data-oa-ki="${id}" value="${n}"><span class="oa-of">/ ${p.max}</span><button type="button" class="icon-btn" data-oa-ki-step="${id}" data-step="1" data-max="${p.max}" title="Use one">+</button></span></div>`);
    }
  }
  const kiBox = `<div class="box oa-ki"><h3 class="box-title">Ki Uses Today
      ${kiRows.length ? `<button type="button" class="mini mini-text brawl-btn oa-ki-reset" title="Ki powers recover each day"><i class="fa-solid fa-sun"></i> New day</button>` : ""}</h3>
    ${kiRows.length ? kiRows.join("") : `<p class="hint">No ki powers with a daily limit for this character's classes.</p>`}</div>`;

  /* maneuvers */
  const man = actor.items.filter(i => i.type === "proficiency" && i.system.group === "oaManeuver")
    .map(i => ({ i, info: maneuverInfo(i) }))
    .sort((a, b) => a.info.method.localeCompare(b.info.method) || (a.info.diff ?? 0) - (b.info.diff ?? 0) || a.i.name.localeCompare(b.i.name));
  const rows = man.map(({ i, info }) => {
    const atk = MANEUVER_ATTACKS[i.name];
    const L = Math.max(1, ...(s.classInfo ?? []).map(c => c.level || 1));
    const use = atk ? (atk.none ? "Attack, no damage" : atk.mult ? `Attack, ×${atk.mult} dice` : atk.dice ? `Attack, ${atk.dice}` : atk.plusLevel ? `Attack, +${L} damage` : "Attack")
      : ALWAYS_ON.has(i.name) ? "Always in effect" : "As described";
    const key = METHOD_KEY[info.method.toLowerCase()];
    // Mental and Physical Training can be learned in any style (OA p.105)
    const off = st && key && key !== "mental" && info.diff && Object.keys(st.taught).length && !st.taught[key]?.has(info.diff);
    const hitText = atk ? (typeof atk.hit === "function" ? atk.hit(L) : atk.hit ?? "") : "";
    return `<tr>
      <td class="left"><a class="oa-man-name" data-oa-man-show="${i.id}" title="Post the description to chat">${esc(i.name)}</a>
        ${hitText ? `<span class="sub-note">${esc(hitText)}</span>` : ""}${off ? `<span class="sub-note oa-warn">Not on ${esc(short(sel.name))}'s list (OA p.105: a master teaches only his style's maneuvers)</span>` : ""}</td>
      <td>${esc(info.method.replace(/^Mental and Physical Training/, "Mental/Physical"))}${info.diff ? ` ${info.diff}` : ""}${info.form ? `<span class="sub-note">${esc(info.form)}</span>` : ""}</td>
      <td>${use}</td>
      <td class="row-tools">${atk ? `<button type="button" class="cast-btn" data-oa-man-attack="${esc(i.name)}" ${sel ? "" : `disabled title="Add a style to the sheet first"`}>Attack</button>` : ""}
        <button type="button" class="cast-btn" data-oa-man-show="${i.id}">Show</button></td></tr>`;
  }).join("");
  const manBox = `<div class="box oa-man"><h3 class="box-title">Maneuvers</h3>
    <table class="ledger oa-man-table"><thead><tr><th class="left">Maneuver</th><th>Method</th><th>Use</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="4" class="hint">Drag maneuvers here from the ${compName} compendium. Each costs one proficiency slot.</td></tr>`}</tbody></table>
    <p class="hint">Target tokens, then click Attack: it rolls to hit with the style above and the chat card gives the maneuver's damage and effect. Click a name to post its description.
      ${sel ? "" : " <strong>Attack buttons need a style on the sheet.</strong>"}</p></div>`;

  /* slots and rules */
  const pools = (s.classInfo ?? []).filter(c => CLASSES[c.key]).map(c => ({ c, p: profPool(CLASSES[c.key], c.level) }));
  const total = pools.find(x => x.p)?.p?.total ?? null;
  const usedSlots = slotsUsed(actor);
  const styles = actor.items.filter(isStyle).length;
  const slotBox = `<div class="box oa-slots"><h3 class="box-title">Proficiency Slots</h3>
    ${line("Slots (OA Table 56)", total ?? "—")}
    ${line("Used", usedSlots)}
    ${total !== null ? line("Free", total - usedSlots < 0 ? `<span class="oa-warn">over by ${usedSlots - total}</span>` : total - usedSlots) : ""}
    ${line("Styles / maneuvers", `${styles} / ${man.length}`)}
    <p class="hint">${total === null ? "OA Table 56 gives no slots for this class; count them by hand. " : ""}Weapons, peaceful skills, styles and maneuvers share one pool (OA p.51). A style costs one slot, each maneuver or style weapon one more.</p></div>`;
  const rulesBox = `<div class="box oa-rules"><h3 class="box-title">Learning Martial Arts</h3>
    <ul class="oa-rule-list">
      <li>Find a master who will teach (10% at first; +10% per respectful visit with a gift), or win a challenge (OA p.105).</li>
      <li>Study a month, then spend a slot for the style's basics (OA p.106).</li>
      <li>Practice an hour a day and six hours a week with the master, or learn nothing more.</li>
      <li>Maneuvers in order of difficulty: every 1 before any 2.</li>
      <li>No more than two slots on one style per level.</li>
      <li>Several styles: one per round; only always-in-effect maneuvers carry over (OA p.106).</li>
    </ul>
    <label class="oa-wide"><span>Notes (master, school, training)</span><textarea data-oa-flag="maneuvers" rows="3">${esc(flags.maneuvers ?? "")}</textarea></label></div>`;

  return `<div class="combat-top">${styleBox}${kiBox}</div>${manBox}<div class="combat-top">${slotBox}${rulesBox}</div>`;
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
  out.push(topHTML(actor, flags, "OA Lite Martial Arts"));
  out.push(`<div class="oa-classes">`);
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
      ${pool ? `<p><strong>Proficiencies (OA Table 56):</strong> ${pool.total} (${pool.initial} at 1st${pool.per ? `, one more every ${pool.per === 1 ? "level" : `${pool.per} levels`}` : ""}). Weapons, peaceful skills, martial arts styles and maneuvers share these slots.</p>
`
        : `<p class="hint">${c.key === "monkOA" ? "Monk proficiencies: one unarmed style with two of its maneuvers, plus five slots (religion and calligraphy required); OA Table 56 has no monk row, so no rate of gain is given." : c.key === "yakuza" ? "Yakuza: three proficiency slots plus gaming; OA Table 56 has no yakuza row, so no rate of gain is given." : ""}</p>`}
      ${ma.nonProfNote ? `<p class="hint">${esc(ma.nonProfNote)}</p>` : ""}`));
  }



  out.push(`</div>`);

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
  const pick = () => { const w = attackWeapons(actor, isStyle); return w.find(i => i.id === actor.getFlag(MID, "attackWith")) ?? w[0] ?? null; };
  sec.querySelector(".oa-style-attack")?.addEventListener("click", ev => { ev.preventDefault(); const w = pick(); if (w) game.frpg1e.Rolls.rollAttack(actor, { item: w }); });
  sec.querySelectorAll("[data-oa-man-attack]").forEach(el => el.addEventListener("click", ev => { ev.preventDefault(); maneuverAttack(actor, pick(), el.dataset.oaManAttack); }));
  sec.querySelectorAll("[data-oa-man-show]").forEach(el => el.addEventListener("click", ev => {
    ev.preventDefault(); const it = actor.items.get(el.dataset.oaManShow); if (it) game.frpg1e.Rolls.rollProficiency(actor, it);
  }));
  sec.querySelectorAll("[data-oa-ki]").forEach(el => el.addEventListener("change", ev => {
    ev.stopPropagation();
    actor.setFlag(MID, `kiUsed.${el.dataset.oaKi}`, Math.max(0, Number(el.value) || 0));
  }));
  sec.querySelectorAll("[data-oa-ki-step]").forEach(el => el.addEventListener("click", ev => {
    ev.preventDefault();
    const id = el.dataset.oaKiStep, cur = Number(actor.getFlag(MID, `kiUsed.${id}`) ?? 0), max = Number(el.dataset.max ?? Infinity);
    const n = Math.max(0, Math.min(max, cur + Number(el.dataset.step)));
    if (n !== cur) actor.setFlag(MID, `kiUsed.${id}`, n);
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
