const AgeRanges = {
  ALL: { apiLabel: '-' },
  TODDLERS: { label: '0-2', apiLabel: '0-2' },
  PRESCHOOLERS: { label: '3-5', apiLabel: '3-5' },
  KIDS: { label: '6-11', apiLabel: '6-11' },
  TEENAGERS: { label: '12-15', apiLabel: '12-15' },
  YOUNGSTERS: { label: '16-26', apiLabel: '16-26' },
  ADULTS: { label: '18+', apiLabel: '18-' },
  SENIORS: { label: '65+', apiLabel: '65-' },
  CUSTOM: {},
} as const;

export { AgeRanges };
