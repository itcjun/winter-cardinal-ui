/*
 * Copyright (C) 2019 Toshiba Corporation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DBase } from "./d-base";
import { DDiagramBaseController } from "./d-diagram-base";
import { DDiagramLayerContainer } from "./d-diagram-layer-container";
import { DDiagramSerialized, DDiagramSerializedSimple } from "./d-diagram-serialized";
import { EShape } from "./shape/e-shape";
import { EShapeDefaults } from "./shape/e-shape-defaults";
import { EShapeDeserializer } from "./shape/e-shape-deserializer";
import { EShapeLayerContainer } from "./shape/e-shape-layer-container";
import { EShapeResourceManagerDeserialization } from "./shape/e-shape-resource-manager-deserialization";
import { EShapeEmbeddedDatum } from "./shape/variant/e-shape-embedded-datum";
import { EShapeEmbeddedLayerContainer } from "./shape/variant/e-shape-embedded-layer-container";

export class DDiagrams {
	static toSimple( serialized: DDiagramSerialized ): DDiagramSerializedSimple {
		const tags = serialized.tags;
		const pieces = serialized.pieces;
		return {
			version: serialized.version,
			id: serialized.id,
			name: serialized.name,
			tags: (tags != null ? JSON.stringify(tags) : undefined),
			pieces: (pieces != null ? JSON.stringify(pieces) : undefined),
			data: JSON.stringify({
				width: serialized.width,
				height: serialized.height,
				background: serialized.background,
				tile: serialized.tile,
				resources: serialized.resources,
				layers: serialized.layers,
				items: serialized.items,
				snap: serialized.snap
			})
		};
	}

	static toSerialized( target: DDiagramSerializedSimple | DDiagramSerialized ): DDiagramSerialized {
		if( "data" in target ) {
			const result: DDiagramSerialized = JSON.parse( target.data );
			result.version = target.version;
			result.id = target.id;
			result.name = target.name;
			const tags = target.tags;
			if( tags != null ) {
				result.tags = JSON.parse(tags);
			}
			const pieces = target.pieces;
			if( pieces != null ) {
				result.pieces = JSON.parse(pieces);
			}
			return result;
		}
		return target;
	}

	static newLayer(
		serialized: DDiagramSerialized,
		container: DDiagramLayerContainer | EShapeLayerContainer,
		manager: EShapeResourceManagerDeserialization
	): Promise<EShape[]> {
		// Layers
		const serializedLayers = serialized.layers;
		for( let i = 0, imax = serializedLayers.length; i < imax; ++i ) {
			container.create( serializedLayers[ i ][ 0 ] || "" );
		}

		// Items
		const serializedItems = serialized.items;
		const shapePromises = EShapeDeserializer.deserializeAll( serializedItems, manager );
		if( shapePromises != null ) {
			return shapePromises.then(( shapes: EShape[] ): EShape[] => {
				const layers = container.children;
				for( let i = 0, imax = shapes.length; i < imax; ++i ) {
					const serializedItem = serializedItems[ i ];
					const shape = shapes[ i ];
					const layer = layers[ serializedItem[ 16 ] ];
					if( layer != null ) {
						shape.attach( layer );
					}
				}
				return shapes;
			});
		} else {
			return Promise.resolve([]);
		}
	}

	static applyBackground(
		serialized: DDiagramSerialized,
		canvas: DBase,
		canvasContainer: DBase
	): void {
		const background = serialized.background;
		const backgroundColor = ( background && background.color != null ? background.color : 0xffffff );
		const backgroundAlpha = ( background && background.alpha != null ? background.alpha : 1.0 );
		if( EShapeDefaults.IS_EDIT_MODE ) {
			const canvasBackground = canvas.background;
			canvasBackground.color = backgroundColor;
			canvasBackground.alpha = backgroundAlpha;
		} else {
			const canvasContainerBackground = canvasContainer.background;
			canvasContainerBackground.color = backgroundColor;
			canvasContainerBackground.alpha = backgroundAlpha;
		}
	}

	static toPieceData(
		controller?: DDiagramBaseController | null,
		pieces?: string[] | null
	): Promise<Map<string, EShapeEmbeddedDatum>> | undefined {
		if( pieces && 0 < pieces.length && controller ) {
			return new Promise(( resolve ): void => {
				const mappings = new Map<string, EShapeEmbeddedDatum>();
				const size = pieces.length;
				let finished = size;
				const onFinished = (): void => {
					finished -= 1;
					if( finished <= 0 ) {
						resolve( mappings );
					}
				};
				const load = ( piece: string ): void => {
					controller.piece.getByName( piece ).then(( found ): void => {
						const serialized = this.toSerialized( found );
						const width = serialized.width;
						const height = serialized.height;
						const container = new EShapeEmbeddedLayerContainer( width, height );
						const manager = new EShapeResourceManagerDeserialization(
							serialized.resources, serialized.tags
						);
						const datum = new EShapeEmbeddedDatum(
							serialized.name, width, height, container
						);
						mappings.set( piece, datum );
						this.newLayer( serialized, container, manager ).then( onFinished, onFinished );
					}, onFinished );
				};
				for( let i = 0; i < size; ++i ) {
					load( pieces[ i ] );
				}
			});
		}
	}
}
