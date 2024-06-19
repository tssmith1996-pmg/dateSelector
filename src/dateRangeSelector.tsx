import * as React from "react";
import { format } from "date-fns";
import DateRangeCard from "./daterangecard";
import { dateCardProps } from "./interface";
import { initialState } from "./initstate";
// import { Typography } from "@mui/material";
import { startOfDay } from "date-fns/startOfDay";
import { endOfDay } from "date-fns/endOfDay";
import LandingPage from "./landingPage";

export default class DateCardClass extends React.Component<
  { onChanged: (arg0: any) => void },
  dateCardProps
> {
  private static updateCallback?: (data: object) => void = null;

  public datesLoaded: boolean;

  public static update(newState: dateCardProps) {
    if (typeof DateCardClass.updateCallback === "function") {
      DateCardClass.updateCallback(newState);
    }
  }

  public state: dateCardProps = initialState;

  constructor(props: any) {
    super(props);
    this.state = initialState;
    // console.log("drs initial state",this.state.landingOn,format(this.state.rangeScope.start, "dd-MM-yyyy"));
    if (!this.state.dates) this.state.dates = this.state.rangeScope;
    this.onDateChanged = this.onDateChanged.bind(this);
  }

  public onDateChanged = (e: Date[]) => {
    // console.log(e, this.state.dates);
    if (
      e.length &&
      (format(e[0], "dd-MM-yyyy") !==
        format(this.state.dates.start, "dd-MM-yyyy") ||
        format(e[1], "dd-MM-yyyy") !==
          format(this.state.dates.end, "dd-MM-yyyy"))
    ) {
      this.setState({
        dates: {
          start: startOfDay(e[0]),
          end: endOfDay(this.state.singleDay ? e[0] : e[1]),
        },
      });
      this.props.onChanged([
        startOfDay(e[0]),
        endOfDay(this.state.singleDay ? e[0] : e[1]),
      ]);
    }
  };

  public componentDidMount() {
    DateCardClass.updateCallback = (newState: dateCardProps): void => {
      this.setState(newState);
    };
  }

  public componentWillUnmount() {
    DateCardClass.updateCallback = null;
  }

  render() {
    // console.log("drs render state",this.state.landingOn,format(this.state.rangeScope.start, "dd-MM-yyyy"));

    if (this.state.landingOn) {
      return <LandingPage />;
    }

    return (
      <DateRangeCard
        {...this.state} // Spread all state properties for concise prop passing
        handleVal={this.onDateChanged} // Pass onDateChanged as a separate prop
      />
    );
  }
}
