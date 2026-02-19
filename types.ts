
export enum ModelType {
  CLASSIC = 'classic',
  SLIM = 'slim'
}

export interface SkinSettings {
  skinUrl: string;
  capeUrl: string | null;
  elytraEnabled: boolean;
  model: ModelType;
  animationEnabled: boolean;
}

export interface CapeSuggestion {
  name: string;
  description: string;
  colorPalette: string[];
  theme: string;
}
