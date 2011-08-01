/* DO NOT MODIFY. This file was compiled Mon, 01 Aug 2011 13:19:22 GMT from
 * /Users/wojciech/Geepivo/geepivo-heroku/coffeescripts/gadget.coffee
 */

(function() {
  var Story, container, gadget_content, i, imatch, inputs, key, matches, on_settings_opened_or_closed, on_story_created, post_create_story, prefs, setting_input, settings;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  if (!window.console) {
    window.console = {};
    console.log = function(msg) {};
    console.debug = function(msg) {};
  }
  Story = (function() {
    function Story() {}
    Story.prototype.put_update_other_id = function() {
      var params, response_callback, story_url, story_xml;
      story_url = "https://www.pivotaltracker.com/services/v3/projects/" + this.project_id + "/stories/" + this.story_id;
      params = {};
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "X-TrackerToken": prefs.getString("pivotal_api_token"),
        "Content-type": "application/xml"
      };
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
      story_xml = "<story><integration_id>" + this.integration_id + "</integration_id><other_id>" + this.story_id + "</other_id></story>";
      console.log("update other_id xml:", story_xml);
      params[gadgets.io.RequestParameters.POST_DATA] = story_xml;
      response_callback = function(response) {
        return console.log("put other_id response:", response.text);
      };
      return gadgets.io.makeRequest(story_url, response_callback, params);
    };
    Story.prototype.create_and_update_other_id = function(on_success) {
      var params, response_callback, stories_url, story_xml;
      stories_url = "https://www.pivotaltracker.com/services/v3/projects/" + (prefs.getString('project_id')) + "/stories";
      params = {};
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
      params[gadgets.io.RequestParameters.HEADERS] = {
        "X-TrackerToken": prefs.getString("pivotal_api_token"),
        "Content-type": "application/xml"
      };
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
      story_xml = "<story>\n  <project_id>" + this.project_id + "</project_id>\n  <story_type>" + this.story_type + "</story_type>\n  <name>" + this.name + "</name>\n  <integration_id>" + this.integration_id + "</integration_id>\n  <requested_by>" + this.requested_by + "</requested_by>\n  <owned_by>" + this.owned_by + "</owned_by>\n</story>";
      console.log("post new story xml:", story_xml);
      params[gadgets.io.RequestParameters.POST_DATA] = story_xml;
      response_callback = __bind(function(response) {
        var parser, respXML;
        console.log("post new story response:", response.text);
        respXML = null;
        if (window.DOMParser) {
          parser = new DOMParser();
          respXML = parser.parseFromString(response.text, "text/xml");
        } else {
          respXML = new ActiveXObject("Microsoft.XMLDOM");
          respXML.async = "false";
          respXML.loadXML(response.text);
        }
        this.url = $(respXML).find("url").text();
        console.log(this.url);
        this.story_id = $(respXML).find("id").text();
        this.put_update_other_id();
        return on_success(this);
      }, this);
      return gadgets.io.makeRequest(stories_url, response_callback, params);
    };
    return Story;
  })();
  on_story_created = function(story) {
    return $(".notification_area", container).html("<a href='" + story.url + "' target='_blank'>" + story.url + "</a>");
  };
  post_create_story = function(subject, message_id) {
    var story;
    story = new Story;
    story.name = subject;
    story.project_id = prefs.getString('project_id');
    story.story_type = prefs.getString('story_type');
    story.integration_id = prefs.getString('integration_id');
    story.requested_by = prefs.getString('requested_by');
    story.owned_by = prefs.getString('owned_by');
    return story.create_and_update_other_id(on_story_created);
  };
  matches = google.contentmatch.getContentMatches();
  inputs = {};
  for (imatch in matches) {
    $.extend(inputs, matches[imatch]);
  }
  for (key in inputs) {
    console.log("inputs[" + key + " ] => " + inputs[key]);
  }
  container = $("#gadget_container");
  prefs = new gadgets.Prefs();
  setting_input = function(name) {
    return $("input[name=" + name + "]", container);
  };
  gadget_content = "<div style='widh: 100px; position:absolute; top:3px; left:3px;'>\n  <button class=\"create_story_button\">Create Story</button>\n</div>\n\n<div class='notification_area' style=' position:absolute; top:3px; left:113px;'>&nbsp;</div>\n\n<div style='widh: 100px; position:absolute; top:3px; right:3px;'>\n  <a href=\"#\" id='toggle_settings_button' style='font-size: small; text-decoration:none;'>settings ▼</a>\n</div>\n\n<div style='clear:both;'></div>\n\n<div id='settings' style='font-size: small; display:none; padding-top:30px;'>\n  <div>\n    <label>Pivotal API Token *\n      <input name=\"pivotal_api_token\" />\n    </label>\n    <p><small>To get an API token log in to PivotalTracker, open <em><a href='https://www.pivotaltracker.com/profile'>Profile</a></em> form, scroll down to <em>API Token section</em> and click <em>Create New Token</em>.</small></p>\n  </div>\n  \n  <div>\n    <label>Project ID *\n    <input name=\"project_id\" /></label>\n    <p><small>ID of a PivotalTracker project Geepivo will create stories in. You can find project ID at the end of project URL, e.g.: https://www.pivotaltracker.com/projects/12345</small></p>.\n  </div>\n  \n  <div>\n    <label>Story type\n    <input name=\"story_type\" /></label>\n    <p><small>One of following: \"feature\", \"chore\" or \"bug\". Leave the field empty to use the default value - \"feature\".</small></p>\n  </div>\n  \n  <div>\n    <label>Requested by:\n    <input name=\"requested_by\" /></label>\n    <p><small>Optionally specify user who will be notified about story delivery and prompted to accept or reject it. By default it's the owner of API token. Enter \"Full Name\" here, as visible in Pivotal Tracker's story form.</small></em>.\n  </div>\n  \n  <div>\n    <label>Owned by:\n    <input name=\"owned_by\" /></label>\n    <p><small>User the story will be assigned to. By default the story is not assigned. Enter \"Full Name\" here, as visible in Pivotal Tracker's story form.</small></em>.\n  </div>\n\n  <div>\n    <label>Integration ID (optional)\n    <input name=\"integration_id\" /></label>\n    <p><small>Experimental hack. Configure \"External Integration\" in Pivotal Tracker and it will be filled with Story ID. Set base URL of the integration to something like <em>https://mail.google.com/mail/u/0/?shva=1#search/</em>, story ID will be prepended and you will be able to search for emails that contain links to the story.</small></em>.\n  </div>\n  \n  <input type='submit' class='save_settings_button' value=\"Save settings\" />\n</div>";
  on_settings_opened_or_closed = function() {
    if ($("#settings").is(":visible")) {
      $(this).html("settings ▲");
      return gadgets.window.adjustHeight(500);
    } else {
      $(this).html("settings ▼");
      return gadgets.window.adjustHeight(32);
    }
  };
  if (!inputs.subject) {
    gadgets.window.adjustHeight(0);
  } else {
    gadgets.window.adjustHeight(32);
    container.html(gadget_content).show();
    settings = ["pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by"];
    for (i in settings) {
      setting_input(settings[i]).val(prefs.getString(settings[i]));
    }
    if (!(prefs.getString("pivotal_api_token") && prefs.getString("pivotal_api_token"))) {
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
    $(".save_settings_button", container).click(function() {
      var i, val;
      for (i in settings) {
        val = setting_input(settings[i]).val();
        prefs.set(settings[i], val);
      }
      return alert("settings saved");
    });
  }
}).call(this);
