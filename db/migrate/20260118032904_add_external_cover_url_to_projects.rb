class AddExternalCoverUrlToProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :external_cover_url, :string

  end
end
