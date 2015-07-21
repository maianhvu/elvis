# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )
{
  pages: "index.js",
}.each_pair do |controller, assets|
  precompile_list = if assets.is_a? String
                       [controller.to_s << "/" << assets]
                     elsif assets.is_a? Array
                       assets.map { |a| controller.to_s << "/" << a }
                     else
                       [controller.to_s]
                     end
  Rails.application.config.assets.precompile += precompile_list
end
