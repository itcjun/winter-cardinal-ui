/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rectangle } from "pixi.js";
import { DBase } from "./d-base";
import { DBaseState } from "./d-base-state";
import { DLayoutHorizontal, DLayoutHorizontalOptions, DThemeLayoutHorizontal } from "./d-layout-horizontal";
import { DTableState } from "./d-table-state";

export interface DTableRowOptions<
	ROW,
	COLUMN,
	THEME extends DThemeTableRow = DThemeTableRow
> extends DLayoutHorizontalOptions<THEME> {
	columns?: COLUMN[];
	frozen: number;
	even?: boolean;
}

export interface DThemeTableRow extends DThemeLayoutHorizontal {

}

export interface DTableRowColumn {
	weight?: number;
	frozen?: boolean;
	offset: number;
}

export abstract class DTableRow<
	ROW,
	COLUMN extends DTableRowColumn,
	THEME extends DThemeTableRow = DThemeTableRow,
	OPTIONS extends DTableRowOptions<ROW, COLUMN, THEME> = DTableRowOptions<ROW, COLUMN, THEME>
> extends DLayoutHorizontal<THEME, OPTIONS> {
	protected _columns!: COLUMN[];
	protected _frozen!: number;

	constructor( options: OPTIONS ) {
		super( options );
	}

	protected init( options: OPTIONS ): void {
		super.init( options );

		// State
		const state = options.even ? DTableState.EVEN : DBaseState.NONE;
		this.setState( state, true );

		// Frozen
		const frozen = this._frozen = options.frozen;

		// Cells
		const columns = this._columns = options.columns || [];
		const iend = this.toIndexEnd( columns );
		for( let i = columns.length - 1; 0 <= i; --i ) {
			const cell = this.newCell( columns[ i ], i, columns, options );
			let cellState = state;
			if( i === 0 ) {
				cellState |= DTableState.CELL_START;
			}
			if( i === iend ) {
				cellState |= DTableState.CELL_END;
			}
			if( i < frozen ) {
				cellState |= DTableState.CELL_FROZEN;
			}
			cell.setState( cellState, true );
			this.addChild( cell );
		}
	}

	protected toIndexEnd( columns: COLUMN[] ): number {
		const imax = columns.length;
		for( let i = 0; i < imax; ++i ) {
			const column = columns[ i ];
			if( column.weight !== undefined ) {
				return imax - 1;
			}
		}
		return imax;
	}

	protected onRefit(): void {
		super.onRefit();
		this.resetFrozenCellPosition();
	}

	updateFrozenCellPosition( x: number ): void {
		const columns = this._columns;
		const cells = this.children;
		const frozen = this._frozen;
		for( let i = 0; i < frozen; ++i ) {
			const column = columns[ i ];
			const cell = cells[ cells.length - 1 - i ];
			cell.position.x = -x + column.offset;
		}
	}

	protected resetFrozenCellPosition(): void {
		const columns = this._columns;
		const cells = this.children;
		const frozen = this._frozen;
		const x = this.getContentPositionX();
		for( let i = 0; i < frozen; ++i ) {
			const column = columns[ i ];
			const cell = cells[ cells.length - 1 - i ];
			column.offset = cell.position.x;
			cell.position.x = -x + column.offset;
		}
	}

	protected abstract getContentPositionX(): number;

	getClippingRect( target: DBase, result: Rectangle ): void {
		super.getClippingRect( target, result );

		const frozen = this._frozen;
		if( 0 < frozen && target.parent === this ) {
			const cells = this.children as DBase[];
			const cellIndex = cells.indexOf( target );
			if( 0 <= cellIndex ) {
				const index = cells.length - 1 - cellIndex;
				if( frozen <= index ) {
					const previous = cells[ cellIndex + 1 ];
					const shiftX = previous.position.x + previous.width;
					result.x += shiftX;
					result.width -= shiftX;
				}
			}
		}
	}

	protected abstract newCell(
		column: COLUMN,
		columnIndex: number,
		columns: COLUMN[],
		options: OPTIONS
	): DBase;

	protected getType(): string {
		return "DTableRow";
	}
}
