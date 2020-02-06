/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseState } from "./d-base-state";
import { DSelect, DSelectOptions, DThemeSelect } from "./d-select";
import { DTableBodyCell, DTableBodyCellOptions } from "./d-table-body-cell";
import { DTableColumn } from "./d-table-column";

export interface DTableBodyCellSelectMenuOptions<
	ROW = unknown,
	VALUE = unknown,
	THEME extends DThemeTableBodyCellSelectMenu = DThemeTableBodyCellSelectMenu
> extends DSelectOptions<VALUE, THEME>, DTableBodyCellOptions<ROW> {

}

export interface DThemeTableBodyCellSelectMenu extends DThemeSelect {

}

export class DTableBodyCellSelectMenu<
	ROW = unknown,
	VALUE = unknown,
	THEME extends DThemeTableBodyCellSelectMenu = DThemeTableBodyCellSelectMenu,
	OPTIONS extends DTableBodyCellSelectMenuOptions<ROW, VALUE, THEME> = DTableBodyCellSelectMenuOptions<ROW, VALUE, THEME>
> extends DSelect<VALUE, THEME, OPTIONS> implements DTableBodyCell<ROW> {
	protected _row?: ROW;
	protected _rowIndex!: number;
	protected _columnIndex!: number;
	protected _columnData!: DTableColumn<ROW>;

	constructor( options: OPTIONS ) {
		super( options );
	}

	protected init( options: OPTIONS ) {
		super.init( options );
		const column = options.column;
		this._rowIndex = 0;
		this._columnIndex = column.index;
		this._columnData = column.data;
		const selecting = column.data.selecting;
		const getter = selecting.getter;
		this.on( "change", ( newSelected: unknown, oldSelected: unknown ): void => {
			const newValue = getter( newSelected );
			const oldValue = getter( oldSelected );
			const row = this._row;
			if( row !== undefined ) {
				const rowIndex = this._rowIndex;
				const columnIndex = this._columnIndex;
				this._columnData.setter( row, rowIndex, newValue );
				this.emit( "cellchange", newValue, oldValue, row, rowIndex, columnIndex, this );
			}
		});
	}

	protected mergeState( stateLocal: DBaseState, stateParent: DBaseState ): DBaseState {
		return super.mergeState( stateLocal, stateParent ) |
			( stateParent & DBaseState.HOVERED ? DBaseState.HOVERED : DBaseState.NONE );
	}

	set( value: unknown, row: ROW, rowIndex: number ): void {
		this._row = row;
		this._rowIndex = rowIndex;
		if( this._isSyncEnabled ) {
			this.value = value as VALUE;
		} else {
			this.text = String( value );
		}
	}

	unset(): void {
		this._row = undefined;
	}

	protected getType(): string {
		return "DTableBodyCellSelectMenu";
	}
}
