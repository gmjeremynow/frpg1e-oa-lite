/**
 * Martial arts maneuvers on the OA tab (OA p.103-105, Table 70).
 * Attack maneuvers roll through the system's own attack (to-hit against targets, then damage), using a copy of the
 * style or martial arts weapon the player picks, changed as the maneuver says. The maneuver's effect is added to the card.
 * Other maneuvers post their description to chat.
 *
 * Damage: OA says "twice normal damage" / "triple normal damage" without saying whether strength and other bonuses are
 * multiplied. Here the weapon's dice are multiplied and bonuses added once, as the system does for a back stab.
 */

/** OA maneuvers that make an attack roll. L = the character's level. */
export const MANEUVER_ATTACKS = {
  "Circle kick": { mult: 2, hit: "Twice normal damage.", miss: "He loses his next attack recovering his balance." },
  "Flying kick": { mult: 3, pre: "Needs at least 5 feet of running space.", hit: "Triple normal damage.",
    miss: "He lands beside the target and spends a round getting up (unless he has prone fighting or instant stand)." },
  "Backward kick": { pre: "Against a foe directly behind him, without turning.", hit: "Normal damage.", miss: "No ill effect." },
  "Choke hold": { none: true, hit: "The choke is on: he must hold it to the end of the next round, with no attacks that round. The victim can escape with a hit at -2, once per attack he has; if he hasn't by the end of the round, he falls unconscious for 1-3 rounds." },
  "Locking block": { none: true, pre: "Instead of a normal attack, against an unarmed fighter or a melee weapon attack.",
    hit: "The foe's weapon, arm or leg is trapped and can't attack. While it is trapped he attacks with his feet only, at +4 to hit. The victim breaks free by spending an attack and hitting normally.",
    miss: "Against an unarmed fighter, the attack is wasted; against a weapon, he takes the weapon's damage." },
  "Incapacitator": { mult: 2, hit: "The victim saves versus paralyzation. On a failure, a finger, arm or leg is useless for 24 hours (as withering palm) and the double damage applies. On a save there is no damage and no effect.", miss: "No damage and no effect." },
  "Immobilizing": { none: true, hit: "The foe is held with one hand and can take no action; he can still attack with his feet or other hand. The held foe escapes by spending an attack, at -6.", miss: "-4 on his next attack." },
  "Feint": { none: true, pre: "Costs one attack.", hit: "+2 to hit on his next attack.", miss: "He just loses the attack." },
  "Leap": { none: true, pre: L => `Costs one attack. Standing start: 4 feet up and 3 feet forward, plus 1 foot per level (${L}). Running start (10 feet of space): 8 feet up and 10 feet forward, plus 1 foot per level.`,
    hit: "He lands safely.", miss: "He makes the leap but falls on landing." },
  "Concentrated push": { none: true, hit: L => `Knocked back ${L} feet (1 foot per level). Over 3 feet, the victim saves versus paralyzation to stay on his feet. Hitting something solid does damage as a fall of that distance. Immovability resists the push.`,
    miss: "Attacks on him are +2 to hit for the rest of the round." },
  "Sticking touch": { none: true, hit: "While he keeps contact: +2 on all later to-hit rolls against this foe and armor class 2 better. Contact breaks only if the foe moves in a way or at a speed beyond him.", miss: "No effect." },
  "One finger": { none: true, pre: L => `Range ${L} feet (1 foot per level). His only action this round.`,
    hit: L => `As concentrated push: knocked back ${L} feet; over 3 feet, a save versus paralyzation to stay standing; hitting something solid does falling damage.`, miss: "No effect." },
  "Iron fist": { dice: "1d10", hit: "1d10 damage: on each attack if his style's principal body part is the hands, otherwise on one attack per round." },
  "Crushing blow": { plusLevel: true, pre: "His only action this round.", hit: L => `Normal damage plus his level (+${L}). Against objects: 1/2 inch of wood or 1/4 inch of brittle stone per level (not metal).`,
    miss: "Against a hard object, he hurts his hand: he takes his normal damage and the hand is useless for 24 hours." },
  "Eagle claw": { dice: "3d10", pre: "His only action this round.", hit: "3d10 damage, or shatter objects and crush metal." },
  "Hurl": { mult: 2, hit: "The foe is thrown 1d4 feet to the ground for double damage. Immovability resists.", miss: "He loses his remaining attacks this round and automatically loses initiative next round." },
  "Great throw": { mult: 3, hit: L => `Triple damage. Thrown ${L} feet if standing, ${6 + L} feet if charging.`, miss: "The foe counters and knocks him off his feet; he automatically loses initiative next round." },
  "Pain touch": { none: true, pre: "Humans and humanoids only, instead of a normal attack.", hit: "For 1-3 rounds the victim is -2 to hit and others are +2 to hit him.", miss: "No effect." },
  "Stunning touch": { none: true, pre: "Humans and humanoids only, instead of a normal attack.", hit: "The victim saves versus paralyzation or is stunned for 1d4 rounds and can take no action.", miss: "No effect." },
  "Paralyzing touch": { none: true, pre: "Humans and humanoids only.", hit: "The victim saves versus paralyzation or can't move for 1d6 turns.", miss: "No effect." },
  "Distance death": { mult: 3, pre: L => `Humans and humanoids only. Range ${L} feet (1 foot per level). His only action this round.`,
    hit: "Triple damage, or instead the effect of pain touch (no save), stunning touch (save at -2) or paralyzing touch; with a touch effect, ignore the damage.", miss: "No effect." },
  "Weapon catch": { none: true, pre: "With a martial arts weapon, instead of a normal attack.",
    hit: "The foe's weapon (or arm or leg) is locked and can't be used to fight; he can keep attacking the foe at +2 to hit if his style's principal body part is free. The foe breaks the catch by dropping the weapon, or by spending an attack and hitting normally.",
    miss: "His weapon is fouled and twisted from his grasp: he is disarmed." },
  "Weapon breaker": { none: true, pre: "With a martial arts weapon, against a melee weapon.", hit: "The foe's weapon saves versus crushing blow or breaks.", miss: "No effect." }
};

/** Maneuvers that are always in effect (OA p.106: these work whatever style he is using). */
export const ALWAYS_ON = new Set(["Prone fighting", "Immovability", "Missile deflection", "Slow resistance", "Fall",
  "All-around sight", "Mental resistance", "Blind fighting", "Ironskin"]);

const txt = (v, L) => typeof v === "function" ? v(L) : (v ?? "");
const esc = s => foundry.utils.escapeHTML ? foundry.utils.escapeHTML(String(s ?? "")) : String(s ?? "");

export function charLevel(actor) {
  return Math.max(1, ...(actor.system.classInfo ?? []).map(c => c.level || 1));
}

/** Weapons to attack with: styles first, then the other weapons on the sheet. */
export function attackWeapons(actor, isStyle) {
  const w = actor.items.filter(i => i.type === "weapon");
  return [...w.filter(isStyle), ...w.filter(i => !isStyle(i))];
}

/** Roll a maneuver attack with a weapon item on the actor. */
export async function maneuverAttack(actor, weapon, name) {
  const m = MANEUVER_ATTACKS[name];
  const F = game.frpg1e;
  if (!m || !weapon || !F?.Rolls?.rollAttack) return;
  const L = charLevel(actor);
  const data = weapon.toObject();
  delete data._id;
  const short = weapon.name.replace(/^Martial arts:\s*/, "");
  data.name = `${short}: ${name}`;
  const d = data.system.damage;
  const base = f => F.Rules?.damageFormula?.(f) || f || "1d6";
  if (m.dice) { d.sm = d.l = m.dice; d.smRange = d.lRange = m.dice; }
  else if (m.mult) {
    d.sm = `(${base(d.sm)}) * ${m.mult}`; d.l = `(${base(d.l || d.sm)}) * ${m.mult}`;
    d.smRange = d.sm; d.lRange = d.l;
  }
  if (m.plusLevel) data.system.bonus.dmg = (data.system.bonus.dmg ?? 0) + L;
  const temp = new Item.implementation(data, { parent: actor });
  const msg = await F.Rolls.rollAttack(actor, { item: temp });
  if (!msg) return;
  let content = msg.content;
  if (m.none) content = content.replace(/<div class="card-buttons">[\s\S]*?<\/div>(\s*<div class="hint">Includes[\s\S]*?<\/div>)?/, `<div class="hint"><strong>No damage.</strong></div>`);
  const parts = [txt(m.pre, L), m.hit ? `<em>Hit:</em> ${esc(txt(m.hit, L))}` : "", m.miss ? `<em>Miss:</em> ${esc(txt(m.miss, L))}` : ""].filter(Boolean);
  const note = `<div class="hint oa-maneuver"><strong>${esc(name)} (OA p.103-105).</strong> ${parts.map((p, i) => i === 0 && m.pre ? esc(p) : p).join(" ")}${m.mult ? ` <span>The weapon's dice are multiplied; OA doesn't say whether bonuses are.</span>` : ""}</div>`;
  const i = content.lastIndexOf("</div>");
  content = content.slice(0, i) + note + content.slice(i);
  const upd = { content };
  if (m.none) upd[`flags.${game.system.id}.-=dmg`] = null;
  await msg.update(upd);
}
