require 'rubygems'
require 'erb'

guard 'coffeescript', :input => 'coffeescripts', :output => 'javascripts'

def read_file(fname)
  content = nil
  File.open(fname, "r") do |file|
    content = file.read
  end
  content
end

def write_file(fname, content)
  File.open(fname, "w") do |file|
    file.write(content)
  end
end

def erb(input_file,binding)
  template_content = read_file(input_file)
  template = ERB.new(template_content)
  template.result(binding)
end

guard 'shell' do

  watch(/^templates\/(.*)\.html$/) do |matches|
    require 'rubygems'
    require 'json/pure'
    require 'json/add/core'

    file_name = matches[1]
    input_file = "templates/#{file_name}.html"
    output_file = "javascripts/#{file_name}.js"

    input_html = nil
    File.open(input_file, "r") do |file|
      input_html = file.read
    end
    
    output = ""
    output << "if (typeof window.templates === 'undefined') { window.templates = {}; }\n"
    output << "window.templates['#{file_name}'] = #{input_html.to_json};"
    
    File.open(output_file, "w") do |file|
      file.write(output)
    end

    puts "#{output_file} generated from #{input_file}"
  end

  watch(/^views\/gadget\.xml\.erb$/) do |matches|
    input_file = "views/gadget.xml.erb"
    output_file = "website/public/gadget.xml"

    output = erb(input_file, binding)
    
    write_file(output_file, output)

    puts "compiled #{input_file} -> #{input_file}"
  end

end
