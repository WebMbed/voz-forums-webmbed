var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var package = require("sdk/simple-prefs");

var nsfwImageURL = self.data.url('nsfw.jpg');
var transparentImageURL = self.data.url('transparent.png');
var muteImageURL = self.data.url('mute-m.png');
var unmuteImageURL = self.data.url('unmute-m.png');

pageMod.PageMod({
  include: "*.vozforums.com",
  contentScriptWhen: "ready",

  contentScriptFile: [
    self.data.url('jquery-1.11.1.min.js'),
    self.data.url('jquery.inview.min.js'),
    self.data.url('WebMbed.js')
  ],

  onAttach: function(worker)  {
    function emit() {
      package.prefs.nsfwImageURL = nsfwImageURL;
      package.prefs.transparentImageURL = transparentImageURL;
      package.prefs.muteImageURL = muteImageURL;
      package.prefs.unmuteImageURL = unmuteImageURL;
      worker.port.emit('prefs', package.prefs);
    }

    emit();
    package.on('', emit);
  }
});
