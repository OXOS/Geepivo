require 'rubygems'
require 'sinatra'

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/gadget.xml' do
  @root_url = ENV['ROOT_URL']
  erb :'gadget.xml'
end

get '/manifest.xml' do
  @root_url = ENV['ROOT_URL']
  erb :'manifest.xml'
end

run Sinatra::Application

