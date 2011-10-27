parse_xml = (xml_string) ->
  if window.DOMParser
    parser = new DOMParser()
    respXML = parser.parseFromString(xml_string, "text/xml")
  else
    respXML = new ActiveXObject("Microsoft.XMLDOM")
    respXML.async = "false"
    respXML.loadXML xml_string
  return respXML

class window.Story
  constructor: (@io) ->

  create: (on_success, on_error) ->
    return this._create_and_update_other_id(on_success, on_error)

  _put_update_other_id: ->
    story_url = "https://www.pivotaltracker.com/services/v3/projects/#{@project_id}/stories/#{@story_id}"
    params = {}
    params[@io.RequestParameters.METHOD] = @io.MethodType.PUT
    params[@io.RequestParameters.HEADERS] =
      "X-TrackerToken": @pivotal_api_token
      "Content-type": "application/xml"
    
    params[@io.RequestParameters.CONTENT_TYPE] = @io.ContentType.DOM
    story_xml = "<story><integration_id>#{@integration_id}</integration_id><other_id>#{@story_id}</other_id></story>"
    console.log "update other_id xml:", story_xml
    params[@io.RequestParameters.POST_DATA] = story_xml
    response_callback = (response) ->
      console.log "put other_id response:", response.text
    
    @io.makeRequest story_url, response_callback, params

  _create_and_update_other_id: (on_success, on_error) ->
    stories_url = "https://www.pivotaltracker.com/services/v3/projects/#{@project_id}/stories"
    params = {}
    params[@io.RequestParameters.METHOD] = @io.MethodType.POST
    params[@io.RequestParameters.HEADERS] =
      "X-TrackerToken": @pivotal_api_token
      "Content-type": "application/xml"
    params[@io.RequestParameters.CONTENT_TYPE] = @io.ContentType.DOM

    #TODO: Find a library to construct XML
    story_xml = """
      <story>
        <project_id>#{@project_id}</project_id>
        <story_type>#{@story_type}</story_type>
        <name>#{@name}</name>
        <integration_id>#{@integration_id}</integration_id>
        <requested_by>#{@requested_by}</requested_by>
        <owned_by>#{@owned_by}</owned_by>
      </story>
      """
  
    console.log "post new story xml:", story_xml
    params[@io.RequestParameters.POST_DATA] = story_xml
    
    response_callback = (response) =>
      @_response_callback( response, on_success, on_error )

    @io.makeRequest stories_url, response_callback, params

  _response_callback: (response, on_success, on_error) =>
    console.log "post new story response:", response
    if (response.rc >= 400)
      message = switch response.rc
        when 401 then "Authentication error - check your API token and project permissions"
        else "Error creating story"
      on_error(message)
    else
      respXML = parse_xml(response.text)
      @url = $(respXML).find("url").text()
      console.log @url
      @story_id = $(respXML).find("id").text()
      on_success(this)
      this._put_update_other_id() #TODO: Do it only if integration id is set


