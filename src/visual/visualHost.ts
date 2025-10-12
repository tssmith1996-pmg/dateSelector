import powerbi from 'powerbi-visuals-api';
import * as models from 'powerbi-models';
import { DateRange } from '../logic/state';

export class VisualHostBridge {
  private target?: powerbi.data.IFilterTarget;

  constructor(private readonly host: powerbi.extensibility.visual.IVisualHost) {}

  updateTarget(target?: powerbi.data.IFilterTarget): void {
    this.target = target;
  }

  applyDateRange(range: DateRange | null): void {
    if (!this.target) {
      return;
    }

    if (!range) {
      this.host.applyJsonFilter(
        null,
        'date',
        'filter',
        models.FilterAction.merge,
      );
      return;
    }

    const filter = new models.AdvancedFilter(this.target, 'And', [
      {
        operator: 'GreaterThanOrEqual',
        value: range.start.toISOString(),
      },
      {
        operator: 'LessThanOrEqual',
        value: range.end.toISOString(),
      },
    ]);

    this.host.applyJsonFilter(
      filter,
      'date',
      'filter',
      models.FilterAction.merge,
    );
  }

  persistState(payload: Record<string, unknown>): void {
    this.host.persistProperties({
      replace: [
        {
          objectName: 'state',
          selector: null,
          properties: {
            payload: JSON.stringify(payload),
          },
        },
      ],
    });
  }
}
