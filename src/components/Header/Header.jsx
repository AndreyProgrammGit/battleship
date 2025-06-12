import React from 'react'
import './Header.scss'
import logo from '../../assets/images/battleship_logo.png'

const createEmptyBoard = () =>
  Array(10)
    .fill(null)
    .map(() =>
      Array(10)
        .fill(null)
        .map(() => ({
          ship: false,
          hit: false,
          miss: false,
        }))
    );


const Header = ({ setMyBoard, setShipsToPlace,currentShipSize, shipsToPlace, orientation, setOrientation, setCurrentShipSize }) => {
  console.log(shipsToPlace)

  const flag = Object.values(shipsToPlace).every(key => key === 0);

  return (
    <div style={{ marginBottom: '1rem' }} className='container_header'>
      <div className='header'>
        <div className="logo">
          {flag ? (
            <img src={logo} width={250} style={{ transform: shipsToPlace[1] === 0 ? 'translateX(273%)' : '' }} />
          ) : (
            <>
              <span>⚓</span> Морской бой <span>🎯</span>
            </>
          )}

        </div>
        {!flag ? (
          <>
            <h3>Выберите кораблик для расстановки:</h3>
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
                    {size}-палубный: осталось {shipsToPlace[size]} шт
                  </li>
                ))}
                <button className='clear-button' style={{marginTop: '1rem', display: Object.values(shipsToPlace).find(key => key === 0) === 0 ? 'inline-block' : 'none'}}
                      onClick={() => {setCurrentShipSize(4); setShipsToPlace({ 4: 1, 3: 2, 2: 3, 1: 4 }); setMyBoard(createEmptyBoard)}}
                  >Очистить</button>
              </ul>
            </div>

            <div className='orientation'>
              <h3>Положения кораблика:</h3>
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
