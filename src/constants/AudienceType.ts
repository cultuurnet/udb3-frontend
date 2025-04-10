import { Values } from '@/types/Values';

const AudienceTypes = {
  EVERYONE: 'everyone',
  MEMBERS: 'members',
  EDUCATION: 'education',
} as const;

type AudienceType = Values<typeof AudienceTypes>;

export type { AudienceType };
export { AudienceTypes };
