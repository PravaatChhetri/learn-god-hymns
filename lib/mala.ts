export const BEADS_PER_MALA = 108;

export interface MalaState {
  beads: number; // 0..108 on the current mala
  malas: number; // completed rounds
}

export function cleanMala(m: Partial<MalaState> | null): MalaState {
  if (!m) return { beads: 0, malas: 0 };
  return {
    beads: Math.min(Math.max(Math.trunc(Number(m.beads)) || 0, 0), BEADS_PER_MALA),
    malas: Math.max(Math.trunc(Number(m.malas)) || 0, 0),
  };
}

/** Every name counted so far, across all rounds. */
export function malaTotal({ beads, malas }: MalaState) {
  return malas * BEADS_PER_MALA + (beads % BEADS_PER_MALA);
}
