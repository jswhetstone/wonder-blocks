// @flow

import * as React from "react";
import type {ClickableState} from "@khanacademy/wonder-blocks-clickable";

import typeof ActionItem from "../components/action-item";
import typeof OptionItem from "../components/option-item";
import typeof SeparatorItem from "../components/separator-item";

//TODO: rename into something more descriptive
export type Item =
    | false
    | React.Element<ActionItem | OptionItem | SeparatorItem>;

export type DropdownItem = {|
    component: React.Element<ActionItem | OptionItem | SeparatorItem>,
    focusable: boolean,
    populatedProps: any,
    // extra props used by DropdownCore
    onClick?: () => mixed,
    ref?: any,
    role?: string,
|};

// Custom opener arguments
export type OpenerProps = {|
    ...ClickableState,
    text: string,
|};
