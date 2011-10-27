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
