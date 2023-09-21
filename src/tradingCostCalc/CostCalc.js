import React, { useState, useEffect } from "react";
import socketIOClient from 'socket.io-client';
import axios from "axios";

import '../App.css'
import { calculateNewValue } from "@testing-library/user-event/dist/utils";
const SOCKET_ENDPOINT = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
const API_ENDPOINT = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

export default function CostCalc() {

  const [btcPrice, setBtcPrice] = useState(null);
  const [initialValue, setInitialValue] = useState(0);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderType, setOrderType] = useState('');
  const [btcQuantity, setBtcQuantity] = useState('');
  const [priceBTCUSDT, setPriceBTCUSDT] = useState(0);
  const [takeBtcValue, setBtcTakePrice] = useState(0);
  const [leverage, setLeverage] = useState(0);
  const [getNotionalValue, setNotionalValue] = useState(0);
  const [initialMargin, setInitialMargin] = useState(0)
  const [inpdirection, setInpdirection] = useState(0);
  const [getorder, setOrder] = useState('')
  const [direction, setDirection] = useState(0)

  const handleInitialAmount = (event) => {
    setInitialValue(event.target.value)
    setButtonVisible(event.target.value !== '');
  }

  const handleOrderChange = (event) => {
    setOrder(event.target.value)
    if(getorder === 'L'){
      setDirection(1)
    } else if(getorder === 'S') {
      setDirection(-1)
    }
  }

  const handleOrderTypeChange = (e) => {
    setButtonVisible(false)
    setOrderType(e.target.value);
    console.log("Inside the handleOrderType", orderType)
    setButtonVisible(e.target.value !== '');
  };

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

  const handleAddOrder = () => {

    document.getElementById('fname').disabled = true;
    document.getElementById('button').style.display = 'none'
    if (orders.length < 10) {
      setOrders([...orders, {}]); // Add an empty object to the orders array
    }
  };

  function takePrice() {
    // Display the current value from the btcPrice variable
    const inputValue = document.getElementById("btcInput").value = btcPrice.toFixed(2);
    setBtcTakePrice(inputValue)

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

  console.log("getorder", getorder)

  

  console.log("direction", direction)
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
      <div className="dummy">
        <p>Equivalent Value in USDT:</p>
        {btcPrice !== null ? (
          <p>1 BTC = ${btcPrice.toFixed(2)} USDT</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="input-box">
        <label for="fname">Initial Balance in USDT<sup style={{ color: 'red' }}>*</sup>:</label>
        <input type="number" id="fname" name="fname" onChange={handleInitialAmount}></input>
        {buttonVisible && <button type="submit" id="button" name="name" value="Next" onClick={handleAddOrder}> Add Order </button>}

      </div>
      <br />
      {orders.map((order, index) => (
        <div key={index}>
          {(
            <div>
              <label for="fname">Limit order or Stop order or Market order (L/S/M)<sup style={{ color: 'red' }}>*</sup>:</label>
              <select type="select" name="orderType" id="orderType" value={orderType} onChange={handleOrderTypeChange}>
                <option value="">Select Order Type...</option>
                <option value="L">Limit order</option>
                <option value="S">Stop order</option>
                <option value="M">Market order</option>
              </select>
              {/* <input type="number" id="fname" name="fname" onChange={handleInitialAmount}></input> */}
              {/* {buttonVisible && <button type="submit" id="button" name="name" value="Next" onClick={()=> setButtonVisible(true)}> Next </button>} */}

            </div>
          )} <br />
          {orderType ==="L" || orderType === "S" ?
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
          <label> Order Price of 1 BTC in USDT<sup style={{ color: 'red' }}>*</sup>:
            <input
              type="number"
              name="BTCUSDT"
              id="btcInput"
              readOnly
            />
          </label>
          <button type="submit" onClick={takePrice}>Click Here Take Price</button> <br /><br />
          <label>Leverage<sup style={{ color: 'red' }}>*</sup>:
            <input
              type="number"
              className="leverage"
              id="leverage"
              onChange={(event) => setLeverage(event.target.value)} />
          </label> 
          <button type="submit" onClick={calculateNotionalValue}>Get Notional Value</button><br /><br />
          <label>Notional Value<sup style={{color: "red"}}>*</sup>
          <input type="number" id="notioalValue" readOnly /></label>
          <button type="submit" onClick={calculateInitialMargin}>Get Initial Margin</button><br /><br />
          <label>Initial Margin<sup style={{color: "red"}}>*</sup>
            <input
            type="number"
            className="initialMargin"
            id= "initialMargin" readOnly/>
          </label>
          <label for="fname">Please select Long Order or Short Order (L/S):<sup style={{ color: 'red' }}>*</sup>:</label>
          <select type="select" name="orderType" id="orderType" value={getorder} onChange={handleOrderChange}>
                <option value="">Select Order Type...</option>
                <option value="L">Limit order</option>
                <option value="S">Stop order</option>
          </select>
          </>): null}
        </div>
      ))}
    </div>
  )
}



