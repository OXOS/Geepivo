describe("Configured gadget", function() {
  var gadget_window, getString;

  beforeEach(function() {
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
      'window': gadget_window
    };

    window.initializeGeepivoGadget();
  });

  it("should read settings", function() {
    expect(getString).toHaveBeenCalled();
  });

  it("should adjust height to 32", function() {
    expect(getString).toHaveBeenCalled();
  });

});
