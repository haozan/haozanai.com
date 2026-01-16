class Project < ApplicationRecord
  # ActiveStorage attachment
  has_one_attached :cover_image
  
  # Validations
  validates :title, presence: true
  validates :status, inclusion: { in: %w[published draft archived] }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  
  # Callbacks
  after_save :fetch_cover_image_if_needed
  
  # Scopes
  scope :published, -> { where(status: 'published').order(position: :asc, created_at: :desc) }
  scope :by_position, -> { order(position: :asc, created_at: :desc) }
  
  # Methods
  def display_cover_url
    # Priority: uploaded image > og:image URL
    if cover_image.attached?
      Rails.application.routes.url_helpers.rails_blob_url(cover_image, only_path: true)
    else
      cover_image_url
    end
  end

  def published?
    status == 'published'
  end

  def refresh_cover_image!
    return false if url.blank? || url == '#'

    new_cover_url = OgImageFetcherService.new(url).call
    if new_cover_url.present?
      update_column(:cover_image_url, new_cover_url)
      true
    else
      false
    end
  end

  private

  def fetch_cover_image_if_needed
    return if url.blank? || url == '#'
    return if cover_image_url.present?
    return unless saved_change_to_url? || (url.present? && cover_image_url.blank?)

    # Fetch asynchronously to avoid blocking save
    new_cover_url = OgImageFetcherService.new(url).call
    update_column(:cover_image_url, new_cover_url) if new_cover_url.present?
  rescue StandardError => e
    Rails.logger.error("Failed to fetch cover image for project #{id}: #{e.message}")
  end
end
