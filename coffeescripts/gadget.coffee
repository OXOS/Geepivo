class window.GeepivoGadget
  on_story_created: (story) ->
    $(".notification_area", @container).html "<a href='#{story.url}' target='_blank'>#{story.url}</a>"
  on_story_creation_error: (error) ->
          $(".notification_area", @container).html(error)
  post_create_story: (subject, message_id) ->
    story = new Story(window.gadgets.io)

    story.name              = subject
    story.pivotal_api_token = @prefs.getString('pivotal_api_token')
    story.project_id        = @prefs.getString('project_id')
    story.story_type        = @prefs.getString('story_type')
    story.integration_id    = @prefs.getString('integration_id')
    story.requested_by      = @prefs.getString('requested_by')
    story.owned_by          = @prefs.getString('owned_by')
    story.create @on_story_created, @on_story_creation_error

  _populate_projects_dropdown_request_error_callback: (error_message) =>
    alert(error_message)
    projects_dropdown = $('select[name=project_id]')
    projects_dropdown.html('')

  _populate_projects_dropdown_request_success_callback: (projects) =>
    projects_dropdown = $('select[name=project_id]')
    $.each projects, (i, project) ->
      opt = $('<option />')
      opt.val(project.id)
      opt.text(project.name)
      opt.appendTo(projects_dropdown)
    projects_dropdown.val( @prefs.getString('project_id') )

  populate_projects_dropdown: () ->
    projects_dropdown = $('select[name=project_id]')
    projects_dropdown.html('')

    pivotal_api_token = $('input[name=pivotal_api_token]').val()

    if pivotal_api_token.length > 0
      projects_api = new Project(window.gadgets.io)
      projects_api.pivotal_api_token = pivotal_api_token
      projects_api.get_index @_populate_projects_dropdown_request_success_callback, @_populate_projects_dropdown_request_error_callback

  #TODO: use DOM event instead
  on_settings_opened_or_closed: () ->
    if $("#settings").is(":visible")
      $(this).html "settings ▲"
      @populate_projects_dropdown()
      window.gadgets.window.adjustHeight 260
    else
      $(this).html "settings ▼"
      window.gadgets.window.adjustHeight 32
    return false

  constructor: () ->
    matches = window.google.contentmatch.getContentMatches()
    @inputs = {}
    for imatch of matches
      $.extend @inputs, matches[imatch]
    
    @container = $("#gadget_container")

    if @container.length != 1
      throw "Error. Can't find gadget container."

    @prefs = new window.gadgets.Prefs()
    setting_input = (name) ->
      $ ":input[name=#{name}]", @container
    
    gadget_content = window.templates.gadget_template
    
    if ! @inputs.subject
      window.gadgets.window.adjustHeight 0
    else
      window.gadgets.window.adjustHeight 32
      @container.html(gadget_content)
      @container.show()
    
      settings = [ "pivotal_api_token", "project_id", "story_type", "requested_by", "integration_id", "owned_by" ]
      for i of settings
        setting_input(settings[i]).val @prefs.getString(settings[i])
    
      unless @prefs.getString("pivotal_api_token") and @prefs.getString("project_id")
        $(".notification_area", @container).html "Please fill required settings"
        $("#settings").show()
        @on_settings_opened_or_closed()
    
      $("a#edit_pivotal_api_token", @container).click =>
        new_token_value = prompt "Enter new Pivotal API Token:"
        if typeof(new_token_value) == 'string'
          setting_input('pivotal_api_token').val new_token_value
          @populate_projects_dropdown()
        return false
      
      $(".create_story_button", @container).click =>
        @post_create_story @inputs.subject, @inputs.message_id
        return false
      
      $("#toggle_settings_button").click =>
        $("#settings").toggle()
        @on_settings_opened_or_closed()
        return false
    
      $(".save_settings_button", @container).click =>
        for i of settings
          key = settings[i]
          val = setting_input(key).val()
          @prefs.set key, val
          $("#settings").hide()
          @on_settings_opened_or_closed()
          $(".notification_area", @container).html "Settings saved"
        return false

      #$.merge($.fn.tipsy.defaults, {
      #    gravity: 'nw',
      #    html: true,
      #    offset: 5,
      #    opacity: 0.9
      #})

      $("span.help").each (i,help)=>
        $(help).attr('title', $(help).text() )
        $(help).html("<img src='http://openiconlibrary.sourceforge.net/gallery2/open_icon_library-full/icons/png/16x16/categories/system-help-3.png' alt='help' />")
        #$(help).tipsy()


window.initializeGeepivoGadget = ->
  unless window.console
    window.console = {}
    console.log = (msg) ->
    console.debug = (msg) ->

  #$.ready ->
  window.the_gadget = new window.GeepivoGadget()
