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
      var params, projects_url, response_callback, time;
      time = new Date().getTime();
      projects_url = "https://www.pivotaltracker.com/services/v3/projects?cache_buster=" + time;
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
            name: $(project).children('name').text(),
            members: $.map($(project).find('person'), function(person, i) {
              console.log('person', person);
              return {
                email: $(person).children('email').text(),
                name: $(person).children('name').text(),
                initials: $(person).children('initials').text()
              };
            })
          };
        });
        return on_success(projects_data);
      }
    };
    return Project;
  })();
}).call(this);
