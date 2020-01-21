/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DChartCoordinate, DChartCoordinateDirection } from "./d-chart-coordinate";
import { DChartCoordinateContainerSub } from "./d-chart-coordinate-container-sub";
import { DChartCoordinateLogTick, DThemeChartCoordinateLogTick } from "./d-chart-coordinate-log-tick";
import { DChartCoordinateTransform, DThemeChartCoordinateTransform } from "./d-chart-coordinate-transform";
import { DChartCoordinateTransformImpl } from "./d-chart-coordinate-transform-impl";
import { DChartRegion } from "./d-chart-region";
import { DChartRegionImpl } from "./d-chart-region-impl";
import { DThemes } from "./theme/d-themes";
import { isNaN } from "./util/is-nan";

export interface DThemeChartCoordinateLog extends DThemeChartCoordinateTransform, DThemeChartCoordinateLogTick {

}

export interface DChartCoordinateLogOptions {
	theme?: DThemeChartCoordinateLog;
}

export class DChartCoordinateLog implements DChartCoordinate {
	protected _id: number;
	protected _transform: DChartCoordinateTransform;
	protected _container?: DChartCoordinateContainerSub;
	protected _direction: DChartCoordinateDirection;
	protected _theme: DThemeChartCoordinateLog;
	protected _work: DChartRegionImpl;
	protected _tick: DChartCoordinateLogTick;

	constructor( options?: DChartCoordinateLogOptions ) {
		this._id = 0;
		this._direction = DChartCoordinateDirection.X;
		const theme = this.toTheme( options );
		this._theme = theme;
		this._transform = new DChartCoordinateTransformImpl( theme );
		this._tick = new DChartCoordinateLogTick( theme );
		this._work = new DChartRegionImpl( NaN, NaN );
	}

	bind( container: DChartCoordinateContainerSub, direction: DChartCoordinateDirection ): void {
		this._container = container;
		this._direction = direction;
	}

	unbind(): void {
		this._container = undefined;
	}

	fit(): void {
		const container = this._container;
		if( container ) {
			const plotArea = container.container.plotArea;
			const padding = plotArea.padding;
			const work = this._work;
			switch( this._direction ) {
			case DChartCoordinateDirection.X:
				this.fit_(
					padding.getLeft(), plotArea.width - padding.getRight(),
					plotArea.series.getDomain( this, work )
				);
				break;
			case DChartCoordinateDirection.Y:
				this.fit_(
					plotArea.height - padding.getBottom(), padding.getTop(),
					plotArea.series.getRange( this, work )
				);
				break;
			}
		}
	}

	protected fit_( pixelFrom: number, pixelTo: number, region: DChartRegion ): void {
		const regionFrom = region.from;
		const regionTo = region.to;
		if( ! (isNaN( regionFrom ) || isNaN( regionTo )) ) {
			// Scale
			let newScale = 1;
			const regionFromMapped = this.map( regionFrom );
			const regionToMapped = this.map( regionTo );
			const regionSizeMapped = ( regionToMapped - regionFromMapped );
			if( ! this._theme.isZero( regionSizeMapped ) ) {
				const pixelSize = ( pixelTo - pixelFrom );
				newScale = pixelSize / regionSizeMapped;
			} else {
				newScale = ( pixelTo < pixelFrom ? -1 : 1 );
			}

			// Translation
			const newTranslation = pixelFrom - regionFromMapped * newScale;

			// Done
			this._transform.set( newTranslation, newScale );
		}
	}

	get id(): number {
		return this._id;
	}

	get transform(): DChartCoordinateTransform {
		return this._transform;
	}

	map( value: number ): number {
		return Math.log( Math.max( 0, value ) ) / Math.LN10;
	}

	mapAll( values: number[], ifrom: number, iend: number, stride: number, offset: number ): void {
		const factor = 1 / Math.LN10;
		for( let i = ifrom + offset; i < iend; i += stride ) {
			const value = values[ i ];
			values[ i ] = Math.log( Math.max( 0, value ) ) * factor;
		}
	}

	unmap( value: number ): number {
		return Math.pow( 10, value );
	}

	unmapAll( values: number[], ifrom: number, iend: number, stride: number, offset: number ): void {
		for( let i = ifrom + offset; i < iend; i += stride ) {
			values[ i ] = Math.pow( 10, values[ i ] );
		}
	}

	ticks(
		domainFrom: number, domainTo: number,
		majorCount: number,
		minorCountPerMajor: number,
		minorCount: number,
		majorResult: Float64Array,
		minorResult: Float64Array
	): void {
		this._tick.calculate(
			domainFrom, domainTo,
			majorCount,
			minorCountPerMajor,
			minorCount,
			majorResult,
			minorResult,
			this
		);
	}

	protected toTheme( options?: DChartCoordinateLogOptions ): DThemeChartCoordinateLog {
		return ( options && options.theme ) || this.getThemeDefault();
	}

	protected getThemeDefault(): DThemeChartCoordinateLog {
		return DThemes.getInstance().get( this.getType() );
	}

	protected getType(): string {
		return "DChartCoordinateLog";
	}
}
