import * as React from "react";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { hexToCSSFilter } from "hex-to-css-filter";

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
  max,min,
  type = "date"
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

  return (
    <TextField
      id={id}
      sx={{
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          height: theme.typography.fontSize,
          filter: theme.palette.primary.main ? hexToCSSFilter(theme.palette.primary.main).filter : "",
        },
         width: theme.typography.fontSize * 7.8,
        // width: 90,
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
      inputProps={{
        max,
        min
      }}
      InputProps={{
        disableUnderline: underline,
      }}
      onKeyDown={handleKeyPress}
    />
  );
};
