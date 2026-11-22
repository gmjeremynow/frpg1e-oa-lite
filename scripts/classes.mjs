/**
 * OA classes (OA p.14-28). XP arrays hold the minimum XP of each level as printed in each class table.
 * Hit dice, combat and saving throw tables, armor and weapons are from the class text and OA Tables 12-36.
 */
const SRC = "OA";
const lv = (arr) => arr;                              // readability marker for level-indexed arrays
const rowsFrom = (text, first = 1) => Object.fromEntries(text.trim().split("|").map((r, i) => [i + first, r.trim().split(/\s+/).map(Number).filter(n => n > 0)]));

/* ---------- spell tables ---------- */
export const SPELLS = {
  // OA Table 28: Shukenja Spells Usable by Level (levels 1-29)
  oaShukenja: rowsFrom(`1|2|3|3 1|3 2|4 2 1|4 3 2|4 3 2 1|5 3 2 2|5 4 2 2 1|5 4 3 2 2|6 4 3 3 2|6 5 4 3 2|6 5 4 3 2 1|7 5 4 3 2 2|7 6 5 3 2 2|7 6 5 4 3 2|7 6 5 4 3 3 1|8 6 5 4 4 3 1|8 7 6 4 4 3 2|8 7 6 5 4 4 2|9 7 6 5 5 4 2|9 8 7 5 5 4 3|9 8 7 6 5 5 3|9 9 7 6 6 5 3|9 9 8 7 6 5 4|9 9 8 7 7 6 4|9 9 9 8 7 6 4|9 9 9 9 8 7 5`),
  // OA Table 30: Sohei Spells Usable by Level (no spells at levels 1-5)
  oaSohei: rowsFrom(`1|1 1|2 1|2 2|2 2 1|3 2 1|3 2 2|3 3 2|3 3 3|3 3 3 1|3 3 3 2|4 3 3 2|4 4 3 2|4 4 4 3|5 4 4 3|5 5 4 3|5 5 4 4|5 5 5 4|6 5 5 4|6 6 5 4|6 6 5 5|6 6 6 5|6 6 6 6|7 7 6 6`, 6),
  // OA Table 33: Wu Jen Spells Usable by Level (levels 1-29)
  oaWuJen: rowsFrom(`1|2|2 1|3 2|3 2 1|4 2 2|4 3 2 1|4 3 3 2|5 3 3 2 1|5 4 3 2 2|5 4 4 2 2 1|5 5 4 2 2 2|5 5 4 4 2 2 1|6 5 4 4 2 2 2|6 5 4 4 3 3 2|6 6 5 4 4 3 2|6 6 5 5 4 3 2 1|6 6 5 5 4 4 2 2|6 6 6 5 5 4 2 2|6 6 6 5 5 4 3 3|7 6 6 6 5 4 3 3 1|7 7 6 6 5 5 3 3 1|7 7 7 6 6 5 3 3 2|7 7 7 6 6 5 4 4 2|8 7 7 6 6 6 4 4 2|8 8 7 7 6 6 5 4 3|8 8 8 7 7 6 5 4 3|9 8 8 7 7 7 5 5 3|9 9 8 8 7 7 6 5 4`)
};

/* ---------- class ability tables ---------- */
// OA Table 16: Barbarian Capabilities, levels 1-11 [climb, hide, back protection, detect illusion, detect magic]
export const BARBARIAN_CAP = [null, [85, 25, 5, 5, 30], [86, 31, 10, 10, 35], [87, 37, 15, 15, 40], [88, 43, 20, 20, 45], [89, 49, 25, 25, 50],
  [90, 56, 30, 30, 55], [91, 63, 35, 35, 60], [92, 70, 40, 40, 65], [93, 77, 45, 45, 70], [94, 85, 50, 50, 75], [95, 93, 55, 55, 80]];
// OA Table 15: Barbarian Bonuses
export const BARBARIAN_BONUS = [[3, "Can use magical potions"], [4, "Can use magical weapons; +1 on all saving throws versus spell"], [5, "Can use magical armor"],
  [6, "Earns half xp on adventures with wu jen and spirit folk"], [7, "Can use weapon-like miscellaneous magical items"], [8, "Earns full xp on adventures with wu jen and spirit folk"],
  [9, "Can use protection scrolls (if he can read)"], [10, "+2 on saving throws versus spell"], [11, "Can summon a barbarian horde"], [12, "+3 on saving throws versus spell"]];
// OA Table 19: Kensai Bonuses, levels 1-12+ [initiative, AC, damage, to hit]
export const KENSAI_BONUS = [null, [1, 0, 0, 0], [1, 0, 1, 0], [1, 1, 1, 1], [1, 1, 1, 1], [2, 1, 2, 2], [2, 2, 2, 2], [2, 2, 2, 2], [2, 3, 3, 3], [3, 3, 3, 3], [3, 4, 4, 4], [3, 4, 4, 4], [3, 4, 5, 5]];
// OA Table 21: Monk Capabilities [AC, move, extra martial arts attacks, extra martial arts damage, OL, F/RT, MS, HS, HN, CW, surprise]
export const MONK_CAP = [null,
  [10, 15, "-", "-", 25, 20, 15, 10, 10, 85, "Normal"], [9, 16, "-", "-", 29, 25, 21, 15, 10, 86, "32%"], [8, 17, "-", "-", 33, 30, 27, 20, 15, 87, "30%"],
  [7, 18, "1/4", "-", 37, 35, 33, 25, 15, 88, "28%"], [7, 19, "1/4", "+1", 42, 40, 40, 31, 20, 89, "26%"], [6, 20, "1/2", "+2", 47, 45, 47, 37, 20, 90, "24%"],
  [5, 21, "1/2", "+2", 52, 50, 55, 43, 25, 91, "22%"], [4, 22, "1/2", "+1D", 57, 55, 62, 49, 25, 92, "20%"], [3, 23, "1/1", "+1D+1", 62, 60, 70, 56, 30, 93, "18%"],
  [3, 24, "1/1", "+1D+2", 67, 65, 78, 63, 30, 94, "16%"], [2, 25, "3/2", "+1D+2", 72, 70, 86, 70, 35, 95, "14%"], [1, 26, "3/2", "+2D", 77, 75, 94, 77, 35, 96, "12%"],
  [0, 27, "3/2", "+2D", 82, 80, 99, 85, 40, 97, "10%"], [-1, 28, "2/1", "+2D+1", 87, 85, 99, 93, 40, 98, "8%"], [-1, 29, "2/1", "+3D", 92, 90, 99, 99, 50, 99, "6%"],
  [-2, 30, "3/1", "+3D+1", 97, 95, 99, 99, 50, 99, "4%"], [-3, 32, "3/1", "+4D", 99, 99, 99, 99, 55, 99, "2%"]];
// OA Table 24: Ninja Capabilities [HS, MS, F/RT, CW, disguise, OL, tightrope, pole vault (ft), fall (ft), escape, backstab]
export const NINJA_CAP = [null,
  [10, 15, 20, 85, 20, 25, 20, 8, 0, 10, 2], [15, 21, 25, 86, 24, 29, 25, 9, 0, 14, 2], [20, 27, 30, 87, 28, 33, 30, 9.5, 10, 18, 2], [25, 33, 35, 88, 32, 37, 35, 10, 15, 22, 2],
  [31, 40, 40, 89, 36, 42, 40, 10.5, 20, 26, 3], [37, 47, 45, 90, 40, 47, 45, 11, 25, 30, 3], [43, 55, 50, 91, 44, 52, 50, 11.5, 30, 34, 3], [49, 62, 55, 92, 48, 57, 55, 12, 35, 38, 3],
  [56, 70, 60, 93, 52, 62, 60, 12.5, 40, 42, 3], [63, 78, 65, 94, 56, 67, 65, 13, 45, 46, 4], [70, 86, 70, 95, 60, 72, 70, 13.5, 50, 50, 4], [77, 94, 75, 96, 64, 77, 75, 14, 55, 54, 4],
  [85, 95, 80, 97, 68, 82, 80, 14.5, 60, 58, 4], [93, 96, 85, 98, 72, 87, 85, 15, 65, 62, 4], [94, 97, 90, 99, 76, 92, 90, 15.5, 70, 66, 4], [95, 98, 95, 99, 80, 97, 95, 16, 75, 70, 4],
  [96, 99, 95, 99, 84, 99, 96, 16.5, 80, 74, 4], [97, 99, 95, 99, 88, 99, 97, 17, 85, 78, 4], [98, 99, 95, 99, 92, 99, 98, 17.5, 90, 82, 4], [99, 99, 95, 99, 96, 99, 99, 18, 95, 86, 5]];
// OA Table 23: Ninja Dexterity Adjustments, dex 9-18 [pick pockets, find/remove traps, move silently, hide in shadows, open locks].
// Pick pockets at dexterity 9, 10 and 11 is printed "15%", "10%", "05%" with no minus signs (the PHB thief table has -15, -10, -5); kept as printed.
export const NINJA_DEX = { 9: [15, -10, -20, -10, -15], 10: [10, -10, -15, -5, -10], 11: [5, -5, -10, 0, -5], 12: [0, 0, -5, 0, 0], 13: [0, 0, 0, 0, 0],
  14: [0, 0, 0, 0, 0], 15: [0, 0, 0, 0, 0], 16: [0, 0, 0, 0, 0], 17: [5, 0, 5, 5, 5], 18: [10, 5, 10, 10, 10] };
// OA Table 35: Yakuza Capabilities [investigate, area covered], levels 1-21
export const YAKUZA_CAP = [null, [20, "1 block"], [24, "1 block"], [28, "2 blocks"], [32, "2 blocks"], [36, "3 blocks"], [40, "3 blocks"], [44, "1 ward"], [48, "1 ward"],
  [52, "1 ward"], [56, "2 wards"], [60, "2 wards"], [64, "2 wards"], [68, "1 district"], [72, "1 district"], [76, "1 district"], [80, "2 districts"], [84, "2 districts"],
  [88, "2 districts"], [92, "3 districts"], [95, "3 districts"], [95, "Province"]];

const at = (table, level) => table[Math.max(1, Math.min(table.length - 1, level))];

/* ---------- the classes ---------- */
export const CLASSES = {
  barbarianOA: {
    label: "Barbarian (OA)", hitDie: 12, firstDice: 1, maxHD: 8, afterHP: 4, matrix: "fighter", save: "fighter", fighterCon: false, exceptionalStr: true,
    nonProf: -2, source: SRC, page: 14,
    xp: [0, 4001, 8001, 16001, 32001, 75001, 130001, 240001, 460001, 900001, 1400001], xpStep: 500000,
    // "an additional 2 hit points per level for every point of Constitution over 14 instead of the Constitution bonuses listed on Table 4"
    conHP: con => Math.max(0, con - 14) * 2,
    saveBonus: level => ({ sp: level >= 12 ? 3 : level >= 10 ? 2 : level >= 4 ? 1 : 0 }),
    attacksPerRound: [[6, "1/1"], [12, "3/2"], [null, "2/1"]],
    oa: { prof: [9, 3], min: { str: 15, dex: 14, con: 15 }, max: { wis: 16 }, bonus: null, align: "Any non-law" }
  },
  bushi: {
    label: "Bushi (OA)", hitDie: 10, firstDice: 1, maxHD: 9, afterHP: 2, matrix: "fighter", save: "fighter", fighterCon: true, exceptionalStr: true,
    nonProf: -2, source: SRC, page: 15,
    xp: [0, 1501, 3001, 6001, 14001, 30001, 60001, 120001, 240001, 480001, 710001, 1000001], xpStep: 250000,
    acBonus: level => Math.floor(level / 5),
    attacksPerRound: [[5, "1/1"], [10, "3/2"], [null, "2/1"]],
    oa: { prof: [4, 2], min: { str: 9, dex: 8, con: 8 }, bonus: [["str", 14]], align: "Any" }
  },
  kensai: {
    label: "Kensai (OA)", hitDie: 10, firstDice: 1, maxHD: 9, afterHP: 2, matrix: "fighter", save: "fighter", fighterCon: true, exceptionalStr: true,
    nonProf: -3, source: SRC, page: 16,
    xp: [0, 3001, 5501, 10001, 22001, 44001, 88001, 150001, 250001, 500001, 750001, 1000001], xpStep: 250000,
    // natural armor class: 23 minus dexterity, improved by the AC Bonus column of Table 19
    naturalAC: (level, ab) => 23 - (ab?.dex?.value ?? 10) - at(KENSAI_BONUS, level)[1],
    saveBonus: () => ({ ppd: 1, pp: 1, rsw: 1, bw: 1, sp: 1 }),
    attacksPerRound: [[3, "1/1"], [7, "3/2"], [14, "2/1"], [null, "5/2"]],
    oa: { prof: [3, 2], min: { str: 12, dex: 14, wis: 12 }, bonus: [["wis", 14], ["dex", 14]], align: "Any lawful" }
  },
  monkOA: {
    label: "Monk (OA)", hitDie: 4, firstDice: 2, maxHD: 18, afterHP: 0, matrix: "thief", save: "thief", fighterCon: false, maxLevel: 17,
    nonProf: -3, source: SRC, page: 17,
    xp: [0, 2251, 4751, 10001, 22501, 47501, 98001, 200001, 350001, 500001, 700001, 950001, 1250001, 1750001, 2250001, 2750001, 3250001],
    titles: ["Novice", "Initiate", "Brother", "Disciple", "Immaculate", "Master", "Superior Master", "Master of Dragons", "Master of the North Wind",
      "Master of the West Wind", "Master of the South Wind", "Master of the East Wind", "Master of Winter", "Master of Autumn", "Master of Summer", "Master of Spring", "Grand Master of Flowers"],
    naturalAC: level => at(MONK_CAP, level)[0],
    move: level => at(MONK_CAP, level)[1],
    oa: { prof: null, min: { str: 15, dex: 15, wis: 15, con: 11 }, bonus: null, align: "Any lawful",
      nonProfNote: "OA Table 56 gives no row for monks; the PHB monk penalty (−3) is used." }
  },
  ninja: {
    label: "Ninja (OA, split class)", hitDie: 2, firstDice: 1, maxHD: 9, afterHP: 1, matrix: null, save: "thief", fighterCon: false,
    nonProf: -4, source: SRC, page: 19, splitClass: true,
    xp: [0, 4001, 8001, 15001, 30001, 60001, 120001, 240001, 500001, 1000001, 1300001, 1600001], xpStep: 300000,
    backstab: level => at(NINJA_CAP, level)[10],
    attacksPerRound: [[6, "1/1"], [14, "3/2"], [null, "2/1"]],
    oa: { prof: [2, 3], min: { dex: 14, int: 15, cha: 14 }, bonus: null, align: "Any non-good" }
  },
  samurai: {
    label: "Samurai (OA)", hitDie: 10, firstDice: 1, maxHD: 9, afterHP: 2, matrix: "fighter", save: "fighter", fighterCon: true, exceptionalStr: true,
    nonProf: -2, source: SRC, page: 21,
    xp: [0, 2501, 5001, 10001, 18001, 36501, 75001, 135001, 235001, 400001, 650001, 1000001], xpStep: 300000,
    attacksPerRound: [[4, "1/1"], [8, "3/2"], [null, "2/1"]],
    oa: { prof: [5, 1], min: { str: 13, int: 14, wis: 13, con: 13 }, bonus: null, align: "Any lawful" }
  },
  shukenja: {
    label: "Shukenja (OA)", hitDie: 6, firstDice: 1, maxHD: 9, afterHP: 1, matrix: "cleric", save: "cleric", as: "cleric", noTurning: true, wisBonusSpells: true,
    fighterCon: false, nonProf: -4, source: SRC, page: 22,
    xp: [0, 1251, 3001, 5501, 11001, 22001, 44001, 90001, 150001, 300001, 600001, 900001], xpStep: 250000,
    spells: [{ list: "shukenja", progression: "oaShukenja" }],
    oa: { prof: [6, 2], min: { str: 9, con: 9, wis: 12 }, bonus: [["wis", 15], ["con", 15]], align: "Any good" }
  },
  sohei: {
    label: "Sohei (OA)", hitDie: 10, firstDice: 1, maxHD: 9, afterHP: 1, matrix: "cleric", save: "cleric", as: "cleric", noTurning: true, wisBonusSpells: true,
    fighterCon: true, exceptionalStr: true, nonProf: -2, source: SRC, page: 24,
    xp: [0, 2001, 4001, 7001, 13001, 24001, 48001, 85001, 150001, 350001, 550001, 750001], xpStep: 200000,
    spells: [{ list: "shukenja", progression: "oaSohei" }],
    attacksPerRound: [[6, "1/1"], [12, "3/2"], [null, "2/1"]],
    oa: { prof: [4, 3], min: { str: 13, con: 10, wis: 10 }, bonus: [["str", 15], ["wis", 15]], align: "Any lawful" }
  },
  wuJen: {
    label: "Wu Jen (OA)", hitDie: 4, firstDice: 1, maxHD: 9, afterHP: 1, matrix: "magicuser", save: "magicuser", as: "magicuser", dieBonus: 1,
    fighterCon: false, nonProf: -5, source: SRC, page: 24,
    xp: [0, 2001, 4001, 8001, 18001, 36001, 65001, 100001, 140001, 280001, 600001], xpStep: 300000,
    spells: [{ list: "wujen", progression: "oaWuJen" }],
    oa: { prof: [6, 2], min: { int: 13 }, bonus: [["int", 15]], align: "Any non-law" }
  },
  yakuza: {
    label: "Yakuza (OA)", hitDie: 6, firstDice: 1, maxHD: 9, afterHP: 1, matrix: "thief", save: "thief", fighterCon: false,
    nonProf: -3, source: SRC, page: 26,
    xp: [0, 2001, 4001, 8001, 16001, 30001, 60001, 130001, 260001, 520001, 800001, 1100001], xpStep: 300000,
    oa: { prof: [3, null], min: { str: 11, int: 15, dex: 15, cha: 16 }, bonus: null, align: "Any lawful",
      nonProfNote: "OA Table 56 gives no row for yakuza; the PHB thief penalty (−3) is used." }
  }
};
export const OA_CLASS_KEYS = Object.keys(CLASSES);
