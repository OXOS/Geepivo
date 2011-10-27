describe("Story class", function() {

  var story;

  beforeEach(function() {
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    
    //window.gadgets = environment_stub.gadgets;
    //spyOn(window.gadgets.Prefs.prototype,'getString').andReturn(null);
    story = new window.Story(environment_stub.google.io);
  });

  it("create method should just call _create_and_update_other_id", function() {
    spyOn( story, '_create_and_update_other_id' );
    story.create(1,2);
    expect(story._create_and_update_other_id).toHaveBeenCalledWith(1,2);
  });

});

