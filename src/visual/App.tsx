import React from 'react';
import { Calendar } from '../components/Calendar';
import { DateRangePill } from '../components/DateRangePill';
import { FooterBar } from '../components/FooterBar';
import { Popup } from '../components/Popup';
import { PresetList } from '../components/PresetList';
import { describe, deriveComparison, labelForPreset, clipToBounds } from '../logic/dateUtils';
import { resolvePreset } from '../logic/presets';
import { FormattingSettings, PresetKey, VisualState } from '../logic/state';

export interface AppProps {
  state: VisualState;
  formatting: FormattingSettings;
  onApply: (next: VisualState, options?: { removeFilter?: boolean }) => void;
}

const cloneRange = (range: VisualState['main']) => ({
  start: new Date(range.start.getTime()),
  end: new Date(range.end.getTime()),
});

export const App: React.FC<AppProps> = ({ state, formatting, onApply }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | undefined>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = React.useState<VisualState>({
    ...state,
    main: cloneRange(state.main),
    comparison: state.comparison ? cloneRange(state.comparison) : null,
  });

  const updateDraft = React.useCallback(
    (updater: (current: VisualState) => VisualState) => {
      setDraft((current) => {
        const next = updater(current);
        return {
          ...next,
          minDate: state.minDate,
          maxDate: state.maxDate,
          weekStartsOn: state.weekStartsOn,
        };
      });
    },
    [state.maxDate, state.minDate, state.weekStartsOn],
  );

  React.useEffect(() => {
    if (!isOpen) {
      setDraft({
        ...state,
        main: cloneRange(state.main),
        comparison: state.comparison ? cloneRange(state.comparison) : null,
      });
    }
  }, [isOpen, state]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      setAnchorRect(rect ? new DOMRect(rect.x, rect.y, rect.width, rect.height) : undefined);
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const openPopup = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    setAnchorRect(rect ? new DOMRect(rect.x, rect.y, rect.width, rect.height) : undefined);
    setIsOpen(true);
  };

  const closePopup = () => setIsOpen(false);

  const handleApply = (options?: { removeFilter?: boolean }) => {
    onApply(
      {
        ...draft,
        main: cloneRange(draft.main),
        comparison: draft.comparison ? cloneRange(draft.comparison) : null,
      },
      options,
    );
    setIsOpen(false);
  };

  const handlePresetSelect = (preset: PresetKey) => {
    if (preset === 'custom') {
      updateDraft((current) => ({ ...current, activePreset: 'custom' }));
      return;
    }
    updateDraft((current) => {
      const main = resolvePreset(preset, {
        today: new Date(),
        minDate: state.minDate,
        maxDate: state.maxDate,
        weekStartsOn: state.weekStartsOn,
        currentRange: current.main,
      });
      return {
        ...current,
        main,
        activePreset: preset,
        comparison: current.comparisonEnabled
          ? deriveComparison(main, state.minDate, state.maxDate)
          : null,
      };
    });
  };

  const handleMainChange = (range: VisualState['main']) => {
    updateDraft((current) => ({
      ...current,
      main: range,
      activePreset: 'custom',
      comparison: current.comparisonEnabled
        ? deriveComparison(range, state.minDate, state.maxDate)
        : current.comparison,
    }));
  };

  const handleComparisonChange = (range: VisualState['main']) => {
    updateDraft((current) => ({
      ...current,
      comparison: range,
    }));
  };

  const handleComparisonToggle = (enabled: boolean) => {
    if (!formatting.showComparisonToggle) {
      return;
    }
    updateDraft((current) => ({
      ...current,
      comparisonEnabled: enabled,
      comparison: enabled
        ? current.comparison ?? deriveComparison(current.main, state.minDate, state.maxDate)
        : null,
    }));
  };

  const handleClear = () => {
    updateDraft((current) => ({
      ...current,
      main: resolvePreset(formatting.defaultPreset, {
        today: new Date(),
        minDate: state.minDate,
        maxDate: state.maxDate,
        weekStartsOn: state.weekStartsOn,
        currentRange: current.main,
      }),
      comparisonEnabled: false,
      comparison: null,
      activePreset: 'custom',
    }));
  };

  const handleTodayQuickApply = () => {
    const todayRange = resolvePreset('today', {
      today: new Date(),
      minDate: state.minDate,
      maxDate: state.maxDate,
      weekStartsOn: state.weekStartsOn,
      currentRange: draft.main,
    });
    const next: VisualState = {
      ...draft,
      main: todayRange,
      activePreset: 'today',
      comparison: draft.comparisonEnabled
        ? deriveComparison(todayRange, state.minDate, state.maxDate)
        : null,
    };
    setDraft(next);
    onApply({ ...next }, { removeFilter: false });
    setIsOpen(false);
  };

  const pillMainLabel = describe(state.main, formatting.locale);
  const presetLabel = state.activePreset !== 'custom' ? labelForPreset(state.activePreset) : undefined;
  const pillLabel = presetLabel ? `${pillMainLabel} • ${presetLabel}` : pillMainLabel;
  const comparisonLabel =
    state.comparisonEnabled && state.comparison
      ? describe(state.comparison, formatting.locale)
      : undefined;

  const mainCalendarRange = clipToBounds(draft.main, state.minDate, state.maxDate);
  const comparisonRange =
    draft.comparisonEnabled && draft.comparison
      ? clipToBounds(draft.comparison, state.minDate, state.maxDate)
      : draft.comparisonEnabled
      ? deriveComparison(draft.main, state.minDate, state.maxDate)
      : null;

  return (
    <div className="pds-root" ref={containerRef}>
      <DateRangePill
        label={pillLabel}
        comparisonLabel={comparisonLabel}
        onOpen={openPopup}
        pillStyle={formatting.pillStyle}
        isOpen={isOpen}
      />
      {isOpen && (
        <Popup onClose={closePopup} anchor={anchorRect}>
          <div className={draft.comparisonEnabled ? 'pds-popupSplit pds-popupSplitDual' : 'pds-popupSplit'}>
            <PresetList
              activePreset={draft.activePreset}
              onSelect={handlePresetSelect}
              comparisonEnabled={draft.comparisonEnabled}
              onComparisonChange={handleComparisonToggle}
              showComparisonToggle={formatting.showComparisonToggle}
              showPresetLabels={formatting.showPresetLabels}
            />
            <div className={draft.comparisonEnabled ? 'pds-calendarStack pds-calendarStackDual' : 'pds-calendarStack'}>
              <Calendar
                id="pds-main"
                title="Main range"
                range={mainCalendarRange}
                onChange={handleMainChange}
                minDate={state.minDate}
                maxDate={state.maxDate}
                weekStartsOn={state.weekStartsOn}
                locale={formatting.locale}
              />
              {draft.comparisonEnabled && comparisonRange && (
                <Calendar
                  id="pds-comparison"
                  title="Comparison"
                  range={comparisonRange}
                  onChange={handleComparisonChange}
                  minDate={state.minDate}
                  maxDate={state.maxDate}
                  weekStartsOn={state.weekStartsOn}
                  locale={formatting.locale}
                />
              )}
            </div>
          </div>
          <FooterBar
            onApply={() => handleApply()}
            onClear={handleClear}
            onToday={handleTodayQuickApply}
            showQuickApply={formatting.showQuickApply}
            showClear={formatting.showClear}
          />
        </Popup>
      )}
    </div>
  );
};
