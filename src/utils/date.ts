export class DateUtils {
  static now(): Date {
    return new Date();
  }

  static toUTC(date: Date | string): Date {
    return new Date(date);
  }

  static formatISO(date: Date = new Date()): string {
    return date.toISOString();
  }

  static startOfDay(date: Date = new Date()): Date {
    const utcDate = new Date(date);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  }

  static endOfDay(date: Date = new Date()): Date {
    const utcDate = new Date(date);
    utcDate.setUTCHours(23, 59, 59, 999);
    return utcDate;
  }
}
