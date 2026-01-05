class Project < ApplicationRecord
  # Validations
  validates :title, presence: true
  validates :status, inclusion: { in: %w[published draft archived] }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  
  # Scopes
  scope :published, -> { where(status: 'published').order(position: :asc, created_at: :desc) }
  scope :by_position, -> { order(position: :asc, created_at: :desc) }
  
  # Methods
  def published?
    status == 'published'
  end
end
