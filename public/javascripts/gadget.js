/* DO NOT MODIFY. This file was compiled Mon, 01 Aug 2011 09:33:22 GMT from
 * /Users/wojciech/Geepivo/geepivo-heroku/coffeescripts/gadget.coffee
 */

(function() {
  var container, i, imatch, inputs, key, matches, post_create_story, prefs, put_update_other_id, setting_input, settings;
  if (!window.console) {
    window.console = {};
    console.log = function(msg) {};
    console.debug = function(msg) {};
  }
  container = $("#gadget_container");
  prefs = new gadgets.Prefs();
  setting_input = function(name) {
    return $("input[name=" + name + "]", container);
  };
  settings = ["pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by"];
  for (i in settings) {
    setting_input(settings[i]).val(prefs.getString(settings[i]));
  }
  $(".save_settings_button", container).click(function() {
    var i, val;
    for (i in settings) {
      val = setting_input(settings[i]).val();
      prefs.set(settings[i], val);
    }
    return alert("settings saved");
  });
  post_create_story = function(subject, message_id) {
    var params, response_callback, stories_url, story_xml;
    stories_url = "http://www.pivotaltracker.com/services/v3/projects/" + (prefs.getString('project_id')) + "/stories";
    params = {};
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.HEADERS] = {
      "X-TrackerToken": prefs.getString("pivotal_api_token"),
      "Content-type": "application/xml"
    };
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    story_xml = "<story>\n  <project_id>" + (prefs.getString('project_id')) + "</project_id>\n  <story_type>" + (prefs.getString('story_type')) + "</story_type>\n  <name>" + subject + "</name>\n  <integration_id>" + (prefs.getString('integration_id')) + "</integration_id>\n  <other_id>" + message_id + "</other_id>\n  <requested_by>" + (prefs.getString('requested_by')) + "</requested_by>\n  <owned_by>" + (prefs.getString('owned_by')) + "</owned_by>\n</story>";
    console.log("post new story xml:", story_xml);
    params[gadgets.io.RequestParameters.POST_DATA] = story_xml;
    response_callback = function(response) {
      var parser, respXML, url;
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
      url = $(respXML).find("url").text();
      console.log(url);
      put_update_other_id($(respXML).find("id").text());
      return $(".notification_area", container).html("<a href='" + url + "' target='_blank'>" + url + "</a>");
    };
    return gadgets.io.makeRequest(stories_url, response_callback, params);
  };
  put_update_other_id = function(story_id) {
    var params, response_callback, story_url, story_xml;
    story_url = "http://www.pivotaltracker.com/services/v3/projects/" + (prefs.getString('project_id')) + "/stories/" + story_id;
    params = {};
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
    params[gadgets.io.RequestParameters.HEADERS] = {
      "X-TrackerToken": prefs.getString("pivotal_api_token"),
      "Content-type": "application/xml"
    };
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    story_xml = "<story>" + ("<integration_id>" + (prefs.getString("integration_id")) + "</integration_id><other_id>" + story_id + "</other_id></story>");
    console.log("update other_id xml:", story_xml);
    params[gadgets.io.RequestParameters.POST_DATA] = story_xml;
    response_callback = function(response) {
      return console.log("put other_id response:", response.text);
    };
    return gadgets.io.makeRequest(story_url, response_callback, params);
  };
  matches = google.contentmatch.getContentMatches();
  inputs = {};
  for (imatch in matches) {
    $.extend(inputs, matches[imatch]);
  }
  for (key in inputs) {
    console.log("inputs[" + key + " ] => " + inputs[key]);
  }
  if (inputs.subject) {
    gadgets.window.adjustHeight(32);
    container.show();
  } else {
    gadgets.window.adjustHeight(0);
  }
  $(".create_story_button", container).click(function() {
    return post_create_story(inputs.subject, inputs.message_id);
  });
  $("#toggle_settings_button").click(function() {
    if ($("#settings").toggle().is(":visible")) {
      $(this).html("settings ▲");
      return gadgets.window.adjustHeight(350);
    } else {
      $(this).html("settings ▼");
      return gadgets.window.adjustHeight(32);
    }
  });
}).call(this);
