export const HOBBY_EMOJIS: Record<string, string> = {
  default: '🧩', guitar: '🎸', piano: '🎹', coding: '💻', programming: '💻',
  drawing: '🎨', painting: '🎨', yoga: '🧘', cooking: '🍳', reading: '📖',
  writing: '✍️', photography: '📷', chess: '♟️', dancing: '💃', singing: '🎤',
};

export const hobbyEmoji = (h: string) => HOBBY_EMOJIS[h.toLowerCase()] ?? HOBBY_EMOJIS.default;

export const SUGGESTED_HOBBIES = [
  { name: 'Guitar', icon: '🎸' },
  { name: 'Piano', icon: '🎹' },
  { name: 'Coding', icon: '💻' },
  { name: 'Yoga', icon: '🧘' },
  { name: 'Cooking', icon: '🍳' },
  { name: 'Photography', icon: '📷' },
  { name: 'Drawing', icon: '🎨' },
  { name: 'Chess', icon: '♟️' },
];

export const HOBBY_SUGGESTIONS = [
  { name: 'Coding', emoji: '💻' },
  { name: 'Guitar', emoji: '🎸' },
  { name: 'Cooking', emoji: '🍳' },
  { name: 'Chess', emoji: '♟️' },
  { name: 'Yoga', emoji: '🧘' },
  { name: 'Drawing', emoji: '🎨' },
  { name: 'Photo', emoji: '📷' },
  { name: 'Spanish', emoji: '🇪🇸' },
  { name: 'Reading', emoji: '📖' },
  { name: 'Writing', emoji: '✍️' },
  { name: 'Piano', emoji: '🎹' },
  { name: 'Running', emoji: '🏃' },
];
