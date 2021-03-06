/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DCoordinateSize } from "../../d-coordinate";
import { DThemeSliderVertical } from "../../d-slider-vertical";
import { DThemeWhiteSlider } from "./d-theme-white-slider";

export class DThemeWhiteSliderVertical extends DThemeWhiteSlider implements DThemeSliderVertical {
	getHeight(): DCoordinateSize {
		return 322;
	}

	getWidth(): DCoordinateSize {
		return 35;
	}
}
