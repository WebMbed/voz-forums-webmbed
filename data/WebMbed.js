(function(self) {
  'use strict';
  var $ = jQuery;

  var page = $('.page');
  var thread = $('#collapseobj_threadreview');
  var links = $('td.alt1 a');
  var muteRemainingUnmuted = function() {};

  self.port.on('prefs', showVideos);

  function showVideos(prefs) {
    var videos = $([]);

    $(window).resize(resize);
    setTimeout(resize, 50);

    links.each(function() {
      var url = this.href;

      if (/\/redirect\/index.php/.test(url)) {
        url = unescape(url.split('link=')[1]);
      }

      if (!/\.webm$/.test(url)) return;

      var nsfw = false;
      if (!prefs.nsfw) {
        if (this.nextSibling && this.nextSibling.data) {
          nsfw = /NSFW/i.test(this.nextSibling.data);
          this.nextSibling.data = this.nextSibling.data.replace(/NSFW/i, '');
        }

        if (!nsfw && this.previousSibling && this.previousSibling.data) {
          nsfw = /NSFW/i.test(this.previousSibling.data);
          this.previousSibling.data =
            this.previousSibling.data.replace(/NSFW/i, '');
        }

        if (!nsfw && this.parentElement.childNodes[1]) {
          nsfw = this.parentElement.childNodes[1].nodeName === 'BR' &&
            /NSFW/i.test(this.parentElement.firstChild.data);
        }
      }

      if (nsfw) {
        displayNSFWWarning(this);
      } else {
        makeVideo(this);
      }

      function displayNSFWWarning(that) {
        var button = $('<button>Show NSFW Content</button>');

        button.addClass('webmbed-nsfw-button');

        $(that).replaceWith(button);

        button.click(function() {
          makeVideo(button);
        });
      }

      function makeVideo(that) {
        var video = $('<video>');

        video.attr({
          src: url,
          preload: 'metadata'
        });

        video.prop({
          controls: prefs.controls,
          loop: prefs.loop,
          muted: prefs.muted || null
        });

        if (!nsfw && (prefs.mode === 0 || prefs.mode === 3)) {
          video.on('mouseenter', function() {
            this.play();
          });

          if (prefs.mode === 0) {
            video.on('mouseleave', function() {
              this.pause();
            });
          }
        }

        if (!video.controls) {
          video.on('click', function() {
            if (this.paused) {
              this.play();
            } else {
              this.pause();
            }
          });
        }

        if (prefs.mode === 1 && !nsfw) {
          video.on('inview', function(event, inview) {
            if (inview) {
              this.play();
            } else {
              this.pause();
            }
          });
        }

        $(that).replaceWith(video);
        videos.push(video);

        if (prefs.muted) {
          var button = $('<img>');
          button.attr('src', prefs.unmuteImageURL);
          button.attr('title', 'Enable audio');

          button.css({
            display: 'none',
            marginBottom: '2px'
          });

          button.click(function toggleMute() {
            if (video.prop('muted')) {
              muteRemainingUnmuted();
              unmute();
              muteRemainingUnmuted = mute;
            } else {
              mute();
            }
          });

          video.before(button);

          video.on('loadeddata', function() {
            if (this.mozHasAudio) {
              button.css('display', 'block');
            }
          });
        }

        function unmute() {
          video.prop('muted', null);
          button.attr('src', prefs.muteImageURL);
          button.attr('title', 'Disable audio');
        }

        function mute() {
          video.prop('muted', true);
          button.attr('src', prefs.unmuteImageURL);
          button.attr('title', 'Enable audio');
        }
      }
    });

    function resize() {
      videos.each(function() {
        var vpH = $(window).width() - 30;

        if (page.get(0)) {
          this.css('max-width', Math.min(vpH, page.width() - 30) + 'px');
        } else if (thread.get(0)) {
          this.css('max-width', Math.min(vpH, thread.width() - 125) + 'px');
        } else {
          this.css('max-width', vpH + 'px');
        }

        if (prefs.muted) {
          var button = this.prev();

          button.css({
            marginLeft: this.width() - button.width()
          });
        }

        this.css('max-height', window.innerHeight + 'px');
      });
    }
  }
})(self);
