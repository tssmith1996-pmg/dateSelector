import * as React from "react";
import Grid from "@mui/material/Grid2";
import Zoom from "@mui/material/Zoom";
import DateMove from "./datemove";
import DateRange from "./daterange";
import StepsMenu from "./stepsmenu";
import StepToggle from "./steptoggle";

function DateInput({
  dates,
  rangeScope,
  payProps,
  handleVal,
  stepViz,
  openSlider,
  stepOpen,
  stepValue,
  handleClick,
  handleStep,
  handleViz,
  singleDay,
  limitToScope,
  showMove,
  showExpand,
}) {
  return (
    <>
      <Grid
        size="auto"
        sx={{
          paddingRight: 1,
        }}
      >
        <DateRange
          dates={dates}
          rangeScope={rangeScope}
          handleVal={handleVal}
          singleDay={singleDay}
          limitToScope={limitToScope}
        />
      </Grid>
      {showMove && (
        <Grid container>
          <Zoom in={showMove}>
            <Grid size="auto">
              <DateMove
                dates={dates}
                rangeScope={rangeScope}
                stepValue={stepValue}
                payProps={payProps}
                handleVal={handleVal}
                bf={"b"}
                vertical={false}
                reverse={true}
                viz={openSlider}
                singleDay={singleDay}
                limitToScope={limitToScope}
                showExpand={showExpand}
              />
            </Grid>
          </Zoom>
          <Grid
            size="auto"
            sx={{
              paddingRight: 1,
            }}
          >
            <StepToggle
              stepViz={stepViz}
              stepValue={stepValue}
              payProps={payProps}
              viz={stepOpen}
              handleStep={handleStep}
              onClick={handleClick}
            />
          </Grid>
          <Zoom in={stepOpen}>
            <Grid size="auto">
              <StepsMenu
                stepViz={stepViz}
                stepValue={stepValue}
                payProps={payProps}
                viz={stepOpen}
                handleStep={handleStep}
                handleViz={handleViz}
              />
            </Grid>
          </Zoom>
          {/* <Zoom in={openSlider}> */}
          <Grid size="auto">
            <DateMove
              dates={dates}
              rangeScope={rangeScope}
              stepValue={stepValue}
              payProps={payProps}
              handleVal={handleVal}
              bf={"f"}
              vertical={false}
              reverse={false}
              viz={openSlider}
              singleDay={singleDay}
              showExpand={showExpand}
            />
          </Grid>
          {/* </Zoom> */}
        </Grid>
      )}
    </>
  );
}

export default DateInput;
