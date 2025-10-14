import powerbi from "powerbi-visuals-api";

declare module "powerbi-visuals-utils-formattingmodel" {
  export namespace formattingSettings {
    class Model {
      cards: SimpleCard[];
    }

    class SimpleCard {
      name: string;
      displayName: string;
      slices: unknown[];
    }

    type ValidatorType = powerbi.visuals.ValidatorType;

    type DropdownItem = { value: string; displayName: string };

    interface ItemDropdownOptions<T = DropdownItem> {
      name: string;
      displayName: string;
      items: T[];
      value: T;
    }

    class ItemDropdown<T = DropdownItem> {
      constructor(options: ItemDropdownOptions<T>);
      name: string;
      displayName: string;
      items: T[];
      value: T;
    }

    interface NumUpDownOptions {
      name: string;
      displayName: string;
      value: number;
      options?: {
        minValue?: { value: number; type: ValidatorType };
        maxValue?: { value: number; type: ValidatorType };
      };
    }

    class NumUpDown {
      constructor(options: NumUpDownOptions);
      name: string;
      displayName: string;
      value: number;
    }

    interface TextInputOptions {
      name: string;
      displayName: string;
      value: string;
      placeholder?: string;
    }

    class TextInput {
      constructor(options: TextInputOptions);
      name: string;
      displayName: string;
      value: string;
      placeholder?: string;
    }

    interface ColorPickerOptions {
      name: string;
      displayName: string;
      value: { value: string };
    }

    class ColorPicker {
      constructor(options: ColorPickerOptions);
      name: string;
      displayName: string;
      value: { value: string };
    }

    interface ToggleSwitchOptions {
      name: string;
      displayName: string;
      value: boolean;
    }

    class ToggleSwitch {
      constructor(options: ToggleSwitchOptions);
      name: string;
      displayName: string;
      value: boolean;
    }
  }

  export class FormattingSettingsService {
    populateFormattingSettingsModel<T>(model: new () => T, dataView: powerbi.DataView): T;
    buildFormattingModel(settingsModel: unknown): powerbi.visuals.FormattingModel;
  }
}
