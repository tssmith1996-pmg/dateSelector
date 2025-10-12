import classNames from 'classnames';
import React from 'react';
import { labelForPreset } from '../logic/dateUtils';
import { PRESET_DEFINITIONS } from '../logic/presets';
import { PresetKey } from '../logic/state';
import { ComparisonToggle } from './ComparisonToggle';

interface PresetListProps {
  activePreset: PresetKey;
  onSelect: (key: PresetKey) => void;
  comparisonEnabled: boolean;
  onComparisonChange: (value: boolean) => void;
  showComparisonToggle: boolean;
  showPresetLabels: boolean;
}

export const PresetList: React.FC<PresetListProps> = ({
  activePreset,
  onSelect,
  comparisonEnabled,
  onComparisonChange,
  showComparisonToggle,
  showPresetLabels,
}) => {
  return (
    <div className="pds-presets" role="navigation" aria-label="Date presets">
      {showComparisonToggle && (
        <ComparisonToggle
          checked={comparisonEnabled}
          onChange={onComparisonChange}
        />
      )}
      <ul className="pds-presetList">
        {PRESET_DEFINITIONS.map(({ key }) => (
          <li key={key}>
            <button
              type="button"
              className={classNames('pds-presetButton', {
                'pds-presetButtonActive': key === activePreset,
              })}
              onClick={() => onSelect(key)}
            >
              {showPresetLabels ? labelForPreset(key) : labelForPreset(key)[0]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
