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
  static isMarketOpen(marketStatus: string): boolean {
    return marketStatus === 'TRADEABLE';
  }

  static willMarketCloseInMinutes(currentTime: Date, minutes: number, marketHours: OpeningHours): boolean {
    const dayOfWeek = DAY_OF_WEEK_MAP[currentTime.getUTCDay()];
    const currentHours = currentTime.getUTCHours();
    const currentMinutes = currentTime.getUTCMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const daySchedule = marketHours[dayOfWeek];

    if (!daySchedule || daySchedule.length === 0) {
      return true;
    }

    for (const timeRange of daySchedule) {
      const range = this.parseTimeRange(timeRange);
      const startMinutes = range.start.hours * 60 + range.start.minutes;
      const endMinutes = range.end.hours * 60 + range.end.minutes;

      if (endMinutes === 0) {
        if (currentTotalMinutes >= startMinutes) {
          const minutesUntilClose = 24 * 60 - currentTotalMinutes;
          return minutesUntilClose <= minutes;
        }
      } else {
        if (currentTotalMinutes >= startMinutes && currentTotalMinutes < endMinutes) {
          const minutesUntilClose = endMinutes - currentTotalMinutes;
          return minutesUntilClose <= minutes;
        }
      }
    }

    return true;
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
