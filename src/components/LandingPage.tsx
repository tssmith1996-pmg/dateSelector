import React from "react";
import { VisualStrings } from "../types/localization";
import "../styles/landing-page.css";

export type LandingPageProps = {
  strings: VisualStrings["landing"];
  theme: {
    background: string;
    text: string;
    accent: string;
    border: string;
  };
  isHighContrast?: boolean;
};

export const LandingPage: React.FC<LandingPageProps> = ({ strings, theme, isHighContrast = false }) => {
  return (
    <div
      className="landing-page"
      data-high-contrast={isHighContrast ? "true" : "false"}
      style={{
        color: theme.text,
        borderColor: theme.border,
        backgroundColor: theme.background,
      }}
    >
      <div className="landing-page__badge" style={{ backgroundColor: theme.accent }}>
        <span aria-hidden="true" className="landing-page__badge-icon">
          {strings.title.charAt(0) || "D"}
        </span>
      </div>
      <h1 className="landing-page__title">{strings.title}</h1>
      <p className="landing-page__body">{strings.instructions}</p>
      <p className="landing-page__action" style={{ color: theme.accent }}>
        {strings.action}
      </p>
    </div>
  );
};
