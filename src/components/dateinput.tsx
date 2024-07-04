import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
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
  showMove,showExpand,
}) {
  return (
    <>
      <Grid xs="auto" paddingRight={1} >
        <DateRange
          dates={dates}
          rangeScope={rangeScope}
          handleVal={handleVal}
          singleDay={singleDay}
        />
      </Grid>
      {showMove && (
        <>
          <Zoom in={showMove}>
          <Grid xs="auto">
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
              showExpand={showExpand}
            />
          </Grid></Zoom>
          <Grid xs="auto" paddingRight={1}>
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
            <Grid xs="auto">
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
          <Grid xs="auto">
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
        </>
       )}
    </>
  );
}

export default DateInput;
