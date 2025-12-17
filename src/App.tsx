import React, { useState } from "react";

/** ---------------------------------------------------------
 * Tiny UI components (uses YOUR index.css classes)
 * --------------------------------------------------------*/
function Button(props: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "default" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  const { children, onClick, disabled, variant = "default", className = "", type = "button" } = props;
  const v = variant === "primary" ? "btn btn-primary" : variant === "danger" ? "btn btn-danger" : "btn";
  return (
    <button type={type} className={`${v} ${className}`} disabled={disabled} onClick={disabled ? undefined : onClick}>
      {children}
    </button>
  );
}

function Card(props: { title: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-t">{props.title}</div>
        {props.right ? <div>{props.right}</div> : null}
      </div>
      <div className="card-b">{props.children}</div>
    </div>
  );
}

/** ---------------------------------------------------------
 * Static weapon database (fallback strings)
 * --------------------------------------------------------*/
const staticWeaponData: Record<string, string> = {
  "close combat weapon": "Melee | A3 | WS 4+ | S6 | AP0 | D1",
  ccw: "Melee | A3 | WS 4+ | S6 | AP0 | D1",
  "bolt pistol": '12" | A1 | BS 3+ | S4 | AP0 | D1 | Pistol',
  boltgun: '24" | A2 | BS 3+ | S4 | AP0 | D1',
  "bolt rifle": '24" | A2 | BS 3+ | S4 | AP-1 | D1',
  "power weapon": "Melee | A4 | WS 3+ | S4 | AP-2 | D1",
  "armoured tracks": "Melee | A6 | WS 4+ | S7 | AP0 | D1",
  "demolisher battle cannon": '24" | AD6+1 | BS 4+ | S14 | AP-3 | D6 | Blast',
  "heavy bolter": '36" | A3 | BS 4+ | S5 | AP-1 | D2 | Sustained Hits 1',
  "hunter-killer missile": '48" | A1 | BS 4+ | S14 | AP-3 | D6 | One Shot',
  autocannon: '48" | A2 | BS 4+ | S9 | AP-1 | D3',
  lasgun: '24" | A1 | BS 4+ | S3 | AP0 | D1 | Rapid Fire 1',
  flamer: '12" | AD6 | BS — | S4 | AP0 | D1 | Ignores Cover, Torrent',
  meltagun: '12" | A1 | BS 4+ | S9 | AP-4 | D6 | Melta 2',
  chainsword: "Melee | A3 | WS 4+ | S3 | AP0 | D1",
  "power weapon (guard)": "Melee | A4 | WS 3+ | S4 | AP-2 | D1",
  pyreblaster: '12" | AD6 | BS — | S5 | AP-1 | D1',
  "twin icarus ironhail heavy stubber": '36" | A3 | BS 3+ | S4 | AP0 | D1',
  "heavy laser destroyer": '72" | A2 | BS 3+ | S16 | AP-4 | D6+4',
  "astartes grenade launcher":
    '24" | multi-profile | FRAG: 24" AD3 BS 3+ S4 AP0 D1 (Blast); KRAK: 24" A1 BS 3+ S9 AP-2 D3',
  "relic weapon": "Melee | A6 | WS 2+ | S5 | AP-2 | D2",
  "hand flamer": '12" | AD6 | BS — | S3 | AP0 | D1 | Torrent, Ignores Cover',
  "absolvor bolt pistol": '18" | A1 | BS 3+ | S5 | AP-1 | D2 | Pistol',
  "storm bolter": '24" | A2 | BS 3+ | S4 | AP0 | D1 | Rapid Fire 2',
  "crozius arcanum": "Melee | A5 | WS 2+ | S6 | AP-1 | D2",
  "thunder hammer": "Melee | A3 | WS 4+ | S8 | AP-2 | D2 | Devastating Wounds",
  "scout sniper rifle": '36" | A1 | BS 3+ | S4 | AP-2 | D2 | Heavy, Precision',
  "astartes chainsword": "Melee | A4 | WS 3+ | S4 | AP-1 | D1",
  "dreadnought combat weapon": "Melee | A5 | WS 3+ | S12 | AP-2 | D3",
  "heavy flamer": '12" | AD6 | BS — | S5 | AP-1 | D1 | Ignores Cover, Torrent',
  "twin lascannon": '48" | A2 | BS 3+ | S12 | AP-3 | D6+1 | Heavy',
  laspistol: '12" | A1 | BS 4+ | S3 | AP0 | D1 | Pistol',
  "plasma gun (standard)": '24" | A1 | BS 4+ | S7 | AP-2 | D1 | Rapid Fire 1',
  "plasma gun (overcharge)": '24" | A1 | BS 4+ | S8 | AP-3 | D2 | Rapid Fire 1, Hazardous',
  "plasma pistol (standard)": '12" | A1 | BS 3+ | S7 | AP-2 | D1 | Pistol',
  "plasma pistol (overcharge)": '12" | A1 | BS 3+ | S8 | AP-3 | D2 | Pistol, Hazardous',
  "grenade launcher (frag)": '24" | AD3 | BS 4+ | S4 | AP0 | D1 | Blast',
  "grenade launcher (krak)": '24" | A1 | BS 4+ | S9 | AP-2 | D3',
  "vox-caster": "Wargear | No direct attack",
  "chainsword (guard)": "Melee | A4 | WS 4+ | S3 | AP0 | D1",
  "medic kit": "Wargear | 6+ Feel No Pain (carrier unit)",
  "regimental standard": "Wargear | +1 OC to unit",
  "drum-fed autogun": '24" | A3 | BS 4+ | S3 | AP0 | D1',
  "master vox": "Wargear | Extends order range to 24\"",
};

const norm = (s: string) => (s || "").toLowerCase().trim();

/** ---------------------------------------------------------
 * Parsers/helpers
 * --------------------------------------------------------*/
const extractAbilities = (unit: any) => {
  const abilities: { name: string; description: string }[] = [];
  const walk = (sel: any) => {
    if (sel?.profiles) {
      sel.profiles.forEach((p: any) => {
        if (norm(p.typeName) === "abilities") {
          const desc = p.characteristics?.find((c: any) => norm(c.name) === "description")?.["$text"] || "";
          abilities.push({ name: p.name, description: desc });
        }
      });
    }
    if (sel?.selections) sel.selections.forEach((sub: any) => walk(sub));
  };
  walk(unit);
  const seen = new Set<string>();
  return abilities.filter((a) => (seen.has(a.name) ? false : (seen.add(a.name), true)));
};

const extractDetachmentRules = (force: any) => {
  const rules: { name: string; description: string }[] = [];
  const det = force?.selections?.find((s: any) => norm(s.name).includes("detachment"));
  if (det?.selections) {
    det.selections.forEach((sel: any) => {
      sel?.profiles?.forEach((p: any) => {
        if (norm(p.typeName) === "abilities") {
          const desc = p.characteristics?.find((c: any) => norm(c.name) === "description")?.["$text"] || "";
          rules.push({ name: p.name, description: desc });
        }
      });
    });
  }
  force?.rules?.forEach((r: any) => rules.push({ name: r.name, description: r.description }));
  const seen = new Set<string>();
  return rules.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)));
};

const formatWeaponProfile = (profile: any) => {
  const getVal = (n: string) => profile.characteristics?.find((c: any) => norm(c.name) === norm(n))?.value || "—";
  return `${getVal("Range")} | A${getVal("Attacks")} | BS ${getVal("BS")} | S${getVal("S")} | AP${getVal("AP")} | D${getVal(
    "D"
  )}`;
};

/** ✅ UPDATED: preserve duplicate weapon instances by suffixing names: "Heavy bolter", "Heavy bolter (2)" */
const baseWeaponName = (n: string) => String(n || "").replace(/\s*\(\d+\)\s*$/, "").trim();

const extractWeapons = (selection: any, weapons: Record<string, string> = {}) => {
  if (!selection) return weapons;

  if (selection.profiles) {
    selection.profiles.forEach((p: any) => {
      if (norm(p.typeName).includes("weapon")) {
        const rawName = String(p.name || "Unknown Weapon").trim();
        const base = baseWeaponName(rawName);

        // Make the key unique if it already exists
        let finalName = rawName;
        if (weapons[finalName] != null) {
          let i = 2;
          while (weapons[`${rawName} (${i})`] != null) i++;
          finalName = `${rawName} (${i})`;
        }

        // Static lookup uses base name (without suffix)
        const staticData = staticWeaponData[norm(base)];
        weapons[finalName] = staticData || formatWeaponProfile(p);
      }
    });
  }

  if (selection.selections) selection.selections.forEach((sub: any) => extractWeapons(sub, weapons));
  return weapons;
};

const extractStats = (unit: any) => {
  const stats: Record<string, string> = {};
  const wanted = new Set(["m", "t", "sv", "w", "ld", "oc", "ws", "bs", "a"]);
  const walk = (sel: any) => {
    if (sel?.profiles) {
      sel.profiles.forEach((p: any) => {
        const tn = norm(p.typeName);
        if (tn.includes("unit") || tn.includes("model") || tn.includes("stat")) {
          p.characteristics?.forEach((c: any) => {
            const key = norm(c.name);
            if (wanted.has(key)) stats[key] = c.value || c["$text"] || "";
          });
        }
      });
    }
    if (sel?.selections) sel.selections.forEach((sub: any) => walk(sub));
  };
  walk(unit);
  return stats;
};

// ✅ PATCH 1: multi-model tracking (New Recruit JSON often stores each model as type:"model" with "number")
const extractModelCount = (unit: any) => {
  let count = 0;
  const walk = (sel: any) => {
    if (!sel) return;
    if (sel.type === "model") {
      const n = Number(sel.number ?? 1);
      count += Number.isFinite(n) ? n : 1;
    }
    if (sel.selections) sel.selections.forEach((sub: any) => walk(sub));
  };
  walk(unit);
  return Math.max(1, count);
};

// ✅ PATCH 2: keywords/categories (Vehicle detection)
const extractKeywords = (unit: any) => (unit?.categories || []).map((c: any) => String(c.name || "")).filter(Boolean);

/** ---------------------------------------------------------
 * Combat helpers (simple 10th-ish core)
 * --------------------------------------------------------*/
type ParsedWeapon = {
  name: string;
  profileName?: string; // for multi-profile
  attacks: number;
  skillType: "BS" | "WS";
  skill: number; // e.g. 3 means 3+
  strength: number;
  ap: number; // negative numbers allowed
  damage: number;
  raw: string;

  // ✅ PATCH 3: no-BS / Torrent weapons auto-hit in shooting
  autoHit: boolean;
};

const parsePlusNumber = (s: string) => {
  const m = String(s).match(/(\d+)\s*\+/);
  return m ? parseInt(m[1], 10) : null;
};

const parseSignedInt = (s: string) => {
  const m = String(s).match(/-?\d+/);
  return m ? parseInt(m[0], 10) : null;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function parseWeaponFromText(name: string, raw: string, mode: "shoot" | "fight"): ParsedWeapon | null {
  const txt = raw || "";
  const attacksMatch = txt.match(/\bA\s*D?(\d+)(?:\s*\+\s*\d+)?\b/i) || txt.match(/\bA(\d+)\b/i);
  const attacks = attacksMatch ? parseInt(attacksMatch[1], 10) : 1;

  // ✅ PATCH 3: detect "BS —/N/A" or Torrent = auto-hit (shooting only)
  const bsIsNA = /\bBS\s*(?:—|N\/A|-)\b/i.test(txt) || /\bBS\s*—/i.test(txt);
  const hasTorrent = /\btorrent\b/i.test(txt);
  const autoHit = mode === "shoot" && (bsIsNA || hasTorrent);

  let skillType: "BS" | "WS" = mode === "fight" ? "WS" : "BS";
  let skill: number | null =
    (txt.match(/\bBS\s*(\d+)\s*\+/i)?.[1] ? parseInt(txt.match(/\bBS\s*(\d+)\s*\+/i)![1], 10) : null) ??
    (txt.match(/\bWS\s*(\d+)\s*\+/i)?.[1] ? parseInt(txt.match(/\bWS\s*(\d+)\s*\+/i)![1], 10) : null);

  if (mode === "fight") {
    skillType = "WS";
    skill = skill ?? 4;
  } else {
    skillType = "BS";
    skill = skill ?? 4;
  }

  const sVal = parseSignedInt(txt.match(/\bS\s*([-\d]+)/i)?.[1] ?? txt.match(/\bS(\d+)/i)?.[1] ?? "");
  const apVal = parseSignedInt(txt.match(/\bAP\s*([-\d]+)/i)?.[1] ?? "");
  const dVal = parseSignedInt(txt.match(/\bD\s*([-\d]+)/i)?.[1] ?? "");

  if (sVal == null || apVal == null || dVal == null || skill == null) return null;

  return {
    name,
    attacks,
    skillType,
    skill: clamp(skill, 2, 6),
    strength: Math.max(1, sVal),
    ap: apVal,
    damage: Math.max(1, dVal),
    raw: txt,
    autoHit,
  };
}

function woundNeeded(str: number, tough: number) {
  if (str >= 2 * tough) return 2;
  if (str > tough) return 3;
  if (str === tough) return 4;
  if (str * 2 <= tough) return 6;
  return 5;
}

/** ---------------------------------------------------------
 * App
 * --------------------------------------------------------*/
const PHASES = ["Movement", "Shooting", "Charge", "Fight"] as const;

type Phase = (typeof PHASES)[number];

type Page =
  | "cover"
  | "selectSize"
  | "importP1"
  | "p1Display"
  | "importP2"
  | "p2Display"
  | "missionSelect"
  | "rolloff"
  | "deployment"
  | "rolloff2"
  | "battle"
  | "winner"
  | "complete";

type ModalStep =
  | "choose"
  | "instructions"
  | "selectWeapon"
  | "selectEnemy"
  | "hitRoll"
  | "woundRoll"
  | "saveRoll"
  | "attackResult"
  | "summary";

type CombatAction = "Move" | "Shoot" | "Charge" | "Fight";

type UnitModel = {
  id: string; // ✅ unique per entry (fixes duplicates)
  name: string;
  points: number;
  abilities: { name: string; description: string }[];
  weapons: Record<string, string>;
  stats: Record<string, string>;

  // ✅ PATCH 2: for Vehicle detection etc.
  keywords: string[];

  deployed: boolean;
  destroyed: boolean;

  // ✅ PATCH 1: per-model wounds + model count
  woundsPerModel: number | null;
  woundsRemaining: number | null;
  modelsStarting: number;
  modelsRemaining: number;

  // ✅ per-model action counter (used in Shooting + Fight only for NON-vehicles)
  actionsRemainingInPhase: number;

  // ✅ NEW: per-phase weapon usage (Vehicles only, but safe for all)
  usedWeaponsByPhase: Record<string, string[]>;

  actedInPhase: Record<string, boolean>;
};

type ArmyModel = {
  armyName: string;
  faction: string;
  totalPoints: number;
  detachment: string;
  detachmentRules: { name: string; description: string }[];
  units: UnitModel[];
};

export default function App() {
  const [page, setPage] = useState<Page>("cover");
  const [pageHistory, setPageHistory] = useState<Page[]>([]);
  const [selectedSize, setSelectedSize] = useState<number | "Unlimited" | null>(null);
  const [army1, setArmy1] = useState<ArmyModel | null>(null);
  const [army2, setArmy2] = useState<ArmyModel | null>(null);

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; visible: boolean }>({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const [roll1, setRoll1] = useState<number | "">("");
  const [roll2, setRoll2] = useState<number | "">("");

  const [deploymentTurn, setDeploymentTurn] = useState<1 | 2 | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState<1 | 2 | null>(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);

  const [placementModal, setPlacementModal] = useState<{
    visible: boolean;
    player: 1 | 2 | null;
    unitId: string | null;
  }>({ visible: false, player: null, unitId: null });

  // ✅ Upgraded action modal state machine
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    player: 1 | 2 | null;
    unitId: string | null;
    action: CombatAction | null;
    step: ModalStep | null;

    // combat selections (single-weapon baseline)
    weaponName: string | null;
    weaponProfileRaw: string | null; // if multi-profile chosen
    targetId: string | null;

    // ✅ vehicles can shoot multiple weapons in one activation
    weaponNames: string[]; // selected weapons (vehicle shoot)
    weaponProfilesByName: Record<string, string>; // chosen raw per weapon
    weaponIndex: number; // which weapon we're currently resolving

    // per-attack loop
    attackIndex: number;
    totalAttacks: number;

    // rolls
    cover: boolean;
    hitRoll: number | null;
    woundRoll: number | null;
    saveRoll: number | null;

    // last attack outcome
    hitSuccess: boolean | null;
    woundSuccess: boolean | null;
    saveSuccess: boolean | null;
    damageApplied: number;

    // summary
    hits: number;
    wounds: number;
    unsaved: number;
    totalDamage: number;
  }>({
    visible: false,
    player: null,
    unitId: null,
    action: null,
    step: null,

    weaponName: null,
    weaponProfileRaw: null,
    targetId: null,

    weaponNames: [],
    weaponProfilesByName: {},
    weaponIndex: 0,

    attackIndex: 0,
    totalAttacks: 0,

    cover: false,
    hitRoll: null,
    woundRoll: null,
    saveRoll: null,

    hitSuccess: null,
    woundSuccess: null,
    saveSuccess: null,
    damageApplied: 0,

    hits: 0,
    wounds: 0,
    unsaved: 0,
    totalDamage: 0,
  });

  const changePage = (p: Page) => {
    setPageHistory((prev) => [...prev, page]);
    setPage(p);
  };

  const goBack = () => {
    if (pageHistory.length) {
      const prev = pageHistory[pageHistory.length - 1];
      setPageHistory((ph) => ph.slice(0, -1));
      setPage(prev);
    }
  };

  const computeTooltipPos = (clientX: number, clientY: number) => {
    const padding = 14;
    const maxW = 360;
    const approxH = 180;
    const x = Math.min(clientX + 14, window.innerWidth - maxW - padding);
    const y = Math.min(clientY + 16, window.innerHeight - approxH - padding);
    return { x, y };
  };

  const showTooltip = (text: string, e: React.MouseEvent<HTMLElement>) => {
    const pos = computeTooltipPos(e.clientX, e.clientY);
    setTooltip({ text: text || "No data", x: pos.x, y: pos.y, visible: true });
  };
  const moveTooltip = (e: React.MouseEvent<HTMLElement>) => {
    setTooltip((t) => {
      if (!t.visible) return t;
      const pos = computeTooltipPos(e.clientX, e.clientY);
      return { ...t, x: pos.x, y: pos.y };
    });
  };
  const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

  const exceedsLimit = (pts: number) => selectedSize !== "Unlimited" && selectedSize !== null && pts > (selectedSize as number);

  const decideFirstPlayer = () => {
    if (roll1 === "" || roll2 === "") return "—";
    if ((roll1 as number) > (roll2 as number)) return "Player 1";
    if ((roll2 as number) > (roll1 as number)) return "Player 2";
    return "Tie: reroll";
  };

  const parseArmy = (data: any): ArmyModel | null => {
    const force = data?.roster?.forces?.[0];
    if (!force) return null;

    const armyName = data.roster?.costs?.find((c: any) => c.name === "name")?.value || force.catalogueName || "Unnamed Army";
    const faction = force.catalogueName || "Unknown Faction";
    const totalPoints = data.roster?.costs?.find((c: any) => c.name === "pts")?.value || 0;
    const detachment =
      force.selections?.find((s: any) => s.name === "Detachment")?.selections?.[0]?.name || "Unknown Detachment";

    const detachmentRules = extractDetachmentRules(force);

    let counter = 0;
    const units: UnitModel[] =
      force.selections
        ?.filter((s: any) => s.type === "model" || s.type === "unit")
        ?.map((u: any) => {
          const points = u.costs?.find((c: any) => c.name === "pts")?.value || 0;
          const abilities = extractAbilities(u);
          const weapons = extractWeapons(u, {});
          const stats = extractStats(u);

          const wRaw = stats["w"];
          const woundsPerModel = wRaw ? parseInt(String(wRaw).replace(/\D/g, ""), 10) : NaN;

          const modelsStarting = extractModelCount(u);
          const keywords = extractKeywords(u);

          // ✅ UNIQUE ID FIX (duplicates no longer collide)
          const id = `u_${Date.now()}_${counter++}`;

          return {
            id,
            name: u.name,
            points,
            abilities,
            weapons,
            stats,
            keywords,

            deployed: false,
            destroyed: false,

            // ✅ PATCH 1: per-model wounds + model count
            woundsPerModel: Number.isFinite(woundsPerModel) ? woundsPerModel : null,
            woundsRemaining: Number.isFinite(woundsPerModel) ? woundsPerModel : null,

            modelsStarting,
            modelsRemaining: modelsStarting,

            // ✅ start full (will be reset each Shooting/Fight phase)
            actionsRemainingInPhase: modelsStarting,

            // ✅ Vehicle weapon-usage tracker (per phase)
            usedWeaponsByPhase: {},

            actedInPhase: {},
          };
        }) || [];

    return { armyName, faction, totalPoints, detachment, detachmentRules, units };
  };

  const getRollWinner = (): 1 | 2 | null => {
    const w = decideFirstPlayer();
    if (w === "Player 1") return 1;
    if (w === "Player 2") return 2;
    return null;
  };

  const startDeployment = () => {
    const winner = getRollWinner();
    setDeploymentTurn(winner || 1);
    changePage("deployment");
  };

  const markUnitDeployed = (player: 1 | 2, unitId: string) => {
    const army = player === 1 ? army1 : army2;
    if (!army) return;
    const u = army.units.find((x) => x.id === unitId);
    if (!u) return;
    u.deployed = true;
    player === 1 ? setArmy1({ ...army }) : setArmy2({ ...army });
    setDeploymentTurn((prev) => (prev === 1 ? 2 : 1));
  };

  const allDeployed = () => {
    if (!army1 || !army2) return false;
    return army1.units.every((u) => u.deployed) && army2.units.every((u) => u.deployed);
  };

  /** -------- lookups -------- */
  const getArmy = (player: 1 | 2) => (player === 1 ? army1 : army2);
  const getEnemyArmy = (player: 1 | 2) => (player === 1 ? army2 : army1);

  const getUnit = (player: 1 | 2, unitId: string | null) => {
    const a = getArmy(player);
    if (!a || !unitId) return null;
    return a.units.find((u) => u.id === unitId) || null;
  };

  const getEnemyUnit = (player: 1 | 2, targetId: string | null) => {
    const a = getEnemyArmy(player);
    if (!a || !targetId) return null;
    return a.units.find((u) => u.id === targetId) || null;
  };

  // ✅ "Vehicle" keyword check (exact-ish + robust)
  const isVehicleUnit = (u: UnitModel | null) =>
    !!u?.keywords?.some((k) => norm(k) === "vehicle" || norm(k).includes("vehicle"));

  const isPerModelPhase = (phase: Phase) => phase === "Shooting" || phase === "Fight";

  /** ✅ Vehicle weapon-usage helpers (weapon instances can be used once per phase) */
  const getUsedWeaponsForPhase = (u: UnitModel, phase: Phase) => u.usedWeaponsByPhase[phase] || [];

  const getRemainingWeaponInstancesForPhase = (u: UnitModel, phase: Phase) => {
    const used = new Set(getUsedWeaponsForPhase(u, phase));
    return Object.keys(u.weapons).filter((w) => !used.has(w));
  };

  const vehicleHasWeaponsRemainingThisPhase = (u: UnitModel, phase: Phase) => {
    if (!isPerModelPhase(phase)) return false;
    return getRemainingWeaponInstancesForPhase(u, phase).length > 0;
  };

  const markWeaponsUsedForPhase = (player: 1 | 2, unitId: string, phase: Phase, weaponNames: string[]) => {
    const army = player === 1 ? army1 : army2;
    if (!army) return;
    const u = army.units.find((x) => x.id === unitId);
    if (!u) return;

    const used = new Set(u.usedWeaponsByPhase[phase] || []);
    weaponNames.forEach((w) => used.add(w));
    u.usedWeaponsByPhase[phase] = Array.from(used);

    // If vehicle has no remaining weapon instances this phase, mark acted
    if (isVehicleUnit(u) && isPerModelPhase(phase)) {
      const remaining = getRemainingWeaponInstancesForPhase(u, phase);
      if (remaining.length === 0) {
        u.actedInPhase[phase] = true;
      }
    }

    player === 1 ? setArmy1({ ...army }) : setArmy2({ ...army });
  };

  // ✅ Reset per-phase flags + per-model action counter ONLY for Shooting/Fight
  const resetPhaseActedFlags = (army: ArmyModel, phase: Phase) => {
    army.units.forEach((u) => {
      u.actedInPhase = {};
      if (isPerModelPhase(phase)) {
        // Non-vehicles use this; vehicles ignore it (but harmless to set)
        u.actionsRemainingInPhase = u.modelsRemaining;
        // Reset vehicle weapon usage each phase
        u.usedWeaponsByPhase[phase] = [];
      }
    });
  };

  const startBattle = () => {
    setCurrentRound(1);
    const winner = getRollWinner() || 1;
    const startingPhase: Phase = PHASES[0];
    setCurrentPlayerTurn(winner);
    setCurrentPhaseIndex(0);

    if (army1) resetPhaseActedFlags(army1, startingPhase);
    if (army2) resetPhaseActedFlags(army2, startingPhase);

    changePage("battle");
  };

  const markUnitActed = (player: 1 | 2, unitId: string) => {
    const army = player === 1 ? army1 : army2;
    if (!army) return;
    const phase = PHASES[currentPhaseIndex];
    const u = army.units.find((x) => x.id === unitId);
    if (!u) return;
    u.actedInPhase[phase] = true;
    player === 1 ? setArmy1({ ...army }) : setArmy2({ ...army });
  };

  // ✅ Remaining now means:
  // - Movement/Charge: units not marked acted
  // - Shooting/Fight:
  //    - Vehicles: can act while they have unused weapon instances remaining this phase
  //    - Non-vehicles: actionsRemainingInPhase > 0
  const unitsRemainingToAct = (player: 1 | 2) => {
    const army = player === 1 ? army1 : army2;
    if (!army) return 0;
    const phase = PHASES[currentPhaseIndex];

    if (isPerModelPhase(phase)) {
      return army.units.filter((u) => {
        if (!u.deployed || u.destroyed) return false;
        if (isVehicleUnit(u)) return vehicleHasWeaponsRemainingThisPhase(u, phase);
        return u.actionsRemainingInPhase > 0;
      }).length;
    }

    return army.units.filter((u) => u.deployed && !u.destroyed && !u.actedInPhase[phase]).length;
  };

  const nextPhase = () => {
    const next = currentPhaseIndex + 1;

    if (next < PHASES.length) {
      const nextPhaseName: Phase = PHASES[next];
      setCurrentPhaseIndex(next);
      if (army1) resetPhaseActedFlags(army1, nextPhaseName);
      if (army2) resetPhaseActedFlags(army2, nextPhaseName);
      return;
    }

    if (currentPlayerTurn === 1) {
      const nextPhaseName: Phase = PHASES[0];
      setCurrentPlayerTurn(2);
      setCurrentPhaseIndex(0);
      if (army1) resetPhaseActedFlags(army1, nextPhaseName);
      if (army2) resetPhaseActedFlags(army2, nextPhaseName);
      return;
    }

    if (currentRound >= 5) {
      changePage("complete");
      return;
    }

    const nextPhaseName: Phase = PHASES[0];
    setCurrentRound((r) => r + 1);
    const winner = getRollWinner() || 1;
    setCurrentPlayerTurn(winner);
    setCurrentPhaseIndex(0);
    if (army1) resetPhaseActedFlags(army1, nextPhaseName);
    if (army2) resetPhaseActedFlags(army2, nextPhaseName);
  };

  /** ---------------------------------------------------------
   * UI helpers
   * --------------------------------------------------------*/
  const StatLine = ({ stats }: { stats: Record<string, string> }) => {
    const order = ["m", "t", "sv", "w", "ld", "oc", "ws", "bs", "a"];
    const labels: Record<string, string> = { m: "M", t: "T", sv: "SV", w: "W", ld: "LD", oc: "OC", ws: "WS", bs: "BS", a: "A" };
    const pairs = order.filter((k) => stats[k]).map((k) => ({ k, v: stats[k] }));
    if (!pairs.length) return null;
    return (
      <div className="kv" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        {pairs.map(({ k, v }) => (
          <div key={k}>
            <b>{labels[k]}:</b> {v}
          </div>
        ))}
      </div>
    );
  };

  const AbilityList = ({ abilities }: { abilities: { name: string; description: string }[] }) => (
    <ul className="list">
      {abilities.length ? (
        abilities.map((a, i) => (
          <li
            key={i}
            className="clickable"
            onMouseEnter={(e) => showTooltip(a.description || "No description", e)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            {a.name}
          </li>
        ))
      ) : (
        <li className="small">None</li>
      )}
    </ul>
  );

  const WeaponList = ({ weapons }: { weapons: Record<string, string> }) => (
    <ul className="list">
      {Object.keys(weapons).length ? (
        Object.entries(weapons).map(([n, s], i) => (
          <li
            key={i}
            className="clickable"
            onMouseEnter={(e) => showTooltip(s, e)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            {n}
          </li>
        ))
      ) : (
        <li className="small">None</li>
      )}
    </ul>
  );

  const ArmyHeader = ({ army }: { army: ArmyModel }) => (
    <Card
      title={army.armyName}
      right={
        <div className="pills">
          <span className="pill">{army.faction}</span>
          <span className={`pill ${exceedsLimit(army.totalPoints) ? "warn" : ""}`}>{army.totalPoints}pts</span>
          <span className="pill">{army.detachment}</span>
        </div>
      }
    >
      <div className="kv">
        <div>
          <b>Points:</b> {army.totalPoints}{" "}
          {exceedsLimit(army.totalPoints) ? <span className="warn">⚠ Exceeds limit</span> : null}
        </div>
      </div>
      <div className="hr" />
      <div>
        <b>Rules:</b>
        {army.detachmentRules?.length ? (
          <ul className="list">
            {army.detachmentRules.map((r, i) => (
              <li
                key={i}
                className="clickable"
                onMouseEnter={(e) => showTooltip(r.description || "No description", e)}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                {r.name}
              </li>
            ))}
          </ul>
        ) : (
          <div className="small">No rules found</div>
        )}
      </div>
    </Card>
  );

  const ArmyUnits = ({ units, player }: { units: UnitModel[]; player: 1 | 2 }) => (
    <div className="stack">
      {units.map((u) => {
        const phase = PHASES[currentPhaseIndex];
        const pm = isPerModelPhase(phase);

        const canActThisUnit =
          page === "battle" &&
          currentPlayerTurn === player &&
          u.deployed &&
          !u.destroyed &&
          (pm ? (isVehicleUnit(u) ? vehicleHasWeaponsRemainingThisPhase(u, phase) : u.actionsRemainingInPhase > 0) : !u.actedInPhase[phase]);

        return (
          <Card
            key={u.id}
            title={`${u.name} — ${u.points}pts`}
            right={
              <div className="pills">
                {u.destroyed ? <span className="pill">Destroyed</span> : null}
                {u.deployed ? <span className="pill">Deployed</span> : <span className="pill">Not deployed</span>}

                {u.modelsStarting > 1 ? <span className="pill">Models:{u.modelsRemaining}/{u.modelsStarting}</span> : null}
                {u.woundsRemaining != null ? <span className="pill">W:{u.woundsRemaining}</span> : null}

                {page === "battle" && pm ? (
                  isVehicleUnit(u) ? (
                    <span className="pill">Weapons left:{getRemainingWeaponInstancesForPhase(u, phase).length}</span>
                  ) : (
                    <span className="pill">Actions:{u.actionsRemainingInPhase}</span>
                  )
                ) : null}

                {page === "battle" ? (
                  !pm ? (
                    u.actedInPhase[phase] ? <span className="pill">Acted</span> : <span className="pill">Ready</span>
                  ) : isVehicleUnit(u) ? (
                    vehicleHasWeaponsRemainingThisPhase(u, phase) ? <span className="pill">Ready</span> : <span className="pill">Acted</span>
                  ) : u.actionsRemainingInPhase <= 0 ? (
                    <span className="pill">Acted</span>
                  ) : (
                    <span className="pill">Ready</span>
                  )
                ) : null}
              </div>
            }
          >
            <StatLine stats={u.stats} />
            <div className="hr" />
            <div>
              <b>Abilities:</b>
              <AbilityList abilities={u.abilities} />
            </div>
            <div className="hr" />
            <div>
              <b>Weapons:</b>
              <WeaponList weapons={u.weapons} />
            </div>

            {page === "deployment" && !u.deployed && (
              <div style={{ marginTop: 12 }}>
                <Button variant="primary" onClick={() => setPlacementModal({ visible: true, player, unitId: u.id })}>
                  Mark Placed
                </Button>
              </div>
            )}

            {canActThisUnit && (
              <div style={{ marginTop: 12 }}>
                <Button
                  variant="primary"
                  onClick={() =>
                    setActionModal({
                      visible: true,
                      player,
                      unitId: u.id,
                      action: null,
                      step: "choose",

                      weaponName: null,
                      weaponProfileRaw: null,
                      targetId: null,

                      weaponNames: [],
                      weaponProfilesByName: {},
                      weaponIndex: 0,

                      attackIndex: 0,
                      totalAttacks: 0,

                      cover: false,
                      hitRoll: null,
                      woundRoll: null,
                      saveRoll: null,

                      hitSuccess: null,
                      woundSuccess: null,
                      saveSuccess: null,
                      damageApplied: 0,

                      hits: 0,
                      wounds: 0,
                      unsaved: 0,
                      totalDamage: 0,
                    })
                  }
                >
                  Act
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  /** ---------------------------------------------------------
   * Pages
   * --------------------------------------------------------*/
  const renderCover = () => (
    <div className="stack" style={{ paddingTop: 18 }}>
      <div className="h1">Warhammer 40K Assistant</div>
      <div className="muted">Import two armies, deploy, then run rounds/phases.</div>
      <div className="pills">
        <Button variant="primary" onClick={() => changePage("selectSize")}>
          Start New Battle
        </Button>
        <Button disabled>Continue Previous Battle</Button>
      </div>
    </div>
  );

  const renderSelectSize = () => (
    <div className="stack" style={{ paddingTop: 18 }}>
      <div className="h2">Select Battle Size</div>
      <div className="pills">
        {[500, 1000, 1500, 2000, "Unlimited"].map((s) => (
          <Button
            key={String(s)}
            variant="primary"
            onClick={() => {
              setSelectedSize(s as any);
              changePage("importP1");
            }}
          >
            {String(s)} pts
          </Button>
        ))}
      </div>
    </div>
  );

  const renderImport = (label: string, onFile: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
    <div className="stack" style={{ paddingTop: 18 }}>
      <div className="h2">{label}</div>
      <div className="card">
        <div className="card-b">
          <div className="muted">Upload a New Recruit .json file</div>
          <div style={{ marginTop: 10 }}>
            <input type="file" accept=".json" onChange={onFile} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderArmyPage = (army: ArmyModel, player: 1 | 2, nextPage: Page) => (
    <div className="stack">
      <ArmyHeader army={army} />
      <ArmyUnits units={army.units} player={player} />
      <div className="pills">
        <Button onClick={goBack}>Back</Button>
        <Button variant="primary" onClick={() => changePage(nextPage)}>
          Next
        </Button>
      </div>
    </div>
  );

  const renderMissionSelect = () => (
    <div className="stack" style={{ paddingTop: 18 }}>
      <div className="h2">Select Mission</div>
      <div className="muted">Placeholder list for now.</div>
      <div className="stack">
        {["Take and Hold", "Purge the Enemy", "Supply Drop", "Encircle", "Sabotage"].map((m) => (
          <Button key={m} variant="primary" onClick={() => changePage("rolloff")}>
            {m}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderRolloff = (next: Page) => (
    <div className="stack" style={{ paddingTop: 18 }}>
      <div className="h2">Roll to Decide Who Goes First</div>
      <div className="grid2">
        <div className="card">
          <div className="card-b">
            <b>Player 1 roll</b>
            <div style={{ marginTop: 8 }}>
              <select value={roll1 || ""} onChange={(e) => setRoll1(parseInt(e.target.value))}>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-b">
            <b>Player 2 roll</b>
            <div style={{ marginTop: 8 }}>
              <select value={roll2 || ""} onChange={(e) => setRoll2(parseInt(e.target.value))}>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="pills">
        <Button onClick={goBack}>Back</Button>
        <Button
          variant="primary"
          onClick={() => {
            if (next === "winner") changePage("winner");
            else if (next === "battle") startBattle();
            else changePage(next);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderDeployment = () => {
    const turn = deploymentTurn || 1;
    return (
      <div className="stack" style={{ paddingTop: 18 }}>
        <div className="h2">Deployment</div>
        <div className="muted">Turn to place: Player {turn}</div>
        <div className="grid2">
          <div>
            <div className="h2">Player 1</div>
            <ArmyUnits units={army1?.units || []} player={1} />
          </div>
          <div>
            <div className="h2">Player 2</div>
            <ArmyUnits units={army2?.units || []} player={2} />
          </div>
        </div>
        <div className="pills">
          <Button onClick={goBack}>Back</Button>
          <Button variant="primary" disabled={!allDeployed()} onClick={() => changePage("rolloff2")}>
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderBattle = () => {
    const player = currentPlayerTurn as 1 | 2;
    const phase = PHASES[currentPhaseIndex];
    return (
      <div className="stack" style={{ paddingTop: 18 }}>
        <div className="card">
          <div className="card-b">
            <div className="pills">
              <span className="pill">Round {currentRound}</span>
              <span className="pill">Player {player} turn</span>
              <span className="pill">Phase: {phase}</span>
              <span className="pill">Remaining: {unitsRemainingToAct(player)}</span>
            </div>
          </div>
        </div>

        <div className="grid2">
          <div>
            <div className="h2">Player 1 Units</div>
            <ArmyUnits units={army1?.units || []} player={1} />
          </div>
          <div>
            <div className="h2">Player 2 Units</div>
            <ArmyUnits units={army2?.units || []} player={2} />
          </div>
        </div>

        <div className="pills">
          <Button onClick={goBack}>Back</Button>
          <Button variant="primary" onClick={nextPhase}>
            {currentPhaseIndex === PHASES.length - 1 ? "Next Player" : "Next Phase"}
          </Button>
        </div>
      </div>
    );
  };

  /** ---------------------------------------------------------
   * File handlers
   * --------------------------------------------------------*/
  const onUploadP1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const j = JSON.parse(String(ev.target?.result));
        const parsed = parseArmy(j);
        setArmy1(parsed);
        changePage("p1Display");
      } catch {
        alert("Invalid JSON");
      }
    };
    r.readAsText(f);
  };

  const onUploadP2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const j = JSON.parse(String(ev.target?.result));
        const parsed = parseArmy(j);
        setArmy2(parsed);
        changePage("p2Display");
      } catch {
        alert("Invalid JSON");
      }
    };
    r.readAsText(f);
  };

  /** ---------------------------------------------------------
   * Action modal logic
   * --------------------------------------------------------*/
  const closeActionModal = () => {
    setActionModal((a) => ({
      ...a,
      visible: false,
      player: null,
      unitId: null,
      action: null,
      step: null,
      weaponName: null,
      weaponProfileRaw: null,
      targetId: null,

      weaponNames: [],
      weaponProfilesByName: {},
      weaponIndex: 0,
    }));
  };

  const currentActingUnit = () => {
    if (!actionModal.player) return null;
    return getUnit(actionModal.player, actionModal.unitId);
  };

  const currentTargetUnit = () => {
    if (!actionModal.player) return null;
    return getEnemyUnit(actionModal.player, actionModal.targetId);
  };

  const getWeaponProfiles = (weaponName: string, raw: string) => {
    const t = raw || "";
    if (t.toLowerCase().includes("multi-profile") && t.includes("FRAG:") && t.includes("KRAK:")) {
      const frag = t.split("FRAG:")[1]?.split("KRAK:")[0]?.replace(/;\s*$/, "").trim() || "";
      const krak = t.split("KRAK:")[1]?.trim() || "";
      return [
        { label: "FRAG", raw: frag },
        { label: "KRAK", raw: krak },
      ].filter((p) => p.raw.length > 0);
    }
    return [{ label: "Default", raw }];
  };

  const beginCombatFlow = (action: CombatAction) => {
    setActionModal((a) => ({
      ...a,
      action,
      step: "instructions",
    }));
  };

  const goFromInstructions = () => {
    // ✅ Movement/Charge are unit-wide: one-and-done
    if (actionModal.action === "Move" || actionModal.action === "Charge") {
      if (actionModal.player && actionModal.unitId) markUnitActed(actionModal.player, actionModal.unitId);
      closeActionModal();
      return;
    }

    // Shoot/Fight proceed into weapon selection
    setActionModal((a) => ({
      ...a,
      step: "selectWeapon",
      weaponName: null,
      weaponProfileRaw: null,
      targetId: null,

      weaponNames: [],
      weaponProfilesByName: {},
      weaponIndex: 0,

      attackIndex: 0,
      totalAttacks: 0,
      cover: false,
      hitRoll: null,
      woundRoll: null,
      saveRoll: null,
      hitSuccess: null,
      woundSuccess: null,
      saveSuccess: null,
      damageApplied: 0,
      hits: 0,
      wounds: 0,
      unsaved: 0,
      totalDamage: 0,
    }));
  };

  // ✅ supports vehicle multi-weapon shooting
  const confirmWeaponSelection = () => {
    const unit = currentActingUnit();
    if (!unit) return;

    const isVehicleShoot = actionModal.action === "Shoot" && isVehicleUnit(unit);

    let wName = actionModal.weaponName;
    let chosenRaw: string | null = null;

    if (isVehicleShoot) {
      const first = actionModal.weaponNames[0];
      if (!first) return;
      wName = first;
      chosenRaw = actionModal.weaponProfilesByName[first] ?? unit.weapons[first];
    } else {
      if (!wName) return;
      const raw = unit.weapons[wName];
      const profiles = getWeaponProfiles(wName, raw);
      chosenRaw = actionModal.weaponProfileRaw ?? profiles[0]?.raw ?? raw;
    }

    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
    const parsed = wName && chosenRaw ? parseWeaponFromText(wName, chosenRaw, mode) : null;
    const attacks = parsed?.attacks ?? 1;

    setActionModal((a) => ({
      ...a,
      weaponIndex: 0,
      weaponName: wName!,
      weaponProfileRaw: chosenRaw,
      totalAttacks: Math.max(1, attacks),
      attackIndex: 0,
      step: "selectEnemy",
    }));
  };

  // ✅ skip hit roll for auto-hit weapons
  const beginAttack = () => {
    const unit = currentActingUnit();
    if (!unit || !actionModal.weaponName) return;

    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
    const raw = actionModal.weaponProfileRaw || unit.weapons[actionModal.weaponName];
    const w = parseWeaponFromText(actionModal.weaponName, raw, mode);

    setActionModal((a) => ({
      ...a,
      step: w?.autoHit ? "woundRoll" : "hitRoll",
      hitRoll: null,
      woundRoll: null,
      saveRoll: null,
      hitSuccess: w?.autoHit ? true : null,
      woundSuccess: null,
      saveSuccess: null,
      damageApplied: 0,
      hits: a.hits + (w?.autoHit ? 1 : 0),
    }));
  };

  // ✅ damage removes models; when models reach 0, unit is destroyed/removed
  const applyDamageToTarget = (damage: number) => {
    if (!actionModal.player) return;
    const enemy = getEnemyArmy(actionModal.player);
    if (!enemy) return;

    const target = enemy.units.find((u) => u.id === actionModal.targetId);
    if (!target) return;

    if (target.woundsRemaining == null || target.woundsPerModel == null) return;

    const newW = target.woundsRemaining - damage;
    if (newW > 0) {
      target.woundsRemaining = newW;
    } else {
      target.modelsRemaining = Math.max(0, target.modelsRemaining - 1);

      if (target.modelsRemaining <= 0) {
        target.destroyed = true;
        target.woundsRemaining = 0;
      } else {
        target.woundsRemaining = target.woundsPerModel;
      }
    }

    if (actionModal.player === 1) setArmy2({ ...enemy });
    else setArmy1({ ...enemy });
  };

  const resolveHit = () => {
    const unit = currentActingUnit();
    const tgt = currentTargetUnit();
    if (!unit || !tgt) return;

    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
    const raw = actionModal.weaponProfileRaw || (actionModal.weaponName ? unit.weapons[actionModal.weaponName] : "");
    const w = actionModal.weaponName ? parseWeaponFromText(actionModal.weaponName, raw, mode) : null;
    if (!w) return;

    const roll = actionModal.hitRoll;
    if (!roll) return;

    const success = roll >= w.skill;
    setActionModal((a) => ({
      ...a,
      hitSuccess: success,
      hits: a.hits + (success ? 1 : 0),
      step: success ? "woundRoll" : "attackResult",
      woundSuccess: success ? null : false,
      saveSuccess: success ? null : false,
      damageApplied: 0,
    }));
  };

  const resolveWound = () => {
    const unit = currentActingUnit();
    const tgt = currentTargetUnit();
    if (!unit || !tgt) return;

    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
    const raw = actionModal.weaponProfileRaw || (actionModal.weaponName ? unit.weapons[actionModal.weaponName] : "");
    const w = actionModal.weaponName ? parseWeaponFromText(actionModal.weaponName, raw, mode) : null;
    if (!w) return;

    const tVal = tgt.stats["t"] ? parseInt(String(tgt.stats["t"]).replace(/\D/g, ""), 10) : NaN;
    const tough = Number.isFinite(tVal) ? Math.max(1, tVal) : 4;

    const needed = woundNeeded(w.strength, tough);
    const roll = actionModal.woundRoll;
    if (!roll) return;

    const success = roll >= needed;
    setActionModal((a) => ({
      ...a,
      woundSuccess: success,
      wounds: a.wounds + (success ? 1 : 0),
      step: success ? "saveRoll" : "attackResult",
      saveSuccess: success ? null : false,
      damageApplied: 0,
    }));
  };

  const resolveSave = () => {
    const unit = currentActingUnit();
    const tgt = currentTargetUnit();
    if (!unit || !tgt) return;

    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
    const raw = actionModal.weaponProfileRaw || (actionModal.weaponName ? unit.weapons[actionModal.weaponName] : "");
    const w = actionModal.weaponName ? parseWeaponFromText(actionModal.weaponName, raw, mode) : null;
    if (!w) return;

    const svRaw = tgt.stats["sv"];
    const sv = svRaw ? parsePlusNumber(String(svRaw)) ?? 7 : 7;

    const coverBonus = actionModal.cover ? 1 : 0;
    const modified = clamp(sv - coverBonus - w.ap, 2, 7);

    const roll = actionModal.saveRoll;
    if (!roll) return;

    const saved = roll >= modified;
    const unsaved = !saved;
    const dmg = unsaved ? w.damage : 0;

    if (unsaved) applyDamageToTarget(dmg);

    setActionModal((a) => ({
      ...a,
      saveSuccess: saved,
      unsaved: a.unsaved + (unsaved ? 1 : 0),
      totalDamage: a.totalDamage + dmg,
      damageApplied: dmg,
      step: "attackResult",
    }));
  };

  const nextAttackOrSummary = () => {
    const nextIdx = actionModal.attackIndex + 1;
    if (nextIdx < actionModal.totalAttacks) {
      setActionModal((a) => ({ ...a, attackIndex: nextIdx }));
      beginAttack();
      return;
    }
    setActionModal((a) => ({ ...a, step: "summary" }));
  };

  /**
   * ✅ UPDATED VEHICLE RULE:
   * - Vehicles can Shoot/Fight any number of times in the phase (no action limit)
   * - But they cannot use the same weapon *instance* more than once per phase
   * - Vehicles are considered "Acted" once they've used all available weapon instances that phase
   * - Non-vehicles still consume 1 model-action per Shoot/Fight action
   */
  const finishAction = () => {
    const unit = currentActingUnit();
    if (!unit || !actionModal.player || !actionModal.unitId) {
      closeActionModal();
      return;
    }

    const phase = PHASES[currentPhaseIndex];
    const pm = isPerModelPhase(phase);
    const vehicle = isVehicleUnit(unit) && pm;

    const isVehicleShoot = vehicle && actionModal.action === "Shoot";

    // Vehicle multi-weapon chaining (still inside ONE activation)
    if (isVehicleShoot && actionModal.weaponNames.length > 0) {
      const nextIdx = actionModal.weaponIndex + 1;

      if (nextIdx < actionModal.weaponNames.length) {
        const nextName = actionModal.weaponNames[nextIdx];
        const nextRaw = actionModal.weaponProfilesByName[nextName] ?? unit.weapons[nextName];

        const parsed = parseWeaponFromText(nextName, nextRaw, "shoot");
        const attacks = parsed?.attacks ?? 1;

        setActionModal((a) => ({
          ...a,
          weaponIndex: nextIdx,
          weaponName: nextName,
          weaponProfileRaw: nextRaw,
          targetId: null,

          attackIndex: 0,
          totalAttacks: Math.max(1, attacks),

          cover: false,
          hitRoll: null,
          woundRoll: null,
          saveRoll: null,

          hitSuccess: null,
          woundSuccess: null,
          saveSuccess: null,
          damageApplied: 0,

          hits: 0,
          wounds: 0,
          unsaved: 0,
          totalDamage: 0,

          step: "selectEnemy",
        }));
        return;
      }

      // Last weapon finished: mark ALL selected weapon instances as used for this phase
      markWeaponsUsedForPhase(actionModal.player, actionModal.unitId, phase, actionModal.weaponNames);
      closeActionModal();
      return;
    }

    // Vehicle Fight: one weapon instance per activation, unlimited activations until weapons are exhausted
    if (vehicle && actionModal.action === "Fight") {
      if (actionModal.weaponName) {
        markWeaponsUsedForPhase(actionModal.player, actionModal.unitId, phase, [actionModal.weaponName]);
      }
      closeActionModal();
      return;
    }

    // Non-vehicle Shooting/Fight: consume one model-action
    if (pm && !isVehicleUnit(unit)) {
      unit.actionsRemainingInPhase = Math.max(0, unit.actionsRemainingInPhase - 1);

      if (actionModal.player === 1 && army1) setArmy1({ ...army1 });
      if (actionModal.player === 2 && army2) setArmy2({ ...army2 });

      if (unit.actionsRemainingInPhase <= 0) {
        markUnitActed(actionModal.player, unit.id);
      }
      closeActionModal();
      return;
    }

    // Movement/Charge fallback safety
    markUnitActed(actionModal.player, unit.id);
    closeActionModal();
  };

  /** ---------------------------------------------------------
   * Render
   * --------------------------------------------------------*/
  return (
    <div className="container">
      {page !== "cover" && (
        <div className="topbar-back">
          <Button onClick={goBack}>← Back</Button>
        </div>
      )}

      {tooltip.visible && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}

      {/* Placement modal (centered) */}
      {placementModal.visible && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-h">Confirm placement</div>
            <div className="modal-b">
              Have you placed{" "}
              <b>{(placementModal.player ? getUnit(placementModal.player, placementModal.unitId)?.name : null) ?? "this unit"}</b>?
            </div>
            <div className="modal-f">
              <Button onClick={() => setPlacementModal({ visible: false, player: null, unitId: null })}>No</Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (placementModal.player && placementModal.unitId) {
                    markUnitDeployed(placementModal.player, placementModal.unitId);
                  }
                  setPlacementModal({ visible: false, player: null, unitId: null });
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action modal (centered) */}
      {actionModal.visible && (
        <div className="overlay">
          <div className="modal" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            {actionModal.step === "choose" && (
              <>
                <div className="modal-h">Choose action — {currentActingUnit()?.name}</div>
                <div className="modal-b" style={{ display: "grid", gap: 10 }}>
                  {PHASES[currentPhaseIndex] === "Movement" && (
                    <Button variant="primary" onClick={() => beginCombatFlow("Move")}>
                      Move
                    </Button>
                  )}
                  {PHASES[currentPhaseIndex] === "Shooting" && (
                    <Button variant="primary" onClick={() => beginCombatFlow("Shoot")}>
                      Shoot
                    </Button>
                  )}
                  {PHASES[currentPhaseIndex] === "Charge" && (
                    <Button variant="primary" onClick={() => beginCombatFlow("Charge")}>
                      Charge
                    </Button>
                  )}
                  {PHASES[currentPhaseIndex] === "Fight" && (
                    <Button variant="primary" onClick={() => beginCombatFlow("Fight")}>
                      Fight
                    </Button>
                  )}
                </div>
                <div className="modal-f">
                  <Button onClick={closeActionModal}>Cancel</Button>
                </div>
              </>
            )}

            {actionModal.step === "instructions" && (
              <>
                <div className="modal-h">{actionModal.action} — Instructions</div>
                <div className="modal-b">
                  {actionModal.action === "Move" && <div>Move up to the unit&apos;s M value. To Advance, roll 1d6 and add to M.</div>}
                  {actionModal.action === "Shoot" && (
                    <div>Select a weapon (Vehicles can pick multiple), select a target, then roll Hit → Wound → Save for each attack.</div>
                  )}
                  {actionModal.action === "Charge" && <div>Declare charge, roll 2D6. If successful, you’ll fight in the Fight phase.</div>}
                  {actionModal.action === "Fight" && <div>Select a melee weapon, select a target, then roll Hit → Wound → Save for each attack.</div>}
                </div>
                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: "choose", action: null }))}>Back</Button>
                  <Button variant="primary" onClick={goFromInstructions}>
                    Next
                  </Button>
                </div>
              </>
            )}

            {actionModal.step === "selectWeapon" && (
              <>
                <div className="modal-h">Select weapon — {currentActingUnit()?.name}</div>

                <div className="modal-b" style={{ display: "grid", gap: 10, overflow: "auto", flex: 1, minHeight: 0 }}>
                  <div className="small">
                    {actionModal.action === "Shoot" && isVehicleUnit(currentActingUnit())
                      ? "Vehicle Shooting: select 1+ weapons to fire (you'll choose targets per weapon)."
                      : "Pick the weapon you’re using."}
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    {(() => {
                      const unit = currentActingUnit();
                      if (!unit) return null;

                      const phase = PHASES[currentPhaseIndex];
                      const multi = actionModal.action === "Shoot" && isVehicleUnit(unit) && isPerModelPhase(phase);
                      const usedThisPhase = new Set(getUsedWeaponsForPhase(unit, phase));

                      return Object.entries(unit.weapons).map(([wName, raw]) => {
                        const profiles = getWeaponProfiles(wName, raw);

                        const selected = multi ? actionModal.weaponNames.includes(wName) : actionModal.weaponName === wName;
                        const alreadyUsed = isVehicleUnit(unit) && isPerModelPhase(phase) ? usedThisPhase.has(wName) : false;

                        return (
                          <div key={wName} className="card">
                            <div className="card-b">
                              <div className="pills" style={{ justifyContent: "space-between" as any }}>
                                <span className="pill">{wName}</span>

                                {multi ? (
                                  <Button
                                    disabled={alreadyUsed}
                                    variant={selected ? "primary" : "default"}
                                    onClick={() =>
                                      setActionModal((a) => {
                                        const next = selected ? a.weaponNames.filter((x) => x !== wName) : [...a.weaponNames, wName];
                                        const chosen = a.weaponProfilesByName[wName] ?? profiles[0]?.raw ?? raw;

                                        return {
                                          ...a,
                                          weaponNames: next,
                                          weaponProfilesByName: { ...a.weaponProfilesByName, [wName]: chosen },
                                        };
                                      })
                                    }
                                  >
                                    {alreadyUsed ? "Used" : selected ? "Selected" : "Select"}
                                  </Button>
                                ) : (
                                  <Button
                                    disabled={alreadyUsed}
                                    variant={selected ? "primary" : "default"}
                                    onClick={() =>
                                      setActionModal((a) => ({
                                        ...a,
                                        weaponName: wName,
                                        weaponProfileRaw: profiles.length > 1 ? profiles[0].raw : raw,
                                      }))
                                    }
                                  >
                                    {alreadyUsed ? "Used" : selected ? "Selected" : "Select"}
                                  </Button>
                                )}
                              </div>

                              <div className="hr" />
                              <div className="small">{raw}</div>

                              {alreadyUsed ? (
                                <div className="small warn" style={{ marginTop: 6 }}>
                                  Already used this phase
                                </div>
                              ) : null}

                              {selected && profiles.length > 1 && (
                                <div style={{ marginTop: 10 }}>
                                  <b>Profile:</b>{" "}
                                  <select
                                    value={
                                      multi ? actionModal.weaponProfilesByName[wName] ?? profiles[0].raw : actionModal.weaponProfileRaw ?? profiles[0].raw
                                    }
                                    onChange={(e) =>
                                      setActionModal((a) =>
                                        multi
                                          ? { ...a, weaponProfilesByName: { ...a.weaponProfilesByName, [wName]: e.target.value } }
                                          : { ...a, weaponProfileRaw: e.target.value }
                                      )
                                    }
                                  >
                                    {profiles.map((p) => (
                                      <option key={p.label} value={p.raw}>
                                        {p.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: "instructions" }))}>Back</Button>
                  <Button
                    variant="primary"
                    disabled={(() => {
                      const unit = currentActingUnit();
                      const phase = PHASES[currentPhaseIndex];
                      const multi = actionModal.action === "Shoot" && isVehicleUnit(unit) && isPerModelPhase(phase);
                      return multi ? actionModal.weaponNames.length === 0 : !actionModal.weaponName;
                    })()}
                    onClick={confirmWeaponSelection}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {actionModal.step === "selectEnemy" && (
              <>
                <div className="modal-h">Select target</div>

                <div className="modal-b" style={{ display: "grid", gap: 10, overflow: "auto", flex: 1, minHeight: 0 }}>
                  <div className="small">Choose an enemy unit that is deployed and not destroyed.</div>

                  <div className="stack">
                    {(actionModal.player ? getEnemyArmy(actionModal.player)?.units || [] : [])
                      .filter((u) => u.deployed && !u.destroyed)
                      .map((u) => (
                        <Card
                          key={u.id}
                          title={u.name}
                          right={
                            <div className="pills">
                              {u.modelsStarting > 1 ? <span className="pill">Models:{u.modelsRemaining}</span> : null}
                              {u.woundsRemaining != null ? <span className="pill">W:{u.woundsRemaining}</span> : null}
                              <Button
                                variant={actionModal.targetId === u.id ? "primary" : "default"}
                                onClick={() => setActionModal((a) => ({ ...a, targetId: u.id }))}
                              >
                                {actionModal.targetId === u.id ? "Selected" : "Select"}
                              </Button>
                            </div>
                          }
                        >
                          <StatLine stats={u.stats} />
                        </Card>
                      ))}
                  </div>

                  <div className="pills">
                    <label className="pill" style={{ display: "inline-flex", gap: 8, alignItems: "center" as any }}>
                      <input
                        type="checkbox"
                        checked={actionModal.cover}
                        onChange={(e) => setActionModal((a) => ({ ...a, cover: e.target.checked }))}
                      />
                      Target in cover (+1 to save)
                    </label>
                  </div>
                </div>

                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: "selectWeapon" }))}>Back</Button>
                  <Button variant="primary" disabled={!actionModal.targetId} onClick={beginAttack}>
                    Start Attacks
                  </Button>
                </div>
              </>
            )}

            {actionModal.step === "hitRoll" && (
              <>
                <div className="modal-h">
                  Hit Roll — Attack {actionModal.attackIndex + 1}/{Math.max(1, actionModal.totalAttacks)}
                </div>
                <div className="modal-b" style={{ display: "grid", gap: 10 }}>
                  {(() => {
                    const unit = currentActingUnit();
                    const tgt = currentTargetUnit();
                    if (!unit || !tgt || !actionModal.weaponName) return <div className="small">Missing data.</div>;

                    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
                    const raw = actionModal.weaponProfileRaw || unit.weapons[actionModal.weaponName];
                    const w = parseWeaponFromText(actionModal.weaponName, raw, mode);

                    return (
                      <>
                        <div className="pills">
                          <span className="pill">{unit.name}</span>
                          <span className="pill">{actionModal.weaponName}</span>
                          <span className="pill">Target: {tgt.name}</span>
                        </div>
                        <div className="small">
                          Need {w?.skillType} <b>{w?.skill}+</b>
                        </div>
                        <div>
                          <b>Roll:</b>{" "}
                          <select
                            value={actionModal.hitRoll ?? ""}
                            onChange={(e) => setActionModal((a) => ({ ...a, hitRoll: parseInt(e.target.value) }))}
                          >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: "selectEnemy" }))}>Back</Button>
                  <Button variant="primary" disabled={!actionModal.hitRoll} onClick={resolveHit}>
                    Next
                  </Button>
                </div>
              </>
            )}

            {actionModal.step === "woundRoll" && (
              <>
                <div className="modal-h">
                  Wound Roll — Attack {actionModal.attackIndex + 1}/{Math.max(1, actionModal.totalAttacks)}
                </div>
                <div className="modal-b" style={{ display: "grid", gap: 10 }}>
                  {(() => {
                    const unit = currentActingUnit();
                    const tgt = currentTargetUnit();
                    if (!unit || !tgt || !actionModal.weaponName) return <div className="small">Missing data.</div>;

                    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
                    const raw = actionModal.weaponProfileRaw || unit.weapons[actionModal.weaponName];
                    const w = parseWeaponFromText(actionModal.weaponName, raw, mode);

                    const tVal = tgt.stats["t"] ? parseInt(String(tgt.stats["t"]).replace(/\D/g, ""), 10) : NaN;
                    const tough = Number.isFinite(tVal) ? Math.max(1, tVal) : 4;
                    const needed = w ? woundNeeded(w.strength, tough) : 4;

                    return (
                      <>
                        <div className="pills">
                          <span className="pill">S{w?.strength ?? "?"}</span>
                          <span className="pill">vs T{tough}</span>
                          <span className="pill">Need {needed}+</span>
                        </div>
                        <div>
                          <b>Roll:</b>{" "}
                          <select
                            value={actionModal.woundRoll ?? ""}
                            onChange={(e) => setActionModal((a) => ({ ...a, woundRoll: parseInt(e.target.value) }))}
                          >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: actionModal.hitSuccess ? "selectEnemy" : "hitRoll" }))}>
                    Back
                  </Button>
                  <Button variant="primary" disabled={!actionModal.woundRoll} onClick={resolveWound}>
                    Next
                  </Button>
                </div>
              </>
            )}

            {actionModal.step === "saveRoll" && (
              <>
                <div className="modal-h">
                  Save Roll — Attack {actionModal.attackIndex + 1}/{Math.max(1, actionModal.totalAttacks)}
                </div>
                <div className="modal-b" style={{ display: "grid", gap: 10 }}>
                  {(() => {
                    const unit = currentActingUnit();
                    const tgt = currentTargetUnit();
                    if (!unit || !tgt || !actionModal.weaponName) return <div className="small">Missing data.</div>;

                    const mode = actionModal.action === "Fight" ? "fight" : "shoot";
                    const raw = actionModal.weaponProfileRaw || unit.weapons[actionModal.weaponName];
                    const w = parseWeaponFromText(actionModal.weaponName, raw, mode);

                    const svRaw = tgt.stats["sv"];
                    const sv = svRaw ? parsePlusNumber(String(svRaw)) ?? 7 : 7;

                    const coverBonus = actionModal.cover ? 1 : 0;
                    const modified = clamp(sv - coverBonus - (w?.ap ?? 0), 2, 7);

                    return (
                      <>
                        <div className="pills">
                          <span className="pill">Save {svRaw ?? "—"}</span>
                          <span className="pill">AP {w?.ap ?? "?"}</span>
                          <span className="pill">Cover {actionModal.cover ? "Yes" : "No"}</span>
                          <span className="pill">Need {modified}+</span>
                        </div>
                        <div>
                          <b>Roll:</b>{" "}
                          <select
                            value={actionModal.saveRoll ?? ""}
                            onChange={(e) => setActionModal((a) => ({ ...a, saveRoll: parseInt(e.target.value) }))}
                          >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: "woundRoll" }))}>Back</Button>
                  <Button variant="primary" disabled={!actionModal.saveRoll} onClick={resolveSave}>
                    Next
                  </Button>
                </div>
              </>
            )}

            {actionModal.step === "attackResult" && (
              <>
                <div className="modal-h">
                  Attack Result — {actionModal.attackIndex + 1}/{Math.max(1, actionModal.totalAttacks)}
                </div>
                <div className="modal-b" style={{ display: "grid", gap: 10 }}>
                  <div className="pills">
                    <span className="pill">Hit: {actionModal.hitSuccess ? "Yes" : "No"}</span>
                    <span className="pill">Wound: {actionModal.woundSuccess ? "Yes" : "No"}</span>
                    <span className="pill">Saved: {actionModal.saveSuccess ? "Yes" : "No"}</span>
                    <span className="pill">Damage: {actionModal.damageApplied}</span>
                  </div>
                  {(() => {
                    const tgt = currentTargetUnit();
                    if (!tgt) return null;
                    return (
                      <div className="small">
                        Target now:{" "}
                        {tgt.woundsRemaining != null ? (
                          <>
                            {tgt.modelsStarting > 1 ? (
                              <>
                                <b>Models:{tgt.modelsRemaining}</b> <b>W:{tgt.woundsRemaining}</b>{" "}
                              </>
                            ) : (
                              <b>W:{tgt.woundsRemaining}</b>
                            )}{" "}
                            {tgt.destroyed ? "(Destroyed)" : ""}
                          </>
                        ) : (
                          <b>(No W stat to track)</b>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: actionModal.hitSuccess ? "selectEnemy" : "hitRoll" }))}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={nextAttackOrSummary}>
                    {actionModal.attackIndex + 1 < actionModal.totalAttacks ? "Next Attack" : "Summary"}
                  </Button>
                </div>
              </>
            )}

            {actionModal.step === "summary" && (
              <>
                <div className="modal-h">Action Summary</div>
                <div className="modal-b" style={{ display: "grid", gap: 10 }}>
                  <div className="pills">
                    <span className="pill">Hits: {actionModal.hits}</span>
                    <span className="pill">Wounds: {actionModal.wounds}</span>
                    <span className="pill">Unsaved: {actionModal.unsaved}</span>
                    <span className="pill">Damage: {actionModal.totalDamage}</span>
                  </div>

                  {actionModal.action === "Shoot" && isVehicleUnit(currentActingUnit()) && actionModal.weaponNames.length > 1 ? (
                    <div className="small">
                      Vehicle shooting: click <b>Done</b> to proceed to the next selected weapon (if any).
                    </div>
                  ) : isVehicleUnit(currentActingUnit()) && isPerModelPhase(PHASES[currentPhaseIndex]) ? (
                    <div className="small">
                      Vehicle: this uses the chosen weapon instance once this phase. You can act again until you run out of unused weapons.
                    </div>
                  ) : (
                    <div className="small">For Shooting/Fight, this consumes <b>one model-action</b> from the unit.</div>
                  )}
                </div>
                <div className="modal-f">
                  <Button onClick={() => setActionModal((a) => ({ ...a, step: "selectEnemy" }))}>Back</Button>
                  <Button variant="primary" onClick={finishAction}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {page === "cover" && renderCover()}
      {page === "selectSize" && renderSelectSize()}
      {page === "importP1" && renderImport("Import Player 1 Army", onUploadP1)}
      {page === "p1Display" && army1 && renderArmyPage(army1, 1, "importP2")}
      {page === "importP2" && renderImport("Import Player 2 Army", onUploadP2)}
      {page === "p2Display" && army2 && renderArmyPage(army2, 2, "missionSelect")}
      {page === "missionSelect" && renderMissionSelect()}
      {page === "rolloff" && renderRolloff("winner")}
      {page === "winner" && (
        <div className="stack" style={{ paddingTop: 18 }}>
          <div className="h2">Player going first is:</div>
          <div className="h1" style={{ margin: 0 }}>
            {decideFirstPlayer()}
          </div>
          <div className="pills">
            <Button onClick={goBack}>Back</Button>
            <Button variant="primary" onClick={startDeployment}>
              Start Deployment
            </Button>
          </div>
        </div>
      )}
      {page === "deployment" && army1 && army2 && renderDeployment()}
      {page === "rolloff2" && renderRolloff("battle")}
      {page === "battle" && army1 && army2 && renderBattle()}
      {page === "complete" && (
        <div className="stack" style={{ paddingTop: 18 }}>
          <div className="h1">Battle Complete</div>
          <div className="muted">Thanks for playing!</div>
        </div>
      )}
    </div>
  );
}
