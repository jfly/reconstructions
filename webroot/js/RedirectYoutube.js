var RedirectYoutube = {};
(function () {
    RedirectYoutube.getVideos = function(callback) {
      if(!yt) {
        alert("This does not appear to be a youtube page");
        return;
      }
      if(!yt.playerConfig) {
        // Assume we're on an ipad...
        //
        // The html5 video tag isn't created until after the still
        // image is clicked on. This seems to simulate the click =).
        koya.onEvent(null, '5_0');
        setTimeout(function() {
          var videos = document.getElementsByTagName("video");
          if(videos.length === 0) {
            alert("Couldn't find any video tags, giving up");
            return;
          }
          if(videos.length != 1) {
            alert("More than one video tag found! Just picking the first one.");
          }
          callback({ 'ipad': videos[0].src });
        }, 0);
      } else {
        // Regular youtube
        var encodings = yt.playerConfig.args.url_encoded_fmt_stream_map.split(',');
        var videos = {};
        for (var i = 0; i < encodings.length; i++) {
          var attributes = encodings[i].split('&');
          var attrDict = {};
          for (var j = 0; j < attributes.length; j++) {
            var key_val = attributes[j].split('=');
            attrDict[key_val[0]] = decodeURIComponent(key_val[1]);
          }
          videos[attrDict.type + '-' + attrDict.quality] = attrDict.url;
        }
        callback(videos);
      }
    };
    RedirectYoutube.go = function(origin) {
      RedirectYoutube.getVideos(function(videos) {
          document.location.href = origin + "/youtube.html?videos=" + encodeURIComponent(JSON.stringify(videos));
      });
    };
})();
