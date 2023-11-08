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
  const sze = getNum(fontSize);
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: themeColor,
      },
    },
    typography: {
      fontFamily: themeFont,
      fontSize: sze > 14 ? 14 : sze,
      // htmlFontSize: sze,
    },
    components: {
      // Name of the component
      MuiBadge: {
        styleOverrides: {
          // Name of the slot
          badge: {
            // Some CSS
            fontSize: ".5rem",
            textTransform: "uppercase",
          },
        },
      },
    },
  });

  return theme;
}
