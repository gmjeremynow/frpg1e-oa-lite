/** World compendia built from the module's JSON (same approach as the system: no compiled LevelDB packs). */
const MID = "frpg1e-oa-lite";
export const DATA_VERSION = "1";

const PACKS = [
  { name: "oalite-lore", label: "OA Lite Journals", file: "journals.json", type: "JournalEntry", folder: d => d.folder },
  { name: "oalite-spells", label: "OA Lite Spells", file: "spells.json", type: "Item", folder: d => d.folder },
  { name: "oalite-equipment", label: "OA Lite Weapons, Armor and Equipment", file: "equipment.json", type: "Item", folder: d => d.folder },
  { name: "oalite-martial", label: "OA Lite Martial Arts", file: "martial.json", type: "Item", folder: d => d.folder },
  { name: "oalite-proficiencies", label: "OA Lite Proficiencies", file: "proficiencies.json", type: "Item", folder: d => d.folder },
  { name: "oalite-magic", label: "OA Lite Magic Items", file: "magic-items.json", type: "Item", folder: d => d.folder },
  { name: "oalite-monsters", label: "OA Lite Monsters", file: "monsters.json", type: "Actor", folder: d => d.folder },
  { name: "oalite-tables", label: "OA Lite Tables", file: "tables.json", type: "RollTable", folder: d => d.folder }
];
const CLS = { Item: () => Item, Actor: () => Actor, JournalEntry: () => JournalEntry, RollTable: () => RollTable };

export async function offerImport() {
  if (game.settings.get(MID, "compendiaVersion") === DATA_VERSION) return;
  const ok = await foundry.applications.api.DialogV2.confirm({
    window: { title: "OA Lite: Compendia" },
    content: "<p>Create the OA Lite world compendia (the OA Lite journals by topic, spells, weapons, armor and equipment, martial arts, proficiencies, magic items, monsters and the divination and fate tables)?</p><p class=\"hint\">You can do this later from Game Settings, Configure Settings, 1e FRPG: OA Lite.</p>",
    rejectClose: false
  });
  if (ok) await importCompendia();
  else await game.settings.set(MID, "compendiaVersion", DATA_VERSION);
}

export async function importCompendia({ confirm = false } = {}) {
  if (!game.user.isGM) return;
  if (confirm) {
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Rebuild OA Lite Compendia" },
      content: "<p>Rebuild the OA Lite compendia? Existing copies in this world are replaced.</p>", rejectClose: false });
    if (!ok) return;
  }
  const CC = foundry.documents.collections.CompendiumCollection;
  for (const def of PACKS) {
    let data;
    try { data = await (await fetch(`modules/${MID}/data/${def.file}`)).json(); } catch { continue; }
    if (!data?.length) continue;
    const existing = game.packs.get(`world.${def.name}`);
    if (existing) await existing.deleteCompendium();
    const pack = await CC.createCompendium({ name: def.name, label: def.label, type: def.type });
    // Folder paths may be nested with "/" (e.g. "Wu Jen/1st Level"); parents are made first, in the order first seen.
    const paths = [...new Set(data.map(def.folder).filter(Boolean))];
    const byPath = new Map();
    let sort = 0;
    for (const path of paths) {
      const parts = path.split("/");
      for (let depth = 1; depth <= parts.length; depth++) {
        const key = parts.slice(0, depth).join("/");
        if (byPath.has(key)) continue;
        const parent = depth > 1 ? byPath.get(parts.slice(0, depth - 1).join("/")) : null;
        const [f] = await Folder.createDocuments([{ name: parts[depth - 1], type: def.type, sorting: "m", sort: (sort += 10), folder: parent }], { pack: pack.collection });
        byPath.set(key, f.id);
      }
    }
    const docs = data.map(d => { const { folder, ...rest } = d; return { ...rest, folder: byPath.get(folder) ?? null }; });
    const cls = CLS[def.type]();
    for (let i = 0; i < docs.length; i += 50) await cls.createDocuments(docs.slice(i, i + 50), { pack: pack.collection });
    ui.notifications.info(`${def.label}: ${docs.length} entries.`);
  }
  await game.settings.set(MID, "compendiaVersion", DATA_VERSION);
}
