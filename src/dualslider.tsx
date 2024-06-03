import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Zoom from "@mui/material/Zoom";
import { ValueLabel } from "./rngetooltip";
import { style, styleB, styleT } from "./sliderstyles";
import { Grid } from "@mui/material";

interface DualSliderProps {
  value: number[];
  step: number | null;
  showBottomSlider: boolean;
  mainMarks: Array<{
    value: number;
    label: string;
  }>;
  superMarks: Array<{
    value: number;
    label: string;
  }>;
  max: number;
  valueLabelFormat: (value: number) => string;
  handleTopCommit: (e: Event, val: number[]) => void;
  handleBottomCommit: (e: Event, val: number[]) => void;
  onChange: (
    event: Event,
    value: number | number[],
    activeThumb?: number
  ) => void;
  onClick?: (event: React.SyntheticEvent) => void;
}

function DualSlider(props: DualSliderProps): JSX.Element {
  const {
    value,
    step,
    showBottomSlider,
    handleTopCommit,
    handleBottomCommit,
    mainMarks,
    superMarks,
    max,
    valueLabelFormat,
    onChange,
    onClick
  } = props;

  return (
    <Grid sx={{ height: "40px" }}>
      <Box>
        <Slider
          name="top"
          key="slider1"
          size="medium"
          color="primary"
          value={value}
          onChangeCommitted={handleTopCommit}
          onChange={onChange}
          onClick={onClick}
          step={step}
          marks={mainMarks}
          valueLabelDisplay="auto"
          slots={{
            valueLabel: ValueLabel
          }}
          valueLabelFormat={valueLabelFormat}
          min={0}
          max={max}
          sx={Object.assign({}, style, styleT)}
        />
      </Box>
      <Zoom in={showBottomSlider}>
        <Box >
          <Slider
            name="bottom"
            key="slider2"
            size="small"
            color="primary"
            value={value}
            onChange={onChange}
            onChangeCommitted={handleBottomCommit}
            step={null}
            max={max}
            marks={superMarks}
            slots={{
              valueLabel: ValueLabel
            }}
            valueLabelDisplay="auto"
            valueLabelFormat={valueLabelFormat}
            aria-labelledby="range-slider2"
            getAriaValueText={valueLabelFormat}
            min={0}
            sx={Object.assign({}, style, styleB)}
          />
        </Box>
      </Zoom>
    </Grid>
  );
}

export default DualSlider;
