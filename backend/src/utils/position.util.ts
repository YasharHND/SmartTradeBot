export class PositionUtil {
  private constructor() {}

  static calculateEpicSize(epicPrice: number, positionAmount: number): number {
    return Math.round((positionAmount / epicPrice) * 100) / 100;
  }

  static calculateDistance(epicPrice: number, percent: number): number {
    return Number(((epicPrice * percent) / 100).toFixed(2));
  }
}
