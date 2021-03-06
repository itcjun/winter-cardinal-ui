/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseStateSet } from "../../d-base-state-set";
import { DThemeInputText } from "../../d-input-text";
import { DStateAwareOrValueMightBe } from "../../d-state-aware";
import { DThemeDarkInput } from "./d-theme-dark-input";

export class DThemeDarkInputText extends DThemeDarkInput implements DThemeInputText {
	newTextValue(): DStateAwareOrValueMightBe<string> {
		return "";
	}

	getTextValue( state: DBaseStateSet ): string {
		return "";
	}
}
