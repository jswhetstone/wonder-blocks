import * as React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {View} from "@khanacademy/wonder-blocks-core";
import Button from "@khanacademy/wonder-blocks-button";

import {fireEvent} from "@storybook/testing-library";
import Popover from "../popover";
import PopoverContent from "../popover-content";
import {PopoverContentCore} from "../../index";

describe("Popover", () => {
    it("should set the anchor as the popover ref", async () => {
        // Arrange
        const ref: React.RefObject<HTMLButtonElement> = React.createRef();

        render(
            <Popover
                placement="top"
                content={<PopoverContent title="Title" content="content" />}
            >
                {({open}: any) => (
                    <button data-anchor onClick={open} ref={ref}>
                        Open default popover
                    </button>
                )}
            </Popover>,
        );

        // Act

        // Assert
        await waitFor(() => {
            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        });
    });

    it("should hide the popover dialog by default", () => {
        // Arrange, Act
        render(
            <Popover
                placement="top"
                content={<PopoverContent title="Title" content="content" />}
            >
                {({open}: any) => (
                    <button data-anchor onClick={open}>
                        Open default popover
                    </button>
                )}
            </Popover>,
        );

        // Assert
        expect(screen.queryByText("Title")).not.toBeInTheDocument();
    });

    it("should render the popover content after clicking the trigger", () => {
        // Arrange
        render(
            <Popover
                placement="top"
                content={<PopoverContent title="Title" content="content" />}
            >
                {({open}: any) => (
                    <button data-anchor onClick={open}>
                        Open default popover
                    </button>
                )}
            </Popover>,
        );

        // Act
        userEvent.click(screen.getByRole("button"));

        // Assert
        expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("should close the popover from inside the content", () => {
        // Arrange
        const onCloseMock = jest.fn();

        render(
            <Popover
                placement="top"
                onClose={onCloseMock}
                content={({close}: any) => (
                    <PopoverContentCore>
                        <span>custom popover</span>
                        <button data-close-button onClick={close}>
                            close popover
                        </button>
                    </PopoverContentCore>
                )}
            >
                {({open}: any) => (
                    <button data-anchor onClick={open}>
                        Open default popover
                    </button>
                )}
            </Popover>,
        );

        // open the popover
        userEvent.click(screen.getByRole("button"));

        // Act
        // we try to close it from inside the content
        userEvent.click(screen.getByRole("button", {name: "close popover"}));

        // Assert
        expect(screen.queryByText("Title")).not.toBeInTheDocument();
        expect(onCloseMock).toBeCalled();
    });

    it("should close the Popover using the default close button", () => {
        // Arrange
        const onCloseMock = jest.fn();

        render(
            <Popover
                placement="top"
                onClose={onCloseMock}
                content={
                    <PopoverContent
                        title="Title"
                        content="content"
                        closeButtonVisible={true}
                        closeButtonLabel="Click to close popover"
                    />
                }
            >
                {({open}: any) => (
                    <button data-anchor onClick={open}>
                        Open default popover
                    </button>
                )}
            </Popover>,
        );

        // open the popover
        userEvent.click(screen.getByRole("button"));

        // Act
        // we try to close it using the default close button
        userEvent.click(
            screen.getByRole("button", {name: "Click to close popover"}),
        );

        // Assert
        expect(screen.queryByText("Title")).not.toBeInTheDocument();
        expect(onCloseMock).toBeCalled();
    });

    it("should shift-tab back to the anchor after popover is closed", async () => {
        // Arrange
        const PopoverComponent = () => {
            const [opened, setOpened] = React.useState(true);
            return (
                <View>
                    <Popover
                        opened={opened}
                        onClose={() => {
                            setOpened(false);
                        }}
                        content={({close}) => (
                            <PopoverContent
                                title="Controlled popover"
                                content="This popover is controlled programatically."
                                actions={
                                    <Button
                                        onClick={() => {
                                            close();
                                        }}
                                    >
                                        Click to close the popover
                                    </Button>
                                }
                            />
                        )}
                    >
                        <Button>Anchor element</Button>
                    </Popover>
                    <Button onClick={() => setOpened(true)}>
                        Outside button (click here to re-open the popover)
                    </Button>
                </View>
            );
        };

        render(<PopoverComponent />);

        // Act
        const closeButton = screen.getByRole("button", {
            name: "Click to close the popover",
        });
        closeButton.click();

        // At this point, the focus returns to the anchor element

        // Shift-tab over to the document body
        userEvent.tab({shift: true});

        // Shift-tab over to the outside button
        userEvent.tab({shift: true});

        // Shift-tab over to the anchor element
        userEvent.tab({shift: true});

        // Assert
        const anchorButton = screen.getByRole("button", {
            name: "Anchor element",
        });
        expect(anchorButton).toHaveFocus();
    });

    it("should close the popover when pressing Enter on the close button", async () => {
        // Arrange
        render(
            <Popover
                placement="top"
                onClose={jest.fn()}
                content={
                    <PopoverContent
                        title="Title"
                        content="content"
                        closeButtonVisible={true}
                        closeButtonLabel="Click to close popover"
                    />
                }
            >
                <Button onClick={jest.fn()}>Open default popover</Button>
            </Popover>,
        );

        // open the popover by focusing on the trigger element
        userEvent.tab();
        userEvent.keyboard("{enter}");

        // Act
        // Close the popover by pressing Enter on the close button.
        // NOTE: we need to use fireEvent here because userEvent doesn't support
        // keyUp/Down events and we use these handlers to override the default
        // behavior of the button.
        // eslint-disable-next-line testing-library/prefer-user-event
        fireEvent.keyDown(
            screen.getByRole("button", {name: "Click to close popover"}),
            {key: "Enter", code: "Enter", charCode: 13},
        );
        // eslint-disable-next-line testing-library/prefer-user-event
        fireEvent.keyDown(
            screen.getByRole("button", {name: "Click to close popover"}),
            {key: "Enter", code: "Enter", charCode: 13},
        );
        // eslint-disable-next-line testing-library/prefer-user-event
        fireEvent.keyUp(
            screen.getByRole("button", {name: "Click to close popover"}),
            {key: "Enter", code: "Enter", charCode: 13},
        );

        // Assert
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    describe("return focus", () => {
        it("should return focus to the trigger element by default", async () => {
            // Arrange
            render(
                <Popover
                    dismissEnabled={true}
                    content={
                        <PopoverContent
                            closeButtonVisible={true}
                            title="Returning focus to a specific element"
                            content='After dismissing the popover, the focus will be set on the button labeled "Focus here after close."'
                        />
                    }
                >
                    <Button>Open popover</Button>
                </Popover>,
            );

            const anchorButton = screen.getByRole("button", {
                name: "Open popover",
            });

            // open the popover
            userEvent.click(anchorButton);
            await screen.findByRole("dialog");

            // Act
            const closeButton = screen.getByRole("button", {
                name: "Close Popover",
            });
            closeButton.click();

            // Assert
            expect(anchorButton).toHaveFocus();
        });

        it("should return focus to a specific element if closedFocusId is set", async () => {
            // Arrange
            render(
                <View>
                    <Button id="button-to-focus-on">
                        Focus here after close
                    </Button>
                    <Popover
                        closedFocusId="button-to-focus-on"
                        dismissEnabled={true}
                        content={
                            <PopoverContent
                                closeButtonVisible={true}
                                title="Returning focus to a specific element"
                                content='After dismissing the popover, the focus will be set on the button labeled "Focus here after close."'
                            />
                        }
                    >
                        <Button>Open popover</Button>
                    </Popover>
                </View>,
            );

            const anchorButton = screen.getByRole("button", {
                name: "Open popover",
            });

            // open the popover
            userEvent.click(anchorButton);
            await screen.findByRole("dialog");

            // Act
            const closeButton = screen.getByRole("button", {
                name: "Close Popover",
            });
            closeButton.click();

            // Assert
            const buttonToFocusOn = screen.getByRole("button", {
                name: "Focus here after close",
            });
            expect(buttonToFocusOn).toHaveFocus();
        });
    });

    describe("dismissEnabled", () => {
        it("should close the Popover if dismissEnabled is set", async () => {
            // Arrange
            render(
                <Popover
                    dismissEnabled={true}
                    placement="top"
                    content={<PopoverContent title="Title" content="content" />}
                >
                    {({open}: any) => (
                        <button data-anchor onClick={open}>
                            Open default popover
                        </button>
                    )}
                </Popover>,
            );

            // open the popover
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Act
            // we try to close it using the same trigger element
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Assert
            await waitFor(() => {
                expect(screen.queryByText("Title")).not.toBeInTheDocument();
            });
        });

        it("should return focus to the anchor element when pressing Esc", async () => {
            // Arrange
            render(
                <Popover
                    dismissEnabled={true}
                    placement="top"
                    content={<PopoverContent title="Title" content="content" />}
                >
                    {({open}: any) => (
                        <button data-anchor onClick={open}>
                            Open default popover
                        </button>
                    )}
                </Popover>,
            );

            // open the popover
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Act
            // we try to close it pressing the Escape key
            userEvent.keyboard("{esc}");

            // Assert
            expect(
                screen.getByRole("button", {name: "Open default popover"}),
            ).toHaveFocus();
        });

        it("should return focus to the anchor element when clicking outside", async () => {
            // Arrange
            const {container} = render(
                <Popover
                    dismissEnabled={true}
                    placement="top"
                    content={<PopoverContent title="Title" content="content" />}
                >
                    {({open}: any) => (
                        <button data-anchor onClick={open}>
                            Open default popover
                        </button>
                    )}
                </Popover>,
            );

            // open the popover
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Act
            // we try to close it clicking outside the popover
            userEvent.click(container);
            // NOTE: We need to click twice because the first click is handled
            // by the trigger element.
            userEvent.click(container);

            // Assert
            expect(
                screen.getByRole("button", {name: "Open default popover"}),
            ).toHaveFocus();
        });

        it("should NOT return focus to the anchor element when clicking on an interactive element", async () => {
            // Arrange
            render(
                <View>
                    <Popover
                        dismissEnabled={true}
                        placement="top"
                        content={
                            <PopoverContent title="Title" content="content" />
                        }
                    >
                        {({open}: any) => (
                            <button data-anchor onClick={open}>
                                Open default popover
                            </button>
                        )}
                    </Popover>
                    <Button>Next button outside</Button>
                </View>,
            );

            // open the popover
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Act
            // we try to close it clicking outside the popover
            userEvent.click(
                screen.getByRole("button", {name: "Next button outside"}),
            );

            // Assert
            // The focus should remain on the button outside the popover
            expect(
                screen.getByRole("button", {name: "Next button outside"}),
            ).toHaveFocus();
        });
    });

    describe("a11y", () => {
        it("should announce a popover correctly by reading the title contents", async () => {
            // Arrange
            render(
                <Popover
                    onClose={jest.fn()}
                    content={
                        <PopoverContent
                            title="The title is read by the screen reader"
                            content="content"
                            closeButtonVisible={true}
                            closeButtonLabel="Click to close popover"
                        />
                    }
                >
                    <Button>Open default popover</Button>
                </Popover>,
            );

            // Act
            // Open the popover
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Assert
            expect(
                screen.getByRole("dialog", {
                    name: "The title is read by the screen reader",
                }),
            ).toBeInTheDocument();
        });

        it("should announce a custom popover correctly by reading the title contents", async () => {
            // Arrange
            render(
                <Popover
                    onClose={jest.fn()}
                    id="custom-popover"
                    content={
                        <PopoverContentCore closeButtonVisible={true}>
                            <h1 id="custom-popover-title">
                                This is a custom popover title
                            </h1>
                            <p id="custom-popover-content">
                                The custom popover description
                            </p>
                        </PopoverContentCore>
                    }
                >
                    <Button>Open default popover</Button>
                </Popover>,
            );

            // Act
            // Open the popover
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Assert
            expect(
                screen.getByRole("dialog", {
                    name: "This is a custom popover title",
                }),
            ).toBeInTheDocument();
        });
    });

    describe("keyboard navigation", () => {
        it("should move focus to the first focusable element after popover is open", async () => {
            // Arrange
            render(
                <>
                    <Button>Prev focusable element outside</Button>
                    <Popover
                        onClose={jest.fn()}
                        content={
                            <PopoverContent
                                title="Popover title"
                                content="content"
                                actions={
                                    <>
                                        <Button>Button 1 inside popover</Button>
                                        <Button>Button 2 inside popover</Button>
                                    </>
                                }
                            />
                        }
                    >
                        <Button>Open default popover</Button>
                    </Popover>
                    <Button>Next focusable element outside</Button>
                </>,
            );

            // Focus on the first element outside the popover
            userEvent.tab();
            // open the popover by focusing on the trigger element
            userEvent.tab();
            userEvent.keyboard("{enter}");

            // Act
            // Wait for the popover to be open.
            await screen.findByRole("dialog");

            // Assert
            // Focus should move to the first button inside the popover
            expect(
                screen.getByRole("button", {
                    name: "Button 1 inside popover",
                }),
            ).toHaveFocus();
        });

        it("should allow flowing focus correctly even if the popover remains open", async () => {
            // Arrange
            render(
                <>
                    <Button>Prev focusable element outside</Button>
                    <Popover
                        onClose={jest.fn()}
                        content={
                            <PopoverContent
                                title="Popover title"
                                content="content"
                                actions={<Button>Button inside popover</Button>}
                            />
                        }
                    >
                        <Button>Open default popover</Button>
                    </Popover>
                    <Button>Next focusable element outside</Button>
                </>,
            );

            // Focus on the first element outside the popover
            userEvent.tab();
            // open the popover by focusing on the trigger element
            userEvent.tab();
            userEvent.keyboard("{enter}");

            // Wait for the popover to be open.
            await screen.findByRole("dialog");

            // Act
            // Focus on the next element after the popover
            userEvent.tab();

            // Assert
            expect(
                screen.getByRole("button", {
                    name: "Next focusable element outside",
                }),
            ).toHaveFocus();
        });

        it("should allow circular navigation when the popover is open", async () => {
            // Arrange
            render(
                <>
                    <Button>Prev focusable element outside</Button>
                    <Popover
                        onClose={jest.fn()}
                        content={
                            <PopoverContent
                                title="Popover title"
                                content="content"
                                actions={<Button>Button inside popover</Button>}
                            />
                        }
                    >
                        <Button>Open default popover</Button>
                    </Popover>
                    <Button>Next focusable element outside</Button>
                </>,
            );

            // Focus on the first element outside the popover
            userEvent.tab();
            // open the popover by focusing on the trigger element
            userEvent.tab();
            userEvent.keyboard("{enter}");

            // Wait for the popover to be open.
            await screen.findByRole("dialog");

            // Focus on the next element after the popover
            userEvent.tab();

            // Focus on the document body
            userEvent.tab();

            // Act
            // Focus again on the first element in the document.
            userEvent.tab();

            // Assert
            expect(
                screen.getByRole("button", {
                    name: "Prev focusable element outside",
                }),
            ).toHaveFocus();
        });

        it("should allow navigating backwards when the popover is open", async () => {
            // Arrange
            render(
                <>
                    <Button>Prev focusable element outside</Button>
                    <Popover
                        onClose={jest.fn()}
                        content={
                            <PopoverContent
                                title="Popover title"
                                content="content"
                                actions={<Button>Button inside popover</Button>}
                            />
                        }
                    >
                        <Button>Open default popover</Button>
                    </Popover>
                    <Button>Next focusable element outside</Button>
                </>,
            );

            // Open the popover
            userEvent.click(
                screen.getByRole("button", {name: "Open default popover"}),
            );

            // Wait for the popover to be open.
            await screen.findByRole("dialog");

            // At this point, the focus moves to the focusable element inside
            // the popover, so we need to move the focus back to the trigger
            // element.
            userEvent.tab({shift: true});

            // Focus on the first element in the document
            userEvent.tab({shift: true});

            // Focus on the document body
            userEvent.tab({shift: true});

            // Focus on the last element in the document
            userEvent.tab({shift: true});

            // Act
            // Focus again on element inside the popover.
            userEvent.tab({shift: true});

            // Assert
            expect(
                screen.getByRole("button", {
                    name: "Button inside popover",
                }),
            ).toHaveFocus();
        });
    });
});
