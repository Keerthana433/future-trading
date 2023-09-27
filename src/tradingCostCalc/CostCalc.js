import React, { useState, useEffect } from "react";
import socketIOClient from 'socket.io-client';
import axios from "axios";

import '../App.css'
import { calculateNewValue } from "@testing-library/user-event/dist/utils";
const SOCKET_ENDPOINT = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
const API_ENDPOINT = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

export default function CostCalc() {

  const [btcPrice, setBtcPrice] = useState(0);
  const [initialValue, setInitialValue] = useState(0);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderType, setOrderType] = useState('');
  const [btcQuantity, setBtcQuantity] = useState('');
  const [takeBtcValue, setBtcTakePrice] = useState(0);
  const [leverage, setLeverage] = useState(0);
  const [getNotionalValue, setNotionalValue] = useState(0);
  const [initialMargin, setInitialMargin] = useState(0)
  const [inpdirection, setInpDirection] = useState('');
  const [getorder, setOrder] = useState('')
  const [direction, setDirection] = useState(0);
  const [isVisibleBtcPrice, setVisibleBtcPrice] = useState(false);
  const [orderPrice, setOrderPrice] = useState(0)
  const [marketOrderPrice, setMarketOrderPrice] = useState(0);
  const [isVisibleMarketBtcPrice, setVisibleMarketBtcPrice] = useState(false);
  const numberOfContracts = btcQuantity;
  const [askPrice, setAskPrice] = useState(0);
  const [nextGoTo, setNextGoTo] = useState(false);
  const [bidPrice, setBidPrice] = useState(0)
  const [assumingPrice, setAssumingPrice] = useState(0);
  const [remainingOrders, setRemainingOrders] = useState(10);
  const [showOrderType, setShowOrderType] = useState(false);
  const [completedOrderCount, setCompletedOrderCount] = useState(0);

  const openLoss = orderType === "L" || orderType === "S" ? (numberOfContracts * Math.abs(Math.min(0, direction * (marketOrderPrice - orderPrice)))).toFixed(2) : (btcQuantity * Math.abs(Math.min(0, direction * (marketOrderPrice - assumingPrice)))).toFixed(2);
  const cost = (parseFloat(initialMargin) + parseFloat(openLoss)).toFixed(2);
  const presentBalance = (parseFloat(initialValue) - parseFloat(cost)).toFixed(2)

  //no_of_btc * abs( min ( 0, direction * ( mark_price - assuming_price )))
  // const markOpenLoss = (btcQuantity * Math.abs(Math.min(0, direction * (marketOrderPrice - assumingPrice)))).toFixed(2);

  //1. Taken Initial amount 
  const handleInitialAmount = (event) => {
    setInitialValue(event.target.value)
    setButtonVisible(event.target.value !== '');
  }

  const handleInputChange = (event) => {
    setInpDirection(event.target.value);
    setDirection(0);
    setAssumingPrice(0);
    setAskPrice(0);
    setBidPrice(0);
  };

  const handleAskPriceChange = (event) => {
    setAskPrice(parseFloat(event.target.value));
  };

  const handleBidPriceChange = (event) => {
    setBidPrice(parseFloat(event.target.value));
  };

  const calculateAssumingPrice = () => {
    if (inpdirection === 'L' || inpdirection === 'l') {
      setDirection(1.0);
    } else if (inpdirection === 'S' || inpdirection === 's') {
      setDirection(-1.0);
    }

    if (direction === 1.0) {
      setAssumingPrice(askPrice * (1.0 + 0.05 / 100.0));
    } else {
      setAssumingPrice(bidPrice);
    }
  };

  //2. Getting orderType from user
  const handleOrderTypeChange = (e) => {
    setButtonVisible(false);
    setBtcQuantity('');
    setOrderType(e.target.value);
    console.log("Inside the handleOrderType", orderType)
    setButtonVisible(e.target.value !== '');
  };

  //3. If we select limit order or stop order 

  const handleAddOrder = () => {
    document.getElementById('fname').disabled = true;
    document.getElementById('button').style.display = 'none'

 setCompletedOrderCount(completedOrderCount + 1);

//  if (completedOrderCount >= 10) {
//    setOrderType('');
   
//    setCompletedOrderCount(0);
//     // if (orders.length < 10) {
//     //   setOrders([...orders, {}]); // Add an empty object to the orders array
//     // }
//   };
}
  
  // 4. Getting the 1 BTC in USDT Price from Binance WebSocket
  useEffect(() => {
    const socket = socketIOClient(SOCKET_ENDPOINT);

    socket.on('message', (message) => {
      const tradeData = JSON.parse(message);
      const newPrice = parseFloat(tradeData.p);

      if (!isNaN(newPrice)) {
        setBtcPrice(newPrice);
      }
          });

    // Fetch initial price
    fetchPrice();

    // Update price every 1 seconds
    const priceInterval = setInterval(fetchPrice, 1000);

    return () => {
      socket.close();
      clearInterval(priceInterval);
    };
  }, []);

  const fetchPrice = async () => {
    try {
      const response = await axios.get(API_ENDPOINT);
      const price = parseFloat(response.data.price);
      if (!isNaN(price)) {
        setBtcPrice(price);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  function takePrice() {
    // Display the current value from the btcPrice variable
    setVisibleBtcPrice(true)
    const inputValue = btcPrice.toFixed(2);
    setBtcTakePrice(inputValue)
  }

  function marketBtcPrice() {
    setVisibleMarketBtcPrice(true);
    const getBtcPriceValue = btcPrice;
    setMarketOrderPrice(getBtcPriceValue)
  }

  function calculateNotionalValue() {
    const notionalValue = btcQuantity * takeBtcValue
    setNotionalValue(notionalValue)
    console.log("notionalValue", notionalValue.toFixed(2))
    document.getElementById("notioalValue").value = notionalValue.toFixed(2)

  }

  function calculateInitialMargin() {
    const initialMargin = getNotionalValue / leverage
    setInitialMargin(initialMargin)
    document.getElementById("initialMargin").value = initialMargin.toFixed(2)
  }
  const calculateMarketInitialMargin = () => {
    const initialMargin = assumingPrice * btcQuantity / leverage
    setInitialMargin(initialMargin);
    document.getElementById("marketinitialmargin").value = initialMargin.toFixed(2)
  }

  useEffect(() => {
    getDirectionValue();
    setOrderPrice(btcPrice);
  }, [getorder])

  const handleOrderChange = (event) => {
    const orderValue = event.target.value;
    setOrder(orderValue);

  }

  // console.log('getorder', getorder)
  const getDirectionValue = () => {
    if (getorder === 'L') {
      setDirection(1);
    } else if (getorder === 'S') {
      setDirection(-1);
    } else {
      setDirection(0);
    }
  };
  console.log(completedOrderCount)
  console.log(presentBalance)
  // function getDirectionValue() {
  //   console.log("getOrder", getorder)
  //   if(getorder === 'L'){
  //     setDirection(1)
  //   } else if(getorder === 'S'){
  //     setDirection(-1)
  //   }
  // }

  // const handleOrderInputChange = (e, orderIndex) => {

  //   const updatedOrders = [...orders];
  //   updatedOrders[orderIndex][e.target.name] = e.target.value;
  //   setOrders(updatedOrders);
  // };

  return (
    <div className="container">
      <div className="header">
        <h5 className="firstHeader">Calculating cost for Perpetual Futures orders BTC/USDT</h5>
        <h6 className="h6">[Rates are simulated and not as per current market]</h6>
        <h6 className="h6" >Market price for 1 BTC in USDT used here   : {btcPrice ? `${btcPrice.toFixed(2)} USDT` : 0}</h6>
        <h1>Bitcoin to USDT Converter</h1>
      </div>
      {/* <div className="dummy">
        <p>Equivalent Value in USDT:</p>
        {btcPrice !== null ? (
          <p>1 BTC = ${btcPrice.toFixed(2)} USDT</p>
        ) : (
          <p>Loading...</p>
        )}
      </div> */}

      <div className="input-box">
        <label for="fname">Initial Balance in USDT<sup style={{ color: 'red' }}>*</sup>:</label>
        <input type="number" id="fname" name="fname" onChange={handleInitialAmount}></input>
        {buttonVisible && <button type="submit" id="button" className="addOrder" value="Next" onClick={handleAddOrder}> Add Order </button>}

      </div>
      <br />
      {/* {orders.map((order, index) => (
        
        <div key={index}> */}
          

          {(completedOrderCount < 10 && presentBalance === presentBalance) && (
            <div>
              <label>Limit order or Stop order or Market order (L/S/M)<sup style={{ color: 'red' }}>*</sup>:</label>
              <select type="select" name="orderType" id="orderType" value={orderType} onChange={handleOrderTypeChange}>
                <option value="">Select Order Type...</option>
                <option value="L">Limit order</option>
                <option value="S">Stop order</option>
                <option value="M">Mark order</option>
              </select>
              {/* <input type="number" id="fname" name="fname" onChange={handleInitialAmount}></input> */}
              {/* {buttonVisible && <button type="submit" id="button" name="name" value="Next" onClick={()=> setButtonVisible(true)}> Next </button>} */}

            </div>
          )} <br />
          {orderType === "L" || orderType === "S" ?
            (<>
              <label>BTC Quantity<sup style={{ color: 'red' }}>*</sup>:
                <input
                  type="number"
                  name="btcQuantity"
                  id="number"
                  value={btcQuantity}
                  onChange={(event) => setBtcQuantity(event.target.value)}
                />
              </label> <br /><br />
              <button type="submit" onClick={takePrice}>Click Here Take Price for 1 BTC in USDT</button> <br /><br />
              {isVisibleBtcPrice && <label> Order Price of 1 BTC in USDT<sup style={{ color: 'red' }}>*</sup>:
                <input
                  type="number"
                  name="BTCUSDT"
                  id="btcInput"
                  value={takeBtcValue}
                  readOnly
                />
              </label>}<br /><br />

              <label>Leverage<sup style={{ color: 'red' }}>*</sup>:
                <input
                  type="number"
                  className="leverage"
                  id="leverage"
                  onChange={(event) => setLeverage(event.target.value)} />
              </label> <br /><br />
              <button type="submit" onClick={calculateNotionalValue}>Get Notional Value</button><br /><br />
              <label>Notional Value<sup style={{ color: "red" }}>*</sup>
                <input type="number" id="notioalValue" readOnly /></label><br /><br />
              <button type="submit" onClick={calculateInitialMargin}>Get Initial Margin</button><br /><br />
              <label>Initial Margin<sup style={{ color: "red" }}>*</sup>
                <input
                  type="number"
                  className="initialMargin"
                  id="initialMargin" readOnly />
              </label><br /><br />
              <label>Please select Long Order or Short Order (L/S):<sup style={{ color: 'red' }}>*</sup>:</label>
              <select type="select" name="orderType" id="orderType" value={getorder} onChange={handleOrderChange}>
                <option value="">Select Order Type...</option>
                <option value="L">Long Order</option>
                <option value="S">Short Order</option>
              </select><br /><br />
              <button type="submit" onClick={marketBtcPrice}>Click Here Get Current Market Price 1 BTC/USDT</button><br /><br />
              {isVisibleMarketBtcPrice && (<div><label>Mark Price of 1 BTC in USDT<sup style={{ color: 'red' }}>*</sup>:
                <input
                  type="number"
                  name="BTCUSDT"
                  id="btcInput"
                  value={marketOrderPrice}
                  readOnly />
              </label><br /><br />
                <label> Open Loss :
                  <input type="number" className="openLoss" id="openLoss" value={openLoss} readOnly />
                </label><br /><br />
                <label> Cost required to open a limit order or stop order:
                  <input type="number" className="cost" id="cost" value={cost} readOnly />
                </label><br /><br />
                <label> Present Balance:
                  <input type="number" className="cost" id="cost" value={presentBalance} readOnly />
                </label></div>)}
            </>) : orderType === "M" ?
              (
                <>
                  <label>Please select Long Order or Short Order (L/S):<sup style={{ color: 'red' }}>*</sup>:</label>
                  <select type="select" name="orderType" id="orderType" value={inpdirection} onChange={handleInputChange}>
                    <option value="">Select Order Type...</option>
                    <option value="L">Long Order</option>
                    <option value="S">Short Order</option>
                  </select>
                  <br />

                  <label>
                    Ask Price:
                    <input type="number" value={askPrice} onChange={handleAskPriceChange} />
                  </label>
                  <br />

                  <label>
                    Bid Price:
                    <input type="number" value={bidPrice} onChange={handleBidPriceChange} />
                  </label>
                  <br />

                  <button onClick={calculateAssumingPrice}>Calculate Assuming Price</button>
                  <br />

                  {direction !== 0 && (
                    <p>
                      Direction: {direction === 1.0 ? 'Long' : 'Short'}
                    </p>
                  )}

                  {assumingPrice !== 0 && (
                    <p>
                      Assuming Price: {assumingPrice.toFixed(2)}
                    </p>
                  )}
                  <label>BTC Quantity<sup style={{ color: 'red' }}>*</sup>:
                    <input
                      type="number"
                      name="btcQuantity"
                      id="number"
                      value={btcQuantity}
                      onChange={(event) => setBtcQuantity(event.target.value)}
                    />
                  </label>
                  <br />
                  <label>Leverage<sup style={{ color: 'red' }}>*</sup>:
                    <input
                      type="number"
                      className="leverage"
                      id="leverage"
                      onChange={(event) => setLeverage(event.target.value)} />
                  </label> <br />
                  <button type="submit" onClick={calculateMarketInitialMargin}>Get Initial Margin</button><br /><br />
                  <label>Initial Margin<sup style={{ color: "red" }}>*</sup>
                    <input
                      type="number"
                      className="initialMargin"
                      id="marketinitialmargin" readOnly />
                  </label><br />
                  <button type="submit" onClick={marketBtcPrice}>Click Here Get Current Market Price 1 BTC/USDT</button><br /><br />
                  {isVisibleMarketBtcPrice && (<div><label>Mark Price of 1 BTC in USDT<sup style={{ color: 'red' }}>*</sup>:
                    <input
                      type="number"
                      name="BTCUSDT"
                      id="btcInput"
                      value={marketOrderPrice}
                      readOnly />
                  </label><br /><br />
                    <label> Open Loss :
                      <input type="number" className="openLoss" id="openLoss" value={openLoss} readOnly />
                    </label><br /><br />
                    <label> Cost required to open a limit order or stop order:
                      <input type="number" className="cost" id="cost" value={cost} readOnly />
                    </label><br /><br />
                    <label> Present Balance:
                      <input type="number" className="cost" id="cost" value={presentBalance} readOnly />
                    </label></div>)}
                </>
              ) : <></>}
        </div>
      // ))}
    
  )
}