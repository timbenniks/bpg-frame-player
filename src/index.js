/**
 * BPG Frame Player class
 * @class BPGFramePlayer
 */
export default class BPGFramePlayer{

  /**
   * @typedef BPGFramePlayerOptions
   * @type Object
   * @property {object} node Dom node to append player to.
   * @property {int} width Width of player
   * @property {int} height Height of player
   * @property {boolean} loop Loop frames?
   * @property {boolean} autoplay Autoplay sequence?
   * @property {string} url URL to the BPH file
   * @property {string} workerUrl Where to load the webworker from
   */

  /**
   * BPGFramePlayer constructor.
   * @param {BPGFramePlayerOptions} options The default options of the frame player
   * @constructs BPGFramePlayer
   */
  constructor( options ){
    const noop = function(){};

    const defaultOptions = {
      node: document.querySelector( '.bpg-frame-player' ),
      width: 600,
      height: 300,
      loop: true,
      autoplay: true,
      debug: false,
      workerUrl: '../lib/bpgdecoder.js',
      onFrameUpdate: noop,
      onComplete: noop,
      onLoaded: noop
    }
    
    this.options = Object.assign( defaultOptions, options );
    
    this.playing = this.options.autoplay;
    this.frameIndex = 0;
    this.workerId = ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 );

    if( !this.options.url ){
      throw new Error( 'A BPG url is needed.' );
    }

    if( !window.Worker ){
      throw new Error( 'Cannot decode BPG files without web workers. See: http://caniuse.com/#feat=webworkers' );
    }

    this.createCanvas();

    this.load( ( arrayBuffer ) => {
      this.setupWorker( arrayBuffer, ( bpgDecodedData ) => {
        this.onLoaded( bpgDecodedData );
      } );
    } );
  }

  createCanvas(){
    this.bpgCanvas = document.createElement( 'canvas' );
    this.bpgCanvas.width = this.options.width;
    this.bpgCanvas.height = this.options.height;
    this.bpgCanvas.classList.add( 'bpg-frame-player' );

    this.options.node.appendChild( this.bpgCanvas );
    this.ctx = this.bpgCanvas.getContext( '2d' );
  }

  load( callback ){
    let request = new XMLHttpRequest();

    this.options.node.classList.add( 'bpg-frame-player-loading' );

    request.open( 'get', this.options.url, true );
    request.responseType = 'arraybuffer';
    request.onload = ( event )=> {
      this.log( 'Requested: ' + this.options.url );
      callback( request.response );
    }
    request.send();
  }

  setupWorker( bpgData, callback ){
    let worker = new Worker( this.options.workerUrl );
   
    worker.addEventListener( 'message', ( e )=> {
      if( e.data.type === 'log' ){
        this.log( 'Decoding BPG: ' + e.data.message );
      }

      if( e.data.type === 'res' ){
        worker.terminate();
        this.log( 'Decoded BPG: ' + this.options.url );
        callback( e.data );
      }
    } );
    
    worker.postMessage( { type: 'image', img: bpgData, meta: this.workerId } );
  }

  onLoaded( bpgDecodedData ){
    this.frames = bpgDecodedData.frames;
    this.options.node.classList.remove( 'bpg-frame-player-loading' );

    // start sequence based on duration between first and second frame
    setTimeout( ()=> { 
      requestAnimationFrame( this.renderFrame.bind( this ) );
    }, this.frames[ 0 ].duration );
    
    // render first frame
    this.draw( 0 );
    this.options.onLoaded( this.frames );
  }

  log( msg ){
    if( this.options.debug ){
      console.log( msg );
    }
  }

  goToFrame( frame ){
    this.frameIndex = Math.min( Math.max( frame, 0 ), this.frames.length - 1 );
    this.draw( this.frameIndex );
  }

  play(){
    this.playing = true;
  } 

  pause(){
    this.playing = false;
  } 

  renderFrame(){
    if( this.playing ){
      if( ++this.frameIndex >= this.frames.length ){
        if( this.options.loop ){
          this.frameIndex = 0;
        }
        else {
          this.frameIndex = this.frames.length - 1;
          this.pause();
          this.options.onComplete( this.frameIndex );
        }
      }
      
      this.draw( this.frameIndex );
    }

    let dur = this.frames[ this.frameIndex ].duration;
    setTimeout( ()=> { 
      requestAnimationFrame( this.renderFrame.bind( this ) );
    }, dur );
  }

  draw( frame ){
    this.options.onFrameUpdate( frame, this.frames.length - 1 );
    this.ctx.putImageData( this.frames[ frame ].img, 0, 0 );
  }
}