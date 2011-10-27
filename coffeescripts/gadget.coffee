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


window.initializeGeepivoGadget = ->

  unless window.console
    window.console = {}
    console.log = (msg) ->
    console.debug = (msg) ->
  
  on_story_created = (story) ->
    $(".notification_area", container).html "<a href='#{story.url}' target='_blank'>#{story.url}</a>"
  
  on_story_creation_error = (error) ->
          $(".notification_area", container).html(error)
  
  post_create_story = (subject, message_id) ->
    story = new Story(window.gadgets.io)

    story.name              = subject
    story.pivotal_api_token = prefs.getString('pivotal_api_token')
    story.project_id        = prefs.getString('project_id')
    story.story_type        = prefs.getString('story_type')
    story.integration_id    = prefs.getString('integration_id')
    story.requested_by      = prefs.getString('requested_by')
    story.owned_by          = prefs.getString('owned_by')
    story.create on_story_created, on_story_creation_error
  
  #TODO: use DOM event instead
  on_settings_opened_or_closed = () ->
    if $("#settings").is(":visible")
      $(this).html "settings ▲"
      window.gadgets.window.adjustHeight 500
    else
      $(this).html "settings ▼"
      window.gadgets.window.adjustHeight 32
    return false
  
  matches = window.google.contentmatch.getContentMatches()
  inputs = {}
  for imatch of matches
    $.extend inputs, matches[imatch]
  for key of inputs
    console.log "inputs[" + key + " ] => " + inputs[key]
  
  container = $("#gadget_container")

  if container.length != 1
    throw "Error. Can't find gadget container."

  prefs = new window.gadgets.Prefs()
  setting_input = (name) ->
    $ "input[name=#{name}]", container
  
  gadget_content = """
    <div style='widh: 100px; position:absolute; top:3px; left:3px;'>
      <button class="create_story_button">Create Story</button>
    </div>
    
    <div class='notification_area' style=' position:absolute; top:3px; left:113px;'>&nbsp;</div>
    
    <div style='widh: 100px; position:absolute; top:3px; right:3px;'>
      <a href="#" id='toggle_settings_button' style='font-size: small; text-decoration:none;'>settings ▼</a>
    </div>
    
    <div style='clear:both;'></div>
    
    <div id='settings' style='font-size: small; display:none; padding-top:30px;'>
      <div>
        <label>Pivotal API Token *
          <input name="pivotal_api_token" />
        </label>
        <p><small>To get an API token log in to PivotalTracker, open <em><a href='https://www.pivotaltracker.com/profile'>Profile</a></em> form, scroll down to <em>API Token section</em> and click <em>Create New Token</em>.</small></p>
      </div>
      
      <div>
        <label>Project ID *
        <input name="project_id" /></label>
        <p><small>ID of a PivotalTracker project Geepivo will create stories in. You can find project ID at the end of project URL, e.g.: https://www.pivotaltracker.com/projects/12345</small></p>.
      </div>
      
      <div>
        <label>Story type
        <input name="story_type" /></label>
        <p><small>One of following: "feature", "chore" or "bug". Leave the field empty to use the default value - "feature".</small></p>
      </div>
      
      <div>
        <label>Requested by:
        <input name="requested_by" /></label>
        <p><small>Optionally specify user who will be notified about story delivery and prompted to accept or reject it. By default it's the owner of API token. Enter "Full Name" here, as visible in Pivotal Tracker's story form.</small></em>.
      </div>
      
      <div>
        <label>Owned by:
        <input name="owned_by" /></label>
        <p><small>User the story will be assigned to. By default the story is not assigned. Enter "Full Name" here, as visible in Pivotal Tracker's story form.</small></em>.
      </div>
  
      <div>
        <label>Integration ID (optional)
        <input name="integration_id" /></label>
        <p><small>Experimental hack. Configure "External Integration" in Pivotal Tracker and it will be filled with Story ID. Set base URL of the integration to something like <em>https://mail.google.com/mail/u/0/?shva=1#search/</em>, story ID will be prepended and you will be able to search for emails that contain links to the story.</small></em>.
      </div>
      
      <input type='submit' class='save_settings_button' value="Save settings" />
    </div>
  """
  
  if ! inputs.subject
    window.gadgets.window.adjustHeight 0
  else
    window.gadgets.window.adjustHeight 32
    container.html(gadget_content).show()
  
    settings = [ "pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by" ]
    for i of settings
      setting_input(settings[i]).val prefs.getString(settings[i])
  
    unless prefs.getString("pivotal_api_token") and prefs.getString("project_id")
      $(".notification_area", container).html "Please fill required settings"
      $("#settings").show()
      on_settings_opened_or_closed()
  
    $(".create_story_button", container).click ->
      post_create_story inputs.subject, inputs.message_id
    
    $("#toggle_settings_button").click ->
      $("#settings").toggle()
      on_settings_opened_or_closed()
  
    $(".save_settings_button", container).click ->
      for i of settings
        val = setting_input(settings[i]).val()
        prefs.set settings[i], val
        $("#settings").hide()
        on_settings_opened_or_closed()
        $(".notification_area", container).html "Settings saved"
