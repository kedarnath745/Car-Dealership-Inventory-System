import type { Category } from '../../lib/api/types';

/**
 * Original side-profile artwork for this project, one per body style
 * (viewBox 0 0 240 100, front facing left, ground at about y 84).
 * "Electric" is a powertrain rather than a body, drawn as a smooth crossover.
 */
export interface CarProfile {
  body: string;
  glass: string | null;
  wheels: readonly [number, number];
  r: number;
  cy: number;
}

export const PROFILES: Record<Category, CarProfile> = {
  SEDAN: {
    body: 'M14 70 L14 61 Q14 54 22 53 L64 49 Q74 47 84 40 L100 30 Q106 27 114 27 L150 27 Q158 27 164 31 L182 43 Q186 46 194 46 L218 47 Q226 48 226 56 L226 70 L197 70 A17 17 0 0 0 163 70 L77 70 A17 17 0 0 0 43 70 L14 70 Z',
    glass: 'M90 44 L104 33 Q108 31 113 31 L148 31 Q154 31 158 34 L170 44 Z',
    wheels: [60, 180],
    r: 13,
    cy: 71,
  },
  HATCHBACK: {
    body: 'M24 70 L24 61 Q24 55 31 54 L66 50 Q76 47 86 40 L102 30 Q108 27 116 27 L168 28 Q176 29 182 36 L198 51 Q206 54 208 60 L208 70 L191 70 A17 17 0 0 0 157 70 L81 70 A17 17 0 0 0 47 70 L24 70 Z',
    glass: 'M92 44 L106 33 Q110 31 115 31 L166 32 Q172 33 176 38 L182 44 Z',
    wheels: [64, 174],
    r: 13,
    cy: 71,
  },
  SUV: {
    body: 'M14 67 L14 53 Q14 45 24 44 L62 41 Q70 39 78 31 L92 21 Q96 18 102 18 L198 18 Q206 18 209 25 L216 41 Q223 43 224 50 L224 67 L201 67 A19 19 0 0 0 163 67 L77 67 A19 19 0 0 0 39 67 L14 67 Z',
    glass: 'M84 38 L96 25 Q99 22 104 22 L194 22 Q200 22 202 27 L206 38 Z',
    wheels: [58, 182],
    r: 15,
    cy: 69,
  },
  COUPE: {
    body: 'M12 70 L12 62 Q12 57 20 56 L72 51 Q82 49 94 41 L112 33 Q118 31 126 31 L144 32 Q158 34 174 42 L210 50 Q224 52 226 58 L226 70 L199 70 A17 17 0 0 0 165 70 L75 70 A17 17 0 0 0 41 70 L12 70 Z',
    glass: 'M100 44 L114 36 Q119 34 126 34 L142 35 Q152 37 162 44 Z',
    wheels: [58, 182],
    r: 13,
    cy: 71,
  },
  CONVERTIBLE: {
    body: 'M12 70 L12 62 Q12 57 20 56 L84 51 L100 37 L103 38 L94 50 L150 50 Q156 44 168 44 Q178 44 182 50 L212 51 Q225 52 226 58 L226 70 L199 70 A17 17 0 0 0 165 70 L75 70 A17 17 0 0 0 41 70 L12 70 Z',
    glass: null,
    wheels: [58, 182],
    r: 13,
    cy: 71,
  },
  TRUCK: {
    body: 'M10 67 L10 51 Q10 44 18 43 L56 41 Q62 39 68 31 L80 19 Q83 16 88 16 L124 16 Q130 16 131 22 L132 40 L226 40 Q230 40 230 44 L230 67 L209 67 A19 19 0 0 0 171 67 L75 67 A19 19 0 0 0 37 67 L10 67 Z',
    glass: 'M74 36 L84 22 Q86 20 90 20 L122 20 Q126 20 127 24 L127 36 Z',
    wheels: [56, 190],
    r: 15,
    cy: 69,
  },
  VAN: {
    body: 'M12 68 L12 51 Q12 43 21 41 L38 37 Q44 35 50 25 L58 15 Q61 12 66 12 L214 12 Q225 12 226 21 L227 68 L210 68 A18 18 0 0 0 174 68 L70 68 A18 18 0 0 0 34 68 L12 68 Z',
    glass: 'M54 34 L62 20 Q64 17 68 17 L118 17 L118 34 Z',
    wheels: [52, 192],
    r: 14,
    cy: 70,
  },
  ELECTRIC: {
    body: 'M14 69 L14 59 Q14 51 24 50 L60 47 Q74 44 88 34 L100 26 Q106 23 114 23 L156 24 Q176 26 196 38 L214 46 Q224 48 225 56 L225 69 L200 69 A18 18 0 0 0 164 69 L78 69 A18 18 0 0 0 42 69 L14 69 Z',
    glass: 'M94 41 L106 30 Q110 27 116 27 L154 28 Q168 30 182 40 Z',
    wheels: [60, 182],
    r: 14,
    cy: 70,
  },
};
