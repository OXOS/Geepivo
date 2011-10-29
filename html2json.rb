require 'rubygems'
require 'json/pure'
require 'json/add/core'

file_name = ARGV.first
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
