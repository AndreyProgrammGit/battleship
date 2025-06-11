import React from 'react'
import './Header.scss'

const Header = ({currentShipSize, shipsToPlace, orientation, setOrientation, setCurrentShipSize}) => {
    console.log(shipsToPlace)
  return (
    <div style={{ marginBottom: '1rem' }} className='container_header'>
        <h3>Корабли для расстановки:</h3>
        <ul>
          {[4, 3, 2, 1].map((size) => (
            <li
              key={size}
              style={{
                fontWeight: currentShipSize === size ? 'bold' : 'normal',
                color: shipsToPlace[size] === 0 ? '#888' : '#000',
                cursor: shipsToPlace[size] > 0 ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (shipsToPlace[size] > 0) setCurrentShipSize(size);
              }}
            >
              {size}-палубный: {shipsToPlace[size]} шт
            </li>
          ))}
        </ul>

        <button onClick={() =>
          setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))
        }>
          Поворот ({orientation})
        </button>
      </div>
  )
}

export default Header
