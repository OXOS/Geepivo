require 'rubygems'
require 'json/pure'
require 'json/add/core'

input_html = nil
File.open("templates/gadget.html", "r") do |file|
  input_html = file.read
end

output = ""
output << "if (typeof window.templates === 'undefined') { window.templates = {}; }\n"
output << "window.templates.gadget = #{input_html.to_json};"

File.open("public/javascripts/templates/gadget.js", "w") do |file|
  file.write(output)
end
