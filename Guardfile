require 'rubygems'
require 'ruby-debug'
require 'erubis'
require 'ostruct'

guard 'coffeescript', :input => 'coffeescripts', :output => 'javascripts'

def write_file(fname, content)
  File.open(fname, "w") do |file|
    file.write(content)
  end
end

def render_erb(input_file,variables)
  template_content = File.read(input_file)
  Erubis::Eruby.new(template_content).result(variables)
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

  watch(/\.(css|js|erb)$/) do |matches|
    input_file = "views/gadget.xml.erb"
    
    @root_url = "http://geepivo.com"
    output_file = "website/public/gadget.xml"
    output = render_erb input_file, binding()
    write_file(output_file, output)

    @root_url = "http://dev.geepivo.com"
    output_file = "website/public/dev_gadget.xml"
    output = render_erb input_file, binding()
    write_file(output_file, output)

    puts "compiled #{input_file} -> #{output_file}"
  end

end
