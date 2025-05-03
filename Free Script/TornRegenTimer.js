// ==UserScript==
// @name         Torn Stat Regen Timer
// @namespace    torn.regen.timer
// @version      1.7
// @description  Displays accurate time until energy, nerve, and happy are full.
// @author       Enma [3604249]
// @match        https://www.torn.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

// API key = Minimal Access
  const apiKey = 'YOUR_API_KEY_HERE';

  const box = document.createElement('div');
  box.style.position = 'fixed';
  box.style.top = '20px';
  box.style.left = '20px';
  box.style.zIndex = '99999';
  box.style.background = 'rgba(0, 0, 0, 0.1)';
  box.style.color = '#fff';
  box.style.padding = '15px';
  box.style.borderRadius = '10px';
  box.style.fontSize = '11px';
  box.style.fontFamily = 'Arial, sans-serif';
  box.style.boxShadow = '0 0 5px rgba(0,0,0,0.1)';
  box.style.minWidth = '250px';
  box.style.cursor = 'move';
  box.style.pointerEvents = 'none'; 
  box.innerText = 'Loading...';
  document.body.appendChild(box);

  let isDragging = false;
  let offsetX, offsetY;

  box.addEventListener('mousedown', function (e) {
    isDragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
    box.style.opacity = '0.8';
    box.style.pointerEvents = 'auto';
  });

  document.addEventListener('mousemove', function (e) {
    if (isDragging) {
      box.style.left = `${e.clientX - offsetX}px`;
      box.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', function () {
    if (isDragging) {
      isDragging = false;
      box.style.opacity = '1';
      box.style.pointerEvents = 'none'; 
    }
  });

  function formatTime(seconds) {
    if (seconds <= 0) return 'Full';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  async function fetchStats() {
    try {
      const res = await fetch(`https://api.torn.com/user/?selections=bars&key=${apiKey}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.error);

      let output = `<strong>Full Regen In:</strong><br>`;

      ['energy', 'nerve', 'happy'].forEach(stat => {
        const bar = data[stat];
        const current = bar.current;
        const maximum = bar.maximum;
        const increment = bar.increment;
        const interval = bar.interval;
        const ticktime = bar.ticktime;

        if (current >= maximum) {
          output += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: Full<br>`;
        } else {
          const needed = maximum - current;
          const ticks = Math.ceil(needed / increment);
          const seconds = ticktime + ((ticks - 1) * interval);
          output += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${formatTime(seconds)}<br>`;
        }
      });

      box.innerHTML = output;
    } catch (err) {
      box.innerHTML = `<span style="color: red">Error: ${err.message}</span>`;
    }
  }

  fetchStats();
  setInterval(fetchStats, 5000);
})();
