/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DThemeWhite } from "../d-theme-white";
import { DThemeWhiteDropdown } from "../d-theme-white-dropdown";
import { loadThemeWhiteMenu } from "./load-theme-white-menu";

export const loadThemeWhiteDropdown = () => {
	DThemeWhite.set( "DDropdown", DThemeWhiteDropdown );
	loadThemeWhiteMenu();
};
