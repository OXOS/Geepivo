use Rack::Session::Cookie
enable :sessions

use Rack::OpenID

CONSUMER_KEY	= ENV['CONSUMER_KEY']
CONSUMER_SECRET = ENV['CONSUMER_SECRET']


$:.push 'lib/gmail_xoauth/lib/'
require 'gmail_xoauth.rb'

module PivotalTracker
  class Story

    def move_to_top_of_backlog
      project = Project.find self.project_id
      top_story = project.stories.all(:current_state => "unstarted").first
      move :before => top_story
    end

    def move opts
      target = opts[:before] || opts[:after]
      target_id = if target.is_a? Story
        target.id
      else
        target
      end

      place  = opts.has_key?(:before) ? :before : :after

      response = Client.connection["/projects/#{project_id}/stories/#{id}/moves?move\[move\]=#{place}&move\[target\]=#{target_id}"].post("", :content_type => 'application/xml')
      return Story.parse(response)
    end

  end
end

helpers do
  include Rack::Utils

  def require_authentication    
    redirect '/login' unless authenticated?
  end 
  
  def authenticated?
    !session["openid"].nil?
  end
  
  def url_for(path)
    url = request.scheme + "://"
    url << request.host

    scheme, port = request.scheme, request.port
    if scheme == "https" && port != 443 || scheme == "http" && port != 80
      url << ":#{port}"
    end
    url << path
    url
  end
end

before do
  @openid = session["openid"]
  @user_attrs = session["user_attributes"]
  @app_suffix = request.env['HTTP_HOST']
  @current_time = Time.now.utc.to_s
end

# Clear the session
get '/logout' do
  session.clear
  redirect '/login'
end

# Handle login form & navigation links from Google Apps
get '/login' do
  if params["openid_identifier"].nil?
    # No identifier, just render login form
    erb :login
  else
    # Have provider identifier, tell rack-openid to start OpenID process
    headers 'WWW-Authenticate' => Rack::OpenID.build_header(
      :identifier => params["openid_identifier"],
      :required => ["http://axschema.org/contact/email", 
                    "http://axschema.org/namePerson/first",
                    "http://axschema.org/namePerson/last"],
      :return_to => url_for('/openid/complete'),
      :method => 'post'
      )
    halt 401, 'Authentication required.'
  end
end

# Handle the response from the OpenID provider
post '/openid/complete' do
  resp = request.env["rack.openid.response"]
  if resp.status == :success
    session["openid"] = resp.display_identifier
    ax = OpenID::AX::FetchResponse.from_success_response(resp)
    session["user_attributes"] = {
      :email => ax.get_single("http://axschema.org/contact/email"),
      :first_name => ax.get_single("http://axschema.org/namePerson/first"),
      :last_name => ax.get_single("http://axschema.org/namePerson/last")     
    }
    redirect '/mail'
  else
    "Error: #{resp.status}"
  end
end

post '/stories' do
  story = nil

  PivotalTracker::Client.token = '894b02b8a2473be7ce6a2bf8847b7f16'
  project = PivotalTracker::Project.find(145861)

  default_attribs = {:story_type => 'chore', :current_state => "unstarted", :owned_by => "Daniel", :requested_by=> "Wojciech"}
  attribs = default_attribs.dup.merge(
    :name => params[:email][:subject],
    :other_id => params[:email][:message_id],
    :integration_id => 2033
  )
  begin
    story = project.stories.create attribs
    story.move_to_top_of_backlog
  rescue Exception => e
    story = e.inspect
  end

  "creating a story...<br />
  <small><small>
  params: #{params.inspect}<br />
  project: #{project.inspect}<br />
  attribs: #{attribs.inspect}<br />
  <small></small>
  <big>
  story: ##{story.id} #{story.inspect}<br />
  <big>\n\n"
  
end

get '/mail' do
  require_authentication
  email = @user_attrs[:email]
  
  imap = Net::IMAP.new('imap.googlemail.com', 993, usessl = true, certs = nil, verify = false)
  imap.send(:debug=,true)
  imap.authenticate 'XOAUTH', email, :two_legged => true, :consumer_key => CONSUMER_KEY, :consumer_secret => CONSUMER_SECRET
  
  messages_count = imap.status('INBOX', ['MESSAGES'])['MESSAGES']
  "Seeing #{messages_count} messages in INBOX"
end

get '/gadget.xml' do
  content_type 'text/xml'
  erb :gadget, :layout => false
end

get '/manifest.xml' do
  content_type 'text/xml'
  @gadget_specs_url = url_for('/gadget.xml')

  if ENV['RACK_ENV'] == 'development'
    @gadget_specs_url = 'http://pivodev.oxos.pl/gadget.xml'
  end

  erb :manifest, :layout => false
end

get '/' do
  "Hello World"
end

get '/*' do
  redirect '/'
end
