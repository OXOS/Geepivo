describe("Gadget", function() {
  beforeEach(function() {
  });

  it("should be", function() {
    window.google = {};

    var contentmatch = {getContentMatches: function(){} };
    spyOn(contentmatch,'getContentMatches').andReturn( [ {subject: "An email subject"} ] );
    window.google.contentmatch = contentmatch;

    var getString  = jasmine.createSpy().andReturn("dupa");
    var Prefs =  function() {
      this.getString = getString;
    };

    var gadget_window = {
      adjustHeight: jasmine.createSpy('window')
    };

    window.gadgets = {
      Prefs: Prefs,
      'window': gadget_window
    };

    window.initializeGeepivoGadget();

    expect(gadget_window.adjustHeight).toHaveBeenCalledWith(32);
    expect(getString).toHaveBeenCalled();

  });

});
