require 'rubygems'
require 'sinatra'

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/gadget.xml' do
  erb :'gadget.xml'
end

run Sinatra::Application

