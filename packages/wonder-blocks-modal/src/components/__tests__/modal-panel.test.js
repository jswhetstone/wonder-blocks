// @flow
import * as React from "react";
import {render, screen} from "@testing-library/react";

import expectRenderError from "../../../../../utils/testing/expect-render-error.js";
import ModalPanel from "../modal-panel.js";
import ModalContext from "../modal-context.js";

describe("ModalPanel", () => {
    test("ModalContext.Provider and onClose should warn", () => {
        expectRenderError(
            <ModalContext.Provider value={{closeModal: () => {}}}>
                <ModalPanel
                    content="Hello, world"
                    onClose={() => {}}
                    closeButtonVisible={true}
                />
            </ModalContext.Provider>,
            "You've specified 'onClose' on a modal when using ModalLauncher.  Please specify 'onClose' on the ModalLauncher instead",
        );
    });

    test("testId should be added to the panel wrapper", () => {
        // Arrange
        render(<ModalPanel content="dummy content" testId="test-id" />);

        // Act

        // Assert
        expect(screen.getByTestId("test-id-panel")).toBeInTheDocument();
    });

    test("testId should be added to the CloseButton element", () => {
        // Arrange
        render(<ModalPanel content="dummy content" testId="test-id" />);

        // Act
        const closeButton = screen.getByLabelText("Close modal");

        // Assert
        expect(closeButton).toHaveAttribute("data-test-id", "test-id-close");
    });
});
