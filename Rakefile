require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'ruby-debug'
require 'coffee-script'
require 'json/pure'
require 'json/add/core'
require 'erubis'

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
    puts t.inspect
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
    puts t.inspect
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

def render_erb(input_file,variables)
  template_content = File.read(input_file)
  Erubis::Eruby.new(template_content).result(variables)
end

def write_file(fname, content)
  File.open(fname, "w") do |file|
    file.write(content)
  end
end

all_tasks = Rake::Task.tasks.map(&:name)
gadget_xml_source_files = \
  FileList['views/*.erb'] \
  + FileList['stylesheets/*.css'] \
  + FileList['javascripts/*.js'] \
  + all_tasks.grep(/coffeescripts\/.*.js/) \
  + all_tasks.grep(/templates\/.*.js/)

desc "gadget.xml"
file 'gadget.xml' => gadget_xml_source_files do |t|
  input_file = "views/gadget.xml.erb"
  output_file = "gadget.xml"
  output = render_erb input_file, binding()
  write_file(output_file, output)
end

