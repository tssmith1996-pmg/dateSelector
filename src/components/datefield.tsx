import * as React from "react";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { hexToCSSFilter } from "hex-to-css-filter";
import {
  textMeasurementService as tms,
  interfaces,
} from "powerbi-visuals-utils-formattingutils";
import TextProperties = interfaces.TextProperties;
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

interface DateFieldProps {
  id: "start" | "end";
  value: string;
  max?: string;
  min?: string;
  error?: boolean;
  underline?: boolean;
  type?: string;
  width?: number;
  InputFontSize?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  doUpdate: (id: string, value: string) => void;
}

export const DateField: React.FC<DateFieldProps> = ({
  id,
  value,
  error,
  onChange,
  onBlur,
  onFocus,
  doUpdate,
  underline,
  max,
  min,
  type = "date",
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputElement = e.target as HTMLInputElement;
      if (inputElement && inputElement.value) {
        const dateValue: string = inputElement.value;
        doUpdate(id, dateValue);
        // console.log(id, dateValue);
      }
    }
  };

  const theme = useTheme();
  const textProperties: TextProperties = {
    text: value,
    fontFamily: theme.typography.fontFamily,
    fontSize: pixelConverter.toString(theme.typography.fontSize)
  };
  // console.log("h: ",tms.measureSvgTextHeight(textProperties),
  //   "h-estimate: " , tms.estimateSvgTextHeight(textProperties),"w: ",
  //   tms.measureSvgTextWidth(textProperties),"fontSize",theme.typography.fontSize
  // );
  return (
    (<TextField
      id={id}
      sx={{
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          filter: theme.palette.primary.main
            ? hexToCSSFilter(theme.palette.primary.main).filter
            : "",
        },
        //  width: theme.typography.fontSize * 8,
        paddingTop: "3px",
        width: tms.measureSvgTextWidth(textProperties) + theme.typography.fontSize * 3.25,
      }}
      variant="standard"
      size="small"
      type={type}
      error={error}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={"yyyy-MM-dd"}
      onKeyDown={handleKeyPress}
      slotProps={{
        input: {
          disableUnderline: underline,
        },

        htmlInput: {
          max,
          min,
        }
      }} />)
  );
};
