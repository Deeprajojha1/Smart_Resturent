export type Feature = {
  title: string;
  description: string;
  icon?: string; // Emoji or SVG icon for restaurant features
};

export type Problem = {
  title: string;
  description: string;
};

export type Step = {
  title: string;
  description: string;
};

export type Role = {
  title: string;
  description: string;
};

export type Stat = {
  label: string;
  value: string;
  trend: string;
};
