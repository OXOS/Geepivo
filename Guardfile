guard 'shell' do
  watch(%r{\.(coffee|js|css|html|erb)$}) do |m|
    #`tail #{m[0]}`
    `rake`
  end
end
