/**
 * Skill categories. `value` is what the API stores (do not change existing values —
 * profiles and posts already use them); `label` is what people see.
 */
export const SKILLS = [
  { value: 'Frontend Dev', label: 'Frontend' },
  { value: 'Backend Dev', label: 'Backend' },
  { value: 'Mobile Dev', label: 'Mobile' },
  { value: 'UI / UX Design', label: 'UI / UX design' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Data Analysis', label: 'Data analysis' },
  { value: 'DevOps', label: 'DevOps / Cloud' },
  { value: 'IT Support', label: 'IT support' },
  { value: 'Database Admin', label: 'Databases' },
  { value: 'QA Testing', label: 'QA testing' },
] as const

export type SkillValue = (typeof SKILLS)[number]['value']

export function skillLabel(value: string): string {
  return SKILLS.find((s) => s.value.toLowerCase() === value.toLowerCase())?.label ?? value
}

export const CURRENCIES = ['KSh', 'USD', 'EUR', 'GBP'] as const

export const DESCRIPTION_MAX = 1000
export const MESSAGE_POLL_MS = 4000
