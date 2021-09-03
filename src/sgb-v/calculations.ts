import { BaseAbrechnungsposition } from "./types";

export const calculateBruttobetrag = (p: BaseAbrechnungsposition): number =>
    Math.round(100 * p.einzelpreis * p.anzahl) / 100