/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { EShape } from "../e-shape";
import { EShapeRuntime, EShapeRuntimeReset } from "../e-shape-runtime";
import { EShapeActionExpression } from "./e-shape-action-runtime";
import { EShapeActionRuntimeConditional } from "./e-shape-action-runtime-conditional";
import { EShapeActionValueChangeText } from "./e-shape-action-value-change-text";

const textDefault = () => "";

export class EShapeActionRuntimeChangeTextText extends EShapeActionRuntimeConditional {
	protected text: EShapeActionExpression<string>;

	constructor( value: EShapeActionValueChangeText ) {
		super( value, EShapeRuntimeReset.TEXT );
		this.text = this.toExpression( value.value, textDefault, `""` );
	}

	execute( shape: EShape, runtime: EShapeRuntime, time: number ): void {
		if( !! this.condition( shape, time ) ) {
			shape.text.value = String(this.text( shape, time ));
			runtime.written |= this.reset;
		}
	}
}
