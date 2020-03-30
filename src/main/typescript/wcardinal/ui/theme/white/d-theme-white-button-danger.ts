/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseState } from "../../d-base-state";
import { DBaseStates } from "../../d-base-states";
import { DThemeWhiteButtonBase } from "./d-theme-white-button-base";
import { DThemeWhiteConstants } from "./d-theme-white-constants";

export class DThemeWhiteButtonDanger extends DThemeWhiteButtonBase {
	constructor() {
		super( 0xff5566, 0.1, 0.2 );
	}

	getBackgroundColor( state: DBaseState ): number | null {
		if( DBaseStates.isDisabled( state ) ) {
			return null;
		} else if( DBaseStates.isPressed( state ) || DBaseStates.isActive( state ) ) {
			return this.BACKGROUND_COLOR_PRESSED;
		} else if( DBaseStates.isFocused( state ) || DBaseStates.isHovered( state ) ) {
			return this.BACKGROUND_COLOR_HOVERED;
		} else {
			return this.BACKGROUND_COLOR;
		}
	}

	getBorderColor( state: DBaseState ): number | null {
		if( DBaseStates.isDisabled( state ) ) {
			return DThemeWhiteConstants.BORDER_COLOR;
		} else {
			return null;
		}
	}

	getColor( state: DBaseState ): number {
		if( DBaseStates.isDisabled( state ) ) {
			return super.getColor( state );
		} else {
			return 0xffffff;
		}
	}
}
