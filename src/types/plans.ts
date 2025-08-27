// @/types/plans.ts
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function dateToDay(date: Date): typeof DAYS[number] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  if (DAYS.includes(dayName as any)) {
    return dayName as typeof DAYS[number];
  }
  throw new Error(`Date ${date} falls on Sunday which is not a working day`);
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export function endOfWeekSaturday(date: Date): Date {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 5); // Monday + 5 days = Saturday
  return end;
}

export type VisitType = 'sourcing' | 'product' | 'strategic' | 'followup';
export type VisitStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface VisitPlan {
  id: number;
  supplier_id: number;
  marketer_id: number;
  visit_date: string;
  notes: string | null;
  type: VisitType;
  status: VisitStatus;
  feedback: string;
  created_at: string;
  company_name?: string;
  contact_person?: string;
  supplier_location?: string;
}