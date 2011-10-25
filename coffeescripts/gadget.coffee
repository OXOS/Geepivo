window.initializeGeepivoGadget = ->

  unless window.console
    window.console = {}
    console.log = (msg) ->
    console.debug = (msg) ->
  
  class Story
    put_update_other_id: ->
      story_url = "https://www.pivotaltracker.com/services/v3/projects/#{@project_id}/stories/#{@story_id}"
      params = {}
      params[window.gadgets.io.RequestParameters.METHOD] = window.gadgets.io.MethodType.PUT
      params[window.gadgets.io.RequestParameters.HEADERS] =
        "X-TrackerToken": prefs.getString("pivotal_api_token")
        "Content-type": "application/xml"
      
      params[window.gadgets.io.RequestParameters.CONTENT_TYPE] = window.gadgets.io.ContentType.DOM
      story_xml = "<story><integration_id>#{@integration_id}</integration_id><other_id>#{@story_id}</other_id></story>"
      console.log "update other_id xml:", story_xml
      params[window.gadgets.io.RequestParameters.POST_DATA] = story_xml
      response_callback = (response) ->
        console.log "put other_id response:", response.text
      
      window.gadgets.io.makeRequest story_url, response_callback, params
  
    create_and_update_other_id: (on_success) ->
      stories_url = "https://www.pivotaltracker.com/services/v3/projects/#{prefs.getString('project_id')}/stories"
      params = {}
      params[window.gadgets.io.RequestParameters.METHOD] = window.gadgets.io.MethodType.POST
      params[window.gadgets.io.RequestParameters.HEADERS] =
        "X-TrackerToken": prefs.getString("pivotal_api_token")
        "Content-type": "application/xml"
      params[window.gadgets.io.RequestParameters.CONTENT_TYPE] = window.gadgets.io.ContentType.DOM
  
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
      params[window.gadgets.io.RequestParameters.POST_DATA] = story_xml
      response_callback = (response) =>
        console.log "post new story response:", response
        if (response.rc > 400)
          $(".notification_area", container).html("Error creating story")
        else
          respXML = null
          if window.DOMParser
            parser = new DOMParser()
            respXML = parser.parseFromString(response.text, "text/xml")
          else
            respXML = new ActiveXObject("Microsoft.XMLDOM")
            respXML.async = "false"
            respXML.loadXML response.text
          @url = $(respXML).find("url").text()
          console.log @url
          @story_id = $(respXML).find("id").text()
          on_success(this)
          this.put_update_other_id() #TODO: Do it only if previous request succeeds and integration id is set
      
      window.gadgets.io.makeRequest stories_url, response_callback, params
  
  
  on_story_created = (story) ->
    $(".notification_area", container).html "<a href='#{story.url}' target='_blank'>#{story.url}</a>"
  
  post_create_story = (subject, message_id) ->
    story = new Story
    story.name              = subject
    story.project_id        = prefs.getString('project_id')
    story.story_type        = prefs.getString('story_type')
    story.integration_id    = prefs.getString('integration_id')
    story.requested_by      = prefs.getString('requested_by')
    story.owned_by          = prefs.getString('owned_by')
    story.create_and_update_other_id( on_story_created )
  
  #TODO: use DOM event instead
  on_settings_opened_or_closed = () ->
    if $("#settings").is(":visible")
      $(this).html "settings ▲"
      window.gadgets.window.adjustHeight 500
    else
      $(this).html "settings ▼"
      window.gadgets.window.adjustHeight 32
  
  matches = window.google.contentmatch.getContentMatches()
  inputs = {}
  for imatch of matches
    $.extend inputs, matches[imatch]
  for key of inputs
    console.log "inputs[" + key + " ] => " + inputs[key]
  
  container = $("#gadget_container")
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
