import './Ship.css';

export const ShipDock = ({ shipsToPlace, orientation, onDragStartShip, onDragEndShip}) => {
  return (
    <div className="ship-dock">
      {Object.entries(shipsToPlace).map(([size, count]) =>
        [...Array(count)].map((_, idx) => (
          <div style={{margin: 10}}>
            <div
            key={`${size}-${idx}`}
            className={`ship ${orientation}`}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('shipSize', size); 
              e.dataTransfer.setData('orientation', orientation)
              onDragStartShip(parseInt(size), orientation)
            }}
            onDragEnd={onDragEndShip} 
          >
            {Array(parseInt(size))
              .fill(null)
              .map((_, i) => (
                <div key={i} className="ship-cell" />
              ))}
          </div>
          </div>
        ))
      )}
    </div>
  );
};