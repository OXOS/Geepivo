(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.GeepivoGadget = (function() {
    GeepivoGadget.prototype.on_story_created = function(story) {
      return $(".notification_area", this.container).html("<a href='" + story.url + "' target='_blank'>" + story.url + "</a>");
    };
    GeepivoGadget.prototype.on_story_creation_error = function(error) {
      return $(".notification_area", this.container).html(error);
    };
    GeepivoGadget.prototype.post_create_story = function(subject, message_id) {
      var story;
      story = new Story(window.gadgets.io);
      story.name = subject;
      story.pivotal_api_token = this.prefs.getString('pivotal_api_token');
      story.project_id = this.prefs.getString('project_id');
      story.story_type = this.prefs.getString('story_type');
      story.integration_id = this.prefs.getString('integration_id');
      story.requested_by = this.prefs.getString('requested_by');
      story.owned_by = this.prefs.getString('owned_by');
      return story.create(this.on_story_created, this.on_story_creation_error);
    };
    GeepivoGadget.prototype._populate_projects_dropdown_request_error_callback = function(error_message) {
      var projects_dropdown;
      alert(error_message);
      projects_dropdown = $('select[name=project_id]');
      return projects_dropdown.html('');
    };
    GeepivoGadget.prototype._populate_projects_dropdown_request_success_callback = function(projects) {
      var projects_dropdown;
      this.projects = projects;
      projects_dropdown = $('select[name=project_id]');
      $.each(projects, function(i, project) {
        var opt;
        opt = $('<option />');
        opt.val(project.id);
        opt.text(project.name);
        return opt.appendTo(projects_dropdown);
      });
      projects_dropdown.val(this.prefs.getString('project_id'));
      return this.populate_members_dropdowns();
    };
    GeepivoGadget.prototype.populate_projects_dropdown = function() {
      var pivotal_api_token, projects_api, projects_dropdown;
      projects_dropdown = $('select[name=project_id]');
      projects_dropdown.html('');
      pivotal_api_token = $('input[name=pivotal_api_token]').val();
      if (pivotal_api_token.length > 0) {
        projects_api = new Project(window.gadgets.io);
        projects_api.pivotal_api_token = pivotal_api_token;
        return projects_api.get_index(this._populate_projects_dropdown_request_success_callback, this._populate_projects_dropdown_request_error_callback);
      }
    };
    GeepivoGadget.prototype._populate_dropdown = function(dropdown, options, val) {
      console.log('_populate_dropdown', dropdown, options, val);
      dropdown.html('');
      $.each(options, function(i, option) {
        var option_elm;
        option_elm = $('<option />');
        option_elm.val(option[0]);
        option_elm.text(option[1]);
        return option_elm.appendTo(dropdown);
      });
      return dropdown.val(val);
    };
    GeepivoGadget.prototype.populate_members_dropdowns = function() {
      var options, proj, selected_project_id;
      selected_project_id = $('select[name=project_id]').val();
      console.log('selected_project_id', selected_project_id);
      console.log('@projects', this.projects);
      proj = _.find(this.projects, function(p) {
        return p.id === parseInt(selected_project_id);
      });
      console.log('proj', proj);
      options = _.map(proj.members, function(member) {
        console.log('member', member);
        return [member.name, member.name];
      });
      this._populate_dropdown($('select[name=owned_by]'), options, this.prefs.getString('owned_by'));
      return this._populate_dropdown($('select[name=requested_by]'), options, this.prefs.getString('requested_by'));
    };
    GeepivoGadget.prototype.on_settings_opened_or_closed = function() {
      if ($("#settings").is(":visible")) {
        $(this).html("settings ▲");
        this.populate_projects_dropdown();
        window.gadgets.window.adjustHeight(260);
      } else {
        $(this).html("settings ▼");
        window.gadgets.window.adjustHeight(32);
      }
      return false;
    };
    function GeepivoGadget() {
      this._populate_projects_dropdown_request_success_callback = __bind(this._populate_projects_dropdown_request_success_callback, this);
      this._populate_projects_dropdown_request_error_callback = __bind(this._populate_projects_dropdown_request_error_callback, this);
      var gadget_content, i, imatch, matches, setting_input, settings;
      matches = window.google.contentmatch.getContentMatches();
      this.inputs = {};
      for (imatch in matches) {
        $.extend(this.inputs, matches[imatch]);
      }
      this.container = $("#gadget_container");
      if (this.container.length !== 1) {
        throw "Error. Can't find gadget container.";
      }
      this.prefs = new window.gadgets.Prefs();
      setting_input = function(name) {
        return $(":input[name=" + name + "]", this.container);
      };
      gadget_content = window.templates.gadget_template;
      if (!this.inputs.subject) {
        window.gadgets.window.adjustHeight(0);
      } else {
        window.gadgets.window.adjustHeight(32);
        this.container.html(gadget_content);
        this.container.show();
        settings = ["pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by"];
        for (i in settings) {
          setting_input(settings[i]).val(this.prefs.getString(settings[i]));
        }
        if (!(this.prefs.getString("pivotal_api_token") && this.prefs.getString("project_id"))) {
          $(".notification_area", this.container).html("Please fill required settings");
          $("#settings").show();
          this.on_settings_opened_or_closed();
        }
        $("a#edit_pivotal_api_token", this.container).click(__bind(function() {
          var new_token_value;
          new_token_value = prompt("Enter new Pivotal API Token:");
          if (typeof new_token_value === 'string') {
            setting_input('pivotal_api_token').val(new_token_value);
            this.populate_projects_dropdown();
          }
          return false;
        }, this));
        $(".create_story_button", this.container).click(__bind(function() {
          this.post_create_story(this.inputs.subject, this.inputs.message_id);
          return false;
        }, this));
        $("select[name=project_id]").change(__bind(function() {
          return this.populate_members_dropdowns();
        }, this));
        $("#toggle_settings_button").click(__bind(function() {
          $("#settings").toggle();
          this.on_settings_opened_or_closed();
          return false;
        }, this));
        $(".save_settings_button", this.container).click(__bind(function() {
          var i, key, val;
          for (i in settings) {
            key = settings[i];
            val = setting_input(key).val();
            this.prefs.set(key, val);
            $("#settings").hide();
            this.on_settings_opened_or_closed();
            $(".notification_area", this.container).html("Settings saved");
          }
          return false;
        }, this));
        $("span.help").each(__bind(function(i, help) {
          $(help).attr('title', $(help).text());
          return $(help).html("<img src='http://openiconlibrary.sourceforge.net/gallery2/open_icon_library-full/icons/png/16x16/categories/system-help-3.png' alt='help' />");
        }, this));
      }
    }
    return GeepivoGadget;
  })();
  window.initializeGeepivoGadget = function() {
    if (!window.console) {
      window.console = {};
      console.log = function(msg) {};
      console.debug = function(msg) {};
    }
    return window.the_gadget = new window.GeepivoGadget();
  };
}).call(this);
