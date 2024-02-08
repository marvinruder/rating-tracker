import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  Checkbox,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { Fragment, useState } from "react";

/**
 * The state of a checkbox that can be either checked, unchecked or indeterminate.
 */
type CheckboxState = "unchecked" | "indeterminate" | "checked";

/**
 * A list of nested items that can be expanded and collapsed. Each item can be checked or unchecked, where checking or
 * unchecking an item is equivalent to checking or unchecking all of its children. Up to four levels of nesting are
 * supported.
 * @param props The properties of the component.
 * @returns The component.
 */
export const NestedCheckboxList = <
  FirstLevelType extends string,
  SecondLevelType extends string,
  ThirdLevelType extends string,
  FourthLevelType extends string,
>(
  props: NestedCheckboxListProps<FirstLevelType, SecondLevelType, ThirdLevelType, FourthLevelType>,
): JSX.Element => {
  const theme = useTheme();

  const [openFirstLevel, setOpenFirstLevel] = useState<FirstLevelType[]>([]);
  const [openSecondLevel, setOpenSecondLevel] = useState<SecondLevelType[]>([]);
  const [openThirdLevel, setOpenThirdLevel] = useState<ThirdLevelType[]>([]);

  /**
   * Click handler for the first-level checkbox. If the first level element has children, then the children inherit the
   * state of the parent.
   * @param firstLevelElement The first-level element that was clicked
   */
  const clickFirstLevelCheckbox = (firstLevelElement: FirstLevelType) => {
    if (props.getFourthLevelElements) {
      // The fourth level is the last level of nesting
      // Get all fourth-level elements that are children of the first-level element
      const fourthLevelElements: FourthLevelType[] = props
        .getSecondLevelElements(firstLevelElement)
        .flatMap((secondLevelElement) => props.getThirdLevelElements(secondLevelElement))
        .flatMap((thirdLevelElement) => props.getFourthLevelElements(thirdLevelElement));
      props.setSelectedLastLevelElements((prev) =>
        getFirstLevelCheckboxStatus(firstLevelElement) === "unchecked" // Previous state of the first-level element
          ? // Check all fourth-level elements that are children of the first-level element
            [...prev, ...fourthLevelElements]
          : // Uncheck all fourth-level elements that are children of the first-level element
            prev.filter((p) => !fourthLevelElements.includes(p)),
      );
    } else if (props.getThirdLevelElements) {
      // The third level is the last level of nesting
      // Get all third-level elements that are children of the first-level element
      const thirdLevelElements: ThirdLevelType[] = props
        .getSecondLevelElements(firstLevelElement)
        .flatMap((secondLevelElement) => props.getThirdLevelElements(secondLevelElement));
      props.setSelectedLastLevelElements((prev) =>
        getFirstLevelCheckboxStatus(firstLevelElement) === "unchecked" // Previous state of the first-level element
          ? // Check all third-level elements that are children of the first-level element
            [...prev, ...thirdLevelElements]
          : // Uncheck all third-level elements that are children of the first-level element
            prev.filter((p) => !thirdLevelElements.includes(p)),
      );
    } else if (props.getSecondLevelElements) {
      // The second level is the last level of nesting
      // Use all second-level elements that are children of the first-level element
      props.setSelectedLastLevelElements((prev) =>
        getFirstLevelCheckboxStatus(firstLevelElement) === "unchecked" // Previous state of the first-level element
          ? // Check all second-level elements that are children of the first-level element
            [...prev, ...props.getSecondLevelElements(firstLevelElement)]
          : prev.filter(
              // Uncheck all second-level elements that are children of the first-level element
              (p) => !props.getSecondLevelElements(firstLevelElement).includes(p),
            ),
      );
    } else {
      // The first level is the last level of nesting (= we have no nesting in the list)
      props.setSelectedLastLevelElements(
        (prev) =>
          prev.includes(firstLevelElement) // Previous state of the first-level element
            ? prev.filter((p) => p != firstLevelElement) // Uncheck the first-level element
            : [...prev, firstLevelElement], // Check the first-level element
      );
    }
  };

  /**
   * Determines the state of a first-level checkbox based on the state of its children.
   * @param firstLevelElement The first-level element whose state is to be determined
   * @returns The state of the first-level checkbox
   */
  const getFirstLevelCheckboxStatus = (firstLevelElement: FirstLevelType): CheckboxState => {
    if (props.getSecondLevelElements) {
      // First-level elements have children
      const secondLevelElementStates: CheckboxState[] = props
        .getSecondLevelElements(firstLevelElement)
        .map((secondLevelElement) => getSecondLevelCheckboxStatus(secondLevelElement));
      if (secondLevelElementStates.every((state) => state === "checked")) {
        return "checked"; // If all children are checked, then the parent is checked
      }
      if (secondLevelElementStates.every((state) => state === "unchecked")) {
        return "unchecked"; // If all children are unchecked, then the parent is unchecked
      }
      return "indeterminate"; // In any other case, the parent is indeterminate
    } else {
      // First-level elements have no children
      return props.selectedLastLevelElements.includes(firstLevelElement) ? "checked" : "unchecked";
    }
  };

  /**
   * Click handler for the second-level checkbox. If the second level element has children, then the children inherit
   * the state of the parent.
   * @param secondLevelElement The second-level element that was clicked
   */
  const clickSecondLevelCheckbox = (secondLevelElement: SecondLevelType) => {
    if (props.getFourthLevelElements) {
      // The fourth level is the last level of nesting
      // Get all fourth-level elements that are children of the second-level element
      const fourthLevelElements: FourthLevelType[] = props
        .getThirdLevelElements(secondLevelElement)
        .flatMap((thirdLevelElement) => props.getFourthLevelElements(thirdLevelElement));
      props.setSelectedLastLevelElements((prev) =>
        getSecondLevelCheckboxStatus(secondLevelElement) === "unchecked" // Previous state of the second-level element
          ? // Check all fourth-level elements that are children of the second-level element
            [...prev, ...fourthLevelElements]
          : // Uncheck all fourth-level elements that are children of the second-level element
            prev.filter((p) => !fourthLevelElements.includes(p)),
      );
    } else if (props.getThirdLevelElements) {
      // The third level is the last level of nesting
      // Use all third-level elements that are children of the second-level element
      props.setSelectedLastLevelElements((prev) =>
        getSecondLevelCheckboxStatus(secondLevelElement) === "unchecked" // Previous state of the second-level element
          ? // Check all third-level elements that are children of the second-level element
            [...prev, ...props.getThirdLevelElements(secondLevelElement)]
          : prev.filter(
              // Uncheck all third-level elements that are children of the second-level element
              (p) => !props.getThirdLevelElements(secondLevelElement).includes(p),
            ),
      );
    } else {
      // The second level is the last level of nesting (= we have no further nesting in the list)
      props.setSelectedLastLevelElements(
        (prev) =>
          prev.includes(secondLevelElement) // Previous state of the second-level element
            ? prev.filter((p) => p != secondLevelElement) // Uncheck the second-level element
            : [...prev, secondLevelElement], // Check the second-level element
      );
    }
  };

  /**
   * Determines the state of a second-level checkbox based on the state of its children.
   * @param secondLevelElement The second-level element whose state is to be determined
   * @returns The state of the second-level checkbox
   */
  const getSecondLevelCheckboxStatus = (secondLevelElement: SecondLevelType): CheckboxState => {
    if (props.getThirdLevelElements) {
      // Second-level elements have children
      const thirdLevelElementStates: CheckboxState[] = props
        .getThirdLevelElements(secondLevelElement)
        .map((thirdLevelElement) => getThirdLevelCheckboxStatus(thirdLevelElement));
      if (thirdLevelElementStates.every((state) => state === "checked")) {
        return "checked"; // If all children are checked, then the parent is checked
      }
      if (thirdLevelElementStates.every((state) => state === "unchecked")) {
        return "unchecked"; // If all children are unchecked, then the parent is unchecked
      }
      return "indeterminate"; // In any other case, the parent is indeterminate
    } else {
      // Second-level elements have no children
      return props.selectedLastLevelElements.includes(secondLevelElement) ? "checked" : "unchecked";
    }
  };

  /**
   * Click handler for the third-level checkbox. If the third level element has children, then the children inherit the
   * state of the parent.
   * @param thirdLevelElement The third-level element that was clicked
   */
  const clickThirdLevelCheckbox = (thirdLevelElement: ThirdLevelType) => {
    if (props.getFourthLevelElements) {
      // The fourth level is the last level of nesting
      // Use all fourth-level elements that are children of the third-level element
      props.setSelectedLastLevelElements((prev) =>
        getThirdLevelCheckboxStatus(thirdLevelElement) === "unchecked" // Previous state of the third-level element
          ? // Check all fourth-level elements that are children of the third-level element
            [...prev, ...props.getFourthLevelElements(thirdLevelElement)]
          : prev.filter(
              // Uncheck all fourth-level elements that are children of the third-level element
              (p) => !props.getFourthLevelElements(thirdLevelElement).includes(p),
            ),
      );
    } else {
      // The third level is the last level of nesting (= we have no further nesting in the list)
      props.setSelectedLastLevelElements(
        (prev) =>
          prev.includes(thirdLevelElement) // Previous state of the third-level element
            ? prev.filter((p) => p != thirdLevelElement) // Uncheck the third-level element
            : [...prev, thirdLevelElement], // Check the third-level element
      );
    }
  };

  /**
   * Determines the state of a third-level checkbox based on the state of its children.
   * @param thirdLevelElement The third-level element whose state is to be determined
   * @returns The state of the third-level checkbox
   */
  const getThirdLevelCheckboxStatus = (thirdLevelElement: ThirdLevelType): CheckboxState => {
    if (props.getFourthLevelElements) {
      // Third-level elements have children
      const fourthLevelElementStates: CheckboxState[] = props
        .getFourthLevelElements(thirdLevelElement)
        .map((fourthLevelElement) => getFourthLevelCheckboxStatus(fourthLevelElement));
      if (fourthLevelElementStates.every((state) => state === "checked")) {
        return "checked"; // If all children are checked, then the parent is checked
      }
      if (fourthLevelElementStates.every((state) => state === "unchecked")) {
        return "unchecked"; // If all children are unchecked, then the parent is unchecked
      }
      return "indeterminate"; // In any other case, the parent is indeterminate
    } else {
      // Third-level elements have no children
      return props.selectedLastLevelElements.includes(thirdLevelElement) ? "checked" : "unchecked";
    }
  };

  /**
   * Click handler for the fourth-level checkbox. Fourth-level elements have no children.
   * @param fourthLevelElement The fourth-level element that was clicked
   */
  const clickFourthLevelCheckbox = (fourthLevelElement: FourthLevelType) => {
    // The fourth level is always the last level of nesting
    props.setSelectedLastLevelElements(
      (prev) =>
        prev.includes(fourthLevelElement) // Previous state of the fourth-level element
          ? prev.filter((p) => p != fourthLevelElement) // Uncheck the fourth-level element
          : [...prev, fourthLevelElement], // Check the fourth-level element
    );
  };

  /**
   * Determines the state of a fourth-level checkbox.
   * @param fourthLevelElement The fourth-level element whose state is to be determined
   * @returns The state of the fourth-level checkbox
   */
  const getFourthLevelCheckboxStatus = (fourthLevelElement: FourthLevelType): CheckboxState => {
    // Fourth-level elements never have children
    return props.selectedLastLevelElements.includes(fourthLevelElement) ? "checked" : "unchecked";
  };

  return (
    <List
      dense
      disablePadding
      sx={{
        ml: "24px",
        mr: "24px",
        width: "250px",
        height: props.height,
        overflow: "auto",
        border: `1px solid ${theme.colors.alpha.black[30]}`,
        borderRadius: "10px",
      }}
    >
      {props.firstLevelElements.map((firstLevelElement) => (
        <Fragment key={firstLevelElement}>
          <ListItemButton onClick={() => clickFirstLevelCheckbox(firstLevelElement)} disableGutters>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Checkbox
                checked={getFirstLevelCheckboxStatus(firstLevelElement) === "checked"}
                indeterminate={getFirstLevelCheckboxStatus(firstLevelElement) === "indeterminate"}
                sx={{ p: 0, pl: 1, pr: 1 }}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary={props.firstLevelLabels ? props.firstLevelLabels[firstLevelElement] : firstLevelElement}
            />
            {props.getSecondLevelElements && // We have a second level of nesting
              // Check whether this first-level element is expanded
              (openFirstLevel.includes(firstLevelElement) ? (
                <IconButton
                  sx={{ p: 0, mr: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFirstLevel((prev) => prev.filter((p) => p != firstLevelElement));
                  }}
                >
                  <ExpandLess />
                </IconButton>
              ) : (
                <IconButton
                  sx={{ p: 0, mr: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFirstLevel((prev) => [...prev, firstLevelElement]);
                  }}
                >
                  <ExpandMore />
                </IconButton>
              ))}
          </ListItemButton>
          {props.getSecondLevelElements && ( // We have a second level of nesting
            <Collapse in={openFirstLevel.includes(firstLevelElement)} timeout="auto" unmountOnExit>
              <List dense disablePadding sx={{ pl: 1 }}>
                {props.getSecondLevelElements(firstLevelElement).map((secondLevelElement) => (
                  <Fragment key={secondLevelElement}>
                    <ListItemButton onClick={() => clickSecondLevelCheckbox(secondLevelElement)} disableGutters>
                      <ListItemIcon sx={{ minWidth: 0 }}>
                        <Checkbox
                          checked={getSecondLevelCheckboxStatus(secondLevelElement) === "checked"}
                          indeterminate={getSecondLevelCheckboxStatus(secondLevelElement) === "indeterminate"}
                          sx={{ p: 0, pl: 1, pr: 1 }}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          props.secondLevelLabels ? props.secondLevelLabels[secondLevelElement] : secondLevelElement
                        }
                      />
                      {props.getThirdLevelElements && // We have a third level of nesting
                        // Check whether this second-level element is expanded
                        (openSecondLevel.includes(secondLevelElement) ? (
                          <IconButton
                            sx={{ p: 0, mr: 2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenSecondLevel((prev) => prev.filter((p) => p != secondLevelElement));
                            }}
                          >
                            <ExpandLess />
                          </IconButton>
                        ) : (
                          <IconButton
                            sx={{ p: 0, mr: 2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenSecondLevel((prev) => [...prev, secondLevelElement]);
                            }}
                          >
                            <ExpandMore />
                          </IconButton>
                        ))}
                    </ListItemButton>
                    {props.getThirdLevelElements && (
                      <Collapse in={openSecondLevel.includes(secondLevelElement)} timeout="auto" unmountOnExit>
                        <List dense disablePadding sx={{ pl: 1 }}>
                          {props.getThirdLevelElements(secondLevelElement).map((thirdLevelElement) => (
                            <Fragment key={thirdLevelElement}>
                              <ListItemButton onClick={() => clickThirdLevelCheckbox(thirdLevelElement)} disableGutters>
                                <ListItemIcon sx={{ minWidth: 0 }}>
                                  <Checkbox
                                    checked={getThirdLevelCheckboxStatus(thirdLevelElement) === "checked"}
                                    indeterminate={getThirdLevelCheckboxStatus(thirdLevelElement) === "indeterminate"}
                                    sx={{ p: 0, pl: 1, pr: 1 }}
                                    disableRipple
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    props.thirdLevelLabels
                                      ? props.thirdLevelLabels[thirdLevelElement]
                                      : thirdLevelElement
                                  }
                                />
                                {props.getFourthLevelElements && // We have a fourth level of nesting
                                  // Check whether this third-level element is expanded
                                  (openThirdLevel.includes(thirdLevelElement) ? (
                                    <IconButton
                                      sx={{ p: 0, mr: 2 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenThirdLevel((prev) => prev.filter((p) => p != thirdLevelElement));
                                      }}
                                    >
                                      <ExpandLess />
                                    </IconButton>
                                  ) : (
                                    <IconButton
                                      sx={{ p: 0, mr: 2 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenThirdLevel((prev) => [...prev, thirdLevelElement]);
                                      }}
                                    >
                                      <ExpandMore />
                                    </IconButton>
                                  ))}
                              </ListItemButton>
                              {props.getFourthLevelElements && (
                                <Collapse in={openThirdLevel.includes(thirdLevelElement)} timeout="auto" unmountOnExit>
                                  <List dense disablePadding sx={{ pl: 1 }}>
                                    {props.getFourthLevelElements(thirdLevelElement).map((fourthLevelElement) => (
                                      <ListItemButton
                                        key={fourthLevelElement}
                                        onClick={() => clickFourthLevelCheckbox(fourthLevelElement)}
                                        disableGutters
                                      >
                                        <ListItemIcon sx={{ minWidth: 0 }}>
                                          <Checkbox
                                            checked={getFourthLevelCheckboxStatus(fourthLevelElement) === "checked"}
                                            sx={{ p: 0, pl: 1, pr: 1 }}
                                            disableRipple
                                          />
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={
                                            props.fourthLevelLabels
                                              ? props.fourthLevelLabels[fourthLevelElement]
                                              : fourthLevelElement
                                          }
                                        />
                                      </ListItemButton>
                                    ))}
                                  </List>
                                </Collapse>
                              )}
                            </Fragment>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </Fragment>
                ))}
              </List>
            </Collapse>
          )}
        </Fragment>
      ))}
    </List>
  );
};

/**
 * Properties for the NestedCheckboxList component
 */
interface NestedCheckboxListProps<
  FirstLevelType extends string,
  SecondLevelType extends string,
  ThirdLevelType extends string,
  FourthLevelType extends string,
> {
  /**
   * The last-level elements that are currently selected. The parent elements states are derived from this.
   */
  selectedLastLevelElements: (FirstLevelType | SecondLevelType | ThirdLevelType | FourthLevelType)[];
  /**
   * A function that sets the last-level elements that are currently selected.
   */
  setSelectedLastLevelElements:
    | React.Dispatch<React.SetStateAction<FirstLevelType[]>>
    | React.Dispatch<React.SetStateAction<SecondLevelType[]>>
    | React.Dispatch<React.SetStateAction<ThirdLevelType[]>>
    | React.Dispatch<React.SetStateAction<FourthLevelType[]>>;
  /**
   * The first-level elements to display.
   */
  firstLevelElements: readonly FirstLevelType[];
  /**
   * A record of labels for the first-level elements.
   */
  firstLevelLabels?: Record<FirstLevelType, String>;
  /**
   * A function that returns the second-level elements for a given first-level element. If there are no second-level
   * elements, this function is omitted.
   * @param {FirstLevelType} firstLevelElement The first-level element to get the second-level elements for.
   * @returns {SecondLevelType[]} The second-level elements for the given first-level element.
   */
  getSecondLevelElements?: (firstLevelElement: FirstLevelType) => SecondLevelType[];
  /**
   * A record of labels for the second-level elements.
   */
  secondLevelLabels?: Record<SecondLevelType, String>;
  /**
   * A function that returns the third-level elements for a given second-level element. If there are no third-level
   * elements, this function is omitted.
   */
  getThirdLevelElements?: (secondLevelElement: SecondLevelType) => ThirdLevelType[];
  /**
   * A record of labels for the third-level elements.
   */
  thirdLevelLabels?: Record<ThirdLevelType, String>;
  /**
   * A function that returns the fourth-level elements for a given third-level element. If there are no fourth-level
   * elements, this function is omitted.
   */
  getFourthLevelElements?: (thirdLevelElement: ThirdLevelType) => FourthLevelType[];
  /**
   * A record of labels for the fourth-level elements.
   */
  fourthLevelLabels?: Record<FourthLevelType, String>;
  /**
   * The height of the list in pixels.
   */
  height: number;
}
