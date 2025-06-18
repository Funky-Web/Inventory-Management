export interface ForecastConfig {
  forecastPeriod: number;
  historicalStart: Date;
  forecastModel: string;
  confidenceLevel: number;
  forecastNotes: string;
}
