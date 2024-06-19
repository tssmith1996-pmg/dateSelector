import * as React from 'react';
// import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
// import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';

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
          <SvgIcon sx={{ fontSize: 70 }}>
            <svg xmlns="https://www.w3.org/2000/svg"  viewBox="0 0 398 400"><path fill="#FFF" d="M1 149V1h398v400H1V149m238-57 1-1 1-1h1a423 423 0 0 1 24-25l19-20-28-10-29-8c-18-3-35-2-52 0l-6 3h-11l-7 2c-15 6-30 12-44 20-23 16-43 35-57 59l-10 19c-11 19-13 41-15 63v17l1 9a4726 4726 0 0 0 5 31l3 8a130 130 0 0 1 1 3l1 3 8 18c0 3 2 4 4 1l4-3 7-7a444 444 0 0 1 11-12l2-1 2-3 10-10 4-4a251 251 0 0 1 20-19l4-5 1-1 6-6 1-1 10-10 1-1 12-12 1-1 6-6 2-2 5-5 7-7 5-5 1-1a146 146 0 0 1 5-5l6-5 15-16 2-2 3-2 2-2 5-6a111 111 0 0 1 10-9l2-2 3-3 4-8 8-5 2-3 1-1m-1 129-3-4a336 336 0 0 1-11-10l-1-1-10-11 1-7 5-5 1-1 5-5 1-1 4-4 2-2 4-4 2-2a68 68 0 0 1 6-6l4-4 1-1 6-6 1-2 5-4 1-2 5-4 2-2 4-5 2-1 4-4 2-3 7-6 18-18 1-2 16-15v-4l-9-10c-3-2-7-2-9 3l-1 1a1013 1013 0 0 1-27 26l-4 4-1 1-6 6-1 1-5 5-1 2-5 4-1 2-6 5-1 1-5 4-5 6-2 2-4 4-2 1-4 5-1 1-6 5a119 119 0 0 1-11 11l-6 7-5 5-1 1-3 3-2 2-5 6-7 7-10 10-5 4-4 4-2 2a259 259 0 0 1-12 13l-15 14-14 13-1 3h-2l-2 2-2 2-4 4-5 6-5 5-6 5-3 3-10 12-2 1-2 2-3 2c-5 6-5 8 0 14l7 7 9-5 4-6h1a159 159 0 0 1 19-19l1-2 9-8 7-7 2-2 2-2 2-2 11-11 1-1 1-2 1-4h2l6-4 13-13 6-7 2-1 2-2 5-5 4-4 2-2 8-2 6 5 6 6 4 3v1a230 230 0 0 1 23 23l7 6 2 3a306 306 0 0 1 18 18l8 8 9 8 1 2 15 16 3 1 6 7 3 3 9 8h5l11-11 1-2v-2l-4-3a502 502 0 0 1-5-7v-1l-8-7-9-10-5-5-1-1-7-5-3-5h-1l-4-4-7-8-4-2-1-3-3-1-2-2-8-9-12-13-5-4v-1l-4-3-1-1M106 336l-4 4-1 2c-2 1-2 3 0 4l6 5a170 170 0 0 0 46 20l7 2c19 4 38 6 58 4l29-6h2c14-4 28-10 42-18l-9-9-22-21-7-6-1-2-7-7c-2-1-4-2-6-5l-12-14-4-4-4-4-5-5a205 205 0 0 1-13-13c-7-6-16-7-21 0l-6 5-12 12-9 9-8 8-3 3-1 2-2 1-2 2-12 12a548 548 0 0 1-17 17l-2 2m268-172-1-5a369 369 0 0 1-12-33l-1-3-8-14-2-3-2-3-3-3-4 1-13 13-21 21-1 4-2 1-5 4-14 14-8 7-5 5-13 13-7 6 4 5 6 5 13 13 20 21 8 6a14921 14921 0 0 1 20 21l6 6c1 1 2 1 2 3l7 6 3 4a14620 14620 0 0 0 13 10l1-1 7-15a972 972 0 0 1 6-14l-1-4 4-5 6-29 1-12-1-27-3-10v-8z"/><path fill="#EAF7F8" d="m171 30 5-3c17-2 34-3 52 0l30 8-2 6-4-3-13 2v3h-5v1l7 2 5 3c-3 4 0 9-4 13h-1l-5 1h-3l-2 1 2 1 4-1 3 6v1l2 8-1 11-1 1-1 1-1 1-3 3-8 5-9 5h-2l-3 1h-2l-3-1V83l-2 3v24l-2 7-5 7c-10-9-21-13-33-16-6-2-13-5-20-3l-3-2h-1l-39 1-11 3-14 4-16 7-1 1-3 1-9 7-7 3c3-6 5-13 9-19a174 174 0 0 1 109-81l29 5v-1l-18-4m38 11 2 2 3 1 1-2h-4l-2-1h-1 1m-15-6v1l1 1 9 2h1l-1-1-4-3c-2-2-4-4-6 0m24 10-1 1 11 6 2-2-5-4-7-1z"/><path fill="#C9F0F2" d="M153 371c-14-4-28-10-41-18l10-2h4l1 1h1l18 6 14 2c8 0 17 0 25-3a1899 1899 0 0 0 35-15l5-3 19-14 2-2h2l1 3a198 198 0 0 0 4-8l7 5 22 22c-3 1-6 2-7-2-1-1-5-3-7-2-3 0-6 2-8 4-4 4-7 5-12 3v-13h-1v17l-11 3-10 4c-4 2-6 1-7-3l3-2-3 2-22 10-2 1h-1l-4 1-24 1-13 2z"/><path fill="#2FCEE0" d="m275 211-13-12-6-6 4-3 15-12 4-4c4-4 9-6 12-10l11-12 1 10-1 33v1a738 738 0 0 0-27 15z"/><path fill="#C3EEF0" d="m197 366 22-10c1 4 3 5 7 3l10-4 11-3v19l-29 6c-20 2-39 0-58-5l15-1 15-3 4-1h1l2-1z"/><path fill="#E6F4F8" d="M242 62c4-4 1-9 4-13l-5-3-7-2v-1h5v-3l13-2 4 3 2-6 27 10-19 21-16 2-4 1 1 7-5 3-2-8h2v-1h-2l-2-6 25-2h-21z"/><path fill="#DEEDEC" d="m113 330 13-13 3 3c13 9 28 11 43 11 1 5-2 5-5 5l5 3-3 3c3-1 3 2 2 5l-15-1c-16-2-31-6-43-16z"/><path fill="#DBF5F6" d="m42 130 7-3 10-7 2-1 1-1 16-6a613 613 0 0 0 25-8l5 1h29v4c-8-3-16-3-24-1h-7l-2 1-5 1-4 1h-1l-3 1-16 5-20 13-2 1 2-1h1l4 6-12 4c-3 0-5 1-5 5-3-3-4-1-5 1l-2 6v35l-1 6-9-1c2-21 4-43 16-62z"/><path fill="#C3EEF0" d="M248 348c5 2 8 1 12-3 2-2 5-4 8-4 2-1 6 1 7 2 1 4 4 3 7 2l9 8c-14 8-28 14-43 17v-22z"/><path fill="#29C0DA" d="m376 222-5 28-4 6h-8l-5-3-4-3 2-13v-17l2 11 2 3 3-3v-4l1-10v3l4 6 2-6v-8l6 4 2-12 1 5c-1 5-3 9 1 13m-4 7v-1l-11 4v1l11-4z"/><path fill="#D7F3F3" d="M113 330c12 10 27 14 43 16l15 1v8h-21l-5-1h-5c-4-2-8-3-12-2h-1l-1-1h-4l-2-3h1v-1l-1 1c-6-1-8-6-11-9v-2l-1-3 5-4m16 19s1 0 0 0zm43-18c-15 0-30-2-43-11l-3-3 12-12 2-2 1-1c3 5 6 9 11 10 5 5 10 9 17 9l1 1h1l1 9z"/><path fill="#7ECCE1" d="m28 233-1-15c4-1 8 2 8-4h2l1 3 2 3 3-4 1-5 3 5-2 2 3 2 4-5c6 1 5-4 5-8h1v8h5c-1 7 2 13-2 18l2 2-5 1-1-2a515 515 0 0 0-6 0l-13-1H28z"/><path fill="#E3F4F8" d="m305 96-18 17V86l17-17c1 4 2 7-2 7l3 6v14z"/><path fill="#A7EDEF" d="m146 297 8-8c6 3 11 7 17 3l3 2 5 8c-6 7-14 10-22 6-5-3-7-8-11-11z"/><path fill="#81DAE4" d="m275 211 9-5 6-2c2-1 3-3 5 0l-3 2-3 4 5 4 1-1v-9l7-4v21l-7-2v13l-20-21z"/><path fill="#85EAF1" d="m352 110 8 14-1 6v48c-5-3-6-7-6-11v-36l-2-5v-9l1-7z"/><path fill="#2FCEE0" d="M223 207h1l1 1 10 10v4l-10 2h-1l-13 2-4-3v-15h1l1 4 3-2 6 5v-7l5-1z"/><path fill="#E3F4F8" d="M306 68c1-5 5-5 8-3l9 10v4l-17 15V80c3-4-4-8 2-10l-2-2z"/><path fill="#D7F3F3" d="m302 152-11 12c-3 4-8 6-12 9l-1-8 7-7 14-14c1-2 3-3 6-4v7l-3 5z"/><path fill="#E3F4F8" d="m306 139 1-4 22-21c3 4 6 5 10 2l3 2-3 3-2 1-6 4h-2c-5 1-7 4-8 9l-6 5h-5l-4-1m25-17z"/><path fill="#9DE7ED" d="M146 297c4 3 6 8 11 11 8 4 16 1 22-6 2 1 5-1 5 2l1 3-16 7 1 4h-6l1 1 2-1 2 3c-7 0-12-4-17-9l-2-5-7-7 3-3z"/><path fill="#6CC5DC" d="M129 243a1312 1312 0 0 1 17-15l6 2v4l-8 1 3 9-1 6-10 2h-4l-3-9z"/><path fill="#BBE3F0" d="m131 201-10 10-1-23-2-4 5-4 3 1 4-1v7l1 14z"/><path fill="#C9EAF3" d="m144 188-12 12-1-12 2-15h1l9-3 1 18z"/><path fill="#29C0DA" d="m368 259-2 5-7 1c-1 0-2-2-3-1l-2 3-1 3c0-3 0-6-4-6l-20 2-6-7h45zm-193 9 5-5c5-7 14-6 21 1v7l-5 5-2-6-2-2c-6 4-12 0-17 0z"/><path fill="#C3EEF0" d="m294 311-15-16v-4l6-1-2 5 7 2 14 5 1 3v4l-2 2h-9z"/><path fill="#38C1D6" d="m254 270-11-11h31l4 2-1 2-11 3-12 4z"/><path fill="#5DE2E8" d="M201 172a131 131 0 0 1 6-6v38l-6-1v-31z"/><path fill="#60C3D8" d="m29 234 9-1 2 5 11 1-1 7-11 1h-7l-3-13z"/><path fill="#43E3E8" d="M213 188v8l-1 9-4-1v-26l-1-13 5-4 1 27z"/><path fill="#DBF5F6" d="m342 117-3-1c-4 3-7 2-10-2l13-13 4 7c3 3 4 1 4-1l2 2-1 8-5 3-4-3m5-3h-1l1 1v-1z"/><path fill="#38C1D6" d="m248 231 12 13-2 10 10-1 3 1-1 2h-20v-3l-2 2v-24m7 14-3 9h5v-9h-2z"/><path fill="#DBF5F6" d="M287 86v28l-7 6V93l7-7z"/><path fill="#6CC5DC" d="m100 232-12 11-5-2-6 1v-7l10-3-3-2 3-3 3 5c3-1 7 1 8-4l2 4z"/><path fill="#C9F0F2" d="m330 320-10 11h-5l-9-9 3-2h21z"/><path fill="#5FD5E4" d="m314 251-11-13h1l3-4 4-2v4l1 2c2 6 4 1 6 0l1 6 5-1v8l-5 1v-1h-5z"/><path fill="#C3EEF0" d="m315 299 8 7-1 8-13 1v-15l6-1z"/><path fill="#60C3D8" d="m71 261-7 6-12-1v5c-2-2-2-5-4-6l-11-2-1-2 25-1 10 1z"/><path fill="#D7F3F3" d="m72 301 2-2 3 3 9 9 1 2-4 6c-4 2-6 1-8-3-4-5-3-10-3-15z"/><path fill="#4FC1D7" d="M152 234v-4l12-1 1 7a346 346 0 0 1-14 13l1-4v-11z"/><path fill="#C9EAF3" d="m254 147-6 5v-17l-1-10 6-5 1 27z"/><path fill="#4FC1D7" d="m129 243 3 9a599 599 0 0 1 11 2l-22 3-5-1 13-13z"/><path fill="#8FE1EB" d="m190 183 2-2v10l3 3v18l-9 3v-12l1-1v-1l3-3v-15m0 19s1 0 0 0z"/><path fill="#74E6EF" d="m361 127 5 13v26l-4-5v-13l-2-4 1-17z"/><path fill="#C3EEF0" d="m26 192 9 1v16h-9v-17z"/><path fill="#BBE3F0" d="m273 128-5 4v-6l-2-20 7-5v27z"/><path fill="#E3F4F8" d="m107 294-6 6-13 1v-10l11 1 8 1v1z"/><path fill="#5FD5E4" d="m223 238-12-11 13-1 1 9h1c4-3 4-7 4-11h1v11l-5 3h-3z"/><path fill="#74E6EF" d="m224 177-5 5v-14l-1-14 6-5v28z"/><path fill="#67E7EE" d="m213 188-1-28 6-6v29l-5 5z"/><path fill="#4FC1D7" d="m248 255 2-2v3l-9 1-7-7 3-2-1-14 1-11h1c1 9-2 17 3 25l1-6 1-16v21h3v2c0 3-3 6 2 6z"/><path fill="#85EAF1" d="M201 172v31l-5-1-1-25 6-5z"/><path fill="#C9EAF3" d="m250 68 16-2-17 16c-1-5-3-10 1-14z"/><path fill="#47D9E5" d="M218 208v7l-6-5-3 2-1-4h-1v15l-6-6v-11l17 1v1z"/><path fill="#C5ECEF" d="M72 301c0 5-1 10 3 15 2 4 4 5 8 3l-8 5-7-7c-5-6-5-8 0-14l4-2z"/><path fill="#C9EAF3" d="m255 118 5-4v27l-5 4v-27zm11 17-5 4v-27l5-4v27z"/><path fill="#8FE1EB" d="m184 217-4 4v-15l-3-3 1-7 7-7v12l-6-1 2 2c2 1 3 2 3 4v11z"/><path fill="#39CEE0" d="M175 268c5 0 11 4 17 0l2 2c-1 5-2 6-7 4-3-3-8-3-12 0l-11 7-1-1 12-12z"/><path fill="#85EAF1" d="m199 124 5-7 2-7 2-3h3l1 6-4 10-5 6-2 2-3 2v-5h1l2-1-2-1v-2z"/><path fill="#74C8DE" d="m236 234 1 14-3 2-11-12h3l5-3 5-1z"/><path fill="#8FD0E5" d="m37 263 11 2c2 1 2 4 4 6v4c-6-2-6-1-6 2l-1 4-8-18z"/><path fill="#4BCEE0" d="m353 270 1-3 2-3c1-1 2 1 3 1l7-1-4 10c-4 0-8-5-8 2v13h-1v-8l-4-7 4-4z"/><path fill="#B5E5EE" d="m241 160-4 4v-28l5-6v1l-1 29z"/><path fill="#64CDDF" d="M314 251h5v1l5-1c7 4 14 4 21 4h9l4 1-35 1-9-6z"/><path fill="#B5E5EE" d="m275 178-15 11v-6l13-13 2 8z"/><path fill="#71D7E5" d="M295 232v-13l7 2 1 17-8-6z"/><path fill="#9DE7ED" d="m163 280 1 1 4 6 3 4v1c-6 4-11 0-17-3l9-9z"/><path fill="#D8EEEE" d="m89 283 6-5 12 4v7l-7-1-11-5z"/><path fill="#39CEE0" d="m353 270-4 4h-2c-4-5-10-6-16-6l-2-2 20-2c4 0 4 3 4 6z"/><path fill="#85EAF1" d="m229 172-4 4v-17l-1-11 5-4v28z"/><path fill="#BBE3F0" d="m242 130 5-4v28l-4 4v-17l-1-11z"/><path fill="#81DAE4" d="m375 209-1-5v-31l3 9v28l-2-1z"/><path fill="#A4F0F1" d="m235 166-4 4v-19l-1-9 5-4v28z"/><path fill="#BBE3F0" d="m273 99 5-3v27l-4 4v-15l-1-13z"/><path fill="#C9EAF3" d="m227 290 12 14h-5l-11-8-2-2 6-4z"/><path fill="#94DAE6" d="m177 203 3 3v15l-5 5v-22l2-1zm-77 29-2-4-4-5v-2c3-3 7-4 11-5 0 4-3 7 1 9l-6 7z"/><path fill="#60C3D8" d="M146 228h-2l7-7 1 2 3 4 2-4v-7l1-1 6 2 1 4-1 7h-1l-2-6h-1l-1 6h-13z"/><path fill="#B5E5EE" d="m245 309 7 7h-5c-1 3-4 2-7 2l-3-1-2-3 1-2 1-1 1-1 1-1h6z"/><path fill="#C9EAF3" d="m151 181-7 6 1-18 4-1 2 13z"/><path fill="#81DEE9" d="m218 207-17-1v11l-6-5v-10h1l5 1 6 1 1 1h5l5 2z"/><path fill="#B5E5EE" d="m241 257 9-1a2416 2416 0 0 1 24 2l-31 1-2-2z"/><path fill="#C5ECEF" d="M109 339c3 3 5 8 11 9l2 3-10 2-5-3c2-4 0-6-3-8l5-3z"/><path fill="#64CDDF" d="m243 226-1 16-1 6c-5-8-2-16-3-25h1l4 3z"/><path fill="#94DAE6" d="M246 247h-3v-21l5 5v15l-2 1z"/><path fill="#DEEDEC" d="m89 283 11 5 7 1v4l-8-1-11-1-2-5 3-3zm-14 15a688 688 0 0 1 11-12v15l-11-3z"/><path fill="#C9EAF3" d="M35 259v-2h9l18-1h10l2 1-2 3-36-1h-1z"/><path fill="#D4F0F1" d="m323 257 35-1h8l2 3h-45v-2z"/><path fill="#9DE7ED" d="m368 145 5 15-1 5v1l-5-2 1-19z"/><path fill="#81DAE4" d="m173 228-1 1h-1l-1-2v-6l-1-15 5-1-1 23z"/><path fill="#5CC6DB" d="m254 271 12-5-1 7-4 4-7-6z"/><path fill="#9DE7ED" d="M185 201v-12l5-6v15l-3 3h-2z"/><path fill="#A0E0E8" d="M26 209h9v5c0 6-4 3-8 4l-1-9z"/><path fill="#B5E5EE" d="M75 298a150 150 0 0 1 13 4 834 834 0 0 1 10 0c-9 1-10 1-10 10v1h-1l-1-2c0-7-3-10-9-9l-3-3 1-1z"/><path fill="#BBE3F0" d="m116 256 5 1 22-2v2l-1 2h-27l1-3z"/><path fill="#C9EAF3" d="m157 174-5 5v-14h1l1-1 1-1 4-1-2 12zm121 119-9-8v-2l2-1h7v11z"/><path fill="#60C3D8" d="m74 257-2-1v-1l1-7 5-2 6 1-10 10m7-9s-1 0 0 0z"/><path fill="#B5E5EE" d="m157 174 2-12 5-3v8l-7 7z"/><path fill="#C5ECEF" d="m107 282-12-4 5-5 7 2v7z"/><path fill="#85EAF1" d="M213 107h1l2-1h2c3 0 5 0 5 3l-3 3-2 2-3 2-2-9z"/><path fill="#A1D9EA" d="m113 219-5 5-2-14 6 2 1 7z"/><path fill="#C5ECEF" d="m315 299-6 1-3-1-1 6-1-3a839 839 0 0 1 2-13l9 10m-8-6-1 4h1v-4z"/><path fill="#4FC1D7" d="m268 253-10 1 2-10 8 9z"/><path fill="#A0E0E8" d="m197 135-16 16-1-2 3-4 12-11 2 1z"/><path fill="#81DEE9" d="M347 274h2l4 7-12-3-3-3 9-1z"/><path fill="#5DE2E8" d="M354 288v-12c0-7 4-2 7-2l-7 14z"/><path fill="#ABDEED" d="M269 283v2l-8-7 4-5h2l3 1-1 9zm25-6 6 6-7 4h-4v-1l-1-3v-3l6-3z"/><path fill="#7ECCE1" d="M52 275v-9l12 1-5 6c-4-4-5 0-7 2z"/><path fill="#38C1D6" d="m141 260-11 11v-3l2-8h9z"/><path fill="#4FC1D7" d="M278 293v-24l-1-6 1-2 7 8c-2 1-6-2-6 3v23l-1-2z"/><path fill="#ABDEED" d="m120 212-6 6v-12h5l1 6z"/><path fill="#71D7E5" d="M130 269v2l-2 2h-6l-10-1 1-3h17z"/><path fill="#74C8DE" d="m165 221-1-4-1-7 5-4v14l-3 1z"/><path fill="#94DAE6" d="m214 277 5 5c-4 0-8-2-8 4l-5-3-1-3 9-3z"/><path fill="#8FE1EB" d="m341 278 11 3 1 8-12-11z"/><path fill="#71D7E5" d="m214 277-9 3-2-6 4-4 7 7z"/><path fill="#4BCEE0" d="m361 127-1 17v39h-1v-53l1-6 1 3z"/><path fill="#C9EAF3" d="m242 79 5-3 1 8-7 6 1-11z"/><path fill="#ABDEED" d="m190 368-15 3-16 1-6-1 13-2 24-1z"/><path fill="#7ECCE1" d="M107 282v-7l-2-8 4-4 2 4-1 6-2 10v9l-1 2v-12z"/><path fill="#A1D9EA" d="M278 123V95l2-2v27l-2 3zm-3 55-2-8 5-5 1 8-4 5z"/><path fill="#ABDEED" d="m309 315 13-1h6l4 3a620 620 0 0 1-26-1l3-1z"/><path fill="#81DEE9" d="m230 142 1 9v19l-2 2a985 985 0 0 1 1-30z"/><path fill="#8FE1EB" d="M235 166v-28l2-2v28l-2 2z"/><path fill="#74E6EF" d="m218 207-5-2v-9l10 11-5 1v-1z"/><path fill="#D7F3F3" d="M88 313v-1c0-9 1-9 10-10l-10 11z"/><path fill="#C5ECEF" d="M164 167v-8h1l-1-1 4-4 2 8-6 5z"/><path fill="#5FD5E4" d="m347 274-9 1-7-7c6 0 12 1 16 6z"/><path fill="#4BCEE0" d="m111 267-2-4 2-2c6 4 13 2 19 1v3h-11c-3 1-6-2-8 2z"/><path fill="#A0E0E8" d="m306 289-2 7-6-4-1-1 4-7 5 5z"/><path fill="#D8EEEE" d="M108 292v-9l7-1 2 2-9 8z"/><path fill="#38C1D6" d="M130 262c-6 1-13 3-19-1l2-2 13 1 4 2z"/><path fill="#5CC6DB" d="m133 173-2 15v13l-1-14v-22l-1-11h2v14l2 5z"/><path fill="#94DAE6" d="M52 275c2-2 3-6 7-2l-7 7-6-3c0-3 0-4 6-2z"/><path fill="#ABDEED" d="M211 286c0-6 4-4 8-4l4 4-8 3-4-1v-2z"/><path fill="#BBE3F0" d="m215 289 8-3 4 4-6 3-5-2-1-2z"/><path fill="#94DAE6" d="m279 279 1-2c4 0 8 0 10-4l4 4-6 3-9-1z"/><path fill="#ABDEED" d="m174 205-5 1h-1l10-10-1 7-2 1-1 1z"/><path fill="#D4F0F1" d="M306 317h26l-1 2a374 374 0 0 1-25-2z"/><path fill="#A1D9EA" d="m242 131 1 10v17l-2 2 1-29z"/><path fill="#74C8DE" d="m85 247-7-1h-1v-4l6-1 5 2-3 4z"/><path fill="#ABDEED" d="M266 135v-29l2 20v7l-2 2z"/><path fill="#6CC5DC" d="M157 216v7l-2 4-3-4-1-2 6-5z"/><path fill="#C9F0F2" d="M104 342c3 2 5 4 3 8l-6-4c-2-1-2-3 0-5a11 11 0 0 1 3 1z"/><path fill="#9DE7ED" d="m195 194-3-3v-10l3-3v16z"/><path fill="#C5ECEF" d="M306 317v2h-3l-6-7h7l2 5z"/><path fill="#64CDDF" d="m368 145-1 20v20h-1v-19a909 909 0 0 1 2-21z"/><path fill="#74E6EF" d="m213 107 2 9-7 7 4-10-1-6h2z"/><path fill="#B5E5EE" d="m143 300 7 7 2 5c-5-1-8-5-11-10l2-2z"/><path fill="#74C8DE" d="m106 210 2 14-2 1c-4-2-1-5-1-9v-10l-1-13 1-1 1 18zm-67 47h-4l-3-8 9 2c2 3 2 3-2 3l-2-1 1 3 1 1z"/><path fill="#81DAE4" d="M290 273c-2 4-6 4-10 4l-1-5h10l1 1z"/><path fill="#A1D9EA" d="M143 257v-3l-7-2 10-2 5-1h1l-6 4-1-1v1l-2 4z"/><path fill="#71D7E5" d="m306 139 4 1-1 9-4-2a486 486 0 0 0 1-8z"/><path fill="#A0E0E8" d="M152 165v14l-1 2-2-13-4 1-1-1 8-3z"/><path fill="#E3F4F8" d="M350 107c0 2-1 4-4 1l-4-7 3-1 3 4 2 3z"/><path fill="#D4F0F1" d="m171 30 18 4v1l-29-5h11z"/><path fill="#4FC1D7" d="M240 318c3 0 6 1 7-2h5l1 2-1 2-4 3h-2c0-4-4-4-6-5z"/><path fill="#BBE3F0" d="M260 183v6l-4 4-4-4 8-6z"/><path fill="#81DAE4" d="M185 201h2v1l-1 1v12l-2 2v-11c0-2-1-3-3-4l-2-2 6 1z"/><path fill="#74C8DE" d="M245 309h-6l-10-4 5-1h4l7 5z"/><path fill="#81DEE9" d="M328 314h-6l1-8 1 1 4 7z"/><path fill="#ABDEED" d="m306 68 2 2c-6 2 1 6-2 10v14l-1 2V82l-3-6c4 0 3-3 3-7l1-1z"/><path fill="#B5E5EE" d="m46 277 6 3-3 3c-2 3-4 2-4-2l1-4z"/><path fill="#38C1D6" d="m372 166 1-1h1a591 591 0 0 1 0 37h-1v-15l-1-21zM36 259l36 1-1 1-10-1H36v-1z"/><path fill="#29C0DA" d="m130 262-4-2-13-1h2a2203 2203 0 0 1 27 1h-10l-2 7v-5z"/><path fill="#5CC6DB" d="M171 229h1l-6 7-2-7h7z"/><path fill="#9DE7ED" d="M223 109c0-3-2-3-5-3l9-5-4 8z"/><path fill="#38C1D6" d="m375 209 2 1-1 12c-4-4-2-8-1-13z"/><path fill="#94DAE6" d="M248 348a5736 5736 0 0 1-1 23v-36h1v13z"/><path fill="#81DAE4" d="m175 156-1 1v-18l-1-3-3 2h-1v-3h5l3 9-2 6v6z"/><path fill="#ABDEED" d="m117 284-2-2v-4l9-1-7 7zm-12-17 2 8-7-2 5-6z"/><path fill="#94DAE6" d="m124 277-9 1-1-2 8-3h2l2 2-2 2z"/><path fill="#7ECCE1" d="m301 284-4 6-4-1v-2l7-4 1 1z"/><path fill="#4BCEE0" d="m207 270-4 4-2-3v-7l6 6z"/><path fill="#6CC5DC" d="m41 251-9-2v-2h11l-2 4z"/><path fill="#5CC6DB" d="m174 205 1-1v22l-2 2 1-23z"/><path fill="#8FD0E5" d="M303 319h3a2487 2487 0 0 1 24 1h-21l-3 2-3-3z"/><path fill="#74C8DE" d="m120 212-1-6v-16l-2-4 1-2 2 4v24z"/><path fill="#A1D9EA" d="m273 99 1 13v15l-1 1V99z"/><path fill="#60C3D8" d="M113 206v13l-1-7v-24h1v18z"/><path fill="#5CC6DB" d="m163 210 1 7-6-2 5-5z"/><path fill="#64CDDF" d="M289 272h-10c0-5 4-2 6-3l4 3z"/><path fill="#8FD0E5" d="M255 118v27l-1 2v-27l1-2z"/><path fill="#A1D9EA" d="M247 154v-29l1 10v18l-1 1z"/><path fill="#5FD5E4" d="m224 148 1 11v17l-1 1v-29z"/><path fill="#4BCEE0" d="M218 183v-28l1 13v14l-1 1z"/><path fill="#8FD0E5" d="M261 112v27l-1 2v-27l1-2zm45 205-2-5h-7l-3-1h9l2-2a296 296 0 0 0 1 8z"/><path fill="#D4F0F1" d="M174 153v4l-4 4 1-8h3z"/><path fill="#ABDEED" d="m248 84-1-8-1-7 4-1c-4 4-2 9-1 14l-1 2z"/><path fill="#D7F3F3" d="M175 156v-6l5-1 1 2-6 5z"/><path fill="#64CDDF" d="M170 153v9l-2-8 1-11v-5h1v15z"/><path fill="#71D7E5" d="M195 194v-17a1576 1576 0 0 1 0 25v-8z"/><path fill="#C9F0F2" d="m109 339-5 3-1-2 4-4 2 1v2z"/><path fill="#71D7E5" d="M144 169v19l-1-18 1-1z"/><path fill="#ABDEED" d="m224 225-13 2v-1l13-2v1z"/><path fill="#9DE7ED" d="m197 135-2-1 3-4v3l-1 2z"/><path fill="#39CEE0" d="M235 222v-4l3 4h-3z"/><path fill="#81DEE9" d="M374 165h-2l1-5 1 5z"/><path fill="#DBF5F6" d="m348 104-3-4 3 4z"/><path fill="#81DAE4" d="m126 275-2-2h4l-2 2z"/><path fill="#B5E5EE" d="m140 303-2 2 2-2z"/><path fill="#C9EAF3" d="m235 96 3-3-3 3z"/><path fill="#C5ECEF" d="m109 337-2-1 1-2 1 3z"/><path fill="#4FC1D7" d="M273 256h-3l1-2 2 2z"/><path fill="#C5ECEF" d="m103 340 1 2-3-1 2-1z"/><path fill="#9DE7ED" d="m201 131 2-2-2 2zm17-17 2-2-2 2z"/><path fill="#6CC5DC" d="M145 253v-1l1 1h-1z"/><path fill="#ABDEED" d="M237 222h1l1 1h-2v-1z"/><path fill="#60C3D8" d="M36 259v1l-1-1h1z"/><path fill="#8FE1EB" d="M353 289h1-1z"/><path fill="#C3EEF0" d="m324 307-1-1 1 1z"/><path fill="#C9EAF3" d="m239 92 1-1-1 1zm-1 1 1-1-1 1zm2-2 1-1-1 1z"/><path fill="#74E6EF" d="m225 208-1-1 1 1z"/><path fill="#E2F7F7" d="m198 130-3 4-12 11-6-1-3-9h-4l1-3c4-4 4-6 1-10-2-1-2-3-2-5h3-1l-2-1-1-1-12-3a121 121 0 0 0-11-2c-2-3-4-3-6 0h-2l-1-1v-4l5-2h1v1l1 1h2c11 3 22 4 32 10l21 11 1 1h-1l-1 1v2m-16-9-3-1v2l3-1m3 4 3-1-1-1-2 2m-10-6v1-1m15 6s-1 0 0 0z"/><path fill="#A7EDEF" d="m199 126-21-11c-10-6-21-7-32-10 7-2 14 1 20 3 12 3 23 7 33 16v2z"/><path fill="#81DAE4" d="m142 103-5 1a3261 3261 0 0 1 5-1z"/><path fill="#BBE3F0" d="m208 106-2 4V86l2-3v23z"/><path fill="#B5E5EE" d="M242 62h21l-26 2-4 1v-2a322 322 0 0 1 8-1h1z"/><path fill="#E6F4F8" d="m219 45 6 1 5 4-2 2-11-6 2-1z"/><path fill="#9DE7ED" d="m92 107-14 5v-1l14-4z"/><path fill="#8FE1EB" d="M78 111v1a203 203 0 0 1 0-1z"/><path fill="#E6F4F8" d="m204 39-9-3v-1c1-4 3-2 5 0l4 4zm37 23-5 1 5-1zm-30-20h4l-1 2-3-2z"/><path fill="#A7EDEF" d="M143 104v-1l3 2h-2l-1-1z"/><path fill="#E6F4F8" d="M233 63v2l-2-1 2-1z"/><path fill="#ABDEED" d="M240 70h2v1h-2v-1z"/><path fill="#8FE1EB" d="m61 119-2 1 2-1z"/><path fill="#74E6EF" d="m216 106-2 1 2-1z"/><path fill="#E6F4F8" d="M209 41h-1 1zm-5-2zm7 3-2-1 2 1z"/><path fill="#D4F0F1" d="M195 35v1h-1l1-1z"/><path fill="#8FE1EB" d="m62 118-1 1 1-1z"/><path fill="#C5ECEF" d="M240 318c2 1 6 1 6 5l-2 2-19 14-5 3-8 5-27 9c-12 3-23 3-34 1l-6 1-17-6a1145 1145 0 0 0 16 2h1l5 1h24l9-2c17-3 32-11 47-20 4-3 5-11 2-15l5-1 3 1z"/><path fill="#74C8DE" d="m146 358 5-1c11 2 22 2 34-1v1c-8 3-17 3-25 3l-14-2z"/><path fill="#60C3D8" d="M185 357v-1a609 609 0 0 1 0 1zm40-18zm-13 8z"/><path fill="#C5ECEF" d="m248 323 4-3-3 6-1-3z"/><path fill="#60C3D8" d="m220 342 5-3-5 3z"/><path fill="#C3EEF0" d="m219 356 3-2-3 2z"/><path fill="#ABDEED" d="m194 367-4 1 4-1zm3-1-2 1 2-1z"/><path fill="#C5ECEF" d="m126 351 1 1-1-1z"/><path fill="#C3EEF0" d="M222 354z"/><path fill="#47D9E5" d="m305 147 4 2v17l-2 3-2-2-2-3v-2l-1-10 3-5z"/><path fill="#8FE1EB" d="M295 204c-2-3-3-1-5 0l-6 2 18-10v2l-1 1h1v1l-7 4z"/><path fill="#38C1D6" d="M302 198v-3h3l-1 4v5l-1 6-1 10v-22z"/><path fill="#29C0DA" d="M303 195h-1a674 674 0 0 1 1 0z"/><path fill="#A0E0E8" d="M174 355h-2v-8c0-3 0-6-3-5l3-3-5-3c3 0 6 0 5-5l-1-9h4l-1 2v31z"/><path fill="#E7F7F7" d="M170 117c0 2 0 4 2 5 3 4 3 6-1 10l-2 3-3 2 3 1v5c-7 3-13 5-20 3-16-2-32-1-47 3l29-3v7l-2 1c-2 0-4-1-4 2l-2 24-5 4-1 2-2 1-2 1h-4v-15h-2v17l-2 2-1 1h-2l-10-2a65 65 0 0 0-11-9l-3-4-4-3-4-4-6-5-2-2-1-1-1-1-3-3-2-1-1-1-1-1-1-1-1-1-1-1-1-2-6-6c0-4 2-5 5-5l12-4-4-6 3-1c13-10 28-15 44-18l6-2 3-1h1l5 2h22a2145 2145 0 0 0 7 0l6 2 2 5 3-3a1097 1097 0 0 1 12 3m-89 39h-1v1l1-1m14 6-11 3c-2 1-2 3-2 5l4 1 16-6 1 4h1l1-9-10 2m32-28c5 4 5-5 9-3-3-1-7-2-9 3m21-1 7 1v-1a4832618 4832618 0 0 1-7 0m-59 18 3 1a51511 51511 0 0 1-3-1m-4 4 1-1a34685 34685 0 0 1-1 1m73-20h1v-1l-1 1m-63 15 1 1-1-1z"/><path fill="#A7EDEF" d="m109 109-6 2c-16 3-31 8-44 18l-3 1h-1l20-13 16-5 3-1h1a34 34 0 0 0 4-1 93 93 0 0 0 7-2l3 1z"/><path fill="#4BCEE0" d="M35 214v-21l1-6v-35l2-5v9l-1 39v19h-2z"/><path fill="#B6F2F4" d="M38 150v-4c1-2 2-4 5-1a66 66 0 0 1 8 9v1h-5c-1-5-5-4-8-5z"/><path fill="#B5E5EE" d="M138 110a403 403 0 0 1-25-2c8-2 16-2 24 1l1 1z"/><path fill="#9DE7ED" d="m109 109-3-1h6l-3 1zm-5 0zm-5 1-4 1 4-1zm-5 1-3 1 3-1z"/><path fill="#A7EDEF" d="m55 130-2 1 2-1zm-2 1z"/><path fill="#47D9E5" d="m360 217-1 10v4l-3 3-2-3-2-11v-12c5 1 6 4 7 7l1 1v1zm6-5v5l-6-1c3-3 4-5 1-8l-1-4v-10l6 5 1 2v3l-1 8z"/><path fill="#2FCEE0" d="M359 256h-1l-4-1-8-2v-14l6-2-2 13 4 3 5 3z"/><path fill="#4BCEE0" d="m366 212 1-7v3l6-6h1v2l-2 12-6-4z"/><path fill="#39CEE0" d="m352 237-6 2v-13l6 1v10zm8-21 6 1v3l-2 6-4-6v-4z"/><path fill="#47D9E5" d="m352 227-6-1v-1l1-6a26 26 0 0 1 5 1v7z"/><path fill="#4BCEE0" d="M372 229a424 424 0 0 1-11 3l11-4v1z"/><path fill="#64CDDF" d="M362 256h-2 2z"/><path fill="#B5E5EE" d="M161 355zm-11 0-5-1 5 1zm-6-1h-4 4z"/><path fill="#C5ECEF" d="m120 348 1-1v1h-1zm9 1c1 0 0 0 0 0z"/><path fill="#C3EEF0" d="M175 322h-5l-1-1-2-3h3l5 2 11 2 4 1-1 1-14-2z"/><path fill="#9DE7ED" d="m169 321 1 1-1-1z"/><path fill="#4FC1D7" d="M77 242v4H50l1-7v-5h1l2 8c3-1 3-5 3-8l1 2v6l5-5v1l5 1 1-5 2-2c0 6 3 4 6 3v7z"/><path fill="#94DAE6" d="M37 214v-4l20-3c0 4 1 9-5 8l-4 5-3-2 2-2-3-5-1 5-3 4-2-3-1-3z"/><path fill="#60C3D8" d="m69 234-1 5-5-1v-1l-5 5v-6l5-1-2-2c4-5 1-11 2-18v-9l1 1v20c0 4 1 6 5 7z"/><path fill="#6CC5DC" d="M51 234v5l-11-1-2-5 13 1z"/><path fill="#A1D9EA" d="M63 206v9h-5v-9h5z"/><path fill="#6CC5DC" d="M57 234c0 3 0 7-3 8l-2-8h5z"/><path fill="#94DAE6" d="M58 206v1h-1v-2h1v1z"/><path fill="#81DAE4" d="M184 304c0-3-3-1-5-2l-5-8 4-2 3 2c5 5 10 9 18 10l-1-9h5c-2-3-11-9-14-8a337 337 0 0 1-15 0l-1-2v-2l10-2 9 3 7 1h1l1 1 1 2 1 1 2 3 1 1 1 1 1 1v2l-3 8-9 5-5-2-1-1-2-1-4-2z"/><path fill="#71D7E5" d="m174 287 2 1 2 4-4 2-3-2v-1l3-4z"/><path fill="#8FE1EB" d="M295 204v9l-1 1-5-4 3-4 3-2z"/><path fill="#74E6EF" d="m302 220 1-10 1-5v33h-1l-1-17v-1zm57-42v15l-7-4-1-58v-5l2 5v36c0 4 1 8 6 11z"/><path fill="#B6F2F4" d="M351 126v5l-6 7 1-18 5-3v5a63 63 0 0 0 0 4z"/><path fill="#74E6EF" d="M351 120v-3 3zm0 2v-1 1zm0 2v-1 1z"/><path fill="#71D7E5" d="M224 226v-2h6c0 4 0 8-4 11h-1l-1-9z"/><path fill="#ABDEED" d="M230 224h-5l10-2h1l-5 2h-1z"/><path fill="#74E6EF" d="m331 126 6-3a967 967 0 0 1-1 35l-4 6-1-38zm15-6-1 18-1 2-5 4v-23l3-3 4 2zm-31 20 6-5h1l1 18c-4-1-5 1-5 4l-1 11v-17l-2-11z"/><path fill="#5DE2E8" d="M339 121z"/><path fill="#5FD5E4" d="m331 126 1 38v2h-2v-40h1z"/><path fill="#D4F0F1" d="m329 126 1 5-6 3-2 1h-1c1-5 3-8 8-9z"/><path fill="#4BCEE0" d="M309 166v-17l1-9h2l-1 8v18h-2z"/><path fill="#67E7EE" d="m311 148 1-7 3-1 2 11-6-3z"/><path fill="#D4F0F1" d="M331 122h-1v-2l1 2z"/><path fill="#8FE1EB" d="m175 320-5-2-1-4 16-7 2 2c-1 7-7 4-9 5l-3 6z"/><path fill="#4BCEE0" d="m187 309-2-2-1-3 4 2 2 1 1 1v1h-4z"/><path fill="#C3EEF0" d="m167 318-2 1-1-1h3z"/><path fill="#60C3D8" d="M152 234v11l-5-1-3-9 8-1z"/><path fill="#ABDEED" d="M171 229h-18l-7-1h24l1 1z"/><path fill="#74C8DE" d="m147 244 5 1-1 4-5 1 1-6z"/><path fill="#B6F2F4" d="M125 156c0-3 2-2 4-2l1 11v15l-4 1v-20l-1-5z"/><path fill="#9DE7ED" d="m125 156 1 5v20l-3-1 2-24z"/><path fill="#E2F7F7" d="M131 154v-3c1-4 3-5 6-5h12c7 2 13 0 19-3v11l-4 4v1l-5 3-4 1-1 1-1 1h-1l-8 3-1 2h-1l-8 3h-1l-2-5v-14z"/><path fill="#71D7E5" d="M134 173z"/><path fill="#4BCEE0" d="M173 283v2l-5 2-4-6 11-7c4-3 9-3 12 0 5 2 6 1 7-4l2 6v1l-5 1-11-1c-4 0-7 3-7 6z"/><path fill="#39CEE0" d="M196 277v-1l5-5 2 3 2 6 1 3-2 6h-1l-1-1-1-2-1-1-2-2-2-6z"/><path fill="#B5E5EE" d="m293 289 4 2 1 1 6 5v5l-14-5-7-2 2-5-6 1 1-8 7 1c-1 6 3 5 6 5m-7 1s1 0 0 0z"/><path fill="#C5ECEF" d="m305 309-2 2 2-2z"/><path fill="#64CDDF" d="m277 263 1 6a232 232 0 0 1-13 4l1-7 11-3z"/><path fill="#2FCEE0" d="M208 204h-1v-38l1 12v26z"/><path fill="#94DAE6" d="M50 246h28l-5 2-13 2h-8l-9-3a450 450 0 0 1 7-1z"/><path fill="#B6F2F4" d="M347 114v1l-1-1h1z"/><path fill="#4FC1D7" d="m255 244 2 1v9h-5l3-10z"/><path fill="#94DAE6" d="M248 255c-5 0-2-3-2-6h2v6z"/><path fill="#6CC5DC" d="M248 249h-2v-2h1l1 2z"/><path fill="#8FD0E5" d="M69 234c-4-1-5-3-5-7v-9l12-2v-4l3 4 2-4 1-3h1v10c0 2 0 4 3 4v1h1l-1-1v-12l4 4 2-4 2-1v13l-2 2h-1l-4 2-3 3-13 2-2 2z"/><path fill="#74C8DE" d="m92 225 2-2 4 5c-1 5-5 3-8 4l-3-5 4-2-1 5c4-1 3-3 2-5zm-21 7 13-2 3 2-10 3c-3 1-6 3-6-3z"/><path fill="#71D7E5" d="m324 243-5 1-1-6c-2 1-4 6-6 0l-1-2v-2l5 2v-21h2l6 1a198 198 0 0 1-1 11l1 1v1c-2 4-1 5 3 5h4l7 1v3l-6 1v-2h-1v4l-6 1-1 1z"/><path fill="#47D9E5" d="m304 199 1-4 1-1 5-4 1 25-1 12v5l-4 2-2-5v-25l-1-5z"/><path fill="#39CEE0" d="M324 243h1v3l4 4 2-4v-9h1v10l3 4 3-5 7 2v7c-7 0-14 0-21-4v-8z"/><path fill="#2FCEE0" d="m304 199 1 5v25l2 5-3 4v-39z"/><path fill="#81DEE9" d="M311 232v-5l5 2v7l-5-2v-2zm0 4 1 2-1-2z"/><path fill="#D4F0F1" d="M306 316v-17l3 1v15l-3 1z"/><path fill="#DEEDEC" d="M77 302c6-1 9 2 9 9l-9-9z"/><path fill="#9DE7ED" d="m186 203 1-1-1 1zm4-1c1 0 0 0 0 0z"/><path fill="#67E7EE" d="M366 166v17c-4 0-4-3-4-6l-2-7v-26l2 4v13l4 5z"/><path fill="#D8EEEE" d="M88 301h-2v-15l2 5v10z"/><path fill="#71D7E5" d="m231 224 5-2h1v1l-1 11-5 1v-11z"/><path fill="#74C8DE" d="M225 235h1-1z"/><path fill="#ABDEED" d="m179 200 2 2-2-2z"/><path fill="#9DE7ED" d="M199 127h1l-1 1v-1z"/><path fill="#DBF5F6" d="M199 127v1h-1l1-1z"/><path fill="#29C0DA" d="M345 255v-30a156 156 0 0 1 1 1v27l8 2h-9z"/><path fill="#5FD5E4" d="m168 287 5-2 1 2-3 4-3-4z"/><path fill="#BBE3F0" d="m234 304-5 1-3-1-4-2v-1l1-5 11 8z"/><path fill="#A0E0E8" d="m223 296-1 5h-4v-1l-2-9 5 3 2 2z"/><path fill="#ABDEED" d="M94 221a93 93 0 0 1 0-14l6 1-3-12 5-3h1l2 13v9c-4 2-8 3-11 6z"/><path fill="#5CC6DB" d="m170 227-6 1 1-7 3-1a141 141 0 0 0 1-14l1 15v6zm-7 1h-4l1-6h1l2 6z"/><path fill="#A0E0E8" d="m229 305 10 4-1 1-1 1-1 1-1 2h-8l-3-3-2-1-1-1-1-1 2-4h4l3 1z"/><path fill="#71D7E5" d="M227 314h8l2 3-5 1h-2l-1 1-4-1v-1l2-3z"/><path fill="#74C8DE" d="m236 312 1-1-1 1zm1-1 1-1-1 1zm1-1 1-1-1 1zM52 250h8l2 6H44c0-5 1-7 6-5l2-1z"/><path fill="#4FC1D7" d="m62 256-2-6 13-2-1 6-8-3-1 2c2 4 6 1 9 2v1H62z"/><path fill="#5CC6DB" d="m52 250-2 1c-5-2-6 0-6 5l-5 1-1-1 1-2c4 0 4 0 2-3l2-4 9 3z"/><path fill="#81DEE9" d="m372 166 1 21-6-1v-21l5 1z"/><path fill="#A0E0E8" d="m154 164 1-1-1 1zm-1 1 1-1-1 1z"/><path fill="#8FD0E5" d="m267 273 11-4v3a427 427 0 0 0-9 11l1-9-3-1z"/><path fill="#B5E5EE" d="m271 282 7-10v10h-7z"/><path fill="#74C8DE" d="M81 248c-1 0 0 0 0 0z"/><path fill="#BBE3F0" d="m105 192 2-2 2-1 3-1v24l-6-2-1-18z"/><path fill="#D4F0F1" d="M307 293v4h-1l1-4z"/><path fill="#DBF5F6" d="m177 144 6 1-3 4-5 1 2-6z"/><path fill="#A0E0E8" d="m287 284-7-1-1-4 9 1v3l-1 1z"/><path fill="#94DAE6" d="m287 284 1-1 1 3v1h4v2c-3 0-7 1-6-5z"/><path fill="#B5E5EE" d="M289 287v-1 1z"/><path fill="#5CC6DB" d="M130 265v4h-17l-1 3-1 1h-1l1-6c2-4 5-1 8-2h11z"/><path fill="#BBE3F0" d="m113 188 2-1 2-1 2 4v16h-5l-1-18z"/><path fill="#81DAE4" d="m111 273 1-1 10 1-8 3-3-3z"/><path fill="#64CDDF" d="m204 289 2-6 5 3v8c0 2 2 3 4 5h-3l-2-1-2-3-1-1-1-1-1-1-1-3z"/><path fill="#5DE2E8" d="m360 170 2 7c0 3 0 6 4 7v15l-6-5v-24z"/><path fill="#2FCEE0" d="M360 183v21l1 4c3 3 2 5-1 8l-1-1a514 514 0 0 1 0-22v-10h1z"/><path fill="#BBE3F0" d="m111 273 3 3 1 2v4l-7 1 2-10h1z"/><path fill="#B5E5EE" d="M164 159v-1l1 1h-1z"/><path fill="#7ECCE1" d="m298 292-1-1 1 1z"/><path fill="#81DAE4" d="M215 299c-2-2-4-3-4-5v-6l4 1 1 2 2 9h-2l-1-1z"/><path fill="#4BCEE0" d="M366 199a2587 2587 0 0 1 1-13v11a911 911 0 0 0-1 2z"/><path fill="#6CC5DC" d="m39 254-1 2-1-3 2 1z"/><path fill="#71D7E5" d="M367 197v-11l6 1v10h-6z"/><path fill="#5FD5E4" d="M367 197h6v5l-6 6v-11z"/><path fill="#B6F2F4" d="m171 153-1-15 3-2 1 3v14h-3z"/><path fill="#E2F7F7" d="m169 138-3-1 3-2v3z"/><path fill="#A7EDEF" d="m169 115-11-1h-1v-2l12 3zm-16-3-6-2 10 2h-4z"/><path fill="#DBF5F6" d="M146 110h-6c2-3 4-3 6 0zm36 11-3 1v-2l3 1zm3 4 2-2 1 1-3 1zm7 1v2l-2-1 2-1zm-17-7v1-1z"/><path fill="#A7EDEF" d="M170 117v-1l2 1h-2zm2 0h1-1z"/><path fill="#DBF5F6" d="M190 125c-1 0 0 0 0 0z"/><path fill="#81DAE4" d="m143 104 1 1-1-1z"/><path fill="#D4F0F1" d="m229 319 1-1h2c3 4 2 12-2 15-15 9-30 17-47 20l-9 2v-9l30-5c6-1 12-5 16-10 2-3 4-6 1-9l3-1c2 2 2 2 5-2z"/><path fill="#39CEE0" d="m311 190-5 4-1 1h-2v-31l2 3 2 2 2-3h2a464 464 0 0 1 0 24z"/><path fill="#81DAE4" d="M302 198v1h-1l1-1z"/><path fill="#D8EEEE" d="M220 323c4 2 2 5 0 8-4 5-10 9-16 10l-30 5v-22l11 3c8 1 15 2 22-1h3l3-2 7-1z"/><path fill="#5FD5E4" d="M207 326c-7 3-14 2-22 1l-11-3 1-2 14 2 1-1-4-1 6-2h6l11 1-12 3 10 2z"/><path fill="#B6F2F4" d="m62 164 2 2v1l-1 30h-5v-32l-1-2 3-1 1 1 1 1z"/><path fill="#D4F0F1" d="m83 183 4 3 5 5v5h-4v-5h-1v9l-3 1-1-11c-3 3 0 9-5 10v-22l3 4v6l2-1v-4z"/><path fill="#D7F3F3" d="m96 162 9-2-1 9h-1l-1-4-16 6-4-1c0-2 0-4 2-5l12-3zm-18 16v3l-2 12-2 6h-1l-1-5-1-8v-8l3-3 4 3zm71-32h-12c-3 0-5 1-6 5v-5l-29 3c15-4 31-5 47-3z"/><path fill="#C3EEF0" d="m109 188-2 2v-17h2v15z"/><path fill="#E2F7F7" d="M126 133c3-4 7-3 10-2-4-2-4 7-10 2z"/><path fill="#C9F0F2" d="M92 195v-4l10 2-5 3-5-1z"/><path fill="#E2F7F7" d="M148 133a473 473 0 0 1 7 0v1l-7-1z"/><path fill="#ABDEED" d="m74 175-3 3v8h-1v-15l4 4z"/><path fill="#E2F7F7" d="M153 112h2l2 2h1l-3 3-2-5z"/><path fill="#ABDEED" d="M64 167v-1l6 5-6-3v-1z"/><path fill="#B5E5EE" d="M83 183v4l-2 1v-6l2 1z"/><path fill="#81DAE4" d="M60 162h-3v-3l3 3z"/><path fill="#D4F0F1" d="M90 151h2a51511 51511 0 0 0-2 0zm-6 4 2-2a34685 34685 0 0 0-2 2z"/><path fill="#E2F7F7" d="m158 135 1-1v1h-1z"/><path fill="#D4F0F1" d="m95 150 1 1-1-1z"/><path fill="#74C8DE" d="m117 186-2 1 2-1z"/><path fill="#81DAE4" d="m55 158 2 1-2-1z"/><path fill="#D4F0F1" d="m81 156-1 1v-1h1z"/><path fill="#81DAE4" d="m53 156 1 1-1-1zm1 1 1 1-1-1z"/><path fill="#D4F0F1" d="M81 156z"/><path fill="#81DAE4" d="m52 155 1 1-1-1zm-1 0v-1l1 1h-1zm-1-2-1-1 1 1zm1 1-1-1 1 1zm11 10-1-1 1 1zm-1-1-1-1 1 1z"/><path fill="#A4F0F1" d="m37 195 1-39 11 11 2 2v28l-6-1v-30h-1l-1 30-6-1z"/><path fill="#A7EDEF" d="m51 169-2-2-11-11v-6c3 1 7 0 8 5h6l1 1 1 1 1 1 2 1v4l1 2-1 26-2 5-2-8-2-19z"/><path fill="#9DE7ED" d="m51 169 2 19 2 8 2 9v2l-19 3-1-15 6 1 2 3v-3l6 1v-28m-7 34v1h1l-1-1z"/><path fill="#74E6EF" d="M352 208v4h-6l-1-13 7 1v8z"/><path fill="#58E5EC" d="M352 208v-9l7 3v12c-1-2-2-5-7-6zm-6 4h6v8l-5-1h-1v-7z"/><path fill="#39CEE0" d="M346 219h1l-1 6h-1l-3-6h4z"/><path fill="#81DEE9" d="m192 320-7 2-10-2 3-6c2-1 8 2 9-5h4l1 1 2 1v5h-2l-7-1-1 1 8 4z"/><path fill="#A1D9EA" d="m84 201 3-1v6h1l-1-7v-8h1v5l4 2 2 9v3l-2 1-2 4-4-4v12c-3 0-3-2-3-4v-10h-1l-1 3-2 4-3-4v4l-11 2-1-7c4 0 7 0 6-4l1-3h3l2-1v-1l2-2c0 3 0 5 3 3l3-2z"/><path fill="#ABDEED" d="m71 204-1 3c1 4-2 4-6 4v-9h6l1 2z"/><path fill="#94DAE6" d="M64 202v4h-1v-9l1-30v35z"/><path fill="#A7EDEF" d="M63 197v9h-5v-9h5z"/><path fill="#8FE1EB" d="M58 197a2154 2154 0 0 1-1 8l-2-9 2-5 1-26v32z"/><path fill="#A0E0E8" d="m198 295 1 9c-8-1-13-5-18-10 2-1 4-3 6-2 4 0 7 2 11 3z"/><path fill="#94DAE6" d="M198 295c-4-1-7-3-11-3-2-1-4 1-6 2l-3-2-2-4 13-1c3-1 12 5 14 8h-5z"/><path fill="#5FD5E4" d="m196 277 2 6 1 2-7-1-9-3-10 2c0-3 3-6 7-6l11 1 5-1zm0 33 9-5 3-8 2 1 2 1 2 5-4 2-6 7h-2l-3-1-3-2z"/><path fill="#A7EDEF" d="m196 310 3 2h-3l-2-1-2-1-1-1v-1l5 2z"/><path fill="#B5E5EE" d="m210 298-2-1v-2l2 3zm-6-9 1 3-2-3h1zm-5-4-1-2 2 2h-1zm2 1 1 2-1-2z"/><path fill="#A7EDEF" d="m190 307-2-1 2 1z"/><path fill="#B5E5EE" d="m206 293 1 1-1-1zm-1-1 1 1-1-1zm-3-4 1 1-1-1zm-2-3 1 1-1-1zm7 9 1 1-1-1z"/><path fill="#A7EDEF" d="m191 308-1-1 1 1z"/><path fill="#85EAF1" d="M352 199v1l-7-1v-55h-1l-5 7v-7l5-4 1-2 6-7a3074 3074 0 0 1 1 68z"/><path fill="#67E7EE" d="M352 199v-10l7 4v9l-7-3zm-20-33v-2l4-6 1 5v47l-6-1v-4l1-39z"/><path fill="#47D9E5" d="M337 210v-47l-1-5 1-4h1v10l1 47c0 4 2 5 5 5h1l1 1v2h-4l3 6v4l-7-7-2 5c-5-1-6-3-4-9 4 0 5-1 5-4v-4z"/><path fill="#B6F2F4" d="m345 138-1 2 1-2z"/><path fill="#58E5EC" d="m324 216-6-1-1-47 1-11c0-3 1-5 5-4l1 20-1 3v36h1v-34l6-4v42h-6zm-13-28a35870 35870 0 0 0 0-40l6 3v10l-1 19-5 8z"/><path fill="#47D9E5" d="m311 188 5-8 1-19v7l1 47h-4l2-5v-16c0-4-1-5-5-4v-2z"/><path fill="#4BCEE0" d="M324 173z"/><path fill="#74E6EF" d="M338 164v-10l1-3 5-7h1v15l-1 12-6-7z"/><path fill="#39CEE0" d="M330 216v-50h1v43l1 9c-2 6-1 8 4 9l2-5 7 7v8h-5l-2-2-7-1-1-5v-13z"/><path fill="#67E7EE" d="M330 166v8l-6 4-1-2 1-3v-26l6 3v16z"/><path fill="#74E6EF" d="m330 150-6-3v-13l6-2v18zm1 55v-39h1l-1 39z"/><path fill="#94DAE6" d="M286 290c1 0 0 0 0 0z"/><path fill="#6CC5DC" d="M92 225c1 2 2 4-2 5l1-5h1z"/><path fill="#74C8DE" d="m86 223 1 1h-1v-1z"/><path fill="#43E3E8" d="M330 216v13h-6v-13h6z"/><path fill="#4BCEE0" d="M340 237h5v11l-7-2v-9h2z"/><path fill="#9DE7ED" d="M314 215h2v13l-5-1 1-12h2z"/><path fill="#5FD5E4" d="M338 238v8l-6 1v-8l6-1z"/><path fill="#47D9E5" d="M324 229h6l1 5h-4c-4 0-5-1-3-5z"/><path fill="#5FD5E4" d="M331 241v5h-6v-4l6-1zm9-4h-2v-2l2 2z"/><path fill="#47D9E5" d="M324 227v1l-1-1h1z"/><path fill="#58E5EC" d="M314 215h-2l-1-25c4-1 5 0 5 4v16l-2 5z"/><path fill="#38C1D6" d="m305 195 1-1-1 1z"/><path fill="#4BCEE0" d="m332 247 6-1-3 5-3-4zm-7-1h6l-2 4-4-4z"/><path fill="#64CDDF" d="M218 301a232 232 0 0 0 4 1v1l-4-2z"/><path fill="#74C8DE" d="M222 303v-1l4 2h-4v-1zm7 2-3-1 3 1z"/><path fill="#64CDDF" d="M216 300h2v1l-2-1z"/><path fill="#BBE3F0" d="m94 207-2-9v-3l5 1 3 12-6-1z"/><path fill="#47D9E5" d="m204 313 6-7 5-2 5 4 1 1 1 1 2 1 3 3-2 3h-3l-6-1a155 155 0 0 1-12-3z"/><path fill="#B5E5EE" d="m220 308-5-4-3-5h3l1 1 2 1 4 2v1l-2 4zm4 3-2-1 2 1zm-3-2-1-1 1 1z"/><path fill="#39CEE0" d="M222 317h3v1l-1 3-3 1-9 2-2 2h-3l-10-2a343 343 0 0 0 18-4v-2l7-1z"/><path fill="#C5ECEF" d="m224 321 1-3 4 1c-3 4-3 4-5 2zm7-3h-1 1z"/><path fill="#60C3D8" d="M72 255c-3-1-7 2-9-2l1-2a88 88 0 0 1 8 4z"/><path fill="#B5E5EE" d="m212 299-2-1 2 1z"/><path fill="#64CDDF" d="m216 300-1-1 1 1z"/><path fill="#DBF5F6" d="m157 114-2-2h2v2z"/><path fill="#5FD5E4" d="m210 326 2-2-2 2z"/><path fill="#5DE2E8" d="M215 318v2l-2 1a5527 5527 0 0 1-15-1l-6-4h2c3 1 6 3 6-2l15 4z"/><path fill="#74E6EF" d="m192 316 6 4h-6l-8-4 1-1 7 1z"/><path fill="#B5E5EE" d="m71 204-1-2v-16h1l1 8 1 5h1l2-6 2-12v18l-2 3v1l-2 1h-3zm13-3-3 2c-3 2-3 0-3-3 5-1 2-7 5-10l1 11z"/><path fill="#C9F0F2" d="M92 196v2l-4-2h4z"/><path fill="#8FD0E5" d="m87 199 1 7h-1v-7z"/><path fill="#ABDEED" d="m76 202 2-3v1l-2 2z"/><path fill="#D7F3F3" d="M70 186v15l-6 1v-33l6 2v15z"/><path fill="#81DEE9" d="M45 196v3l-2-3a1237 1237 0 0 1 2 0zm-1 6 1 2h-1v-2z"/><path fill="#4BCEE0" d="m344 171 1-12v40l1 13v4h-2v-45z"/><path fill="#39CEE0" d="M345 216h1v1l-1-1z"/><path fill="#74E6EF" d="M200 314c0 5-3 3-6 2v-4h2l3 1 1 1z"/><path fill="#4BCEE0" d="m192 310 2 1-2-1zm4 2h-2v-1l2 1zm-5-3 1 1-1-1z"/><path fill="#ABDEED" d="m74 204 2-1-2 1z"/><path fill="#B6F2F4" d="M63 202v-2 2z"/><path fill="#A7EDEF" d="m199 312 3 1h-3v-1zm5 1 1 1-3-1h2z"/><path fill="#4BCEE0" d="M199 312v1l-3-1h3z"/><path fill="#58E5EC" d="m332 218-1-9 6 1v4c0 3-1 4-5 4z"/><path fill="#67E7EE" d="M344 171v45c-3 0-5-1-5-5l-1-47 6 7z"/><path fill="#47D9E5" d="m323 176 1 2v34h-1v-36z"/><path fill="#67E7EE" d="M323 176v3-3z"/><path fill="#4BCEE0" d="m202 313 3 1 11 2 6 1-7 1a755 755 0 0 1-16-5h3zm11 8 2-1-2 1z"/></svg>
          </SvgIcon>
        </Grid>
            <Grid item xs>
              <Typography gutterBottom variant="caption" component="div" color="secondary">
                Flexibly filter dates! Configure settings for the startup range, presets, the interactive timeline or a minimised date picker (range or single day). Only show features needed by your end users.
                </Typography>
                <Typography gutterBottom variant="caption" component="div">
                To activate, add a Date field to the Visualizations Panel.
              </Typography>
            </Grid>
        </Grid>
    </>
  );
}