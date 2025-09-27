import powerbiVisualsApi from "powerbi-visuals-api";
import { DatePickerVisual } from "./visual";
import capabilities from "../capabilities.json";

const visualPlugin: powerbiVisualsApi.extensibility.visual.IVisualPlugin = {
  name: "auroraDatePicker",
  displayName: "Aurora Date Picker",
  class: DatePickerVisual,
  apiVersion: "5.11.0",
  capabilities,
  custom: true,
};

export default visualPlugin;
