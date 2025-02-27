/* eslint-disable no-constant-condition */
/* eslint-disable max-lines */
import * as React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {ngettext} from "@khanacademy/wonder-blocks-i18n";

import OptionItem from "../option-item";
import MultiSelect from "../multi-select";
import {defaultLabels as builtinLabels} from "../../util/constants";

import type {Labels} from "../multi-select";

const defaultLabels: Labels = {
    ...builtinLabels,
    selectAllLabel: (numOptions: any) => `Select all (${numOptions})`,
    noneSelected: "Choose",
    someSelected: (numSelectedValues: any) =>
        numSelectedValues > 1 ? `${numSelectedValues} students` : "1 student",
    allSelected: "All students",
};

describe("MultiSelect", () => {
    beforeEach(() => {
        window.scrollTo = jest.fn();

        // We mock console.error() because React logs a bunch of errors pertaining
        // to the use href="javascript:void(0);".
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        // @ts-expect-error [FEI-5019] - TS2339 - Property 'mockClear' does not exist on type '{ (options?: ScrollToOptions | undefined): void; (x: number, y: number): void; } & { (options?: ScrollToOptions | undefined): void; (x: number, y: number): void; }'.
        window.scrollTo.mockClear();
        jest.spyOn(console, "error").mockReset();
    });

    describe("uncontrolled", () => {
        const onChange = jest.fn();
        const uncontrolledMultiSelect = (
            <MultiSelect
                onChange={onChange}
                selectedValues={[]}
                labels={defaultLabels}
            >
                <OptionItem label="item 1" value="1" />
                <OptionItem label="item 2" value="2" />
                <OptionItem label="item 3" value="3" />
                {false ? <OptionItem label="item 4" value="4" /> : null}
            </MultiSelect>
        );

        it("opens the select on mouse click", () => {
            // Arrange
            render(uncontrolledMultiSelect);

            // Act
            userEvent.click(screen.getByRole("button"));

            // Assert
            expect(screen.getByRole("listbox")).toBeInTheDocument();
        });

        it("closes the select on {escape}", () => {
            // Arrange
            render(uncontrolledMultiSelect);

            userEvent.tab();
            userEvent.keyboard("{enter}"); // open

            // Act
            userEvent.keyboard("{escape}");

            // Assert
            expect(onChange).not.toHaveBeenCalled();
            expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        });

        it("displays correct text for opener", () => {
            // Arrange
            render(uncontrolledMultiSelect);

            // Act
            const opener = screen.getByRole("button");

            // Assert
            // No items are selected, display placeholder because there is one
            expect(opener).toHaveTextContent("Choose");
        });

        it("displays correct text for opener when there's one item selected", () => {
            // Arrange

            // Act
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={["1"]}
                    labels={defaultLabels}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Assert
            expect(screen.getByRole("button")).toHaveTextContent("item 1");
        });

        it("displays correct text for opener when there's one custom item selected", () => {
            // Arrange

            // Act
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={["1"]}
                    labels={defaultLabels}
                >
                    <OptionItem label={<div>custom item 1</div>} value="1" />
                    <OptionItem label={<div>custom item 2</div>} value="2" />
                    <OptionItem label={<div>custom item 3</div>} value="3" />
                </MultiSelect>,
            );

            // Assert
            expect(screen.getByRole("button")).toHaveTextContent("1 student");
        });

        it("displays correct text for opener when an invalid selection is provided", () => {
            // Arrange

            // Act
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={["not-found"]}
                    labels={defaultLabels}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Assert
            expect(screen.getByRole("button")).toHaveTextContent("Choose");
        });

        it("displays correct text for opener when there's more than one item selected", () => {
            // Arrange

            // Act
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={["1", "2"]}
                    labels={defaultLabels}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Assert
            // More than one item is selected, display n itemTypes
            expect(screen.getByRole("button")).toHaveTextContent("2 students");
        });

        it("displays correct text for opener when all items are selected", () => {
            // Arrange

            // Act
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={["1", "2", "3"]}
                    labels={defaultLabels}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Assert
            // All items are selected
            expect(screen.getByRole("button")).toHaveTextContent(
                "All students",
            );
        });

        it("displays All selected text when no items is selected for opener with implicitAllEnabled", () => {
            // Arrange

            // Act
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={[]}
                    labels={defaultLabels}
                    implicitAllEnabled={true}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Assert
            expect(screen.getByRole("button")).toHaveTextContent(
                "All students",
            );
        });

        it("verifies testId is added to the opener", () => {
            // Arrange
            render(
                <MultiSelect
                    selectedValues={["2"]}
                    onChange={onChange}
                    testId="some-test-id"
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByRole("button");

            // Assert
            expect(opener).toHaveAttribute("data-test-id", "some-test-id");
        });
    });

    describe("Controlled component", () => {
        type Props = {
            opened?: boolean;
            onToggle?: (opened: boolean) => unknown;
            shortcuts?: boolean;
        };

        const labels: Labels = {
            ...builtinLabels,
            selectAllLabel: (numOptions: any) => `Select all (${numOptions})`,
            allSelected: "All fruits",
            someSelected: (numSelectedValues: any) =>
                `${numSelectedValues} fruits`,
        };

        const ControlledComponent = function (
            props: Props,
        ): React.ReactElement {
            const [opened, setOpened] = React.useState(props.opened ?? false);
            const [selectedValues, setSelectedValues] = React.useState([]);

            const handleToggleMenu = (opened: any) => {
                setOpened(opened);
                props.onToggle?.(opened);
            };

            const handleChange = (newValues: any) => {
                setSelectedValues(newValues);
            };

            return (
                <React.Fragment>
                    <MultiSelect
                        labels={labels}
                        onChange={handleChange}
                        opened={opened}
                        onToggle={handleToggleMenu}
                        testId="multi-select-opener"
                        selectedValues={selectedValues}
                        shortcuts={props.shortcuts}
                    >
                        <OptionItem label="item 1" value="1" />
                        <OptionItem label="item 2" value="2" />
                        <OptionItem label="item 3" value="3" />
                    </MultiSelect>
                    <button
                        data-test-id="parent-button"
                        onClick={() => handleToggleMenu(true)}
                    />
                </React.Fragment>
            );
        };

        it("opens the menu when the parent updates its state", () => {
            // Arrange
            const onToggleMock = jest.fn();
            render(<ControlledComponent onToggle={onToggleMock} />);

            // Act
            userEvent.click(screen.getByTestId("parent-button"));

            // Assert
            expect(onToggleMock).toHaveBeenCalledWith(true);
        });

        it("closes the menu when the parent updates its state", () => {
            // Arrange
            const onToggleMock = jest.fn();
            render(<ControlledComponent onToggle={onToggleMock} />);

            // Act
            // open the menu from the outside
            userEvent.click(screen.getByTestId("parent-button"));
            // click on the opener
            userEvent.click(screen.getByTestId("multi-select-opener"));

            // Assert
            expect(onToggleMock).toHaveBeenCalledTimes(2);
            expect(onToggleMock).toHaveBeenNthCalledWith(1, true);
            expect(onToggleMock).toHaveBeenNthCalledWith(2, false);
        });

        it("should still allow the opener to open the menu", () => {
            // Arrange
            const onToggleMock = jest.fn();
            render(<ControlledComponent onToggle={onToggleMock} />);

            // Act
            // click on the opener
            userEvent.click(screen.getByTestId("multi-select-opener"));

            // Assert
            expect(onToggleMock).toHaveBeenCalledWith(true);
        });

        it("opens the menu when the anchor is clicked once", () => {
            // Arrange
            render(<ControlledComponent />);

            // Act
            userEvent.click(screen.getByTestId("multi-select-opener"));

            // Assert
            expect(screen.getByRole("listbox")).toBeInTheDocument();
        });

        it("closes the menu when the anchor is clicked", () => {
            // Arrange
            render(<ControlledComponent />);

            // Act
            // open the menu from the outside
            userEvent.click(screen.getByTestId("parent-button"));
            // click on the dropdown anchor to hide the menu
            userEvent.click(screen.getByTestId("multi-select-opener"));

            // Assert
            expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        });

        it("selects on item as expected", () => {
            // Arrange
            render(<ControlledComponent />);

            const opener = screen.getByTestId("multi-select-opener");
            userEvent.click(opener);

            // Act
            // Grab the second item in the list
            const item = screen.getByRole("option", {
                name: "item 2",
            });
            userEvent.click(item, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Assert
            expect(item).toHaveAttribute("aria-selected", "true");
            expect(opener).toHaveTextContent("item 2");
        });

        it("dropdown menu is still open after selection", () => {
            // Arrange
            const onToggleMock = jest.fn();
            render(<ControlledComponent onToggle={onToggleMock} />);

            const opener = screen.getByTestId("multi-select-opener");
            userEvent.click(opener);

            // Act
            // Grab the second item in the list
            const item = screen.getByRole("option", {
                name: "item 2",
            });
            userEvent.click(item, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Assert
            expect(onToggleMock).toHaveBeenCalledTimes(1);
        });

        it("selects two items as expected", () => {
            // Arrange
            render(<ControlledComponent />);

            const opener = screen.getByTestId("multi-select-opener");
            userEvent.click(opener);

            // Act
            // Select the second and third items in the list
            const secondOption = screen.getByText("item 2");
            userEvent.click(secondOption, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });
            const thirdOption = screen.getByText("item 3");
            userEvent.click(thirdOption, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Assert
            expect(opener).toHaveTextContent("2 fruits");

            // // Select none of the items
            // const selectNone = select.find(ActionItem).at(1);
            // selectNone.simulate("mousedown");
            // selectNone.simulate("mouseup", nativeEvent);
            // selectNone.simulate("click");
            // expect(allChanges.pop().length).toEqual(0)
        });

        it("selects two items, then unselect one as expected", () => {
            // Arrange
            const onToggleMock = jest.fn();
            render(<ControlledComponent onToggle={onToggleMock} />);

            const opener = screen.getByTestId("multi-select-opener");
            userEvent.click(opener);

            // Select the second and third items in the list
            const secondOption = screen.getByText("item 2");
            userEvent.click(secondOption, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });
            const thirdOption = screen.getByText("item 3");
            userEvent.click(thirdOption, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Act
            // Unselect the first item selected
            userEvent.click(secondOption, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Assert
            expect(opener).toHaveTextContent("item 3");
        });

        it("selects all the enabled items when the 'All items' shortcut is selected", () => {
            // Arrange
            const ControlledMultiSelect = function (
                props: Props,
            ): React.ReactElement {
                const [selectedValues, setSelectedValues] = React.useState([]);
                const handleChange = (newValues: any) => {
                    setSelectedValues(newValues);
                };

                return (
                    <MultiSelect
                        labels={labels}
                        onChange={handleChange}
                        opened={props.opened}
                        onToggle={props.onToggle}
                        selectedValues={selectedValues}
                        shortcuts={true}
                    >
                        <OptionItem label="item 1" value="1" />
                        {/* The second option item shouldn't be selectable */}
                        <OptionItem label="item 2" value="2" disabled={true} />
                        <OptionItem label="item 3" value="3" />
                    </MultiSelect>
                );
            };

            render(<ControlledMultiSelect />);

            const opener = screen.getByRole("button");
            userEvent.click(opener);

            // Act
            // Select all of the items
            const selectAll = screen.getByRole("option", {name: /Select all/i});
            userEvent.click(selectAll);

            // Assert
            expect(opener).toHaveTextContent("All fruits");
        });

        it("selects all the items when the 'All items' shortcut is selected", () => {
            // Arrange
            render(<ControlledComponent shortcuts={true} />);

            const opener = screen.getByTestId("multi-select-opener");
            userEvent.click(opener);

            // Act
            // Select all of the items
            const selectAll = screen.getByText(/Select all/i);
            userEvent.click(selectAll, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Assert
            expect(opener).toHaveTextContent("All fruits");
        });

        it("deselects all the items when the 'Select none' shortcut is selected", () => {
            // Arrange
            render(<ControlledComponent shortcuts={true} />);

            const opener = screen.getByTestId("multi-select-opener");
            userEvent.click(opener);

            // First, select all of the items
            const selectAll = screen.getByText(/Select all/i);
            userEvent.click(selectAll, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Act
            const selectNone = screen.getByText(/Select none/i);
            userEvent.click(selectNone, undefined, {
                skipPointerEventsCheck: true, // Popper compatibility
            });

            // Assert
            expect(opener).toHaveTextContent("0 items");
        });
    });

    describe("isFilterable", () => {
        const onChange = jest.fn();

        const filterableMultiSelect = (
            <MultiSelect
                onChange={onChange}
                selectedValues={[]}
                labels={defaultLabels}
                isFilterable={true}
            >
                <OptionItem label="item 1" value="1" />
                <OptionItem label="item 2" value="2" />
                <OptionItem label="item 3" value="3" />
                {false ? <OptionItem label="item 4" value="4" /> : null}
            </MultiSelect>
        );

        it("displays SearchTextInput when isFilterable is true", () => {
            // Arrange
            render(filterableMultiSelect);
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            // Act
            const searchInput = screen.getByPlaceholderText("Filter");

            // Assert
            expect(searchInput).toBeInTheDocument();
        });

        it("displays SearchTextInput with dismiss button when search text exists", () => {
            // Arrange
            render(filterableMultiSelect);
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            const searchInput = screen.getByPlaceholderText("Filter");

            // Act
            userEvent.type(searchInput, "text");

            // Assert
            expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
        });

        it("filters the items by the search input (case insensitive)", () => {
            // Arrange
            render(filterableMultiSelect);
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            const searchInput = screen.getByPlaceholderText("Filter");

            // Act
            userEvent.type(searchInput, "Item 1");

            // Assert
            expect(screen.getAllByRole("option")).toHaveLength(1);
        });

        it("Allows selecting all the enabled items", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={() => {}}
                    selectedValues={[]}
                    labels={defaultLabels}
                    shortcuts={true}
                >
                    <OptionItem label="item 1" value="1" />
                    {/* The second option item shouldn't be selectable */}
                    <OptionItem label="item 2" value="2" disabled={true} />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Act
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            // Assert
            expect(
                screen.getByRole("option", {name: "Select all (2)"}),
            ).toBeInTheDocument();
        });

        it("Hides shortcuts when there are any text in search text input", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={[]}
                    labels={defaultLabels}
                    isFilterable={true}
                    shortcuts={true}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                </MultiSelect>,
            );
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            const searchInput = screen.getByPlaceholderText("Filter");

            // Act
            userEvent.type(searchInput, "2");

            // Assert
            expect(screen.queryByText(/Select all/i)).not.toBeInTheDocument();
        });

        it("should focus on the search input after opening the dropdown", () => {
            // Arrange
            render(filterableMultiSelect);
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            // Act
            const searchInput = screen.getByPlaceholderText("Filter");

            // Assert
            expect(searchInput).toHaveFocus();
        });

        it("Selected items are at the top of the items when isFilterable is true", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={["3"]}
                    labels={defaultLabels}
                    isFilterable={true}
                    shortcuts={true}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Act
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            // Assert
            expect(screen.getByRole("listbox")).toHaveTextContent(
                /item 3.*item 1.*item 2/i,
            );
        });

        it("Type something in SearchTextInput should update searchText in MultiSelect", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={[]}
                    labels={defaultLabels}
                    isFilterable={true}
                    shortcuts={true}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            userEvent.click(screen.getByRole("button"));

            const searchInput = screen.getByPlaceholderText("Filter");
            userEvent.paste(searchInput, "Item 2");

            // Act
            userEvent.clear(searchInput);
            userEvent.paste(searchInput, "Item 1");

            // Assert
            const options = screen.getAllByRole("option");
            expect(options).toHaveLength(1);
            expect(options[0]).toHaveTextContent("item 1");
        });

        it("should move focus to the dismiss button after pressing {tab} on the text input", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={onChange}
                    selectedValues={["1"]}
                    labels={defaultLabels}
                    isFilterable={true}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            const searchInput = screen.getByPlaceholderText("Filter");
            userEvent.paste(searchInput, "some text");

            // Act
            userEvent.tab();

            // Assert
            const dismissBtn = screen.getByLabelText("Clear search");
            expect(dismissBtn).toHaveFocus();
        });

        it("Click dismiss button should clear the searchText in MultiSelect", () => {
            // Arrange
            render(filterableMultiSelect);
            // open the dropdown menu
            userEvent.click(screen.getByRole("button"));

            const searchInput = screen.getByPlaceholderText("Filter");
            userEvent.paste(searchInput, "Should be cleared");

            const dismissBtn = screen.getByLabelText("Clear search");

            // Act
            userEvent.click(dismissBtn);

            // Assert
            expect(searchInput).toHaveValue("");
        });

        it("Open MultiSelect should clear the searchText", () => {
            // Arrange
            render(filterableMultiSelect);
            // open the dropdown menu
            const opener = screen.getByRole("button");
            userEvent.click(opener);

            const searchInput = screen.getByPlaceholderText("Filter");
            userEvent.paste(searchInput, "Should be cleared");

            // Close the dropdown menu
            userEvent.click(opener);

            // Act
            // Reopen it
            userEvent.click(opener);

            // Assert
            expect(screen.getByPlaceholderText("Filter")).toHaveValue("");
        });

        it("should find an option after using the search filter", async () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                someSelected: (numOptions: number): string =>
                    ngettext("%(num)s planet", "%(num)s planets", numOptions),
            };

            render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    shortcuts={true}
                    labels={labels}
                    opened={true}
                >
                    <OptionItem label="Earth" value="earth" />
                    <OptionItem label="Venus" value="venus" />
                    <OptionItem label="Mars" value="mars" />
                </MultiSelect>,
            );

            // Act
            userEvent.paste(screen.getByRole("textbox"), "ear");

            // Assert
            const filteredOption = screen.getByRole("option", {
                name: "Earth",
            });
            expect(filteredOption).toBeInTheDocument();
        });

        it("should filter out an option if it's not part of the results", async () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                someSelected: (numOptions: number): string =>
                    ngettext("%(num)s planet", "%(num)s planets", numOptions),
            };

            render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    shortcuts={true}
                    labels={labels}
                    opened={true}
                >
                    <OptionItem label="Earth" value="earth" />
                    <OptionItem label="Venus" value="venus" />
                    <OptionItem label="Mars" value="mars" />
                </MultiSelect>,
            );

            // Act
            userEvent.paste(screen.getByRole("textbox"), "ear");

            // Assert
            const filteredOption = screen.queryByRole("option", {
                name: "Venus",
            });
            expect(filteredOption).not.toBeInTheDocument();
        });
    });

    describe("Custom Opener", () => {
        it("opens the menu when clicking on the custom opener", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    opener={(eventState: any) => (
                        <button aria-label="Search" onClick={jest.fn()} />
                    )}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByLabelText("Search");
            userEvent.click(opener);

            // Assert
            expect(screen.getByRole("listbox")).toBeInTheDocument();
        });

        it("calls the custom onClick handler", () => {
            // Arrange
            const onClickMock = jest.fn();

            render(
                <MultiSelect
                    onChange={jest.fn()}
                    opener={() => (
                        <button aria-label="Search" onClick={onClickMock} />
                    )}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByLabelText("Search");
            userEvent.click(opener);

            // Assert
            expect(onClickMock).toHaveBeenCalledTimes(1);
        });

        it("verifies testId is passed from the custom opener", () => {
            // Arrange
            const onChange = jest.fn();

            render(
                <MultiSelect
                    onChange={onChange}
                    opener={() => (
                        <button
                            data-test-id="custom-opener"
                            aria-label="Custom opener"
                        />
                    )}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByLabelText("Custom opener");

            // Assert
            expect(opener).toHaveAttribute("data-test-id", "custom-opener");
        });

        it("verifies testId is not passed from the parent element", () => {
            // Arrange
            const onChange = jest.fn();

            render(
                <MultiSelect
                    onChange={onChange}
                    testId="custom-opener"
                    opener={() => <button aria-label="Custom opener" />}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByLabelText("Custom opener");

            // Assert
            expect(opener).not.toHaveAttribute("data-test-id", "custom-opener");
        });

        it("passes the current label to the custom opener (no items selected)", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                noneSelected: "No items selected",
            };

            render(
                <MultiSelect
                    labels={labels}
                    testId="openTest"
                    onChange={jest.fn()}
                    opener={({text}: any) => (
                        <button
                            onClick={jest.fn()}
                            data-test-id="custom-opener"
                        >
                            {text}
                        </button>
                    )}
                >
                    <OptionItem label="item 1" value="1" />
                    <OptionItem label="item 2" value="2" />
                    <OptionItem label="item 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("custom-opener");

            // Assert
            expect(opener).toHaveTextContent("No items selected");
        });

        it("passes the current label to the custom opener (1 item selected)", () => {
            // Arrange
            const ControlledMultiSelect = () => {
                const [selected, setSelected] = React.useState([]);
                return (
                    <MultiSelect
                        testId="openTest"
                        onChange={(values: any) => {
                            setSelected(values);
                        }}
                        selectedValues={selected}
                        opener={({text}: any) => (
                            <button
                                onClick={jest.fn()}
                                data-test-id="custom-opener"
                            >
                                {text}
                            </button>
                        )}
                    >
                        <OptionItem label="item 1" value="1" />
                        <OptionItem label="item 2" value="2" />
                        <OptionItem label="item 3" value="3" />
                    </MultiSelect>
                );
            };

            render(<ControlledMultiSelect />);

            const opener = screen.getByTestId("custom-opener");
            // open dropdown
            userEvent.click(opener);

            // Act
            const option = screen.getByText("item 1");
            userEvent.click(option);

            // Assert
            expect(opener).toHaveTextContent("item 1");
        });

        it("passes the current label to the custom opener (2 items selected)", () => {
            // Arrange
            const ControlledMultiSelect = () => {
                const [selected, setSelected] = React.useState([]);
                return (
                    <MultiSelect
                        testId="openTest"
                        onChange={(values: any) => {
                            setSelected(values);
                        }}
                        selectedValues={selected}
                        opener={({text}: any) => (
                            <button
                                onClick={jest.fn()}
                                data-test-id="custom-opener"
                            >
                                {text}
                            </button>
                        )}
                    >
                        <OptionItem label="item 1" value="1" />
                        <OptionItem label="item 2" value="2" />
                        <OptionItem label="item 3" value="3" />
                    </MultiSelect>
                );
            };

            render(<ControlledMultiSelect />);

            const opener = screen.getByTestId("custom-opener");
            // open dropdown
            userEvent.click(opener);

            // Act
            userEvent.click(screen.getByText("item 1"));
            userEvent.click(screen.getByText("item 2"));

            // Assert
            expect(opener).toHaveTextContent("2 items");
        });

        it("passes the current label to the custom opener (all items selected)", () => {
            // Arrange
            const ControlledMultiSelect = () => {
                const [selected, setSelected] = React.useState([]);
                return (
                    <MultiSelect
                        testId="openTest"
                        onChange={(values: any) => {
                            setSelected(values);
                        }}
                        selectedValues={selected}
                        opener={({text}: any) => (
                            <button
                                onClick={jest.fn()}
                                data-test-id="custom-opener"
                            >
                                {text}
                            </button>
                        )}
                    >
                        <OptionItem label="item 1" value="1" />
                        <OptionItem label="item 2" value="2" />
                        <OptionItem label="item 3" value="3" />
                    </MultiSelect>
                );
            };

            render(<ControlledMultiSelect />);

            const opener = screen.getByTestId("custom-opener");
            // open dropdown
            userEvent.click(opener);

            // Act
            userEvent.click(screen.getByText("item 1"));
            userEvent.click(screen.getByText("item 2"));
            userEvent.click(screen.getByText("item 3"));

            // Assert
            expect(opener).toHaveTextContent("All items");
        });
    });

    describe("Custom labels", () => {
        it("passes the custom label to the opener", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                noneSelected: "0 escuelas",
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    testId="translated-multi-select"
                    labels={labels}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("translated-multi-select");

            // Assert
            expect(opener).toHaveTextContent("0 escuelas");
        });

        it("passes the custom label to the opener (2 items selected)", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                someSelected: (numSelectedValues: any) =>
                    `${numSelectedValues} escuelas`,
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    testId="translated-multi-select"
                    labels={labels}
                    selectedValues={["1", "2"]}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("translated-multi-select");

            // Assert
            expect(opener).toHaveTextContent("2 escuelas");
        });

        it("passes the custom label to the opener (all items selected)", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                allSelected: "Todas las escuelas",
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    testId="translated-multi-select"
                    labels={labels}
                    selectedValues={["1", "2", "3"]}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("translated-multi-select");

            // Assert
            expect(opener).toHaveTextContent("Todas las escuelas");
        });

        it("passes the custom label to the dismiss icon", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                clearSearch: "Limpiar busqueda",
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    testId="translated-multi-select"
                    labels={labels}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("translated-multi-select");
            // open dropdown
            userEvent.click(opener);
            // search text
            userEvent.type(screen.getByPlaceholderText("Filter"), "school");
            // get icon instance
            const dismissIcon = screen.getByLabelText("Limpiar busqueda");

            // Assert
            expect(dismissIcon).toBeInTheDocument();
        });

        it("passes the custom label to the search input field", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                filter: "Filtrar",
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    testId="translated-multi-select"
                    labels={labels}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("translated-multi-select");
            // open dropdown
            userEvent.click(opener);

            const searchInput = screen.getByPlaceholderText("Filtrar");

            // Assert
            expect(searchInput).toBeInTheDocument();
        });

        it("passes the custom label to the no results label", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                noResults: "No hay resultados",
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    testId="translated-multi-select"
                    labels={labels}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            const opener = screen.getByTestId("translated-multi-select");
            // open dropdown
            userEvent.click(opener);

            // Act
            userEvent.type(screen.getByPlaceholderText("Filter"), "other");

            // Assert
            expect(screen.getByText("No hay resultados")).toBeInTheDocument();
        });

        it("passes the custom label to the select all shortcut", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                selectAllLabel: (numOptions: any) =>
                    `Seleccionar todas las escuelas (${numOptions})`,
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    shortcuts={true}
                    testId="translated-multi-select"
                    labels={labels}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("translated-multi-select");
            // open dropdown
            userEvent.click(opener);

            // Assert
            expect(
                screen.getByText("Seleccionar todas las escuelas (3)"),
            ).toBeInTheDocument();
        });

        it("passes the custom label to the select none shortcut", () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                selectNoneLabel: "Deseleccionar todas las escuelas",
            };
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    shortcuts={true}
                    testId="translated-multi-select"
                    labels={labels}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Act
            const opener = screen.getByTestId("translated-multi-select");
            // open dropdown
            userEvent.click(opener);

            // Assert
            expect(
                screen.getByText("Deseleccionar todas las escuelas"),
            ).toBeInTheDocument();
        });

        it("verifies a custom label is updated when props change", () => {
            // Arrange
            const initialLabels: Labels = {
                ...defaultLabels,
                selectNoneLabel: "Deseleccionar todas las escuelas",
            };

            const TranslatedComponent = ({labels}: {labels: Labels}) => (
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    shortcuts={true}
                    labels={labels}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>
            );

            const {rerender} = render(
                <TranslatedComponent labels={initialLabels} />,
            );

            // update label value
            const updatedLabels: Labels = {
                ...defaultLabels,
                selectNoneLabel: "Ninguna seleccionada",
            };

            rerender(<TranslatedComponent labels={updatedLabels} />);

            // Act
            const opener = screen.getByRole("button");
            // open dropdown
            userEvent.click(opener);

            // Assert
            expect(
                screen.getByText(updatedLabels.selectNoneLabel),
            ).toBeInTheDocument();
        });

        describe("keyboard", () => {
            beforeEach(() => {
                // Required due to the `debounce` call.
                jest.useFakeTimers();
            });

            it("should find and focus an item using the keyboard", () => {
                // Arrange
                const onChangeMock = jest.fn();

                render(
                    <MultiSelect onChange={onChangeMock}>
                        <OptionItem label="Mercury" value="mercury" />
                        <OptionItem label="Venus" value="venus" />
                        <OptionItem label="Mars" value="mars" />
                    </MultiSelect>,
                );
                userEvent.tab();

                // Act
                // find first occurrence
                userEvent.keyboard("v");
                jest.advanceTimersByTime(501);

                // Assert
                const filteredOption = screen.getByRole("option", {
                    name: /Venus/i,
                });
                // Verify that the element found is focused.
                expect(filteredOption).toHaveFocus();
                // And also verify that the listbox is opened.
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });
        });
    });

    describe("a11y > Live region", () => {
        it("should announce the number of options when the listbox is open", async () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                someSelected: (numOptions: number): string =>
                    ngettext("%(num)s school", "%(num)s schools", numOptions),
            };

            // Act
            const {container} = render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    labels={labels}
                    opened={true}
                >
                    <OptionItem label="school 1" value="1" />
                    <OptionItem label="school 2" value="2" />
                    <OptionItem label="school 3" value="3" />
                </MultiSelect>,
            );

            // Assert
            expect(container).toHaveTextContent("3 schools");
        });

        it("should change the number of options after using the search filter", async () => {
            // Arrange
            const labels: Labels = {
                ...builtinLabels,
                someSelected: (numOptions: number): string =>
                    ngettext("%(num)s planet", "%(num)s planets", numOptions),
            };

            const {container} = render(
                <MultiSelect
                    onChange={jest.fn()}
                    isFilterable={true}
                    shortcuts={true}
                    labels={labels}
                    opened={true}
                >
                    <OptionItem label="Earth" value="earth" />
                    <OptionItem label="Venus" value="venus" />
                    <OptionItem label="Mars" value="mars" />
                </MultiSelect>,
            );

            // Act
            userEvent.paste(screen.getByRole("textbox"), "ear");

            // Assert
            expect(container).toHaveTextContent("1 planet");
        });
    });

    describe("error state styles", () => {
        it("should apply the error styles to the dropdown on hover", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    error={true}
                    testId="multiselect-error-hover"
                >
                    {[<OptionItem label="Banana" value="banana" />]}
                </MultiSelect>,
            );
            const dropdown = screen.getByTestId("multiselect-error-hover");

            // Act
            userEvent.hover(dropdown);

            // Assert
            expect(dropdown).toHaveStyle("border-color: #d92916");
            expect(dropdown).toHaveStyle("border-width: 2px");
        });

        it("should apply the error styles to the dropdown on mouse down", () => {
            // Arrange
            render(
                <MultiSelect
                    onChange={jest.fn()}
                    error={true}
                    testId="multiselect-error-active"
                >
                    {[<OptionItem label="Banana" value="banana" />]}
                </MultiSelect>,
            );
            const dropdown = screen.getByTestId("multiselect-error-active");

            // Act
            // eslint-disable-next-line testing-library/prefer-user-event
            fireEvent.mouseDown(dropdown);

            // Assert
            expect(dropdown).toHaveStyle("border-color: #d92916");
            expect(dropdown).toHaveStyle("border-width: 2px");
            expect(dropdown).toHaveStyle(
                "background-color: rgb(243, 187, 180)",
            );
        });
    });
});
