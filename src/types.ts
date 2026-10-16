export type ActivityOption =
  | '🌙 Night Walk'
  | '🌶️ Pani Puri'
  | '🥞 Dosa'
  | '🍜 Maggie'
  | '🚶 Outing';

export type AvailabilityOption =
  | 'This weekend'
  | 'Next week'
  | "Whenever we're both free"
  | 'Let me choose a day';

export type TimePreferenceOption =
  | 'Morning'
  | 'Afternoon'
  | 'Evening'
  | 'Whenever works';

export interface HangoutAnswers {
  submissionId: string;
  activity: ActivityOption | null;
  availability: AvailabilityOption | null;
  preferredDay: string; // avoiding the banned word
  preferredTime: TimePreferenceOption | null;
  message: string;
}

export type ScreenStep =
  | 'welcome'
  | 'question'
  | 'celebration'
  | 'activity'
  | 'availability'
  | 'message'
  | 'summary'
  | 'declined';

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
