const MARKET_HOURS: Record<string, string[]> = {
  mon: ['00:00 - 21:59', '23:00 - 00:00'],
  tue: ['00:00 - 21:59', '23:00 - 00:00'],
  wed: ['00:00 - 21:59', '23:00 - 00:00'],
  thu: ['00:00 - 19:30', '23:00 - 00:00'],
  fri: ['00:00 - 19:45'],
  sat: [],
  sun: ['23:00 - 00:00'],
};

interface TimeRange {
  start: { hours: number; minutes: number };
  end: { hours: number; minutes: number };
}

export class MarketHoursUtil {
  static willMarketCloseInMinutes(currentTime: Date, minutes: number): boolean {
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][currentTime.getUTCDay()];
    const currentHours = currentTime.getUTCHours();
    const currentMinutes = currentTime.getUTCMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const daySchedule = MARKET_HOURS[dayOfWeek];

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
