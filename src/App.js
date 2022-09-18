import React, { Component } from 'react';
import styles from './App.module.css';

import YouTube from 'react-youtube';

// TODO: Is it possible to retrieve this on a per video basis?
const FRAMERATE = 25;

class App extends Component {
  render() {
    const opts = {
      playerVars: {
        controls: 0,
        disablekb: 1,
        iv_load_policy: 3,
      }
    };

    return (
      <div className={styles.app}>
        <YouTube
          videoId="NevGDFBfQGw"
          opts={opts}
          onReady={this._onReady}
          onStateChange={this._onStateChange}
        />
        <div>
          3d cube here?
        </div>
        <div className={styles.bottom}>
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <button onClick={() => this._onClick(false)}>&lt;</button>
          <button onClick={() => this._onClick(true)}>&gt;</button>
        </div>
      </div>
    );
  }

  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener('blur', this._handleBlur);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown);
    window.removeEventListener('blur', this._handleBlur);
  }

  // Keep the youtube iframe from stealing focus.
  _handleBlur = (event) => {
    if(document.activeElement instanceof HTMLIFrameElement) {
      setTimeout(function() {
        document.activeElement.blur();
      }, 0);
    }
  }

  _handleKeyDown = (event) => {
    if(event.key === "ArrowLeft" || event.key === "Backspace") {
      this._onClick(false);
    } else {
      this._onClick(true);
    }
  }

  _onClick = (forward) => {
    const {yt} = this.state;

    let currentTime = yt.getCurrentTime();
    let direction = forward ? 1 : -1;
    let nextTime = currentTime + direction * (1.0 / FRAMERATE);
    yt.seekTo(nextTime, true);
  }

  _onReady = (event) => {
    this.setState({ yt: event.target });
  }

  _onStateChange = (event) => {
    if(event.data === YouTube.PlayerState.PLAYING) {
      event.target.pauseVideo();
    }
  }
}

export default App;
