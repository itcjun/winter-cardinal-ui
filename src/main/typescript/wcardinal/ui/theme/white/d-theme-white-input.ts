/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBaseStateSet } from "../../d-base-state-set";
import { DCoordinateSize } from "../../d-coordinate";
import { DHtmlElementElementCreator } from "../../d-html-element";
import { DThemeInput } from "../../d-input";
import { UtilRgb } from "../../util/util-rgb";
import { DThemeWhiteConstants } from "./d-theme-white-constants";
import { DThemeWhiteHtmlElement } from "./d-theme-white-html-element";

const editingValidator = (): unknown => {
	return null;
};

const editingUnformatter = ( text: string ): string => {
	return text;
};

const CREATOR_CLASSNAME = "d-theme-white-input";
const CREATOR_CLASSNAME_ELEMENT = `${CREATOR_CLASSNAME}-element`;
const elementCreator = ( parent: HTMLElement ): HTMLInputElement => {
	const found = parent.getElementsByClassName( CREATOR_CLASSNAME_ELEMENT );
	if( 0 < found.length ) {
		return found[ 0 ] as HTMLInputElement;
	}
	const element = document.createElement( "input" );
	element.setAttribute( "spellcheck", "false" );
	element.setAttribute( "class", CREATOR_CLASSNAME_ELEMENT );
	parent.appendChild( element );
	return element;
};

const divCreator = ( parent: HTMLElement, classname: string ): HTMLDivElement => {
	const found = parent.getElementsByClassName( classname );
	if( 0 < found.length ) {
		return found[ 0 ] as HTMLDivElement;
	}
	const result = document.createElement( "div" );
	result.setAttribute( "class", classname );
	parent.appendChild( result );
	return result;
};

const CREATOR_CLASSNAME_CLIPPER = `${CREATOR_CLASSNAME}-clipper`;
const clipperCreator = ( parent: HTMLElement ): HTMLDivElement => {
	return divCreator( parent, CREATOR_CLASSNAME_CLIPPER );
};

const CREATOR_CLASSNAME_BEFORE = `${CREATOR_CLASSNAME}-before`;
const beforeCreator = ( parent: HTMLElement ): HTMLDivElement => {
	return divCreator( parent, CREATOR_CLASSNAME_BEFORE );
};

const CREATOR_CLASSNAME_AFTER = `${CREATOR_CLASSNAME}-after`;
const afterCreator = ( parent: HTMLElement ): HTMLDivElement => {
	return divCreator( parent, CREATOR_CLASSNAME_AFTER );
};

export class DThemeWhiteInput extends DThemeWhiteHtmlElement<HTMLInputElement> implements DThemeInput {
	protected readonly BACKGROUND_COLOR = DThemeWhiteConstants.BACKGROUND_COLOR_ON_BOARD;
	protected readonly BACKGROUND_COLOR_HOVERED = UtilRgb.darken( this.BACKGROUND_COLOR, 0.017 );

	getBackgroundColor( state: DBaseStateSet ): number | null {
		if( state.inDisabled || state.inReadOnly ) {
			return null;
		} else if( state.isFocused || state.isHovered ) {
			return this.BACKGROUND_COLOR_HOVERED;
		} else {
			return this.BACKGROUND_COLOR;
		}
	}

	getBorderColor( state: DBaseStateSet ): number | null {
		return DThemeWhiteConstants.BORDER_COLOR;
	}

	getOutlineColor( state: DBaseStateSet ): number | null {
		if( state.isInvalid ) {
			return DThemeWhiteConstants.INVALID_COLOR;
		}
		return super.getOutlineColor( state );
	}

	getHeight(): DCoordinateSize {
		return this.getLineHeight();
	}

	getWidth(): DCoordinateSize {
		return 100;
	}

	getPlaceholder(): string {
		return "";
	}

	getPaddingLeft(): number {
		return 10;
	}

	getPaddingRight(): number {
		return 10;
	}

	getCursor(): string {
		return "text";
	}

	getEditingFormatter(): ( value: any, caller: any ) => string {
		return this.getTextFormatter();
	}

	getEditingUnformatter(): ( text: string, caller: any ) => any {
		return editingUnformatter;
	}

	getEditingValidator(): ( value: any, caller: any ) => unknown {
		return editingValidator;
	}

	getElementCreator(): DHtmlElementElementCreator<HTMLInputElement> {
		return elementCreator;
	}

	getClipperCreator(): DHtmlElementElementCreator<HTMLDivElement> {
		return clipperCreator;
	}

	getBeforeCreator(): DHtmlElementElementCreator<HTMLDivElement> {
		return beforeCreator;
	}

	getAfterCreator(): DHtmlElementElementCreator<HTMLDivElement> {
		return afterCreator;
	}

	getSelect(): boolean {
		return true;
	}

	protected getElementStyleMargin( state: DBaseStateSet ): string {
		return "margin: 0.1em 0 0 0;";
	}
}
