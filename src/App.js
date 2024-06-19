import './App.css';
import React from 'react';
import FiveDaysWeatherForecast from './Component/FiveDaysWeatherForecast';

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <h1>Weather App</h1>
        <FiveDaysWeatherForecast />
      </div>
    );

  };

};

export default App;
