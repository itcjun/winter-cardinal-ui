/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseState } from "./d-base-state";
import { DButton, DButtonOptions, DThemeButton } from "./d-button";
import { DDialogDate, DDialogDateOptions } from "./d-dialog-date";
import { DDialogDates } from "./d-dialog-dates";
import { DTableBodyCell, DTableBodyCellOptions } from "./d-table-body-cell";
import { DTableColumn } from "./d-table-column";
import { isNumber } from "./util/is-number";

export interface DTableBodyCellDateOptions<
	ROW = unknown,
	THEME extends DThemeTableBodyCellDate = DThemeTableBodyCellDate
> extends DButtonOptions<Date, THEME>, DTableBodyCellOptions<ROW> {
	dialog?: DDialogDateOptions;
}

export interface DThemeTableBodyCellDate extends DThemeButton {
	getTextFormatter(): ( value: Date, caller: DTableBodyCellDate ) => string;
	getTextValue( state: DBaseState ): Date;
	newTextValue(): Date;
}

export class DTableBodyCellDate<
	ROW = unknown,
	THEME extends DThemeTableBodyCellDate = DThemeTableBodyCellDate,
	OPTIONS extends DTableBodyCellDateOptions<ROW, THEME> = DTableBodyCellDateOptions<ROW, THEME>
> extends DButton<Date, THEME, OPTIONS> implements DTableBodyCell {
	protected _dialog?: DDialogDate;
	protected _dialogOptions?: DDialogDateOptions;
	protected _columnIndex!: number;
	protected _columnData!: DTableColumn<ROW>;

	constructor( options: OPTIONS ) {
		super( options );
	}

	protected init( options: OPTIONS ) {
		super.init( options );

		this._dialogOptions = options.dialog;
		this._columnIndex = options.column.index;
		this._columnData = options.column.data;

		this.on( "active", (): void => {
			const currentTime = this._textValueComputed.getTime();
			const dialog = this.dialog;
			dialog.current = new Date( currentTime );
			dialog.new = new Date( currentTime );
			dialog.page = new Date( currentTime );
			dialog.open().then((): void => {
				const dialogNew = dialog.new;
				const dialogCurrent = dialog.current;
				this.text = new Date( dialogNew.getTime() );
				this.emit( "cellchange", dialogNew, dialogCurrent, this._columnIndex, this._columnData );
			});
		});
	}

	protected mergeState( stateLocal: DBaseState, stateParent: DBaseState ): DBaseState {
		return super.mergeState( stateLocal, stateParent ) |
			( stateParent & DBaseState.HOVERED ? DBaseState.HOVERED : DBaseState.NONE );
	}

	get dialog(): DDialogDate {
		let dialog = this._dialog;
		if( dialog == null ) {
			const dialogOptions = this._dialogOptions;
			if( dialogOptions != null ) {
				dialog = new DDialogDate( this._dialogOptions );
			} else {
				dialog = DDialogDates.getInstance();
			}
			this._dialog = dialog;
		}
		return dialog;
	}

	set( value: unknown, rowIndex: number, columnIndex: number, forcibly?: boolean ): void {
		if( value instanceof Date ) {
			if( forcibly ) {
				this._textValue = value;
				this._textValueComputed = value;
				this.onTextChange();
				this.createOrUpdateText();
			} else {
				this.text = value;
			}
		} else if( isNumber( value ) ) {
			const textValueComputed = this._textValueComputed;
			if( textValueComputed.getTime() !== value ) {
				textValueComputed.setTime( value );
				this.onTextChange();
				this.createOrUpdateText();
			}
		}
	}

	unset(): void {
		// DO NOTHING
	}

	protected getType(): string {
		return "DTableBodyCellDate";
	}
}
