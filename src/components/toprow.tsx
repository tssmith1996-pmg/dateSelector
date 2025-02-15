import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Zoom from "@mui/material/Zoom";
import DateInput from "./dateinput";
import UseCurrent from "./usecurrent";
import ToggleSliderButton from "./togglesliderbutton";
import { dateCardProps } from "../interface";

const TopRow: React.FC<dateCardProps> = ({
  openSlider,
  toggleSlider,
  dates,
  rangeScope,
  payProps,
  handleVal,
  stepViz,
  stepOpen,
  stepValue,
  handleClick,
  setStepValue,
  setStepOpen,
  showMore,
  showCurrent,
  showIconText,
  current,
  singleDay,
  limitToScope,
  showMove,
  showExpand,
  enableSlider,
}) => {
  return (
    <Grid
      container
      direction="row"
      rowSpacing={0.3}
      size={12}
      sx={{
        paddingLeft: 0.3,
      }}
    >
      {enableSlider && (
        <Grid
          size="auto"
        >
          <ToggleSliderButton
            openSlider={openSlider}
            toggleSlider={toggleSlider}
          />
        </Grid>
      )}
        <DateInput
          dates={dates}
          rangeScope={rangeScope}
          payProps={payProps}
          handleVal={handleVal}
          stepViz={stepViz}
          openSlider={openSlider}
          stepOpen={stepOpen}
          stepValue={stepValue}
          handleClick={handleClick}
          handleStep={setStepValue}
          handleViz={setStepOpen}
          singleDay={singleDay}
          limitToScope={limitToScope}
          showMove={showMove}
          showExpand={showExpand}
        />
      <Grid size="auto">
        {!stepOpen && (
          <Zoom in={!stepOpen}>
            <Box>
              <UseCurrent
                rangeScope={rangeScope}
                showMore={showMore}
                showCurrent={showCurrent}
                showIconText={showIconText}
                handleStep={setStepValue}
                handleVal={handleVal}
                current={current}
                stepValue={stepValue}
                singleDay={singleDay}
                limitToScope={limitToScope}
                />
            </Box>
          </Zoom>
        )}
      </Grid>
      <Grid size="grow">
        <Box></Box>
      </Grid>
    </Grid>
  );
};

export default TopRow;
