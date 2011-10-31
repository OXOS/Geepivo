(function() {
  window.initializeGeepivoGadget = function() {
    var GeepivoGadget, container, gadget_content, i, imatch, inputs, key, matches, prefs, setting_input, settings, the_gadget;
    if (!window.console) {
      window.console = {};
      console.log = function(msg) {};
      console.debug = function(msg) {};
    }
    GeepivoGadget = (function() {
      function GeepivoGadget() {}
      GeepivoGadget.prototype.on_story_created = function(story) {
        return $(".notification_area", container).html("<a href='" + story.url + "' target='_blank'>" + story.url + "</a>");
      };
      GeepivoGadget.prototype.on_story_creation_error = function(error) {
        return $(".notification_area", container).html(error);
      };
      GeepivoGadget.prototype.post_create_story = function(subject, message_id) {
        var story;
        story = new Story(window.gadgets.io);
        story.name = subject;
        story.pivotal_api_token = prefs.getString('pivotal_api_token');
        story.project_id = prefs.getString('project_id');
        story.story_type = prefs.getString('story_type');
        story.integration_id = prefs.getString('integration_id');
        story.requested_by = prefs.getString('requested_by');
        story.owned_by = prefs.getString('owned_by');
        return story.create(this.on_story_created, this.on_story_creation_error);
      };
      GeepivoGadget.prototype._populate_projects_dropdown_request_success_callback = function(projects) {
        var projects_dropdown;
        projects_dropdown = $('select[name=project_id]');
        projects_dropdown.html('');
        $.each(projects, function(i, project) {
          var opt;
          opt = $('<option />');
          opt.val(project.id);
          opt.text(project.name);
          return opt.appendTo(projects_dropdown);
        });
        return projects_dropdown.val(prefs.getString('project_id'));
      };
      GeepivoGadget.prototype.populate_projects_dropdown = function() {
        var projects_api;
        projects_api = new Project(window.gadgets.io);
        projects_api.pivotal_api_token = $('input[name=pivotal_api_token]').val();
        return projects_api.get_index(this._populate_projects_dropdown_request_success_callback);
      };
      GeepivoGadget.prototype.on_settings_opened_or_closed = function() {
        if ($("#settings").is(":visible")) {
          $(this).html("settings ▲");
          the_gadget.populate_projects_dropdown();
          window.gadgets.window.adjustHeight(500);
        } else {
          $(this).html("settings ▼");
          window.gadgets.window.adjustHeight(32);
        }
        return false;
      };
      return GeepivoGadget;
    })();
    the_gadget = new GeepivoGadget();
    matches = window.google.contentmatch.getContentMatches();
    inputs = {};
    for (imatch in matches) {
      $.extend(inputs, matches[imatch]);
    }
    for (key in inputs) {
      console.log("inputs[" + key + " ] => " + inputs[key]);
    }
    container = $("#gadget_container");
    if (container.length !== 1) {
      throw "Error. Can't find gadget container.";
    }
    prefs = new window.gadgets.Prefs();
    setting_input = function(name) {
      return $(":input[name=" + name + "]", container);
    };
    gadget_content = window.templates.gadget;
    if (!inputs.subject) {
      return window.gadgets.window.adjustHeight(0);
    } else {
      window.gadgets.window.adjustHeight(32);
      container.html(gadget_content).show();
      settings = ["pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by"];
      for (i in settings) {
        setting_input(settings[i]).val(prefs.getString(settings[i]));
      }
      if (!(prefs.getString("pivotal_api_token") && prefs.getString("project_id"))) {
        $(".notification_area", container).html("Please fill required settings");
        $("#settings").show();
        the_gadget.on_settings_opened_or_closed();
      }
      $(".create_story_button", container).click(function() {
        return the_gadget.post_create_story(inputs.subject, inputs.message_id);
      });
      $("#toggle_settings_button").click(function() {
        $("#settings").toggle();
        return the_gadget.on_settings_opened_or_closed();
      });
      return $(".save_settings_button", container).click(function() {
        var i, val, _results;
        _results = [];
        for (i in settings) {
          val = setting_input(settings[i]).val();
          prefs.set(settings[i], val);
          $("#settings").hide();
          the_gadget.on_settings_opened_or_closed();
          _results.push($(".notification_area", container).html("Settings saved"));
        }
        return _results;
      });
    }
  };
}).call(this);
