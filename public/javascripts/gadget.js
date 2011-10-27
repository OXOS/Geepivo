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
      var callback_method, params, response_callback, stories_url, story_xml;
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
      callback_method = this._response_callback;
      response_callback = function(response) {
        return callback_method(response, on_success, on_error);
      };
      return this.io.makeRequest(stories_url, response_callback, params);
    };
    Story.prototype._response_callback = function(response, on_success, on_error) {
      var respXML;
      console.log("post new story response:", response);
      if (response.rc >= 400) {
        return on_error("Error creating story");
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
  window.initializeGeepivoGadget = function() {
    var container, gadget_content, i, imatch, inputs, key, matches, on_settings_opened_or_closed, on_story_created, on_story_creation_error, post_create_story, prefs, setting_input, settings;
    if (!window.console) {
      window.console = {};
      console.log = function(msg) {};
      console.debug = function(msg) {};
    }
    on_story_created = function(story) {
      return $(".notification_area", container).html("<a href='" + story.url + "' target='_blank'>" + story.url + "</a>");
    };
    on_story_creation_error = function(error) {
      return $(".notification_area", container).html(error);
    };
    post_create_story = function(subject, message_id) {
      var story;
      story = new Story(window.gadgets.io);
      story.name = subject;
      story.pivotal_api_token = prefs.getString('pivotal_api_token');
      story.project_id = prefs.getString('project_id');
      story.story_type = prefs.getString('story_type');
      story.integration_id = prefs.getString('integration_id');
      story.requested_by = prefs.getString('requested_by');
      story.owned_by = prefs.getString('owned_by');
      return story.create(on_story_created, on_story_creation_error);
    };
    on_settings_opened_or_closed = function() {
      if ($("#settings").is(":visible")) {
        $(this).html("settings ▲");
        window.gadgets.window.adjustHeight(500);
      } else {
        $(this).html("settings ▼");
        window.gadgets.window.adjustHeight(32);
      }
      return false;
    };
    matches = window.google.contentmatch.getContentMatches();
    inputs = {};
    for (imatch in matches) {
      $.extend(inputs, matches[imatch]);
    }
    for (key in inputs) {
      console.log("inputs[" + key + " ] => " + inputs[key]);
    }
    container = $("#gadget_container");
    if (container.length !== 1) {
      throw "Error. Can't find gadget container.";
    }
    prefs = new window.gadgets.Prefs();
    setting_input = function(name) {
      return $("input[name=" + name + "]", container);
    };
    gadget_content = "  <div style='widh: 100px; position:absolute; top:3px; left:3px;'>\n    <button class=\"create_story_button\">Create Story</button>\n  </div>\n  \n  <div class='notification_area' style=' position:absolute; top:3px; left:113px;'>&nbsp;</div>\n  \n  <div style='widh: 100px; position:absolute; top:3px; right:3px;'>\n    <a href=\"#\" id='toggle_settings_button' style='font-size: small; text-decoration:none;'>settings ▼</a>\n  </div>\n  \n  <div style='clear:both;'></div>\n  \n  <div id='settings' style='font-size: small; display:none; padding-top:30px;'>\n    <div>\n      <label>Pivotal API Token *\n        <input name=\"pivotal_api_token\" />\n      </label>\n      <p><small>To get an API token log in to PivotalTracker, open <em><a href='https://www.pivotaltracker.com/profile'>Profile</a></em> form, scroll down to <em>API Token section</em> and click <em>Create New Token</em>.</small></p>\n    </div>\n    \n    <div>\n      <label>Project ID *\n      <input name=\"project_id\" /></label>\n      <p><small>ID of a PivotalTracker project Geepivo will create stories in. You can find project ID at the end of project URL, e.g.: https://www.pivotaltracker.com/projects/12345</small></p>.\n    </div>\n    \n    <div>\n      <label>Story type\n      <input name=\"story_type\" /></label>\n      <p><small>One of following: \"feature\", \"chore\" or \"bug\". Leave the field empty to use the default value - \"feature\".</small></p>\n    </div>\n    \n    <div>\n      <label>Requested by:\n      <input name=\"requested_by\" /></label>\n      <p><small>Optionally specify user who will be notified about story delivery and prompted to accept or reject it. By default it's the owner of API token. Enter \"Full Name\" here, as visible in Pivotal Tracker's story form.</small></em>.\n    </div>\n    \n    <div>\n      <label>Owned by:\n      <input name=\"owned_by\" /></label>\n      <p><small>User the story will be assigned to. By default the story is not assigned. Enter \"Full Name\" here, as visible in Pivotal Tracker's story form.</small></em>.\n    </div>\n\n    <div>\n      <label>Integration ID (optional)\n      <input name=\"integration_id\" /></label>\n      <p><small>Experimental hack. Configure \"External Integration\" in Pivotal Tracker and it will be filled with Story ID. Set base URL of the integration to something like <em>https://mail.google.com/mail/u/0/?shva=1#search/</em>, story ID will be prepended and you will be able to search for emails that contain links to the story.</small></em>.\n    </div>\n    \n    <input type='submit' class='save_settings_button' value=\"Save settings\" />\n  </div>";
    if (!inputs.subject) {
      return window.gadgets.window.adjustHeight(0);
    } else {
      window.gadgets.window.adjustHeight(32);
      container.html(gadget_content).show();
      settings = ["pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by"];
      for (i in settings) {
        setting_input(settings[i]).val(prefs.getString(settings[i]));
      }
      if (!(prefs.getString("pivotal_api_token") && prefs.getString("project_id"))) {
        $(".notification_area", container).html("Please fill required settings");
        $("#settings").show();
        on_settings_opened_or_closed();
      }
      $(".create_story_button", container).click(function() {
        return post_create_story(inputs.subject, inputs.message_id);
      });
      $("#toggle_settings_button").click(function() {
        $("#settings").toggle();
        return on_settings_opened_or_closed();
      });
      return $(".save_settings_button", container).click(function() {
        var i, val, _results;
        _results = [];
        for (i in settings) {
          val = setting_input(settings[i]).val();
          prefs.set(settings[i], val);
          $("#settings").hide();
          on_settings_opened_or_closed();
          _results.push($(".notification_area", container).html("Settings saved"));
        }
        return _results;
      });
    }
  };
}).call(this);
