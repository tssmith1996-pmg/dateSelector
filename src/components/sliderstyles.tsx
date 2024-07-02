export const style = {
  width: "98%",
  "& .MuiSlider-rail": {
    opacity: 0.28,
    height: 1.1,
  },
} as const;

export const styleB = {
  // zIndex: 1,
  marginTop: -16,
  "& .MuiSlider-thumb": {
    marginTop: 0.8,
    width: 1.1,
    height: 12,
    borderRadius: "0%",
    "&:hover": {
      boxShadow: "0 0 0 6px rgba(58, 133, 137, 0.16)",
    },
  },
  "& .MuiSlider-markLabel": {
    fontSize: "0.5rem",
    top: 22,
    transform: "translateX(15%)",
    left: "calc(-50% + 15px)",
  },
  "& .MuiSlider-rail": {
    opacity: 0,
    height: 1.1,
  },
  "& .MuiSlider-mark": {
    top: 20,
    height: 11,
    width: 1.1,
    borderRadius: "0%",
    opacity: 0.3,
  },
  "& .MuiSlider-markActive": {
    top: 27,
    height: 13,
    width: 1.1,
    borderRadius: "0%",
    opacity: 1,
  },
  "& .MuiSlider-track": {
    top: 27,
    height: 13,
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
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.4)",
    },
  },
  "& .MuiSlider-railActive": {
    opacity: 0,
  },
  "& .MuiSlider-markLabel": {
    fontSize: "0.5rem",
    fontWeight: 400,
    top: 6,
  },
  "& .MuiSlider-mark": {
    top: 19,
    height: 5,
    width: 1.1,
    borderRadius: "0%",
    opacity: 0.3,
  },
  "& .MuiSlider-markActive": {
    // top: 19,
    height: 18,
    width: 1.1,
    // borderRadius: "0%",
    opacity: 0.5,
  },
  "& .MuiSlider-track": {
    // top: 20,
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
    width: 10,
  },
} as const;
