(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.GeepivoGadget = (function() {
    GeepivoGadget.prototype.on_story_created = function(story) {
      return $(".notification_area", this.container).html("<a href='" + story.url + "' target='_blank'>" + story.url + "</a>");
    };
    GeepivoGadget.prototype.on_story_creation_error = function(error) {
      return $(".notification_area", this.container).html(error);
    };
    GeepivoGadget.prototype.post_create_story = function(subject, message_id) {
      var story;
      story = new Story(window.gadgets.io);
      story.name = subject;
      story.pivotal_api_token = this.prefs.getString('pivotal_api_token');
      story.project_id = this.prefs.getString('project_id');
      story.story_type = this.prefs.getString('story_type');
      story.integration_id = this.prefs.getString('integration_id');
      story.requested_by = this.prefs.getString('requested_by');
      story.owned_by = this.prefs.getString('owned_by');
      return story.create(this.on_story_created, this.on_story_creation_error);
    };
    GeepivoGadget.prototype._populate_projects_dropdown_request_error_callback = function(error_message) {
      var projects_dropdown;
      alert(error_message);
      projects_dropdown = $('select[name=project_id]');
      return projects_dropdown.html('');
    };
    GeepivoGadget.prototype._populate_projects_dropdown_request_success_callback = function(projects) {
      var projects_dropdown;
      projects_dropdown = $('select[name=project_id]');
      projects_dropdown.html('');
      $.each(projects, function(i, project) {
        var opt;
        opt = $('<option />');
        opt.val(project.id);
        opt.text(project.name);
        return opt.appendTo(projects_dropdown);
      });
      return projects_dropdown.val(this.prefs.getString('project_id'));
    };
    GeepivoGadget.prototype.populate_projects_dropdown = function() {
      var projects_api;
      projects_api = new Project(window.gadgets.io);
      projects_api.pivotal_api_token = $('input[name=pivotal_api_token]').val();
      return projects_api.get_index(this._populate_projects_dropdown_request_success_callback, this._populate_projects_dropdown_request_error_callback);
    };
    GeepivoGadget.prototype.on_settings_opened_or_closed = function() {
      if ($("#settings").is(":visible")) {
        $(this).html("settings ▲");
        this.populate_projects_dropdown();
        window.gadgets.window.adjustHeight(500);
      } else {
        $(this).html("settings ▼");
        window.gadgets.window.adjustHeight(32);
      }
      return false;
    };
    function GeepivoGadget() {
      this._populate_projects_dropdown_request_success_callback = __bind(this._populate_projects_dropdown_request_success_callback, this);
      this._populate_projects_dropdown_request_error_callback = __bind(this._populate_projects_dropdown_request_error_callback, this);
      var gadget_content, i, imatch, matches, setting_input, settings;
      matches = window.google.contentmatch.getContentMatches();
      this.inputs = {};
      for (imatch in matches) {
        $.extend(this.inputs, matches[imatch]);
      }
      this.container = $("#gadget_container");
      if (this.container.length !== 1) {
        throw "Error. Can't find gadget container.";
      }
      this.prefs = new window.gadgets.Prefs();
      setting_input = function(name) {
        return $(":input[name=" + name + "]", this.container);
      };
      gadget_content = window.templates.gadget_template;
      if (!this.inputs.subject) {
        window.gadgets.window.adjustHeight(0);
      } else {
        window.gadgets.window.adjustHeight(32);
        this.container.html(gadget_content);
        this.container.show();
        settings = ["pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by"];
        for (i in settings) {
          setting_input(settings[i]).val(this.prefs.getString(settings[i]));
        }
        if (!(this.prefs.getString("pivotal_api_token") && this.prefs.getString("project_id"))) {
          $(".notification_area", this.container).html("Please fill required settings");
          $("#settings").show();
          this.on_settings_opened_or_closed();
        }
        $("a#edit_pivotal_api_token", this.container).click(__bind(function() {
          var new_token_value;
          new_token_value = prompt("Enter new Pivotal API Token:");
          if (typeof new_token_value === 'string') {
            setting_input('pivotal_api_token').val(new_token_value);
            this.populate_projects_dropdown();
          }
          return false;
        }, this));
        $(".create_story_button", this.container).click(__bind(function() {
          this.post_create_story(this.inputs.subject, this.inputs.message_id);
          return false;
        }, this));
        $("#toggle_settings_button").click(__bind(function() {
          $("#settings").toggle();
          this.on_settings_opened_or_closed();
          return false;
        }, this));
        $(".save_settings_button", this.container).click(__bind(function() {
          var i, key, val;
          for (i in settings) {
            key = settings[i];
            val = setting_input(key).val();
            this.prefs.set(key, val);
            $("#settings").hide();
            this.on_settings_opened_or_closed();
            $(".notification_area", this.container).html("Settings saved");
          }
          return false;
        }, this));
        $.merge($.fn.tipsy.defaults, {
          gravity: 'nw',
          html: true,
          offset: 5,
          opacity: 0.9
        });
        $("span.help").each(__bind(function(i, help) {
          $(help).attr('title', $(help).text());
          return $(help).html("<img src='" + window.root_url + "/images/help_icon.gif' alt='help' />");
        }, this));
      }
    }
    return GeepivoGadget;
  })();
  window.initializeGeepivoGadget = function() {
    if (!window.console) {
      window.console = {};
      console.log = function(msg) {};
      console.debug = function(msg) {};
    }
    return window.the_gadget = new window.GeepivoGadget();
  };
}).call(this);
if (typeof window.templates === 'undefined') { window.templates = {}; }
window.templates['gadget_template'] = "<div style='widh: 100px; position:absolute; top:3px; left:3px;'>\n  <button class=\"create_story_button\">Create Story</button>\n</div>\n\n<div class='notification_area' style=' position:absolute; top:3px; left:113px;'>&nbsp;</div>\n\n<div style='widh: 100px; position:absolute; top:3px; right:3px;'>\n  <a href=\"#\" id='toggle_settings_button' style='font-size: small; text-decoration:none;'>settings ▼</a>\n</div>\n\n<div style='clear:both;'></div>\n\n<div id='settings' style='font-size: small; display:none; padding-top:30px;'>\n  <input type='submit' class='save_settings_button' value=\"Save settings\" />\n\n  <fieldset>\n  <legend>Required</legend>\n\n  <div>\n    <label>Pivotal API Token\n      <span class='help'>To get an API token log in to PivotalTracker, open <em><a href='https://www.pivotaltracker.com/profile'>Profile</a></em> form, scroll down to <em>API Token section</em> and click <em>Create New Token</em>.</span>\n      <input name=\"pivotal_api_token\" disabled='disabled' />\n      <a href='#' id='edit_pivotal_api_token'>enter new api token</a>\n    </label>\n  </div>\n  \n  <div>\n    <label>Project ID\n      <span class='help'>ID of a PivotalTracker project Geepivo will create stories in. You can find project ID at the end of project URL, e.g.: https://www.pivotaltracker.com/projects/12345</span>.\n      <select name=\"project_id\" />\n    </label>\n  </div>\n\n  </fieldset>\n  \n  <fieldset>\n  <legend>Optional</legend>\n\n  <div>\n    <label>Story type (optional):\n    <span class='help'>One of following: \"feature\", \"chore\" or \"bug\". Leave the field empty to use the default value - \"feature\".</span>\n    <input name=\"story_type\" />\n    </label>\n  </div>\n  \n  <div>\n    <label>Requested by (optional):\n    <span class='help'>Optionally specify user who will be notified about story delivery and prompted to accept or reject it. By default it's the owner of API token. Enter \"Full Name\" here, as visible in Pivotal Tracker's story form.</span>.\n    <input name=\"requested_by\" />\n    </label>\n  </div>\n  \n  <div>\n    <label>Owned by (optional):\n    <span class='help'>User the story will be assigned to. By default the story is not assigned. Enter \"Full Name\" here, as visible in Pivotal Tracker's story form.</em>.</span>\n    <input name=\"owned_by\" />\n    </label>\n  </div>\n\n  <div>\n    <label>Integration ID (optional):\n    <span class='help'>Experimental hack. Configure \"External Integration\" in Pivotal Tracker and it will be filled with Story ID. Set base URL of the integration to something like <em>https://mail.google.com/mail/u/0/?shva=1#search/</em>, story ID will be prepended and you will be able to search for emails that contain links to the story.</em>.</span>\n    <input name=\"integration_id\" />\n    </label>\n  </div>\n  \n  </fieldset>\n\n</div>\n";// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

(function($) {
    
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    };
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    };
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
                
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                
                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);
                
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy) tipsy[options]();
            return this;
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        };
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        };
        
        if (!options.live) this.each(function() { get(this); });
        
        if (options.trigger != 'manual') {
            var binder   = options.live ? 'live' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
    /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable 
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
     $.fn.tipsy.autoBounds = function(margin, prefer) {
		return function() {
			var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
			    boundTop = $(document).scrollTop() + margin,
			    boundLeft = $(document).scrollLeft() + margin,
			    $this = $(this);

			if ($this.offset().top < boundTop) dir.ns = 'n';
			if ($this.offset().left < boundLeft) dir.ew = 'w';
			if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
			if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

			return dir.ns + (dir.ew ? dir.ew : '');
		}
	};
    
})(jQuery);
(function() {
  var parse_xml;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  parse_xml = function(xml_string) {
    var parser, respXML;
    if (window.DOMParser) {
      parser = new DOMParser();
      respXML = parser.parseFromString(xml_string, "text/xml");
    } else {
      respXML = new ActiveXObject("Microsoft.XMLDOM");
      respXML.async = "false";
      respXML.loadXML(xml_string);
    }
    return respXML;
  };
  window.Project = (function() {
    function Project(io) {
      this.io = io;
      this._get_index_callback = __bind(this._get_index_callback, this);
    }
    Project.prototype.get_index = function(on_success, on_error) {
      var params, projects_url, response_callback;
      projects_url = "https://www.pivotaltracker.com/services/v3/projects";
      params = {};
      params[this.io.RequestParameters.METHOD] = this.io.MethodType.GET;
      params[this.io.RequestParameters.HEADERS] = {
        "X-TrackerToken": this.pivotal_api_token,
        "Content-type": "application/xml"
      };
      params[this.io.RequestParameters.CONTENT_TYPE] = this.io.ContentType.DOM;
      response_callback = __bind(function(response) {
        return this._get_index_callback(response, on_success, on_error);
      }, this);
      return this.io.makeRequest(projects_url, response_callback, params);
    };
    Project.prototype._get_index_callback = function(response, on_success, on_error) {
      var message, projects_data, projects_dom, respXML;
      if (response.rc >= 400) {
        message = (function() {
          switch (response.rc) {
            case 401:
              return "Authentication error - check your API token and project permissions";
            default:
              return "Error retrieving list of projects";
          }
        })();
        return on_error(message);
      } else {
        respXML = parse_xml(response.text);
        projects_dom = $(respXML).find("projects project");
        projects_data = $.map(projects_dom, function(project, i) {
          return {
            id: parseInt($(project).children('id').text()),
            name: $(project).children('name').text()
          };
        });
        return on_success(projects_data);
      }
    };
    return Project;
  })();
}).call(this);
(function() {
  var parse_xml;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  parse_xml = function(xml_string) {
    var parser, respXML;
    if (window.DOMParser) {
      parser = new DOMParser();
      respXML = parser.parseFromString(xml_string, "text/xml");
    } else {
      respXML = new ActiveXObject("Microsoft.XMLDOM");
      respXML.async = "false";
      respXML.loadXML(xml_string);
    }
    return respXML;
  };
  window.Story = (function() {
    function Story(io) {
      this.io = io;
      this._response_callback = __bind(this._response_callback, this);
    }
    Story.prototype.create = function(on_success, on_error) {
      return this._create_and_update_other_id(on_success, on_error);
    };
    Story.prototype._put_update_other_id = function() {
      var params, response_callback, story_url, story_xml;
      story_url = "https://www.pivotaltracker.com/services/v3/projects/" + this.project_id + "/stories/" + this.story_id;
      params = {};
      params[this.io.RequestParameters.METHOD] = this.io.MethodType.PUT;
      params[this.io.RequestParameters.HEADERS] = {
        "X-TrackerToken": this.pivotal_api_token,
        "Content-type": "application/xml"
      };
      params[this.io.RequestParameters.CONTENT_TYPE] = this.io.ContentType.DOM;
      story_xml = "<story><integration_id>" + this.integration_id + "</integration_id><other_id>" + this.story_id + "</other_id></story>";
      console.log("update other_id xml:", story_xml);
      params[this.io.RequestParameters.POST_DATA] = story_xml;
      response_callback = function(response) {
        return console.log("put other_id response:", response.text);
      };
      return this.io.makeRequest(story_url, response_callback, params);
    };
    Story.prototype._create_and_update_other_id = function(on_success, on_error) {
      var params, response_callback, stories_url, story_xml;
      stories_url = "https://www.pivotaltracker.com/services/v3/projects/" + this.project_id + "/stories";
      params = {};
      params[this.io.RequestParameters.METHOD] = this.io.MethodType.POST;
      params[this.io.RequestParameters.HEADERS] = {
        "X-TrackerToken": this.pivotal_api_token,
        "Content-type": "application/xml"
      };
      params[this.io.RequestParameters.CONTENT_TYPE] = this.io.ContentType.DOM;
      story_xml = "<story>\n  <project_id>" + this.project_id + "</project_id>\n  <story_type>" + this.story_type + "</story_type>\n  <name>" + this.name + "</name>\n  <integration_id>" + this.integration_id + "</integration_id>\n  <requested_by>" + this.requested_by + "</requested_by>\n  <owned_by>" + this.owned_by + "</owned_by>\n</story>";
      console.log("post new story xml:", story_xml);
      params[this.io.RequestParameters.POST_DATA] = story_xml;
      response_callback = __bind(function(response) {
        return this._response_callback(response, on_success, on_error);
      }, this);
      return this.io.makeRequest(stories_url, response_callback, params);
    };
    Story.prototype._response_callback = function(response, on_success, on_error) {
      var message, respXML;
      console.log("post new story response:", response);
      if (response.rc >= 400) {
        message = (function() {
          switch (response.rc) {
            case 401:
              return "Authentication error - check your API token and project permissions";
            default:
              return "Error creating story";
          }
        })();
        return on_error(message);
      } else {
        respXML = parse_xml(response.text);
        this.url = $(respXML).find("url").text();
        console.log(this.url);
        this.story_id = $(respXML).find("id").text();
        on_success(this);
        return this._put_update_other_id();
      }
    };
    return Story;
  })();
}).call(this);
