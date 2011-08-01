unless window.console
  window.console = {}
  console.log = (msg) ->
  console.debug = (msg) ->

container = $("#gadget_container")
prefs = new gadgets.Prefs()
setting_input = (name) ->
  $ "input[name=#{name}]", container

settings = [ "pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by" ]
for i of settings
  setting_input(settings[i]).val prefs.getString(settings[i])

$(".save_settings_button", container).click ->
  for i of settings
    val = setting_input(settings[i]).val()
    prefs.set settings[i], val
  alert "settings saved"

post_create_story = (subject, message_id) ->
  stories_url = "http://www.pivotaltracker.com/services/v3/projects/#{prefs.getString('project_id')}/stories"
  params = {}
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST
  params[gadgets.io.RequestParameters.HEADERS] =
    "X-TrackerToken": prefs.getString("pivotal_api_token")
    "Content-type": "application/xml"
  
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM
  template = "<story>" + "<project_id>{{project_id}}</project_id>" + "<story_type>{{story_type}}</story_type>" + "<name>{{name}}</name>" + "<integration_id>{{integration_id}}</integration_id>" + "<other_id>{{other_id}}</other_id>" + "<requested_by>{{requested_by}}</requested_by>" + "<owned_by>{{owned_by}}</owned_by>" + "</story>"
  story_xml = Mustache.to_html(template,
    project_id: prefs.getString("project_id")
    story_type: prefs.getString("story_type")
    name: subject
    integration_id: prefs.getString("integration_id")
    other_id: message_id
    requested_by: prefs.getString("requested_by")
    owned_by: prefs.getString("owned_by")
  )
  console.log "post new story xml:", story_xml
  params[gadgets.io.RequestParameters.POST_DATA] = story_xml
  response_callback = (response) ->
    console.log "post new story response:", response.text
    respXML = null
    if window.DOMParser
      parser = new DOMParser()
      respXML = parser.parseFromString(response.text, "text/xml")
    else
      respXML = new ActiveXObject("Microsoft.XMLDOM")
      respXML.async = "false"
      respXML.loadXML response.text
    url = $(respXML).find("url").text()
    console.log url
    put_update_other_id $(respXML).find("id").text()
    $(".notification_area", container).html "<a href='#{url}' target='_blank'>#{url}</a>"
  
  gadgets.io.makeRequest stories_url, response_callback, params

put_update_other_id = (story_id) ->
  story_url = "http://www.pivotaltracker.com/services/v3/projects/#{prefs.getString('project_id')}/stories/#{story_id}"
  params = {}
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT
  params[gadgets.io.RequestParameters.HEADERS] =
    "X-TrackerToken": prefs.getString("pivotal_api_token")
    "Content-type": "application/xml"
  
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM
  template = "<story>" + "<integration_id>{{integration_id}}</integration_id>" + "<other_id>{{other_id}}</other_id>" + "</story>"
  story_xml = Mustache.to_html(template,
    integration_id: prefs.getString("integration_id")
    other_id: story_id
  )
  console.log "update other_id xml:", story_xml
  params[gadgets.io.RequestParameters.POST_DATA] = story_xml
  response_callback = (response) ->
    console.log "put other_id response:", response.text
  
  gadgets.io.makeRequest story_url, response_callback, params

matches = google.contentmatch.getContentMatches()
inputs = {}
for imatch of matches
  $.extend inputs, matches[imatch]
for key of inputs
  console.log "inputs[" + key + " ] => " + inputs[key]
if inputs.subject
  gadgets.window.adjustHeight 32
  container.show()
else
  gadgets.window.adjustHeight 0
$(".create_story_button", container).click ->
  post_create_story inputs.subject, inputs.message_id

$("#toggle_settings_button").click ->
  if $("#settings").toggle().is(":visible")
    $(this).html "settings ▲"
    gadgets.window.adjustHeight 350
  else
    $(this).html "settings ▼"
    gadgets.window.adjustHeight 32

