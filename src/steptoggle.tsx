import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
// import Typography from "@mui/material/Typography";
import BlurOn from "@mui/icons-material/BlurOn";
import { stepProps } from "./interface";
import { DATEUTILS, STEP_TOGGLE } from "./constants";
import { useHotkeys } from "react-hotkeys-hook";
import RngeTooltip from "./rngetooltip";

const { TopRow, DetailRow } = STEP_TOGGLE;

export default function StepToggle(props: stepProps) {
  const { stepViz, stepValue, viz } = props;

  const keyHandler = (period) => {
    if (props.handleStep && stepViz[period]) {
      props.handleStep(period);
    }
  };

  const trueKeys = Object.keys(stepViz).filter((key) => stepViz[key]);
  const ShortCut = trueKeys
    .map((key) => key.charAt(0).toUpperCase())
    .join(", ");

  useHotkeys("d", () => keyHandler("day"));
  useHotkeys("w", () => keyHandler("week"));
  useHotkeys("p", () => keyHandler("pay"));
  useHotkeys("m", () => keyHandler("month"));
  useHotkeys("q", () => keyHandler("quarter"));
  useHotkeys("y", () => keyHandler("year"));

  return (
    !viz && (
      <IconButton
        value="on"
        size="small"
        onClick={props.onClick}
        // onMouseEnter={handleStepOpen}
        // onMouseLeave={handleStepClose}
      >
        <Badge
          sx={{
            "& .MuiBadge-badge": {
              right: -2,
              top: -1,
            },
          }}
          badgeContent={stepValue.charAt(0)}
          // {
          //   <Typography
          //     variant="overline"
          //     sx={{ fontsize: ".5em", textTransform: "uppercase" }}
          //   >
          //     {<span>{stepValue.charAt(0)}</span>}
          //   </Typography>
          // }
          //color="primary"
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <RngeTooltip
            title={undefined}
            topRow={TopRow + DATEUTILS.periodTip[stepValue] + ` (${ShortCut})`}
            detailRow={DetailRow}
            placement="bottom"
          >
            <BlurOn style={{ fontSize: "inherit" }} color="primary" />
          </RngeTooltip>
        </Badge>
      </IconButton>
    )
  );
}
