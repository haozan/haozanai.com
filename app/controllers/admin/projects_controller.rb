class Admin::ProjectsController < Admin::BaseController
  before_action :set_project, only: [:show, :edit, :update, :destroy, :refresh_cover]

  def index
    @projects = Project.page(params[:page]).per(10)
  end

  def show
  end

  def new
    @project = Project.new
  end

  def create
    @project = Project.new(project_params)

    if @project.save
      redirect_to admin_project_path(@project), notice: 'Project was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @project.update(project_params)
      redirect_to admin_project_path(@project), notice: 'Project was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @project.destroy
    redirect_to admin_projects_path, notice: 'Project was successfully deleted.'
  end

  def refresh_cover
    if @project.refresh_cover_image!
      redirect_to admin_project_path(@project), notice: 'Cover image refreshed successfully.'
    else
      redirect_to admin_project_path(@project), alert: 'Failed to fetch cover image. Please check the URL.'
    end
  end

  private

  def set_project
    @project = Project.find(params[:id])
  end

  def project_params
    params.require(:project).permit(:title, :description, :url, :status, :position)
  end
end
