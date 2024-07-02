import * as React from "react";
// import { styled } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
// import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
import Icon from "@mui/material/Icon";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

// const Img = styled('img')({
//   margin: 'auto',
//   display: 'block',
//   maxWidth: '100%',
//   maxHeight: '100%',
// });

export default function LandingPage() {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item>
          <Icon color="disabled" >
            <InfoOutlined  />
          </Icon>
        </Grid>
        <Grid item xs>
          <Typography
            gutterBottom
            variant="caption"
            component="div"
            fontWeight={"light"}
          >
            To activate Date Range Slicer, add a Date field to this visual.
          </Typography>
          <Typography
            gutterBottom
            variant="caption"
            component="div"
            color="text.secondary"
            fontWeight={"light"}
          >
            Configure settings for the startup range, presets, the interactive
            timeline or a minimised date picker (range or single day). Only show
            features needed by your end users.
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
