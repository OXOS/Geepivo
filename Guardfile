# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'coffeescript', :input => 'coffeescripts'

guard 'shell' do
  watch('.js') do
    `cat coffeescripts/*.js > public/javascripts/gadget.js`
  end
end
