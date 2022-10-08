import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { createEmptyPreviewImage, useDrag, useDragLayer, useDrop } from 'use-dnd';

declare module 'use-dnd' {
    interface DragTypeItemContentMap {
        x: string;
        y: string;
    }
}

function DragItem({ name, type }: { name: string, type: string }) {
    const [, drag, dragPreview] = useDrag(() => ({
        type,
        item: name,
    }), [type, name]);

    useEffect(() => {
        dragPreview(createEmptyPreviewImage());
    }, [dragPreview]);

    return <div ref={drag}>{name}</div>;
}

function DragLayer({ type, color }: { type: 'x' | 'y', color: string }) {
    const { dragging, content, x, y } = useDragLayer(type, info => ({
        dragging: Boolean(info.itemType),
        content: info.item,
        x: info.event?.clientX,
        y: info.event?.clientY,
    }));

    if (!dragging) {
        return null;
    }

    return <div style={{
        pointerEvents: 'none',
        position: 'fixed',
        border: `2px solid ${color}`,
        left: x,
        top: y,
    }}>{content ?? <em>foreign</em>}</div>;
}

const Home: NextPage = () => {
    const [text, setText] = useState('Drop here');

    const [{ isDragging: isDraggingLetter, isOver: isOverLetter }, dropLetter] = useDrop(() => ({
        accept: 'x',
        acceptForeign: true,
        hover({ event }) {
            if (event.ctrlKey) {
                event.dataTransfer!.dropEffect = 'copy';
            }
            else {
                event.dataTransfer!.dropEffect = 'move';
            }
        },
        collect: data => ({
            isDragging: Boolean(data.itemType),
            isOver: data.isOver,
        }),
        drop(data) {
            setText(data.item);
        }
    }), []);

    const [{ isDragging: isDraggingNumber, isOver: isOverNumber }, dropNumber] = useDrop(() => ({
        accept: 'y',
        acceptForeign: true,
        hover({ event }) {
            if (event.ctrlKey) {
                event.dataTransfer!.dropEffect = 'copy';
            }
            else {
                event.dataTransfer!.dropEffect = 'move';
            }
        },
        collect: data => ({
            isDragging: Boolean(data.itemType),
            isOver: data.isOver,
        }),
        drop(data) {
            setText(data.item);
        }
    }), []);
    
    return <>
        <DragLayer type="x" color="yellow" />
        <DragLayer type="y" color="lime" />
        <DragItem type="x" name="Item A" />
        <DragItem type="x" name="Item B" />
        <DragItem type="x" name="Item C" />
        <div style={{ color: isOverLetter ? 'green' : isDraggingLetter ? 'red' : undefined }} ref={dropLetter}>{text}</div>
        <DragItem type="y" name="Item 1" />
        <DragItem type="y" name="Item 2" />
        <DragItem type="y" name="Item 3" />
        <div style={{ color: isOverNumber ? 'green' : isDraggingNumber ? 'red' : undefined }} ref={dropNumber}>{text}</div>
    </>;
};

export default Home;
