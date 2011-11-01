guard 'coffeescript', :input => 'coffeescripts', :output => 'javascripts'

guard 'shell' do

  watch(/^javascripts\/(.*)\.js$/) do |matches|
    `cat javascripts/*.js > public/geepivo.js`

    puts "public/geepivo.js file generated from javascripts/*.js files"
  end

  watch(/^stylesheets\/(.*)\.css$/) do |matches|
    `cat stylesheets/*.css > public/geepivo.css`

    puts "public/geepivo.css file generated from stylesheets/*.css files"
  end

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
end
