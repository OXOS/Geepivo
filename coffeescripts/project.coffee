parse_xml = (xml_string) ->
  if window.DOMParser
    parser = new DOMParser()
    respXML = parser.parseFromString(xml_string, "text/xml")
  else
    respXML = new ActiveXObject("Microsoft.XMLDOM")
    respXML.async = "false"
    respXML.loadXML xml_string
  return respXML

class window.Project
  constructor: (@io) ->

  get_index: (on_success, on_error) ->
    time = new Date().getTime()
    projects_url = "https://www.pivotaltracker.com/services/v3/projects?cache_buster=#{time}"
    params = {}
    params[@io.RequestParameters.METHOD] = @io.MethodType.GET
    params[@io.RequestParameters.HEADERS] =
      "X-TrackerToken": @pivotal_api_token
      "Content-type": "application/xml"
    params[@io.RequestParameters.CONTENT_TYPE] = this.io.ContentType.DOM

    response_callback = (response) =>
      @_get_index_callback( response, on_success, on_error )
    @io.makeRequest projects_url, response_callback, params

  _get_index_callback: (response, on_success, on_error) =>
    if (response.rc >= 400)
      message = switch response.rc
        when 401 then "Authentication error - check your API token and project permissions"
        else "Error retrieving list of projects"
      on_error(message)
    else
      respXML = parse_xml(response.text)
      projects_dom = $(respXML).find("projects project")

      projects_data = $.map projects_dom, (project, i) ->
        return {
          id: parseInt($(project).children('id').text())
          name: $(project).children('name').text()
        }
      on_success projects_data


