class CreateProjects < ActiveRecord::Migration[7.2]
  def change
    create_table :projects do |t|
      t.string :title, default: "Untitled"
      t.text :description
      t.string :url, default: "#"
      t.string :status, default: "published"
      t.integer :position, default: 0


      t.timestamps
    end
  end
end
