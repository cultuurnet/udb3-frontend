import { Values } from '@/types/Values';

const AudienceType = {
  EVERYONE: 'everyone',
  MEMBERS: 'members',
  EDUCATION: 'education',
} as const;

type Audience = Values<typeof AudienceType>;

export type { Audience };
export { AudienceType };
