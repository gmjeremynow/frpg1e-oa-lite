/** Class abilities by level, in plain words, for the OA tab (OA p.14-28). Each entry: { text, page }. */
import { BARBARIAN_CAP, BARBARIAN_BONUS, KENSAI_BONUS, MONK_CAP, NINJA_CAP, NINJA_DEX, YAKUZA_CAP } from "./classes.mjs";

const at = (t, l) => t[Math.max(1, Math.min(t.length - 1, l))];
const pct = n => `${n}%`;
const signed = n => (n > 0 ? `+${n}` : String(n));

/** Ninja-table percentages with the Table 23 dexterity adjustment (dex below 9 or above 18 has no printed row). */
export function ninjaSkills(level, dex) {
  const r = at(NINJA_CAP, level);
  const d = NINJA_DEX[Math.max(9, Math.min(18, dex))] ?? [0, 0, 0, 0, 0];
  const dexNote = dex < 9 || dex > 18 ? ` (OA Table 23 has rows for dexterity 9-18 only; dexterity ${dex} uses the nearest row)` : "";
  return {
    rows: [["Hide in shadows", r[0], d[3]], ["Move silently", r[1], d[2]], ["Find/remove traps", r[2], d[1]], ["Climb walls", r[3], 0], ["Disguise", r[4], 0],
      ["Open locks", r[5], d[4]], ["Tightrope walk", r[6], 0], ["Escape", r[9], 0]],
    poleVault: r[7], fall: r[8], backstab: r[10], dexNote
  };
}

export function classFeatures(key, level, sys) {
  const L = Math.max(1, level);
  const out = [];
  const add = (text, page) => out.push({ text, page });
  const dex = sys?.abilities?.dex?.value ?? 10;
  switch (key) {
    case "barbarianOA": {
      const r = at(BARBARIAN_CAP, L);
      add(`Climb cliffs and trees ${pct(r[0])} (half on smoother surfaces); hide in natural surroundings ${pct(r[1])} (half in unfamiliar terrain)${L > 11 ? "; Table 16 stops at 11th level" : ""}.`, 14);
      add(`Back protection ${pct(Math.min(100, 5 * L))}; detect illusion ${pct(Math.min(75, 5 * L))} (1 round); detect magic ${pct(Math.min(90, 25 + 5 * L))} (1 round).`, 14);
      add("Surprises on 1-3 in 6, surprised only on 1. Leap 10 ft forward, 3 ft back or up from standing; running 15+1d6 ft forward or 4+1d4 (half-feet) up. Heals twice as fast.", 14);
      add(`+2 hp per level per point of constitution over 14 (replaces the normal adjustment); 4 hp per level after 8th.`, 14);
      for (const [lv, t] of BARBARIAN_BONUS) if (L >= lv) add(`${lv}th: ${t}`, 15);
      add("Never gains xp for finding magic items; earns full xp for destroying one. Nine proficiency slots, up to six for weapons.", 14);
      break;
    }
    case "bushi": {
      add(`Kiai: once a day for one turn, fight as two levels higher (+2d10 temporary hit points, that level's attacks and saves).`, 16);
      add(`Armor class improves 1 step per 5 levels whatever is worn (now ${Math.floor(L / 5)}; applied on the sheet).`, 16);
      add(`Cut purses: ${pct(20 + 2 * L)} (95+ noticed). Find "loose" equipment: 20% village, 25% medium village, 30% large village, 40% small town, 60% large town, 90% city.`, 16);
      add("Starts with weaponsmith, armorer and bowyer; may specialize in one weapon at creation.", 16);
      if (L >= 9) add("9th: may become a warlord: clear an estate and 30-60 1st-level bushi apply.", 16);
      if (L >= 12) add("12th: 1d6 1st-level samurai ask to serve him.", 16);
      break;
    }
    case "kensai": {
      const b = at(KENSAI_BONUS, L);
      add(`With the chosen weapon: ${signed(b[3])} to hit${b[3] ? ` (hits creatures needing +${b[3]} weapons)` : ""}, ${signed(b[2])} damage. Initiative ${signed(b[0])}. All saves +1; immune to fear.`, 16);
      add(`Natural armor class 23 − dexterity, improved by ${b[1]} (OA Table 19); no armor, no dexterity adjustment (applied on the sheet).`, 16);
      add(`Ki: maximum damage with one hit of the chosen weapon, declared before rolling, ${L} times a day. +2 in psychic duels with non-kensai.`, 16);
      if (L >= 4) add("4th: meditates like a shukenja.", 17);
      if (L >= 6) add("6th: surprised only on 1 in 6.", 17);
      if (L >= 7) add("7th: two weapons with no penalty; causes fear as a samurai.", 17);
      if (L >= 9) add("9th: attracts 1d6 1st-level kensai pupils.", 17);
      if (L >= 11) add("11th: whirlwind attack: uses all the day's ki; one attack on every foe within 10 ft.", 17);
      add(`Practice two hours a day; on advancing, ${Math.min(100, 10 * L)}% chance of a duel (a duel is required to advance from 10th).`, 17);
      break;
    }
    case "monkOA": {
      const r = at(MONK_CAP, L);
      add(`Armor class ${r[0]}, move ${r[1]}" (applied on the sheet). Martial arts: extra attacks ${r[2]}, extra damage ${r[3]}. Surprise ${r[10]}.`, 18);
      add(`Open locks ${pct(r[4])}, find/remove traps ${pct(r[5])}, move silently ${pct(r[6])}, hide in shadows ${pct(r[7])}, hear noise ${pct(r[8])}, climb walls ${pct(r[9])}.`, 18);
      add(`+1 damage per two levels with weapons (now +${Math.floor(L / 2)}). Missile Deflection maneuver.`, 18);
      add(`Ki: ${L} times a day, a successful save vs. magic means no damage or effect${L >= 9 ? "; from 9th, half damage even on a failed save" : ""}.`, 18);
      if (L >= 3) add("3rd: speak with animals.", 18);
      if (L >= 4) add(`4th: fall 20 ft beside a wall; ESP works only ${Math.max(0, 30 - 2 * (L - 4))}% of the time.`, 18);
      if (L >= 5) add("5th: immune to disease, haste and slow.", 18);
      if (L >= 6) add(`6th: fall 30 ft within 4 ft of a wall; feign death up to ${2 * L} turns.`, 18);
      if (L >= 7) add(`7th: heal self 2-5 hp a day, plus 1 per level beyond 7th${L > 7 ? ` (+${L - 7})` : ""}.`, 18);
      if (L >= 8) add("8th: speak with plants; 2-5 1st-level monk followers with a monastery (1-2 more per level).", 18);
      if (L >= 9) add(`9th: charm, hypnosis and suggestion only ${Math.max(0, 50 - 5 * (L - 9))}% likely to work.`, 18);
      if (L >= 10) add("10th: defends against telepathic and mind blast attacks as intelligence 18.", 19);
      if (L >= 11) add("11th: immune to poison.", 19);
      if (L >= 12) add("12th: immune to geas and quest.", 19);
      if (L >= 13) add("13th: one extra special maneuver.", 19);
      add("At most two magic weapons and three other magic items.", 19);
      break;
    }
    case "ninja": {
      const s = ninjaSkills(L, dex);
      add(s.rows.map(([n, base, adj]) => `${n} ${pct(base + adj)}${adj ? ` (${signed(adj)} dex)` : ""}`).join("; ") + "." + s.dexNote, 21);
      add(`Pole vault ${s.poleVault} ft; fall ${s.fall} ft without damage; backstab ×${s.backstab} (applied to backstab attacks); assassinate (DMG tables).`, 21);
      add(`Ki: hold breath ${L} rounds once a day${L >= 5 ? `; walk on water ${5 * L} ft, ${L} times a day` : ""}${L >= 12 ? "; pass through walls (all the day's ki, 3 rounds' concentration, 1 ft per level)" : ""}.`, 21);
      add("Split class: experience divided with the other class; ninja dice get no constitution bonus, the other class's die is halved before constitution (applied to hit point rolls). Thief saving throws.", 20);
      add("Table 24 has no pick pockets column; yakuza are told to use a ninja's pick pockets chance, as printed.", 21);
      break;
    }
    case "samurai": {
      const dmg = L >= 2 ? 1 + Math.floor((L - 2) / 3) : 0;
      add(`Ki: strength 18/00 for one round, ${L} times a day. Damage ${signed(dmg)}.`, 22);
      add("Must specialize in the katana; may also specialize in the daikyu. No shield.", 22);
      if (L >= 2) add("2nd: horsemanship required (bow by 3rd; calligraphy, painting and poetry by 6th).", 22);
      if (L >= 3) add("3rd: surprised only on 1 in 6.", 22);
      if (L >= 5) add("5th: immune to fear.", 22);
      if (L >= 6) add("6th: may cause fear in creatures of 1 HD or less (save vs. breath weapon).", 22);
      if (L >= 7) add("7th: offered stewardship of one of his lord's estates, with 10 bushi and 1-4 samurai of 1st-3rd level.", 22);
      if (L >= 8) add("8th: offered the post of provincial constable; attracts 10d10 bushi (20% one is a ninja).", 22);
      if (L >= 9) add("9th: attracts 2d10 1st-level samurai and 2-7 specialists (10% one is a ninja); great kiai once a day (18/00 for 2 rounds, foes within 10 ft save vs. paralysis or are stunned 1 round; no normal ki that day).", 22);
      add("Without a lord (ronin): advances at double the xp cost.", 22);
      break;
    }
    case "shukenja": {
      add(`Ki: +3 on a saving throw, ${L} times a day, declared before the roll.`, 23);
      add(`Purification: ${pct(5 * L)} to remove a curse; or sanctify a 5-ft radius (+1 to hit and saves vs. evil spirits while inside).`, 23);
      add("Meditation: an hour counts as two hours' sleep. Free proficiency in one unarmed style. Wisdom bonus spells and spell failure as OA Table 27.", 23);
      add("Half xp for defeating humans and monsters (full for evil spirits); xp for treasure only when given away; 100 xp per spell level used to heal or aid outsiders.", 23);
      break;
    }
    case "sohei": {
      add("Weapon of choice: +1 to hit and damage with one proficient weapon.", 24);
      if (L >= 3) add("3rd: ki berserk once a day for a turn: +1 attack a round, AC 1 better, +3\" move, +1 to hit, damage and saves; dodge missiles on a save vs. breath weapon.", 24);
      if (L >= 5) add("5th: may fight on past 0 hp to −10 at +2 to hit and damage, then dies.", 24);
      if (L >= 6) add(`6th: commands 10-30 1st-level sohei (+10 per level above 6th).`, 24);
      if (L >= 9) add("9th: commissioned to found and command a new monastery.", 24);
      add(`Shukenja spells from 6th level (OA Table 30), only those marked for sohei.${L < 6 ? " None yet." : ""}`, 24);
      break;
    }
    case "wuJen": {
      add("Favored weapon +1 to hit. +1 hp per hit die (applied to hit point rolls).", 25);
      add(`Ki: +3 initiative for one round once a day${L >= 4 ? `; once a day cast a spell of level ${Math.max(1, L - 3)} or lower at maximum effect` : ""}.`, 25);
      add(`Taboos: ${1 + Math.floor(L / 5)} (one at 1st, one more every five levels).`, 26);
      add("Mastery of an element (all its spells known up to the highest castable level): −1 to saves against those spells, +1 damage, +1 to own saves vs. that element.", 26);
      if (L >= 10) add("10th: 1d4 1st-level wu jen pupils.", 26);
      add("Speaks tengu and oni; +20% reaction with them. Spells known by OA Table 32 (see the OA tab for the numbers).", 26);
      break;
    }
    case "yakuza": {
      const y = at(YAKUZA_CAP, L);
      const s = ninjaSkills(L, dex);
      const ms = s.rows.find(r => r[0] === "Move silently"), hs = s.rows.find(r => r[0] === "Hide in shadows"), ol = s.rows.find(r => r[0] === "Open locks");
      add(`Investigate ${pct(y[0])} over ${y[1]}. Move silently ${pct(ms[1] + ms[2])}, hide in shadows ${pct(hs[1] + hs[2])}, open locks ${pct(ol[1] + ol[2])} (as a ninja of the same level, with the Table 23 dexterity adjustment); pick pockets: see the ninja note; hear noise ${pct(at(MONK_CAP, Math.min(17, L))[8])} (as a monk).`, 26);
      add(`Ki: halve the damage of one attack a round, ${L} times a day. +10% reaction (not where social status matters). Stipend ${10 * L} gp a month.`, 27);
      if (L >= 2) add(`2nd: once per level call up to ${L} brethren (at least a level lower, never above 8th).`, 27);
      add(`Contacts: ${Math.floor(L / 2)} (one per two levels). Starts with gaming.`, 27);
      break;
    }
  }
  return out;
}
