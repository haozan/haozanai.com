class Article < ApplicationRecord
  # Validations
  validates :title, presence: true
  validates :status, inclusion: { in: %w[published draft archived] }
  
  # Scopes
  scope :published, -> { where(status: 'published').where('published_at <= ?', Time.current).order(published_at: :desc) }
  scope :recent, -> { order(published_at: :desc) }
  
  # Callbacks
  before_validation :set_published_at, if: -> { status == 'published' && published_at.blank? }
  before_validation :generate_excerpt, if: -> { excerpt.blank? && content.present? }
  
  # Methods
  def published?
    status == 'published' && published_at.present? && published_at <= Time.current
  end
  
  private
  
  def set_published_at
    self.published_at = Time.current
  end
  
  def generate_excerpt
    self.excerpt = content.truncate(200, separator: ' ')
  end
end
