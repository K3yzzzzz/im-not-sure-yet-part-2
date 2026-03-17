# 📬 Mail Simulator *(pick a better name later)*
> A tycoon game about running a mail operation. Automate, upgrade, and try not to get raided.

---

## Game Loop

```
print mail → earn money → buy upgrades → repeat
                                    ↑
                          random raid events (risk/challenge)
```

The core fantasy is watching your mail operation run itself. You build it, optimize it, and then sit back and watch envelopes fly into a truck. That feeling of a smooth automated system is the reward.

---

## Mail Pipeline

Each station processes mail and changes its texture/state. The goal is to get mail from the dropper to the truck in full condition.

```
[Dropper] → [Stamper] → [Sealer] → [Postmarker?] → [Labeler?] → [Truck]
```

### Stations

| Station | What it does | Texture change |
|---|---|---|
| **Dropper** | Spawns raw mail | default |
| **Stamper** | Adds postage stamp | + stamp |
| **Sealer** | Adds wax seal | + wax seal |
| **Postmarker** | Cancellation stamp over postage | + postmark |
| **Labeler** | Adds address/destination label | + label |

> 💡 Each station is an upgrade — you start with just a dropper and a truck, and unlock the rest.

### Mail types *(expand later)*
- **Letters** — the base item, small and fast
- **Packages/Boxes** — slower, worth more money, need different handling
- Maybe: postcards, parcels, priority envelopes

### 🦭 The Seal Easter Egg
Rarely (~1% chance), when a letter goes through the sealer, its texture randomly becomes a seal (the animal). No gameplay effect. Just a little gift.

---

## Raid Events *(risk/challenge layer)*

Raids happen randomly and threaten your money or operation. A few options — could do one or all of them at different progression stages:

| Type | Vibe | Effect |
|---|---|---|
| **IRS** | Thematic, you're handling mail + money | Fine, lose % of earnings |
| **Mafia** | Funnier, more chaotic | Steal upgrades or sabotage machines |
| **Police** | Classic | Shut down operation temporarily |

> 💡 Raids get harder/more frequent as you earn more. Early game is safe, late game is stressful.

---

## Progression / Upgrades *(rough ideas)*

- Faster dropper speed
- Multiple conveyor lines
- Better truck (bigger capacity, faster turnaround)
- Auto-repair for machines
- Unlock new mail types
- Hire "workers" (automated arms/bots that do things the player used to do manually?)

---

## The Truck

The truck drives away on its own when full — **the player does not drive it.** Watching it leave automatically is the satisfying payoff of a good run. It comes back after a set time and you get paid.

> Maybe: upgradeable truck capacity, faster return time, multiple trucks at once.

---

## GUI / UI *(todo)*

- **HUD** — current money, mail processed, truck status
- **Shop** — buy/upgrade stations
- **Settings** — basic stuff

---

## Todo

- [ ] Loading screen
- [ ] Finish world layout
- [ ] Build stamper prop
- [ ] Build sealer prop
- [ ] Postmarker + labeler props *(optional, later)*
- [ ] Money system + HUD
- [ ] Shop / upgrade system
- [ ] Raid event system
- [ ] Multiple mail types (packages)
- [ ] Seal easter egg 🦭
- [ ] Pick a real name

---

## Tech Notes *(internal)*

- Entity system: `createEntity()` → `entityFactory.js`
- Geometry: `geomLibrary.js` — add new shapes here, keep vertex math out of world files
- Props follow the pattern in `conveyor.js` — each machine is its own file in `props/`
- World built in `buildWorld.js` — or split into sub-files per area when it gets big
- Textures: default, stamped, waxed, all — already have these ✅
- Physics hitboxes: separate `HB_` objects in .obj files, parsed into invisible colliders

---

*Started: who knows. Rewritten: 7 times. This is the one.*