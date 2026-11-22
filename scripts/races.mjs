/**
 * Races of OA (OA p.11-13). Class limits: OA Table 9 ("U" = any level, a number = maximum level, "no" = not open).
 * Ability ranges: OA Table 10 (minimum/maximum). Humans get an OA entry of their own so that Table 9 applies to them.
 */
const OA = ["samurai", "shukenja", "sohei", "barbarianOA", "kensai", "bushi", "wuJen", "monkOA", "ninja", "yakuza"];
const R = (str, int, wis, dex, con, cha) => ({ str, int, wis, dex, con, cha });
// Table 9 columns as printed; class keys in the order samurai, shukenja, sohei, barbarian, kensai, bushi, wu jen, monk, ninja, yakuza
const T9 = (vals) => Object.fromEntries(OA.map((k, i) => [k, vals[i]]).filter(([, v]) => v !== "no"));

/** Korobokuru: +1 per 4½ points of constitution vs. rods, staves, wands, spells and poison (OA p.12). */
export const korobokuruSave = con => Math.floor(con / 4.5);

export const HENGEYOKAI = {
  carp: { label: "Carp", align: "Any good", dmg: "-", ac: 7, move: "-", fly: "-", swim: '12"', mods: "+1 WI, −1 ST" },
  cat: { label: "Cat", align: "Any chaotic", dmg: "1-3", ac: 9, move: '12"', fly: "-", swim: "-", mods: "+1 DE, −1 WI" },
  crab: { label: "Crab", align: "Any", dmg: "1-3", ac: 8, move: '3"', fly: "-", swim: '6"', mods: "+2 ST, −2 CH" },
  crane: { label: "Crane", align: "Any good", dmg: "1-2", ac: 9, move: '6"', fly: '12"', swim: "-", mods: "+1 WI, −1 DE" },
  dog: { label: "Dog", align: "Any good", dmg: "1-6", ac: 9, move: '12"', fly: "-", swim: "-", mods: "+1 CO, −1 IN" },
  drake: { label: "Drake", align: "Any good", dmg: "-", ac: 7, move: '6"', fly: '12"', swim: '9"', mods: "+1 CH, −1 DE" },
  fox: { label: "Fox", align: "Any evil", dmg: "1-3", ac: 6, move: '15"', fly: "-", swim: "-", mods: "+1 IN, −1 WI" },
  hare: { label: "Hare", align: "Any good", dmg: "-", ac: 5, move: '18"', fly: "-", swim: "-", mods: "+1 WI, −1 ST" },
  monkey: { label: "Monkey", align: "Any chaotic", dmg: "-", ac: 6, move: '12"', fly: "-", swim: "-", mods: "+2 DE, −2 WI" },
  raccoonDog: { label: "Raccoon dog", align: "Any evil", dmg: "1-6", ac: 9, move: '9"', fly: "-", swim: "-", mods: "+2 ST, −2 WI" },
  rat: { label: "Rat", align: "Any evil", dmg: "1-3", ac: 5, move: '9"', fly: "-", swim: "-", mods: "+2 CO, −2 CH" },
  sparrow: { label: "Sparrow", align: "Any good", dmg: "-", ac: 3, move: '3"', fly: '15"', swim: "-", mods: "+2 CH, −2 CO" }
};

const SPIRIT_COMMON = [
  "Infravision 120 feet; answers to a spirit lord (OA p.13).",
  "Text: spirit folk can be samurai, kensai or bushi; Table 9 also opens monk (17th), as printed (OA p.11, 13)."
];

export const RACES = {
  "human-oa": {
    label: "Human (OA)", base: "human", src: "OA p.11", knownClasses: OA,
    classes: T9(["U", "U", "U", "U", "U", "U", "U", 17, "U", "U"]),
    facts: ["Only humans can be dual-class; no character can be multi-class (OA p.28).", "Only humans can be ninja (OA p.19)."]
  },
  korobokuru: {
    label: "Korobokuru (OA)", base: "human", src: "OA p.12", knownClasses: OA, rangeSource: "OA Table 10",
    classes: T9([6, "no", "no", 10, "no", "U", 7, "no", "no", 10]),
    abilityRange: R([8, 19], [3, 15], [3, 17], [6, 18], [12, 19], [3, 16]),
    saveNote: "Korobokuru: +1 per 4½ points of constitution vs. rods, staves, wands, spells and poison (OA p.12).",
    facts: [
      "Ability rolls: strength +1, constitution +1, intelligence −2, applied before checking the minimums; the results cannot exceed 19 or fall below 8, 12 and 3 (OA p.11-12).",
      "About four feet tall. Infravision 120 feet; 66% to recognize any normal plant or animal (OA p.12).",
      "+1 to hit bakemono, goblins, goblin rats and hobgoblins; giants, oni, ogres, ogre magi and titans are −4 to hit them (OA p.12). (The text prints \"bakernono\".)",
      "Cannot use the go-daichi (two-handed sword), any polearm but the naginata, or any bow but the horsebow (OA p.12).",
      "Languages: their tribe's, spirit folk and hengeyokai; no alignment languages (OA p.12).",
      "Text: korobokuru can be barbarians, bushi, samurai and wu jen; Table 9 also opens yakuza (10th), as printed (OA p.11-12).",
      "Korobokuru samurai need a sponsoring daimyo; until then they are treated as 1st-level bushi (OA p.22)."
    ]
  },
  hengeyokai: {
    label: "Hengeyokai (OA)", base: "human", src: "OA p.12-13", knownClasses: OA, rangeSource: "OA Table 10",
    classes: T9(["no", 8, "no", "no", 6, "U", 9, "no", "no", "no"]),
    abilityRange: R([12, 18], [12, 18], [12, 18], [9, 18], [12, 18], [12, 17]),
    facts: [
      "Choose the animal on the OA tab. Scores must meet the race limits before the animal's modifications; the modifications may then drop a score below a minimum but never raise one above a maximum (OA p.12).",
      "Three forms (animal, bipedal, human); one change of form per level per day, taking a full round (OA p.12).",
      "Animal form: half hit points (rounded up), no weapons, armor or spells; infravision 120 feet; speaks with normal animals (OA p.12).",
      "Bipedal form: full hit points, infravision 120 feet, any language known, all class equipment, movement 12\" (OA p.13).",
      "Human form: no infravision, movement 12\", cannot speak to animals but understands them (OA p.13).",
      "Never establishes strongholds; a good hengeyokai may become a village's protector instead (OA p.13)."
    ]
  },
  "spirit-bamboo": {
    label: "Spirit folk, bamboo (OA)", base: "human", src: "OA p.13", knownClasses: OA, rangeSource: "OA Table 10",
    classes: T9([12, "no", "no", "no", 9, "U", "no", 17, "no", "no"]),
    abilityRange: R([6, 18], [12, 18], [9, 18], [12, 18], [6, 14], [14, 18]),
    saveNote: "Bamboo spirit folk: +1 vs. spells, rods, staves, wands and miscellaneous magic involving earth and wood (OA p.13).",
    facts: [...SPIRIT_COMMON,
      "75% to identify normal plants, 50% normal animals; moves alone through woodland, forest or grassland without a trail (others following the group −20%, or −4 on 1d20) (OA p.13).",
      "75% to hide in shadows in woods or forest; learns one forest animal language per level (OA p.13).",
      "Life is tied to a bamboo grove: damage to it is damage to him; entering it cures all wounds and diseases (OA p.13)."]
  },
  "spirit-river": {
    label: "Spirit folk, river (OA)", base: "human", src: "OA p.13", knownClasses: OA, rangeSource: "OA Table 10",
    classes: T9([12, "no", "no", "no", 9, "U", "no", 17, "no", "no"]),
    abilityRange: R([6, 18], [12, 18], [9, 18], [12, 18], [6, 14], [14, 18]),
    saveNote: "River spirit folk: +1 vs. spells, rods, staves, wands and miscellaneous magic involving water; −1 vs. fire-based attacks (OA p.13).",
    facts: [...SPIRIT_COMMON,
      "Breathes fresh water; swims any water at normal movement; carried items stay dry; once a day lowers a river or stream 10 feet for five rounds (OA p.13).",
      "Speaks the language of fishes (OA p.13).",
      "Life is tied to one river: bathing in it cures all wounds and diseases; drought, flood and damming affect him (OA p.13)."]
  },
  "spirit-sea": {
    label: "Spirit folk, sea (OA)", base: "human", src: "OA p.13", knownClasses: OA, rangeSource: "OA Table 10",
    classes: T9([12, "no", "no", "no", 9, "U", "no", 17, "no", "no"]),
    abilityRange: R([6, 18], [12, 18], [9, 18], [12, 18], [6, 14], [14, 18]),
    saveNote: "Sea spirit folk: +1 vs. fire-based attacks (OA p.13).",
    facts: [...SPIRIT_COMMON,
      "Breathes salt water; swims any water at normal movement; carried items stay dry; once a day predicts the next 24 hours' weather (75%) (OA p.13).",
      "Speaks the language of the sea lords (OA p.13).",
      "Once a year asks one favor of the sea (OA p.13)."]
  }
};
export const OA_RACE_KEYS = Object.keys(RACES);
