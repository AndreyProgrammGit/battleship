import React from 'react'
import './Header.scss'
import logo from '../../assets/images/battleship_logo.png'

const Header = ({ currentShipSize, shipsToPlace, orientation, setOrientation, setCurrentShipSize }) => {
  console.log(shipsToPlace)
  return (
    <div style={{ marginBottom: '1rem' }} className='container_header'>
      <div className='header'>
        <div className="logo" style={{transform: shipsToPlace[1] === 0 ? 'translateX(155%)' : ''}}><span>⚓</span> Морской бой <span>🎯</span></div>
        {/* <div className="logo"><img src={logo} width={100}/></div> */}
        {shipsToPlace[1] > 0 ? (
          <>
            <h3>Выберите корабль для расстановки:</h3>
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

            <div className='orientation'>
              <h3>Положения корабля:</h3>
              <button onClick={() =>
                setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))
              }>
                {orientation === 'horizontal' ? 'Горизонтальное' : 'Вертикальное'}
              </button>
            </div></>
        ) : null}
      </div>
    </div>
  )
}

export default Header
