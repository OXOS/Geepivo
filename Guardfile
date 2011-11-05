guard 'shell' do
  watch(%r{\.(coffee|js|css|html|erb)$}) do |m|
    #`tail #{m[0]}`
    `rake`
  end

  watch( 'spec/javascripts/fixtures/get_projects_response.xml' ) do |m|
    #`tail #{m[0]}`
    `rake spec/javascripts/helpers/get_projects_response.js`
  end
end
