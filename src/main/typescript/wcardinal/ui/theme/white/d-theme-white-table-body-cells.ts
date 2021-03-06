/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseStateSet } from "../../d-base-state-set";
import { DBorderMask } from "../../d-border-mask";
import { DCoordinateSize } from "../../d-coordinate";
import { DCornerMask } from "../../d-corner-mask";
import { DTableCellState } from "../../d-table-cell-state";
import { UtilRgb } from "../../util/util-rgb";
import { DThemeWhiteConstants } from "./d-theme-white-constants";
import { DThemeWhiteFont } from "./d-theme-white-font";

export class DThemeWhiteTableBodyCells {
	protected static readonly IMAGE_TINT_COLOR_FOCUSED = UtilRgb.darken( DThemeWhiteConstants.WEAK_HIGHLIGHT_COLOR, 0.1 );
	protected static readonly BACKGROUND_COLOR_EVEN = DThemeWhiteConstants.BACKGROUND_COLOR_ON_BOARD;
	protected static readonly BACKGROUND_COLOR_ODD = UtilRgb.darken(
		DThemeWhiteConstants.BACKGROUND_COLOR_ON_BOARD, 0.01
	);
	protected static readonly WEAK_STRONG_HIGHLIGHT_COLOR = UtilRgb.darken(
		DThemeWhiteConstants.WEAK_HIGHLIGHT_BLENDED_ON_BOARD, 0.025
	);
	protected static readonly BORDER_COLOR = UtilRgb.darken(
		DThemeWhiteConstants.BACKGROUND_COLOR_ON_BOARD, 0.035
	);

	static getBackgroundColor( state: DBaseStateSet ): number | null {
		if( state.inDisabled ) {
			if( state.is( DTableCellState.FROZEN ) ) {
				return state.onAlternated ?
					this.BACKGROUND_COLOR_EVEN : this.BACKGROUND_COLOR_ODD;
			} else {
				return null;
			}
		} else if( state.isInvalid ) {
			return DThemeWhiteConstants.INVALID_BLENDED_ON_BOARD;
		} else if( state.underActive ) {
			return DThemeWhiteConstants.HIGHLIGHT_BLENDED_ON_BOARD;
		} else if( state.isFocused && (state.onHovered || state.isHovered) ) {
			return this.WEAK_STRONG_HIGHLIGHT_COLOR;
		} else if( state.isFocused || (state.onHovered || state.isHovered) ) {
			return DThemeWhiteConstants.WEAK_HIGHLIGHT_BLENDED_ON_BOARD;
		} else {
			if( state.is( DTableCellState.FROZEN ) ) {
				return state.onAlternated ?
					this.BACKGROUND_COLOR_EVEN : this.BACKGROUND_COLOR_ODD;
			} else {
				return null;
			}
		}
	}

	static getBackgroundAlpha( state: DBaseStateSet ): number {
		return 1;
	}

	static getBorderColor( state: DBaseStateSet ): number | null {
		return this.BORDER_COLOR;
	}

	static getBorderAlign( state: DBaseStateSet ): number {
		return 0;
	}

	static getBorderMask( state: DBaseStateSet ): DBorderMask {
		if( state.is( DTableCellState.END ) ) {
			return DBorderMask.ALL;
		} else {
			return DBorderMask.NOT_RIGHT;
		}
	}

	static getColor( state: DBaseStateSet ): number {
		return DThemeWhiteFont.getColor( state );
	}

	static getAlpha( state: DBaseStateSet ): number {
		if( ! state.inDisabled ) {
			return DThemeWhiteFont.getAlpha( state );
		}
		return 0;
	}

	static getImageTintColor( state: DBaseStateSet, isActive?: boolean ): number | null {
		if( state.inDisabled || state.inReadOnly || ! (state.isActive || isActive) ) {
			if( state.isFocused ) {
				return this.IMAGE_TINT_COLOR_FOCUSED;
			} else {
				return DThemeWhiteConstants.WEAK_HIGHLIGHT_COLOR;
			}
		} else {
			return DThemeWhiteConstants.HIGHLIGHT_COLOR;
		}
	}

	static getOutlineAlign( state: DBaseStateSet ): number {
		return -2;
	}

	static getHeight(): DCoordinateSize {
		return "padding";
	}

	static getCornerMask(): DCornerMask {
		return DCornerMask.ALL;
	}
}
