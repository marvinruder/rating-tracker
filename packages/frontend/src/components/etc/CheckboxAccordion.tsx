import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionSummary, FormControlLabel, Checkbox, AccordionDetails } from "@mui/material";

/**
 * An accordion with a checkbox that is checked if and only if all of the accordion is expanded.
 * @param props The properties of the component.
 * @returns The component.
 */
const CheckboxAccordion = (props: React.PropsWithChildren<CheckboxAccordionProps>): React.JSX.Element => (
  <Accordion
    expanded={props.expanded}
    onChange={(event, isExpanded) =>
      event.target instanceof HTMLElement && event.target.className.includes("MuiFormControlLabel")
        ? event.stopPropagation()
        : props.onChange(event, isExpanded)
    }
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ ".MuiAccordionSummary-content": { my: 0 } }}>
      <FormControlLabel control={<Checkbox disableRipple checked={props.expanded} />} label={props.summary} />
    </AccordionSummary>
    <AccordionDetails>{props.children}</AccordionDetails>
  </Accordion>
);

/**
 * Properties for the CheckboxAccordion component.
 */
interface CheckboxAccordionProps {
  /**
   * The summary of the accordion, used as the label of the checkbox.
   */
  summary: string;
  /**
   * Whether the accordion is expanded.
   */
  expanded: boolean;
  /**
   * A method to toggle the expansion of the accordion.
   */
  onChange: (event: React.SyntheticEvent<Element, Event>, expanded: boolean) => void;
}

export default CheckboxAccordion;
