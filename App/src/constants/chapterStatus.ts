import { ChapterStatus } from '../store/planStore';
import { Colors } from '../theme/colors';

export const CHAPTER_STATUS_LABELS: Record<ChapterStatus, string> = {
  pending:     'Not Started',
  in_progress: 'In Progress',
  completed:   'Completed',
  skipped:     'Skipped',
};

export const CHAPTER_STATUS_COLORS: Record<ChapterStatus, { bg: string; text: string }> = {
  pending:     { bg: Colors.grayLight,   text: Colors.gray },
  in_progress: { bg: Colors.primaryCard, text: Colors.primary },
  completed:   { bg: '#D1FAE5',          text: Colors.success },
  skipped:     { bg: '#FEE2E2',          text: Colors.danger },
};

export const CHAPTER_STATUS_STYLE: Record<ChapterStatus, { label: string; bg: string; color: string }> = {
  pending:     { label: '',              bg: 'transparent',      color: Colors.gray },
  in_progress: { label: '● In Progress', bg: Colors.primaryCard, color: Colors.primary },
  completed:   { label: '✓ Done',        bg: '#D1FAE5',          color: Colors.success },
  skipped:     { label: '⏭ Skipped',     bg: '#FEE2E2',          color: Colors.danger },
};
