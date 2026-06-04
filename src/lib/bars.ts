export type BarId = "cabofrio" | "saopedro";

export interface BarConfig {
  id: BarId;
  name: string;
  shortName: string;
  table: "reservations_cabofrio" | "reservations_saopedro";
  locais: string[];
  publicPath: string;
}

export const BARS: Record<BarId, BarConfig> = {
  cabofrio: {
    id: "cabofrio",
    name: "Boteco Seu Osmar — Cabo Frio",
    shortName: "Cabo Frio",
    table: "reservations_cabofrio",
    locais: ["Área Interna", "Área Externa", "Corredor do Flamengo"],
    publicPath: "/cabofrio",
  },
  saopedro: {
    id: "saopedro",
    name: "Boteco Seu Osmar — São Pedro",
    shortName: "São Pedro",
    table: "reservations_saopedro",
    locais: ["Ao lado do Bar de Drinks"],
    publicPath: "/saopedro",
  },
};
