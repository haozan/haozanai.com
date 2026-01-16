require 'net/http'
require 'uri'
require 'nokogiri'

class OgImageFetcherService < ApplicationService
  def initialize(url)
    @url = url
  end

  def call
    return nil if @url.blank? || @url == '#'

    begin
      uri = URI.parse(@url)
      return nil unless uri.scheme.in?(['http', 'https'])

      response = fetch_with_timeout(uri)
      return nil unless response.is_a?(Net::HTTPSuccess)

      extract_og_image(response.body)
    rescue StandardError => e
      Rails.logger.error("OgImageFetcherService failed for #{@url}: #{e.message}")
      nil
    end
  end

  private

  def fetch_with_timeout(uri)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https', open_timeout: 5, read_timeout: 5) do |http|
      request = Net::HTTP::Get.new(uri)
      request['User-Agent'] = 'Mozilla/5.0 (compatible; OgImageBot/1.0)'
      http.request(request)
    end
  end

  def extract_og_image(html)
    doc = Nokogiri::HTML(html)
    
    # Try og:image first
    og_image = doc.at_css('meta[property="og:image"]')&.[]('content')
    return normalize_url(og_image) if og_image.present?

    # Fallback to twitter:image
    twitter_image = doc.at_css('meta[name="twitter:image"]')&.[]('content')
    return normalize_url(twitter_image) if twitter_image.present?

    nil
  end

  def normalize_url(image_url)
    return nil if image_url.blank?

    # If already absolute URL
    return image_url if image_url.start_with?('http://', 'https://')

    # Convert relative URL to absolute
    base_uri = URI.parse(@url)
    if image_url.start_with?('//')
      "#{base_uri.scheme}:#{image_url}"
    elsif image_url.start_with?('/')
      "#{base_uri.scheme}://#{base_uri.host}#{image_url}"
    else
      "#{base_uri.scheme}://#{base_uri.host}/#{image_url}"
    end
  rescue StandardError
    nil
  end
end
