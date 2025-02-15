import * as React from "react";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Remove from "@mui/icons-material/Remove";
import { format, parse, isValid } from "date-fns";
import { inputParms } from "../dateutils";
import { DateField } from "./datefield";
import { useHelpContext } from "./helpprovider";
import RngeTooltip from "./rngetooltip";
import { DateRangeProps } from "../interface";

export default function DateRange(props: DateRangeProps) {
  const { dates, rangeScope, handleVal, singleDay, limitToScope } = props;

  const [underline, setUnderline] = useState(true);
  const [startText, setStartText] = useState<string>(() =>
    format(dates.start, "yyyy-MM-dd")
  );
  const [endText, setEndText] = useState<string>(() =>
    format(dates.end, "yyyy-MM-dd")
  );

  useEffect(() => {
    setStartText(format(dates.start, "yyyy-MM-dd"));
    setEndText(format(dates.end, "yyyy-MM-dd"));
  }, [dates]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue: string = e.target.value;
    if (e.target.id === "start") {
      setStartText(dateValue);
    } else setEndText(dateValue);
  };

  const dateSpan = inputParms(dates, rangeScope);
  const topRow = useHelpContext().showHelp ? "Selected Range" : dateSpan.string;

  const doUpdate = (id: "start" | "end", value: string) => {
    const dte: Date = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(dte)) {
      if (id === "start") {
        handleVal([dte, dates.end]);
      } else handleVal([dates.start, dte]);
    } else {
      setStartText(format(dates.start, "yyyy-MM-dd"));
      setEndText(format(dates.end, "yyyy-MM-dd"));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    doUpdate(e.target.id as "start" | "end", e.target.value);
  };

  const toggleUnderline = () => setUnderline((prev) => !prev);

  return (
    (<div onMouseEnter={toggleUnderline} onMouseLeave={toggleUnderline}>
      {" "}
      <RngeTooltip
        title={undefined}
        topRow={topRow}
        detailRow={dateSpan.string}
        infoRow={dateSpan.info}
        placement="bottom"
      >
        <Grid container spacing={0.5} sx={{
          paddingLeft: 0.3
        }}>
          <Grid >
            <DateField
              id="start"
              value={startText}
              max={singleDay ? "" : endText}
              underline={underline}
              error={!dateSpan.toValid}
              onBlur={handleBlur}
              doUpdate={doUpdate}
              onChange={handleInput}
              onFocus={() => setUnderline(true)}
            />
          </Grid>
          {!singleDay && (
            <>
              <IconButton size="small">
                <Remove
                  style={{ fontSize: useTheme().typography.fontSize }}
                  color="disabled"
                />
              </IconButton>
              <Grid>
                <DateField
                  id="end"
                  value={endText}
                  min={startText}
                  error={!dateSpan.toValid}
                  underline={underline}
                  onBlur={handleBlur}
                  doUpdate={doUpdate}
                  onChange={handleInput}
                  onFocus={() => setUnderline(true)}
                />
              </Grid>
            </>
          )}
        </Grid>
      </RngeTooltip>
    </div>)
  );
}
