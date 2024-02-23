import * as React from "react";
import {StyleSheet} from "aphrodite";
import {View, addStyle} from "@khanacademy/wonder-blocks-core";
import {color} from "@khanacademy/wonder-blocks-tokens";

import type {AriaProps, StyleType} from "@khanacademy/wonder-blocks-core";

const heights = {
    xsmall: 16,
    small: 24,
    medium: 48,
    large: 96,
} as const;

const colors = {
    light: color.white,
    dark: color.offBlack16,
} as const;

const StyledPath = addStyle("circle");

type Props = AriaProps & {
    /**
     * The size of the spinner. (large = 96px, medium = 48px, small = 24px,
     * xsmall = 16px)
     */
    size: "xsmall" | "small" | "medium" | "large";
    /** Should a light version of the spinner be shown?
     * (To be used on a dark background.)
     */
    light: boolean;
    /** make deterministic spinner with percentage complete
     * ( 0 to 100 )
     */
    progress?: number;
    /** Any (optional) styling to apply to the spinner container. */
    style?: StyleType;
    /**
     * Test ID used for e2e testing.
     */
    testId?: string;
};

type DefaultProps = {
    light: Props["light"];
    size: Props["size"];
};

/**
 * A circular progress spinner. Used for indicating loading progress. Should
 * be used by default in most places where a loading indicator is needed.
 *
 * ### Usage
 *
 * ```js
 * import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";
 *
 * <CircularSpinner />
 * ```
 */
export default class CircularSpinner extends React.Component<Props> {
    static defaultProps: DefaultProps = {
        size: "large",
        light: false,
    };

    render(): React.ReactNode {
        const {size, light, style, testId, progress} = this.props;

        const height = heights[size];
        const color = light ? colors.light : colors.dark;
        const hasProgress = progress !== undefined;

        const svg = (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={height}
                height={height}
                viewBox="0 0 100 100"
                data-test-id={testId}
            >
                <StyledPath
                    pathLength={100}
                    cx={50}
                    cy={50}
                    r={44}
                    style={[
                        styles.loadingSpinner,
                        // @ts-expect-error [FEI-5019]: `animationName` expects a string not an object.
                        {
                            animationName: hasProgress
                                ? undefined
                                : [rotateKeyFrames],
                            stroke: color,
                            strokeDashoffset: hasProgress ? 100 - progress : 25,
                            strokeWidth: height < 48 ? 12 : 8,
                        },
                    ]}
                />
            </svg>
        );

        return <View style={[styles.spinnerContainer, style]}>{svg}</View>;
    }
}

const rotateKeyFrames = {
    from: {
        transform: "rotate(0deg)",
    },
    to: {
        transform: "rotate(360deg)",
    },
} as const;

const styles = StyleSheet.create({
    spinnerContainer: {
        justifyContent: "center",
    },
    loadingSpinner: {
        fill: "transparent",
        strokeDasharray: "100 100",
        strokeDashoffset: 25,
        strokeLinecap: "round",
        transformOrigin: "center",
        transition: "stroke-dashoffset 500ms",
        animationDuration: "1.1s",
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
    },
});
