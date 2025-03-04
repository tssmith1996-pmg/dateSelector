import * as React from "react";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RngeTooltip from "./rngetooltip";
import { TOGGLE_SLIDER_BUTTON } from "../constants";

const { TopRowOpen, TopRowClosed, TopRowEnd, DetailRowOpen, DetailRowClosed } =
  TOGGLE_SLIDER_BUTTON;

interface ToggleSliderButtonProps {
  openSlider: boolean;
  toggleSlider: () => void;
}

function ToggleSliderButton({
  openSlider,
  toggleSlider,
}: ToggleSliderButtonProps) {
  const topRow = React.useMemo(
    () => (openSlider ? TopRowOpen : TopRowClosed) + TopRowEnd,
    [openSlider]
  );

  const detailRow = React.useMemo(
    () => (openSlider ? DetailRowOpen : DetailRowClosed),
    [openSlider]
  );

  return (
    <IconButton
      aria-label="Toggle Slider"
      onClick={toggleSlider}
      id="menuToggle"
      size="small"
    >
      <RngeTooltip
        shortCut={"S"}
        title={undefined}
        topRow={topRow}
        detailRow={detailRow}
        placement="bottom-end"
      >
        <MoreVertIcon style={{ fontSize: "inherit" }} />
      </RngeTooltip>
    </IconButton>
  );
}

export default React.memo(ToggleSliderButton);
