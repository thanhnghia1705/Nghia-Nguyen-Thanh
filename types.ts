
export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface HandData {
  landmarks: Point[];
  handedness: 'Left' | 'Right';
  score: number;
}

export interface SpellInfo {
  name: string;
  description: string;
  incantation: string;
  color: string;
}
