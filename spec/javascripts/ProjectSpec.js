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
        expect(url).toEqual('https://www.pivotaltracker.com/services/v3/projects');
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
      expect(on_error).toHaveBeenCalled();
    });

    it("should call on_success callback with parsed projects", function() {
      response_string = '<?xml version="1.0" encoding="UTF-8"?> <projects type="array"> <project> <id>1</id> <name>Sample Project</name> <iteration_length type="integer">2</iteration_length> <week_start_day>Monday</week_start_day> <point_scale>0,1,2,3</point_scale> <velocity_scheme>Average of 4 iterations</velocity_scheme> <current_velocity>10</current_velocity> <initial_velocity>10</initial_velocity> <number_of_done_iterations_to_show>12</number_of_done_iterations_to_show> <labels>shields,transporter</labels> <allow_attachments>true</allow_attachments> <public>false</public> <use_https>true</use_https> <bugs_and_chores_are_estimatable>false</bugs_and_chores_are_estimatable> <commit_mode>false</commit_mode> <last_activity_at type="datetime">2010/01/16 17:39:10 CST</last_activity_at> <memberships type="array"> <membership> <id>1006</id> <person> <email>kirkybaby@earth.ufp</email> <name>James T. Kirk</name> <initials>JTK</initials> </person> <role>Owner</role> </membership> </memberships> <integrations type="array"> <integration> <id type="integer">3</id> <type>Other</type> <name>United Federation of Planets Bug Tracker</name> <field_name>other_id</field_name> <field_label>United Federation of Planets Bug Tracker Id</field_label> <active>true</active> </integration> </integrations> </project> <project> <id>2</id> <name>Sample Project 2</name> <iteration_length type="integer">4</iteration_length> <week_start_day>Monday</week_start_day> <point_scale>0,1,2,3</point_scale> <velocity_scheme>Average of 4 iterations</velocity_scheme> <current_velocity>10</current_velocity> <initial_velocity>10</initial_velocity> <number_of_done_iterations_to_show>12</number_of_done_iterations_to_show> <labels>my label</labels> <allow_attachments>false</allow_attachments> <public>true</public> <use_https>false</use_https> <bugs_and_chores_are_estimatable>false</bugs_and_chores_are_estimatable> <commit_mode>false</commit_mode> <last_activity_at type="datetime">2010/01/16 17:39:10 CST</last_activity_at> <memberships type="array"> </memberships> <integrations type="array"> </integrations> </project> </projects>';
      response = { rc: 200, text: response_string };

      project._get_index_callback( response, on_success, on_error );

      expected_data = [
        {
          id: 1,
          name: 'Sample Project'
        },
        {
          id: 2,
          name: 'Sample Project 2'
        }
      ];

      expect(on_success).toHaveBeenCalledWith(expected_data);
      expect(on_error).not.toHaveBeenCalled();
    });

  });

});

