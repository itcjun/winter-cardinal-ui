/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DAlignHorizontal } from "../../d-align-horizontal";
import { DAlignVertical } from "../../d-align-vertical";
import { DBaseStateSet } from "../../d-base-state-set";
import { DCoordinatePosition, DCoordinateSize } from "../../d-coordinate";
import { DThemeSliderValue } from "../../d-slider-value";
import { DThemeWhiteTextBase } from "./d-theme-white-text-base";

export class DThemeWhiteSliderValue extends DThemeWhiteTextBase implements DThemeSliderValue {
	getX(): DCoordinatePosition {
		return "CENTER";
	}

	getY(): DCoordinatePosition {
		return "CENTER";
	}

	getWidth(): DCoordinateSize {
		return "AUTO";
	}

	getHeight(): DCoordinateSize {
		return 20;
	}

	getBackgroundColor( state: DBaseStateSet ): number | null {
		if ( state.inDisabled ) {
			return 0xAAAAAA;
		}
		return 0x3399FF;
	}

	getBorderColor( state: DBaseStateSet ): number | null {
		return null;
	}

	getColor( state: DBaseStateSet ): number {
		return 0xffffff;
	}

	getTextAlignHorizontal(): DAlignHorizontal {
		return DAlignHorizontal.CENTER;
	}

	getTextAlignVertical(): DAlignVertical {
		return DAlignVertical.TOP;
	}

	getPrecision(): number {
		return 0;
	}
}
