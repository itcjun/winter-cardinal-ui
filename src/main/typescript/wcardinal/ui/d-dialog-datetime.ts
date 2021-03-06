/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DDialogCommand, DDialogCommandOptions, DThemeDialogCommand } from "./d-dialog-command";
import { DLayoutVertical } from "./d-layout-vertical";
import { DPickerDatetime, DPickerDatetimeOptions } from "./d-picker-datetime";

export interface DDialogDatetimeOptions<
	THEME extends DThemeDialogDatetime = DThemeDialogDatetime
> extends DDialogCommandOptions<THEME> {
	picker?: DPickerDatetimeOptions;
}

export interface DThemeDialogDatetime extends DThemeDialogCommand {

}

export class DDialogDatetime<
	THEME extends DThemeDialogDatetime = DThemeDialogDatetime,
	OPTIONS extends DDialogDatetimeOptions<THEME> = DDialogDatetimeOptions<THEME>
> extends DDialogCommand<THEME, OPTIONS> {
	protected _picker!: DPickerDatetime;

	protected onInit( layout: DLayoutVertical, options?: OPTIONS ) {
		super.onInit( layout, options );

		const picker = new DPickerDatetime( options && options.picker );
		this._picker = picker;
		layout.addChild( picker );
	}

	get current(): Date {
		return this._picker.current;
	}

	set current( dateCurrent: Date ) {
		this._picker.current = dateCurrent;
	}

	get new(): Date {
		return this._picker.new;
	}

	set new( dateNew: Date ) {
		this._picker.new = dateNew;
	}

	get page(): Date {
		return this._picker.new;
	}

	set page( datePage: Date ) {
		this._picker.page = datePage;
	}

	get picker(): DPickerDatetime {
		return this._picker;
	}

	protected getType(): string {
		return "DDialogDatetime";
	}
}
