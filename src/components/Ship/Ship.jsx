import { useDrag } from 'react-dnd';

export default function Ship({ ship }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ship',
    item: { id: ship.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const style = {
    position: 'absolute',
    top: ship.row * 32,
    left: ship.col * 32,
    display: 'flex',
    flexDirection: ship.orientation === 'horizontal' ? 'row' : 'column',
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div ref={drag} style={style}>
      {Array.from({ length: ship.size }).map((_, idx) => (
        <div key={idx} className="cell ship" />
      ))}
    </div>
  );
}