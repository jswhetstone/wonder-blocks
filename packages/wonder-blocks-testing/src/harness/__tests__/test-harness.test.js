// @flow
import {jest as ws} from "@khanacademy/wonder-stuff-testing";
import * as MTH from "../make-test-harness";
import {DefaultAdapters, DefaultConfigs} from "../adapters/adapters";

jest.mock("../make-test-harness", () => {
    const returnValueFake = {
        thisisa: "PRETEND REACT COMPONENT",
    };
    const harnessFake = jest.fn().mockReturnValue(returnValueFake);
    return {
        harnessFake,
        returnValueFake,
        makeTestHarness: jest.fn().mockReturnValue(harnessFake),
    };
});

describe("#testHarness", () => {
    it("should be created by calling makeTestHarness with the DefaultAdapters and DefaultConfigs", async () => {
        // Arrange
        const makeTestHarnessSpy = jest.spyOn(MTH, "makeTestHarness");

        // Act
        await ws.isolateModules(() => import("../hook-harness"));

        // Assert
        expect(makeTestHarnessSpy).toHaveBeenCalledWith(
            DefaultAdapters,
            DefaultConfigs,
        );
    });

    it("should invoke the function made by makeTestHarness", async () => {
        // Arrange
        const Component = () => null;
        const config = {
            router: "/boo",
        };
        // $FlowIgnore[prop-missing]  - we add this into our mock at the top.
        const [{harnessFake}, {testHarness}] = await ws.isolateModules(() =>
            Promise.all([
                import("../make-test-harness"),
                import("../test-harness"),
            ]),
        );

        // Act
        testHarness(Component, config);

        // Assert
        expect(harnessFake).toHaveBeenCalledWith(Component, config);
    });

    it("should return the returned value of the function made by makeTestHarness", async () => {
        // Arrange
        const Component = () => null;
        const config = {
            router: "/boo",
        };
        // $FlowIgnore[prop-missing]  - we add this into our mock at the top.
        const [{returnValueFake}, {testHarness}] = await ws.isolateModules(() =>
            Promise.all([
                import("../make-test-harness"),
                import("../test-harness"),
            ]),
        );

        // Act
        const result = testHarness(Component, config);

        // Assert
        expect(result).toBe(returnValueFake);
    });
});
