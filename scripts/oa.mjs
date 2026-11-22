/**
 * OA Lite for 1e FRPG. An optional add-on: enable or disable it in Manage Modules.
 * The OA races, classes, proficiencies, martial arts, spells, equipment, magic items and monsters, without the
 * Eastern Lands setting, family, honor and society rules, Eastern money or the running-the-game chapters.
 * Do not run it together with the full OA module (frpg1e-oa): both register the same races and classes.
 */
import { CLASSES, SPELLS, OA_CLASS_KEYS } from "./classes.mjs";
import { RACES, OA_RACE_KEYS, korobokuruSave } from "./races.mjs";
import { renderOATab } from "./sheet-tab.mjs";
import { offerImport, importCompendia } from "./compendia.mjs";

export const MID = "frpg1e-oa-lite";
const FULL_OA = () => !!game.modules.get("frpg1e-oa")?.active;
let API = null;

Hooks.once("frpg1e.init", api => {
  API = api;
  if (FULL_OA()) { console.error(`${MID} | the full OA module is also active; OA Lite stays off`); API = { conflict: true }; return; }
  if (!api.registerSpellList || !api.hideClasses) {
    console.error(`${MID} | needs 1e FRPG 0.48.0 or later`);
    return;
  }
  api.registerSpellList("shukenja", "Shukenja (OA)");
  api.registerSpellList("wujen", "Wu Jen (OA)");
  for (const [k, l] of [["oaCommon", "Common (OA)"], ["oaArtisan", "Artisan (OA)"], ["oaCourt", "Court (OA)"], ["oaBarbarian", "Barbarian (OA)"], ["oaManeuver", "Martial arts maneuver (OA)"]]) api.registerProficiencyGroup(k, l);
  for (const [k, t] of Object.entries(SPELLS)) api.registerSpellProgression(k, t);
  for (const [k, d] of Object.entries(CLASSES)) api.registerClass(k, d);
  for (const [k, d] of Object.entries(RACES)) api.registerRace(k, d);
});

Hooks.once("init", () => {
  game.settings.register(MID, "oaOnly", { name: "OA races and classes only", scope: "world", config: true, type: Boolean, default: false,
    hint: "Takes the PHB and UA races and classes out of the lists, leaving the OA ones. Off by default, so OA characters sit alongside PHB and UA ones. Characters already using them keep working.",
    onChange: v => applyLists(v), requiresReload: false });
  game.settings.register(MID, "compendiaVersion", { scope: "world", config: false, type: String, default: "" });
  game.settings.registerMenu(MID, "rebuild", { name: "OA Lite compendia", label: "Rebuild OA Lite compendia", icon: "fa-solid fa-book",
    type: class extends foundry.applications.api.ApplicationV2 { render() { importCompendia({ confirm: true }); return this; } }, restricted: true });
  game.oaLite = { importCompendia };
});

Hooks.once("setup", () => { if (!API?.conflict) applyLists(game.settings.get(MID, "oaOnly")); });
Hooks.once("ready", () => {
  if (API?.conflict) ui.notifications.error("OA Lite and the full OA module are both active. They add the same races and classes, so OA Lite has stayed off. Turn one of them off in Manage Modules.", { permanent: true });
  else if (!API?.registerSpellList) ui.notifications.error("OA Lite needs 1e FRPG 0.48.0 or later.", { permanent: true });
  else if (game.user.isGM) offerImport();
});

function applyLists(oaOnly) {
  const api = game.frpg1e?.api;
  if (!api?.hideClasses) return;
  const coreRaces = Object.keys(api.RACE_DEFS).filter(k => !OA_RACE_KEYS.includes(k) && !api.RACE_DEFS[k].ext);
  const coreClasses = Object.keys(api.CLASSES).filter(k => !api.CLASSES[k].setting && k !== "custom");
  if (oaOnly) { api.hideRaces(coreRaces); api.hideClasses(coreClasses); }
  else { api.showRaces(coreRaces); api.showClasses(coreClasses); }
  for (const a of game.actors ?? []) if (["character", "npc"].includes(a.type)) a.sheet?.rendered && a.sheet.render();
}

/* ---------- character preparation: notes ---------- */
Hooks.on("frpg1e.prepareCharacter", (sys) => {
  if (API?.conflict) return;
  const notes = sys.settingNotes;
  const ab = k => sys.abilities?.[k]?.value ?? 0;
  if (sys.details?.race === "korobokuru") {
    const b = korobokuruSave(ab("con"));
    if (b) notes.push(`Korobokuru: +${b} on saves vs. rods, staves, wands, spells and poison (OA p.12).`);
  }
  for (const c of sys.classInfo ?? []) {
    const def = c.def;
    if (def?.source !== "OA") continue;
    const t = def.titles?.[Math.min(c.level, def.titles.length) - 1];
    if (t) notes.push(`${def.label} ${c.level}: ${t}`);
    const m = def.oa ?? {};
    const low = Object.entries(m.min ?? {}).filter(([a, v]) => ab(a) < v).map(([a, v]) => `${a} ${v}`);
    if (low.length) notes.push(`${def.label}: below the minimum scores (${low.join(", ")}) (OA Table 12).`);
    for (const [a, v] of Object.entries(m.max ?? {})) if (ab(a) > v) notes.push(`${def.label}: ${a} may not be higher than ${v} (OA Table 12).`);
    if (m.bonus && m.bonus.every(([a, v]) => ab(a) >= v)) notes.push(`${def.label}: +10% experience (OA Table 12).`);
  }
});

/* ---------- sheet tab ---------- */
Hooks.on("renderCharacterSheet", (app, element) => { if (!API?.conflict) renderOATab(app, element); });
