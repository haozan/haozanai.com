class HomeController < ApplicationController
  include HomeDemoConcern

  def index
    @projects = Project.published.limit(6)
    @articles = Article.published.limit(5)
  end
end
