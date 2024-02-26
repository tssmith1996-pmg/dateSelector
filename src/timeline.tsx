import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
// import DateMove from "./datemove";
// import Box from "@mui/material/Box";
import RangeSlider from "./rangeslider";

function Timeline({
  dates,
  rangeScope,
  stepValue,
  payProps,
  handleVal,
  show2ndSlider,
  weekStartDay,
  yearStartMonth,
  stepSkip,
  stepFmt,
  singleDay
}) {
  return (
    <>
      <Grid xs marginLeft={1} paddingTop={0.3}>
        <RangeSlider
          dates={dates}
          payProps={payProps}
          rangeScope={rangeScope}
          stepFmt={stepFmt}
          stepValue={stepValue}
          stepSkip={stepSkip}
          weekStartDay={weekStartDay}
          yearStartMonth={yearStartMonth}
          handleVal={handleVal}
          show2ndSlider={show2ndSlider}
          singleDay={singleDay}
        />
      </Grid>
    </>
  );
}

export default Timeline;
