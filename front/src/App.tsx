import React, { Component, createRef, RefObject } from 'react';
import JSMpeg from 'jsmpeg-player';
import logo from './logo.svg';
import './App.css';

export default class App extends Component {
  state = {
    src: '',
    time: '',
    motion: false
  }

  private player;
  video: RefObject<HTMLVideoElement> = createRef();
  canvas: RefObject<HTMLCanvasElement> = createRef();

  loadImage = () =>
    fetch('http://192.168.0.110:3000/api/image')
      .then(res => res.json())
      .then(data => {
        console.log(data)
        this.setState({
          // src: `data:image/jpeg;base64,${Buffer.from(data.image).toString('base64')}`,
          motion: data.motion,
          time: data.time
        })
      })

  componentDidMount() {
    if (!this.canvas.current) throw new Error();
    this.player = new JSMpeg.Player(`ws://192.168.0.110:8082`, { canvas: this.canvas.current });
  }

  componentWillUnmount() {
    this.player.destroy();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>

        {/* <img src={this.state.src} alt="webcam"/> */}
        <canvas ref={this.canvas} style={{
            maxWidth: '100%',
            height: 'auto'
        }}  />
        {
          this.state.motion ? 'MOVING' : 'not moving'
        }
        {
          this.state.time
        }
      </div>
    );
  }
}