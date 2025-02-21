import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import { areIntervalsOverlapping } from "date-fns/areIntervalsOverlapping";
import Typography from "@mui/material/Typography";
import { UseCurrentProps, dateRange, Settings, dateCardProps } from "../interface";
import RngeTooltip from "./rngetooltip";
import DateIntervalPicker from "./dateintervalpicker";

export default function UseCurrent(props: UseCurrentProps) {
  const {
    rangeScope,
    showMore,
    showCurrent,
    showIconText,
    current,
    stepValue,
    singleDay,
    handleVal,limitToScope,
    dates
  } = props;

  const [ttl, setTtl] = React.useState(true);

  const handleDate = (val: dateRange) => {
    handleVal([val.start, singleDay ? val.start : val.end]);
    console.log(dates.start)
    console.log(dates.end)
    console.log(val.start)
    console.log(val.end)
  };
  const handleStep = (val: string) => {
    const _val = val === "today" ? "day" : val;
    props.handleStep(_val);
  };

  const isSelectedRange = (itemRange: dateRange, selectedRange: dateRange) => {
    // Compare the start and end dates of the ranges
    return itemRange.start.getTime() === selectedRange.start.getTime() &&
           itemRange.end.getTime() === selectedRange.end.getTime();
  };

  return (<>
    {showCurrent && (
      <Box sx={{
        pl: 0
      }}>
        <ButtonGroup
          key={"tbg"}
          size="small"
          aria-label="outlined button group"
          // exclusive
        >
          {current
            .filter((item) => {
              if (item.thisRange !== null) {
                // console.log(item.thisRange," : ",item.thisPeriod)
                const x = ttl ? item.tip !== "" : item.tip === "";
                const y = (!limitToScope) || areIntervalsOverlapping(
                  item.thisRange,
                  rangeScope,
                  { inclusive: true }
                );
                return item.show && x && y;
              } else return showMore;
            })
            .map((item, index: number) => (
              <DateIntervalPicker
                handleVal={handleDate}
                stepValue={item.step}
                key={"dip" + item.thisRange + index}
              >
                <RngeTooltip
                  title={undefined}
                  key={"rtt" + item.thisRange + index}
                  detailRow={
                    item.tip !== ""
                      ? `Set the date range to ${item.thisPeriod.toLowerCase()}. Right click for ${item.tip.toLowerCase()}s from today.`
                      : ``
                  }
                  placement="bottom"
                  topRow={
                    item.thisPeriod +
                    (item.tip.toLowerCase() === stepValue ? " (T)" : "")
                  }
                >
                  <IconButton
                    size="small"
                    color="primary"
                    key={"tbn" + item.thisRange + index}
                    value={item.tip.toLowerCase().trim()}
                    onMouseDown={() => {
                      if (item.thisRange) {
                        handleDate(item.thisRange);
                        handleStep(item.step);
                      } else {
                        setTtl(!ttl);
                      }
                    }}
                  >
                    {item.icon}{" "}
                    {showIconText && (
                      <Typography
                        key={"typ" + item.thisRange + index}
                        variant="caption"
                        sx={{
                          color: "text.primary",
                          fontWeight: isSelectedRange(item.thisRange, dates) ? 'bold' : 'normal', // Apply bold style if selected
                          "&:hover": {
                            fontWeight: 'bold', // Apply bold when hovered
                          }
                        }}
                      >
                        {item.thisPeriod}
                      </Typography>
                    )}
                  </IconButton>
                </RngeTooltip>
              </DateIntervalPicker>
            ))}
        </ButtonGroup>
      </Box>
    )}
  </>);
}
