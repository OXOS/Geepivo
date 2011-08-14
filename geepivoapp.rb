use Rack::Session::Cookie
enable :sessions

require 'gapps_openid'
require 'rack/openid'

use Rack::OpenID

helpers do
  def require_authentication
    redirect '/login' unless authenticated?
  end

  # Check if user authenticated
  def authenticated?
    !session[:openid].nil?
  end

  # Constructs an absolute URL to a path in the app
  def url_for(path)
    url = request.scheme + "://"
    url << request.host

    scheme, port = request.scheme, request.port
    if scheme == "https" && port != 443 ||
        scheme == "http" && port != 80
      url << ":#{port}"
    end
    url << path
    url
  end
end

# Handle login form & navigation links from Google Apps
get '/login' do
  halt 422 if params["openid_identifier"].nil?

  # Have provider identifier, tell rack-openid to start OpenID process
  headers 'WWW-Authenticate' => Rack::OpenID.build_header(
    :identifier => params["openid_identifier"],
    :required => ["http://axschema.org/contact/email",
                  "http://axschema.org/namePerson/first",
                  "http://axschema.org/namePerson/last"],
    :return_to => url_for('/openid/complete'),
    :method => 'post')
  halt 401, 'Authentication required.'
end

# Handle the response from the OpenID provider
post '/openid/complete' do
  resp = request.env["rack.openid.response"]
  if resp.status == :success
    session[:openid] = resp.display_identifier
    ax = OpenID::AX::FetchResponse.from_success_response(resp)
    session[:user_attributes] = {
      :email => ax.get_single("http://axschema.org/contact/email"),
      :first_name => ax.get_single("http://axschema.org/namePerson/first"),
      :last_name => ax.get_single("http://axschema.org/namePerson/last")
    }
    redirect '/cal'
  else
    "Error: #{resp.status}"
  end
end

get '/' do
  erb :'index.html'
end

get '/gadget.xml' do
  @root_url = ENV['ROOT_URL']
  erb :'gadget.xml'
end

get '/manifest.xml' do
  @root_url = ENV['ROOT_URL']
  erb :'manifest.xml'
end

