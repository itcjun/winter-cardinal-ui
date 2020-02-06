/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseState } from "./d-base-state";
import { DInputReal, DInputRealOptions, DThemeInputReal } from "./d-input-real";
import { DTableBodyCell, DTableBodyCellOptions } from "./d-table-body-cell";
import { DTableColumn } from "./d-table-column";

export interface DTableBodyCellInputRealOptions<
	ROW = unknown,
	THEME extends DThemeInputReal = DThemeInputReal
> extends DInputRealOptions<THEME>, DTableBodyCellOptions<ROW> {
}

export interface DThemeTableBodyCellInputReal extends DThemeInputReal {

}

export class DTableBodyCellInputReal<
	ROW = unknown,
	THEME extends DThemeTableBodyCellInputReal = DThemeTableBodyCellInputReal,
	OPTIONS extends DTableBodyCellInputRealOptions<ROW, THEME> = DTableBodyCellInputRealOptions<ROW, THEME>
> extends DInputReal<THEME, OPTIONS> implements DTableBodyCell<ROW> {
	protected _row?: ROW;
	protected _rowIndex!: number;
	protected _columnIndex!: number;
	protected _columnData!: DTableColumn<ROW>;

	constructor( options: OPTIONS ) {
		super( options );
	}

	protected init( options: OPTIONS ) {
		super.init( options );
		this._rowIndex = 0;
		this._columnIndex = options.column.index;
		this._columnData = options.column.data;
		this.on( "change", ( newValue: unknown, oldValue: unknown ): void => {
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
		this.text = Number( value );
	}

	unset(): void {
		this._row = undefined;
	}

	protected getType(): string {
		return "DTableBodyCellInputReal";
	}
}
