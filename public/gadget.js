if(!window.console) {
  window.console = {};
  console.log = function(msg) {};
  console.debug = function(msg) {};
}

var container = $('#gadget_container');

var prefs = new gadgets.Prefs();

var setting_input = function(name) {
  return $("input[name=" + name + "]", container);
}

var settings = [ 'pivotal_api_token', 'project_id', 'story_type', 'requested_by', 'integration_id', 'owned_by' ];
for( i in settings ) {
  setting_input( settings[i] ).val( prefs.getString(settings[i]) );
}

$(".save_settings_button", container).click(function(){
  for( i in settings ) {
    var val = setting_input( settings[i] ).val();
    prefs.set(settings[i], val );
  }
  alert('settings saved');
});

var post_create_story = function( subject, message_id ) {
  var stories_url = "http://www.pivotaltracker.com/services/v3/projects/" + prefs.getString('project_id') + "/stories";
  var params = {};
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "X-TrackerToken": prefs.getString('pivotal_api_token'),
    "Content-type": "application/xml"
  };
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;

  var template = "<story>"
	       + "<project_id>{{project_id}}</project_id>"
	       + "<story_type>{{story_type}}</story_type>"
	       + "<name>{{name}}</name>"
	       + "<integration_id>{{integration_id}}</integration_id>"
	       + "<other_id>{{other_id}}</other_id>"
	       + "<requested_by>{{requested_by}}</requested_by>"
	       + "<owned_by>{{owned_by}}</owned_by>"
	       + "</story>";

  var story_xml = Mustache.to_html(template, {
    project_id: prefs.getString('project_id'),
    story_type: prefs.getString('story_type'),
    name: subject,
    integration_id: prefs.getString('integration_id'),
    other_id: message_id,
    requested_by: prefs.getString('requested_by'),
    owned_by: prefs.getString('owned_by')
  } );
  console.log( "post new story xml:" , story_xml );

  params[gadgets.io.RequestParameters.POST_DATA] = story_xml;

  var response_callback = function(response) {
    console.log( 'post new story response:' , response.text );

    var respXML = null;
    if (window.DOMParser) {
      parser=new DOMParser();
      respXML=parser.parseFromString(response.text,"text/xml");
    } else {
      respXML=new ActiveXObject("Microsoft.XMLDOM");
      respXML.async="false";
      respXML.loadXML(response.text); 
    }

    var url = $(respXML).find("url").text();
    console.log( url );
    
    put_update_other_id($(respXML).find("id").text());
    
    $(".notification_area", container).html( '<a href="' + url + '" target="_blank">' + url + '</a>' );


  };
  gadgets.io.makeRequest(stories_url, response_callback, params);
};

var put_update_other_id = function(story_id){
    var story_url = "http://www.pivotaltracker.com/services/v3/projects/" + prefs.getString('project_id') + "/stories/" + story_id;
    
    var params = {};
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
  params[gadgets.io.RequestParameters.HEADERS] = {
    "X-TrackerToken": prefs.getString('pivotal_api_token'),
    "Content-type": "application/xml"
  };
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;

  var template = "<story>"
	       + "<integration_id>{{integration_id}}</integration_id>"
	       + "<other_id>{{other_id}}</other_id>"
	       + "</story>";

  var story_xml = Mustache.to_html(template, {
    integration_id: prefs.getString('integration_id'),
    other_id: story_id
  } );
  console.log( 'update other_id xml:' , story_xml );

  params[gadgets.io.RequestParameters.POST_DATA] = story_xml;

  var response_callback = function(response) {
    console.log( 'put other_id response:' ,response.text );
  };
  gadgets.io.makeRequest(story_url, response_callback, params);
};

var matches = google.contentmatch.getContentMatches();

var inputs = {};
for(var imatch in matches){
  $.extend( inputs, matches[imatch] );
}

for(var key in inputs) {
  console.log( "inputs[" + key + " ] => " + inputs[key] );
}

if (inputs.subject) {
  gadgets.window.adjustHeight(32);
  container.show();
} else {
  //Seems we're in a reply email - let's hide ourselves.
  gadgets.window.adjustHeight(0);
}

$('.create_story_button', container).click(function(){
  post_create_story( inputs.subject, inputs.message_id );
});

$('#toggle_settings_button').click(function(){
  if($('#settings').toggle().is(":visible"))
  {
    $(this).html("settings ▲");
    gadgets.window.adjustHeight(350);
  }
  else
  {
    $(this).html("settings ▼");
    gadgets.window.adjustHeight(32);
  }
});
