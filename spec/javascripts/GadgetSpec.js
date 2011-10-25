describe("Configured gadget", function() {
  var gadget_window, getString;

  beforeEach(function() {
    loadFixtures('gadget.html');

    window.google = {};

    var contentmatch = {getContentMatches: function(){} };
    spyOn(contentmatch,'getContentMatches').andReturn( [ {subject: "An email subject"} ] );
    window.google.contentmatch = contentmatch;

    getString  = jasmine.createSpy().andReturn("dupa");
    var Prefs =  function() {
      this.getString = getString;
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

  it("should read settings", function() {
    expect(getString).toHaveBeenCalled();
  });

  it("should adjust height to 32", function() {
    expect(getString).toHaveBeenCalled();
  });

  it("should post XML story to Tracker", function() {
    $('button.create_story_button').click();

    expect(window.gadgets.io.makeRequest.callCount).toEqual(1);

    var args = window.gadgets.io.makeRequest.mostRecentCall.args;
    expect(args.shift()).toEqual('https://www.pivotaltracker.com/services/v3/projects/dupa/stories');

    var callback = args.shift();
    expect(typeof callback).toEqual('function');

    expect( args.shift() ).toEqual({
      METHOD: 'POST',
      HEADERS: { 'X-TrackerToken' : 'dupa', 'Content-type' : 'application/xml' },
      CONTENT_TYPE: 'DOM',
      POST_DATA: "<story>\n  <project_id>dupa</project_id>\n  <story_type>dupa</story_type>\n  <name>An email subject</name>\n  <integration_id>dupa</integration_id>\n  <requested_by>dupa</requested_by>\n  <owned_by>dupa</owned_by>\n</story>"
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

});
