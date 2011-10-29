describe("Unconfigured gadget", function() {

  beforeEach(function() {
    loadFixtures('gadget.html');
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    window.google  = environment_stub.google;
    window.gadgets = environment_stub.gadgets;
    spyOn(window.gadgets.Prefs.prototype,'getString').andReturn(null);
    window.initializeGeepivoGadget();
  });

  it("should display prompt", function() {
    expect( $(".notification_area").html() ).toEqual('Please fill required settings');
  });

  it("should expand settings", function() {
    expect(window.gadgets.window.adjustHeight).toHaveBeenCalledWith(500);
    expect($("#settings")).toBeVisible();
  });

  it("should save settings", function() {
    var setting_keys = [ "pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by" ];
    for (i in setting_keys) {
      var key = setting_keys[i];
      $('input[name=' + key + ']').val( 'updated ' + key );
    }

    window.gadgets.Prefs.prototype.set = jasmine.createSpy('gadgets.Prefs.prototype.set');

    $('input.save_settings_button').click();

    expect(window.gadgets.Prefs.prototype.set.argsForCall).toEqual( [
      ['pivotal_api_token',	'updated pivotal_api_token'],
      ['project_id',	'updated project_id'],
      ['story_type',	'updated story_type'],
      ['requested_by',	'updated requested_by'],
      ['integration_id',	'updated integration_id'],
      ['owned_by',	'updated owned_by']
      ]);

    expect( $(".notification_area").html() ).toEqual('Settings saved');
  });

});

describe("Configured gadget", function() {
  beforeEach(function() {
    loadFixtures('gadget.html');
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    window.google  = environment_stub.google;
    window.gadgets = environment_stub.gadgets;
  });

  it("should hide itself when no inputs", function() {
    spyOn(window.google.contentmatch,'getContentMatches').andReturn([]);
    window.initializeGeepivoGadget();
    expect(window.gadgets.window.adjustHeight).toHaveBeenCalledWith(0);
  });

});

describe("Initialized gadget", function() {
  beforeEach(function() {
    loadFixtures('gadget.html');

    environment_stub = new GoogleGadgetsEnvironmentStubs();
    window.google  = environment_stub.google;
    window.gadgets = environment_stub.gadgets;

    window.initializeGeepivoGadget();
  });

  it("should adjust height to 32", function() {
    expect(window.gadgets.window.adjustHeight).toHaveBeenCalledWith(32);
  });

  it("should have 'Create story' button", function() {
    expect( $('#gadget_container button.create_story_button').text() ).toEqual('Create Story');
  });

  it("should have settings button that displays and hides settings when clicked", function() {
    var settings_button = $('#gadget_container #toggle_settings_button');
    expect( settings_button.text() ).toEqual('settings ▼');
    expect( $('#gadget_container #settings') ).not.toBeVisible();

    settings_button.click();

    //expect( settings_button.text() ).toEqual('settings ▼'); TODO: should change arrow direction
    expect( $('#gadget_container #settings') ).toBeVisible();

    settings_button.click();
    expect( $('#gadget_container #settings') ).not.toBeVisible();
  });

  it("settings section should have inputs for all settings", function() {
    var settings_button = $('#gadget_container #toggle_settings_button');
    settings_button.click();

    var setting_keys = [ "pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by" ];
    for (i in setting_keys) {
      var key = setting_keys[i];
      expect( $('#gadget_container #settings input[name=pivotal_api_token]').toBeVisible );
    }
  });

  it("should post XML story to Tracker", function() {
    spyOn(window.gadgets.io, 'makeRequest');

    $('button.create_story_button').click();

    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);

    var request_args = window.gadgets.io.makeRequest.mostRecentCall.args;
    expect(request_args.shift()).toEqual('https://www.pivotaltracker.com/services/v3/projects/project_id_value/stories');
    expect(typeof request_args.shift()).toEqual('function');
    expect( request_args.shift() ).toEqual({
      METHOD: 'POST',
      HEADERS: { 'X-TrackerToken' : 'pivotal_api_token_value', 'Content-type' : 'application/xml' },
      CONTENT_TYPE: 'DOM',
      POST_DATA: "<story>\n  <project_id>project_id_value</project_id>\n  <story_type>story_type_value</story_type>\n  <name>An email subject</name>\n  <integration_id>integration_id_value</integration_id>\n  <requested_by>requested_by_value</requested_by>\n  <owned_by>owned_by_value</owned_by>\n</story>"
    });
  });

  it("should display story link when callback called with success message", function() {
    spyOn(window.gadgets.io, 'makeRequest');

    $('button.create_story_button').click();

    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);
    var callback = window.gadgets.io.makeRequest.mostRecentCall.args[1];

    story_data = "<story><url>http://tracker/story/555</url><id>555</id></story>";
    response_data = {
      rc: 201,
      text: story_data
    };

    callback(response_data);

    expect( $(".notification_area").html() ).toEqual('<a href="http://tracker/story/555" target="_blank">http://tracker/story/555</a>');

  });

  it("should make another request when callback called with success message", function() {
    spyOn(window.gadgets.io, 'makeRequest');

    $('button.create_story_button').click();

    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);
    var callback = window.gadgets.io.makeRequest.mostRecentCall.args[1];

    story_data = "<story><url>http://tracker/story/555</url><id>555</id></story>";
    response_data = {
      rc: 201,
      text: story_data
    };

    callback(response_data);

    expect(window.gadgets.io.makeRequest.callCount).toEqual(2);
    var request_args = window.gadgets.io.makeRequest.mostRecentCall.args;

    expect(request_args.shift()).toEqual('https://www.pivotaltracker.com/services/v3/projects/project_id_value/stories/555');
    expect(typeof request_args.shift()).toEqual('function');

    var params = request_args.shift();
    var post_data = params.POST_DATA; delete(params.POST_DATA);

    expect( params ).toEqual({
      METHOD: 'PUT',
      HEADERS: { 'X-TrackerToken' : 'pivotal_api_token_value', 'Content-type' : 'application/xml' },
      CONTENT_TYPE: 'DOM'
    });

    expect(post_data).toEqual("<story><integration_id>integration_id_value</integration_id><other_id>555</other_id></story>");
  });


  it("should show error message callback called with error message", function() {
    spyOn(window.gadgets.io, 'makeRequest');

    $('button.create_story_button').click();

    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);
    var callback = window.gadgets.io.makeRequest.mostRecentCall.args[1];

    response_data = { rc: 500, text: '' };
    callback(response_data);

    expect( $(".notification_area").html() ).toEqual('Error creating story');
  });

});
