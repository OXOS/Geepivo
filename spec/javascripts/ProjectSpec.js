describe("Project", function() {

  var project;

  beforeEach(function() {
    environment_stub = new GoogleGadgetsEnvironmentStubs();
    project = new window.Project(environment_stub.gadgets.io);
  });

  describe("get_index", function() {

    it("should make a request to /projects", function() {
      var dummy_success_callback = 2;
      var dummy_error_callback = 3; 

      spyOn(project.io,'makeRequest').andCallFake( function(url,callback,params){
        expect(url).toMatch(/^https:\/\/www.pivotaltracker.com\/services\/v3\/projects/);
        expect(typeof callback).toEqual('function');
        expect( params ).toEqual({
          METHOD: 'GET',
          HEADERS: { 'X-TrackerToken' : 'pivotal_api_token_value', 'Content-type' : 'application/xml' },
          CONTENT_TYPE: 'DOM'
        });
      });

      project.pivotal_api_token = 'pivotal_api_token_value';
      project.get_index(dummy_success_callback, dummy_error_callback);

      expect(project.io.makeRequest).toHaveBeenCalled();
    });
    
    it("should call _get_index_callback", function() {
      var dummy_response = 1;
      var dummy_success_callback = 2;
      var dummy_error_callback = 3; 

      spyOn(project.io,'makeRequest').andCallFake( function(url,callback,params){
        callback(dummy_response, dummy_success_callback, dummy_error_callback);
      });

      spyOn(project,'_get_index_callback');
      
      project.get_index(dummy_success_callback, dummy_error_callback);

      expect(project._get_index_callback).toHaveBeenCalledWith(dummy_response, dummy_success_callback, dummy_error_callback);
    });
  });

  describe("_get_index_callback", function() {
    beforeEach(function() {
      on_success = jasmine.createSpy('on_success');
      on_error = jasmine.createSpy('on_error');
    });

    it("should detect authentication errors", function() {
      response = { rc: 401 };

      project._get_index_callback( response, on_success, on_error );

      expect(on_success).not.toHaveBeenCalled();
      expect(on_error).toHaveBeenCalledWith("Authentication error - check your API token and project permissions");
    });

    it("should call on_error callback", function() {
      response = { rc: 400 };

      project._get_index_callback( response, on_success, on_error );

      expect(on_success).not.toHaveBeenCalled();
      expect(on_error).toHaveBeenCalledWith("Error retrieving list of projects");
    });

    it("should call on_success callback with parsed projects", function() {
      response_string = window.fixtures['get_projects_response.xml'];
      response = { rc: 200, text: response_string };

      project._get_index_callback( response, on_success, on_error );

      expected_data = [
        {
          id: 293423,
          name: 'Main Project',
          members: [
            { email: 'wojtek@oxos.pl', name: 'Wojtek Kruszewski', initials: 'WOJ' },
            { email: 'daniel@oxos.pl', name: 'daniel', initials: 'DS' }
          ]
        },
        {
          id: 145861,
          name: 'Side project',
          members: [
            { email: 'wojtek@oxos.pl', name: 'Wojtek Kruszewski', initials: 'WOJ' }
          ]
        }
      ];

      expect(on_success).toHaveBeenCalledWith(expected_data);
      expect(on_error).not.toHaveBeenCalled();
    });

  });

});

