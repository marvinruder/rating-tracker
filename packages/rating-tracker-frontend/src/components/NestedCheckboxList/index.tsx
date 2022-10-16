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
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Fragment, useState } from "react";

type CheckboxState = "unchecked" | "indeterminate" | "checked";

const NestedCheckboxList = <
  FirstLevelType extends string,
  SecondLevelType extends string,
  ThirdLevelType extends string,
  FourthLevelType extends string
>(
  props: NestedCheckboxListProps<
    FirstLevelType,
    SecondLevelType,
    ThirdLevelType,
    FourthLevelType
  >
) => {
  const theme = useTheme();

  const [openFirstLevel, setOpenFirstLevel] = useState<FirstLevelType[]>([]);
  const [openSecondLevel, setOpenSecondLevel] = useState<SecondLevelType[]>([]);
  const [openThirdLevel, setOpenThirdLevel] = useState<ThirdLevelType[]>([]);

  const clickFirstLevelCheckbox = (firstLevelElement: FirstLevelType) => {
    if (props.getFourthLevelElements) {
      const fourthLevelElements: FourthLevelType[] = props
        .getSecondLevelElements(firstLevelElement)
        .flatMap((secondLevelElement) =>
          props.getThirdLevelElements(secondLevelElement)
        )
        .flatMap((thirdLevelElement) =>
          props.getFourthLevelElements(thirdLevelElement)
        );
      props.setSelectedLastLevelElements((prev) =>
        getFirstLevelCheckboxStatus(firstLevelElement) === "unchecked"
          ? [...prev, ...fourthLevelElements]
          : prev.filter((p) => !fourthLevelElements.includes(p))
      );
    } else if (props.getThirdLevelElements) {
      const thirdLevelElements: ThirdLevelType[] = props
        .getSecondLevelElements(firstLevelElement)
        .flatMap((secondLevelElement) =>
          props.getThirdLevelElements(secondLevelElement)
        );
      props.setSelectedLastLevelElements((prev) =>
        getFirstLevelCheckboxStatus(firstLevelElement) === "unchecked"
          ? [...prev, ...thirdLevelElements]
          : prev.filter((p) => !thirdLevelElements.includes(p))
      );
    } else if (props.getSecondLevelElements) {
      props.setSelectedLastLevelElements((prev) =>
        getFirstLevelCheckboxStatus(firstLevelElement) === "unchecked"
          ? [...prev, ...props.getSecondLevelElements(firstLevelElement)]
          : prev.filter(
              (p) =>
                !props.getSecondLevelElements(firstLevelElement).includes(p)
            )
      );
    } else {
      props.setSelectedLastLevelElements((prev) =>
        prev.includes(firstLevelElement)
          ? prev.filter((p) => p != firstLevelElement)
          : [...prev, firstLevelElement]
      );
    }
  };

  const getFirstLevelCheckboxStatus = (
    firstLevelElement: FirstLevelType
  ): CheckboxState => {
    if (props.getSecondLevelElements) {
      const secondLevelElementStates: CheckboxState[] = props
        .getSecondLevelElements(firstLevelElement)
        .map((secondLevelElement) =>
          getSecondLevelCheckboxStatus(secondLevelElement)
        );
      if (secondLevelElementStates.every((state) => state === "checked")) {
        return "checked";
      }
      if (secondLevelElementStates.every((state) => state === "unchecked")) {
        return "unchecked";
      }
      return "indeterminate";
    } else {
      return props.selectedLastLevelElements.includes(firstLevelElement)
        ? "checked"
        : "unchecked";
    }
  };

  const clickSecondLevelCheckbox = (secondLevelElement: SecondLevelType) => {
    if (props.getFourthLevelElements) {
      const fourthLevelElements: FourthLevelType[] = props
        .getThirdLevelElements(secondLevelElement)
        .flatMap((thirdLevelElement) =>
          props.getFourthLevelElements(thirdLevelElement)
        );
      props.setSelectedLastLevelElements((prev) =>
        getSecondLevelCheckboxStatus(secondLevelElement) === "unchecked"
          ? [...prev, ...fourthLevelElements]
          : prev.filter((p) => !fourthLevelElements.includes(p))
      );
    } else if (props.getThirdLevelElements) {
      props.setSelectedLastLevelElements((prev) =>
        getSecondLevelCheckboxStatus(secondLevelElement) === "unchecked"
          ? [...prev, ...props.getThirdLevelElements(secondLevelElement)]
          : prev.filter(
              (p) =>
                !props.getThirdLevelElements(secondLevelElement).includes(p)
            )
      );
    } else {
      props.setSelectedLastLevelElements((prev) =>
        prev.includes(secondLevelElement)
          ? prev.filter((p) => p != secondLevelElement)
          : [...prev, secondLevelElement]
      );
    }
  };

  const getSecondLevelCheckboxStatus = (
    secondLevelElement: SecondLevelType
  ): CheckboxState => {
    if (props.getThirdLevelElements) {
      const thirdLevelElementStates: CheckboxState[] = props
        .getThirdLevelElements(secondLevelElement)
        .map((thirdLevelElement) =>
          getThirdLevelCheckboxStatus(thirdLevelElement)
        );
      if (thirdLevelElementStates.every((state) => state === "checked")) {
        return "checked";
      }
      if (thirdLevelElementStates.every((state) => state === "unchecked")) {
        return "unchecked";
      }
      return "indeterminate";
    } else {
      return props.selectedLastLevelElements.includes(secondLevelElement)
        ? "checked"
        : "unchecked";
    }
  };

  const clickThirdLevelCheckbox = (thirdLevelElement: ThirdLevelType) => {
    if (props.getFourthLevelElements) {
      props.setSelectedLastLevelElements((prev) =>
        getThirdLevelCheckboxStatus(thirdLevelElement) === "unchecked"
          ? [...prev, ...props.getFourthLevelElements(thirdLevelElement)]
          : prev.filter(
              (p) =>
                !props.getFourthLevelElements(thirdLevelElement).includes(p)
            )
      );
    } else {
      props.setSelectedLastLevelElements((prev) =>
        prev.includes(thirdLevelElement)
          ? prev.filter((p) => p != thirdLevelElement)
          : [...prev, thirdLevelElement]
      );
    }
  };

  const getThirdLevelCheckboxStatus = (
    thirdLevelElement: ThirdLevelType
  ): CheckboxState => {
    if (props.getFourthLevelElements) {
      const fourthLevelElementStates: CheckboxState[] = props
        .getFourthLevelElements(thirdLevelElement)
        .map((fourthLevelElement) =>
          getFourthLevelCheckboxStatus(fourthLevelElement)
        );
      if (fourthLevelElementStates.every((state) => state === "checked")) {
        return "checked";
      }
      if (fourthLevelElementStates.every((state) => state === "unchecked")) {
        return "unchecked";
      }
      return "indeterminate";
    } else {
      return props.selectedLastLevelElements.includes(thirdLevelElement)
        ? "checked"
        : "unchecked";
    }
  };

  const clickFourthLevelCheckbox = (fourthLevelElement: FourthLevelType) => {
    props.setSelectedLastLevelElements((prev) =>
      prev.includes(fourthLevelElement)
        ? prev.filter((p) => p != fourthLevelElement)
        : [...prev, fourthLevelElement]
    );
  };

  const getFourthLevelCheckboxStatus = (
    fourthLevelElement: FourthLevelType
  ): CheckboxState => {
    return props.selectedLastLevelElements.includes(fourthLevelElement)
      ? "checked"
      : "unchecked";
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
          <ListItemButton
            onClick={() => clickFirstLevelCheckbox(firstLevelElement)}
            disableGutters
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Checkbox
                checked={
                  getFirstLevelCheckboxStatus(firstLevelElement) === "checked"
                }
                indeterminate={
                  getFirstLevelCheckboxStatus(firstLevelElement) ===
                  "indeterminate"
                }
                sx={{ p: 0, pl: 1, pr: 1 }}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary={
                props.firstLevelLabels
                  ? props.firstLevelLabels[firstLevelElement]
                  : firstLevelElement
              }
            />
            {props.getSecondLevelElements &&
              (openFirstLevel.includes(firstLevelElement) ? (
                <IconButton
                  sx={{ p: 0, mr: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFirstLevel((prev) =>
                      prev.filter((p) => p != firstLevelElement)
                    );
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
          {props.getSecondLevelElements && (
            <Collapse
              in={openFirstLevel.includes(firstLevelElement)}
              timeout="auto"
              unmountOnExit
            >
              <List dense disablePadding sx={{ pl: 1 }}>
                {props
                  .getSecondLevelElements(firstLevelElement)
                  .map((secondLevelElement) => (
                    <Fragment key={secondLevelElement}>
                      <ListItemButton
                        onClick={() =>
                          clickSecondLevelCheckbox(secondLevelElement)
                        }
                        disableGutters
                      >
                        <ListItemIcon sx={{ minWidth: 0 }}>
                          <Checkbox
                            checked={
                              getSecondLevelCheckboxStatus(
                                secondLevelElement
                              ) === "checked"
                            }
                            indeterminate={
                              getSecondLevelCheckboxStatus(
                                secondLevelElement
                              ) === "indeterminate"
                            }
                            sx={{ p: 0, pl: 1, pr: 1 }}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            props.secondLevelLabels
                              ? props.secondLevelLabels[secondLevelElement]
                              : secondLevelElement
                          }
                        />
                        {props.getThirdLevelElements &&
                          (openSecondLevel.includes(secondLevelElement) ? (
                            <IconButton
                              sx={{ p: 0, mr: 2 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenSecondLevel((prev) =>
                                  prev.filter((p) => p != secondLevelElement)
                                );
                              }}
                            >
                              <ExpandLess />
                            </IconButton>
                          ) : (
                            <IconButton
                              sx={{ p: 0, mr: 2 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenSecondLevel((prev) => [
                                  ...prev,
                                  secondLevelElement,
                                ]);
                              }}
                            >
                              <ExpandMore />
                            </IconButton>
                          ))}
                      </ListItemButton>
                      {props.getThirdLevelElements && (
                        <Collapse
                          in={openSecondLevel.includes(secondLevelElement)}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List dense disablePadding sx={{ pl: 1 }}>
                            {props
                              .getThirdLevelElements(secondLevelElement)
                              .map((thirdLevelElement) => (
                                <Fragment key={thirdLevelElement}>
                                  <ListItemButton
                                    onClick={() =>
                                      clickThirdLevelCheckbox(thirdLevelElement)
                                    }
                                    disableGutters
                                  >
                                    <ListItemIcon sx={{ minWidth: 0 }}>
                                      <Checkbox
                                        checked={
                                          getThirdLevelCheckboxStatus(
                                            thirdLevelElement
                                          ) === "checked"
                                        }
                                        indeterminate={
                                          getThirdLevelCheckboxStatus(
                                            thirdLevelElement
                                          ) === "indeterminate"
                                        }
                                        sx={{ p: 0, pl: 1, pr: 1 }}
                                        disableRipple
                                      />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        props.thirdLevelLabels
                                          ? props.thirdLevelLabels[
                                              thirdLevelElement
                                            ]
                                          : thirdLevelElement
                                      }
                                    />
                                    {props.getFourthLevelElements &&
                                      (openThirdLevel.includes(
                                        thirdLevelElement
                                      ) ? (
                                        <IconButton
                                          sx={{ p: 0, mr: 2 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenThirdLevel((prev) =>
                                              prev.filter(
                                                (p) => p != thirdLevelElement
                                              )
                                            );
                                          }}
                                        >
                                          <ExpandLess />
                                        </IconButton>
                                      ) : (
                                        <IconButton
                                          sx={{ p: 0, mr: 2 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenThirdLevel((prev) => [
                                              ...prev,
                                              thirdLevelElement,
                                            ]);
                                          }}
                                        >
                                          <ExpandMore />
                                        </IconButton>
                                      ))}
                                  </ListItemButton>
                                  {props.getFourthLevelElements && (
                                    <Collapse
                                      in={openThirdLevel.includes(
                                        thirdLevelElement
                                      )}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <List dense disablePadding sx={{ pl: 1 }}>
                                        {props
                                          .getFourthLevelElements(
                                            thirdLevelElement
                                          )
                                          .map((fourthLevelElement) => (
                                            <ListItemButton
                                              key={fourthLevelElement}
                                              onClick={() =>
                                                clickFourthLevelCheckbox(
                                                  fourthLevelElement
                                                )
                                              }
                                              disableGutters
                                            >
                                              <ListItemIcon
                                                sx={{ minWidth: 0 }}
                                              >
                                                <Checkbox
                                                  checked={
                                                    getFourthLevelCheckboxStatus(
                                                      fourthLevelElement
                                                    ) === "checked"
                                                  }
                                                  sx={{ p: 0, pl: 1, pr: 1 }}
                                                  disableRipple
                                                />
                                              </ListItemIcon>
                                              <ListItemText
                                                primary={
                                                  props.fourthLevelLabels
                                                    ? props.fourthLevelLabels[
                                                        fourthLevelElement
                                                      ]
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

interface NestedCheckboxListProps<
  FirstLevelType extends string,
  SecondLevelType extends string,
  ThirdLevelType extends string,
  FourthLevelType extends string
> {
  selectedLastLevelElements: (
    | FirstLevelType
    | SecondLevelType
    | ThirdLevelType
    | FourthLevelType
  )[];
  setSelectedLastLevelElements:
    | React.Dispatch<React.SetStateAction<FirstLevelType[]>>
    | React.Dispatch<React.SetStateAction<SecondLevelType[]>>
    | React.Dispatch<React.SetStateAction<ThirdLevelType[]>>
    | React.Dispatch<React.SetStateAction<FourthLevelType[]>>;
  firstLevelElements: readonly FirstLevelType[];
  firstLevelLabels?: Record<FirstLevelType, String>;
  getSecondLevelElements?: (
    firstLevelElement: FirstLevelType
  ) => SecondLevelType[];
  secondLevelLabels?: Record<SecondLevelType, String>;
  getThirdLevelElements?: (
    secondLevelElement: SecondLevelType
  ) => ThirdLevelType[];
  thirdLevelLabels?: Record<ThirdLevelType, String>;
  getFourthLevelElements?: (
    thirdLevelElement: ThirdLevelType
  ) => FourthLevelType[];
  fourthLevelLabels?: Record<FourthLevelType, String>;
  height: number;
}

export default NestedCheckboxList;
