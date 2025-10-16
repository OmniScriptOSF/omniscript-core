// File: omniscript-core/parser/src/block-parsers/chart.ts
// What: Parser for @chart blocks for data visualization
// Why: Extract chart type, title, data, and options with type validation
// Related: types.ts, lexer/index.ts, utils/validation.ts

import { ChartBlock, ChartDataSeries } from '../types';
import { parseKV } from '../lexer';
import { validateEnum, validateString } from '../utils/validation';

const VALID_CHART_TYPES = ['bar', 'line', 'pie', 'scatter', 'area'] as const;

export function parseChartBlock(content: string): ChartBlock {
  const props = parseKV(content);

  // Validate chart type with safe default
  const chartType = validateEnum(props.type, VALID_CHART_TYPES, 'bar');

  // Validate and type data as ChartDataSeries[] (cast via unknown for type safety)
  const data = (Array.isArray(props.data) ? props.data : []) as unknown as ChartDataSeries[];

  // Build chart with options if present
  if (props.options !== undefined && props.options !== null && typeof props.options === 'object') {
    return {
      type: 'chart',
      chartType,
      title: validateString(props.title, 'Chart'),
      data,
      options: props.options as { xAxis?: string; yAxis?: string; legend?: boolean; colors?: string[] },
    };
  }
  
  return {
    type: 'chart',
    chartType,
    title: validateString(props.title, 'Chart'),
    data,
  };
}
