# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'shell' do
  watch(/.*\.coffee/) do
    `cat coffeescripts/*.coffee > coffeescripts/merged/gadget.coffee`
  end
end

guard 'coffeescript', :input => 'coffeescripts/merged', :output => 'public/javascripts'

