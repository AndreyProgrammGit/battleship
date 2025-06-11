import React from 'react'
import './Header.scss'

const Header = ({ currentShipSize, shipsToPlace, orientation, setOrientation, setCurrentShipSize }) => {
  console.log(shipsToPlace)
  return (
    <div style={{ marginBottom: '1rem' }} className='container_header'>
      <div className='header'>
        <h3>Корабли для расстановки:</h3>
        <div className='ships_to_place'>
          <ul>
            {[4, 3, 2, 1].map((size) => (
              <li
                key={size}
                className={currentShipSize === size ? 'active' : ''}
                style={{
                  color: shipsToPlace[size] === 0 ? 'red' : '',
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
        </div>

        <button onClick={() =>
          setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))
        }>
          Поворот ({orientation})
        </button>
      </div>
    </div>
  )
}

export default Header
