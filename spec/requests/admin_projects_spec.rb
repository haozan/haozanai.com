require 'rails_helper'

RSpec.describe "Admin::Projects", type: :request do
  before { admin_sign_in_as(create(:administrator)) }

  describe "GET /admin/projects" do
    it "returns http success" do
      get admin_projects_path
      expect(response).to be_success_with_view_check('index')
    end
  end

end
