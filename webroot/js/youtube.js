( function() {

// copied from http://www.massive-interactive.nl/html5_video/smpte_test_universal.html
var url = window.location.search;
function seekFrames(nr_of_frames, fps) {
	if (video.paused === false) {
		video.pause();
	}

	var currentFrames = Math.round(video.currentTime * fps); 
	var newPos = (currentFrames + nr_of_frames) / fps;

	//var newPos = video.currentTime += 1/fps;
	//newPos = Math.round(newPos, 2) + 1/fps; 

	var str_seekInfo = "seeking to (fixed): " + newPos + "\n";
	video.currentTime = newPos; // TELL THE PLAYER TO GO HERE
	str_seekInfo += "seek done, got: " + video.currentTime + "\n";
	var seek_error = newPos - video.currentTime;
	str_seekInfo += "seek error: " + seek_error + "\n";
}

var pixelsPerSecond = 1;

function videoStateChanged() {
  var playing = !video.paused;
  var currentTime = video.currentTime;

  timelinePos.setStyle('left', currentTime*pixelsPerSecond - timelinePos.getSize().x/2);

  var pos = timelinePos.getPosition(timelineArea);
  var posSize = timelinePos.getSize();
  var leftEdge = pos.x;
  var rightEdge = pos.x + posSize.x;
  var containerSize = timelineArea.getSize();
  var scroll;
  if(rightEdge > containerSize.x) {
    scroll = timelineArea.getScroll();
    timelineArea.scrollTo(scroll.x + (rightEdge - containerSize.x), scroll.y);
  } else if(leftEdge < 0) {
    scroll = timelineArea.getScroll();
    timelineArea.scrollTo(scroll.x + leftEdge, scroll.y);
  }
}

function snapshot() {
  if(seeking) {
    return;
  }
  var scaleFactor = 0.25;
  var w = video.videoWidth * scaleFactor;
  var h = video.videoHeight * scaleFactor;
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h); 
  document.body.appendChild(canvas);
}

var timelineArea;
var timelinePos;
var timeline;
function loaded() {
  timelineArea = document.getElementById('timelineArea');
  if(!timeline) {
    timeline = document.createElement('div');
    timeline.addClass('timeline');
    timelineArea.appendChild(timeline);
  }

  function eToSeconds(e) {
    var x = e.page.x - 8 + timelineArea.scrollLeft;
    return x/pixelsPerSecond;
  }
  function stopDragging() {
    document.removeEvent('mousemove', drag);
  }
  document.addEvent('mouseup', stopDragging);
  window.addEvent('blur', stopDragging);
  window.addEvent('focus', stopDragging);
  timeline.addEvent('mousedown', function(e) {
    if(e.rightClick) {
      return;
    }
    video.currentTime = eToSeconds(e);
    e.preventDefault();
    document.addEvent('mousemove', drag);
  });
  function drag(e) {
    video.currentTime = eToSeconds(e);
  }

  timelineArea.addEvent('scroll', redrawGrid);
  
  timelinePos = document.createElement('div');
  timelinePos.addClass('timelinePos');
  timeline.appendChild(timelinePos);

  resizeTimeline();
  resizeVideo();
}

function redrawGrid() {
  var ticks = document.getElementById('ticks');
  ticks.empty();

  var scroll = timelineArea.getScroll();
  var widthPixels = video.duration*pixelsPerSecond;
  var end = Math.min(scroll.x + timelineArea.getSize().x, widthPixels);
  for(var i = scroll.x; i < end; i++) {
    if(i % 10 === 0) {
      var tick = document.createElement('div');
      tick.addClass('tick');
      tick.setStyle('left', i);
      ticks.appendChild(tick);

      var longTick = (i % 100 === 0);
      if(longTick) {
        tick.addClass('longTick');
        var tickText = document.createElement('div');
        tickText.addClass('tickText');
        var seconds = (i/pixelsPerSecond).toFixed(2);
        tickText.appendText("" + seconds + 's');
        tickText.setStyle('left', i + 5);
        ticks.appendChild(tickText);
      }
    }
  }
}

function resizeTimeline() {
  if(!timeline) {
    return;
  }
  var widthPixels = video.duration*pixelsPerSecond;
  timeline.setStyle('width', widthPixels);

  for(var i = 0; i < annotations.length; i++) {
    var annotation = annotations[i];
    annotation.refresh();
  }
  redrawGrid();
  videoStateChanged();
}

function resizeVideo() {
  var availSpace = document.body.getSize();
  var margin = document.body.getStyle('margin').toInt();
  availSpace.x -= margin*2;
  availSpace.x -= 18;// TODO - vertical scrollbar!
  availSpace.y -= margin*2;

  // ideal size
  var w1 = video.videoWidth;
  var h1 = video.videoHeight;

  // restrict by available height
  var h2 = availSpace.y;
  var w2 = (w1/h1)*h2;

  // restrict by available width
  var w3 = availSpace.x;
  var h3 = (h1/w1)*w3;

  var w = Math.min(w1, w2, w3);
  var h = Math.min(h1, h2, h3);
  video.width = w;
  video.height = h;
}

var video = null;
var seeking = false;
var annotations = [];
var FPS = 25; // TODO - where the heck should this come from?!
window.addEventListener('load', function() {
  var myURI = new URI(window.location.href);
  var videoUrl = "";
  var videoUrlBlob =  myURI.get('data');

  var parsedVideoObj = null;
  try {
    parsedVideoObj = JSON.parse(videoUrlBlob.videos);
  } catch(e) {
    alert("Invalid videos url parameter: " + videoUrlBlob.videos + "\n" + e);
    return;
  }
  if(typeof parsedVideoObj != "object") {
    alert("videos url parameter must be a string or a dict: " + videoUrlBlob.videos + ".");
    return;
  }

  var videoSelector = document.getElementById('videoQualitySelector');
  for (var key in parsedVideoObj) {
    if (parsedVideoObj.hasOwnProperty(key)) {
        var option = new Option(key, parsedVideoObj[key]);
        videoSelector.appendChild(option);
    }
  }

  video = document.getElementById('video');
  var pickVideoQuality = function (e) {
    video.src = videoSelector.value;
  };
  pickVideoQuality();
  videoSelector.addEvent('change', pickVideoQuality);
    video.addEventListener('timeupdate', function(e) {
    videoStateChanged();
  }, false);
	window.addEventListener('keydown', function(e) {
		var keyCode = e.keyCode;
		if(keyCode == 39) { // right arrow
			seekFrames(1, FPS);
      e.preventDefault();
		} else if(keyCode == 37) { // left arrow
			seekFrames(-1, FPS);
      e.preventDefault();
		} else if(keyCode == 32) { // spacebar
			if(video.paused) {
				video.play();
			} else {
				video.pause();
			}
      videoStateChanged();
      e.preventDefault();
		} else if(keyCode == 80) { // p
      snapshot();
    }

    // TODO - insert turn
    // TODO - mark start/end of solve?
    // TODO - larger seek increments
    // reposition/resize turn
    // delete/edit turn
    // can turns overlap??
    // TODO - annotations? cross/f2l 1,2,3,4/oll/pll
    // TODO - mirroring?
    // TODO - playback turn by turn
	}, false);

  var rightFrame = document.getElementById("rightFrame");
  rightFrame.addEvent('click', function(e) {
    seekFrames(1, FPS);
  });
  var leftFrame = document.getElementById("leftFrame");
  leftFrame.addEvent('click', function(e) {
    seekFrames(-1, FPS);
  });

  window.addEvent('resize', function() {
    resizeVideo();
    redrawGrid();
  });

  //TODO doesn't work? video.addEventListener('load', loaded, false);
  video.addEventListener('canplaythrough', loaded, false);

  video.addEventListener('seeking', function(e) {
    seeking = true;
  }, false);
  video.addEventListener('seeked', function(e) {
    seeking = false;
  }, false);
  video.addEventListener('ratechange', function(e) {
    
  }, false);

  var playbackRateSlider = document.getElementById('playbackRateSlider');
  var playbackRate = document.getElementById('playbackRate');

  var SLOWEST_RATE = 0;
  var FASTEST_RATE = 2;
  playbackRateSlider.min = SLOWEST_RATE;
  playbackRateSlider.max = FASTEST_RATE;
  playbackRateSlider.step = (FASTEST_RATE-SLOWEST_RATE)/100;
  playbackRateSlider.value = 1;

  function sliderChanged(e) {
    var newRate = playbackRateSlider.value.toFloat();
    video.playbackRate = newRate;
    playbackRate.value = newRate.toFixed(2) + 'x';
  }
  sliderChanged();

  playbackRateSlider.addEvent('change', sliderChanged);
  playbackRate.addEvent('change', function(e) {
    var newRate = playbackRate.value.toFloat();
    playbackRateSlider.value = newRate;
    sliderChanged();
  });
  playbackRate.addEvent('click', function(e) {
    playbackRate.select();
  });
  playbackRate.addEvent('keypress', function(e) {
    var keyCode = e.code;
    if(keyCode == 13) { // return
      playbackRate.blur();
    }
  });

  var zoomSlider = document.getElementById('zoomSlider');
  zoomSlider.min = 1;
  zoomSlider.max = 250;
  zoomSlider.step = 1;
  zoomSlider.value = 250;
  function zoomSliderChanged() {
    pixelsPerSecond = zoomSlider.value;
    resizeTimeline();
  }
  zoomSliderChanged();
  zoomSlider.addEvent('change', zoomSliderChanged);

  var annotationsDiv = document.getElementById('annotations');

  var DEFAULT_TURN_LENGTH_SECONDS = 1/5;
  var newAnnotation = document.getElementById('newAnnotation');
  newAnnotation.addEvent('click', function(e) {
    createAnnotation(video.currentTime, DEFAULT_TURN_LENGTH_SECONDS, "R");//TODO
  });

  function createAnnotation(startTime, length, contents) {
    var annotation = document.createElement('div');
    annotation.dataset.startTime = startTime;
    annotation.dataset.length = length;
    annotation.dataset.contents = contents;
    annotations.push(annotation);

    var dragger = document.createElement('div');
    dragger.setStyle('width', '100%');
    dragger.setStyle('height', '100%');
    annotation.appendChild(dragger);
    dragger.setAttribute('title', "foo bar");//TODO

    var resizerLeft = document.createElement('div');
    resizerLeft.addClass('resizer-left');
    annotation.appendChild(resizerLeft);

    var resizerRight = document.createElement('div');
    resizerRight.addClass('resizer-right');
    annotation.appendChild(resizerRight);

    annotation.refresh = function() {
      annotation.setStyle('left', annotation.dataset.startTime*pixelsPerSecond);
      annotation.setStyle('width', annotation.dataset.length*pixelsPerSecond);
      dragger.empty();
      dragger.appendText(annotation.dataset.contents);

      annotation.drag.options.grid = pixelsPerSecond / FPS;
    };
    annotation.addClass('annotation');

    annotation.addEvent('dblclick', function(e) {
      var newTurn = prompt("Turn?", annotation.dataset.contents);
      if(newTurn) {
        annotation.dataset.contents = newTurn;
        annotation.refresh();
      }
    });

    //TODO - bounds checking on annotations
    //TODO - better dealing with overlapping annotations
    //TODO - tooltip for the length of anotations (when resizing)

    function annotationChanged() {
      annotation.dataset.startTime = annotation.getStyle('left').toInt() / pixelsPerSecond;
      annotation.dataset.length = annotation.getStyle('width').toInt() / pixelsPerSecond;
    }

    annotation.drag = annotation.makeDraggable({
      handle: dragger,
      modifiers: { x: 'left', y: false },
      limit: { x: [ 0, Infinity ] }
    });
    annotation.drag.addEvent('complete', annotationChanged);

    annotation.resizeRight = annotation.makeDraggable({
      handle: resizerRight,
      modifiers: { x: 'width', y: false },
      limit: { x: [ 10, Infinity ] }
    });
    annotation.resizeRight.addEvent('complete', annotationChanged);
    annotation.resizeLeft = annotation.makeDraggable({
      handle: resizerLeft,
      modifiers: { x: 'width', y: false },
      invert: true,
      limit: { x: [ 10, Infinity ] }
    });

    var width = null;
    var left = null;
    annotation.resizeLeft.addEvent('start', function(el, e) {
      width = annotation.getSize().x;
      left = annotation.getStyle('left').toInt();
    });
    annotation.resizeLeft.addEvent('drag', function(el, e) {
      annotation.setStyle('left', left + width - annotation.getSize().x);
    });
    annotation.resizeLeft.addEvent('complete', annotationChanged);
    annotationsDiv.appendChild(annotation);

    annotation.refresh();
  }
}, false);

})();
