export interface Statistics {
  mean: number;
  min: number;
  max: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DatasetResponse {
  row_count: number;
  column_count: number;

  columns: string[];

  rows: Record<string, any>[];

  missing_values: Record<string, number>;

  statistics: Record<string, Statistics>;

  numeric_columns: string[];

  chart_data: ChartData[];

  correlation_matrix?: number[][];

  correlation_labels?: string[];

  ai_summary?: string;
}