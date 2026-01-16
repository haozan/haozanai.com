class AddCoverImageUrlToProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :cover_image_url, :string

  end
end
