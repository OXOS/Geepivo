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

    it("should make a request and call _response_callback method", function() {
      var dummy_response = 1,
        dummy_success_callback = 2,
        dummy_error_callback = 3; 

      spyOn(story.io,'makeRequest').andCallFake( function(url,callback,params){
        callback( dummy_response );
      } );
      spyOn(story,'_response_callback');

      story._create_and_update_other_id(dummy_success_callback, dummy_error_callback);

      expect(story._response_callback).toHaveBeenCalledWith(dummy_response, dummy_success_callback, dummy_error_callback)
    });
  });

  describe("_response_callback", function() {

    it("should call on_error callback with 'Error creating story' message", function() {
      on_success = jasmine.createSpy('on_success');
      on_error = jasmine.createSpy('on_error');
      response = { rc: 400 };

      story._response_callback( response, on_success, on_error );

      expect(on_success).not.toHaveBeenCalled();
      expect(on_error).toHaveBeenCalledWith("Error creating story");
    });
  });

});

