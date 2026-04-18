import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Format UTC ISO string to local display
export const formatDateTimeLocal = (isoString: string): string => {
  return dayjs(isoString).format('MMM D, YYYY HH:mm');
};

export const formatDateLocal = (isoString: string): string => {
  return dayjs(isoString).format('MMM D, YYYY');
};

export const formatTimeLocal = (isoString: string): string => {
  return dayjs(isoString).format('HH:mm');
};

// Format duration
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
};

// Get minimum date for date picker (tomorrow)
export const getMinDate = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// Convert local date to UTC ISO string
export const toUTCISOString = (date: Date): string => {
  return dayjs(date).utc().toISOString();
};
