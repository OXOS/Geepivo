describe("Unconfigured gadget", function() {

  beforeEach(function() {
    loadFixtures('gadget.html');
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    window.google  = environment_stub.google;
    window.gadgets = environment_stub.gadgets;
    spyOn(window.gadgets.Prefs.prototype,'getString').andReturn(null);
    spyOn(window.gadgets.window,'adjustHeight');
    spyOn(window,'alert');
    spyOn(window.gadgets.io,'makeRequest');

    window.initializeGeepivoGadget();
  });

  it("should display prompt", function() {
    expect( $(".notification_area") ).toHaveText('Please fill required settings');
  });

  it("should expand settings", function() {
    expect(window.gadgets.window.adjustHeight).toHaveBeenCalledWith(260)
    expect($("#settings")).toBeVisible();
  });

  it("should not attempt to load projects", function() {
    expect(window.gadgets.io.makeRequest).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

});

describe("Configured gadget", function() {
  beforeEach(function() {
    loadFixtures('gadget.html');
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    window.google  = environment_stub.google;
    window.gadgets = environment_stub.gadgets;
    spyOn(window.gadgets.window,'adjustHeight');
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
    spyOn(window.gadgets.window,'adjustHeight');

    window.initializeGeepivoGadget();
  });

  it("should adjust height to 32", function() {
    expect(window.gadgets.window.adjustHeight).toHaveBeenCalledWith(32);
  });

  it("should have 'Create story' button", function() {
    expect( $('#gadget_container button.create_story_button') ).toBeVisible();
    expect( $('#gadget_container button.create_story_button') ).toHaveText('Create Story');
  });

  it("should have settings button that displays and hides settings when clicked", function() {
    var settings_button = $('#gadget_container #toggle_settings_button');
    expect( settings_button ).toHaveText('settings ▼');
    expect( $('#gadget_container #settings') ).not.toBeVisible();

    settings_button.click();

    //expect( settings_button ).toHaveText('settings ▼'); TODO: should change arrow direction
    expect( $('#gadget_container #settings') ).toBeVisible();

    settings_button.click();
    expect( $('#gadget_container #settings') ).not.toBeVisible();
  });

  it("should post XML story to Tracker", function() {
    spyOn(window.gadgets.io, 'makeRequest');

    $('button.create_story_button').click();

    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);

    var request_args = window.gadgets.io.makeRequest.mostRecentCall.args;
    expect(request_args.shift()).toEqual('https://www.pivotaltracker.com/services/v3/projects/293423/stories');
    expect(typeof request_args.shift()).toEqual('function');
    expect( request_args.shift() ).toEqual({
      METHOD: 'POST',
      HEADERS: { 'X-TrackerToken' : 'pivotal_api_token_value', 'Content-type' : 'application/xml' },
      CONTENT_TYPE: 'DOM',
      POST_DATA: "<story>\n  <project_id>293423</project_id>\n  <story_type>story_type_value</story_type>\n  <name>An email subject</name>\n  <integration_id>integration_id_value</integration_id>\n  <requested_by>requested_by_value</requested_by>\n  <owned_by>owned_by_value</owned_by>\n</story>"
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

    expect( $(".notification_area") ).toHaveHtml('<a href="http://tracker/story/555" target="_blank">http://tracker/story/555</a>');

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

    expect(request_args.shift()).toEqual('https://www.pivotaltracker.com/services/v3/projects/293423/stories/555');
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

    expect( $(".notification_area") ).toHaveText('Error creating story');
  });

});

describe("Gadget with settings expanded", function() {
  beforeEach(function(){
    //duplicate of "Initialized gadget" beforeEach
    loadFixtures('gadget.html');
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    window.google  = environment_stub.google;
    window.gadgets = environment_stub.gadgets;
    window.initializeGeepivoGadget();
    spyOn(window.gadgets.io, 'makeRequest');


    $('#gadget_container #toggle_settings_button').click();
    expect(window.gadgets.io.makeRequest).toHaveBeenCalled();
    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);

    var request_args = window.gadgets.io.makeRequest.mostRecentCall.args;
    expect(request_args.shift()).toMatch(/^https:\/\/www.pivotaltracker.com\/services\/v3\/projects/);
    var callback = request_args.shift()
    expect(typeof callback).toEqual('function');
    expect( request_args.shift() ).toEqual({
      METHOD: 'GET',
      HEADERS: { 'X-TrackerToken' : 'pivotal_api_token_value', 'Content-type' : 'application/xml' },
      CONTENT_TYPE: 'DOM'
    });

    response_string = window.fixtures['get_projects_response.xml'];
    response = { rc: 200, text: response_string };
    callback(response);
  });

  it("should populate projects dropdown", function() {
    options = $('select[name=project_id] option')
    expect( options.length ).toEqual(2)
    expect( options.eq(0) ).toBeSelected();

    expect( options.eq(0).val() ).toEqual('293423')
    expect( options.eq(0) ).toHaveText('Main Project')
    expect( options.eq(1).val() ).toEqual('145861')
    expect( options.eq(1) ).toHaveText('Side project')
  });

  it("should select current project", function() {
    options = $('select[name=project_id] option')
    expect( options.eq(0) ).toBeSelected();
  });

  it("should update pivotal api token", function() {
    expect( $('input[name=pivotal_api_token]') ).toHaveValue('pivotal_api_token_value');

    spyOn(window,'prompt').andReturn('cc00ffee');
    window.gadgets.Prefs.prototype.set = jasmine.createSpy('gadgets.Prefs.prototype.set');
    spyOn(window.the_gadget, 'populate_projects_dropdown')

    $("a#edit_pivotal_api_token").click();

    expect(window.prompt).toHaveBeenCalledWith("Enter new Pivotal API Token:");
    expect( $('input[name=pivotal_api_token]') ).toHaveValue('cc00ffee');
    expect( window.the_gadget.populate_projects_dropdown ).toHaveBeenCalled();
  });
  
  it("should populate members dropdown", function() {
    options = $('select[name=owned_by] option')
    expect( options.length ).toEqual(2)
    expect( options.eq(0) ).toBeSelected();

    expect( options.eq(0).val() ).toEqual('Wojtek Kruszewski')
    expect( options.eq(0) ).toHaveText('Wojtek Kruszewski')
  });

  it("should update members dropdown when project selected", function() {
    options = $('select[name=owned_by] option');
    expect( options.length ).toEqual(2)

    spyOn(window.the_gadget, 'populate_members_dropdowns').andCallThrough();

    project_id_select = $('select[name=project_id]');
    expect( project_id_select ).toExist();
    expect( project_id_select ).toBeVisible();
    expect( $('select[name=project_id]') ).toHandle('change');
    expect( project_id_select ).toHaveValue(293423);

    project_id_select.val(145861);       //doesn't trigger change event, so...
    project_id_select.trigger('change'); //...here goes a workaround

    expect(window.the_gadget.populate_members_dropdowns).toHaveBeenCalled();

    options = $('select[name=owned_by]').children('option');
    expect( options.length ).toEqual(1)
    expect( options.eq(0) ).toBeSelected();

    expect( options.eq(0).val() ).toEqual('Wojtek Kruszewski')
    expect( options.eq(0) ).toHaveText('Wojtek Kruszewski')
  });

  it("should cancel updating pivotal api token", function() {
    expect( $('input[name=pivotal_api_token]') ).toHaveValue('pivotal_api_token_value');

    spyOn(window,'prompt').andReturn(false);
    spyOn(window.the_gadget, 'populate_projects_dropdown')

    $("a#edit_pivotal_api_token").click();

    expect(window.prompt).toHaveBeenCalledWith("Enter new Pivotal API Token:");
    expect( $('input[name=pivotal_api_token]') ).toHaveValue('pivotal_api_token_value');
    expect(window.the_gadget.populate_projects_dropdown ).not.toHaveBeenCalled();
  });
  
  it("should handle errorw when projects dropdown", function() {
    spyOn(window, 'alert');

    window.the_gadget.populate_projects_dropdown();

    expect(window.gadgets.io.makeRequest).toHaveBeenCalled();

    callback = window.gadgets.io.makeRequest.mostRecentCall.args[1];
    response = { rc: 401, text: response_string };
    callback(response);

    expect(window.alert).toHaveBeenCalledWith('Authentication error - check your API token and project permissions');
  });


  it("should save settings", function() {
    var text_setting_keys = [ "pivotal_api_token", "story_type", "requested_by", "integration_id", "owned_by" ];
    for (i in text_setting_keys) {
      var key = text_setting_keys[i];
      var input = $('input[name=' + key + ']');
      input.val( 'updated ' + key );
    }
    $('select[name=project_id]').val(145861);
    $('select[name=owned_by]').val('daniel');

    window.gadgets.Prefs.prototype.set = jasmine.createSpy('gadgets.Prefs.prototype.set');

    $('input.save_settings_button').click();

    expect(window.gadgets.Prefs.prototype.set.argsForCall).toEqual( [
      ['pivotal_api_token',	'updated pivotal_api_token'],
      ['project_id',	'145861'],
      ['story_type',	'updated story_type'],
      ['requested_by',	'updated requested_by'],
      ['integration_id',	'updated integration_id'],
      ['owned_by',	'daniel']
      ]);

    expect( $(".notification_area") ).toHaveText('Settings saved');
  });

  it("settings section should have inputs for all settings", function() {
    var setting_keys = [ "pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by" ];
    for (i in setting_keys) {
      var key = setting_keys[i];
      expect( $('#gadget_container #settings :input[name='+key+']') ).toBeVisible();
    }

    expect( $('#settings input[name=pivotal_api_token]') ).toBeDisabled();
    expect( $('#settings input[name=pivotal_api_token]').parent().find("a#edit_pivotal_api_token") ).toBeVisible();
  });


});
