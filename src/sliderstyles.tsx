export const style = {
  width: "98%",
  "& .MuiSlider-rail": {
    opacity: 0.28,
    height: "1px",
  },
} as const;

export const styleB = {
  // zIndex: 1,
  marginTop: -16,
  "& .MuiSlider-thumb": {
    width: 4,
    height: 4,
    "&:hover": {
      boxShadow: "0 0 0 6px rgba(58, 133, 137, 0.16)",
    },
  },
  "& .MuiSlider-markLabel": {
    fontSize: "0.5rem",
    top: 24,
    paddingLeft: 0.9,
  },
  "& .MuiSlider-mark": {
    top: 26,
    height: 11,
    width: "1px",
    borderRadius: "0%",
    opacity: 0.3,
  },
  "& .MuiSlider-markActive": {
    top: 16,
    height: 10,
    width: "1px",
    borderRadius: "0%",
    opacity: 0.5,
  },
  "& .MuiSlider-track": {
    top: 16,
    height: 10,
    opacity: 0.2,
    borderRadius: "0%",
    "&:hover": {
      boxShadow: "0 0 0 2px rgba(58, 133, 137, 0.16)",
    },
    color: "secondary",
  },
} as const;

export const styleT = {
  zIndex: 999,
  marginTop: 0,
  "& .MuiSlider-thumb": {
    width: 11,
    height: 11,
    transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
    "&:hover": {
      boxShadow: "0 0 0 6px rgba(58, 133, 137, 0.16)",
    },
    "&:before": {
      boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
    },
  },
  "& .MuiSlider-markLabel": {
    fontSize: "0.5rem",
    fontWeight: 500,
    top: 6,
  },
  "& .MuiSlider-mark": {
    top: 19,
    height: 5,
    width: "1px",
    borderRadius: "0%",
    opacity: 0.3,
  },
  "& .MuiSlider-markActive": {
    top: 28,
    height: 12,
    width: "1px",
    borderRadius: "0%",
    opacity: 0.5,
  },
  "& .MuiSlider-track": {
    top: 28,
    height: 10,
    opacity: 0.2,
    borderRadius: "0%",
    "&:hover": {
      boxShadow: "0 0 0 2px rgba(58, 133, 137, 0.16)",
    },
    color: "secondary",
  },
} as const;

export const styleTab = {
  minHeight: "auto",
  padding: 0,
  top: -2,
  minWidth: 15,
  fontSize: 11,
  fontWeight: 500,
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
} as const;

export const styleTabs = {
  "& .MuiTabs-indicator": {
    top: 13,
    display: "flex",
    justifyContent: "center",
  },
  "& .MuiTabs-indicatorSpan": {
    maxWidth: 10,
    width: "10px",
  },
} as const;
