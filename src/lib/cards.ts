export type Faction = "whites" | "reds";

export type CardType = "unit" | "bonus";

export type UnitClass = "assault" | "support" | "spy";
export type BonusClass = "medic" | "engineer" | "instructor" | "aerial";

export interface BonusEffect {
  type: "heal" | "damage_boost" | "building_damage_boost" | "direct_damage" | "direct_building_damage";
  value: number;
  ignoresUnits?: boolean;
}

export interface CardData {
  name: string;
  description: string;
  faction: Faction;
  type: CardType;
  unitClass?: UnitClass;
  bonusClass?: BonusClass;
  bonusEffect?: BonusEffect;
  cost: number;
  damage: number;
  buildingDamage: number;
  defense: number;
  health: number;
}

export const CARDS: CardData[] = [
  // White Army - Белогвардейцы
  {
    name: "Юнкер",
    description: "Штурмовик белогвардейцев",
    faction: "whites",
    type: "unit",
    unitClass: "assault",
    cost: 3,
    damage: 3,
    buildingDamage: 3,
    defense: 2,
    health: 3
  },
  {
    name: "Пулеметчик «Максим»",
    description: "Поддержка с пулеметом",
    faction: "whites",
    type: "unit",
    unitClass: "support",
    cost: 3,
    damage: 2,
    buildingDamage: 3,
    defense: 3,
    health: 4
  },
  {
    name: "Козак",
    description: "Элитный штурмовик",
    faction: "whites",
    type: "unit",
    unitClass: "assault",
    cost: 5,
    damage: 5,
    buildingDamage: 5,
    defense: 4,
    health: 4
  },
  {
    name: "Илья Муромец",
    description: "Авиабомбардировка прямо по башням врага",
    faction: "whites",
    type: "bonus",
    bonusClass: "aerial",
    bonusEffect: { type: "direct_building_damage", value: 8, ignoresUnits: true },
    cost: 7,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  },
  {
    name: "Матрос",
    description: "Поддержка с моря",
    faction: "whites",
    type: "unit",
    unitClass: "support",
    cost: 2,
    damage: 2,
    buildingDamage: 2,
    defense: 2,
    health: 3
  },
  {
    name: "Разведчик-шпион",
    description: "Атакует центральную башню напрямую",
    faction: "whites",
    type: "unit",
    unitClass: "spy",
    cost: 4,
    damage: 2,
    buildingDamage: 6,
    defense: 1,
    health: 2
  },
  {
    name: "Доктор Павлов",
    description: "Восстановить здоровье карте на поле",
    faction: "whites",
    type: "bonus",
    bonusClass: "medic",
    bonusEffect: { type: "heal", value: 3 },
    cost: 3,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  },
  {
    name: "Адмирал Колчак",
    description: "Повышает урон карты на поле",
    faction: "whites",
    type: "bonus",
    bonusClass: "instructor",
    bonusEffect: { type: "damage_boost", value: 4 },
    cost: 5,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  },
  {
    name: "Стенобитное орудие",
    description: "Повышает урон постройкам для карты на поле",
    faction: "whites",
    type: "bonus",
    bonusClass: "engineer",
    bonusEffect: { type: "building_damage_boost", value: 3 },
    cost: 3,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  },

  // Red Army - Большевики
  {
    name: "Красноармеец",
    description: "Штурмовик большевиков",
    faction: "reds",
    type: "unit",
    unitClass: "assault",
    cost: 3,
    damage: 3,
    buildingDamage: 3,
    defense: 2,
    health: 3
  },
  {
    name: "Пулеметчик «Максим»",
    description: "Поддержка с пулеметом",
    faction: "reds",
    type: "unit",
    unitClass: "support",
    cost: 3,
    damage: 2,
    buildingDamage: 3,
    defense: 3,
    health: 4
  },
  {
    name: "Офицер ВЧК",
    description: "Элитный штурмовик",
    faction: "reds",
    type: "unit",
    unitClass: "assault",
    cost: 4,
    damage: 4,
    buildingDamage: 5,
    defense: 2,
    health: 3
  },
  {
    name: "Пролетарий",
    description: "Авиабомбардировка прямо по башням врага",
    faction: "reds",
    type: "bonus",
    bonusClass: "aerial",
    bonusEffect: { type: "direct_building_damage", value: 7, ignoresUnits: true },
    cost: 7,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  },
  {
    name: "Рабочий",
    description: "Поддержка из фабрики",
    faction: "reds",
    type: "unit",
    unitClass: "support",
    cost: 2,
    damage: 2,
    buildingDamage: 2,
    defense: 2,
    health: 3
  },
  {
    name: "Агент ВЧК",
    description: "Атакует центральную башню напрямую",
    faction: "reds",
    type: "unit",
    unitClass: "spy",
    cost: 4,
    damage: 2,
    buildingDamage: 6,
    defense: 1,
    health: 2
  },
  {
    name: "Доктор Маша",
    description: "Восстановить здоровье карте на поле",
    faction: "reds",
    type: "bonus",
    bonusClass: "medic",
    bonusEffect: { type: "heal", value: 3 },
    cost: 3,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  },
  {
    name: "Феликс Дзержинский",
    description: "Повышает урон карты на поле",
    faction: "reds",
    type: "bonus",
    bonusClass: "instructor",
    bonusEffect: { type: "damage_boost", value: 4 },
    cost: 5,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  },
  {
    name: "Стенобитное орудие",
    description: "Повышает урон постройкам для карты на поле",
    faction: "reds",
    type: "bonus",
    bonusClass: "engineer",
    bonusEffect: { type: "building_damage_boost", value: 3 },
    cost: 3,
    damage: 0,
    buildingDamage: 0,
    defense: 0,
    health: 0
  }
];

export const getCardsByFaction = (faction: Faction): CardData[] => {
  return CARDS.filter(card => card.faction === faction);
};
