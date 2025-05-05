// ==UserScript==
// @name         Torn Stat Regen Timer (Server Timestamp Synced)
// @namespace    torn.regen.timer.timestamp
// @version      2.9
// @description  Tampilkan waktu hingga energy, nerve, dan happy penuh secara real-time, disinkronkan dengan server timestamp API
// @author       Enma [3604249]
// @match        https://www.torn.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const apiKey = 'API_KEY_DISINI'; // Ganti dengan API key milikmu

  const box = document.createElement('div');
  box.style.position = 'fixed';
  box.style.top = '20px';
  box.style.left = '20px';
  box.style.zIndex = '99999';
  box.style.background = 'rgba(0, 0, 0, 0.3)';
  box.style.color = '#fff';
  box.style.padding = '10px';
  box.style.borderRadius = '8px';
  box.style.fontSize = '13px';
  box.style.fontFamily = 'Arial, sans-serif';
  box.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
  box.style.minWidth = '240px';
  box.style.pointerEvents = 'none';
  box.style.userSelect = 'none';
  box.innerText = 'Loading...';
  document.body.appendChild(box);

  let stats = {};
  let serverTimeOffset = 0; // selisih antara waktu lokal dan server_time (ms)

  function formatTime(seconds) {
    if (seconds <= 0) return 'Full';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  function updateDisplay() {
    const localNow = Date.now();
    const serverNow = Math.floor((localNow + serverTimeOffset) / 1000);

    let output = `<strong>Stat Regen Timer:</strong><br>`;
    ['energy', 'nerve', 'happy'].forEach(stat => {
      const bar = stats[stat];
      if (!bar) return;

      const remaining = Math.max(0, bar.fulltime - (serverNow - stats._server_time));
      output += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${formatTime(remaining)}<br>`;
    });

    box.innerHTML = output;
  }

  async function fetchStats() {
    try {
      const [barsRes, timeRes] = await Promise.all([
        fetch(`https://api.torn.com/user/?selections=bars&key=${apiKey}`),
        fetch(`https://api.torn.com/user/?selections=timestamp&key=${apiKey}`)
      ]);

      const barsData = await barsRes.json();
      const timeData = await timeRes.json();

      if (barsData.error) throw new Error(barsData.error.error);
      if (timeData.error) throw new Error(timeData.error.error);

      const localNow = Date.now();
      const serverNow = timeData.timestamp * 1000;
      serverTimeOffset = serverNow - localNow;

      barsData._server_time = timeData.timestamp;
      stats = barsData;

      updateDisplay();
    } catch (err) {
      box.innerHTML = `<span style="color: red">Error: ${err.message}</span>`;
    }
  }

  fetchStats();
  setInterval(fetchStats, 15000); // Ambil ulang data tiap 15 detik
  setInterval(updateDisplay, 1000); // Update tampilan tiap 1 detik
})();
