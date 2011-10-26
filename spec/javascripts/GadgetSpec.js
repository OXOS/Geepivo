describe("Unconfigured gadget", function() {

  xit("should display prompt", function() {
  });

  xit("should expand settings", function() {
  });

  xit("should save settings", function() {
  });

});

describe("Configured gadget", function() {
  var gadget_window, getString;

  beforeEach(function() {
    loadFixtures('gadget.html');

    window.google = {};

    var contentmatch = {getContentMatches: function(){} };
    spyOn(contentmatch,'getContentMatches').andReturn( [ {subject: "An email subject"} ] );
    window.google.contentmatch = contentmatch;

    var Prefs =  function() {
      this.getString = function(key) {
	return key + '_value';
      };
    };

    gadget_window = {
      adjustHeight: jasmine.createSpy('window')
    };

    window.gadgets = {
      Prefs: Prefs,
      'window': gadget_window,
      io: {
	makeRequest: jasmine.createSpy('makeRequest'),
	ContentType: {
	  DOM: 'DOM'
	},
	MethodType: {
	  POST: 'POST',
	  PUT: 'PUT'
	},
	RequestParameters: {
	  METHOD: 'METHOD',
	  HEADERS: 'HEADERS',
	  CONTENT_TYPE: 'CONTENT_TYPE',
	  POST_DATA: 'POST_DATA'
	}
      }
    };

    window.initializeGeepivoGadget();
  });

  xit("should adjust height to 32", function() {
    expect(getString).toHaveBeenCalled();
  });

  it("should post XML story to Tracker", function() {
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
    $('button.create_story_button').click();

    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);
    var callback = window.gadgets.io.makeRequest.mostRecentCall.args[1];

    response_data = { rc: 500, text: '' };
    callback(response_data);

    expect( $(".notification_area").html() ).toEqual('Error creating story');
  });

});
