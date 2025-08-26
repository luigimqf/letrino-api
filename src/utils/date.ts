export class DateUtils {
  /**
   * Cria uma nova data em UTC
   */
  static now(): Date {
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  }

  /**
   * Cria uma data UTC a partir de componentes
   */
  static utc(
    year?: number,
    month?: number,
    day?: number,
    hour?: number,
    minute?: number,
    second?: number,
    millisecond?: number
  ): Date {
    if (year === undefined) {
      return this.now();
    }
    return new Date(
      Date.UTC(
        year,
        month || 0,
        day || 1,
        hour || 0,
        minute || 0,
        second || 0,
        millisecond || 0
      )
    );
  }

  /**
   * Retorna o início do dia em UTC
   */
  static startOfDayUTC(date?: Date): Date {
    const d = date || new Date();
    const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  }

  /**
   * Retorna o fim do dia em UTC
   */
  static endOfDayUTC(date?: Date): Date {
    const d = date || new Date();
    const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    utcDate.setUTCHours(23, 59, 59, 999);
    return utcDate;
  }

  /**
   * Converte uma data local para UTC
   */
  static toUTC(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }
}
