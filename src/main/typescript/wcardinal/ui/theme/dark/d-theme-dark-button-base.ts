/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DAlignHorizontal } from "../../d-align-horizontal";
import { DBaseState } from "../../d-base-state";
import { DBaseStates } from "../../d-base-states";
import { DThemeButtonBase } from "../../d-button-base";
import { DCoordinateSize } from "../../d-coordinate";
import { UtilRgb } from "../../util/util-rgb";
import { DThemeDarkConstants } from "./d-theme-dark-constants";
import { DThemeDarkImageBase } from "./d-theme-dark-image-base";

export class DThemeDarkButtonBase extends DThemeDarkImageBase implements DThemeButtonBase {
	protected readonly BACKGROUND_COLOR: number;
	protected readonly BACKGROUND_COLOR_HOVERED: number;
	protected readonly BACKGROUND_COLOR_PRESSED: number;

	constructor( backgrouncColor: number = 0x484848, hover: number = 0.017, pressed: number = 0.034 ) {
		super();
		this.BACKGROUND_COLOR = backgrouncColor;
		this.BACKGROUND_COLOR_HOVERED = UtilRgb.brighten( this.BACKGROUND_COLOR, hover );
		this.BACKGROUND_COLOR_PRESSED = UtilRgb.brighten( this.BACKGROUND_COLOR, pressed );
	}

	getBackgroundColor( state: DBaseState ): number | null {
		if( DBaseStates.isDisabled( state ) ) {
			return null;
		} else if( DBaseStates.isActive( state ) ) {
			return DThemeDarkConstants.HIGHLIGHT_COLOR;
		} else if( DBaseStates.isPressed( state ) ) {
			return this.BACKGROUND_COLOR_PRESSED;
		} else if( DBaseStates.isFocused( state ) || DBaseStates.isHovered( state ) ) {
			return this.BACKGROUND_COLOR_HOVERED;
		} else {
			return this.BACKGROUND_COLOR;
		}
	}

	getColor( state: DBaseState ): number {
		if( DBaseStates.isDisabled( state ) || ! DBaseStates.isActive( state ) ) {
			return super.getColor( state );
		} else {
			return 0x000000;
		}
	}

	getBorderColor( state: DBaseState ): number | null {
		if( DBaseStates.isDisabled( state ) ) {
			return DThemeDarkConstants.BORDER_COLOR;
		} else {
			return null;
		}
	}

	getHeight(): DCoordinateSize {
		return 30;
	}

	getWidth(): DCoordinateSize {
		return 100;
	}

	getTextAlignHorizontal(): DAlignHorizontal {
		return DAlignHorizontal.CENTER;
	}

	getPaddingLeft(): number {
		return 10;
	}

	getPaddingRight(): number {
		return 10;
	}

	isToggle(): boolean {
		return false;
	}
}
