export const AVATARS = [
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sophia',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Luis',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Katherine',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Adrian',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Riley',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Kingston',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Leah',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Chase',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Destiny',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jude',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Eden',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Emery',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jameson',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sara',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jocelyn',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Aiden',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Valentina',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Oliver',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Robert'
];

export const getRandomAvatar = (): string => {
  const randomIndex = Math.floor(Math.random() * AVATARS.length);
  return AVATARS[randomIndex];
};