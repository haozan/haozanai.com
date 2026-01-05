class CreateArticles < ActiveRecord::Migration[7.2]
  def change
    create_table :articles do |t|
      t.string :title, default: "Untitled"
      t.text :content
      t.text :excerpt
      t.datetime :published_at
      t.string :status, default: "draft"


      t.timestamps
    end
  end
end
