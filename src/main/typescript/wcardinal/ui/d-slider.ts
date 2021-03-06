/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { interaction, Point } from "pixi.js";
import InteractionEvent = interaction.InteractionEvent;
import InteractionManager = interaction.InteractionManager;
import { DApplications } from "./d-applications";
import { DBase, DBaseEvents, DBaseOptions, DThemeBase } from "./d-base";
import { DSliderLabel, DSliderLabelOptions } from "./d-slider-label";
import { DSliderThumb, DSliderThumbOptions } from "./d-slider-thumb";
import { DSliderTrack, DSliderTrackOptions } from "./d-slider-track";
import { DSliderValue, DSliderValueOptions } from "./d-slider-value";
import { EventSupport } from "./decorator/event-support";
import { UtilPointerEvent } from "./util/util-pointer-event";

/**
 * {@link DSlider} events.
 */
export interface DSliderEvents<EMITTER> extends DBaseEvents<EMITTER> {
	/**
	 * Triggered when a value is changed.
	 *
	 * @param newValue a new value
	 * @param oldValue an old value
	 * @param emitter an emitter
	 */
	change( newValue: number, oldValue: number, emitter: EMITTER ): void;
}

/**
 * {@link DSlider} "on" options.
 */
export interface DSliderOnOptions<EMITTER> extends Partial<DSliderEvents<EMITTER> & Record<string, Function>> {

}

/**
 * {@link DSlider} options.
 */
export interface DSliderOptions<
	THEME extends DThemeSlider = DThemeSlider,
	EMITTER = any
> extends DBaseOptions<THEME, EMITTER> {
	min?: DSliderLabelOptions;
	max?: DSliderLabelOptions;
	value?: DSliderValueOptions;
	track?: DSliderTrackOptions;
	thumb?: DSliderThumbOptions;
	on?: DSliderOnOptions<EMITTER>;
}

/**
 * {@link DSlider} theme.
 */
export interface DThemeSlider extends DThemeBase {

}

/**
 * A slider class.
 */
@EventSupport
export abstract class DSlider<
	THEME extends DThemeSlider = DThemeSlider,
	OPTIONS extends DSliderOptions<THEME> = DSliderOptions<THEME>
> extends DBase<THEME, OPTIONS> {
	protected _track!: DSliderTrack;
	protected _thumb!: DSliderThumb;
	protected _trackSelected!: DSliderTrack;
	protected _value!: DSliderValue;
	protected _roundNumber!: number;
	protected _offset!: number;
	protected _yOffset!: number;
	protected _ratioValue!: number;
	protected _min!: DSliderLabel;
	protected _max!: DSliderLabel;
	protected _onThumbMoveBound!: ( e: InteractionEvent ) => void;
	protected _onThumbUpBound!: ( e: InteractionEvent ) => void;
	protected _onTrackUpBound!: ( e: InteractionEvent ) => void;
	protected _onTrackSelectedUpBound!: ( e: InteractionEvent ) => void;
	protected _interactionManager?: InteractionManager;

	protected init( options?: OPTIONS ) {
		super.init( options );

		this._ratioValue = 0;

		this._track = this.newTrack( options );
		this.addChild( this._track );
		this._trackSelected = this.newTrackSelected( options );
		this._trackSelected.state.isActive = true;
		this.addChild( this._trackSelected );
		this._thumb = this.newThumb( options );
		this.addChild( this._thumb );
		this._min = this.newLabelMin( options );
		this.addChild( this._min );
		this._max = this.newLabelMax( options );
		this.addChild( this._max );
		this._value = this.newValue( options );
		this.addChild( this._value );

		// Event listeners
		this._track.on( UtilPointerEvent.down, ( e: InteractionEvent) => {
			this._value.visible = this.state.inEnabled;
			this.onTrackDown( e.data.global );
		});

		this._trackSelected.on( UtilPointerEvent.down, ( e: InteractionEvent) => {
			this._value.visible = this.state.inEnabled;
			this.onTrackSelectedDown( e.data.global );
		});

		this._onTrackUpBound = ( e: InteractionEvent ): void => {
			this.onTrackUpBound( e );
			this._value.visible = false;
		};

		this._onTrackSelectedUpBound = ( e: InteractionEvent ): void => {
			this.onTrackSelectedUpBound( e );
			this._value.visible = false;
		};

		this._thumb.on( UtilPointerEvent.down, ( e: InteractionEvent ) => {
			this._value.visible = true;
			this.onThumbDown( e );
		});

		this._onThumbMoveBound = ( e: InteractionEvent ): void => {
			this.onThumbMove( e );
		};

		this._onThumbUpBound = ( e: InteractionEvent ): void => {
			this.onThumbUp( e );
			this._value.visible = false;
		};

		//
		this.onValuesChanged();
	}

	protected newThumb( options?: OPTIONS ): DSliderThumb {
		return new DSliderThumb( options && options.thumb );
	}

	protected newValue( options?: OPTIONS ): DSliderValue {
		return new DSliderValue( this.toValueOptions( options && options.value ) );
	}

	protected toValueOptions( options?: DSliderValueOptions ): DSliderValueOptions {
		options = options || {};
		if( options.value == null ) {
			options.value = 0;
		}
		const text = options.text = options.text || {};
		if( text.value == null ) {
			text.value = options.value;
		}
		if( options.visible == null ) {
			options.visible = false;
		}
		return options;
	}

	protected newLabelMin( options?: OPTIONS ): DSliderLabel {
		return new DSliderLabel( this.toLabelMinOptions( options && options.min ) );
	}

	protected toLabelMinOptions( options?: DSliderLabelOptions ): DSliderLabelOptions {
		options = options || {};
		if( options.value == null ) {
			options.value = 0;
		}
		const text = options.text = options.text || {};
		if( text.value == null ) {
			text.value = `${options.value}`;
		}
		return options;
	}

	protected newLabelMax( options?: OPTIONS ): DSliderLabel {
		return new DSliderLabel( this.toLabelMaxOptions( options && options.max ) );
	}

	protected toLabelMaxOptions( options?: DSliderLabelOptions ): DSliderLabelOptions {
		options = options || {};
		if( options.value == null ) {
			options.value = 1;
		}
		const text = options.text = options.text || {};
		if( text.value == null ) {
			text.value = `${options.value}`;
		}
		return options;
	}

	protected abstract newTrack( options?: OPTIONS ): DSliderTrack;
	protected abstract newTrackSelected( options?: OPTIONS ): DSliderTrack;

	protected abstract onPick( global: Point ): void;
	protected abstract onValuesChanged(): void;
	protected abstract moveThumbPosition( thumbCoordinate: number ): void;

	protected getValueMargin(): number {
		return 14;
	}

	protected onTrackDown( global: Point ): void {
		if( this.state.inDisabled ) {
			return;
		}
		const layer = DApplications.getLayer( this );
		if( layer ) {
			const interactionManager = layer.renderer.plugins.interaction;
			this._interactionManager = interactionManager;
			interactionManager.on( UtilPointerEvent.up, this._onTrackUpBound );
		}
		this.onPick( global );
	}

	protected onTrackSelectedDown( global: Point ): void {
		if( this.state.inDisabled ) {
			return;
		}
		const layer = DApplications.getLayer( this );
		if( layer ) {
			const interactionManager = layer.renderer.plugins.interaction;
			this._interactionManager = interactionManager;
			interactionManager.on( UtilPointerEvent.up, this._onTrackSelectedUpBound );
		}
		this.onPick( global );
	}

	protected onTrackUpBound( e: InteractionEvent ): void {
		const interactionManager = this._interactionManager;
		if( interactionManager ) {
			this._interactionManager = undefined;
			interactionManager.off( UtilPointerEvent.up, this._onTrackUpBound );
		}
	}

	protected onTrackSelectedUpBound( e: InteractionEvent ): void {
		const interactionManager = this._interactionManager;
		if( interactionManager ) {
			this._interactionManager = undefined;
			interactionManager.off( UtilPointerEvent.up, this._onTrackSelectedUpBound );
		}
	}

	protected onThumbMove( e: InteractionEvent ): void {
		if( this.state.inDisabled ) {
			return;
		}
		this.onPick( e.data.global );
	}

	protected onThumbDown( e: InteractionEvent ): void {
		const layer = DApplications.getLayer( this );
		if( layer ) {
			const interactionManager = layer.renderer.plugins.interaction;
			this._interactionManager = interactionManager;
			interactionManager.on( UtilPointerEvent.move, this._onThumbMoveBound );
			interactionManager.on( UtilPointerEvent.up, this._onThumbUpBound );
		}
	}

	protected onThumbUp( e: InteractionEvent ): void {
		const interactionManager = this._interactionManager;
		if( interactionManager ) {
			this._interactionManager = undefined;
			interactionManager.off( UtilPointerEvent.move, this._onThumbMoveBound );
			interactionManager.off( UtilPointerEvent.up, this._onThumbUpBound );
		}
	}

	protected updateValue(): void {
		const min = this._min.value;
		const max = this._max.value;
		const value = this._value;
		const newValue = value.rounder( min + this._ratioValue * ( max - min ) );
		const oldValue = value.value;
		if( newValue !== oldValue ) {
			value.value = newValue;
			value.text = value.value;
			this.emit( "change", newValue, oldValue, this );
		}
	}

	onResize( newWidth: number, newHeight: number, oldWidth: number, oldHeight: number ): void {
		super.onResize( newWidth, newHeight, oldWidth, oldHeight );
		this.onValuesChanged();
	}

	/**
	 * Returns a current value.
	 */
	get value(): number {
		return this._value.value;
	}

	/**
	 * Sets a current value.
	 */
	set value( value: number ) {
		value = Math.max( this._min.value, Math.min( this._max.value, value ) );
		// Adjust if value is new
		if( this._value.value !== value ) {
			this._value.value = value;
			this.onValuesChanged();
		}
	}

	/**
	 * Returns a minimum value.
	 */
	get min(): number {
		return this._min.value;
	}

	/**
	 * Sets a minimum value.
	 */
	set min( newMin: number ) {
		const min = this._min;
		newMin = Math.min( this._max.value, newMin );
		if( min.value !== newMin ) {
			const value = this._value;
			min.text = min.value = newMin;
			value.value = Math.max( newMin, value.value );
			this.onValuesChanged();
		}
	}

	/**
	 * Returns a maximum value.
	 */
	get max(): number {
		return this._max.value;
	}

	/**
	 * Sets a maximum value.
	 */
	set max( newMax: number ) {
		const max = this._max;
		newMax = Math.max( this._min.value, newMax );
		if( max.value !== newMax ) {
			const value = this._value;
			max.text = max.value = newMax;
			value.value = Math.min( newMax, value.value );
			this.onValuesChanged();
		}
	}

	protected getType(): string {
		return "DSlider";
	}

	// Event handlings
	on<E extends keyof DSliderEvents<this>>(
		event: E, handler: DSliderEvents<this>[ E ], context?: any
	): this;
	on( event: string, handler: Function, context?: any ): this;
	on(): this { return this; }

	once<E extends keyof DSliderEvents<this>>(
		event: E, handler: DSliderEvents<this>[ E ], context?: any
	): this;
	once( event: string, handler: Function, context?: any ): this;
	once(): this { return this; }

	emit<E extends keyof DSliderEvents<this>>(
		event: E, ...args: Parameters<DSliderEvents<this>[ E ]>
	): boolean;
	emit( event: string, ...args: any ): boolean;
	emit(): boolean { return true; }
}
