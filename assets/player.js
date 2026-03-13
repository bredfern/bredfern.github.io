class AudioPlaylistPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentTrackIndex = 0;
    this.playlist = [];

    // Web Audio API properties
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
    this.animationFrameId = null;
  }

  connectedCallback() {
    const playlistAttr = this.getAttribute("playlist");
    const playPauseBtn = document.getElementById("play-pause-btn");

    try {
      this.playlist = JSON.parse(playlistAttr || "[]");
    } catch (e) {
      console.error("Failed to parse playlist attribute:", e);
      this.playlist = [];
    }

    if (this.playlist.length === 0) {
      this.shadowRoot.innerHTML = "<p>No playlist URLs provided.</p>";
      return;
    }

    this.render();

    this.audioPlayer = this.shadowRoot.querySelector("#audio-player");
    this.playlistList = this.shadowRoot.querySelector("#playlist-list");
    this.seekSlider = this.shadowRoot.querySelector("#seek-slider");
    
    this.fontSettings = "62px sans-serif";
    this.fontContent = "🎶";
    this.fontLeft = 160;
    this.fontTop = 60;


    this.currentTrackInfo = this.shadowRoot.querySelector(
      "#current-track-info",
    );
    this.volumeSlider = this.shadowRoot.querySelector("#volume-slider"); 
    this.playPauseBtn = this.shadowRoot.querySelector("#play-pause-btn");
    this.canvas = this.shadowRoot.querySelector("#visualizer-canvas");
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.font = this.fontSettings;
    this.canvasCtx.fillText(this.fontContent, this.fontLeft, this.fontiTop);

    // Event listeners
    this.audioPlayer.addEventListener("ended", this.playNext.bind(this));
    this.audioPlayer.addEventListener("pause", () => this.stopVisualizer());
    
    // The visualizer is started when the 'playing' event fires
    this.audioPlayer.addEventListener("playing", () => this.startVisualizer());
    
    this.audioPlayer.addEventListener('timeupdate', () => {
        this.seekSlider.value = this.audioPlayer.currentTime;
    });

    this.audioPlayer.onloadedmetadata = () => {
        this.seekSlider.max = this.audioPlayer.duration;
    };


    this.seekSlider.onchange = () => {
        this.audioPlayer.currentTime = this.seekSlider.value;
    };

    this.volumeSlider.onchange = () => {
        this.audioPlayer.volume = this.volumeSlider.value;
    }

    this.playPauseBtn.addEventListener("click", () => {
      if (this.audioPlayer.paused) {
        this.audioPlayer.play();
        this.playPauseBtn.style.color = "#000";
        
      } else {
        this.audioPlayer.pause();
        this.playPauseBtn.style.color = "#cecece";
      }
    });

    this.buildPlaylistUI();
    this.loadTrack(0);
  }

  disconnectedCallback() {
    this.stopVisualizer();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Create media source and connect to analyser
      this.source = this.audioContext.createMediaElementSource(
        this.audioPlayer,
      );
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
  }

  // Defines the HTML structure and CSS
  render() {
    this.shadowRoot.innerHTML = `
<style>
:host {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  padding: 0.25rem;
  width: 100%; /* Increased max-width for repos */
  box-shadow: 0 0.19rem 0.5rem rgba(0, 0, 0, 0.05);
  background-color: #cecece;
  border-radius: 0.25rem;
}

.player-container {
    padding: 0;
    margin-top: 0;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}

#visualizer-canvas {
    width: 100%;
    border-radius: 0.25rem;
    display: block;
    margin-bottom: 0.5rem;
    margin-top: 0;
    height: 7.5rem;
    background-color: #ffffff;
}

#current-track-info {
    text-align: center;
    margin: 0.5rem;
    font-weight: bold;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 88%;
}

#playlist-list {
    list-style: none;
    width: 90%;
    padding: 0.5rem;
    max-height: 12.5rem;
    overflow-y: auto;
    background: #ffffff;
    border-top: 0.1rem solid #000000;
    margin-top: 0.5rem;
    text-align: left;
}

#playlist-list li {
    padding: 0.25rem;
    border-bottom: 0.1rem solid #000000;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#playlist-list li:hover {
    background-color: #ffffff;
}

#playlist-list li.active {
    background-color: #cecece;
    color: #000000;
    font-weight: bold;
}

#custom-audio-player {
    gap: 0.25rem;
    width: 90%;
    text-align: center;
    background-color: #cecece;
    padding: 0.5rem;
    border-radius: 0.5rem;
}

#play-pause-btn {
    background-color: #ffffff;
    color: #000000;
    border: none;
    font-size: 120%;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25remx;
    cursor: pointer;
    width: auto;
    height: 3rem;
    margin-top: 1rem;
    width: 100%;
}

label {
    color: #000000;
    font-weight: bold;
}

#seek-slider, #volume-slider {
    width: 100%;
    margin-bottom: 0.25rem;
    background: transparent;
}

.slider-label {
  color: #000000;
  font-size 120%;
}

input[type=range] {
  -webkit-appearance: none;
  margin: 0.5rem 0;
  width: 100%;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 0.1rem;
  cursor: pointer;
  box-shadow: 0.1rem 0.1rem 0.1rem #000000, 0 0 0.1rem #0d0d0d;
  background: #000000;
  border-radius: 0.25rem;
  border: 0.1rem solid #010101;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 0.1rem 0.1rem 0.1rem #000000, 0 0 0.1rem #0d0d0d;
  border: 0.1rem solid #000000;
  height: 1rem;
  width: 0.5rem;
  border-radius: 0.25rem;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -0.5rem;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: #ffffff;
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 0.5rem;
  cursor: pointer;
  box-shadow: 0.1rem 0.1rem 0.1rem #000000, 0 0 0.1rem #0d0d0d;
  background: #b9e192;
  border-radius: 0.25rem;
  border: 0.1rem solid #010101;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 0.1rem 0.1rem 0.1rem #000000, 0 0 0.1rem #0d0d0d;
  border: 0.1rem solid #000000;
  height: 1rem;
  width: 0.5rem;
  border-radius: 0.25rem;
  background: #ffffff;
  cursor: pointer;
}

        </style>
        <div class="player-container">
          <div id="custom-audio-player">
            <canvas id="visualizer-canvas" width="400" height="80"></canvas>
            <label for="seek-slider" class="slider-label">Seek</label> <input type="range" id="seek-slider" class="neon-text" min="0" value="0">
            <audio id="audio-player" autoplay="false" crossOrigin="anonymous"></audio>
            <label for="volume-slider" class="slider-label">Volume</label> <input id="volume-slider" type="range" class="neon-text" min="0" max="1" step="0.01" value="1">
            <button id="play-pause-btn">▶︎‖</button>
            <div id="current-track-info">Ready to play...</div>
            <ul id="playlist-list"></ul>
          </div>
        </div>
    `;
  }

  draw() {
    this.animationFrameId = requestAnimationFrame(this.draw.bind(this));

    this.analyser.getByteFrequencyData(this.dataArray);

    const WIDTH = this.canvas.width;
    const HEIGHT = this.canvas.height;
    const bufferLength = this.dataArray.length;

    this.canvasCtx.fillStyle = "#fff";
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    let barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (this.dataArray[i] / 255) * HEIGHT;

      const r = barHeight + 10 * (i / bufferLength);
      const g = 100 * (i / bufferLength);
      const b = 20;

      this.canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
      this.canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  startVisualizer() {
    this.initAudioContext();
    // Browsers often suspend the AudioContext until the user interacts.
    if (this.audioContext.state === "suspended") {
      this.audioContext
        .resume()
        .catch((e) => console.error("AudioContext resume failed:", e));
    }

    if (!this.animationFrameId) {
      this.draw();
    }
    this.updateTrackInfo();
  }

  stopVisualizer() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.updateTrackInfo();
    this.canvasCtx.font = this.fontSettings;
    this.canvasCtx.fillText(this.fontContent, this.fontLeft, this.fontTop);
  }

  getTrackName(url) {
    const parts = url.split("/");
    let name = parts[parts.length - 1];
    name = name.substring(0, name.lastIndexOf("."));
    return name.replace(/_/g, " ").replace(/-/g, "/");
  }

  loadTrack(index) {
    if (index < 0 || index >= this.playlist.length) {
      this.stopVisualizer();
      this.currentTrackInfo.textContent = "Playlist Finished.";
      return;
    }

    this.currentTrackIndex = index;
    const url = this.playlist[this.currentTrackIndex];

    this.audioPlayer.src = url;
    this.audioPlayer.pause();
    this.stopVisualizer();

    this.updatePlaylistActiveState();
    this.updateTrackInfo();
  }

  playNext() {
    this.loadTrack(this.currentTrackIndex + 1);
  }

  updateTrackInfo() {
    const trackName = this.getTrackName(this.playlist[this.currentTrackIndex]);
    let status = "Ready to play";

    if (this.audioPlayer.paused && this.audioPlayer.currentTime > 0) {
      status = "Paused";
    } else if (this.audioPlayer.paused) {
      status = "Stopped";
    } else if (this.audioPlayer.seeking || this.audioPlayer.waiting) {
      status = "Loading";
    } else {
      status = "Now Playing";
    }

    this.currentTrackInfo.textContent = `${status}: ${trackName.substring(0, 13)}`;
  }

  updatePlaylistActiveState() {
    this.shadowRoot
      .querySelectorAll("#playlist-list li")
      .forEach((item, idx) => {
        item.classList.toggle("active", idx === this.currentTrackIndex);
      });
  }

  buildPlaylistUI() {
    this.playlistList.innerHTML = "";
    this.playlist.forEach((url, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = this.getTrackName(url);
      listItem.addEventListener("click", () => {
        this.loadTrack(index);
      });
      this.playlistList.appendChild(listItem);
    });
  }
}

customElements.define("audio-playlist-player", AudioPlaylistPlayer);
