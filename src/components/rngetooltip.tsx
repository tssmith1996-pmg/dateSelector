import * as React from "react";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/system";
// import Typography from "@mui/material/Typography";
import { useHelpContext } from "./helpprovider";

type Props = TooltipProps & {
  shortCut?: string;
  topRow?: string;
  detailRow?: string;
  infoRow?: string;
  detailFlag?: boolean;
};

const RngeTooltip = styled(({ className, ...props }: Props) => {
  const {
    title,
    shortCut,
    topRow,
    detailRow,
    detailFlag = useHelpContext().showHelp ,
    infoRow,
    ...rest
  } = props;

  const showKey = useHelpContext().showKey;
  const [open, setOpen] = React.useState(useHelpContext().showKey);
  // console.log(shortCut, showKey, open);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    (<Tooltip
      {...rest}
      classes={{ popper: className }}
      arrow={showKey && shortCut ? false : true}
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      title={
       useHelpContext().showTooltip && (showKey && shortCut ? (
          shortCut
        ) : title !== undefined ? (
          title
        ) : (
          <>
            <div><b>{detailFlag && detailRow  && (`${topRow}`)}</b></div>
            <div>{detailFlag && detailRow ? (`${detailRow}`) : `${topRow}`}</div>
            <div style={{fontStyle: "italic"}}>{ infoRow ? (`${infoRow}`) : ``}</div>
          </>
        ))
      }
    />)
  );
})(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.text.primary,
    border: theme.palette.text.primary,
    color: theme.palette.background.paper,
    // fontWeight: 300,
    maxWidth: 250
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.text.primary,
    border: theme.palette.text.primary
  }
}));

export default RngeTooltip;

interface valueProps {
  children: React.ReactElement;
  value: number;
  index: number;
}
export function ValueLabel(props: valueProps) {
  const { children, value, index } = props;
  const loc = index === 0 ? "top-end" : "bottom-start";
  return (
    <RngeTooltip enterTouchDelay={0} placement={loc} title={value} arrow>
      {children}
    </RngeTooltip>
  );
}
