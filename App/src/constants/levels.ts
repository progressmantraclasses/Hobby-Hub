import { PlanRequest } from '../schemas/plan.schema';

export const LEVELS: { value: PlanRequest['level']; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Just starting out, no prior experience' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience, ready to level up'  },
  { value: 'advanced',     label: 'Advanced',     desc: 'Solid base, pushing toward mastery'   },
];
