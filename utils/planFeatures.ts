export const getPlanFeatures = (limits: { doubts: number; questions: number; notes: number }) => [
  {
    text: `${limits.doubts} Doubt${limits.doubts !== 1 ? 's' : ''} per day`,
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: `${limits.questions} Question set${limits.questions !== 1 ? 's' : ''} per day (Easy, max 5)`,
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: `${limits.notes} Note${limits.notes !== 1 ? 's' : ''} per day`,
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: "Unlimited Doubts",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Unlimited Questions",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Unlimited Notes",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Priority Support",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Advanced Analytics",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Ad-Free Experience",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Offline Access",
    freeIncluded: false,
    proIncluded: true,
  },
];
