import { DayOfWeek, OpeningHours } from '@/clients/capital/schemas/market-details.output.schema';

interface TimeRange {
  start: { hours: number; minutes: number };
  end: { hours: number; minutes: number };
}

const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

export class MarketHoursUtil {
  static isMarketOpen(currentTime: Date, marketHours: OpeningHours): boolean {
    return this.isTimeWithinMarketHours(currentTime, marketHours);
  }

  static willMarketCloseInMinutes(currentTime: Date, minutes: number, marketHours: OpeningHours): boolean {
    const futureTime = new Date(currentTime.getTime() + minutes * 60 * 1000);
    return !this.isTimeWithinMarketHours(futureTime, marketHours);
  }

  private static isTimeWithinMarketHours(time: Date, marketHours: OpeningHours): boolean {
    const dayOfWeek = DAY_OF_WEEK_MAP[time.getUTCDay()];
    const hours = time.getUTCHours();
    const minutes = time.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;

    const daySchedule = marketHours[dayOfWeek];

    if (!daySchedule || daySchedule.length === 0) {
      return false;
    }

    for (const timeRange of daySchedule) {
      const range = this.parseTimeRange(timeRange);
      const startMinutes = range.start.hours * 60 + range.start.minutes;
      const endMinutes = range.end.hours * 60 + range.end.minutes;

      if (endMinutes === 0) {
        if (totalMinutes >= startMinutes) {
          return true;
        }
      } else {
        if (totalMinutes >= startMinutes && totalMinutes < endMinutes) {
          return true;
        }
      }
    }

    return false;
  }

  private static parseTimeRange(timeRange: string): TimeRange {
    const [startStr, endStr] = timeRange.split(' - ');
    const [startHours, startMinutes] = startStr.split(':').map(Number);
    const [endHours, endMinutes] = endStr.split(':').map(Number);

    return {
      start: { hours: startHours, minutes: startMinutes },
      end: { hours: endHours, minutes: endMinutes },
    };
  }
}
