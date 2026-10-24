const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const rawWeather = {
  name: 'London', sys: { country: 'GB', sunrise: 1700000000, sunset: 1700030000 },
  main: { temp: 15, feels_like: 14, humidity: 70, pressure: 1000 },
  weather: [{ description: 'clear', icon: '01d' }], wind: { speed: 2 },
  clouds: { all: 0 }, visibility: 10000
};

function loadService(env) {
  const context = { exports: {}, process: { env }, require(name) {
    if (name === 'axios') return { create: () => ({ get: async () => ({ data: rawWeather }) }) };
    if (name === 'node-cache') return class { get() {} set() {} };
    return { logError() {} };
  } };
  vm.runInNewContext(source('services/weatherService.js'), context);
  return context.exports;
}

function loadUI() {
  const nodes = {};
  const callbacks = [];
  const ui = { console: { log() {} }, Date, Math,
    navigator: { geolocation: { getCurrentPosition(success, failure) { callbacks.push({ success, failure }); } } },
    document: { getElementById(id) { return nodes[id] || (nodes[id] = { style: {}, addEventListener() {} }); } }
  };
  vm.createContext(ui);
  vm.runInContext(source('public/script.js'), ui);
  return { ui, nodes, callbacks, search(city) {
    nodes.cityInput.value = city;
    return vm.runInContext('searchWeather()', ui);
  } };
}

const weather = city => ({ city, country: 'GB', temperature: 15, feelsLike: 14,
  humidity: 70, pressure: 1000, description: 'clear', icon: '01d', wind: 2,
  cloudiness: 0, visibility: 10000, sunrise: '2023-11-14T06:00:00Z', sunset: '2023-11-14T18:00:00Z' });
const reply = data => ({ ok: true, json: async () => ({ success: true, data }) });
const forecast = city => ({ forecast: [{ timestamp: '2026-10-24', temperature: 15,
  description: city, icon: '01d', rain: 0 }] });

async function run() {
  const env = {};
  const express = () => ({ use() {}, get() {}, listen() {} });
  express.json = express.static = () => {};
  vm.runInNewContext(source('server.js'), { process: { env }, module: {}, console: { log() {} }, require(name) {
    if (name === 'dotenv') return { config() { env.OPENWEATHER_API_KEY = 'test'; } };
    if (name === './routes/weather') return loadService(env);
    if (name === 'express') return express;
    if (name === 'cors') return () => {};
    return { errorHandler() {} };
  } });
  console.log('PASS: environment configuration loads before weather routes');

  const service = loadService({ OPENWEATHER_API_KEY: 'test' });
  const city = await service.getCurrentWeather('London');
  const coords = await service.getWeatherByCoords(51, 0);
  assert.equal(JSON.stringify(coords), JSON.stringify(city));
  const first = loadUI();
  first.ui.result = coords;
  vm.runInContext('displayWeather(result)', first.ui);
  assert.equal(first.nodes.visibility.textContent, '10.0 km');
  assert.ok(!first.nodes.sunrise.textContent.includes('Invalid'));
  assert.ok(!first.nodes.sunset.textContent.includes('Invalid'));
  console.log('PASS: coordinate results include valid visibility and sun times');

  const test = loadUI();
  let fail = false;
  test.ui.fetch = async url => url.includes('/forecast/')
    ? (fail ? { ok: false } : reply(forecast('London'))) : reply(weather(fail ? 'Paris' : 'London'));
  await test.search('London');
  assert.ok(test.nodes.forecastCards.innerHTML.includes('London'));
  fail = true;
  await test.search('Paris');
  assert.equal(test.nodes.cityName.textContent, 'Paris, GB');
  assert.equal(test.nodes.forecastCards.innerHTML, '');
  assert.equal(test.nodes.forecastContainer.style.display, 'none');
  assert.equal(test.nodes.errorMessage.style.display, 'block');
  console.log('PASS: failed forecast clears previous city and displays an error');

  let release;
  test.ui.fetch = url => url.includes('/current/London') ? new Promise(resolve => { release = resolve; })
    : Promise.resolve(reply(url.includes('/forecast/') ? forecast('Paris') : weather('Paris')));
  const older = test.search('London');
  await test.search('Paris');
  release(reply(weather('London')));
  await older;
  assert.equal(test.nodes.cityName.textContent, 'Paris, GB');
  assert.ok(test.nodes.forecastCards.innerHTML.includes('Paris'));
  console.log('PASS: delayed earlier searches cannot overwrite a newer location');

  vm.runInContext('useGeolocation()', test.ui);
  assert.equal(test.nodes.forecastCards.innerHTML, '');
  assert.equal(test.nodes.forecastContainer.style.display, 'none');
  await test.search('Paris');
  await test.callbacks[0].success({ coords: { latitude: 51, longitude: 0 } });
  test.callbacks[0].failure({ message: 'old failure' });
  assert.equal(test.nodes.cityName.textContent, 'Paris, GB');
  assert.equal(test.nodes.errorMessage.style.display, 'none');
  console.log('PASS: geolocation clears the forecast and ignores superseded callbacks');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
