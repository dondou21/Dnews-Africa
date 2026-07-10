export type AutomationFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface NewsletterAutomation {
  id: string;
  name: string;
  enabled: boolean;
  frequency: AutomationFrequency;
  sendDay: number | null;
  sendTime: string;
  timezone: string;
  templateId: string;
  template: { id: string; name: string; subject: string };
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationInput {
  name: string;
  frequency: AutomationFrequency;
  sendDay?: number;
  sendTime: string;
  timezone?: string;
  templateId: string;
  enabled?: boolean;
}

export interface UpdateAutomationInput {
  name?: string;
  frequency?: AutomationFrequency;
  sendDay?: number;
  sendTime?: string;
  timezone?: string;
  templateId?: string;
  enabled?: boolean;
}
