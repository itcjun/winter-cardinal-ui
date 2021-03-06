/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseStateSet } from "../../d-base-state-set";
import { DCoordinateSize } from "../../d-coordinate";
import { DThemeScrollBarThumb } from "../../d-scroll-bar-thumb";
import { UtilRgb } from "../../util/util-rgb";
import { DThemeWhiteBase } from "./d-theme-white-base";
import { DThemeWhiteConstants } from "./d-theme-white-constants";

export class DThemeWhiteScrollBarThumb extends DThemeWhiteBase implements DThemeScrollBarThumb {
	COLOR = UtilRgb.darken( DThemeWhiteConstants.WEAK_HIGHLIGHT_COLOR, 0.25 );

	getBackgroundColor( state: DBaseStateSet ): number {
		if( state.isHovered || state.isDragging ) {
			return DThemeWhiteConstants.HIGHLIGHT_COLOR;
		} else {
			return this.COLOR;
		}
	}

	getBackgroundAlpha( state: DBaseStateSet ): number {
		if( state.isHovered || state.isDragging ) {
			return 1.0;
		} else {
			return DThemeWhiteConstants.WEAK_HIGHLIGHT_ALPHA;
		}
	}

	getBorderColor( state: DBaseStateSet ): number | null {
		return null;
	}

	getBorderAlpha( state: DBaseStateSet ): number {
		return 0;
	}

	getBorderWidth( state: DBaseStateSet ): number {
		return 1;
	}

	getWidth(): DCoordinateSize {
		return 13;
	}

	getHeight(): DCoordinateSize {
		return 13;
	}

	getMinimumSize(): number {
		return 16;
	}
}
