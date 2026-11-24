# OA Lite for 1e FRPG, v0.1.2

An optional add-on for the 1e FRPG system for Foundry VTT (system 0.48.0 or later, Foundry V14), for use in any campaign. It adds the OA races and classes on the character sheet, martial arts, OA proficiencies, shukenja and wu jen spells, OA weapons, armor and equipment priced in standard coins, magic items and monsters. It leaves out the Eastern Lands setting, the family, honor and society rules, OA's own money and the running-the-game chapters. Turn the module on or off in Manage Modules.

Based on OA by Gary Gygax, with David "Zeb" Cook and Francois Marcela-Froideval (TSR, 1985). The rules are restated in plain words and arranged by topic; the numbers (tables, dice, spells, monsters and items) follow the book, and prices are converted to standard coins. You need the book for its original text.

Don't run OA Lite and the full OA module (frpg1e-oa) together: both add the same races and classes. If both are on, OA Lite stays off and says so.

## Install

In Foundry's Setup screen, go to Add-on Modules, Install Module, and paste this manifest URL:

`https://github.com/gmjeremynow/frpg1e-oa-lite/releases/latest/download/module.json`

Then switch it on in the world and accept the offer to build the OA Lite compendia. They can be rebuilt at any time from Configure Settings, 1e FRPG: OA Lite, Rebuild OA Lite compendia (this replaces the copies in the world).

## What it adds

- Races: human, korobokuru, hengeyokai (with the animal forms) and the bamboo, river and sea spirit folk, with the OA class limits and ability ranges.
- Classes: barbarian, bushi, kensai, monk, ninja (as a split class), samurai, shukenja, sohei, wu jen and yakuza, with their experience tables, hit dice, attacks, saving throws and spell tables. Kensai and monk armor class, bushi armor class improvement, monk movement, barbarian constitution hit points, the wu jen hit point bonus, ninja hit points and the ninja backstab multiplier are applied automatically.
- World setting "OA races and classes only", off by default, so the OA races and classes sit alongside the PHB and UA ones.
- An OA tab: class abilities for the current level, the proficiency pool, martial arts style and maneuvers, hengeyokai animal form, wu jen spells known and taboos, and yakuza contacts.
- Compendia:
  - OA Lite Journals: the rules in plain words, by topic, in seven folders: Characters, Classes, Equipment, Proficiencies, Magic, Combat and Martial Arts, and Using This Module.
  - OA Lite Spells: 311 spells in folders by class (Shukenja, Wu Jen) and level, with material component costs in standard coins.
  - OA Lite Weapons, Armor and Equipment: 265 items with the Table 47 to 54 numbers, priced in cp, sp and gp; ammunition is matched to its weapons; baskets, chests, saddle bags and the quiver are containers.
  - OA Lite Martial Arts: the 4 Table 68 styles and the 37 Table 70 special maneuvers.
  - OA Lite Proficiencies: 55 peaceful proficiencies with slots and base numbers.
  - OA Lite Magic Items: the 34 Table 86 items, with charges rolled when found.
  - OA Lite Monsters: 47 creatures in Spirits and Monsters.
  - OA Lite Tables: Table 63 (divination results), Table 65 (fate) and Table 86 (OA magic items).

## Left out

- The Eastern Lands: the lands and empires, daily life, religion and law, manners and names, and the gajin. Place names are taken out of the remaining text.
- Family, honor and society: birth rank, ancestry, birthrights, honor scores and awards, and the caste system. The OA tab has no honor or birth section.
- OA's money: the coins, barter, starting money and exchange pages, and OA's treasure tables (Table 74 and Tables II.A and III (Orient)).
- Running the game: yearly, monthly and daily events, ruins, the encounter tables, and the introduction to the OA monsters.
- Comeliness: the comeliness page is dropped and characters have six abilities. Comeliness scores are taken out of the hu hsien and lesser nature spirit entries, protection from charm no longer mentions the fascination of high comeliness, and its component "hair from a character with comeliness 21 or more" reads "hair from a character of exceptional beauty". The hu hsien keeps its power of fascination.

## Choices made here

- Prices: converted with the real values in OA Table 46: 1 fen = 1 cp, 1 yuan = 5 cp, 1 tael (or ch'ao) = 10 sp, 1 ch'ien = 5 gp, with 10 cp to the sp and 20 sp to the gp. Each price is given in the largest coin that divides it evenly (5 tael is 50 sp; 2 tael is 1 gp). This covers equipment costs, spell components, the yakuza's investigation costs and stipend (10 gp per level), and the few values in item and monster text.
- Honor: removed everywhere. Where a class rule worked through honor, the page says so and leaves the call to the DM:
  - A samurai becomes a ronin when he breaks with his code or leaves his lord's service; a ronin still advances at double the experience cost and can be taken back by a lord.
  - A ninja's duties (secrecy, finishing missions) stay; a ninja who defies the head of his clan becomes a nukenin, who needs twice the normal experience to rise as a ninja.
  - A kensai who refuses or loses a level duel still loses the new level; the honor loss is gone.
  - Resurrection: OA needs at least 50 honor; here the DM judges whether the person is honorable.
  - Subduing: every subdued creature saves versus death to see if it obeys (OA rolls against honor for creatures that have it).
  - The psychic duel and peaceful-arts contests keep their rolls and experience, without honor awards.
  - Table 13's mark for ninja preferred weapons (which cost honor) is kept with a note that it has no effect.
- Family and society: a yakuza belongs to a yakuza band (kumi) instead of a "family clan"; the ninja organization is a clan; korobokuru samurai still need a human lord to sponsor them. Class abilities tied to founding a family household (the bushi at 12th level) drop that part.
- Languages: OA's trade and court languages are replaced by the campaign's common tongue (the PHB's common), including in monster entries.
- Treasure: the DMG treasure types are used, including for the OA monsters' treasure letters. Table 86 is kept so the DM can roll OA magic items. The rod of resurrection charge tables, the protection from shapechangers note and the rule that wu jen use magic-user scrolls and shukenja cleric scrolls are kept; the OA-specific availability of DMG items, the dragon and human control tables and the everfull purse coin table are left out.
- Monster lore: the celestial bureaucracy and the Celestial Emperor stay in the spirit and dragon entries as part of those creatures' descriptions.
- Everything else (weights, sohei marks, wu jen elements, armor pieces, the book's misprints and disagreements) follows the full OA module, v0.2.0.

## Kept as printed

- Ninja pick pockets at dexterity 9, 10 and 11 is printed 15%, 10% and 05% with no minus signs (the PHB thief table has -15, -10 and -5).
- "Kawanga" (Table 49) and "o-yori" (Tables 52 and 54).
- Two-handed weapons are marked in bold on Table 49, but bold row bands are used on other lists too, so which weapons are two-handed is Unknown and none are marked.
- Know motivation and resurrection are reversible in their headers but not marked on Table 62; both are kept reversible.
- Sohei marks on 5th to 7th level spells can't come into play (sohei cast up to 4th level).
- Fear armor prints both 2d4 and 2d10 charges.
- The silence property is described but is not on Table 79.
- Bargain punishment: "+2 on saves".
- Withering palm: "decreases by 3".
- Permanency lists invisibility twice, and "respect".
- Cave kalau pain: "+1 saves".
- "shikko-" against "shikki-gaki".
- Me-zu: "Celestial Empire".
- Table 56 has no slash totals.

## Changes

- 0.1.2: martial arts styles now use a proficiency slot. Dragging a style onto a character adds it to the weapon proficiency list (OA p.106: learning a style costs one slot) and fills in the Style box on the OA tab if it is empty. The OA tab now shows slots used against the class total, counting weapon proficiencies, peaceful skills, styles and maneuvers, and lists the styles and maneuvers on the sheet. Styles dropped before this version are counted too. This version also adds a "Ki uses today" box to the OA tab: each ki power with a daily limit (OA p.16-27) gets a count of uses against its limit, with a New day button to clear them, and a warning when a power that needs all of the day's ki (kensai whirlwind, ninja pass through walls, samurai great kiai) is marked alongside other ki use.
- 0.1.1: fixed the mirror of fear's panic roll, which used a saving throw value the system doesn't accept (Foundry showed a validation error when the compendia were built). It is now marked "negates", with a note that the save is versus spell.
