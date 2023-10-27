import { createTheme, Theme } from "@mui/material/styles";

interface CustomThemeOptions {
  themeMode: "light" | "dark";
  themeColor: string;
  themeFont: string;
  fontSize: string;
}

const getNum = (n: number | string) => {
  return typeof n === "number" ? n : parseInt(n, 10);
};

export function SetTheme({
  themeMode,
  themeColor,
  themeFont,
  fontSize,
}: CustomThemeOptions): Theme {
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: themeColor,
      },
    },
    typography: {
      fontFamily: themeFont,
      fontSize: getNum(fontSize),
    },
  });

  return theme;
}
