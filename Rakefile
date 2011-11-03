require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'ruby-debug'
require 'coffee-script'
require 'json/pure'
require 'json/add/core'

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end

FileList['coffeescripts/*.coffee'].each do |input_file|
  output_file = input_file.sub(/\.coffee$/,'.js')

  desc "Compile #{input_file} to #{output_file}"
  file output_file => input_file do |t|
    output = ::CoffeeScript.compile File.read(t.prerequisites[0])
    File.open(t.name,"w") do |file|
      file.write(output)
    end
  end
end

FileList['templates/*.html'].each do |input_file|
  output_file = input_file.sub(/\.html$/,'.js')

  desc "Compile #{input_file} to #{output_file}"
  file output_file => input_file do |t|
    input_file = t.prerequisites[0]
    base_name = File.basename(input_file,".html")
    input_html = File.read(t.prerequisites[0])

    output = ""
    output << "if (typeof window.templates === 'undefined') { window.templates = {}; }\n"
    output << "window.templates['#{base_name}'] = #{input_html.to_json};"

    File.open(output_file, "w") do |file|
      file.write(output)
    end
  end
end
