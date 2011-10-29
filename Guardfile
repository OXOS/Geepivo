require 'rubygems'
require 'json/pure'
require 'json/add/core'

guard 'coffeescript', :input => 'coffeescripts', :output => 'public/javascripts'

guard 'shell' do
  watch(/^templates\/(.*)\.html$/) do |matches|
    file_name = matches[1]

    input_html = nil
    File.open("templates/#{file_name}.html", "r") do |file|
      input_html = file.read
    end
    
    output = ""
    output << "if (typeof window.templates === 'undefined') { window.templates = {}; }\n"
    output << "window.templates['#{file_name}'] = #{input_html.to_json};"
    
    File.open("public/javascripts/templates/#{file_name}.js", "w") do |file|
      file.write(output)
    end



  end
end
