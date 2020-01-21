/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DChartCoordinateDirection } from "./d-chart-coordinate";
import { DChartCoordinateContainer, DChartCoordinateContainerOptions } from "./d-chart-coordinate-container";
import { DChartCoordinateContainerSub } from "./d-chart-coordinate-container-sub";
import { DChartCoordinateContainerSubImpl } from "./d-chart-coordinate-container-sub-impl";
import { DChartPlotArea } from "./d-chart-plot-area";
import { isArray } from "./util/is-array";

export class DChartCoordinateContainerImpl implements DChartCoordinateContainer {
	protected _x: DChartCoordinateContainerSub;
	protected _y: DChartCoordinateContainerSub;
	protected _plotArea: DChartPlotArea;

	constructor( plotArea: DChartPlotArea, options?: DChartCoordinateContainerOptions ) {
		this._plotArea = plotArea;
		const x = this._x = new DChartCoordinateContainerSubImpl( this, DChartCoordinateDirection.X );
		const y = this._y = new DChartCoordinateContainerSubImpl( this, DChartCoordinateDirection.Y );
		if( options ) {
			const cxs = options.x;
			if( cxs ) {
				if( isArray( cxs ) ) {
					for( let i = 0, imax = cxs.length; i < imax; ++i ) {
						x.add( cxs[ i ] );
					}
				} else {
					x.add( cxs );
				}
			}
			const cys = options.y;
			if( cys ) {
				if( isArray( cys ) ) {
					for( let i = 0, imax = cys.length; i < imax; ++i ) {
						y.add( cys[ i ] );
					}
				} else {
					y.add( cys );
				}
			}
		}
	}

	get x(): DChartCoordinateContainerSub {
		return this._x;
	}

	get y(): DChartCoordinateContainerSub {
		return this._y;
	}

	get plotArea(): DChartPlotArea {
		return this._plotArea;
	}

	fit(): this {
		this._x.fit();
		this._y.fit();
		return this;
	}
}
