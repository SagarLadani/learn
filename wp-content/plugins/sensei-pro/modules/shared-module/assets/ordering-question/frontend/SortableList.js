/**
 * External dependencies
 */
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';

/**
 * Wrapper for making a component sortable.
 *
 * @param {Object}   props
 * @param {string}   props.id        Unique ID.
 * @param {Function} props.Component Component to render.
 * @param {boolean}  props.disabled  Whether sorting is disabled.
 */
function SortableItem( { Component, disabled = false, ...props } ) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable( { id: props.id, disabled } );

	const sortableProps = {
		style: {
			transform: CSS.Translate.toString( transform ),
			transition,
		},
		isDragging,
		...attributes,
		...listeners,
	};

	return <Component ref={ setNodeRef } { ...props } { ...sortableProps } />;
}

/**
 * @typedef Item A list item definition.
 *
 * All other props are passed on to the component.
 *
 * @property {string} id        Unique id.
 * @property {string} Component Component to render.
 */

/**
 * A sortable list of elements.
 *
 * @param {Object}   props          Component props.
 * @param {Item[]}   props.items    List items.
 * @param {boolean}  props.disabled Whether sorting is disabled.
 * @param {Function} props.onChange Change callback.
 */
export const SortableList = ( { items, disabled = false, onChange } ) => {
	const [ order, setOrder ] = useState( () => items.map( ( a ) => a.id ) );

	useEffect( () => {
		if ( onChange ) {
			onChange( order );
		}
	}, [ order ] );

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	const getItem = ( id ) => items.find( ( i ) => i.id === id );

	return (
		<DndContext
			sensors={ sensors }
			collisionDetection={ closestCenter }
			onDragEnd={ handleDragEnd }
		>
			<SortableContext
				items={ order }
				strategy={ verticalListSortingStrategy }
			>
				{ order.map( ( id ) => (
					<SortableItem
						key={ id }
						id={ id }
						disabled={ disabled }
						{ ...getItem( id ) }
					/>
				) ) }
			</SortableContext>
		</DndContext>
	);

	function handleDragEnd( event ) {
		const { active, over } = event;

		if ( active.id !== over.id ) {
			setOrder( ( oldOrder ) => {
				const oldIndex = oldOrder.indexOf( active.id );
				const newIndex = oldOrder.indexOf( over.id );

				return arrayMove( oldOrder, oldIndex, newIndex );
			} );
		}
	}
};
