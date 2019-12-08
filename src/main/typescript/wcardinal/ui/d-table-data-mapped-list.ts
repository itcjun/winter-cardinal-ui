import { DTableData, DTableDataMapped, DTableDataMappedEachIterator } from "./d-table-data";

export interface DTableDataMappedListParent<ROW> extends DTableData<ROW> {
	readonly rows: ROW[];
}

export class DTableDataMappedList<ROW> implements DTableDataMapped<ROW> {
	protected _parent: DTableDataMappedListParent<ROW>;

	constructor( parent: DTableDataMappedListParent<ROW> ) {
		this._parent = parent;
	}

	unmap( index: number ): number {
		let result = index;

		const parent = this._parent;
		const indicesSorted = parent.sorter.indices;
		if( indicesSorted ) {
			result = indicesSorted[ result ];
		}

		const indicesFiltered = parent.filter.indices;
		if( indicesFiltered ) {
			result = indicesFiltered[ result ];
		}

		return result;
	}

	size(): number {
		const parent = this._parent;
		const indicesFiltered = parent.filter.indices;
		return ( indicesFiltered != null ? indicesFiltered.length : parent.size() );
	}

	get( index: number ): ROW | null {
		const parent = this._parent;
		return parent.get( this.unmap( index ) );
	}

	each( iterator: DTableDataMappedEachIterator<ROW>, ifrom?: number, ito?: number ): void {
		const parent = this._parent;
		const rows = parent.rows;
		const indicesFiltered = parent.filter.indices;
		const indicesSorted = parent.sorter.indices;
		ifrom = ( ifrom != null ? Math.max( 0, ifrom ) : 0 );
		if( indicesFiltered ) {
			const size = indicesFiltered.length;
			ito = ( ito != null ? Math.min( size, ito ) : size );
			if( indicesSorted ) {
				for( let i = ifrom; i < ito; ++i ) {
					const unmappedIndex = indicesFiltered[ indicesSorted[ i ] ];
					const row = rows[ unmappedIndex ];
					if( iterator( row, i, unmappedIndex ) === false ) {
						break;
					}
				}
			} else {
				for( let i = ifrom; i < ito; ++i ) {
					const unmappedIndex = indicesFiltered[ i ];
					const row = rows[ unmappedIndex ];
					if( iterator( row, i, unmappedIndex ) === false ) {
						break;
					}
				}
			}
		} else {
			const size = rows.length;
			ito = ( ito != null ? Math.min( size, ito ) : size );
			if( indicesSorted ) {
				for( let i = ifrom; i < ito; ++i ) {
					const unmappedIndex = indicesSorted[ i ];
					const row = rows[ unmappedIndex ];
					if( iterator( row, i, unmappedIndex ) === false ) {
						break;
					}
				}
			} else {
				for( let i = ifrom; i < ito; ++i ) {
					const row = rows[ i ];
					if( iterator( row, i, i ) === false ) {
						break;
					}
				}
			}
		}
	}
}
