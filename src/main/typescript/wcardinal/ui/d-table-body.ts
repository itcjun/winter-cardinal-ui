/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { interaction, Point } from "pixi.js";
import InteractionEvent = interaction.InteractionEvent;
import { DBase, DBaseOptions, DThemeBase } from "./d-base";
import { DButtonBase } from "./d-button-base";
import { DTableBodyRow, DTableBodyRowOptions } from "./d-table-body-row";
import { DTableBodyRowEven } from "./d-table-body-row-even";
import { DTableBodyRowOdd } from "./d-table-body-row-odd";
import { DTableColumn } from "./d-table-column";
import { DTableData, DTableDataOptions } from "./d-table-data";
import { DTableDataList } from "./d-table-data-list";
import { DTableDataSelection, DTableDataSelectionType } from "./d-table-data-selection";
import { UtilPointerEvent } from "./util/util-pointer-event";

export interface DTableBodyOptions<
	ROW,
	DATA extends DTableData<ROW> = DTableDataList<ROW>,
	THEME extends DThemeTableBody = DThemeTableBody
> extends DBaseOptions<THEME> {
	columns?: Array<DTableColumn<ROW>>;
	row?: DTableBodyRowOptions<ROW>;
	data?: DTableDataOptions<ROW> | DATA;
}

export interface DThemeTableBody extends DThemeBase {
	getRowHeight(): number;
}

const toRowOptions = <ROW, DATA extends DTableData<ROW>>(
	theme: DThemeTableBody,
	options: DTableBodyOptions<ROW, DATA>,
	selectionType: DTableDataSelectionType
): DTableBodyRowOptions<ROW> => {
	const columns = options.columns || [];
	let result = options.row;
	if( result != null ) {
		if( result.height == null ) {
			result.height = theme.getRowHeight();
		}
		if( result.columns === undefined ) {
			result.columns = columns;
		}
		if( selectionType !== DTableDataSelectionType.NONE && result.interactive == null ) {
			result.interactive = "SELF";
		}
	} else {
		result = {
			columns,
			height: theme.getRowHeight(),
			interactive: ( selectionType !== DTableDataSelectionType.NONE ? "SELF" : undefined )
		};
	}
	return result as DTableBodyRowOptions<ROW>;
};

const isDTableData = <ROW>( target?: ROW[] | DTableDataOptions<ROW> | DTableData<ROW> ): target is DTableData<ROW> => {
	return ( target != null && "mapped" in target );
};

export class DTableBody<
	ROW,
	DATA extends DTableData<ROW> = DTableDataList<ROW>,
	THEME extends DThemeTableBody = DThemeTableBody,
	OPTIONS extends DTableBodyOptions<ROW, DATA, THEME> = DTableBodyOptions<ROW, DATA, THEME>
> extends DBase<THEME, OPTIONS> {
	protected static WORK_ON_CLICK = new Point();
	protected _columns!: Array<DTableColumn<ROW>>;
	protected _rowHeight!: number;
	protected _rowIndexMappedStart!: number;
	protected _rowIndexMappedEnd!: number;
	protected _rowOptions!: DTableBodyRowOptions<ROW>;
	protected _updateRowsCount!: number;
	protected _isUpdateRowsCalled!: boolean;
	protected _isUpdateRowsCalledForcibly!: boolean;
	protected _workRows!: Array<DTableBodyRow<ROW>>;

	protected _data!: DATA;

	constructor( options: OPTIONS ) {
		super( options );
		this._data.emit( "init", this._data );
	}

	protected init( options: OPTIONS ) {
		super.init( options );

		const data = ( isDTableData( options.data ) ? options.data :
			new DTableDataList<ROW>( options.data ) as unknown as DATA );
		this._data = data;
		data.bind( this );
		const theme = this.theme;
		const rowOptions = toRowOptions( theme, options, data.selection.type );
		this._rowOptions = rowOptions;
		this._rowHeight = ( rowOptions.height != null ? rowOptions.height : theme.getRowHeight() );
		this._columns = rowOptions.columns || [];
		this._rowIndexMappedStart = 0;
		this._rowIndexMappedEnd = 0;
		this._updateRowsCount = 0;
		this._isUpdateRowsCalled = false;
		this._isUpdateRowsCalledForcibly = false;
		this._workRows = [];
	}

	onRowClicked( e: InteractionEvent ): void {
		if( this.isActionable() ) {
			const local = DTableBody.WORK_ON_CLICK;
			local.copyFrom( e.data.global );
			this.toLocal( local, undefined, local, false );
			const rowIndexMapped = Math.floor( local.y / this._rowHeight );
			const data = this._data;
			if( 0 <= rowIndexMapped && rowIndexMapped < data.mapped.size() ) {
				const isSingle = ( data.selection.type === DTableDataSelectionType.SINGLE );
				const isNotSingle = ! isSingle;
				const originalEvent = e.data.originalEvent;
				const ctrlKey = originalEvent.ctrlKey;
				const shiftKey = originalEvent.shiftKey;
				const rowIndex = data.mapped.unmap( rowIndexMapped );
				if( isSingle || data.selection.isEmpty() || ! ( isNotSingle && ( ctrlKey || shiftKey ) ) ) {
					data.selection.clearAndAdd( rowIndex );
				} else if( ctrlKey ) {
					data.selection.toggle( rowIndex );
				} else if( shiftKey ) {
					data.selection.addTo( rowIndex );
				}
			}
		}
	}

	onResize( newWidth: number, newHeight: number, oldWidth: number, oldHeight: number ): void {
		super.onResize( newWidth, newHeight, oldWidth, oldHeight );
		this.update();
	}

	get selection(): DTableDataSelection<ROW> {
		return this._data.selection;
	}

	lock(): void {
		this._updateRowsCount += 1;
		if( this._updateRowsCount === 1 ) {
			this._isUpdateRowsCalled = false;
			this._isUpdateRowsCalledForcibly = false;
		}
	}

	unlock( callIfNeeded: boolean ): void {
		this._updateRowsCount -= 1;
		if( this._updateRowsCount === 0 ) {
			if( callIfNeeded && this._isUpdateRowsCalled ) {
				this.update( this._isUpdateRowsCalledForcibly );
			}
			this._isUpdateRowsCalled = false;
			this._isUpdateRowsCalledForcibly = false;
		}
	}

	/**
	 * Updates rows. If the `forcibly` is true, some dirty checkings for
	 * avoiding unnecessary state changes are skipped.
	 *
	 * @param forcibly true to update forcibly
	 */
	update( forcibly?: boolean ): void {
		if( 0 < this._updateRowsCount ) {
			this._isUpdateRowsCalled = true;
			if( forcibly ) {
				this._isUpdateRowsCalledForcibly = true;
			}
			return;
		}

		const content = this.parent;
		const rows = this.children as Array<DTableBodyRow<ROW>>;
		const height = content.parent.height;
		const rowHeight = this._rowHeight;

		const data = this._data;
		const dataMappedSize = data.mapped.size();

		const oldRowIndexMappedStart = this._rowIndexMappedStart;
		let oldRowIndexMappedEnd = this._rowIndexMappedEnd;
		let oldRowCount = oldRowIndexMappedEnd - oldRowIndexMappedStart;

		const newHeight = dataMappedSize * rowHeight;
		this.height = newHeight;

		const newContentHeight = Math.max( height, newHeight );
		const newContentY = Math.max( height - newContentHeight, content.position.y );
		content.position.y = newContentY;
		content.height = newContentHeight;

		const newRowIndexMappedLowerBound = Math.floor( (0 - newContentY) / rowHeight );
		const newRowIndexMappedUpperBound = Math.floor( (height - newContentY) / rowHeight );
		const newRowIndexMappedStart = newRowIndexMappedLowerBound - ( newRowIndexMappedLowerBound % 2 === 0 ? 2 : 1 );
		let newRowIndexMappedEnd = newRowIndexMappedUpperBound +
			((newRowIndexMappedUpperBound - newRowIndexMappedStart + 1) % 2 === 0 ? 3 : 2);
		let newRowCount = newRowIndexMappedEnd - newRowIndexMappedStart;
		if( newRowCount < oldRowCount && oldRowCount - 2 <= newRowCount ) {
			newRowCount = oldRowCount;
			newRowIndexMappedEnd = newRowIndexMappedStart + newRowCount;
		}

		if( oldRowCount < newRowCount ) {
			for( let i = oldRowCount; i < newRowCount; ++i ) {
				const oldRowIndexMapped = oldRowIndexMappedStart + i;
				const newRow = this.newRow( (oldRowIndexMapped % 2) === 0 );
				this.addChild( newRow );
			}
			oldRowCount = newRowCount;
			oldRowIndexMappedEnd = oldRowIndexMappedStart + oldRowCount;
		} else if( newRowCount < oldRowCount ) {
			for( let i = oldRowCount - 1; newRowCount <= i; --i ) {
				this.removeChild( rows[ i ] );
			}
			oldRowCount = newRowCount;
			oldRowIndexMappedEnd = oldRowIndexMappedStart + oldRowCount;
		}

		this._rowIndexMappedStart = newRowIndexMappedStart;
		this._rowIndexMappedEnd = newRowIndexMappedEnd;

		const rowIndexMappedStartDelta = newRowIndexMappedStart - oldRowIndexMappedStart;
		const rowIndexMappedStartDeltaAbs = Math.abs(rowIndexMappedStartDelta);
		const rowsLength = rows.length;
		if( 0 < rowIndexMappedStartDeltaAbs && rowIndexMappedStartDeltaAbs < rowsLength ) {
			const work = this._workRows;
			if( 0 < rowIndexMappedStartDelta ) {
				for( let i = 0; i < rowIndexMappedStartDeltaAbs; ++i ) {
					work.push( this.resetRow( rows[ i ] ) );
				}
				for( let i = rowIndexMappedStartDeltaAbs; i < rowsLength; ++i ) {
					rows[ i - rowIndexMappedStartDeltaAbs ] = rows[ i ];
				}
				for( let i = 0; i < rowIndexMappedStartDeltaAbs; ++i ) {
					rows[ rowsLength - rowIndexMappedStartDeltaAbs + i ] = work[ i ];
				}
			} else {
				for( let i = 0; i < rowIndexMappedStartDeltaAbs; ++i ) {
					work.push( this.resetRow( rows[ rowsLength - rowIndexMappedStartDeltaAbs + i ] ) );
				}
				for( let i = rowsLength - rowIndexMappedStartDeltaAbs - 1; 0 <= i; --i ) {
					rows[ i + rowIndexMappedStartDeltaAbs ] = rows[ i ];
				}
				for( let i = 0; i < rowIndexMappedStartDeltaAbs; ++i ) {
					rows[ i ] = work[ i ];
				}
			}
			work.length = 0;
		}

		const selection = data.selection;
		data.mapped.each(( datum: ROW, index: number, unmappedIndex: number ): void | boolean => {
			const row = rows[ index - newRowIndexMappedStart ];
			row.position.y = index * rowHeight;
			row.setDisabled( false );
			row.setActive( selection.contains( unmappedIndex ) );
			row.set( datum, unmappedIndex, forcibly );
		}, newRowIndexMappedStart, newRowIndexMappedStart + rowsLength );

		for( let i = 0; newRowIndexMappedStart + i < 0 && i < rowsLength; ++i ) {
			const row = rows[ i ];
			row.position.y = ( newRowIndexMappedStart + i ) * rowHeight;
			row.setDisabled( true );
			row.setActive( false );
			row.unset();
		}

		for( let i = rowsLength - 1; dataMappedSize <= newRowIndexMappedStart + i && 0 <= i; --i ) {
			const row = rows[ i ];
			row.position.y = ( newRowIndexMappedStart + i ) * rowHeight;
			row.setDisabled( true );
			row.setActive( false );
			row.unset();
		}
	}

	protected resetRow( row: DTableBodyRow<ROW> ): DTableBodyRow<ROW> {
		row.blur( true );
		const cells = row.children;
		for( let i = 0, imax = cells.length; i < imax; ++i ) {
			const cell = cells[ i ];
			if( cell instanceof DBase ) {
				cell.setPressed( false );
			}
		}
		return row;
	}

	protected newRow( isEven: boolean ): DTableBodyRow<ROW> {
		const options = this._rowOptions;
		const result = ( isEven ?
			new DTableBodyRowEven<ROW>( options ) : new DTableBodyRowOdd<ROW>( options )
		);
		result.on( "change", ( newCellValue: unknown, oldCellValue: unknown, columnIndex: number ): void => {
			const index = this.getChildIndex( result );
			if( 0 <= index ) {
				const rowIndex = this._rowIndexMappedStart + index;
				const data = this._data;
				data.emit( "change", newCellValue, oldCellValue, rowIndex, columnIndex, data );
			}
		});
		return result;
	}

	onDblClick( e: MouseEvent | TouchEvent, interactionManager: interaction.InteractionManager ): boolean {
		let result = false;
		const data = this._data;
		if( this.isActionable() && data.selection.type !== DTableDataSelectionType.NONE ) {
			const local = UtilPointerEvent.toGlobal( e, interactionManager, DTableBody.WORK_ON_CLICK );
			this.toLocal( local, undefined, local, false );
			const x = local.x;
			const y = local.y;
			const rowIndexMapped = Math.floor( y / this._rowHeight );
			if( 0 <= rowIndexMapped && rowIndexMapped < data.mapped.size() ) {
				const index = rowIndexMapped - this._rowIndexMappedStart;
				const rows = this.children as Array<DTableBodyRow<ROW>>;
				if( 0 <= index && index < rows.length ) {
					const row = rows[ index ];
					const cells = row.children as DBase[];
					const cellsLength = cells.length;
					const columns = this._columns;
					const columnsLength = columns.length;
					for( let i = 0, imax = Math.min( cellsLength, columnsLength ); i < imax; ++i ) {
						const column = columns[ columnsLength - i - 1 ];
						if( column.editable ) {
							const cell = cells[ cellsLength - i - 1 ];
							const dx = x - cell.position.x;
							if( 0 <= dx && dx <= cell.width ) {
								cell.focus();
								if( cell instanceof DButtonBase ) {
									cell.onClick();
								}
								result = true;
							}
						}
					}
				}
			}
		}
		result = super.onDblClick( e, interactionManager ) || result;
		return result;
	}

	protected getType(): string {
		return "DTableBody";
	}

	get data(): DATA {
		return this._data;
	}
}
