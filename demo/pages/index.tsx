import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { createEmptyPreviewImage, useDrag, useDragLayer, useDrop } from 'use-dnd';

declare module 'use-dnd' {
    interface DragTypeItemContentMap {
        x: string;
    }
}

function DragItem({ name }: { name: string }) {
    const [, drag, dragPreview] = useDrag(() => ({
        type: 'x',
        item: name,
    }), [name]);

    useEffect(() => {
        dragPreview(createEmptyPreviewImage());
    }, [dragPreview]);

    return <div ref={drag}>{name}</div>;
}

function DragLayer() {
    const { dragging, content, x, y } = useDragLayer(() => ({
        type: 'x',
        collect: info => ({
            dragging: Boolean(info.itemType),
            content: info.item,
            x: info.event?.clientX,
            y: info.event?.clientY,
        })
    }), []);

    if (!dragging) {
        return null;
    }

    return <div style={{
        pointerEvents: 'none',
        position: 'fixed',
        border: '2px solid yellow',
        left: x,
        top: y,
    }}>{content ?? <em>foreign</em>}</div>;
}

const Home: NextPage = () => {
    const [text, setText] = useState('Drop here');

    const [{ isDragging }, drop] = useDrop(() => ({
        type: 'x',
        allowForeign: true,
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
        }),
        drop(data) {
            setText(data.item);
        }
    }), []);
    
    return <>
        <DragLayer />
        <DragItem name="Item A" />
        <DragItem name="Item B" />
        <DragItem name="Item C" />
        <div style={{ color: isDragging ? 'red' : undefined }} ref={drop}>{text}</div>
    </>;
};

export default Home;
