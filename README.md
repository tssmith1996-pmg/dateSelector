# Date Selector Visual

## A compact rich functionality date range filter for Power BI
The [**DateSelector** visual](https://github.com/o221/dateSelector/blob/main/dist/dateSel4A1A0033E6F54D1B809B6E51058D54E3.2.2023.11.07.pbiviz) is a date range selector designed to be used with Microsoft Power BI.

## Features
- Allows users to select a range of dates with a compact user-friendly interface.
- Enables users to filter data based on the selected date range.
- Simple and intuitive design, easy to use.
- Configurable to show or hide buttons with the simplest representation being a single date picker.

### Anatomy

![Date Range Selector Anatomy](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector1.png?raw=true "Date Range Selector Anatomy")

### With dual timeline showing

![Date Range Selector with two level timeline](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector2.png?raw=true "Date Range Selector Timeline")

### Advancd features

![Date Range Selector Advanced Features](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector3.png?raw=true "Date Range Selector Advanced Features")

### Shortcut keys

![Date Range Selector Shortcut Keys](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector4.png?raw=true "Date Range Selector Shortcut Keys")

### Layout Options

![Layout Options](https://github.com/o221/dateSelector/blob/main/readme_files/Date%20Selector5.png?raw=true "Layout Options")

 ****

 ## Summary

 #### Date Range Input
  * Input via field, quick action buttons or slider
     * The date entry is not limited to the filtered scope
* Up to 6 levels of granularity on the slider(s)
     * Granularity determines step size of the interactions
     * Based on granularity - Top timeline is the primary granularity
     * Shows selected range on two granularity levels (optional)
     * Second timeline shows context - it is also active
* Optional buttons for Today, This Week, etc. with optional YTD, etc.
     * Today, etc. buttons, are hidden when the button's period is not in scope.
* Range slider shows full scope of selected date field
* Filters reduce the scope on any level - Visual/Page/All Pages

 #### Start-up state
  * Slicer opens in configured *pre-set* state
     * *default* behaves like any typical visual.
     * Today, YTD, This Month, Last week, etc.
     * or ...
Can be synced with last  page viewed
     * With *pre-set* range there's *no sync respected* on the pre-set pages.
     * Bookmarks are respected after pre-set ranges
 #### Short cut keys
  * when slider is active use fast shortcuts
 #### Help
  * Descriptive tooltip option

## Installation
To use the DateSelector visual, you can import it into your Power BI report by following these steps:

Download the visual from [dist](https://github.com/o221/dateSelector/blob/main/dist/dateSel4A1A0033E6F54D1B809B6E51058D54E3.2.2023.11.07.pbiviz) and import it into Power BI using the "Import from file" option.

1. Open the report in Power BI Desktop.
2. In the Visualizations pane, select the ellipsis (...).
3. Select "Import from file."
4. Select downloaded "DateSelector" file.
5. Click on the visual and select "Add."

## Usage
To use the DateSelector visual, add it to your report canvas and connect it to the relevant date field. Users can then use the visual to select a date range and filter data accordingly. Often the ther need not touch the visual because the wanted date is pre-set.

## Example
A sample Power BI model with a detailed help page is provided [here.](https://github.com/o221/dateSelector/blob/main/dist/date%20selector%20doc.pbix) Download it and open with Power BI Desktop.

## Version
The current version of the DateSelector visual is v2023.05.05.

## Limitations
The DateSelector visual currently supports only English language. Internationalisation is not yet planned.

## Support
If you encounter any issues while using the DateSelector visual, please visit the [support page](https://github.com/o221/dateSelector/issues) for assistance. Alternatively add any comments or feature requests on the [discussion page](https://github.com/o221/dateSelector/discussions)

## License
The DateSelector visual is released under the MIT License. Please refer to the LICENSE file for more information.

## Acknowledgments
We would like to thank the Power BI community for their support and feedback in the development of the DateSelector visual.
