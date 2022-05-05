// @flow
import * as React from "react";

import type {CSSProperties} from "aphrodite";

import type {Adapter} from "../types.js";

type Config =
    | string
    | Array<string>
    | CSSProperties
    | {|
          classes: Array<string>,
          style: CSSProperties,
      |};

// The default configuration is to omit this adapter.
export const defaultConfig: ?Config = null;

const normalizeConfig = (
    config: Config,
): {|classes: Array<string>, style: CSSProperties|} => {
    if (typeof config === "string") {
        return {classes: [config], style: ({}: $Shape<CSSProperties>)};
    }

    if (Array.isArray(config)) {
        return {classes: config, style: ({}: $Shape<CSSProperties>)};
    }

    if (typeof config === "object") {
        if (config.classes != null && config.style != null) {
            // This is a heuristic check and by nature isn't perfect.
            // So we have to tell flow to just accept it.
            // $FlowIgnore[prop-missing]
            return config;
        }

        // Again, since the previous check is heuristic, so is this outcome
        // and so we still have to assure flow everything is OK.
        // $FlowIgnore[prop-missing]
        return {classes: [], style: config};
    }

    throw new Error(`Invalid config: ${config}`);
};

/**
 * Test harness adapter for adding CSS to the harnessed component wrapper.
 */
export const adapter: Adapter<Config> = (
    children: React.Node,
    config: Config,
): React.Element<any> => {
    const {classes, style} = normalizeConfig(config);
    return (
        <div
            data-test-id="css-adapter-container"
            className={classes.join(" ")}
            style={style}
        >
            {children}
        </div>
    );
};
