export class ForecastedSalesInterface {

  private readonly _month: string;
  private readonly _pastSales: number;
  private readonly _forecastedSales: number;
  private readonly _actualSales: number;
  private readonly _remark: string;


  constructor(month: string, pastSales: number, forecastedSales: number, actualSales: number, remark: string) {
    this._month = month;
    this._pastSales = pastSales;
    this._forecastedSales = forecastedSales;
    this._actualSales = actualSales;
    this._remark = remark;
  }


  get month(): string {
    return this._month;
  }

  get pastSales(): number {
    return this._pastSales;
  }

  get forecastedSales(): number {
    return this._forecastedSales;
  }

  get actualSales(): number {
    return this._actualSales;
  }

  get remark(): string {
    return this._remark;
  }
}
