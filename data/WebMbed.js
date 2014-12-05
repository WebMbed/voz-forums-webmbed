(function(self) {
  'use strict';
  var $ = jQuery;

  var page = $('.page');
  var thread = $('#collapseobj_threadreview');
  var links = $('td.alt1 a');
  var stopEverything = function() {};

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

      if (!prefs.nsfw && this.nextSibling) {
        var nsfw = /NSFW/i.test(this.nextSibling.data);
        if (this.nextSibling.data) {
          this.nextSibling.data = this.nextSibling.data.replace(/NSFW/i, '');
        }
      }

      var video = $('<video>');

      if (nsfw) {
        video.css('background', [
          'url(' + prefs.nsfwImageURL + ')',
          'no-repeat',
          'center',
          'center / cover',
          'transparent'
        ].join(' '));
      }

      video.attr({
        src: url,
        preload: 'metadata',
        poster: nsfw ? prefs.transparentImageURL : null
      });

      video.prop({
        controls: prefs.controls,
        loop: prefs.loop,
        muted: prefs.muted || null
      });

      if (!nsfw && (prefs.mode === 0 || prefs.mode === 3)) {
        video.on('mouseenter', function() {
          var self = this;

          stopEverything();

          self.play();

          stopEverything = function() {
            self.pause();
          };
        });

        if (prefs.mode === 0) {
          video.on('mouseleave', function() {
            this.pause();
          });
        }
      }

      if (!video.controls) {
        video.on('click', function() {
          var self = this;

          if (self.paused) {
            stopEverything();

            self.play();

            stopEverything = function() {
              self.pause();
            };
          } else {
            self.pause();
          }
        });
      }

      if (prefs.mode === 1 && !nsfw) {
        video.on('inview', function(event, inview) {
          var self = this;

          if (inview) {
            stopEverything();

            self.play();

            stopEverything = function() {
              self.pause();
            };
          } else {
            this.pause();
          }
        });
      }

      $(this).replaceWith(video);
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
            stopEverything();
            video.prop('muted', null);
            button.attr('src', prefs.muteImageURL);
            button.attr('title', 'Disable audio');
            stopEverything = toggleMute;
          } else {
            video.prop('muted', true);
            button.attr('src', prefs.unmuteImageURL);
            button.attr('title', 'Enable audio');
          }
        });

        video.before(button);

        video.on('loadeddata', function() {
          if (this.mozHasAudio) {
            button.css('display', 'block');
          }
        });
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
