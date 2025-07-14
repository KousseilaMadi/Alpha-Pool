const { contextBridge, ipcRenderer } = require('electron')
const { dialog } = require('electron')
class Timer {
  constructor(onTick = null, tickInterval = 100) {
    this.startTime = null;
    this.elapsed = 0;
    this.running = false;
    this.timerId = null;
    this.onTick = onTick; // Optional callback every tick
    this.tickInterval = tickInterval;
  }

  start() {
    if (this.running) return;
    this.startTime = Date.now() - this.elapsed;
    this.timerId = setInterval(() => {
      this.elapsed = Date.now() - this.startTime;
      if (typeof this.onTick === 'function') {
        this.onTick(this.getFormattedTime(), this.getMinutes());
      }
    }, this.tickInterval);
    this.running = true;
  }

  pause() {
    if (!this.running) return;
    clearInterval(this.timerId);
    this.running = false;
  }

  reset() {
    clearInterval(this.timerId);
    this.elapsed = 0;
    this.running = false;
    if (typeof this.onTick === 'function') {
      this.onTick(this.getFormattedTime(), this.getMinutes());
    }
  }

  getTime() {
    return this.elapsed;
  }

  getMinutes(){
    const totalSeconds = Math.floor(this.elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    return minutes;
  }

  getPrice(){
    return Math.floor(this.getMinutes() * 500 / 60)
  }

  getFormattedTime() {
    const totalSeconds = Math.floor(this.elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    // const tenths = Math.floor((this.elapsed % 1000) / 100);
    return `${hours}:${minutes}:${seconds}`;
  }
}
let tickHandler = null
const timers = []
contextBridge.exposeInMainWorld('myAPI', {
    debug: () => console.log("debug:"),
    setTickHandler: (callback) => {
        tickHandler = callback
    },
    createTimers: () => {
        for(let i = 0; i<4;i++){
            const timer = new Timer((formattedTime, minutes) => {
                tickHandler?.(i, formattedTime, minutes)
            })
            timers.push(timer)
        }
        
    },
    startTimer: (id) => timers[id].start(),
    pauseTimer: (id) => timers[id].pause(),
    stopTimer: (id) => timers[id].reset(),
    getTime: (id) => {return timers[id].getFormattedTime()},
    getPrice: (id) => {return timers[id].getPrice()},
    alert: (table, time, price) => ipcRenderer.send('alert', table, time, price),
    fetchSessions: () => ipcRenderer.send('fetchSessions'),
    fetchSessions_date: (day, month, year) => ipcRenderer.send('fetchSessions-date', day, month, year),
    fetchSessions_month: (month, year) => ipcRenderer.send('fetchSessions-month', month, year),
    updateSessionsList: (callback) => {
      ipcRenderer.on('updateSessionsList', (_, data) => callback(data))
    },
    updateHistorySessionsList: (callback) => {
      ipcRenderer.on('updateHistorySessionsList', (_, data, totalAmount) => callback(data, totalAmount))
    },
    navigateTo: (page) => {
      ipcRenderer.send('navigate-to', page)
    }
})