export class RecentSales {
  private readonly _date: string;
  private readonly _productName: string;
  private readonly _stock: number;
  private readonly _isMovingUp: boolean;

  constructor(date: string, productName: string, stock: number, isMovingUp: boolean) {
    this._date = date;
    this._productName = productName;
    this._stock = stock;
    this._isMovingUp = isMovingUp;
  }


  get date(): string {
    return this._date;
  }

  get productName(): string {
    return this._productName;
  }

  get stock(): number {
    return this._stock;
  }

  get isMovingUp(): boolean {
    return this._isMovingUp;
  }
}
