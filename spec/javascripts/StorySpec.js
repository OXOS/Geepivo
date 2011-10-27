describe("Story", function() {

  var story;

  beforeEach(function() {
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    //window.gadgets = environment_stub.gadgets;
    //spyOn(window.gadgets.Prefs.prototype,'getString').andReturn(null);
    story = new window.Story(environment_stub.gadgets.io);
    expect
  });

  it("'create' method should just call _create_and_update_other_id", function() {
    spyOn( story, '_create_and_update_other_id' );
    story.create(1,2);
    expect(story._create_and_update_other_id).toHaveBeenCalledWith(1,2);
  });

  describe("_create_and_update_other_id", function() {

    it("should call on_error callback with 'Error creating story' message", function() {
      on_success = jasmine.createSpy('on_success');
      on_error = jasmine.createSpy('on_error');
      spyOn(story.io,'makeRequest').andCallFake( function(url,callback,params){
        response = {
          rc: 401
          };
        callback( response );
      } );
      story._create_and_update_other_id(on_success, on_error);

      expect(on_success).not.toHaveBeenCalled();
      expect(on_error).toHaveBeenCalledWith("Error creating story");
    });
  });

});

